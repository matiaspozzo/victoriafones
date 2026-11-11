<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Card-level payload (listing page + home block). Expects `neighborhood`,
// `lots` and `media` eager loaded.
class DevelopmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = $request->attributes->get('locale', 'es');

        return [
            'id' => $this->id,
            'title' => $this->getTranslation('title', $locale, false) ?: $this->getTranslation('title', 'es'),
            'slug' => $this->getTranslation('slug', $locale, false) ?: $this->getTranslation('slug', 'es'),
            'excerpt' => $this->getTranslation('excerpt', $locale, false) ?: $this->getTranslation('excerpt', 'es'),
            'neighborhood' => $this->whenLoaded('neighborhood', fn () => $this->neighborhood ? [
                'id' => $this->neighborhood->id,
                'slug' => $this->neighborhood->slug,
                'name' => $this->neighborhood->getTranslation('name', $locale, false) ?: $this->neighborhood->getTranslation('name', 'es'),
            ] : null),
            ...$this->lotSummary(),
            'cover_image' => $this->getFirstMediaUrl('images', 'card') ?: null,
            'lat' => $this->lat,
            'lng' => $this->lng,
        ];
    }
}
