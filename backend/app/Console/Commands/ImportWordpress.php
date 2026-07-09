<?php

namespace App\Console\Commands;

use App\Models\Neighborhood;
use App\Models\Property;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Imports properties from the live WordPress site (JupiterX + Elementor + JetEngine).
 *
 * The WP REST API exposes the `propiedades` CPT and its taxonomies (tipo-de-operacion,
 * tipo-de-propiedad, zona, region), but JetEngine custom fields (price, bedrooms,
 * bathrooms, m2, year) are NOT registered for REST (meta comes back empty). Those
 * fields are rendered server-side as plain HTML on the public property page, so this
 * command fetches each property's live page and scrapes them from known JetEngine/
 * Elementor markup:
 *   - price:            .jet-listing-dynamic-field__content
 *   - bed/bath/m2/year:  .elementor-icon-list-text (first 4, in that order)
 *   - description:       longest <p> inside .elementor-widget-text-editor
 *   - gallery images:    data-src attributes under /wp-content/uploads/
 *   - lat/lng:           not available in the source for any property today
 *     (JetEngine map widget renders "Coordinates of this location not found");
 *     left null for manual geolocation in Filament, per project plan.
 *
 * Content is imported into the `es` locale only. en/pt translations are left for
 * manual entry (the API resources already fall back to `es` when missing).
 */
class ImportWordpress extends Command
{
    protected $signature = 'import:wordpress
        {--dry-run : Parse and report without writing to the database}
        {--limit= : Only process the first N properties}
        {--code= : Only import a single property by its code (e.g. LEG8)}';

    protected $description = 'Import properties from the live WordPress site (www.victoriafones.com)';

    private const BASE_URL = 'https://www.victoriafones.com';

    /**
     * SPECIFIC sub-zone slug (normalized) => our neighborhood slug.
     * WP tags most José Ignacio properties with the generic "jose-ignacio" region
     * AND a specific sub-zone; the specific one must win, so the generic
     * "jose-ignacio" is deliberately NOT in this map (handled as a fallback below).
     */
    private const NEIGHBORHOOD_MAP = [
        'club-de-mar' => 'club-de-mar',
        'pueblo' => 'pueblo-jose-ignacio',
        'pinar-del-faro' => 'pinar-del-faro',
        'laguna-escondida' => 'laguna-escondida',
        'alderedores-de-jose-ignacio' => 'alrededores', // source typo: "alderedores"
        'alrededores-de-jose-ignacio' => 'alrededores',
        'alrededores' => 'alrededores',
    ];

    /** The generic José Ignacio region tag (no specific sub-zone). */
    private const GENERIC_JOSE_IGNACIO = 'jose-ignacio';

    /** Properties tagged only with the generic region default to the town. */
    private const GENERIC_JOSE_IGNACIO_NEIGHBORHOOD = 'pueblo-jose-ignacio';

    private const CATCH_ALL_NEIGHBORHOOD = 'otras-zonas';

    /** tipo-de-operacion slug (normalized) => our operation enum */
    private const OPERATION_MAP = [
        'venta' => 'sale',
        'alquiler' => 'rent',
        'alquile' => 'rent', // source typo
        'alquioler' => 'rent', // source typo
    ];

    /** tipo-de-propiedad slug (normalized, singularized) => our type enum */
    private const TYPE_MAP = [
        'casa' => 'house',
        'departamento' => 'apartment',
        'terreno' => 'land',
        'chacra' => 'chacra',
    ];

    /** Known dirty records called out in the project spec — flagged, not auto-fixed. */
    private const REVIEW_FLAGS = [
        'PB130' => 'Figura en venta a USD 400 — probablemente alquiler o error de carga.',
        'PB131' => 'Figura en venta a USD 400 — probablemente alquiler o error de carga.',
        'LEG7' => 'Dormitorios/baños parecen invertidos en el origen.',
    ];

    private array $neighborhoodIdBySlug = [];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;
        $onlyCode = $this->option('code') ? Str::upper($this->option('code')) : null;

        $this->neighborhoodIdBySlug = Neighborhood::query()->pluck('id', 'slug')->all();

        $operationTerms = $this->fetchTaxonomyTerms('tipo-de-operacion');
        $typeTerms = $this->fetchTaxonomyTerms('tipo-de-propiedad');
        $zonaTerms = $this->fetchTaxonomyTerms('zona');
        $regionTerms = $this->fetchTaxonomyTerms('region');

        $properties = $this->fetchAllProperties($limit);
        $this->info(sprintf('Fetched %d properties from WordPress.', count($properties)));

        $imported = 0;
        $skipped = [];
        $flagged = [];

        foreach ($properties as $wpProperty) {
            $code = $this->deriveCode($wpProperty['slug']);

            if ($onlyCode && $code !== $onlyCode) {
                continue;
            }

            $operation = $this->resolveOperation($wpProperty['tipo-de-operacion'] ?? [], $operationTerms);
            $type = $this->resolveType($wpProperty['tipo-de-propiedad'] ?? [], $typeTerms, $wpProperty['title']['rendered']);
            $neighborhoodSlug = $this->resolveNeighborhood(
                array_merge($wpProperty['zona'] ?? [], $wpProperty['region'] ?? []),
                $zonaTerms + $regionTerms
            );

            if (! $operation || ! $type) {
                $skipped[] = "{$code}: sin operación o tipo mapeable (revisar taxonomías en origen).";

                continue;
            }

            $scraped = $this->scrapePropertyPage($wpProperty['link']);

            $title = html_entity_decode($wpProperty['title']['rendered'], ENT_QUOTES);
            // Preserve the exact live slug so /propiedades/{slug}/ URLs keep working.
            $slug = $wpProperty['slug'];

            if (isset(self::REVIEW_FLAGS[$code])) {
                $flagged[] = "{$code}: ".self::REVIEW_FLAGS[$code];
            }

            $this->line(sprintf(
                '%s %s | %s/%s | %s | USD %s | %sd/%sb/%sm² (%s) | %d imgs',
                $dryRun ? '[dry-run]' : '[import]',
                $code,
                $operation,
                $type,
                $neighborhoodSlug,
                $scraped['price_usd'] ?? '?',
                $scraped['bedrooms'] ?? '?',
                $scraped['bathrooms'] ?? '?',
                $scraped['built_area_m2'] ?? '?',
                $scraped['year_built'] ?? '?',
                count($scraped['images'])
            ));

            if ($dryRun) {
                $imported++;

                continue;
            }

            $property = Property::firstOrNew(['code' => $code]);
            $isNew = ! $property->exists;

            // Structural data from WP is authoritative — always refreshed.
            $property->fill([
                'operation' => $operation,
                'type' => $type,
                'neighborhood_id' => $this->neighborhoodIdBySlug[$neighborhoodSlug]
                    ?? $this->neighborhoodIdBySlug[self::CATCH_ALL_NEIGHBORHOOD],
                'price_usd' => $scraped['price_usd'],
                'bedrooms' => $scraped['bedrooms'],
                'bathrooms' => $scraped['bathrooms'],
                'built_area_m2' => $type === 'land' ? null : $scraped['built_area_m2'],
                'lot_area_m2' => $type === 'land' ? $scraped['built_area_m2'] : null,
                'year_built' => $scraped['year_built'],
            ]);

            // Manual/content fields are only seeded on first import so re-runs
            // (e.g. to re-map neighborhoods) never clobber editor changes:
            // status, featured, coordinates, translations added in Filament.
            if ($isNew) {
                $property->status = 'draft'; // reviewed manually before publishing
                $property->lat = null;
                $property->lng = null;
                $property->title = ['es' => $title];
                $property->slug = ['es' => $slug];
                $property->description = $scraped['description'] ? ['es' => $scraped['description']] : null;
            }

            $property->save();

            // Only download images when the property has none yet (idempotent re-runs).
            if ($property->getMedia('images')->isEmpty()) {
                foreach ($scraped['images'] as $index => $url) {
                    try {
                        $property->addMediaFromUrl($url)
                            ->usingName($code.'-'.($index + 1))
                            ->toMediaCollection('images');
                    } catch (\Throwable $e) {
                        $this->warn("  {$code}: no se pudo descargar imagen {$url}: {$e->getMessage()}");
                    }
                }
            }

            $imported++;
        }

        $this->newLine();
        $this->info("Procesadas: {$imported}");

        if ($flagged) {
            $this->warn('Registros a revisar manualmente:');
            foreach ($flagged as $line) {
                $this->line("  - {$line}");
            }
        }

        if ($skipped) {
            $this->warn('Omitidos (sin mapeo de taxonomía):');
            foreach ($skipped as $line) {
                $this->line("  - {$line}");
            }
        }

        return self::SUCCESS;
    }

    private function fetchAllProperties(?int $limit): array
    {
        $all = [];
        $page = 1;

        do {
            $response = Http::get(self::BASE_URL.'/wp-json/wp/v2/propiedades', [
                'per_page' => 100,
                'page' => $page,
            ]);

            if ($response->failed()) {
                break;
            }

            $batch = $response->json();
            $all = array_merge($all, $batch);
            $totalPages = (int) $response->header('X-WP-TotalPages');
            $page++;
        } while ($page <= $totalPages && (! $limit || count($all) < $limit));

        return $limit ? array_slice($all, 0, $limit) : $all;
    }

    private function fetchTaxonomyTerms(string $taxonomy): array
    {
        $response = Http::get(self::BASE_URL."/wp-json/wp/v2/{$taxonomy}", ['per_page' => 100]);

        if ($response->failed()) {
            return [];
        }

        return collect($response->json())
            ->mapWithKeys(fn ($term) => [$term['id'] => Str::slug($term['slug'])])
            ->all();
    }

    private function deriveCode(string $slug): string
    {
        preg_match('/^([a-z0-9]+)/i', $slug, $matches);

        return Str::upper($matches[1] ?? $slug);
    }

    private function resolveOperation(array $termIds, array $terms): ?string
    {
        $slugs = array_map(fn ($id) => $this->normalizeSlug($terms[$id] ?? ''), $termIds);
        $mapped = array_unique(array_filter(array_map(fn ($s) => self::OPERATION_MAP[$s] ?? null, $slugs)));

        if (count($mapped) > 1) {
            return 'sale_and_rent';
        }

        return $mapped[array_key_first($mapped)] ?? null;
    }

    private function resolveType(array $termIds, array $terms, string $title): ?string
    {
        foreach ($termIds as $id) {
            $slug = $this->normalizeSlug($terms[$id] ?? '');
            $singular = Str::of($slug)->rtrim('s')->toString();

            if (isset(self::TYPE_MAP[$singular])) {
                return self::TYPE_MAP[$singular];
            }
        }

        // Fallback: infer from the title, per project data-cleaning notes
        // (terrenos/chacras are often only identifiable from the title).
        $title = Str::lower(html_entity_decode($title));

        if (Str::contains($title, 'terreno')) {
            return 'land';
        }

        if (Str::contains($title, 'chacra')) {
            return 'chacra';
        }

        return null;
    }

    private function resolveNeighborhood(array $termIds, array $terms): string
    {
        $hasGenericJoseIgnacio = false;

        // A specific sub-zone (Pueblo, Pinar del Faro, Laguna Escondida, …) always
        // wins over the generic "jose-ignacio" region tag they're paired with.
        foreach ($termIds as $id) {
            $slug = $this->normalizeSlug($terms[$id] ?? '');

            if (isset(self::NEIGHBORHOOD_MAP[$slug])) {
                return self::NEIGHBORHOOD_MAP[$slug];
            }

            if ($slug === self::GENERIC_JOSE_IGNACIO) {
                $hasGenericJoseIgnacio = true;
            }
        }

        // Tagged only with the generic José Ignacio region → default to the town.
        if ($hasGenericJoseIgnacio) {
            return self::GENERIC_JOSE_IGNACIO_NEIGHBORHOOD;
        }

        return self::CATCH_ALL_NEIGHBORHOOD;
    }

    private function normalizeSlug(string $slug): string
    {
        return Str::of($slug)->lower()->ascii()->slug()->toString();
    }

    /**
     * @return array{price_usd: ?int, bedrooms: ?int, bathrooms: ?int, built_area_m2: ?int,
     *               year_built: ?int, description: ?string, images: array<string>}
     */
    private function scrapePropertyPage(string $url): array
    {
        $result = [
            'price_usd' => null,
            'bedrooms' => null,
            'bathrooms' => null,
            'built_area_m2' => null,
            'year_built' => null,
            'description' => null,
            'images' => [],
        ];

        $response = Http::timeout(20)->get($url);

        if ($response->failed()) {
            return $result;
        }

        $dom = new \DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML($response->body());
        libxml_use_internal_errors(false);
        $xpath = new \DOMXPath($dom);

        $priceNode = $xpath->query("//*[contains(concat(' ', normalize-space(@class), ' '), ' jet-listing-dynamic-field__content ')]")->item(0);

        if ($priceNode) {
            $priceText = str_replace(',', '', trim($priceNode->textContent));

            if (is_numeric($priceText) && (float) $priceText > 0) {
                $result['price_usd'] = (int) round((float) $priceText);
            }
        }

        // Each icon-list item pairs an SVG icon (fa-bed, fa-bath, drafting-compass for
        // area, calendar-alt for year) with its value. Match by icon, not position —
        // land/chacra listings omit bed/bath, so a fixed [bed,bath,area,year] order
        // shifts silently wrong for those types.
        $iconMap = [];

        foreach ($xpath->query("//li[contains(concat(' ', normalize-space(@class), ' '), ' elementor-icon-list-item ')]") as $item) {
            $svg = $xpath->query('.//svg[contains(@class, "e-fa")]', $item)->item(0);
            $text = $xpath->query(".//*[contains(concat(' ', normalize-space(@class), ' '), ' elementor-icon-list-text ')]", $item)->item(0);

            if (! $svg || ! $text) {
                continue;
            }

            $iconClass = $svg->getAttribute('class');
            $value = trim($text->textContent);

            if ($value === '') {
                continue;
            }

            if (Str::contains($iconClass, 'fas-bed') && ! isset($iconMap['bedrooms'])) {
                $iconMap['bedrooms'] = $value;
            } elseif (Str::contains($iconClass, 'fas-bath') && ! isset($iconMap['bathrooms'])) {
                $iconMap['bathrooms'] = $value;
            } elseif (Str::contains($iconClass, 'drafting-compass') && ! isset($iconMap['area'])) {
                $iconMap['area'] = $value;
            } elseif (Str::contains($iconClass, 'calendar') && ! isset($iconMap['year'])) {
                $iconMap['year'] = $value;
            }
        }

        $result['bedrooms'] = isset($iconMap['bedrooms']) && is_numeric($iconMap['bedrooms']) ? (int) $iconMap['bedrooms'] : null;
        $result['bathrooms'] = isset($iconMap['bathrooms']) && is_numeric($iconMap['bathrooms']) ? (int) $iconMap['bathrooms'] : null;
        $result['built_area_m2'] = isset($iconMap['area']) && is_numeric($iconMap['area']) ? (int) $iconMap['area'] : null;
        $result['year_built'] = isset($iconMap['year']) && is_numeric($iconMap['year']) ? (int) $iconMap['year'] : null;

        $longestParagraph = '';

        foreach ($xpath->query("//*[contains(concat(' ', normalize-space(@class), ' '), ' elementor-widget-text-editor ')]//p") as $node) {
            $text = trim($node->textContent);

            if (strlen($text) > strlen($longestParagraph)) {
                $longestParagraph = $text;
            }
        }

        $result['description'] = $longestParagraph ?: null;

        $images = [];

        foreach ($xpath->query('//img[@data-src]') as $node) {
            $src = $node->getAttribute('data-src');

            if (Str::contains($src, '/wp-content/uploads/') && ! in_array($src, $images, true)) {
                $images[] = $src;
            }
        }

        $result['images'] = $images;

        return $result;
    }
}
