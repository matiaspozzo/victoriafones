<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

class Neighborhood extends Model
{
    use HasTranslations;

    public array $translatable = ['name'];

    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'center_lat',
        'center_lng',
        'polygon',
        'order',
    ];

    protected $casts = [
        'polygon' => 'array',
        'center_lat' => 'decimal:7',
        'center_lng' => 'decimal:7',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Neighborhood::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Neighborhood::class, 'parent_id')->orderBy('order');
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }
}
