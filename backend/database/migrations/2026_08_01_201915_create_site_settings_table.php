<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            // Bare ID only — Next.js builds the actual <script> tags (see
            // gtag.js/fbevents.js snippets in frontend/src/app/[locale]/layout.tsx)
            // rather than storing raw script HTML, since these are just two
            // well-known IDs today.
            $table->string('google_analytics_id')->nullable();
            $table->string('facebook_pixel_id')->nullable();
            // Escape hatch for anything added later (Hotjar, LinkedIn, etc.)
            // that doesn't warrant its own dedicated field — raw HTML, injected
            // as-is at the end of <head>.
            $table->text('additional_scripts')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
