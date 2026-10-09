<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\Neighborhood;
use App\Models\NeighborhoodFaq;
use Illuminate\Database\Seeder;

/**
 * First-draft FAQ content for the 6 main zone pages — generated from real
 * data (published property type counts, sale price range, most common
 * amenities among this zone and its sub-zones) as of 2026-10-09, not
 * invented marketing claims.
 *
 * IMPORTANT: the type counts and price range are a snapshot of inventory on
 * that date and WILL go stale as properties are added/sold/re-priced. This
 * is a starting point for the client to edit and periodically refresh in
 * Filament (Barrios > zona > Preguntas frecuentes), not a "set and forget"
 * feature — see the conversation this was built from for that caveat.
 *
 * Idempotent: `updateOrCreate` keyed by (neighborhood_id, order), so running
 * it again just refreshes this seed content in place instead of duplicating
 * rows (a client edit made directly in Filament, at the same order slot,
 * would get overwritten by a re-run though — this is meant to run once).
 */
class NeighborhoodFaqSeeder extends Seeder
{
    /** @var array<string, array{0: string, 1: string, 2: string}> type => [es, en, pt] plural label */
    private const TYPE_PLURALS = [
        'house' => ['casas', 'houses', 'casas'],
        'apartment' => ['departamentos', 'apartments', 'apartamentos'],
        'land' => ['terrenos', 'plots of land', 'terrenos'],
        'chacra' => ['chacras', 'farms', 'chácaras'],
        'commercial' => ['locales comerciales', 'commercial properties', 'imóveis comerciais'],
    ];

    /**
     * slug => [type => published count, [price min, price max] among priced
     * sale listings, [amenity slugs] most-frequent-first (top 3, or empty)].
     * Computed from production data (see the tinker aggregation this was
     * built from) — zone totals already include each zone's sub-zones.
     */
    private const ZONE_DATA = [
        'pueblo-jose-ignacio' => [['house' => 1, 'land' => 1], [3_500_000, 8_000_000], []],
        'club-de-mar' => [['house' => 2, 'land' => 2], [1_800_000, 3_000_000], []],
        'pinar-del-faro' => [['house' => 21, 'land' => 14], [500_000, 2_800_000], []],
        'laguna-escondida' => [['land' => 12, 'house' => 10], [365_000, 3_500_000], ['pool', 'barbecue', 'staff-quarters']],
        'alrededores' => [['land' => 21, 'house' => 10, 'apartment' => 6, 'chacra' => 2], [136_000, 4_200_000], ['pool', 'barbecue', 'garage']],
        'otras-zonas' => [['apartment' => 6, 'land' => 1], [325_000, 1_650_000], []],
    ];

    private const LOCALES = ['es', 'en', 'pt'];

    public function run(): void
    {
        foreach (self::ZONE_DATA as $slug => [$byType, $priceRange, $amenitySlugs]) {
            $neighborhood = Neighborhood::where('slug', $slug)->first();

            if (! $neighborhood) {
                continue;
            }

            [$min, $max] = $priceRange;
            $faqs = $this->buildFaqs($neighborhood, $byType, $min, $max, $amenitySlugs);

            foreach (array_values($faqs) as $order => $faq) {
                NeighborhoodFaq::updateOrCreate(
                    ['neighborhood_id' => $neighborhood->id, 'order' => $order],
                    ['question' => $faq['question'], 'answer' => $faq['answer']],
                );
            }
        }
    }

    /** @return array<int, array{question: array<string,string>, answer: array<string,string>}> */
    private function buildFaqs(Neighborhood $neighborhood, array $byType, int $min, int $max, array $amenitySlugs): array
    {
        $name = $this->perLocale(fn ($locale) => $neighborhood->getTranslation('name', $locale, false) ?: $neighborhood->getTranslation('name', 'es'));

        $faqs = [
            [
                'question' => $this->perLocale(fn ($locale) => match ($locale) {
                    'en' => "What types of properties are for sale in {$name['en']}?",
                    'pt' => "Que tipos de imóveis estão à venda em {$name['pt']}?",
                    default => "¿Qué tipos de propiedades hay en venta en {$name['es']}?",
                }),
                'answer' => $this->perLocale(fn ($locale) => match ($locale) {
                    'en' => 'We currently have '.$this->typesPhrase($byType, 'en')." for sale in {$name['en']}.",
                    'pt' => 'Atualmente temos '.$this->typesPhrase($byType, 'pt')." à venda em {$name['pt']}.",
                    default => 'Actualmente contamos con '.$this->typesPhrase($byType, 'es')." en venta en {$name['es']}.",
                }),
            ],
            [
                'question' => $this->perLocale(fn ($locale) => match ($locale) {
                    'en' => "What is the price range in {$name['en']}?",
                    'pt' => "Qual é a faixa de preços em {$name['pt']}?",
                    default => "¿Cuál es el rango de precios en {$name['es']}?",
                }),
                'answer' => $this->perLocale(fn ($locale) => match ($locale) {
                    'en' => "Properties for sale in {$name['en']} range from USD ".number_format($min).' to USD '.number_format($max).' (reference prices, subject to availability).',
                    'pt' => "Os imóveis à venda em {$name['pt']} variam de USD ".number_format($min).' a USD '.number_format($max).' (preços de referência, sujeitos a disponibilidade).',
                    default => "Las propiedades en venta en {$name['es']} van desde USD ".number_format($min).' hasta USD '.number_format($max).' (precios de referencia, sujetos a disponibilidad).',
                }),
            ],
        ];

        if (! empty($amenitySlugs)) {
            $amenityNames = $this->perLocale(fn ($locale) => $this->amenityListPhrase($amenitySlugs, $locale));

            $faqs[] = [
                'question' => $this->perLocale(fn ($locale) => match ($locale) {
                    'en' => "What amenities are common in {$name['en']} properties?",
                    'pt' => "Quais comodidades são comuns nos imóveis de {$name['pt']}?",
                    default => "¿Qué amenities son más comunes en las propiedades de {$name['es']}?",
                }),
                'answer' => $this->perLocale(fn ($locale) => match ($locale) {
                    'en' => "Among {$name['en']} properties, the most common amenities are {$amenityNames['en']}.",
                    'pt' => "Entre os imóveis de {$name['pt']}, as comodidades mais comuns são {$amenityNames['pt']}.",
                    default => "Entre las propiedades de {$name['es']}, las comodidades más frecuentes son {$amenityNames['es']}.",
                }),
            ];
        }

        $faqs[] = [
            'question' => $this->perLocale(fn ($locale) => match ($locale) {
                'en' => "How can I visit or ask about a property in {$name['en']}?",
                'pt' => "Como posso visitar ou consultar sobre um imóvel em {$name['pt']}?",
                default => "¿Cómo puedo visitar o consultar por una propiedad en {$name['es']}?",
            }),
            'answer' => $this->perLocale(fn ($locale) => match ($locale) {
                'en' => "You can message us on WhatsApp or fill out the contact form on any property page, and we'll arrange a visit at a time that works for you.",
                'pt' => 'Você pode nos escrever pelo WhatsApp ou preencher o formulário de contato em qualquer página de imóvel, e combinamos uma visita no horário que for melhor para você.',
                default => 'Podés escribirnos por WhatsApp o completar el formulario de contacto en cualquier ficha de propiedad, y coordinamos una visita a tu medida.',
            }),
        ];

        return $faqs;
    }

    /** @return array<string,string> */
    private function perLocale(callable $resolve): array
    {
        $result = [];
        foreach (self::LOCALES as $locale) {
            $result[$locale] = $resolve($locale);
        }

        return $result;
    }

    /** @param array<string,int> $byType */
    private function typesPhrase(array $byType, string $locale): string
    {
        $localeIndex = array_search($locale, self::LOCALES, true);
        $parts = [];

        foreach ($byType as $type => $count) {
            $label = self::TYPE_PLURALS[$type][$localeIndex] ?? $type;
            $parts[] = "{$count} {$label}";
        }

        if (count($parts) <= 1) {
            return $parts[0] ?? '';
        }

        $last = array_pop($parts);
        $connector = match ($locale) {
            'en' => 'and',
            'pt' => 'e',
            default => 'y',
        };

        return implode(', ', $parts)." {$connector} {$last}";
    }

    /** @param string[] $amenitySlugs */
    private function amenityListPhrase(array $amenitySlugs, string $locale): string
    {
        $amenities = Amenity::whereIn('slug', $amenitySlugs)->get()->keyBy('slug');
        $names = [];

        foreach ($amenitySlugs as $slug) {
            $amenity = $amenities->get($slug);

            if (! $amenity) {
                continue;
            }

            $names[] = mb_strtolower($amenity->getTranslation('name', $locale, false) ?: $amenity->getTranslation('name', 'es'));
        }

        if (count($names) <= 1) {
            return $names[0] ?? '';
        }

        $last = array_pop($names);
        $connector = match ($locale) {
            'en' => 'and',
            'pt' => 'e',
            default => 'y',
        };

        return implode(', ', $names)." {$connector} {$last}";
    }
}
