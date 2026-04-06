use base64::{engine::general_purpose::STANDARD as B64, Engine as _};
use regex::Regex;
use serde::Serialize;
use serde_json::Value;
use url::Url;

const WIKI_API: &str = "https://escapefromtarkov.fandom.com/api.php";
const FANDOM_REFERER: &str = "https://escapefromtarkov.fandom.com/";

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WikiImageDto {
    /// `data:image/...;base64,...` fetched server-side with a Fandom `Referer` (WebViews may
    /// still send `localhost` as referer for raw Wikia URLs, which Wikia rejects with 404).
    pub url: String,
    /// From `data-image-key` when present, else derived from the URL.
    pub filename: String,
    /// From `gallerytext`, or `title` / `data-image-name` when the gallery caption is empty.
    pub caption: String,
    /// Heuristic from caption: `map`, `spawn`, `world`.
    pub category: String,
}

pub async fn fetch_wiki_gallery(wiki_url: &str) -> Result<Vec<WikiImageDto>, String> {
    if !wiki_url.contains("/wiki/") {
        return Err("URL must be a Fandom wiki article (/wiki/…)".into());
    }

    let title = wiki_title_from_url(wiki_url)?;
    let client = reqwest::Client::builder()
        .user_agent("EFTKeys/0.1 (desktop; https://tarkov.dev ecosystem)")
        .build()
        .map_err(|e| e.to_string())?;

    let html = fetch_parse_html(&client, &title).await?;
    let mut items = parse_gallery_from_html(&html);

    for item in &mut items {
        if let Ok(data_url) = fetch_image_as_data_url(&client, &item.url).await {
            item.url = data_url;
        }
        // On failure, keep HTTPS URL; `<img referrerPolicy="no-referrer">` may still work.
    }

    Ok(items)
}

fn wiki_title_from_url(wiki_url: &str) -> Result<String, String> {
    let u = Url::parse(wiki_url).map_err(|e| format!("Bad URL: {e}"))?;
    if !u.path().contains("/wiki/") {
        return Err("URL must contain /wiki/".into());
    }
    let seg = u
        .path_segments()
        .ok_or("Wiki URL has no path")?
        .filter(|s| !s.is_empty())
        .last()
        .ok_or("Wiki URL has no page title")?;
    Ok(seg.to_string())
}

async fn fetch_parse_html(client: &reqwest::Client, title: &str) -> Result<String, String> {
    let mut u = Url::parse(WIKI_API).map_err(|e| e.to_string())?;
    u.query_pairs_mut()
        .append_pair("action", "parse")
        .append_pair("page", title)
        .append_pair("prop", "text")
        .append_pair("format", "json");

    let resp = client.get(u).send().await.map_err(|e| e.to_string())?;
    if !resp.status().is_success() {
        return Err(format!("Wiki parse HTTP {}", resp.status()));
    }
    let v: Value = resp.json().await.map_err(|e| e.to_string())?;
    if let Some(err) = v.get("error") {
        let code = err["code"].as_str().unwrap_or("error");
        let info = err["info"].as_str().unwrap_or("");
        return Err(format!("Wiki API: {code} — {info}"));
    }
    v["parse"]["text"]["*"]
        .as_str()
        .map(String::from)
        .ok_or_else(|| "Wiki parse response missing HTML text".to_string())
}

/// Download image bytes with a Fandom referer (Wikia CDN 404s some URLs when Referer is localhost).
async fn fetch_image_as_data_url(client: &reqwest::Client, image_url: &str) -> Result<String, String> {
    if image_url.starts_with("data:") {
        return Ok(image_url.to_string());
    }
    const MAX_BYTES: usize = 6 * 1024 * 1024;
    let resp = client
        .get(image_url)
        .header("Referer", FANDOM_REFERER)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    if !resp.status().is_success() {
        return Err(format!("image HTTP {}", resp.status()));
    }
    let ctype = resp
        .headers()
        .get(reqwest::header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("image/png")
        .split(';')
        .next()
        .unwrap_or("image/png")
        .trim()
        .to_string();
    let bytes = resp.bytes().await.map_err(|e| e.to_string())?;
    if bytes.len() > MAX_BYTES {
        return Err("image too large".into());
    }
    Ok(format!(
        "data:{};base64,{}",
        ctype,
        B64.encode(&bytes)
    ))
}

fn parse_gallery_from_html(html: &str) -> Vec<WikiImageDto> {
    let gallery_li =
        Regex::new(r#"(?s)<li class="gallerybox"[^>]*>(.*?)</li>"#).expect("regex gallerybox");
    let gallerytext =
        Regex::new(r#"(?s)<div class="gallerytext">(.*?)</div>"#).expect("regex gallerytext");
    let tags = Regex::new(r#"<[^>]+>"#).expect("regex tags");
    let img_src = Regex::new(r#"(?i)src="(https://static\.wikia\.nocookie\.net[^"]+)""#)
        .expect("regex src");
    let img_data_src =
        Regex::new(r#"(?i)data-src="(https://static\.wikia\.nocookie\.net[^"]+)""#)
            .expect("regex data-src");
    let anchor_href = Regex::new(
        r#"(?i)href="(https://static\.wikia\.nocookie\.net/escapefromtarkov_gamepedia/images/[^"]+)""#,
    )
    .expect("regex href");
    let data_image_key = Regex::new(r#"(?i)data-image-key="([^"]+)""#).expect("regex data-key");
    let data_image_name = Regex::new(r#"(?i)data-image-name="([^"]+)""#).expect("regex data-name");
    let a_title = Regex::new(r#"(?i)<a[^>]+title="([^"]+)""#).expect("regex a title");
    let img_alt = Regex::new(r#"(?i)<img[^>]+alt="([^"]+)""#).expect("regex img alt");

    let mut out = Vec::new();

    for cap in gallery_li.captures_iter(html) {
        let chunk = cap.get(1).map(|m| m.as_str()).unwrap_or("");
        let caption_html = gallerytext
            .captures(chunk)
            .and_then(|c| c.get(1))
            .map(|m| m.as_str())
            .unwrap_or("");
        let mut caption = strip_tags_and_entities(&tags, caption_html);

        if caption.is_empty() {
            if let Some(c) = a_title.captures(chunk).and_then(|c| c.get(1)) {
                caption = decode_basic_entities(c.as_str());
            } else if let Some(c) = img_alt.captures(chunk).and_then(|c| c.get(1)) {
                caption = decode_basic_entities(c.as_str());
            } else if let Some(c) = data_image_name.captures(chunk).and_then(|c| c.get(1)) {
                caption = humanize_data_image_name(c.as_str());
            }
        }

        let url = extract_wikia_image_url(chunk, &anchor_href, &img_src, &img_data_src);
        let Some(url) = url else { continue };

        if chunk.to_ascii_lowercase().contains("data-image-key=\"key-type") {
            continue;
        }

        let filename = data_image_key
            .captures(chunk)
            .and_then(|c| c.get(1))
            .map(|m| m.as_str().to_string())
            .unwrap_or_else(|| filename_from_url(&url));

        let category = category_from_caption(&caption);

        out.push(WikiImageDto {
            url,
            filename,
            caption,
            category,
        });
    }

    out.sort_by(|a, b| {
        category_rank(&a.category)
            .cmp(&category_rank(&b.category))
            .then_with(|| a.caption.cmp(&b.caption))
    });

    out
}

fn humanize_data_image_name(s: &str) -> String {
    let base = s.trim_end_matches(".png").trim_end_matches(".jpg").trim_end_matches(".jpeg");
    base.replace('_', " ")
}

fn category_rank(c: &str) -> u8 {
    match c {
        "map" => 0,
        "spawn" => 1,
        _ => 2,
    }
}

/// Prefer `<a href>` (full `revision/latest`, works when `<img src>` is a lazy 1×1 GIF).
fn extract_wikia_image_url(
    chunk: &str,
    anchor_href: &Regex,
    img_src: &Regex,
    img_data_src: &Regex,
) -> Option<String> {
    if let Some(c) = anchor_href.captures(chunk) {
        let u = c.get(1)?.as_str();
        if !should_skip_wikia_url(u) {
            return Some(u.to_string());
        }
    }

    let mut candidates: Vec<String> = Vec::new();
    for c in img_src.captures_iter(chunk) {
        if let Some(u) = c.get(1) {
            candidates.push(u.as_str().to_string());
        }
    }
    for c in img_data_src.captures_iter(chunk) {
        if let Some(u) = c.get(1) {
            candidates.push(u.as_str().to_string());
        }
    }
    candidates.into_iter().find(|u| !should_skip_wikia_url(u))
}

fn should_skip_wikia_url(url: &str) -> bool {
    let l = url.to_ascii_lowercase();
    if l.contains("key-type") {
        return true;
    }
    is_icon_url(url)
}

fn is_icon_url(url: &str) -> bool {
    let l = url.to_ascii_lowercase();
    l.contains("_icon.png") || l.contains("-icon.png") || l.contains("_icon.jpg")
}

fn strip_tags_and_entities(tag_re: &Regex, html: &str) -> String {
    let no_tags = tag_re.replace_all(html, "");
    decode_basic_entities(no_tags.trim())
}

fn decode_basic_entities(s: &str) -> String {
    s.replace("&amp;", "&")
        .replace("&quot;", "\"")
        .replace("&#039;", "'")
        .replace("&apos;", "'")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&nbsp;", " ")
}

fn filename_from_url(url: &str) -> String {
    url.rsplit('/')
        .next()
        .unwrap_or("image")
        .split('?')
        .next()
        .unwrap_or("image")
        .to_string()
}

fn category_from_caption(caption: &str) -> String {
    let t = caption.to_ascii_lowercase();
    if t.contains("marked on map")
        || t.contains("location marked")
        || t.contains(" on map")
        || t.ends_with(" map")
        || t.contains("map location")
    {
        return "map".into();
    }
    if t.contains("spawn")
        || t.contains("loot")
        || t.contains("jacket")
        || t.contains("drawer")
        || t.contains("scav")
        || t.contains("pocket")
        || t.contains("can be found")
        || t.contains("key location")
    {
        return "spawn".into();
    }
    if t.contains("door")
        || t.contains("room")
        || t.contains("cabin")
        || t.contains("ramp")
        || t.contains("stair")
        || t.contains("lock")
        || t.contains("behind")
        || t.contains("entrance")
        || t.contains("building")
        || t.contains("container")
        || t.contains("portable")
        || t.contains("utility")
        || t.contains("parking")
        || t.contains("inside")
    {
        return "world".into();
    }
    "world".into()
}