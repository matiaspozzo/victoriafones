<?php

use App\Models\Amenity;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Str;

// Adds the amenities typical of a gated development (loteo) to the shared
// catalog. Idempotent: skips any whose slug already exists. Editors can add
// more from the development form.
return new class extends Migration
{
    public function up(): void
    {
        $amenities = [
            ['es' => 'Club house', 'en' => 'Club house', 'pt' => 'Club house', 'icon' => 'home'],
            ['es' => 'Gimnasio', 'en' => 'Gym', 'pt' => 'Academia', 'icon' => 'dumbbell'],
            ['es' => 'Spa', 'en' => 'Spa', 'pt' => 'Spa', 'icon' => 'spa'],
            ['es' => 'Cancha de tenis', 'en' => 'Tennis court', 'pt' => 'Quadra de tênis', 'icon' => 'tennis'],
            ['es' => 'Cancha de pádel', 'en' => 'Padel court', 'pt' => 'Quadra de padel', 'icon' => 'tennis'],
            ['es' => 'Cancha de golf', 'en' => 'Golf course', 'pt' => 'Campo de golfe', 'icon' => 'golf'],
            ['es' => 'Polo', 'en' => 'Polo field', 'pt' => 'Campo de polo', 'icon' => 'horse'],
            ['es' => 'Acceso a la playa', 'en' => 'Beach access', 'pt' => 'Acesso à praia', 'icon' => 'waves'],
            ['es' => 'Senderos', 'en' => 'Walking trails', 'pt' => 'Trilhas', 'icon' => 'tree'],
            ['es' => 'Espacios verdes', 'en' => 'Green areas', 'pt' => 'Áreas verdes', 'icon' => 'tree'],
            ['es' => 'Portería', 'en' => 'Gatehouse', 'pt' => 'Portaria', 'icon' => 'shield'],
            ['es' => 'Calles pavimentadas', 'en' => 'Paved roads', 'pt' => 'Ruas pavimentadas', 'icon' => 'road'],
            ['es' => 'Energía eléctrica', 'en' => 'Electricity', 'pt' => 'Energia elétrica', 'icon' => 'bolt'],
            ['es' => 'Agua corriente', 'en' => 'Running water', 'pt' => 'Água corrente', 'icon' => 'droplet'],
            ['es' => 'Fibra óptica', 'en' => 'Fiber optic internet', 'pt' => 'Fibra óptica', 'icon' => 'wifi'],
            ['es' => 'Marina', 'en' => 'Marina', 'pt' => 'Marina', 'icon' => 'anchor'],
            ['es' => 'Restaurante', 'en' => 'Restaurant', 'pt' => 'Restaurante', 'icon' => 'utensils'],
            ['es' => 'Área de juegos para niños', 'en' => "Children's play area", 'pt' => 'Área de recreação infantil', 'icon' => 'smile'],
        ];

        $order = (int) Amenity::query()->max('order');

        foreach ($amenities as $amenity) {
            $slug = Str::slug($amenity['en']);

            if (Amenity::query()->where('slug', $slug)->exists()) {
                continue;
            }

            Amenity::create([
                'name' => ['es' => $amenity['es'], 'en' => $amenity['en'], 'pt' => $amenity['pt']],
                'slug' => $slug,
                'icon' => $amenity['icon'],
                'order' => ++$order,
            ]);
        }
    }

    public function down(): void
    {
        // Intentionally a no-op: the amenities may be attached to records by now.
    }
};
