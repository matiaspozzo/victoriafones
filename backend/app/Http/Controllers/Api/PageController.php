<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PageSetting;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function index(Request $request)
    {
        $locale = $request->query('locale', 'es');

        return PageSetting::all()->mapWithKeys(function (PageSetting $page) use ($locale) {
            return [
                $page->key => [
                    'hero_title' => $page->getTranslation('hero_title', $locale, false)
                        ?: $page->getTranslation('hero_title', 'es', false),
                    'hero_subtitle' => $page->getTranslation('hero_subtitle', $locale, false)
                        ?: $page->getTranslation('hero_subtitle', 'es', false),
                    'hero_image' => [
                        'desktop' => $page->getFirstMediaUrl('hero', 'desktop') ?: null,
                        'mobile' => $page->getFirstMediaUrl('hero', 'mobile') ?: null,
                    ],
                    'navbar_style' => $page->navbar_style,
                    'rental_disabled' => $page->rental_disabled,
                    'rental_disabled_message' => $page->getTranslation('rental_disabled_message', $locale, false)
                        ?: $page->getTranslation('rental_disabled_message', 'es', false),
                    'about_title' => $page->getTranslation('about_title', $locale, false)
                        ?: $page->getTranslation('about_title', 'es', false),
                    'about_body' => $page->getTranslation('about_body', $locale, false)
                        ?: $page->getTranslation('about_body', 'es', false),
                    'zones_title' => $page->getTranslation('zones_title', $locale, false)
                        ?: $page->getTranslation('zones_title', 'es', false),
                ],
            ];
        });
    }
}
