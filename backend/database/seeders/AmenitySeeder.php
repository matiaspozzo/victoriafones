<?php

namespace Database\Seeders;

use App\Models\Amenity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AmenitySeeder extends Seeder
{
    public function run(): void
    {
        $amenities = [
            ['es' => 'Piscina', 'en' => 'Pool', 'pt' => 'Piscina', 'icon' => 'pool'],
            ['es' => 'Parrillero', 'en' => 'Barbecue', 'pt' => 'Churrasqueira', 'icon' => 'grill'],
            ['es' => 'Dependencia', 'en' => 'Staff quarters', 'pt' => 'Dependência', 'icon' => 'home'],
            ['es' => 'Vista al mar', 'en' => 'Ocean view', 'pt' => 'Vista para o mar', 'icon' => 'waves'],
            ['es' => 'Vista a la laguna', 'en' => 'Lagoon view', 'pt' => 'Vista para a laguna', 'icon' => 'waves'],
            ['es' => 'Cochera', 'en' => 'Garage', 'pt' => 'Garagem', 'icon' => 'car'],
            ['es' => 'Jardín', 'en' => 'Garden', 'pt' => 'Jardim', 'icon' => 'tree'],
            ['es' => 'Seguridad 24hs', 'en' => '24h security', 'pt' => 'Segurança 24h', 'icon' => 'shield'],
            ['es' => 'Aire acondicionado', 'en' => 'Air conditioning', 'pt' => 'Ar condicionado', 'icon' => 'wind'],
            ['es' => 'Calefacción', 'en' => 'Heating', 'pt' => 'Aquecimento', 'icon' => 'flame'],
            ['es' => 'Amoblado', 'en' => 'Furnished', 'pt' => 'Mobiliado', 'icon' => 'sofa'],
            ['es' => 'WiFi', 'en' => 'WiFi', 'pt' => 'WiFi', 'icon' => 'wifi'],
        ];

        foreach ($amenities as $i => $amenity) {
            Amenity::create([
                'name' => ['es' => $amenity['es'], 'en' => $amenity['en'], 'pt' => $amenity['pt']],
                'slug' => Str::slug($amenity['en']),
                'icon' => $amenity['icon'],
                'order' => $i,
            ]);
        }
    }
}
