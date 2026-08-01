<?php

namespace App\Filament\Widgets;

use App\Models\Lead;
use App\Models\Neighborhood;
use App\Models\Property;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

/**
 * Tracking dashboard using data this app actually has (leads, content/SEO
 * completeness). Real traffic metrics (impressions, clicks, CTR, sessions)
 * live in Google Analytics/Search Console, not here — showing those would
 * need the Google Analytics Data API + Search Console API wired up with a
 * service account that has access to the actual properties, which nobody
 * has requested/configured yet.
 */
class SeoStatsWidget extends BaseWidget
{
    protected function getStats(): array
    {
        $published = Property::where('status', 'published')->get();
        $publishedTotal = $published->count();
        $withManualSeo = $published
            ->filter(fn (Property $p) => filled($p->getTranslation('seo_description', 'es', false)))
            ->count();

        $leafZones = Neighborhood::whereDoesntHave('children')->get();
        $zoneCount = $leafZones->count();
        $zonesWithDescription = $leafZones
            ->filter(fn (Neighborhood $n) => filled($n->getTranslation('description', 'es', false)))
            ->count();
        $zonesWithSeo = $leafZones
            ->filter(fn (Neighborhood $n) => filled($n->getTranslation('seo_description', 'es', false)))
            ->count();

        $leadsTotal = Lead::count();
        $leads30d = Lead::where('created_at', '>=', now()->subDays(30))->count();

        return [
            Stat::make('Fichas con meta description propia', "{$withManualSeo} / {$publishedTotal}")
                ->description($publishedTotal > 0
                    ? 'El resto usa una descripción generada automáticamente (zona, tipo, precio)'
                    : 'Sin propiedades publicadas')
                ->color($withManualSeo > 0 ? 'success' : 'warning'),
            Stat::make('Barrios con descripción propia', "{$zonesWithDescription} / {$zoneCount}")
                ->description('Bloque título + descripción en la página de cada zona'),
            Stat::make('Barrios con SEO propio', "{$zonesWithSeo} / {$zoneCount}")
                ->description('SEO title, description e imagen para compartir (OG)'),
            Stat::make('Consultas recibidas', $leadsTotal)
                ->description("{$leads30d} en los últimos 30 días")
                ->color($leadsTotal > 0 ? 'success' : 'gray'),
        ];
    }
}
