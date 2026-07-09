<?php

use Illuminate\Support\Facades\Route;

// This app is the API + Filament admin only (the public site is the Next.js
// frontend). Send the root to the admin panel instead of the starter page.
Route::get('/', fn () => redirect('/admin'));
