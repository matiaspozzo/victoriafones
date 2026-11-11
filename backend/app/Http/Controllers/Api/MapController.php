<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Development;
use App\Models\Neighborhood;
use App\Models\Property;
use Illuminate\Http\Request;

class MapController extends Controller
{
    // Same exact-match-except-the-top-option rule as PropertyController —
    // matches PropertyFilters.tsx's BEDROOMS/BATHROOMS = [1,2,3,4,5] arrays.
    private const MAX_ROOMS_FILTER = 5;

    public function properties(Request $request)
    {
        $locale = $request->attributes->get('locale', 'es');

        $query = Property::query()
            ->where('status', 'published')
            ->whereNotNull('lat')
            ->whereNotNull('lng')
            ->with('neighborhood');

        if ($request->filled('operation')) {
            $query->where(function ($q) use ($request) {
                $q->where('operation', $request->string('operation'))
                    ->orWhere('operation', 'sale_and_rent');
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        if ($request->filled('neighborhood')) {
            $slugs = Neighborhood::slugWithDescendants($request->string('neighborhood'));
            $query->whereHas('neighborhood', fn ($q) => $q->whereIn('slug', $slugs));
        }

        if ($request->filled('bedrooms')) {
            $bedrooms = (int) $request->input('bedrooms');
            $query->where('bedrooms', $bedrooms >= self::MAX_ROOMS_FILTER ? '>=' : '=', $bedrooms);
        }

        if ($request->filled('bathrooms')) {
            $bathrooms = (int) $request->input('bathrooms');
            $query->where('bathrooms', $bathrooms >= self::MAX_ROOMS_FILTER ? '>=' : '=', $bathrooms);
        }

        if ($request->filled('price_min')) {
            $query->where('price_usd', '>=', (int) $request->input('price_min'));
        }

        if ($request->filled('price_max')) {
            $query->where('price_usd', '<=', (int) $request->input('price_max'));
        }

        $features = $query->get()->map(function (Property $property) use ($locale) {
            return [
                'type' => 'Feature',
                'geometry' => [
                    'type' => 'Point',
                    'coordinates' => [(float) $property->lng, (float) $property->lat],
                ],
                'properties' => [
                    'id' => $property->id,
                    'code' => $property->code,
                    'title' => $property->getTranslation('title', $locale, false) ?: $property->getTranslation('title', 'es'),
                    'slug' => $property->getTranslation('slug', $locale, false) ?: $property->getTranslation('slug', 'es'),
                    'operation' => $property->operation,
                    'type' => $property->type,
                    'price_usd' => $property->price_usd,
                    'bedrooms' => $property->bedrooms,
                    'bathrooms' => $property->bathrooms,
                    'built_area_m2' => $property->built_area_m2,
                    'lot_area_m2' => $property->lot_area_m2,
                    'year_built' => $property->year_built,
                    'cover_image' => $property->getFirstMediaUrl('images', 'thumb') ?: null,
                    'neighborhood' => $property->neighborhood?->getTranslation('name', $locale, false) ?: $property->neighborhood?->getTranslation('name', 'es'),
                ],
            ];
        });

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features,
        ]);
    }

    public function developments(Request $request)
    {
        $locale = $request->attributes->get('locale', 'es');

        $query = Development::query()
            ->where('status', 'published')
            ->whereNotNull('lat')
            ->whereNotNull('lng')
            ->with(['neighborhood', 'lots', 'media'])
            ->orderBy('order');

        if ($request->filled('neighborhood')) {
            $slugs = Neighborhood::slugWithDescendants($request->string('neighborhood'));
            $query->whereHas('neighborhood', fn ($q) => $q->whereIn('slug', $slugs));
        }

        // Price filters match against the cheapest open lot ("desde USD X").
        $priceMin = $request->filled('price_min') ? (int) $request->input('price_min') : null;
        $priceMax = $request->filled('price_max') ? (int) $request->input('price_max') : null;

        $features = $query->get()
            ->filter(function (Development $development) use ($priceMin, $priceMax) {
                if ($priceMin === null && $priceMax === null) {
                    return true;
                }

                $from = $development->lotSummary()['price_from_usd'];

                return $from !== null
                    && ($priceMin === null || $from >= $priceMin)
                    && ($priceMax === null || $from <= $priceMax);
            })
            ->values()
            ->map(function (Development $development) use ($locale) {
                return [
                    'type' => 'Feature',
                    'geometry' => [
                        'type' => 'Point',
                        'coordinates' => [(float) $development->lng, (float) $development->lat],
                    ],
                    'properties' => [
                        'id' => $development->id,
                        'kind' => 'development',
                        'title' => $development->getTranslation('title', $locale, false) ?: $development->getTranslation('title', 'es'),
                        'slug' => $development->getTranslation('slug', $locale, false) ?: $development->getTranslation('slug', 'es'),
                        ...$development->lotSummary(),
                        'cover_image' => $development->getFirstMediaUrl('images', 'thumb') ?: null,
                        'neighborhood' => $development->neighborhood?->getTranslation('name', $locale, false) ?: $development->neighborhood?->getTranslation('name', 'es'),
                    ],
                ];
            });

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features,
        ]);
    }

    // Neighborhoods flagged `show_on_map`: their drawn area (Polygon features)
    // plus one Point per neighborhood carrying the name label.
    public function neighborhoods(Request $request)
    {
        $locale = $request->attributes->get('locale', 'es');
        $features = [];

        Neighborhood::query()->where('show_on_map', true)->orderBy('order')->get()
            ->each(function (Neighborhood $n) use ($locale, &$features) {
                $name = $n->getTranslation('name', $locale, false) ?: $n->getTranslation('name', 'es');
                $polygons = collect($n->polygon['features'] ?? [])
                    ->filter(fn ($f) => in_array($f['geometry']['type'] ?? null, ['Polygon', 'MultiPolygon'], true));

                foreach ($polygons as $polygon) {
                    $features[] = [
                        'type' => 'Feature',
                        'geometry' => $polygon['geometry'],
                        'properties' => ['kind' => 'area', 'slug' => $n->slug, 'name' => $name],
                    ];
                }

                $label = $this->labelPoint($n, $polygons->first()['geometry'] ?? null);

                if ($label) {
                    $features[] = [
                        'type' => 'Feature',
                        'geometry' => ['type' => 'Point', 'coordinates' => $label],
                        'properties' => ['kind' => 'label', 'slug' => $n->slug, 'name' => $name],
                    ];
                }
            });

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features,
        ]);
    }

    /** [lng, lat] for the name label: explicit center, else polygon vertex average. */
    private function labelPoint(Neighborhood $n, ?array $geometry): ?array
    {
        if ($n->center_lat && $n->center_lng) {
            return [(float) $n->center_lng, (float) $n->center_lat];
        }

        $ring = ($geometry['type'] ?? null) === 'Polygon'
            ? ($geometry['coordinates'][0] ?? [])
            : ($geometry['coordinates'][0][0] ?? []);

        if (count($ring) < 3) {
            return null;
        }

        $ring = array_slice($ring, 0, -1); // closing vertex repeats the first one

        return [
            array_sum(array_column($ring, 0)) / count($ring),
            array_sum(array_column($ring, 1)) / count($ring),
        ];
    }
}
