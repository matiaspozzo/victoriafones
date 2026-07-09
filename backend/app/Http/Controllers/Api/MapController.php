<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\Request;

class MapController extends Controller
{
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
            $query->whereHas('neighborhood', fn ($q) => $q->where('slug', $request->string('neighborhood')));
        }

        if ($request->filled('bedrooms')) {
            $query->where('bedrooms', '>=', (int) $request->input('bedrooms'));
        }

        if ($request->filled('bathrooms')) {
            $query->where('bathrooms', '>=', (int) $request->input('bathrooms'));
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
}
