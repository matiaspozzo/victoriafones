<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * One photo card in the home page's "Propiedades en Venta por Zona" grid —
 * label + link + its own image. `link` is a path the frontend renders as-is
 * (e.g. "/propiedades-en-venta/club-de-mar"); when it matches a known
 * zone-listing pattern the frontend re-resolves it through next-intl's
 * per-locale routing instead of using it verbatim, so the same link works
 * correctly across es/en/pt despite each locale having its own URL segment
 * (see frontend's NeighborhoodGrid.tsx).
 */
class HomeZoneCard extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = ['home_setting_id', 'label', 'link', 'order'];

    public function homeSetting(): BelongsTo
    {
        return $this->belongsTo(HomeSetting::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('image')->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        // Card is aspect-video (16:9) in a 2-column grid inside a max-w-7xl
        // section — roughly 600px wide at desktop, so 1200 covers it at 2x.
        $this->addMediaConversion('card')
            ->fit(Fit::Crop, 1200, 675)
            ->format('webp')
            ->nonQueued();
    }
}
