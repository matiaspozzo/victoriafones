<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    /**
     * Seeded with the tracking IDs actually live on victoriafones.com today
     * (checked directly in its page source, 2026-08-01) — not placeholders.
     */
    public function run(): void
    {
        $setting = SiteSetting::current();

        if (! $setting->google_analytics_id && ! $setting->facebook_pixel_id) {
            $setting->update([
                'google_analytics_id' => 'G-8MKR9DN3SX',
                'facebook_pixel_id' => '589092864052249',
            ]);
        }
    }
}
