<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Translatable\HasTranslations;

class Neighborhood extends Model implements HasMedia
{
    use HasTranslations, InteractsWithMedia;

    public array $translatable = ['name', 'description', 'seo_title', 'seo_description'];

    protected $fillable = [
        'parent_id',
        'name',
        'description',
        'seo_title',
        'seo_description',
        'slug',
        'center_lat',
        'center_lng',
        'polygon',
        'order',
    ];

    protected $casts = [
        'polygon' => 'array',
        'center_lat' => 'decimal:7',
        'center_lng' => 'decimal:7',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Neighborhood::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Neighborhood::class, 'parent_id')->orderBy('order');
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }

    public function registerMediaCollections(): void
    {
        // Background photo behind the zone listing page's title (single image).
        $this->addMediaCollection('hero')->singleFile();
        // Social-share preview image (single image) — separate from the hero
        // since Open Graph wants a fixed 1200x630 crop, not a 16:9/portrait pair.
        $this->addMediaCollection('og_image')->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        // Same target sizes/reasoning as PageSetting's hero — see that model.
        $this->addMediaConversion('desktop')
            ->fit(Fit::Crop, 1920, 1080)
            ->format('webp')
            ->performOnCollections('hero')
            ->nonQueued();

        $this->addMediaConversion('mobile')
            ->fit(Fit::Crop, 828, 1104)
            ->format('webp')
            ->performOnCollections('hero')
            ->nonQueued();

        // Standard Open Graph size. JPG rather than WebP — some link-preview
        // crawlers (WhatsApp, older Facebook scrapers) have spotty WebP support.
        $this->addMediaConversion('og')
            ->fit(Fit::Crop, 1200, 630)
            ->format('jpg')
            ->performOnCollections('og_image')
            ->nonQueued();
    }
}
