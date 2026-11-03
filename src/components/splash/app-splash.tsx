import { SCENE } from "./scene";
import "./splash.css";

/**
 * The startup splash: on the forest ground the logo tile springs in, the name
 * and tagline rise under it, a sheen runs across, and the tile lands on the
 * page's own logo (BrandLogo splashTarget). All motion is ./engine.ts, run by
 * the inline script in the root layout; this is only markup, hidden until that
 * script decides this load plays it. Decorative throughout (aria-hidden).
 */
export function AppSplash() {
  const { mark } = SCENE;
  return (
    <div id="app-splash" className="app-splash" aria-hidden="true">
      <span className="sp-bg" data-sp="bg" />
      <span className="sp-spot" data-sp="spot" />
      <div className="sp-lite" data-sp="lite">
        <p className="sp-lite-name" data-sp="lite-name">
          FoodHub
        </p>
        <p className="sp-lite-tagline" data-sp="lite-tagline">
          For the campus cravings
        </p>
      </div>
      <div className="sp-tile" data-sp="tile">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mark.src} alt="" loading="lazy" draggable={false} style={{ aspectRatio: `${mark.w} / ${mark.h}` }} />
        <span className="sp-tile-sheen" data-sp="tile-sheen" />
      </div>
    </div>
  );
}

/** Every image the splash needs, for the engine to preload. */
export const SPLASH_IMAGES: string[] = [SCENE.mark.src];
/** The same small mark. */
export const SPLASH_LITE_IMAGES: string[] = [SCENE.mark.src];
