<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = $request->attributes->get('locale', 'es');

        return [
            'id' => $this->id,
            'code' => $this->code,
            'operation' => $this->operation,
            'type' => $this->type,
            'neighborhood' => $this->whenLoaded('neighborhood', fn () => [
                'id' => $this->neighborhood->id,
                'slug' => $this->neighborhood->slug,
                'name' => $this->neighborhood->getTranslation('name', $locale, false) ?: $this->neighborhood->getTranslation('name', 'es'),
            ]),
            'price_usd' => $this->price_usd,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'built_area_m2' => $this->built_area_m2,
            'lot_area_m2' => $this->lot_area_m2,
            'year_built' => $this->year_built,
            'featured' => $this->featured,
            'title' => $this->getTranslation('title', $locale, false) ?: $this->getTranslation('title', 'es'),
            'slug' => $this->getTranslation('slug', $locale, false) ?: $this->getTranslation('slug', 'es'),
            'excerpt' => $this->getTranslation('excerpt', $locale, false) ?: $this->getTranslation('excerpt', 'es'),
            'cover_image' => $this->getFirstMediaUrl('images', 'card') ?: null,
            'lat' => $this->lat,
            'lng' => $this->lng,
        ];
    }
}
