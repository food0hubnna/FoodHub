// The app's colour palette. A complete light + dark token set in
// src/app/globals.css, keyed on `data-palette` on <html>. This file is
// client-safe and import-free: the theme-init script inlines the ground
// colours below, so keep them in step with globals.css.

export type PaletteId = "pine";

export const DEFAULT_PALETTE: PaletteId = "pine";

export const PALETTES: { id: PaletteId; name: string; blurb: string }[] = [
  { id: "pine", name: "FoodHub Forest", blurb: "Forest green and gold" },
];

export const PALETTE_IDS = PALETTES.map((p) => p.id);

/** Each palette's page ground (--background), light and dark — the browser bar colour. */
export const PALETTE_GROUNDS: Record<PaletteId, { light: string; dark: string }> = {
  pine: { light: "#f8f3e4", dark: "#08150f" },
};

export function isPaletteId(v: unknown): v is PaletteId {
  return typeof v === "string" && (PALETTE_IDS as string[]).includes(v);
}
