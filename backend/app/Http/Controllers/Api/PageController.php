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
                ],
            ];
        });
    }
}
