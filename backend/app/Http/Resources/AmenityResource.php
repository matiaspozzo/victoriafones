<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AmenityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = $request->attributes->get('locale', 'es');

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'icon' => $this->icon,
            'name' => $this->getTranslation('name', $locale, false) ?: $this->getTranslation('name', 'es'),
        ];
    }
}
