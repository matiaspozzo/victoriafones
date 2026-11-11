<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DevelopmentDetailResource;
use App\Http\Resources\DevelopmentResource;
use App\Models\Development;
use Illuminate\Http\Request;

class DevelopmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Development::query()
            ->where('status', 'published')
            ->with(['neighborhood', 'lots', 'media'])
            ->orderBy('order')
            ->orderBy('id');

        if ($request->filled('limit')) {
            $query->limit(min((int) $request->input('limit'), 50));
        }

        return DevelopmentResource::collection($query->get());
    }

    public function show(Request $request, string $slug)
    {
        $locale = $request->attributes->get('locale', 'es');

        // Same lookup rule as properties: requested locale first, then any
        // locale's slug, since slugs may not be translated everywhere yet.
        $development = Development::query()
            ->where('status', 'published')
            ->where(function ($query) use ($locale, $slug) {
                $query->where("slug->{$locale}", $slug);

                foreach (['es', 'en', 'pt'] as $fallbackLocale) {
                    $query->orWhere("slug->{$fallbackLocale}", $slug);
                }
            })
            ->with(['neighborhood', 'lots', 'amenities', 'media'])
            ->firstOrFail();

        return new DevelopmentDetailResource($development);
    }
}
