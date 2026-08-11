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

    // Not mass-fillable on purpose — set programmatically (auto-marked on view,
    // or toggled explicitly), never via the disabled-field lead form.
    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
