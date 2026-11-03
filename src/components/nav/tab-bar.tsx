"use client";

import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Receipt, User, Utensils } from "lucide-react";
import { HandiSticker } from "@/components/handi/handi-says";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Food", Icon: Utensils },
  { href: "/orders", label: "Orders", Icon: Receipt },
  { href: "/profile", label: "Me", Icon: User },
] as const;

/** Drill-down screens the bar slides away on (and back in from). */
const DRILL_DOWN = ["/restaurants/", "/orders/"];

/** How far a finger has to move sideways before a press becomes a drag. */
const DRAG_START_PX = 8;

function tabIndex(pathname: string) {
  if (pathname === "/") return 0;
  if (pathname.startsWith("/orders")) return 1;
  if (pathname.startsWith("/profile")) return 2;
  return -1;
}

type Drag = { pointerId: number; startX: number; dragging: boolean };

/**
 * The floating bottom bar for the three top-level student screens. It
 * lives in the root layout rather than in each page, so it stays mounted
 * across tab changes. It's a lit forest bar in both themes whose top edge swells
 * up around Handi: tap a tab and the swell slides across, squashing and settling
 * like liquid as it lands, while Handi hops over and stands in for that tab's
 * icon. It shows on exactly
 * "/", "/orders" and "/profile"; on a menu or an order's ticket it slides
 * down out of the way (and comes back up when you return); everywhere else
 * (sign-in, welcome, admin, legal pages) it isn't rendered at all.
 *
 * It's also a real slider: press anywhere on the bar and slide sideways —
 * Handi lifts and follows your finger, the tab under it lights up (with
 * a tiny buzz on phones that support it), and letting go lands on that tab
 * and opens it. A press that doesn't move sideways is still an
 * ordinary tap; vertical movement still scrolls the page (touch-action:
 * pan-y). Keyboard users get the plain links.
 *
 * Tapping the tab you're already on scrolls that page back to the top.
 */
export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const dragRef = useRef<Drag | null>(null);
  // Swallow the click that follows a drag's pointerup.
  const suppressClickRef = useRef(false);
  // While dragging: the pill's left edge (px from the first slot) and the
  // tab under it. Worked out in the pointer handlers, since measuring the
  // bar during render isn't allowed.
  const [held, setHeld] = useState<{ x: number; tab: number } | null>(null);

  const onTab = pathname === "/" || pathname === "/orders" || pathname === "/profile";
  const drillDown = DRILL_DOWN.some((prefix) => pathname.startsWith(prefix));
  if (!onTab && !drillDown) return null;

  const active = tabIndex(pathname);
  // Where the pill sits: the active tab, or — while hidden on a drill-down
  // screen — the tab it came from, so it doesn't visibly jump on the way out.
  const pill = Math.max(active, 0);

  /** The width of one tab slot (the pill is exactly one slot wide). */
  function slotWidth() {
    const nav = navRef.current;
    if (!nav) return 0;
    // The bar's side padding, read rather than assumed.
    const pad = parseFloat(getComputedStyle(nav).paddingLeft) || 6;
    return (nav.clientWidth - pad * 2) / TABS.length;
  }

  /** The pill's left edge (px from the first slot) centred under the finger, clamped to the bar. */
  function pillXFor(clientX: number) {
    const nav = navRef.current!;
    const slot = slotWidth();
    const pad = parseFloat(getComputedStyle(nav).paddingLeft) || 6;
    const x = clientX - nav.getBoundingClientRect().left - pad - slot / 2;
    return Math.min(Math.max(x, 0), slot * (TABS.length - 1));
  }

  function onPointerDown(e: PointerEvent<HTMLElement>) {
    if (e.button !== 0) return;
    dragRef.current = { pointerId: e.pointerId, startX: e.clientX, dragging: false };
  }

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (!drag.dragging) {
      if (Math.abs(e.clientX - drag.startX) < DRAG_START_PX) return;
      drag.dragging = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    const x = pillXFor(e.clientX);
    const tab = Math.round(x / Math.max(slotWidth(), 1));
    if (tab !== (held?.tab ?? pill)) navigator.vibrate?.(8);
    setHeld({ x, tab });
  }

  function endDrag(e: PointerEvent<HTMLElement>, commit: boolean) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    if (!drag.dragging) return;
    suppressClickRef.current = true;
    const target = Math.round(pillXFor(e.clientX) / Math.max(slotWidth(), 1));
    setHeld(null);
    if (commit && target !== active) router.push(TABS[target].href);
  }

  function onLinkClick(event: MouseEvent<HTMLAnchorElement>, isActive: boolean) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      event.preventDefault();
      return;
    }
    if (!isActive) return;
    event.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  const dragging = held !== null;
  const lit = held?.tab ?? active;

  return (
    <div
      aria-hidden={onTab ? undefined : true}
      inert={!onTab}
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-[translate,opacity] duration-(--dur-base)",
        onTab ? "ease-out-expo" : "translate-y-[calc(100%+1rem)] opacity-0 ease-in-quad",
      )}
    >
      <nav
        ref={navRef}
        aria-label="Primary"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e, true)}
        onPointerCancel={(e) => endDrag(e, false)}
        className="glow-hero pointer-events-auto relative mx-auto grid w-full max-w-md touch-pan-y grid-cols-3 rounded-[1.25rem] border border-hero-accent/28 bg-(--hero-b) px-3.5 pt-1 select-none"
      >
        {/* The swell. The outer span slides between tabs (translateX by whole
            tab widths — it's exactly one tab wide), or follows the finger 1:1
            while dragged. The curve is the bar's own fill and border, and runs
            a little into the bar to hide the border under it, so the two read
            as one piece. Keyed by tab, so it lands and Handi hops on each move. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 left-3.5 z-20 w-[calc((100%-1.75rem)/3)]",
            !dragging && "transition-transform duration-(--dur-slow) ease-spring",
          )}
          style={{ transform: held ? `translateX(${held.x}px)` : `translateX(${pill * 100}%)` }}
        >
          <span className="absolute -top-[1.625rem] left-1/2 h-[1.75rem] w-full max-w-24 -translate-x-1/2">
            <svg key={pill} viewBox="0 0 96 28" preserveAspectRatio="none" className="animate-swell-land block size-full overflow-visible">
              <path d="M0 26C24 26 26 0 48 0S72 26 96 26V28H0Z" fill="var(--hero-b)" />
              <path d="M0 26C24 26 26 0 48 0S72 26 96 26" fill="none" stroke="var(--hero-accent)" strokeOpacity="0.28" />
            </svg>
          </span>
          <span className="absolute -top-7 left-1/2 -translate-x-1/2">
            <span
              key={pill}
              className={cn(
                "block transition-transform duration-(--dur-quick)",
                dragging ? "-translate-y-1.5 scale-110" : "animate-handi-hop",
              )}
            >
              <HandiSticker pose="happy" sizes="60px" preload className="animate-handi-idle size-[3.625rem] drop-shadow-[0_3px_5px_rgb(0_0_0/0.35)]" />
            </span>
          </span>
        </span>

        {TABS.map(({ href, label, Icon }, i) => {
          const isActive = i === active;
          const isLit = i === lit;
          return (
            <Link
              key={href}
              href={href}
              draggable={false}
              aria-current={isActive ? "page" : undefined}
              onClick={(event) => onLinkClick(event, isActive)}
              className={cn(
                "pressable relative z-10 flex h-14 flex-col items-center justify-end gap-0.5 rounded-2xl pb-1.5 text-xs font-semibold outline-none transition-colors duration-(--dur-base) focus-visible:ring-3 focus-visible:ring-hero-accent/80",
                isLit ? "font-bold text-hero-accent" : "text-hero-foreground/80 hover:text-hero-foreground",
              )}
            >
              {/* Handi covers the lit tab's icon, so it steps aside. */}
              <Icon className={cn("size-5 shrink-0", isLit && "invisible")} strokeWidth={2} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
