"use client";

import { useState } from "react";
import { DeveloperContact, DeveloperName } from "@/components/developer-credit";

/**
 * "Developed & maintained by <name>", the About dialog's footer. The name
 * carries a dotted underline (solid on hover) so it reads as tappable; tapping
 * it quietly opens a small "WhatsApp · Mail" line underneath, and tapping again
 * folds it away (shared with the page footer, SiteCredit).
 */
export function AboutCredits() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-5 text-xs text-muted-foreground">
      <p>
        ~ Developed &amp; Maintained by{" "}
        <DeveloperName open={open} onToggle={() => setOpen((o) => !o)} controls="about-dev-contact" />
      </p>
      <DeveloperContact id="about-dev-contact" open={open} />
      <p className="mt-3">~ foodhub</p>
    </div>
  );
}
