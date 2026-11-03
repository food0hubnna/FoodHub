@AGENTS.md

# FoodHub

Food delivery site for VIT-AP University students. Orders are handed over at
VIT-AP Main Gate; payment is cash or UPI on delivery.

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- Supabase: Postgres, Google auth, Storage (`menu-photos`), Realtime on orders
- Vercel (region bom1), web push via `web-push`

## Conventions

- Colours are tokens in `src/app/globals.css`; prefer the semantic ones. Run
  `npm run audit:contrast` after changing them.
- Orders are created only through the `place_order()` database function.
- Dish and cover photos live in `public/menu`, mapped in
  `src/lib/data/dish-photos.ts`. Admin uploads override them.
- Brand assets are built from `public/brand/logo-source.webp` by
  `scripts/build-brand-assets.mjs`.
