<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeSetting;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $locale = $request->query('locale', 'es');
        $setting = HomeSetting::current();

        return [
            'about_title' => $setting->getTranslation('about_title', $locale, false)
                ?: $setting->getTranslation('about_title', 'es', false),
            'about_body' => $setting->getTranslation('about_body', $locale, false)
                ?: $setting->getTranslation('about_body', 'es', false),
            'zones_title' => $setting->getTranslation('zones_title', $locale, false)
                ?: $setting->getTranslation('zones_title', 'es', false),
            'seo_title' => $setting->getTranslation('seo_title', $locale, false)
                ?: $setting->getTranslation('seo_title', 'es', false),
            'seo_description' => $setting->getTranslation('seo_description', $locale, false)
                ?: $setting->getTranslation('seo_description', 'es', false),
            'cards' => $setting->cards->map(fn ($card) => [
                'label' => $card->label,
                'link' => $card->link,
                'image' => $card->getFirstMediaUrl('image', 'card') ?: null,
            ]),
        ];
    }
}
