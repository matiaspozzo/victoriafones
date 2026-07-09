<?php

namespace App\Console\Commands;

use App\Models\Neighborhood;
use App\Models\Property;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Imports properties from the WordPress CSV export (Propiedades-Export-*.csv).
 * The CSV is the richest source: it carries coordinates, price, areas and the
 * full description in one place. Images are referenced by WP attachment ID and
 * resolved to URLs via the public media REST API when --images is passed.
 */
class ImportCsv extends Command
{
    protected $signature = 'import:csv
        {path=propiedades-export.csv : Path relative to storage/app}
        {--limit= : Max properties to import}
        {--images : Also resolve + download images (slow)}
        {--image-cap=15 : Max images per property}
        {--only-published : Skip drafts}';

    protected $description = 'Import properties from the WordPress CSV export.';

    private const OPERATION_MAP = [
        'venta' => 'sale',
        'alquiler' => 'rent',
        'alquiler|venta' => 'sale_and_rent',
        'venta|alquiler' => 'sale_and_rent',
    ];

    private const TYPE_MAP = [
        'casa' => 'house',
        'casas' => 'house',
        'departamento' => 'apartment',
        'departamentos' => 'apartment',
        'terreno' => 'land',
        'terrenos' => 'land',
        'chacra' => 'chacra',
        'chacras' => 'chacra',
    ];

    private const NEIGHBORHOOD_MAP = [
        'club de mar' => 'club-de-mar',
        'pueblo' => 'pueblo-jose-ignacio',
        'pinar del faro' => 'pinar-del-faro',
        'laguna escondida' => 'laguna-escondida',
        'alderedores de jose ignacio' => 'alrededores',
        'alrededores de jose ignacio' => 'alrededores',
    ];

    private const CATCH_ALL_NEIGHBORHOOD = 'otras-zonas';
    private const GENERIC_JI_NEIGHBORHOOD = 'pueblo-jose-ignacio';

    private const MEDIA_ENDPOINT = 'https://www.victoriafones.com/wp-json/wp/v2/media/';

    private array $neighborhoodIdBySlug = [];
    private array $mediaUrlCache = [];

    public function handle(): int
    {
        $this->neighborhoodIdBySlug = Neighborhood::pluck('id', 'slug')->all();

        $path = storage_path('app/'.$this->argument('path'));
        if (! is_file($path)) {
            $this->error("CSV not found at {$path}");

            return self::FAILURE;
        }

        $rows = $this->readCsv($path);
        $this->info('Read '.count($rows).' rows.');

        $best = $this->dedupeByCode($rows);
        $this->info('Unique properties (deduped by code): '.count($best));

        if ($this->option('only-published')) {
            $best = array_filter($best, fn ($r) => $r['Status'] === 'publish');
        }

        $limit = $this->option('limit') ? (int) $this->option('limit') : null;
        $withImages = (bool) $this->option('images');
        $imageCap = (int) $this->option('image-cap');

        $imported = 0;
        $skipped = [];

        foreach ($best as $code => $row) {
            if ($limit && $imported >= $limit) {
                break;
            }

            $operation = self::OPERATION_MAP[$this->norm($row['Tipo de Operación'])] ?? null;
            $type = self::TYPE_MAP[$this->norm($row['Tipo de Propiedad'])] ?? null;

            if (! $operation || ! $type) {
                $skipped[] = "{$code}: operación/tipo faltante";

                continue;
            }

            $coords = $this->parseCoords($row['coordenadas']);
            $neighborhoodSlug = $this->resolveNeighborhood($row['Zona']);
            $isLand = $type === 'land';
            $title = trim($row['Title']) ?: $code;
            $slug = Str::slug($row['_wp_desired_post_slug'] ?: $title);

            $property = Property::firstOrNew(['code' => $code]);
            $isNew = ! $property->exists;

            $property->fill([
                'operation' => $operation,
                'type' => $type,
                'neighborhood_id' => $this->neighborhoodIdBySlug[$neighborhoodSlug]
                    ?? $this->neighborhoodIdBySlug[self::CATCH_ALL_NEIGHBORHOOD],
                'price_usd' => $this->parsePrice($row['precio']),
                'bedrooms' => $this->parseInt($row['dormitorios']),
                'bathrooms' => $this->parseInt($row['banos']),
                'built_area_m2' => $isLand ? null : $this->parseInt($row['metros_cubiertos']),
                'lot_area_m2' => $this->parseInt($row['metros_del_terreno']),
                'year_built' => $this->parseYear($row['ano_de_construccion']),
                'featured' => trim($row['destacada']) === '1',
            ]);

            if ($coords) {
                $property->lat = $coords[0];
                $property->lng = $coords[1];
            }

            // Content + status only on first import so re-runs don't clobber edits.
            if ($isNew) {
                $property->status = $row['Status'] === 'publish' ? 'published' : 'draft';
                $property->title = ['es' => $title];
                $property->slug = ['es' => $slug];
                $description = $this->htmlToText($row['descripcion']);
                $property->description = $description ? ['es' => $description] : null;
            }

            $property->save();

            if ($withImages && $property->getMedia('images')->isEmpty()) {
                $this->downloadImages($property, $row, $imageCap);
            }

            $imported++;
            $this->line("[csv] {$code} | {$operation}/{$type} | {$neighborhoodSlug} | "
                .($property->price_usd ? 'USD '.number_format($property->price_usd) : 'Consultar')
                .' | '.($coords ? 'geo✓' : 'geo✗')
                .' | '.$property->getMedia('images')->count().' imgs'
                .' | '.$row['Status']);
        }

        $this->newLine();
        $this->info("Importadas/actualizadas: {$imported}");
        if ($skipped) {
            $this->warn('Omitidas: '.count($skipped));
            foreach (array_slice($skipped, 0, 15) as $s) {
                $this->line("  - {$s}");
            }
        }

        return self::SUCCESS;
    }

    /** Read the CSV (handles quoted multi-line description fields). */
    private function readCsv(string $path): array
    {
        $handle = fopen($path, 'r');
        $header = fgetcsv($handle);
        $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', $header[0]); // strip BOM

        $rows = [];
        while (($data = fgetcsv($handle)) !== false) {
            if (count($data) === 1 && $data[0] === null) {
                continue;
            }
            $rows[] = array_combine($header, array_pad($data, count($header), ''));
        }
        fclose($handle);

        return $rows;
    }

    /**
     * One row per property code. Prefer published, Spanish, with operation/type
     * set and the richest description.
     */
    private function dedupeByCode(array $rows): array
    {
        $best = [];
        $bestScore = [];

        foreach ($rows as $row) {
            $code = $this->codeOf($row);
            if (! $code) {
                continue;
            }

            $score = 0;
            $score += $row['Status'] === 'publish' ? 10000 : 0;
            $score += trim($row['Tipo de Operación']) !== '' ? 1000 : 0;
            $score += trim($row['Tipo de Propiedad']) !== '' ? 1000 : 0;
            $score += trim($row['precio']) !== '' ? 500 : 0;
            $score += trim($row['coordenadas']) !== '' ? 500 : 0;
            $score += $this->spanishScore($row['descripcion']) * 200;
            $score += min(strlen($row['descripcion']), 400);
            // Penalise rewrite/republish copies.
            $score -= trim($row['_dp_original']) !== '' ? 5000 : 0;

            if (! isset($bestScore[$code]) || $score > $bestScore[$code]) {
                $bestScore[$code] = $score;
                $best[$code] = $row;
            }
        }

        return $best;
    }

    private function codeOf(array $row): ?string
    {
        $ref = trim($row['referencia'] ?: $row['nombre_de_la_propiedad'] ?: $row['Title']);
        $ref = str_replace(' ', '', $ref);
        if (preg_match('/^([A-Za-z]+[0-9]+)/', $ref, $m)) {
            return strtoupper($m[1]);
        }

        return null;
    }

    /** Cheap Spanish-vs-other detector: +1 Spanish, -1 English/Portuguese. */
    private function spanishScore(string $html): int
    {
        $t = ' '.strtolower(strip_tags($html)).' ';
        $es = 0;
        foreach ([' con ', ' cuenta ', ' dormitorios', ' cocina', ' baño', ' living', ' jardín', ' piscina', ' del ', ' en el '] as $w) {
            $es += substr_count($t, $w);
        }
        $other = 0;
        foreach ([' the ', ' and ', ' with ', ' bedroom', ' kitchen', ' com ', ' quarto', ' cozinha', ' banheiro'] as $w) {
            $other += substr_count($t, $w);
        }

        return $es <=> $other;
    }

    private function resolveNeighborhood(string $zona): string
    {
        $hasGenericJi = false;
        foreach (explode('|', $zona) as $part) {
            $segments = explode('>', $part);
            $leaf = $this->norm(trim(end($segments)));
            if (isset(self::NEIGHBORHOOD_MAP[$leaf])) {
                return self::NEIGHBORHOOD_MAP[$leaf];
            }
            if ($leaf === 'jose ignacio') {
                $hasGenericJi = true;
            }
        }

        return $hasGenericJi ? self::GENERIC_JI_NEIGHBORHOOD : self::CATCH_ALL_NEIGHBORHOOD;
    }

    private function parseCoords(string $s): ?array
    {
        $s = trim(ltrim(trim($s), "'"));
        if (preg_match('/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/', $s, $m)) {
            $lat = (float) $m[1];
            $lng = (float) $m[2];
            // Uruguay sanity bounds.
            if ($lat > -36 && $lat < -33 && $lng > -56 && $lng < -53) {
                return [$lat, $lng];
            }
        }

        return null;
    }

    private function parsePrice(string $s): ?int
    {
        $s = preg_replace('/[^\d]/', '', trim($s)); // strip dots/commas/spaces
        if ($s === '' || (int) $s <= 0) {
            return null;
        }

        return (int) $s;
    }

    private function parseInt(string $s): ?int
    {
        $s = trim($s);
        if ($s === '' || ! is_numeric($s) || (int) $s < 0) {
            return null;
        }

        return (int) $s ?: null;
    }

    private function parseYear(string $s): ?int
    {
        $y = $this->parseInt($s);

        return ($y && $y > 1900 && $y <= (int) date('Y')) ? $y : null;
    }

    private function htmlToText(string $html): string
    {
        $text = preg_replace('/<\/(p|div|li|br|h[1-6])>/i', "\n", $html);
        $text = strip_tags($text);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace("/\n{3,}/", "\n\n", $text);

        return trim($text);
    }

    private function downloadImages(Property $property, array $row, int $cap): void
    {
        $ids = [];
        foreach ([$row['imagen_destacada_en_lista_de_propiedades'], $row['galeria_de_fotos']] as $field) {
            foreach (explode(',', $field) as $id) {
                $id = trim($id);
                if ($id !== '' && ctype_digit($id) && ! in_array($id, $ids, true)) {
                    $ids[] = $id;
                }
            }
        }

        $count = 0;
        foreach ($ids as $id) {
            if ($count >= $cap) {
                break;
            }
            $url = $this->resolveMediaUrl($id);
            if (! $url) {
                continue;
            }
            try {
                $property->addMediaFromUrl($url)->toMediaCollection('images');
                $count++;
            } catch (\Throwable $e) {
                // skip unreachable image
            }
        }
    }

    private function resolveMediaUrl(string $id): ?string
    {
        if (array_key_exists($id, $this->mediaUrlCache)) {
            return $this->mediaUrlCache[$id];
        }
        try {
            $res = Http::timeout(15)->get(self::MEDIA_ENDPOINT.$id, ['_fields' => 'source_url']);
            $url = $res->ok() ? ($res->json('source_url') ?: null) : null;
        } catch (\Throwable $e) {
            $url = null;
        }

        return $this->mediaUrlCache[$id] = $url;
    }

    private function norm(string $s): string
    {
        $s = mb_strtolower(trim($s));
        $s = strtr($s, ['á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ñ' => 'n']);

        return $s;
    }
}
