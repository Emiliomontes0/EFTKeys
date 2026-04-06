/** Turn `Underground_Parking_..._Location_1.png` into a readable caption. */
export function captionFromWikiFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return base.replace(/_/g, " ");
}
