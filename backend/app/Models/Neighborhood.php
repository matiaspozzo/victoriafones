<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Translatable\HasTranslations;

class Neighborhood extends Model implements HasMedia
{
    use HasTranslations, InteractsWithMedia;

    public array $translatable = ['name', 'description', 'seo_title', 'seo_description'];

    protected $fillable = [
        'parent_id',
        'name',
        'description',
        'navbar_style',
        'seo_title',
        'seo_description',
        'slug',
        'center_lat',
        'center_lng',
        'polygon',
        'order',
    ];

    protected $casts = [
        'polygon' => 'array',
        'center_lat' => 'decimal:7',
        'center_lng' => 'decimal:7',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Neighborhood::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Neighborhood::class, 'parent_id')->orderBy('order');
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }

    // True for a zone nested two levels below a top region (e.g. a sub-zone of
    // "Alrededores", itself a child of "José Ignacio", itself a child of
    // "Punta del Este") — used to switch the property card to the
    // "sub-zone / type – property name" display instead of "zone · type".
    // Relies on `parent.parent` being loaded to avoid N+1 lazy loads.
    public function isSubzone(): bool
    {
        return (bool) $this->parent?->parent?->parent_id;
    }

    // All slugs reachable from $slug (itself plus every descendant), so that
    // filtering by a grouping zone (e.g. "alrededores") also matches
    // properties tagged with one of its sub-zones (e.g. "la-juanita").
    // Guards against a malformed cyclical parent_id chain with $visited.
    public static function slugWithDescendants(string $slug): array
    {
        $all = static::query()->select('id', 'parent_id', 'slug')->get();
        $root = $all->firstWhere('slug', $slug);

        if (! $root) {
            return [$slug];
        }

        $childrenByParent = $all->groupBy('parent_id');
        $slugs = [$root->slug];
        $visited = [$root->id => true];
        $queue = [$root->id];

        while (! empty($queue)) {
            $id = array_shift($queue);

            foreach ($childrenByParent->get($id, []) as $child) {
                if (isset($visited[$child->id])) {
                    continue;
                }

                $visited[$child->id] = true;
                $slugs[] = $child->slug;
                $queue[] = $child->id;
            }
        }

        return $slugs;
    }

    // Flat `[id => indented name]` list for admin Selects, so a deep tree
    // (e.g. 16 sub-zones under "Alrededores") stays legible as one dropdown
    // instead of an unordered flat list.
    public static function indentedOptions(): array
    {
        $all = static::query()->orderBy('order')->get(['id', 'parent_id', 'name']);
        $childrenByParent = $all->groupBy('parent_id');

        $options = [];
        $walk = function (?int $parentId, int $depth) use (&$walk, &$options, $childrenByParent) {
            foreach ($childrenByParent->get($parentId, []) as $node) {
                $name = is_array($node->name) ? ($node->name['es'] ?? reset($node->name)) : $node->name;
                $options[$node->id] = str_repeat('— ', $depth).$name;
                $walk($node->id, $depth + 1);
            }
        };
        $walk(null, 0);

        return $options;
    }

    public function registerMediaCollections(): void
    {
        // Background photo behind the zone listing page's title (single image).
        $this->addMediaCollection('hero')->singleFile();
        // Social-share preview image (single image) — separate from the hero
        // since Open Graph wants a fixed 1200x630 crop, not a 16:9/portrait pair.
        $this->addMediaCollection('og_image')->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        // Same target sizes/reasoning as PageSetting's hero — see that model.
        $this->addMediaConversion('desktop')
            ->fit(Fit::Crop, 1920, 1080)
            ->format('webp')
            ->performOnCollections('hero')
            ->nonQueued();

        $this->addMediaConversion('mobile')
            ->fit(Fit::Crop, 828, 1104)
            ->format('webp')
            ->performOnCollections('hero')
            ->nonQueued();

        // Standard Open Graph size. JPG rather than WebP — some link-preview
        // crawlers (WhatsApp, older Facebook scrapers) have spotty WebP support.
        $this->addMediaConversion('og')
            ->fit(Fit::Crop, 1200, 630)
            ->format('jpg')
            ->performOnCollections('og_image')
            ->nonQueued();
    }
}
