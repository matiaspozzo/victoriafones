<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NeighborhoodResource;
use App\Models\Neighborhood;

class NeighborhoodController extends Controller
{
    public function index()
    {
        $tree = Neighborhood::query()
            ->whereNull('parent_id')
            ->with('children.children')
            ->orderBy('order')
            ->get();

        return NeighborhoodResource::collection($tree);
    }
}
