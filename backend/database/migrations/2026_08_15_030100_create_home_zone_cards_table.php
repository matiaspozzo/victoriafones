<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The photo cards in the home page's "Propiedades en Venta por Zona"
        // section. label/link are plain (not translatable) — these are place
        // names and internal paths, the same across es/en/pt, matching how
        // Neighborhood zone slugs already work sitewide.
        Schema::create('home_zone_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('home_setting_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->string('link');
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('home_zone_cards');
    }
};
