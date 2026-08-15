<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Reverts 2026_08_15_010000: the Home page's editable content moved out of
// PageSetting into its own dedicated home_settings/home_zone_cards tables and
// Filament resource, so it's not filed under "Encabezados de páginas" (which
// the client doesn't think of the Home page as being) and so the zone cards
// can each carry their own image + link instead of a single text field.
return new class extends Migration
{
    public function up(): void
    {
        DB::table('page_settings')->where('key', 'home')->delete();

        Schema::table('page_settings', function (Blueprint $table) {
            $table->dropColumn(['about_title', 'about_body', 'zones_title']);
        });
    }

    public function down(): void
    {
        Schema::table('page_settings', function (Blueprint $table) {
            $table->json('about_title')->nullable();
            $table->json('about_body')->nullable();
            $table->json('zones_title')->nullable();
        });
    }
};
