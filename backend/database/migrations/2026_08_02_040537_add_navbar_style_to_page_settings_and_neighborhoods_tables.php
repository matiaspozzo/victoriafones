<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('page_settings', function (Blueprint $table) {
            $table->string('navbar_style')->default('white')->after('hero_subtitle');
        });

        Schema::table('neighborhoods', function (Blueprint $table) {
            $table->string('navbar_style')->default('white')->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('page_settings', function (Blueprint $table) {
            $table->dropColumn('navbar_style');
        });

        Schema::table('neighborhoods', function (Blueprint $table) {
            $table->dropColumn('navbar_style');
        });
    }
};
