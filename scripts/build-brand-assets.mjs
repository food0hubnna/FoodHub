// Regenerates every brand asset from the source logo:
//
//   public/brand/logo-source.webp   the round FoodHub logo on white
//
// Outputs:
//   public/brand/mark.webp          logo with a transparent outside, for in-app tiles
//   public/brand/mark.png           same, PNG, for the generated app icons
//   src/app/favicon.ico             16/32/48/64 RGBA PNG frames
//
// Run after changing the logo:  node scripts/build-brand-assets.mjs

import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const SRC = "public/brand/logo-source.webp";
const SIZE = 512;

// Crop to the badge, then cut the white away with a circle just inside its rim.
const square = await sharp(SRC).trim({ background: "#ffffff", threshold: 18 }).resize(SIZE, SIZE, { fit: "fill" }).toBuffer();
const circle = Buffer.from(
  `<svg width="${SIZE}" height="${SIZE}"><circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2 - 2}" fill="#fff"/></svg>`,
);
const mark = await sharp(square).ensureAlpha().composite([{ input: circle, blend: "dest-in" }]).png().toBuffer();

await writeFile("public/brand/mark.png", mark);
await sharp(mark).webp({ quality: 88 }).toFile("public/brand/mark.webp");

// ICO: a directory of PNG frames.
const sizes = [16, 32, 48, 64];
const frames = await Promise.all(sizes.map((s) => sharp(mark).resize(s, s).png().toBuffer()));
const header = Buffer.alloc(6 + 16 * frames.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(frames.length, 4);
let offset = header.length;
frames.forEach((frame, i) => {
  const entry = 6 + 16 * i;
  header[entry] = sizes[i];
  header[entry + 1] = sizes[i];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(frame.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
});
await writeFile("src/app/favicon.ico", Buffer.concat([header, ...frames]));
