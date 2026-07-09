<?php

namespace Database\Seeders;

use App\Models\Neighborhood;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class NeighborhoodSeeder extends Seeder
{
    /**
     * Seed the tree: Punta del Este > José Ignacio > sub-zones, plus a top-level
     * "Otras Zonas". José Ignacio is the parent region (not a selectable category);
     * the town itself is "Pueblo José Ignacio" (slug "pueblo-jose-ignacio").
     */
    public function run(): void
    {
        $puntaDelEste = $this->create('Punta del Este', null);
        $joseIgnacio = $this->create('José Ignacio', $puntaDelEste->id);

        $subZones = [
            ['Pueblo José Ignacio', 'pueblo-jose-ignacio'],
            ['Club de Mar', 'club-de-mar'],
            ['Pinar del Faro', 'pinar-del-faro'],
            ['Laguna Escondida', 'laguna-escondida'],
            ['Alrededores', 'alrededores'],
        ];

        foreach ($subZones as $i => [$name, $slug]) {
            $this->create($name, $joseIgnacio->id, $i, $slug);
        }

        $this->create('Otras Zonas', null);
    }

    private function create(string $es, ?int $parentId, int $order = 0, ?string $slug = null): Neighborhood
    {
        return Neighborhood::create([
            'parent_id' => $parentId,
            'name' => ['es' => $es, 'en' => $es, 'pt' => $es],
            'slug' => $slug ?? Str::slug($es),
            'order' => $order,
        ]);
    }
}
