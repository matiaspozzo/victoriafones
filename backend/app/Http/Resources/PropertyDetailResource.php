<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = $request->attributes->get('locale', 'es');
        $t = fn (string $field) => $this->getTranslation($field, $locale, false) ?: $this->getTranslation($field, 'es');

        return [
            'id' => $this->id,
            'code' => $this->code,
            'status' => $this->status,
            'operation' => $this->operation,
            'type' => $this->type,
            'neighborhood' => $this->whenLoaded('neighborhood', fn () => [
                'id' => $this->neighborhood->id,
                'slug' => $this->neighborhood->slug,
                'name' => $this->neighborhood->getTranslation('name', $locale, false) ?: $this->neighborhood->getTranslation('name', 'es'),
                'parent' => $this->neighborhood->parent ? [
                    'slug' => $this->neighborhood->parent->slug,
                    'name' => $this->neighborhood->parent->getTranslation('name', $locale, false) ?: $this->neighborhood->parent->getTranslation('name', 'es'),
                ] : null,
            ]),
            'price_usd' => $this->price_usd,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'built_area_m2' => $this->built_area_m2,
            'lot_area_m2' => $this->lot_area_m2,
            'year_built' => $this->year_built,
            'featured' => $this->featured,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'title' => $t('title'),
            'slug' => $t('slug'),
            'excerpt' => $t('excerpt'),
            'description' => $t('description'),
            'seo_title' => $t('seo_title'),
            'seo_description' => $t('seo_description'),
            'images' => $this->getMedia('images')->map(fn ($media) => [
                'thumb' => $media->getUrl('thumb'),
                'card' => $media->getUrl('card'),
                'full' => $media->getUrl('full'),
            ])->values(),
            // Hero slider images; fall back to the first 3 gallery images.
            'hero_images' => ($this->getMedia('hero')->isNotEmpty()
                ? $this->getMedia('hero')
                : $this->getMedia('images')->take(3))
                ->map(fn ($media) => [
                    'thumb' => $media->getUrl('thumb'),
                    'card' => $media->getUrl('card'),
                    'full' => $media->getUrl('full'),
                ])->values(),
            'amenities' => AmenityResource::collection($this->whenLoaded('amenities')),
            'rental_prices' => $this->whenLoaded('rentalPrices', fn () => $this->rentalPrices->map(fn ($rp) => [
                'label' => $rp->getTranslation('label', $locale, false) ?: $rp->getTranslation('label', 'es'),
                'price_usd' => $rp->price_usd,
            ])),
        ];
    }
}
