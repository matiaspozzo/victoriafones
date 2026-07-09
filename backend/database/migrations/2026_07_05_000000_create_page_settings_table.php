<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();       // venta, alquiler, nuestras-propiedades, quienes-somos, contacto
            $table->string('label')->nullable();   // admin-only human name
            $table->json('hero_title')->nullable();
            $table->json('hero_subtitle')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_settings');
    }
};
