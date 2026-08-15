<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('page_settings', function (Blueprint $table) {
            // Reuses the PageSetting/`/api/pages` pipeline instead of a new
            // model — same translatable-JSON + Filament-locale-switcher
            // machinery already in place for every other page, just shown
            // (via the resource's `visible()`) only on the 'home' row. These
            // three replace what used to be hardcoded in
            // frontend/src/messages/{es,en,pt}.json (Home.aboutTitle,
            // Home.aboutBody, Home.salesTitle) — that JSON is now only the
            // fallback if a field is left blank here.
            $table->json('about_title')->nullable()->after('rental_disabled_message');
            $table->json('about_body')->nullable()->after('about_title');
            $table->json('zones_title')->nullable()->after('about_body');
        });

        DB::table('page_settings')->insert([
            'key' => 'home',
            'label' => 'Home',
            'hero_title' => null,
            'hero_subtitle' => null,
            'navbar_style' => 'white',
            'about_title' => json_encode([
                'es' => 'Tenemos la propiedad perfecta para cada cliente.',
                'en' => 'We have the perfect property for every client.',
                'pt' => 'Temos o imóvel perfeito para cada cliente.',
            ]),
            'about_body' => json_encode([
                'es' => '**Asesoramiento inmobiliario — para quienes buscan el lugar correcto y la inversión correcta**. En cada operación aplicamos información real, criterio genuino y un conocimiento profundo de José Ignacio, con seriedad y profesionalismo absolutos. José Ignacio es nuestro mercado, nuestra casa y nuestra especialidad.',
                'en' => '**Real estate advisory — for those seeking the right place and the right investment**. In every transaction we apply real information, genuine judgment, and a deep knowledge of José Ignacio, with absolute seriousness and professionalism. José Ignacio is our market, our home, and our specialty.',
                'pt' => '**Assessoria imobiliária — para quem busca o lugar certo e o investimento certo**. Em cada operação aplicamos informação real, critério genuíno e um profundo conhecimento de José Ignacio, com seriedade e profissionalismo absolutos. José Ignacio é o nosso mercado, a nossa casa e a nossa especialidade.',
            ]),
            'zones_title' => json_encode([
                'es' => 'Propiedades en Venta por Zona',
                'en' => 'Properties for Sale by Zone',
                'pt' => 'Propriedades à Venda por Zona',
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('page_settings')->where('key', 'home')->delete();

        Schema::table('page_settings', function (Blueprint $table) {
            $table->dropColumn(['about_title', 'about_body', 'zones_title']);
        });
    }
};
