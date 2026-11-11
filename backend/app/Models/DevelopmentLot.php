<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DevelopmentLot extends Model
{
    protected $fillable = [
        'development_id',
        'label',
        'area_m2',
        'price_usd',
        'status',
        'order',
    ];

    public function development(): BelongsTo
    {
        return $this->belongsTo(Development::class);
    }
}
