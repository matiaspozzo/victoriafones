<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('developments', function (Blueprint $table) {
            // Manual card figures, used when there are no individual lots
            // loaded (e.g. the lot-by-lot plan is only shared on request).
            $table->unsignedInteger('lots_total')->nullable()->after('lng');
            $table->unsignedInteger('area_min_m2')->nullable()->after('lots_total');
            $table->unsignedInteger('area_max_m2')->nullable()->after('area_min_m2');
            $table->unsignedBigInteger('price_from_usd')->nullable()->after('area_max_m2');

            // Translatable: [{title, items: [string]}] — grouped amenities with detail.
            $table->json('amenity_groups')->nullable()->after('description');
            // Translatable free texts.
            $table->json('masterplan_caption')->nullable()->after('amenity_groups');
            $table->json('location_text')->nullable()->after('masterplan_caption');
            // Not translatable: [{label_es, label_en, label_pt, m2, is_total}].
            $table->json('surfaces')->nullable()->after('location_text');
        });
    }

    public function down(): void
    {
        Schema::table('developments', function (Blueprint $table) {
            $table->dropColumn([
                'lots_total', 'area_min_m2', 'area_max_m2', 'price_from_usd',
                'amenity_groups', 'masterplan_caption', 'location_text', 'surfaces',
            ]);
        });
    }
};
