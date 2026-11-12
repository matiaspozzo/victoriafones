<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\MathCaptcha;

class CaptchaController extends Controller
{
    public function show()
    {
        return response()->json(MathCaptcha::issue())
            ->header('Cache-Control', 'no-store, private');
    }
}
