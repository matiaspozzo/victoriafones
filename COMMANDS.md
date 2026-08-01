# Artisan commands reference

All commands run from `backend/`. Locally, use the pinned PHP version (see
[`DEPLOY.md`](DEPLOY.md) / project memory) — e.g.:

```bash
/opt/homebrew/opt/php@8.2/bin/php artisan <command>
```

On the droplet, `php` already resolves to 8.2, so plain `php artisan <command>` is fine.

## Content import (custom commands)

Three commands pull property data from the live WordPress site
(`www.victoriafones.com`). They're not interchangeable — each has a different data
source and a different reason to exist.

### `import:wordpress` — primary, ongoing sync

```bash
php artisan import:wordpress [--dry-run] [--limit=N] [--code=LEG8]
```

The main command. Pulls the `propiedades` CPT via the WP REST API, then scrapes each
property's live page for fields WP doesn't expose over REST (price, bedrooms,
bathrooms, m², year — JetEngine custom fields aren't REST-registered).

- **Always re-run safely**: structural fields (operation, type, neighborhood, price,
  bedrooms, bathrooms, built area, year) are refreshed from WP on every run. `lot_area_m2`
  is refreshed only for `type=land` (WP has no lot-size concept for houses — that's
  manual-only data, never overwritten by this command on an existing record). Manual/
  editorial fields (status, featured, lat/lng, translations, description) are seeded
  **only when a property is first created** — re-running never clobbers Filament edits.
- New properties always land as `status=draft` — reviewed manually before publishing.
- Images are downloaded **only if the property has no media yet** — re-running an
  existing property does not pick up new/changed photos on WP. If a client swaps
  photos on an already-imported listing, those need to be added manually in Filament
  (or the property's existing media deleted first, then re-imported).
- `--dry-run` prints what would change without writing anything — always run this
  first when syncing after the client's made WP-side edits, and skim the diff.
- `--code=LEG8` limits to one property — useful for testing a mapping fix or
  re-pulling a single listing without touching the other 100+.
- Properties get skipped (reported at the end, not silently dropped) when their WP
  taxonomy tags don't map to a known operation/type — check `OPERATION_MAP`/`TYPE_MAP`
  in the command, or the WP listing itself (sometimes it's genuinely empty/unpublished
  source data, not a mapping gap).

### `import:wordpress-translations` — EN/PT description backfill

```bash
php artisan import:wordpress-translations [--dry-run] [--limit=N] [--code=LEG8]
```

`import:wordpress` only ever pulls the **Spanish** description. This command backfills
`en`/`pt` descriptions by pulling WPML's per-language posts from the same WP site
(`?lang=en` / `?lang=pt` on the REST API). Title/slug are intentionally left alone —
WPML keeps the same title across languages on the live site, so there's nothing to
translate there.

`es` is also a valid `--code`-scoped locale target here (not for bulk runs) — a handful
of properties' original Spanish description was scraped by an older, buggier heuristic
that could grab the page's copyright footer instead of the real text. Re-run with
`--code=` for a specific affected property to fix it in place. **Don't run `es` in
bulk** — editors may have hand-edited descriptions in Filament since, and a blanket
re-scrape would overwrite that.

Properties with no matching WPML counterpart (missing translation, or the slug drifted
between languages) are reported as unmatched, not guessed at.

### `import:csv` — fallback path, not the primary source

```bash
php artisan import:csv [path=propiedades-export.csv] [--limit=N] [--images] [--image-cap=15] [--only-published]
```

Imports from a WordPress CSV export instead of the REST API. This was the fallback plan
from before we confirmed the REST API was usable (see `CLAUDE.md`'s original migration
strategy) — the CSV is actually the *richer* source (carries coordinates, price, and
full description in one file), but `import:wordpress` became the primary path since it
needs no manual export step and can be re-run anytime. Keep this around for a case where
the REST API is unavailable, or as a one-off to backfill something the CSV has that the
scrape doesn't. Path is relative to `storage/app`. `--images` resolves and downloads
photos by WP attachment ID (slow — capped per-property by `--image-cap`).

## Media

```bash
php artisan media-library:regenerate ["App\Models\Property"] [--force] [--only=thumb,card]
```

Spatie command, not custom. Re-derives every conversion (`thumb`/`card`/`full` for
Property, `desktop`/`mobile` for PageSetting hero images) from the stored originals.
Needed after changing a `registerMediaConversions()` definition — existing conversions
don't regenerate themselves just because the code changed. This is exactly the case
after switching every conversion to output WebP: new uploads already come out as WebP
without needing this command, but the **~2,200 existing property images are still the
original JPG conversions** and need a one-time regenerate to catch up. Not yet run —
it's a heavy batch job (one image-processing pass per conversion per media item), worth
running deliberately rather than as a side effect of an unrelated deploy.

## Routine maintenance

Standard Laravel/Filament commands, not project-specific, but the ones actually used on
this project:

| Command | When |
|---|---|
| `php artisan migrate --force` | After pulling new migrations. Safe to run even with nothing pending (no-op). |
| `php artisan db:seed --class=X` | Re-seed one seeder (e.g. `NeighborhoodSeeder`) without touching the rest. |
| `php artisan storage:link` | Once, on a fresh install — symlinks `public/storage` to `storage/app/public`. |
| `php artisan config:cache` / `config:clear` | Cache config for prod; clear it after `.env` changes. |
| `php artisan route:cache` / `route:clear` | Same, for routes. |
| `php artisan view:cache` / `view:clear` | Same, for Blade/Filament views. |
| `php artisan optimize:clear` | Clears config+route+view+event caches in one go — run after any backend code/config edit during local dev. |
| `php artisan filament:optimize` | Rebuild Filament's component/icon cache — needed after upgrading Filament or changing a Resource. |
| `php artisan filament:upgrade` | Runs automatically via composer's `post-autoload-dump` on `composer install`; publishes Filament's compiled assets. Only run manually if assets look stale. |
| `php artisan tinker` | One-off data checks/fixes. Pass a script file as an argument (`php artisan tinker script.php -n`) to run it non-interactively instead of pasting into the REPL. |

Full **deploy** sequence (which of the above to run, in what order, after a `git pull`)
lives in [`DEPLOY.md`](DEPLOY.md#redeploying-after-changes) — this file is a reference
for what each command does, not a run-book.
