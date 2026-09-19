<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NeighborhoodResource;
use App\Models\Neighborhood;

class NeighborhoodController extends Controller
{
    public function index()
    {
        // One flat query + in-memory tree assembly, rather than a fixed-depth
        // `with('children.children...')` chain — the table is tiny (~30
        // rows) and this way the tree isn't hardcoded to 3 levels deep.
        $all = Neighborhood::query()
            ->withCount(['properties as properties_count' => fn ($q) => $q->where('status', 'published')])
            ->orderBy('order')
            ->get();

        $byParent = $all->groupBy('parent_id');

        $attachChildren = function (Neighborhood $node) use (&$attachChildren, $byParent) {
            $children = $byParent->get($node->id, collect());
            foreach ($children as $child) {
                $attachChildren($child);
            }
            $node->setRelation('children', $children->values());
        };

        $roots = $byParent->get(null, collect());
        foreach ($roots as $root) {
            $attachChildren($root);
        }

        return NeighborhoodResource::collection($roots->values());
    }
}
