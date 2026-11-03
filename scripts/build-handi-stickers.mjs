// Cuts Handi's sticker poses out of the character sheet: the cream background
// is flood-filled away from each cell's edges, so light parts inside the
// character (rice, cheeks) stay solid.
//
//   animation-originals/handi/Whimsical Biryani Pot Character Sheet.png   the sheet (3 x 2 poses)
//   public/handi/<pose>.webp                                              the stickers
//
// Run after changing the sheet:  node scripts/build-handi-stickers.mjs

import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SHEET = "animation-originals/handi/Whimsical Biryani Pot Character Sheet.png";
const POSES = [
  ["wave", 0, 0],
  ["side", 1, 0],
  ["happy", 2, 0],
  ["joy", 0, 1],
  ["sleepy", 1, 1],
  ["excited", 2, 1],
];
const CELL_W = 512;
const CELL_H = 512;
/** How far from the background colour still counts as background. */
const TOLERANCE = 30;
/** Below this row of a cell only the feet and their shadow are left. */
const GROUND_Y = 462;

await mkdir("public/handi", { recursive: true });

for (const [name, col, row] of POSES) {
  const { data, info } = await sharp(SHEET)
    .extract({ left: col * CELL_W, top: row * CELL_H, width: CELL_W, height: CELL_H })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const at = (x, y) => (y * w + x) * 3;
  const bg = [data[at(2, 2)], data[at(2, 2) + 1], data[at(2, 2) + 2]];
  const far = (i) => Math.max(Math.abs(data[i] - bg[0]), Math.abs(data[i + 1] - bg[1]), Math.abs(data[i + 2] - bg[2]));

  // Flood fill from the cell's edges through anything close to the background.
  const isBg = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push([x, 0], [x, h - 1]);
  for (let y = 0; y < h; y++) stack.push([0, y], [w - 1, y]);
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= w || y >= h || isBg[y * w + x] || far(at(x, y)) > TOLERANCE) continue;
    isBg[y * w + x] = 1;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  // Keep faint parts (steam, the ground shadow) see-through rather than cream.
  const rgba = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = at(x, y);
      const o = (y * w + x) * 4;
      rgba[o] = data[i];
      rgba[o + 1] = data[i + 1];
      rgba[o + 2] = data[i + 2];
      // Under the feet: drop the painted ground shadow, which reads as a pale plate on dark surfaces.
      const groundShadow = y > GROUND_Y && far(i) < 110;
      rgba[o + 3] = isBg[y * w + x] || groundShadow ? 0 : Math.min(255, Math.round((far(i) / 70) * 255));
    }
  }
  // Inside the body the colour is far from cream, so this only softens the edge.
  await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .trim()
    .resize(320, 320, { fit: "inside" })
    .webp({ quality: 88, alphaQuality: 100 })
    .toFile(`public/handi/${name}.webp`);
}
