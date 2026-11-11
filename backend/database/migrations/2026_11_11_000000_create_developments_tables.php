<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('developments', function (Blueprint $table) {
            $table->id();
            $table->string('status')->default('draft'); // draft, published, archived
            $table->foreignId('neighborhood_id')->nullable()->constrained('neighborhoods')->nullOnDelete();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->json('title');
            $table->json('slug');
            $table->json('excerpt')->nullable();
            $table->json('description')->nullable(); // "Conocé el proyecto"
            $table->json('seo_title')->nullable();
            $table->json('seo_description')->nullable();
            $table->timestamps();

            $table->index(['status', 'order']);
        });

        Schema::create('development_lots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('development_id')->constrained()->cascadeOnDelete();
            $table->string('label')->nullable(); // e.g. "Lote 12" / "Manzana B"
            $table->unsignedInteger('area_m2');
            $table->unsignedBigInteger('price_usd')->nullable(); // null => "Consultar"
            $table->string('status')->default('available'); // available, reserved, sold
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->index(['development_id', 'status']);
        });

        Schema::create('amenity_development', function (Blueprint $table) {
            $table->id();
            $table->foreignId('development_id')->constrained()->cascadeOnDelete();
            $table->foreignId('amenity_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['development_id', 'amenity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('amenity_development');
        Schema::dropIfExists('development_lots');
        Schema::dropIfExists('developments');
    }
};
