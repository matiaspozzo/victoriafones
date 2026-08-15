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
            'cards' => $setting->cards->map(fn ($card) => [
                'label' => $card->label,
                'link' => $card->link,
                'image' => $card->getFirstMediaUrl('image', 'card') ?: null,
            ]),
        ];
    }
}
