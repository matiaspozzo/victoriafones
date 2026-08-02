"use client";

import { useEffect, useState } from "react";

export type NavbarStyle = "white" | "blue";

const EVENT_NAME = "vf:navbar-style";

/**
 * Communicates the current page's navbar_style (from PageSetting/
 * Neighborhood, set in Filament) from the page to <Header>, which lives in
 * the layout and has no direct access to per-page data otherwise.
 *
 * This goes through a window CustomEvent rather than React Context on
 * purpose: Context broke silently in production (worked in dev) because
 * Next.js's production code-splitting bundled NavbarStyleContext into two
 * separate chunks — one pulled in via the layout/Header, another via the
 * page/SetNavbarStyle — giving each side its own independent createContext()
 * instance that never talked to the other. `window` is guaranteed to be the
 * same object no matter how the JS gets chunked, so it doesn't have that
 * failure mode.
 */
export function useNavbarStyle(): NavbarStyle {
  const [style, setStyle] = useState<NavbarStyle>("white");

  useEffect(() => {
    function onChange(e: Event) {
      setStyle((e as CustomEvent<NavbarStyle>).detail);
    }
    window.addEventListener(EVENT_NAME, onChange);
    return () => window.removeEventListener(EVENT_NAME, onChange);
  }, []);

  return style;
}

/**
 * Pages render this once (with their own fetched navbar_style) to tell the
 * header which variant to use. Resets to the default on unmount so
 * navigating to a page that doesn't render this doesn't keep a previous
 * page's color.
 */
export function SetNavbarStyle({ style }: { style: NavbarStyle }) {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: style }));
    return () => {
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: "white" }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style]);

  return null;
}
