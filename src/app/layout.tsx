import type { Metadata, Viewport } from "next";
import { Baloo_2, Grey_Qo, Love_Light, Plus_Jakarta_Sans, Sirivennela } from "next/font/google";
import { AppSplash } from "@/components/splash/app-splash";
import { SPLASH_DISABLED } from "@/components/splash/config";
import { SPLASH_INIT_SCRIPT } from "@/components/splash/init-script";
import { SiteCredit } from "@/components/site-credit";
import { TabBar } from "@/components/nav/tab-bar";
import { Toaster } from "@/components/toast/toaster";
import { SiteStatusWatch } from "@/components/site-status/site-status-watch";
import { StaleDeployGuard } from "@/components/site-status/stale-deploy-guard";
import { UploadedPhotos } from "@/components/uploaded-photos";
import { getUploadedPhotos } from "@/lib/data/uploaded-photos";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import { THEME_INIT_SCRIPT } from "@/lib/theme/init-script";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

// Handi's voice: round, friendly, a little desi. Every heading and price.
const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
});

// The handwriting faces the student's name is drawn in, in turn (ScriptName).
// Not preloaded — each has a fallback.
const loveLight = Love_Light({ variable: "--font-love-light", subsets: ["latin"], weight: "400", preload: false });
const greyQo = Grey_Qo({ variable: "--font-grey-qo", subsets: ["latin"], weight: "400", preload: false });
// Sirivennela draws the name in Telugu, so it needs its Telugu glyphs — with
// "latin" alone, phones fell back to a system Telugu font.
const sirivennela = Sirivennela({
  variable: "--font-sirivennela",
  subsets: ["latin", "telugu"],
  weight: "400",
  preload: false,
});

export const metadata: Metadata = {
  // Makes every relative URL below (and the generated share image) absolute.
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "FoodHub",
    "VIT-AP food delivery",
    "VIT-AP University",
    "Amaravati food delivery",
    "campus food delivery",
    "biryani delivery VIT-AP",
  ],
  // Link previews (WhatsApp, Instagram, Google). The image comes from
  // app/opengraph-image.tsx and is attached automatically.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  // Google Search Console ownership check — set the token as an env var in
  // Vercel; nothing is emitted while it's unset.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  // Install profile (src/lib/web-manifest.ts); the admin layout swaps in its own.
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "FoodHub",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  // Matches --background in globals.css. Follows the OS scheme only — an
  // in-app theme override can't retarget this meta tag before paint.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f3e4" },
    { media: "(prefers-color-scheme: dark)", color: "#08150f" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Admin-uploaded menu photos (a cached, tagged fetch — static pages stay static).
  const photos = await getUploadedPhotos();
  return (
    <html
      lang="en"
      // The theme-init script (and later, useThemePreference) can add the
      // "dark" class / colorScheme style, and the splash-init script
      // data-splash, before React hydrates — expected, not a real mismatch.
      suppressHydrationWarning
      className={`${jakarta.variable} ${baloo.variable} ${loveLight.variable} ${greyQo.variable} ${sirivennela.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Raw inline <script>, not next/script: beforeInteractive inline
            scripts are queued (self.__next_s) until Next's own JS loads, so
            a dark-mode user would see a flash of the light theme first.
            This runs as the parser reaches it, before anything is painted. */}
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {!SPLASH_DISABLED && (
          <>
            {/* A plain inline <script>, not next/script: beforeInteractive
                inline scripts are queued (self.__next_s) until Next's own JS
                loads, so the app would paint first and the splash would pop
                in over it. This runs as the parser reaches it — before
                anything below is painted. */}
            <script id="splash-init" dangerouslySetInnerHTML={{ __html: SPLASH_INIT_SCRIPT }} />
            {/* Right after, so it's in the first streamed chunk. */}
            <AppSplash />
          </>
        )}
        <UploadedPhotos photos={photos} />
        <SiteStatusWatch />
        <StaleDeployGuard />
        {children}
        {/* "~ Made with ♥ by Naga Adithya" at the foot of every page. */}
        <SiteCredit />
        {/* The student bottom bar: here rather than in each page so it stays
            mounted and its pill can slide between tabs. It decides for
            itself where it shows (TabBar). */}
        <TabBar />
        <Toaster />
      </body>
    </html>
  );
}
