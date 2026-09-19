<?php

namespace Database\Seeders;

use App\Models\HomeZoneCard;
use App\Models\Neighborhood;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AlrededoresSubzonesSeeder extends Seeder
{
    /**
     * Client request (Victoria Fones, 2026-09-14): rename the "Alrededores"
     * zone to "Alrededores Casco José Ignacio" and split it into named
     * sub-zones properties can be tagged with internally, without adding new
     * Home buttons. Idempotent — safe to re-run in production.
     */
    private const SUBZONES = [
        'La Juanita',
        'Santa Mónica',
        'Village del Faro',
        'Arenas de José Ignacio',
        'Chacras de José Ignacio',
        'Aqua',
        'Las Portuguesas',
        'Playa Brava',
        'Dunas',
        'La Morenita',
        'Amara Golf',
        'Godai Reserve',
        'Vilarenas',
        'Nativo',
        'The Collette Farm',
        'Punta Polo',
    ];

    public function run(): void
    {
        $alrededores = Neighborhood::where('slug', 'alrededores')->first();

        if (! $alrededores) {
            $this->command?->warn('Neighborhood "alrededores" not found — run NeighborhoodSeeder first.');

            return;
        }

        foreach (['es', 'en', 'pt'] as $locale) {
            $alrededores->setTranslation('name', $locale, 'Alrededores Casco José Ignacio');
        }
        $alrededores->save();

        foreach (self::SUBZONES as $i => $name) {
            Neighborhood::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'parent_id' => $alrededores->id,
                    'name' => ['es' => $name, 'en' => $name, 'pt' => $name],
                    'order' => $i,
                ],
            );
        }

        // Fresh installs already seed the Home card with the final name (see
        // HomeSettingSeeder); this only matters for production, which seeded
        // it under the old "Alrededores" label before this rename.
        HomeZoneCard::where('link', 'LIKE', '%/alrededores')
            ->update(['label' => 'Alrededores Casco José Ignacio']);
    }
}
