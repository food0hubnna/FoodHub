import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { ArrowLeft } from "lucide-react";
import { BlurImage } from "@/components/blur-image";
import { HangingSign } from "@/components/handi/hanging-sign";
import { MenuProgress } from "@/components/menu/menu-progress";
import { MenuView } from "@/components/menu/menu-view";
import { getRestaurantCoverPhoto } from "@/lib/data/dish-photos";
import { getUploadedPhotos } from "@/lib/data/uploaded-photos";
import { getLikedDishes } from "@/lib/data/favorites";
import { getTasteProfile } from "@/lib/data/taste";
import { getOffers } from "@/lib/data/offers";
import { getFavoriteDishId, getTriedDishIds } from "@/lib/data/orders";
import { menuItems } from "@/lib/menu/portions";
import { getHighlyReorderedDishIds } from "@/lib/data/reorders";
import { getRestaurantMenu } from "@/lib/data/restaurants";
import { isUuid } from "@/lib/ids";
import { getOrderingState } from "@/lib/data/settings";
import { NAV_TRANSITION, REVEAL_ENTER } from "@/lib/nav-transition";
import { requireProfile } from "@/lib/profile";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/restaurants/[id]">): Promise<Metadata> {
  const { id } = await params;
  const menu = await getRestaurantMenu(id);
  return { title: menu ? `${menu.restaurant.name} · FoodHub` : "FoodHub" };
}

export default async function RestaurantPage({ params, searchParams }: PageProps<"/restaurants/[id]">) {
  // Kicked off up front rather than after requireProfile() resolves —
  // getOrderingEnabled() needs neither the profile nor the restaurant id,
  // so there's no reason to make it wait behind either lookup instead of
  // running alongside them.
  const { id } = await params;
  // A malformed id is a plain 404 — checked before any lookup starts, since
  // the per-student queries below would hand it straight to Postgres.
  if (!isUuid(id)) notFound();
  const profilePromise = requireProfile();
  const orderingPromise = getOrderingState();
  const highlyReorderedPromise = getHighlyReorderedDishIds();
  const menuPromise = getRestaurantMenu(id);
  // ?dish=<id> — set by Trending and the Thursday banner so the menu opens
  // scrolled to that dish instead of the top of a 40-dish list.
  const { dish } = await searchParams;
  const focusDishId = typeof dish === "string" && isUuid(dish) ? dish : null;

  const profile = await profilePromise;
  const [menu, ordering, triedDishIds, favoriteDishId, highlyReorderedDishIds, liked, taste, offers] = await Promise.all([
    menuPromise,
    orderingPromise,
    getTriedDishIds(profile.id, id),
    getFavoriteDishId(profile.id, id),
    highlyReorderedPromise,
    getLikedDishes(profile.id),
    getTasteProfile(profile.id),
    getOffers(),
    getUploadedPhotos(), // registered before getRestaurantCoverPhoto() below
  ]);
  if (!menu) notFound();

  const { restaurant, sections } = menu;
  const active = restaurant.is_active;
  const orderingEnabled = ordering.open;
  const orderable = active && orderingEnabled;
  const paused = active && !orderingEnabled;
  // Counted in menu cards, like the menu shows them: a dish's sizes (Apples
  // 500 g / 1 kg) are one card, tried if any size is.
  const cards = sections.flatMap(menuItems);
  const totalDishes = cards.length;
  const dishesTried = cards.filter((c) =>
    c.kind === "dish" ? triedDishIds.has(c.dish.id) : c.portions.some((p) => triedDishIds.has(p.dish.id)),
  ).length;
  const cover = getRestaurantCoverPhoto(restaurant.name);
  const statusBadge = (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-sm font-semibold backdrop-blur-sm",
        orderable ? "text-success" : "text-muted-foreground",
      )}
    >
      <span className="relative flex size-1.5" aria-hidden="true">
        {orderable && <span className="animate-ping-slow absolute inset-0 rounded-full bg-success" />}
        <span className={cn("relative size-1.5 rounded-full", orderable ? "bg-success" : "bg-muted-foreground")} />
      </span>
      {!active ? "Closed" : paused ? ordering.short : "Open"}
    </span>
  );

  // The kitchen's window from Home, bigger: the photo in the arch, the name on
  // its hanging sign, the facts under it and Handi walking the "tried N of M" bar.
  return (
    <main className="relative mx-auto w-full max-w-md px-6 pt-4">
      <ViewTransition {...NAV_TRANSITION}>
        <ViewTransition {...REVEAL_ENTER}>
          <section className="arch-card glow-hero relative border bg-card p-2">
            <div className={cn("arch relative h-64 overflow-hidden bg-stripes ring-2 ring-amber/60", !active && "grayscale")}>
              {cover && (
                <BlurImage
                  src={cover}
                  alt=""
                  sizes="(min-width: 448px) 400px, 90vw"
                  className="object-cover"
                />
              )}
              <div className="absolute top-3 left-1/2 -translate-x-1/2">{statusBadge}</div>
            </div>
            <HangingSign as="h1">{restaurant.name}</HangingSign>
            <div className="px-3 pt-2 pb-3 text-center">
              {restaurant.description && <p className="text-sm text-muted-foreground">{restaurant.description}</p>}
              <p className="mt-1 text-xs font-semibold text-brand-soft-foreground">
                {[...restaurant.cuisine_tags, "Free to Main Gate"].join(" · ")}
              </p>
              <MenuProgress restaurantName={restaurant.name} tried={dishesTried} total={totalDishes} />
              {!active && (
                <p className="mt-4 rounded-2xl bg-secondary px-4 py-3 text-sm">
                  <strong className="font-semibold">Closed right now.</strong> You can browse the
                  menu — ordering opens when they&apos;re back.
                </p>
              )}
              {paused && (
                <p className="mt-4 rounded-2xl bg-secondary px-4 py-3 text-sm">
                  <strong className="font-semibold">{ordering.headline}.</strong> {ordering.detail}
                </p>
              )}
            </div>
          </section>
          {/* In the arch's free corner, clear of the curve. */}
          <Link
            href="/"
            aria-label="Back to kitchens"
            transitionTypes={["nav-back"]}
            className="absolute top-3 left-4 z-20 flex size-11 items-center justify-center rounded-full border bg-card shadow-card outline-none focus-visible:ring-3 focus-visible:ring-ring/80"
          >
            <ArrowLeft className="size-5" />
          </Link>

          <div className="mt-3">
            <MenuView
              restaurant={restaurant}
              sections={sections}
              profilePhone={profile.phone}
              orderingEnabled={orderingEnabled}
              closedChip={ordering.short}
              closedNote={ordering.headline}
              favoriteDishId={favoriteDishId}
              highlyReorderedDishIds={highlyReorderedDishIds}
              likedDishIds={liked.filter((d) => d.restaurantId === id).map((d) => d.id)}
              spiceLevel={taste.spiceLevel}
              offers={offers}
              focusDishId={focusDishId}
            />
          </div>
        </ViewTransition>
      </ViewTransition>
    </main>
  );
}
