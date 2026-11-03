import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { SITE_URL } from "@/lib/site";

/*
 * The link-preview card for every page (WhatsApp, Instagram, Google):
 * the logo, the name and what FoodHub is on forest, with real dishes
 * on the right. Built once at build time — nothing here depends on the
 * request. Served at /opengraph-image, which src/proxy.ts lets through
 * signed out (link-preview bots never sign in).
 *
 * Drawn with ImageResponse (always a PNG), then re-encoded as a JPEG: a
 * photo-heavy PNG card runs to ~1 MB, too big for WhatsApp to preview
 * reliably; the JPEG is ~100 KB.
 */

export const alt = "FoodHub — food delivery for VIT-AP students, pickup at Main Gate";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

const PINE = "#0f3b2a";
const IVORY = "#f8f3e4";
const GOLD = "#e0b64a";

const dataUri = (data: Buffer, type: string) => `data:${type};base64,${data.toString("base64")}`;

export default async function OpengraphImage() {
  // Literal paths (not a helper taking a path) so the build only bundles
  // these five files. Renaming one of these photos means updating it here.
  const [markData, mixedData, dumData, fryData, lollipopData] = await Promise.all([
    readFile(join(process.cwd(), "public/brand/mark.png")),
    readFile(join(process.cwd(), "public/menu/dishes/mixed-chicken-biryani.jpg")),
    readFile(join(process.cwd(), "public/menu/dishes/chicken-dum-biryani.jpg")),
    readFile(join(process.cwd(), "public/menu/dishes/chicken-fry-biryani.jpg")),
    readFile(join(process.cwd(), "public/menu/dishes/chicken-lollipop.jpg")),
  ]);
  const mark = dataUri(markData, "image/png");
  const biryani = dataUri(mixedData, "image/jpeg");
  const dum = dataUri(dumData, "image/jpeg");
  const fry = dataUri(fryData, "image/jpeg");
  const lollipop = dataUri(lollipopData, "image/jpeg");

  const photo = (src: string, height: number) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={280} height={height} style={{ objectFit: "cover", borderRadius: 32 }} />
  );

  const card = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: PINE, color: IVORY }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px", width: 580 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark} alt="" width={150} height={150} />
          <div style={{ marginTop: 28, fontSize: 84, fontWeight: 800, letterSpacing: -2 }}>FoodHub</div>
          <div style={{ marginTop: 8, fontSize: 36 }}>For the campus cravings</div>
          <div style={{ marginTop: 24, fontSize: 28, lineHeight: 1.35, maxWidth: 560 }}>
            Food delivery for VIT-AP students. Pickup at Main Gate, cash on delivery.
          </div>
          <div
            style={{
              marginTop: 32,
              display: "flex",
              alignSelf: "flex-start",
              background: GOLD,
              color: PINE,
              fontSize: 26,
              fontWeight: 700,
              padding: "12px 28px",
              borderRadius: 999,
            }}
          >
            {new URL(SITE_URL).host}
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, padding: "0 40px 0 0", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: -120 }}>
            {photo(biryani, 360)}
            {photo(fry, 360)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 120 }}>
            {photo(dum, 360)}
            {photo(lollipop, 360)}
          </div>
        </div>
      </div>
    ),
    size,
  );

  const png = Buffer.from(await card.arrayBuffer());
  const jpeg = await sharp(png).jpeg({ quality: 82, mozjpeg: true, progressive: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": contentType } });
}
