import maplibregl from "maplibre-gl";

/**
 * Adds MapLibre's attribution control in compact form and, on narrow screens,
 * starts it folded behind the ⓘ button. A compact control opens expanded and
 * only folds on the first drag, so on a phone the credits cover the map until
 * the visitor moves it. The credits stay one tap away (required by the
 * OpenStreetMap / OpenMapTiles licenses).
 */
export function addCompactAttribution(map: maplibregl.Map) {
  map.addControl(new maplibregl.AttributionControl({ compact: true }));

  // The control only gets its text (and its compact/expanded state) once the
  // tile sources have loaded, so fold it after the first idle, not right away.
  map.once("idle", () => {
    if (map.getContainer().offsetWidth > 640) return;

    // Folded = no `compact-show` class and no `open` attribute on the <details>.
    const attrib = map.getContainer().querySelector(".maplibregl-ctrl-attrib");
    attrib?.classList.remove("maplibregl-compact-show");
    attrib?.removeAttribute("open");
  });
}
