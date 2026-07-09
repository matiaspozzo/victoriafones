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

class Property extends Model implements HasMedia
{
    use HasTranslations, InteractsWithMedia;

    public array $translatable = [
        'title',
        'slug',
        'excerpt',
        'description',
        'seo_title',
        'seo_description',
    ];

    protected $fillable = [
        'code',
        'status',
        'operation',
        'type',
        'neighborhood_id',
        'price_usd',
        'bedrooms',
        'bathrooms',
        'built_area_m2',
        'lot_area_m2',
        'year_built',
        'lat',
        'lng',
        'featured',
        'title',
        'slug',
        'excerpt',
        'description',
        'seo_title',
        'seo_description',
    ];

    protected $casts = [
        'lat' => 'decimal:7',
        'lng' => 'decimal:7',
        'featured' => 'boolean',
    ];

    public function neighborhood(): BelongsTo
    {
        return $this->belongsTo(Neighborhood::class);
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class);
    }

    public function rentalPrices(): HasMany
    {
        return $this->hasMany(RentalPrice::class)->orderBy('order');
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    public function registerMediaCollections(): void
    {
        // Hero = the slider at the top of the detail page (up to 3).
        $this->addMediaCollection('hero');
        // Gallery = all the property photos.
        $this->addMediaCollection('images');
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->fit(Fit::Crop, 400, 300)
            ->nonQueued();

        $this->addMediaConversion('card')
            ->fit(Fit::Crop, 800, 600)
            ->nonQueued();

        $this->addMediaConversion('full')
            ->fit(Fit::Max, 1920, 1920)
            ->nonQueued();
    }
}
