"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

// Grey/monochrome basemap — no API key required (OpenFreeMap / OSM).
const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";
const BRAND = "#03071c";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
}

export default function PropertyLocationMap({
  lat,
  lng,
  title,
  className = "h-80",
  popupTitle,
  popupSubtitle,
}: {
  lat: number;
  lng: number;
  title?: string;
  className?: string;
  popupTitle?: string;
  popupSubtitle?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE_URL,
        center: [lng, lat],
        zoom: 14,
        attributionControl: false,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.addControl(new maplibregl.AttributionControl({ compact: true }));
      map.scrollZoom.disable(); // don't hijack page scroll

      const el = document.createElement("div");
      el.style.cssText =
        "width:16px;height:16px;border-radius:50%;background:" + BRAND + ";border:3px solid #fff;box-shadow:0 0 0 2px " + BRAND;

      new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);

      if (popupTitle) {
        const html =
          `<div style="font-size:13px;line-height:1.35;color:${BRAND}">` +
          `<strong>${escapeHtml(popupTitle)}</strong>` +
          (popupSubtitle ? `<div style="margin-top:2px;color:#4b4b57">${escapeHtml(popupSubtitle)}</div>` : "") +
          `</div>`;
        // focusAfterOpen defaults to true, which calls .focus() on the close button as
        // soon as the popup opens on map load — since this map sits below the fold on
        // the property page, the browser auto-scrolls the focused element into view,
        // jumping the whole page down. Disable it; nothing here needs keyboard focus.
        new maplibregl.Popup({ offset: 18, closeButton: true, maxWidth: "260px", focusAfterOpen: false })
          .setLngLat([lng, lat])
          .setHTML(html)
          .addTo(map);
      }

      mapRef.current = map;
    } catch {
      // WebGL unavailable — keep the placeholder background instead of crashing.
      return;
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, popupTitle, popupSubtitle]);

  return <div ref={containerRef} aria-label={title} className={`w-full bg-brand-accent ${className}`} />;
}
