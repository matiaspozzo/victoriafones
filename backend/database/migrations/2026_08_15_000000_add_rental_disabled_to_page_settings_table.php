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
            $table->boolean('rental_disabled')->default(false)->after('navbar_style');
            $table->json('rental_disabled_message')->nullable()->after('rental_disabled');
        });

        // Seed the client-provided copy onto the existing 'alquiler' row so it's
        // ready to use the moment the toggle is switched on in Filament, rather
        // than shipping with an empty message. Toggle itself defaults to off.
        DB::table('page_settings')->where('key', 'alquiler')->update([
            'rental_disabled_message' => json_encode([
                'es' => "Trabajamos alquileres en José Ignacio y alrededores, para quienes buscan pasar sus vacaciones sin preocupaciones y para quienes confían su propiedad a nuestro cuidado.\n\nTenemos un portfolio de casas seleccionadas con criterio. Nos ocupamos de resolver cada detalle con anticipación, para que la experiencia —de quien alquila y de quien es propietario— sea de excelencia.\n\nNuestra forma de gestionar es formal y estructurada, de principio a fin. Así cuidamos cada vínculo, en cada temporada.",
                'en' => "We handle rentals in José Ignacio and its surroundings, for those looking to spend their vacation worry-free and for those who trust us with the care of their property.\n\nWe have a portfolio of carefully selected homes. We take care of resolving every detail in advance, so the experience — for both tenant and owner — is one of excellence.\n\nOur way of managing is formal and structured, from start to finish. This is how we take care of every relationship, every season.",
                'pt' => "Trabalhamos com aluguéis em José Ignacio e arredores, para quem busca passar as férias sem preocupações e para quem confia sua propriedade aos nossos cuidados.\n\nTemos um portfólio de casas selecionadas com critério. Cuidamos de resolver cada detalhe com antecedência, para que a experiência — de quem aluga e de quem é proprietário — seja de excelência.\n\nNossa forma de gerenciar é formal e estruturada, do início ao fim. Assim cuidamos de cada vínculo, em cada temporada.",
            ]),
        ]);
    }

    public function down(): void
    {
        Schema::table('page_settings', function (Blueprint $table) {
            $table->dropColumn(['rental_disabled', 'rental_disabled_message']);
        });
    }
};
