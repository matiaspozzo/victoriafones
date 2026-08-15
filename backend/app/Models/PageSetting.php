<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Translatable\HasTranslations;

class PageSetting extends Model implements HasMedia
{
    use HasTranslations, InteractsWithMedia;

    public array $translatable = ['hero_title', 'hero_subtitle', 'rental_disabled_message'];

    protected $fillable = [
        'key',
        'label',
        'hero_title',
        'hero_subtitle',
        'navbar_style',
        'rental_disabled',
        'rental_disabled_message',
    ];

    protected $casts = [
        'rental_disabled' => 'boolean',
    ];

    public function registerMediaCollections(): void
    {
        // Background photo behind the page's title (single image).
        $this->addMediaCollection('hero')->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        // Section is h-[60vh] w-full, full-bleed. 1920 covers the full width
        // at common desktop viewports; 1080 tall covers 60vh up to a ~1800px-tall
        // (i.e. very large) screen without excessive cropping.
        $this->addMediaConversion('desktop')
            ->fit(Fit::Crop, 1920, 1080)
            ->format('webp')
            ->nonQueued();

        // Mobile viewports are narrow (~375-430px) but 60vh is still tall relative
        // to that width, so the visible crop is closer to portrait (~3:4) than the
        // desktop's landscape crop — a plain downscale of the desktop crop would
        // lose too much of a landscape photo's subject.
        $this->addMediaConversion('mobile')
            ->fit(Fit::Crop, 828, 1104)
            ->format('webp')
            ->nonQueued();
    }
}
