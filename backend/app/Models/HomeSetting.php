<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

/**
 * Editable content for the home page's "about" section + zone-cards heading.
 * Always exactly one row — use HomeSetting::current() rather than querying
 * the table directly. The zone cards themselves are a separate related model
 * (HomeZoneCard, each with its own photo + link) — see that model.
 */
class HomeSetting extends Model
{
    use HasTranslations;

    public array $translatable = ['about_title', 'about_body', 'zones_title', 'seo_title', 'seo_description'];

    protected $fillable = ['about_title', 'about_body', 'zones_title', 'seo_title', 'seo_description'];

    public function cards(): HasMany
    {
        return $this->hasMany(HomeZoneCard::class)->orderBy('order');
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate([]);
    }
}
