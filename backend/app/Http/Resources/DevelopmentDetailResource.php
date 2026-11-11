<?php

namespace App\Http\Resources;

use App\Support\HtmlSanitizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DevelopmentDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = $request->attributes->get('locale', 'es');
        $t = fn (string $field) => $this->getTranslation($field, $locale, false) ?: $this->getTranslation($field, 'es');
        $image = fn ($media) => [
            'thumb' => $media->getUrl('thumb'),
            'card' => $media->getUrl('card'),
            'full' => $media->getUrl('full'),
        ];

        return [
            'id' => $this->id,
            'title' => $t('title'),
            'slug' => $t('slug'),
            'excerpt' => $t('excerpt'),
            // RichEditor HTML, rendered with dangerouslySetInnerHTML — sanitize.
            'description' => HtmlSanitizer::clean($t('description')),
            'seo_title' => $t('seo_title'),
            'seo_description' => $t('seo_description'),
            'masterplan_caption' => $t('masterplan_caption') ?: null,
            'location_text' => $t('location_text') ?: null,
            'neighborhood' => $this->whenLoaded('neighborhood', fn () => $this->neighborhood ? [
                'id' => $this->neighborhood->id,
                'slug' => $this->neighborhood->slug,
                'name' => $this->neighborhood->getTranslation('name', $locale, false) ?: $this->neighborhood->getTranslation('name', 'es'),
            ] : null),
            ...$this->lotSummary(),
            // Every lot (sold ones included, flagged by `status`) for the
            // public lots table on the detail page.
            'lots' => $this->lots->map(fn ($lot) => [
                'id' => $lot->id,
                'label' => $lot->label,
                'area_m2' => $lot->area_m2,
                'price_usd' => $lot->price_usd,
                'status' => $lot->status,
            ])->values(),
            'lat' => $this->lat,
            'lng' => $this->lng,
            'images' => $this->getMedia('images')->map($image)->values(),
            'masterplan' => ($m = $this->getFirstMedia('masterplan')) ? $image($m) : null,
            'amenity_groups' => $this->amenityGroups($locale),
            'surfaces' => $this->surfaceRows($locale),
            'amenities' => AmenityResource::collection($this->whenLoaded('amenities')),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /** @return array<int, array{title: string, items: array<int, string>}> */
    private function amenityGroups(string $locale): array
    {
        $groups = $this->getTranslation('amenity_groups', $locale, false) ?: $this->getTranslation('amenity_groups', 'es');

        return collect(is_array($groups) ? $groups : [])
            ->map(fn ($group) => [
                'title' => (string) ($group['title'] ?? ''),
                'items' => collect($group['items'] ?? [])->filter()->values()->all(),
            ])
            ->filter(fn ($group) => $group['title'] !== '' || $group['items'] !== [])
            ->values()
            ->all();
    }

    /** @return array<int, array{label: string, m2: int, is_total: bool}> */
    private function surfaceRows(string $locale): array
    {
        return collect($this->surfaces ?? [])
            ->map(fn ($row) => [
                'label' => (string) (($row['label_'.$locale] ?? '') ?: ($row['label_es'] ?? '')),
                'm2' => (int) ($row['m2'] ?? 0),
                'is_total' => (bool) ($row['is_total'] ?? false),
            ])
            ->filter(fn ($row) => $row['label'] !== '')
            ->values()
            ->all();
    }
}
