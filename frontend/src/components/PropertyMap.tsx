"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PropertyStatRow } from "@/components/PropertyStats";
import { formatUsd } from "@/lib/format";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Free, grey/monochrome vector basemap — no API key required (OpenFreeMap / OSM).
const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

// José Ignacio, Uruguay
const DEFAULT_CENTER: [number, number] = [-54.66, -34.83];

const BRAND = "#03071c";

type FeatureProps = {
  id: number;
  code: string;
  title: string;
  slug: string;
  operation: string;
  type: string;
  price_usd: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  built_area_m2: number | null;
  lot_area_m2: number | null;
  year_built: number | null;
  cover_image: string | null;
  neighborhood: string | null;
};

type PropertyFeature = GeoJSON.Feature<GeoJSON.Point, FeatureProps>;

export default function PropertyMap({ locale, query = "" }: { locale: string; query?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const featuresRef = useRef<PropertyFeature[]>([]);
  const router = useRouter();
  const uiLocale = useLocale();

  const [visible, setVisible] = useState<PropertyFeature[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE_URL,
        center: DEFAULT_CENTER,
        zoom: 12,
        attributionControl: false,
      });
    } catch {
      // WebGL unavailable — don't crash the page.
      return;
    }
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }));
    mapRef.current = map;

    const markers: Record<string, maplibregl.Marker> = {};
    let markersOnScreen: Record<string, maplibregl.Marker> = {};

    map.on("load", async () => {
      let geojson: GeoJSON.FeatureCollection<GeoJSON.Point, FeatureProps>;
      try {
        const res = await fetch(`${API_URL}/api/map/properties?locale=${locale}${query ? `&${query}` : ""}`);
        geojson = await res.json();
      } catch {
        return;
      }

      featuresRef.current = geojson.features as PropertyFeature[];
      setVisible(featuresRef.current);

      map.addSource("properties", {
        type: "geojson",
        data: geojson,
        cluster: true,
        clusterRadius: 55,
        clusterMaxZoom: 15,
      });
      // Invisible layer so querySourceFeatures returns tiled features.
      map.addLayer({
        id: "properties-src",
        type: "circle",
        source: "properties",
        paint: { "circle-radius": 0, "circle-opacity": 0 },
      });

      // Floating card shown on marker hover (styled like the listing cards).
      const hoverPopup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 26,
        maxWidth: "260px",
        className: "vf-card-popup",
      });

      const updateMarkers = () => {
        const newMarkers: Record<string, maplibregl.Marker> = {};
        const features = map.querySourceFeatures("properties") as unknown as Array<{
          geometry: { coordinates: [number, number] };
          properties: Record<string, unknown>;
        }>;

        for (const feature of features) {
          const coords = feature.geometry.coordinates;
          const props = feature.properties;
          let id: string;

          if (props.cluster) {
            id = `c${props.cluster_id}`;
            if (!markers[id]) {
              const el = clusterEl(Number(props.point_count));
              el.addEventListener("click", () => {
                const src = map.getSource("properties") as maplibregl.GeoJSONSource;
                src.getClusterExpansionZoom(Number(props.cluster_id)).then((zoom) => {
                  map.easeTo({ center: coords, zoom: (zoom ?? map.getZoom()) + 0.5 });
                });
              });
              markers[id] = new maplibregl.Marker({ element: el }).setLngLat(coords);
            }
          } else {
            id = `p${props.id}`;
            if (!markers[id]) {
              // GeoJSON may surface a missing price as null/undefined/"" —
              // coerce to a real number or fall back to "Consultar".
              const rawPrice = Number(props.price_usd);
              const price = Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : null;
              const el = priceEl(formatUsd(price, uiLocale));
              el.addEventListener("click", () => {
                router.push(`/propiedades/${props.slug}`);
              });
              el.addEventListener("mouseenter", () => {
                hoverPopup.setLngLat(coords).setHTML(cardPopupHTML(props)).addTo(map);
              });
              el.addEventListener("mouseleave", () => hoverPopup.remove());
              markers[id] = new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat(coords);
            }
          }

          newMarkers[id] = markers[id];
          if (!markersOnScreen[id]) markers[id].addTo(map);
        }

        for (const key in markersOnScreen) {
          if (!newMarkers[key]) markersOnScreen[key].remove();
        }
        markersOnScreen = newMarkers;
      };

      const syncList = () => {
        const b = map.getBounds();
        const inView = featuresRef.current.filter((f) => {
          const [lng, lat] = f.geometry.coordinates;
          return b.contains([lng, lat]);
        });
        setVisible(inView);
      };

      map.on("render", () => {
        if (!map.isSourceLoaded("properties")) return;
        updateMarkers();
      });
      map.on("moveend", syncList);

      if (featuresRef.current.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        featuresRef.current.forEach((f) => bounds.extend(f.geometry.coordinates as [number, number]));
        map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 0 });
      }
      syncList();
    });

    return () => {
      Object.values(markers).forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, query]);

  const unit =
    uiLocale === "en"
      ? `${visible.length === 1 ? "property" : "properties"} in this area`
      : uiLocale === "pt"
        ? `${visible.length === 1 ? "propriedade" : "propriedades"} nesta área`
        : `${visible.length === 1 ? "propiedad" : "propiedades"} en esta zona`;

  const emptyLabel =
    uiLocale === "en"
      ? "No properties in the visible area. Zoom out or move the map."
      : uiLocale === "pt"
        ? "Nenhuma propriedade na área visível. Afaste ou mova o mapa."
        : "No hay propiedades en el área visible. Alejá el mapa o movételo.";

  return (
    <div className="grid h-[calc(100vh-80px)] min-h-[600px] lg:grid-cols-[1fr_440px]">
      <div ref={containerRef} className="relative h-full w-full bg-brand-accent" />

      <div className="h-full overflow-y-auto border-brand-text/10 bg-white lg:border-l">
        <div className="sticky top-0 z-10 border-b border-brand-text/10 bg-white px-4 py-3">
          <p className="text-sm text-brand-text/70">
            <span className="font-semibold text-brand-primary">{visible.length}</span> {unit}
          </p>
        </div>

        {visible.length === 0 ? (
          <p className="p-6 text-center text-sm text-brand-text/50">{emptyLabel}</p>
        ) : (
          visible.map((feature) => (
            <button
              key={feature.properties.id}
              type="button"
              onMouseEnter={() => setHoveredId(feature.properties.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => router.push(`/propiedades/${feature.properties.slug}`)}
              className={`flex w-full gap-4 border-b border-brand-text/10 p-3 text-left transition-colors ${
                feature.properties.id === hoveredId ? "bg-brand-accent/50" : "hover:bg-brand-accent/30"
              }`}
            >
              <div className="h-24 w-32 shrink-0 overflow-hidden bg-brand-gray">
                {feature.properties.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={feature.properties.cover_image}
                    alt={feature.properties.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                {feature.properties.neighborhood ? (
                  <span className="text-[11px] font-medium uppercase tracking-wide text-brand-text/50">
                    {feature.properties.neighborhood}
                  </span>
                ) : null}
                <h3 className="truncate font-heading text-base font-semibold text-brand-primary">
                  {feature.properties.title}
                </h3>
                <PropertyStatRow
                  className="mt-1 text-xs"
                  bedrooms={feature.properties.bedrooms}
                  bathrooms={feature.properties.bathrooms}
                  area={feature.properties.built_area_m2 ?? feature.properties.lot_area_m2}
                  year={feature.properties.year_built}
                />
                <span className="mt-auto pt-2 font-price text-sm font-bold text-brand-primary">
                  {formatUsd(feature.properties.price_usd, uiLocale)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// --- marker elements (VF brand navy) ---

function clusterEl(count: number): HTMLElement {
  const el = document.createElement("div");
  const size = count < 10 ? 46 : count < 50 ? 54 : 64;
  el.style.cssText = `width:${size}px;height:${size}px;`;
  el.className =
    "flex flex-col items-center justify-center rounded-full text-white font-bold cursor-pointer shadow-lg leading-none";
  el.style.background = BRAND;
  el.style.boxShadow = `0 0 0 8px ${BRAND}33`;
  el.innerHTML = `<span style="font-size:16px">${count}</span><span style="font-size:8px;letter-spacing:0.5px;margin-top:2px">DISPONIBLES</span>`;
  return el;
}

function priceEl(label: string): HTMLElement {
  const el = document.createElement("div");
  el.className = "cursor-pointer";
  el.innerHTML = `
    <div style="position:relative;display:inline-block">
      <div style="background:${BRAND};color:#fff;font-family:var(--font-anaheim),sans-serif;font-size:12px;font-weight:700;padding:5px 10px;border-radius:6px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${label}</div>
      <div style="position:absolute;left:50%;bottom:-5px;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid ${BRAND}"></div>
    </div>`;
  return el;
}

// --- hover card popup (mirrors the listing card layout) ---

const svgStat = (viewBox: string, d: string) =>
  `<svg viewBox="${viewBox}" style="height:13px;width:auto;flex:none;fill:${BRAND}"><path d="${d}"/></svg>`;

const ICON_BED = svgStat("0 0 640 512", "M176 256c44.11 0 80-35.89 80-80s-35.89-80-80-80-80 35.89-80 80 35.89 80 80 80zm352-128H304c-8.84 0-16 7.16-16 16v144H64V80c0-8.84-7.16-16-16-16H16C7.16 64 0 71.16 0 80v352c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16v-48h512v48c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16V240c0-61.86-50.14-112-112-112z");
const ICON_BATH = svgStat("0 0 512 512", "M32,384a95.4,95.4,0,0,0,32,71.09V496a16,16,0,0,0,16,16h32a16,16,0,0,0,16-16V480H384v16a16,16,0,0,0,16,16h32a16,16,0,0,0,16-16V455.09A95.4,95.4,0,0,0,480,384V336H32ZM496,256H80V69.25a21.26,21.26,0,0,1,36.28-15l19.27,19.26c-13.13,29.88-7.61,59.11,8.62,79.73l-.17.17A16,16,0,0,0,144,176l11.31,11.31a16,16,0,0,0,22.63,0L283.31,81.94a16,16,0,0,0,0-22.63L272,48a16,16,0,0,0-22.62,0l-.17.17c-20.62-16.23-49.83-21.75-79.73-8.62L150.22,20.28A69.25,69.25,0,0,0,32,69.25V256H16A16,16,0,0,0,0,272v16a16,16,0,0,0,16,16H496a16,16,0,0,0,16-16V272A16,16,0,0,0,496,256Z");
const ICON_AREA = svgStat("0 0 512 512", "M457.01 344.42c-25.05 20.33-52.63 37.18-82.54 49.05l54.38 94.19 53.95 23.04c9.81 4.19 20.89-2.21 22.17-12.8l7.02-58.25-54.98-95.23zm42.49-94.56c4.86-7.67 1.89-17.99-6.05-22.39l-28.07-15.57c-7.48-4.15-16.61-1.46-21.26 5.72C403.01 281.15 332.25 320 256 320c-23.93 0-47.23-4.25-69.41-11.53l67.36-116.68c.7.02 1.34.21 2.04.21s1.35-.19 2.04-.21l51.09 88.5c31.23-8.96 59.56-25.75 82.61-48.92l-51.79-89.71C347.39 128.03 352 112.63 352 96c0-53.02-42.98-96-96-96s-96 42.98-96 96c0 16.63 4.61 32.03 12.05 45.66l-68.3 118.31c-12.55-11.61-23.96-24.59-33.68-39-4.79-7.1-13.97-9.62-21.38-5.33l-27.75 16.07c-7.85 4.54-10.63 14.9-5.64 22.47 15.57 23.64 34.69 44.21 55.98 62.02L0 439.66l7.02 58.25c1.28 10.59 12.36 16.99 22.17 12.8l53.95-23.04 70.8-122.63C186.13 377.28 220.62 384 256 384c99.05 0 190.88-51.01 243.5-134.14zM256 64c17.67 0 32 14.33 32 32s-14.33 32-32 32-32-14.33-32-32 14.33-32 32-32z");
const ICON_CAL = svgStat("0 0 448 512", "M148 288h-40c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12zm108-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm96 0v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm-96 96v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm-96 0v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm192 0v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm96-260v352c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V112c0-26.5 21.5-48 48-48h48V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h128V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h48c26.5 0 48 21.5 48 48zm-48 346V160H48v298c0 3.3 2.7 6 6 6h340c3.3 0 6-2.7 6-6z");

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
}

function popupPrice(raw: unknown): string {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0
    ? `USD: ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "Consultar";
}

function cardPopupHTML(p: Record<string, unknown>): string {
  const stat = (icon: string, val: unknown) =>
    `<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#4b4b57">${icon}${val}</span>`;
  const area = p.built_area_m2 ?? p.lot_area_m2;
  const stats = [
    p.bedrooms ? stat(ICON_BED, p.bedrooms) : "",
    p.bathrooms ? stat(ICON_BATH, p.bathrooms) : "",
    area ? stat(ICON_AREA, area) : "",
    p.year_built ? stat(ICON_CAL, p.year_built) : "",
  ].join("");
  const cover = p.cover_image ? String(p.cover_image) : null;
  const img = cover
    ? `<div style="height:140px;background:#e9e9e9;overflow:hidden"><img src="${cover}" alt="" style="width:100%;height:100%;object-fit:cover"/></div>`
    : `<div style="height:140px;background:#e9e9e9"></div>`;
  return `<div style="width:240px">${img}
    <div style="padding:10px 12px 12px">
      <h3 style="font-size:15px;font-weight:500;color:${BRAND};line-height:1.25;margin:0">${escapeHtml(String(p.title ?? ""))}</h3>
      <p style="font-family:var(--font-anaheim),sans-serif;font-weight:700;font-size:13px;letter-spacing:.02em;color:${BRAND};margin:8px 0 0">${popupPrice(p.price_usd)}</p>
      <div style="display:flex;flex-wrap:nowrap;white-space:nowrap;gap:10px;margin-top:8px">${stats}</div>
    </div>
  </div>`;
}
