<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Singleton, like site_settings — always exactly one row, use
        // HomeSetting::current() rather than querying the table directly.
        Schema::create('home_settings', function (Blueprint $table) {
            $table->id();
            $table->json('about_title')->nullable();
            $table->json('about_body')->nullable();
            $table->json('zones_title')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('home_settings');
    }
};
