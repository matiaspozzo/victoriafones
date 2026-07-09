<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class PageSetting extends Model
{
    use HasTranslations;

    public array $translatable = ['hero_title', 'hero_subtitle'];

    protected $fillable = [
        'key',
        'label',
        'hero_title',
        'hero_subtitle',
    ];
}
