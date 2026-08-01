<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Sitewide settings (currently: tracking scripts). Always exactly one row —
 * use SiteSetting::current() rather than querying the table directly.
 */
class SiteSetting extends Model
{
    protected $fillable = [
        'google_analytics_id',
        'facebook_pixel_id',
        'additional_scripts',
    ];

    public static function current(): self
    {
        return static::query()->firstOrCreate([]);
    }
}
