<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('home_settings', function (Blueprint $table) {
            $table->json('seo_title')->nullable()->after('zones_title');
            $table->json('seo_description')->nullable()->after('seo_title');
        });

        // HomeSettingSeeder's "only fill in on first run" guard checks
        // about_title's blankness — already non-blank on any install that's
        // run it before today, so it won't backfill these two new columns.
        // Set them here instead, in the migration, so it happens exactly
        // once regardless of seeder history. Matches what was previously
        // hardcoded as Home.metaTitle/metaDescription in messages.json.
        DB::table('home_settings')->update([
            'seo_title' => json_encode([
                'es' => 'Propiedades en Venta, Alquiler y Administración en José Ignacio | Victoria Fones Real Estate',
                'en' => 'Properties for Sale, Rent and Management in José Ignacio | Victoria Fones Real Estate',
                'pt' => 'Imóveis à Venda, Aluguel e Administração em José Ignacio | Victoria Fones Real Estate',
            ]),
            'seo_description' => json_encode([
                'es' => 'Compra, venta, alquiler y administración de propiedades en José Ignacio, Punta del Este. Inmobiliaria boutique con conocimiento profundo de cada zona.',
                'en' => 'Buy, sell, rent and manage properties in José Ignacio, Punta del Este. A boutique real estate agency with deep local market knowledge.',
                'pt' => 'Compra, venda, aluguel e administração de imóveis em José Ignacio, Punta del Este. Imobiliária boutique com profundo conhecimento de cada região.',
            ]),
        ]);
    }

    public function down(): void
    {
        Schema::table('home_settings', function (Blueprint $table) {
            $table->dropColumn(['seo_title', 'seo_description']);
        });
    }
};
