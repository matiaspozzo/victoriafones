<?php

namespace App\Console\Commands;

use App\Models\Property;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Deletes the original uploaded file for property photos once they're old
 * enough that a re-crop/re-conversion is unlikely to be needed, keeping the
 * generated thumb/card/full WebP conversions (which is everything the site
 * actually serves — see Property::registerMediaConversions()). Originals are
 * kept by Spatie Media Library by default specifically so conversions can be
 * regenerated later; this trades that flexibility for disk space once a photo
 * has been live long enough that re-generating its conversions is unlikely.
 *
 * Only ever touches the *original* file — the Media DB record and all three
 * conversions are left alone, so nothing the frontend or admin displays
 * changes. Filament's upload fields are pinned to the "card" conversion for
 * their preview (see PropertyResource::form()) specifically so this is safe.
 */
class PruneMediaOriginals extends Command
{
    protected $signature = 'media:prune-originals
        {--days=15 : Delete originals uploaded more than this many days ago}
        {--dry-run : Report what would be deleted without deleting anything}';

    protected $description = 'Delete original property photo files once their conversions are old enough to no longer need them';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $dryRun = (bool) $this->option('dry-run');
        $cutoff = now()->subDays($days);

        $media = Media::query()
            ->where('model_type', Property::class)
            ->whereIn('collection_name', ['hero', 'images'])
            ->where('created_at', '<', $cutoff)
            ->get();

        $deleted = 0;
        $freedBytes = 0;
        $skipped = 0;

        foreach ($media as $item) {
            $path = $item->getPath();

            if (! File::exists($path)) {
                continue; // already pruned (or never had an original on disk)
            }

            // Never delete an original whose conversions aren't all present —
            // that would leave a photo with no full-size version at all.
            $hasAllConversions = collect(['thumb', 'card', 'full'])
                ->every(fn (string $conversion) => $item->hasGeneratedConversion($conversion));

            if (! $hasAllConversions) {
                $skipped++;
                $this->warn("Skipping media #{$item->id} ({$item->file_name}) — missing a conversion, leaving original in place.");

                continue;
            }

            $size = File::size($path);

            if ($dryRun) {
                $this->line("[dry-run] Would delete {$path} (".number_format($size / 1024, 1).' KB)');
            } else {
                File::delete($path);
            }

            $deleted++;
            $freedBytes += $size;
        }

        $verb = $dryRun ? 'Would free' : 'Freed';
        $this->info("{$verb} ".number_format($freedBytes / 1024 / 1024, 1)." MB across {$deleted} original(s) older than {$days} days.");

        if ($skipped > 0) {
            $this->warn("{$skipped} media item(s) skipped — missing a conversion.");
        }

        return self::SUCCESS;
    }
}
