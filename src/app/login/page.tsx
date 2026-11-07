import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, MapPin } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { RandomAnimation } from "@/components/random-animation";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import { GoogleSignInButton } from "./google-sign-in-button";

// The page search engines land on (everything else needs sign-in), so it
// carries the full search title and a canonical address.
export const metadata: Metadata = {
  title: SITE_TITLE,
  alternates: { canonical: "/login" },
};

// Tells Google who FoodHub is (name, logo, site) — structured data only,
// nothing visible.
const STRUCTURED_DATA = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icons/icon-512`,
      description: SITE_DESCRIPTION,
      areaServed: "VIT-AP University, Amaravati, Andhra Pradesh, India",
    },
    { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  ],
}).replace(/</g, "\\u003c");

/*
 * The first thing a student sees: the same arched card as the kitchens, with
 * one of Handi's scenes in its window and the logo sitting on the window's
 * foot. The window takes whatever height the text doesn't need, so a tall phone
 * gets more of the scene, not a gap above the button.
 */
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: STRUCTURED_DATA }} />
      <div className="arch-card glow-hero flex flex-1 flex-col border bg-card p-2">
        <RandomAnimation
          set="banner"
          sizes="(min-width: 448px) 416px, 95vw"
          className="arch min-h-52 flex-1 bg-hero ring-2 ring-amber/60"
          mediaClassName="object-right"
        />
        <BrandLogo
          preload
          splashTarget
          className="animate-pop-in relative z-10 mx-auto -mt-10 size-20 shadow-raised ring-4 ring-card"
        />

        <div className="px-4 pb-5 text-center">
        {/* The headline only settles (a small rise) — never fades from
            invisible: an element first painted at opacity 0 isn't counted as
            Largest Contentful Paint. */}
        <h1 className="animate-settle mt-3 font-heading text-display font-bold">
          For the campus cravings
        </h1>
        <p
          className="animate-slide-up-in mt-2 text-base text-muted-foreground"
          style={{ animationDelay: "130ms" }}
        >
          Hi, I&apos;m Handi! Biryani, combos and family buckets from local kitchens, handed over
          at VIT-AP Main Gate. Pay when you collect.
        </p>
        <ul
          className="animate-slide-up-in mt-3 flex flex-wrap justify-center gap-1.5 text-xs font-semibold"
          style={{ animationDelay: "150ms" }}
        >
          <li className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-brand-soft-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            Free delivery to Main Gate
          </li>
          <li className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-brand-soft-foreground">
            <Banknote className="size-3.5 shrink-0" aria-hidden="true" />
            Pay on delivery — cash or UPI
          </li>
        </ul>

        <div
          className="animate-slide-up-in mt-5 w-full"
          style={{ animationDelay: "170ms" }}
        >
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-xl bg-brand-soft px-4 py-3 text-center text-sm text-brand-soft-foreground"
            >
              Sign-in didn&apos;t go through — give it another shot.
            </p>
          )}
          <GoogleSignInButton />
          <p className="mt-4 text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <Link href="/terms" className="font-semibold text-foreground underline-offset-2 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-semibold text-foreground underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        </div>
      </div>
    </main>
  );
}
