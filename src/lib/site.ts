/**
 * The public address and wording search engines and link previews use.
 * NEXT_PUBLIC_SITE_URL overrides the address (e.g. after moving to a
 * custom domain) without a code change.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://foodhub.in").replace(/\/$/, "");

export const SITE_NAME = "FoodHub";

export const SITE_TITLE = "FoodHub — Food delivery for VIT-AP students";

export const SITE_DESCRIPTION =
  "Order biryani, combo packs and family buckets from campus kitchens at VIT-AP University, Amaravati. Pick up at VIT-AP Main Gate and pay cash on delivery.";
