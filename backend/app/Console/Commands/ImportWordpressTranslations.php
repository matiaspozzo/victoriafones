<?php

namespace App\Console\Commands;

use App\Models\Property;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Backfills property descriptions from the live WordPress site, per locale.
 *
 * `import:wordpress` only ever pulled the `es` description (see its docblock), so
 * every property originally fell back to Spanish text on the /en and /br pages.
 * The live site's title/H1 is NOT translated per locale (WPML keeps the same
 * post title across languages — verified by comparing rendered H1s), so only
 * `description` is actually mixed-language today; title/slug stay `es`-only
 * on purpose and are left untouched here.
 *
 * `es` is also in the locale map (not just en/pt): a handful of properties'
 * original `es` description was scraped with an older, buggier heuristic (see
 * `scrapeDescription()`) that could grab the page's copyright footer instead of
 * the real text. Re-run with `--code=` for a specific affected property to fix
 * it in place — don't run `es` in bulk, since editors may have since hand-edited
 * some descriptions in Filament and a blanket re-scrape would clobber that.
 *
 * WPML exposes each language's posts as separate WP post IDs via the REST API's
 * `?lang=` filter. Slugs are consistent across languages for most properties
 * (matched here by the same leading-code regex `import:wordpress` uses), but
 * WPML's own data is dirty in the same way the ES data is: some properties
 * have no EN/PT counterpart, or the counterpart's slug drifted (typo'd code,
 * renumbered listing, etc). Those are reported as unmatched, not guessed at.
 */
class ImportWordpressTranslations extends Command
{
    protected $signature = 'import:wordpress-translations
        {--dry-run : Parse and report without writing to the database}
        {--limit= : Only process the first N properties}
        {--code= : Only import a single property by its code (e.g. LEG8)}';

    protected $description = 'Backfill en/pt property descriptions scraped from the live WordPress site (WPML)';

    private const BASE_URL = 'https://www.victoriafones.com';

    /** Our translatable locale => WPML `lang` query value. */
    private const LOCALE_MAP = [
        'es' => 'es',
        'en' => 'en',
        'pt' => 'br',
    ];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;
        $onlyCode = $this->option('code') ? Str::upper($this->option('code')) : null;

        $properties = Property::query()->orderBy('code')->get();

        if ($onlyCode) {
            $properties = $properties->filter(fn (Property $p) => $p->code === $onlyCode);
        }

        if ($limit) {
            $properties = $properties->take($limit);
        }

        foreach (self::LOCALE_MAP as $locale => $wpLang) {
            $this->info("Fetching WordPress '{$wpLang}' property index...");
            $index = $this->fetchLangIndex($wpLang);
            $this->info(sprintf('  %d properties found in WP for lang=%s.', count($index), $wpLang));

            $updated = 0;
            $unmatched = [];
            $noDescription = [];

            foreach ($properties as $property) {
                $entry = $index[$property->code] ?? null;

                if (! $entry) {
                    $unmatched[] = $property->code;

                    continue;
                }

                $scrapedDescription = $this->scrapeDescription($entry['link']);

                if (! $scrapedDescription) {
                    $noDescription[] = $property->code;

                    continue;
                }

                $this->line(sprintf(
                    '[%s] %s %s | %s',
                    $wpLang,
                    $dryRun ? 'dry-run' : 'update',
                    $property->code,
                    Str::limit($scrapedDescription, 80)
                ));

                if (! $dryRun) {
                    $property->setTranslation('description', $locale, $scrapedDescription);
                    $property->save();
                }

                $updated++;
            }

            $this->newLine();
            $this->info("[{$wpLang}] Actualizadas: {$updated}");

            if ($unmatched) {
                $this->warn("[{$wpLang}] Sin equivalente en WP (revisar manualmente): ".implode(', ', $unmatched));
            }

            if ($noDescription) {
                $this->warn("[{$wpLang}] Sin párrafo de descripción en la página: ".implode(', ', $noDescription));
            }

            $this->newLine();
        }

        return self::SUCCESS;
    }

    /**
     * @return array<string, array{link: string}> code => WP entry
     */
    private function fetchLangIndex(string $wpLang): array
    {
        $index = [];
        $page = 1;
        $totalPages = 1;

        do {
            $response = Http::timeout(30)->get(self::BASE_URL.'/wp-json/wp/v2/propiedades', [
                'lang' => $wpLang,
                'per_page' => 100,
                'page' => $page,
            ]);

            if ($response->failed()) {
                break;
            }

            foreach ($response->json() as $wpProperty) {
                $code = $this->deriveCode($wpProperty['slug']);
                $index[$code] = ['link' => $wpProperty['link']];
            }

            $totalPages = (int) $response->header('X-WP-TotalPages');
            $page++;
        } while ($page <= $totalPages);

        return $index;
    }

    private function deriveCode(string $slug): string
    {
        preg_match('/^([a-z0-9]+)/i', $slug, $matches);

        return Str::upper($matches[1] ?? $slug);
    }

    private function scrapeDescription(string $url): ?string
    {
        $response = Http::timeout(20)->get($url);

        if ($response->failed()) {
            return null;
        }

        $dom = new \DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML($response->body());
        libxml_use_internal_errors(false);
        $xpath = new \DOMXPath($dom);

        // Every property page repeats the same handful of boilerplate widgets
        // (office address/contact card, phone, Instagram, copyright footer) in
        // the same `.elementor-widget-text-editor` class as the real description.
        // "Longest widget wins" isn't enough on its own — a few properties have a
        // genuinely terse one-line description that's shorter than the contact
        // card or copyright text (e.g. MASJIB2: "Venta terreno de 820m2..." at 44
        // chars vs. the 147-char contact card) — so boilerplate is excluded by
        // known signature phrases first, and "longest" only picks among the rest.
        // (EN/PT pages also split the description across several short <p> tags,
        // each individually shorter than the contact card — joining a widget's
        // <p> children before comparing handles that case too.)
        // The address/phone/Instagram lines are untranslated (verbatim English)
        // on both the es and en pages — only the pt page actually translates
        // them, hence the separate pt-specific signatures below.
        $boilerplateSignatures = [
            'Galería Los Caracoles',
            'Copyright ©',
            'Phone & Whatsapp',
            'Visit our Instagram',
            'Telefone e Whatsapp',
            'Visite nosso Instagram',
        ];

        $bestText = '';

        foreach ($xpath->query("//*[contains(concat(' ', normalize-space(@class), ' '), ' elementor-widget-text-editor ')]") as $widget) {
            $paragraphs = [];

            foreach ($xpath->query('.//p', $widget) as $p) {
                $text = trim($p->textContent);

                if ($text !== '') {
                    $paragraphs[] = $text;
                }
            }

            $candidate = $paragraphs ? implode("\n\n", $paragraphs) : trim($widget->textContent);

            foreach ($boilerplateSignatures as $signature) {
                if (Str::contains($candidate, $signature)) {
                    continue 2;
                }
            }

            if (mb_strlen($candidate) > mb_strlen($bestText)) {
                $bestText = $candidate;
            }
        }

        return $bestText ?: null;
    }
}
