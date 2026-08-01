<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;

class SiteSettingController extends Controller
{
    public function index()
    {
        $setting = SiteSetting::current();

        return [
            'google_analytics_id' => $setting->google_analytics_id,
            'facebook_pixel_id' => $setting->facebook_pixel_id,
            'additional_scripts' => $setting->additional_scripts,
        ];
    }
}
