<?php

use App\Http\Controllers\Api\AmenityController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\MapController;
use App\Http\Controllers\Api\NeighborhoodController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\PropertyController;
use Illuminate\Support\Facades\Route;

Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/{slug}', [PropertyController::class, 'show']);
Route::get('/map/properties', [MapController::class, 'properties']);
Route::get('/neighborhoods', [NeighborhoodController::class, 'index']);
Route::get('/amenities', [AmenityController::class, 'index']);
Route::get('/pages', [PageController::class, 'index']);
Route::post('/leads', [LeadController::class, 'store']);
