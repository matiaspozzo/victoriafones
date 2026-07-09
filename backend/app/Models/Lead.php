<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lead extends Model
{
    protected $fillable = [
        'property_id',
        'type',
        'name',
        'email',
        'phone',
        'message',
        'locale',
        'source_url',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
