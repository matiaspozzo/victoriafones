# Victoria Fones — Migración WordPress → Laravel/Filament + Next.js

Sitio inmobiliario de Victoria Fones Real Estate (José Ignacio, Punta del Este, Uruguay).
Migración desde WordPress (JupiterX + Elementor) hacia el mismo stack usado en el proyecto
Landa Inmobiliaria: **Laravel + Filament como backend/admin** y **Next.js como frontend público**.

Sitio actual en producción: https://www.victoriafones.com (referencia visual y de contenido — NO tocar).

## Regla de oro: el diseño se replica 1:1

**No estamos rediseñando.** El frontend Next.js debe verse idéntico al sitio WordPress actual:
misma paleta, misma tipografía, mismos espaciados, mismas secciones, mismo comportamiento
responsive. Cualquier mejora es de performance, datos y UX funcional (filtros, mapa), nunca visual.

Proceso obligatorio ANTES de estilar cualquier componente (ver `frontend/CLAUDE.md` §Design tokens):
1. Descargar el CSS del sitio vivo (theme JupiterX + `wp-content/uploads/elementor/css/post-*.css`).
2. Extraer: colores (hex exactos), familias tipográficas de Google Fonts, tamaños/pesos por
   nivel de heading, container widths, breakpoints de Elementor.
3. Sacar screenshots de: home, listado de ventas, ficha de propiedad, quiénes somos, contacto
   (desktop y mobile) y guardarlos en `frontend/design-reference/`.
4. Volcar los tokens en `frontend/src/app/globals.css` (@theme de Tailwind v4) reemplazando
   los valores `/* TODO:token */`.

Assets conocidos del sitio actual (descargarlos a `frontend/public/`):
- Logo header: `wp-content/uploads/2024/10/logo@2x.webp`
- Isologo blanco (header sticky/hero): `wp-content/uploads/2024/10/iso-white.svg`
- Logo footer (azul): `wp-content/uploads/2024/10/logo-azul@2x.webp`
- Favicon: `wp-content/uploads/2024/10/cropped-fav-blue-270x270.png`
- OG image: `wp-content/uploads/2024/11/og.jpg`

## Arquitectura

```
victoriafones/
├── backend/    Laravel 11 + Filament 3 — API pública + panel admin. Fuente de verdad.
└── frontend/   Next.js 15 (App Router, TS, Tailwind v4) — sitio público con ISR.
```

- Sin sincronización externa (a diferencia de Landa no hay Tokko): Filament es el CRUD completo.
- Patrón de revalidación idéntico a Landa: al guardar en Filament, un Observer llama al
  endpoint `/api/revalidate` del frontend con un secret compartido (`REVALIDATE_SECRET`).
- Imágenes: Spatie Media Library en el backend; el frontend las consume vía URL absoluta
  (conversions: `thumb` 400px, `card` 800px, `full` 1920px, todas WebP).
- Dev: backend en `http://localhost:8000`, frontend en `http://localhost:3000`.

## Idiomas

3 locales. Español es el default y va SIN prefijo (igual que hoy):

| Locale | Prefijo URL | Notas |
|--------|-------------|-------|
| `es`   | (ninguno)   | default |
| `en`   | `/en`       | |
| `pt`   | `/br`       | ⚠️ el prefijo es `/br`, no `/pt` — respetar URLs actuales |

Todo contenido editable (propiedades, barrios, amenities) usa `spatie/laravel-translatable`
(columnas JSON `{"es": "...", "en": "...", "pt": "..."}`). Los strings de UI del frontend
viven en `frontend/src/messages/{es,en,pt}.json` (next-intl).

## Preservación de URLs (SEO crítico)

Rutas ES actuales que deben seguir existiendo con el mismo path:
- `/propiedades-en-venta/` y `/propiedades-en-alquiler/` (listados)
- `/propiedades/{slug}/` (ficha; slug incluye el código, ej. `leg8-laguna-escondida-jose-ignacio`)
- `/quienes-somos/`, `/contacto/`, `/nuestras-propiedades/`
- `/en/...` y `/br/...` equivalentes — **verificar los slugs EN/PT reales contra el sitio vivo**
  antes de fijar `frontend/src/i18n/routing.ts` (hay TODOs marcados).

Las URLs de categoría anidadas de WP (ej. `/propiedades-en-venta/punta-del-este/propiedades-en-venta-en-jose-ignacio/propiedades-en-venta-en-pueblo/`)
se acortan a `/venta/{barrio}` con **redirect 301** definido en `frontend/next.config.ts`.
Generar el mapa completo de redirects a partir del sitemap de WP (`/sitemap_index.xml`).

## Modelo de datos (resumen)

- `properties`: code único (LEG8, PFD30…), status, operation (sale/rent/sale_and_rent),
  type (house/apartment/land/chacra/commercial), neighborhood_id, price_usd nullable
  (null ⇒ "Consultar"), bedrooms, bathrooms, built_area_m2, **lot_area_m2** (nuevo, hoy WP
  mezcla lote con construido), year_built, lat/lng (requerido para el mapa), featured.
  Campos traducibles JSON: title, slug, excerpt, description, seo_title, seo_description.
- `neighborhoods`: jerárquico (parent_id). Árbol semilla: Punta del Este → José Ignacio →
  {Pueblo, Club de Mar, Pinar del Faro, Laguna Escondida, Alrededores} + Otras Zonas.
  center_lat/lng + polygon GeoJSON opcional para el mapa.
- `amenities` + pivot: piscina, parrillero, dependencia, vista al mar, etc.
- `rental_prices`: precios de alquiler por temporada (label traducible + price_usd).
- `leads`: consultas de formularios y clicks de WhatsApp, visibles en Filament.

## Mapa interactivo (como Landa)

- Endpoint `GET /api/map/properties` → GeoJSON liviano filtrable (operation, type,
  neighborhood, price range, bedrooms).
- Frontend: MapLibre GL + clustering, tarjeta flotante al hover/click, sidebar sincronizado
  con el viewport. Página `/mapa` + mapa embebido en la ficha de propiedad.
- El sitio WP actual tiene fichas SIN coordenadas ("Coordinates of this location not found"):
  durante la carga inicial hay que geolocalizar cada propiedad con el map picker de Filament.

## Migración de contenido desde WP

Comando `php artisan import:wordpress` (esqueleto en `backend/app/Console/Commands/`).
Estrategia: intentar `https://www.victoriafones.com/wp-json/wp/v2/` (verificar si el CPT
`propiedades` está expuesto); si no, export XML o acceso directo a la DB de WP.
Durante el import, normalizar datos conocidos como sucios:
- PB130 y PB131 figuran en venta a USD 400 (son alquileres o error de carga) → revisar.
- LEG7: 2 dormitorios / 6 baños (parece invertido) → revisar.
- Extraer el TIPO de propiedad del título ("Terreno", "Chacra"…) hacia el campo `type`.
- Para terrenos, los m² del título/ícono son de LOTE → `lot_area_m2`, no `built_area_m2`.
- Normalizar títulos ("Jose"/"José", guiones inconsistentes).

## Convenciones

- Código, nombres de variables, commits: inglés. Contenido y UI: según locale.
- PHP: Laravel Pint. TS: ESLint + Prettier (config del proyecto).
- No introducir librerías nuevas sin justificación; el stack ya está definido.
- Commits atómicos por feature. No commitear `.env`.

## Comandos frecuentes

```bash
# Backend (desde backend/)
composer install && php artisan migrate --seed
php artisan serve                      # :8000
php artisan import:wordpress --dry-run

# Frontend (desde frontend/)
npm install && npm run dev             # :3000
npm run build && npm run start
```

## Fases sugeridas

1. Backend: migraciones + modelos + seeders + Filament resources funcionando.
2. Extracción de design tokens y assets del sitio vivo → `globals.css`.
3. Frontend: layout (header/footer/idiomas) pixel-perfect vs producción.
4. Home + listados + ficha de propiedad.
5. Mapa interactivo + filtros.
6. Import de contenido WP + carga de coordenadas.
7. Redirects 301, hreflang, sitemap, JSON-LD, QA en 3 idiomas, deploy.