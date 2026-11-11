<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Translatable\HasTranslations;

class Development extends Model implements HasMedia
{
    use HasTranslations, InteractsWithMedia;

    public array $translatable = [
        'title',
        'slug',
        'excerpt',
        'description',
        'seo_title',
        'seo_description',
        'amenity_groups',
        'masterplan_caption',
        'location_text',
    ];

    protected $fillable = [
        'status',
        'neighborhood_id',
        'lat',
        'lng',
        'order',
        'title',
        'slug',
        'excerpt',
        'description',
        'seo_title',
        'seo_description',
        'lots_total',
        'area_min_m2',
        'area_max_m2',
        'price_from_usd',
        'amenity_groups',
        'masterplan_caption',
        'location_text',
        'surfaces',
    ];

    protected $casts = [
        'surfaces' => 'array',
        'lat' => 'decimal:7',
        'lng' => 'decimal:7',
    ];

    public function neighborhood(): BelongsTo
    {
        return $this->belongsTo(Neighborhood::class);
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class)->orderBy('order');
    }

    public function lots(): HasMany
    {
        return $this->hasMany(DevelopmentLot::class)->orderBy('order')->orderBy('id');
    }

    /**
     * Summary used by the cards ("Lotes de X m² desde USD X"). Figures come
     * from the loaded lots (sold ones ignored); whatever the lots can't
     * provide falls back to the manual fields on the development itself. Needs
     * `lots` loaded to avoid N+1 queries.
     *
     * @return array{lots_count: ?int, area_min_m2: ?int, area_max_m2: ?int, price_from_usd: ?int}
     */
    public function lotSummary(): array
    {
        $open = $this->lots->where('status', '!=', 'sold');

        return [
            'lots_count' => $open->count() ?: $this->lots_total,
            'area_min_m2' => $open->min('area_m2') ?? $this->area_min_m2,
            'area_max_m2' => $open->max('area_m2') ?? $this->area_max_m2,
            'price_from_usd' => $open->whereNotNull('price_usd')->min('price_usd') ?? $this->price_from_usd,
        ];
    }

    public function registerMediaCollections(): void
    {
        // Photos: the first one is the cover on cards, all of them feed the
        // slider at the top of the detail page.
        $this->addMediaCollection('images');
        // Masterplan drawing (single image).
        $this->addMediaCollection('masterplan')->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->fit(Fit::Crop, 400, 300)
            ->format('webp')
            ->nonQueued();

        $this->addMediaConversion('card')
            ->fit(Fit::Crop, 800, 600)
            ->format('webp')
            ->performOnCollections('images')
            ->nonQueued();

        // Masterplans are drawings with fine text: never crop them.
        $this->addMediaConversion('full')
            ->fit(Fit::Max, 1920, 1920)
            ->format('webp')
            ->nonQueued();
    }
}
