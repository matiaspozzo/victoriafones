<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Translatable\HasTranslations;

class RentalPrice extends Model
{
    use HasTranslations;

    public array $translatable = ['label'];

    protected $fillable = [
        'property_id',
        'label',
        'price_usd',
        'order',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
