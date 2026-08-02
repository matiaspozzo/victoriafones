"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type NavbarStyle = "white" | "blue";

const NavbarStyleContext = createContext<{ style: NavbarStyle; setStyle: (style: NavbarStyle) => void }>({
  style: "white",
  setStyle: () => {},
});

export function NavbarStyleProvider({ children }: { children: ReactNode }) {
  const [style, setStyle] = useState<NavbarStyle>("white");

  return <NavbarStyleContext.Provider value={{ style, setStyle }}>{children}</NavbarStyleContext.Provider>;
}

export function useNavbarStyle(): NavbarStyle {
  return useContext(NavbarStyleContext).style;
}

/**
 * Pages fetch their own navbar_style (from PageSetting or Neighborhood, set
 * in Filament) server-side and render this once near the top to hand it up
 * to <Header>, which lives in the layout and has no direct access to
 * per-page data. Resets to the default on unmount so navigating to a page
 * that doesn't render this doesn't keep a previous page's color.
 */
export function SetNavbarStyle({ style }: { style: NavbarStyle }) {
  const ctx = useContext(NavbarStyleContext);

  useEffect(() => {
    ctx.setStyle(style);
    return () => ctx.setStyle("white");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style]);

  return null;
}
