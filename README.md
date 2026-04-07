# EFT Keys

A small **desktop app** for [Escape from Tarkov](https://www.escapefromtarkov.com/) that helps you look up **mechanical keys**: where they’re used, what they’re worth, and how they connect to quests and crafts.

Data comes from public sources—primarily the [Tarkov.dev](https://tarkov.dev) API—so you can search and browse without digging through wiki tabs in a browser.

---

## What it does

- **Search by name** — Type part of a key’s name (e.g. _dorm_, _KIBA_) and get matching keys with short names, rough **base price**, and **which maps** use them in lock data.
- **Browse by map** — Pick a map from the home screen and see **all keys** that open locks on that map (duplicate “variant” maps like Night Factory are folded into the main map).
- **Key detail** — Open a key for full item info: description, flea stats, **lock locations** on interactive maps (via tarkov.dev), tasks, barters, crafts, and a **wiki gallery** of images from the [Escape from Tarkov wiki](https://escapefromtarkov.fandom.com/) when a wiki link exists.

The app is built with **Tauri 2**, **React**, and **TypeScript** (Vite for the UI). It runs locally on your machine; it only talks to Tarkov.dev, Fandom, and related CDNs when you search or load a page.

---

## Download a release

Pre-built installers are published on **GitHub Releases** (not stored in the git tree).

1. Open **[Releases](https://github.com/Emiliomontes0/EFTKeys/releases)** for this repository.
2. Choose the **latest** release.
3. Under **Assets**, download the file for your system:
   - **macOS (Apple Silicon, M1/M2/M3…):** `EFT Keys_<version>_aarch64.dmg`  
   - **macOS (Intel):** use an `_x64` or universal build if one is attached (when available).  
   - **Windows:** `.msi` or `.exe` when a Windows build is published.
4. **macOS:** open the `.dmg`, drag **EFT Keys** into **Applications**, then launch it from there.  
   If macOS blocks the app the first time (**unidentified developer**), right-click the app → **Open**, then confirm.
5. **Windows:** run the installer and follow the prompts.

If you don’t see a build for your OS yet, you can [build from source](#building-from-source) on that OS.

---

## Data & attribution

- Item and map lock data: **[tarkov.dev](https://tarkov.dev)** / [GraphQL API](https://api.tarkov.dev/).
- Wiki text and gallery images: **[Escape from Tarkov Wiki](https://escapefromtarkov.fandom.com/)** (Fandom).

This project is an independent tool and is not affiliated with Battlestate Games or Fandom.

---

## Building from source

### Prerequisites

| Tool | Why |
|------|-----|
| [Node.js](https://nodejs.org/) (LTS) | `npm`, Vite frontend |
| [Rust (rustup)](https://www.rust-lang.org/tools/install) | Tauri / native binary |

**Windows:** [Microsoft C++ Build Tools](https://v2.tauri.app/start/prerequisites/#windows) as required by Tauri.

**macOS:** Xcode Command Line Tools: `xcode-select --install`

**Linux:** [Tauri Linux dependencies](https://v2.tauri.app/start/prerequisites/#linux) (e.g. WebKitGTK).

### Setup

```bash
git clone https://github.com/Emiliomontes0/EFTKeys.git
cd EFTKeys
npm install
```

### Development

```bash
npm run tauri dev
```

### Production installer (run on the OS you target)

```bash
npm run tauri build
```

Artifacts appear under `src-tauri/target/release/bundle/` (e.g. `bundle/dmg/` on macOS). Building **Windows** installers requires running this on Windows—or using CI (e.g. `windows-latest`).

---

## Project layout

| Path | Role |
|------|------|
| `src/` | React UI |
| `src-tauri/` | Rust (window, wiki gallery fetch, bundling) |
| `src-tauri/tauri.conf.json` | App name, bundle id, window, bundle settings |

---

## IDE (optional)

[VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).
