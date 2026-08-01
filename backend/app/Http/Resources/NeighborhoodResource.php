<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NeighborhoodResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = $request->attributes->get('locale', 'es');

        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'slug' => $this->slug,
            'name' => $this->getTranslation('name', $locale, false) ?: $this->getTranslation('name', 'es'),
            'description' => $this->getTranslation('description', $locale, false) ?: $this->getTranslation('description', 'es', false),
            'hero_image' => [
                'desktop' => $this->getFirstMediaUrl('hero', 'desktop') ?: null,
                'mobile' => $this->getFirstMediaUrl('hero', 'mobile') ?: null,
            ],
            'center_lat' => $this->center_lat,
            'center_lng' => $this->center_lng,
            'children' => NeighborhoodResource::collection($this->whenLoaded('children')),
        ];
    }
}
