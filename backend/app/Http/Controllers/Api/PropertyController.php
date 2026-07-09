<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyDetailResource;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function index(Request $request)
    {
        // Base query: everything except the price range + sort. The price
        // slider bounds are derived from this, so they stay stable as the
        // user narrows the range.
        $base = Property::query()->where('status', 'published');

        if ($request->filled('operation')) {
            $base->where(function ($q) use ($request) {
                $q->where('operation', $request->string('operation'))
                    ->orWhere('operation', 'sale_and_rent');
            });
        }

        if ($request->filled('type')) {
            $base->where('type', $request->string('type'));
        }

        if ($request->filled('neighborhood')) {
            $base->whereHas('neighborhood', fn ($q) => $q->where('slug', $request->string('neighborhood')));
        }

        if ($request->filled('bedrooms')) {
            $base->where('bedrooms', '>=', (int) $request->input('bedrooms'));
        }

        if ($request->filled('bathrooms')) {
            $base->where('bathrooms', '>=', (int) $request->input('bathrooms'));
        }

        if ($request->boolean('featured')) {
            $base->where('featured', true);
        }

        $priceBounds = [
            'min' => (int) (clone $base)->min('price_usd'),
            'max' => (int) (clone $base)->max('price_usd'),
        ];

        $query = $base->with('neighborhood');

        if ($request->filled('price_min')) {
            $query->where('price_usd', '>=', (int) $request->input('price_min'));
        }

        if ($request->filled('price_max')) {
            $query->where('price_usd', '<=', (int) $request->input('price_max'));
        }

        // Sort: NULL prices ("Consultar") always sink to the bottom.
        match ($request->string('sort')->value()) {
            'price_asc' => $query->orderByRaw('price_usd IS NULL, price_usd asc'),
            'price_desc' => $query->orderByRaw('price_usd IS NULL, price_usd desc'),
            default => $query->latest(),
        };

        $properties = $query->paginate((int) $request->input('per_page', 12))->withQueryString();

        return PropertyResource::collection($properties)
            ->additional(['price_bounds' => $priceBounds]);
    }

    public function show(Request $request, string $slug)
    {
        $locale = $request->attributes->get('locale', 'es');

        // Slugs may not be translated into every locale yet, so match the
        // requested locale first but fall back to any locale's slug value
        // (properties are keyed by a single canonical URL regardless).
        $property = Property::query()
            ->where('status', 'published')
            ->where(function ($query) use ($locale, $slug) {
                $query->where("slug->{$locale}", $slug);

                foreach (['es', 'en', 'pt'] as $fallbackLocale) {
                    $query->orWhere("slug->{$fallbackLocale}", $slug);
                }
            })
            ->with(['neighborhood.parent', 'amenities', 'rentalPrices'])
            ->firstOrFail();

        return new PropertyDetailResource($property);
    }
}
