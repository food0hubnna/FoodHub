// Photo lookup for restaurant covers and dish thumbnails. Two sources:
// photos the admin uploaded (dishes.photo_path / restaurants.cover_path in
// the `menu-photos` Storage bucket), which win, and the static files under
// public/menu/ below, matched by (restaurant name, dish name). The uploaded
// ones are loaded once per request by the root layout (getUploadedPhotos())
// and registered here, so every caller keeps the same synchronous
// getDishPhoto() / getRestaurantCoverPhoto(). A dish missing from a
// restaurant's map falls back to the plain placeholder rather than showing a
// mismatched photo.

const COVERS = "/menu/covers";
const DISHES = "/menu/dishes";

/** Restaurant name -> cover photo shown on the hero banner. */
export const RESTAURANT_COVER_PHOTOS: Record<string, string> = {
  "Al Madina": `${COVERS}/al-madina.jpg`,
  "A1 Biryani Point": `${COVERS}/a1-biryani-point.jpg`,
  "Spice Magic Biryanis": `${COVERS}/spice-magic.jpg`,
};

/** Restaurant name -> { dish name -> thumbnail photo }. */
export const DISH_PHOTOS: Record<string, Record<string, string>> = {
  "Al Madina": {
    "Chicken Dum Biryani": `${DISHES}/chicken-dum-biryani.jpg`,
    "Chicken Fry Biryani": `${DISHES}/chicken-fry-biryani.jpg`,
    "Mixed Chicken Biryani": `${DISHES}/mixed-chicken-biryani.jpg`,
  },
  "A1 Biryani Point": {
    "A1 Dum Biryani": `${DISHES}/a1-dum-biryani.jpg`,
    "A1 Fry Pieces Biryani": `${DISHES}/a1-fry-pieces-biryani.jpg`,
    "A1 Mixed Biryani": `${DISHES}/mixed-chicken-biryani.jpg`,
  },
  "Spice Magic Biryanis": {
    "Chicken Dum Mini": `${DISHES}/chicken-dum-biryani.jpg`,
    "Chicken Fry Mini": `${DISHES}/chicken-fry-biryani.jpg`,
    "Chicken Dum Full": `${DISHES}/chicken-dum-biryani.jpg`,
    "Chicken Fry Full": `${DISHES}/chicken-fry-biryani.jpg`,
    "Chicken Mixed": `${DISHES}/mixed-chicken-biryani.jpg`,
    "Chicken Moghlai Biryani": `${DISHES}/mughlai-biryani.jpg`,
    "Chicken 65 Biryani": `${DISHES}/chicken-65-biryani.jpg`,
    "Chicken Dum Combo Pack": `${DISHES}/combo-dum.jpg`,
    "Chicken Fry Combo Pack": `${DISHES}/combo-fry.jpg`,
    "Chicken Mixed Combo Pack": `${DISHES}/combo-mixed.jpg`,
    "Chicken Dum Bucket": `${DISHES}/bucket-dum.jpg`,
    "Chicken Fry Bucket": `${DISHES}/bucket-fry.jpg`,
    "Chicken Mixed Bucket": `${DISHES}/bucket-mixed.jpg`,
  },
};

/** Uploaded photos as public URLs: covers by restaurant name, dishes by uploadedDishKey(). */
export type UploadedPhotos = { covers: Record<string, string>; dishes: Record<string, string> };

let uploaded: UploadedPhotos = { covers: {}, dishes: {} };

/** Called by the root layout's <UploadedPhotos> (and the server loader) with the current set. */
export function setUploadedPhotos(photos: UploadedPhotos) {
  uploaded = photos;
}

export function uploadedDishKey(restaurantName: string, dishName: string) {
  return `${restaurantName} :: ${dishName}`;
}

/** Public URL of a file in the menu-photos bucket. */
export function menuPhotoUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/menu-photos/${path}`;
}

/** An uploaded photo (already sized in the browser) — served as-is, not through next/image's optimiser. */
export function isUploadedPhoto(src: string | undefined) {
  return !!src && /^https?:/.test(src);
}

/** Cover photo for a restaurant's hero banner, or undefined for the placeholder. */
export function getRestaurantCoverPhoto(restaurantName: string): string | undefined {
  return uploaded.covers[restaurantName] ?? RESTAURANT_COVER_PHOTOS[restaurantName];
}

/** Thumbnail photo for a dish, or undefined for the placeholder. */
export function getDishPhoto(restaurantName: string, dishName: string): string | undefined {
  return uploaded.dishes[uploadedDishKey(restaurantName, dishName)] ?? DISH_PHOTOS[restaurantName]?.[dishName];
}

/**
 * Tie-breakers for each restaurant's photo slideshow on Home's cards:
 * after order counts, these come first (e.g. before anyone has ordered
 * much). Hand-picked for photo quality (no watermarks, reads well small)
 * and to say what the kitchen is about; every name must exist in
 * DISH_PHOTOS above.
 */
const SIGNATURE_DISHES: Record<string, string[]> = {
  "Al Madina": ["Chicken Dum Biryani", "Chicken Fry Biryani"],
  "A1 Biryani Point": ["A1 Dum Biryani", "A1 Fry Pieces Biryani"],
  "Spice Magic Biryanis": ["Chicken Fry Combo Pack", "Chicken Dum Bucket", "Chicken 65 Biryani"],
};

/** A restaurant's hand-picked signature dishes (by name) — also fill Home's "Campus favourites" row. */
export function getSignatureDishes(restaurantName: string): string[] {
  return SIGNATURE_DISHES[restaurantName] ?? [];
}

/** Most dish slides per card — each is another photo download on Home. */
const MAX_DISH_SLIDES = 5;

export type CardSlide = { src: string; dish?: { id: string; name: string; price: number; isVeg: boolean } };

/**
 * The photos Home's restaurant card slides through: the cover first
 * (no caption), then up to MAX_DISH_SLIDES available dishes with their
 * own distinct photo — most ordered first (`orderCounts`, dishId →
 * count), ties broken by SIGNATURE_DISHES, then menu order. A dish
 * without a photo is skipped however popular it is. A restaurant with no
 * cover just starts on its first dish.
 */
export function getRestaurantCardSlides(
  restaurantName: string,
  dishes: { id: string; name: string; price: number; isVeg: boolean; isAvailable: boolean }[],
  orderCounts: Record<string, number> = {},
): CardSlide[] {
  const signature = SIGNATURE_DISHES[restaurantName] ?? [];
  const rank = (name: string) => {
    const i = signature.indexOf(name);
    return i === -1 ? signature.length : i;
  };

  const cover = getRestaurantCoverPhoto(restaurantName);
  const seen = new Set<string>(cover ? [cover] : []);
  const dishSlides: CardSlide[] = [];
  const count = (id: string) => orderCounts[id] ?? 0;
  // Stable sort keeps menu order among the rest.
  const ordered = dishes
    .filter((d) => d.isAvailable)
    .sort((a, b) => count(b.id) - count(a.id) || rank(a.name) - rank(b.name));
  for (const d of ordered) {
    const src = getDishPhoto(restaurantName, d.name);
    if (!src || seen.has(src)) continue;
    seen.add(src);
    dishSlides.push({ src, dish: { id: d.id, name: d.name, price: d.price, isVeg: d.isVeg } });
    if (dishSlides.length === MAX_DISH_SLIDES) break;
  }
  return cover ? [{ src: cover }, ...dishSlides] : dishSlides;
}
