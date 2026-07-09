<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('status')->default('draft'); // draft, published, archived
            $table->string('operation'); // sale, rent, sale_and_rent
            $table->string('type'); // house, apartment, land, chacra, commercial
            $table->foreignId('neighborhood_id')->nullable()->constrained('neighborhoods')->nullOnDelete();
            $table->unsignedBigInteger('price_usd')->nullable();
            $table->unsignedSmallInteger('bedrooms')->nullable();
            $table->unsignedSmallInteger('bathrooms')->nullable();
            $table->unsignedInteger('built_area_m2')->nullable();
            $table->unsignedInteger('lot_area_m2')->nullable();
            $table->unsignedSmallInteger('year_built')->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->boolean('featured')->default(false);
            $table->json('title');
            $table->json('slug');
            $table->json('excerpt')->nullable();
            $table->json('description')->nullable();
            $table->json('seo_title')->nullable();
            $table->json('seo_description')->nullable();
            $table->timestamps();

            $table->index(['operation', 'type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
