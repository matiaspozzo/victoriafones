"use client";

import { useEffect, useState, type ReactNode } from "react";

const HEIGHT_VAR = "--listing-title-h";
const BAR_HEIGHT = 48; // px — keep in sync with `h-12` below
/** Fired after the bar height changes so PropertyFilters can re-measure the stack. */
export const STACK_EVENT = "vf:listing-stack";

/**
 * Compact copy of the page title (e.g. the neighborhood name) pinned under the
 * fixed site header once the big <h1> has scrolled out of view, so the listing
 * never loses its context. While visible it publishes its height as the
 * `--listing-title-h` CSS variable, which PropertyFilters adds to its own sticky
 * offset so the filter bar stacks right below it instead of underneath it.
 */
export default function StickyListingTitle({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const h1 = document.querySelector("main h1");
    if (!h1) return;

    // The 80px top margin is the fixed site header: the title counts as gone
    // once it has slid under it.
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 80),
      { rootMargin: "-80px 0px 0px 0px" },
    );
    observer.observe(h1);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(HEIGHT_VAR, visible ? `${BAR_HEIGHT}px` : "0px");
    window.dispatchEvent(new Event(STACK_EVENT));
    return () => {
      document.documentElement.style.removeProperty(HEIGHT_VAR);
    };
  }, [visible]);

  return (
    // Decorative duplicate of the <h1>, hidden from assistive tech.
    <div
      aria-hidden
      // The transform follows the filter bar when it is pushed up at the end of the listing.
      style={{ transform: "translateY(var(--listing-stack-shift, 0px))" }}
      className={`fixed inset-x-0 top-20 z-40 border-b border-brand-text/10 bg-white transition-[opacity,translate] duration-200 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
      }`}
    >
      <div className="mx-auto flex h-12 max-w-7xl items-center px-6">
        <p className="truncate font-heading text-base font-medium text-brand-primary sm:text-xl">{children}</p>
      </div>
    </div>
  );
}
