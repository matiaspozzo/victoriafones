<?php

namespace Database\Seeders;

use App\Models\Neighborhood;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class NeighborhoodSeeder extends Seeder
{
    /**
     * Seed the tree: Punta del Este > José Ignacio > sub-zones, plus a top-level
     * "Otras Zonas". José Ignacio is the parent region (not a selectable category);
     * the town itself is "Pueblo José Ignacio" (slug "pueblo-jose-ignacio").
     */
    public function run(): void
    {
        $puntaDelEste = $this->create('Punta del Este', null);
        $joseIgnacio = $this->create('José Ignacio', $puntaDelEste->id);

        $subZones = [
            ['Pueblo José Ignacio', 'pueblo-jose-ignacio', self::DESCRIPTIONS['pueblo-jose-ignacio']],
            ['Club de Mar', 'club-de-mar', self::DESCRIPTIONS['club-de-mar']],
            ['Pinar del Faro', 'pinar-del-faro', self::DESCRIPTIONS['pinar-del-faro']],
            ['Laguna Escondida', 'laguna-escondida', self::DESCRIPTIONS['laguna-escondida']],
            ['Alrededores', 'alrededores', self::DESCRIPTIONS['alrededores']],
        ];

        foreach ($subZones as $i => [$name, $slug, $description]) {
            $this->create($name, $joseIgnacio->id, $i, $slug, $description);
        }

        $this->create('Otras Zonas', null, 0, null, self::DESCRIPTIONS['otras-zonas']);
    }

    /**
     * Placeholder marketing copy for each leaf zone's listing page (title +
     * description block). Demo content — meant to be replaced by the client's
     * own copy via Filament, not a factual claim about any given property.
     */
    private const DESCRIPTIONS = [
        'pueblo-jose-ignacio' => [
            'es' => 'El corazón de José Ignacio: calles de adoquines, restaurantes de autor, galerías de arte y el mar a pocos pasos. Vivir en el Pueblo es tener todo cerca —desde el faro hasta la playa— sin resignar la tranquilidad que define a este rincón de Punta del Este.',
            'en' => 'The heart of José Ignacio: cobblestone streets, acclaimed restaurants, art galleries, and the sea just steps away. Living in the Pueblo means having everything close —from the lighthouse to the beach— without giving up the quiet that defines this corner of Punta del Este.',
            'pt' => 'O coração de José Ignacio: ruas de paralelepípedos, restaurantes renomados, galerias de arte e o mar a poucos passos. Viver no Pueblo é ter tudo por perto —do farol à praia— sem abrir mão da tranquilidade que define esse canto de Punta del Este.',
        ],
        'club-de-mar' => [
            'es' => 'Frente al mar y rodeado de naturaleza, Club de Mar es sinónimo de exclusividad. Terrenos amplios, playas extensas y una comunidad que privilegia la privacidad, ideal para quienes buscan una segunda residencia frente al océano.',
            'en' => 'Right on the ocean and surrounded by nature, Club de Mar is synonymous with exclusivity. Spacious lots, wide beaches, and a community that values privacy —ideal for those seeking a second home facing the sea.',
            'pt' => 'De frente para o mar e cercado pela natureza, Club de Mar é sinônimo de exclusividade. Terrenos amplos, praias extensas e uma comunidade que valoriza a privacidade, ideal para quem busca uma segunda residência à beira-mar.',
        ],
        'pinar-del-faro' => [
            'es' => 'Entre pinares centenarios y a metros del faro de José Ignacio, este barrio combina la sombra y el silencio del bosque con la cercanía al pueblo y a la playa. Una de las zonas más buscadas para vivir todo el año o disfrutar el verano.',
            'en' => 'Amid century-old pine groves and just steps from the José Ignacio lighthouse, this neighborhood combines the shade and quiet of the forest with easy access to the village and the beach. One of the most sought-after areas to live year-round or enjoy the summer.',
            'pt' => 'Entre pinheirais centenários e a poucos metros do farol de José Ignacio, este bairro combina a sombra e o silêncio do bosque com a proximidade do vilarejo e da praia. Uma das áreas mais procuradas para morar o ano todo ou aproveitar o verão.',
        ],
        'laguna-escondida' => [
            'es' => 'Un refugio natural sobre la laguna, rodeado de campo abierto y aves autóctonas. Laguna Escondida atrae a quienes buscan grandes extensiones de terreno, privacidad total y una conexión directa con el paisaje de José Ignacio.',
            'en' => "A natural haven on the lagoon, surrounded by open countryside and native birdlife. Laguna Escondida draws those looking for large lots, total privacy, and a direct connection to José Ignacio's landscape.",
            'pt' => 'Um refúgio natural às margens da lagoa, cercado por campo aberto e aves nativas. Laguna Escondida atrai quem busca grandes extensões de terreno, privacidade total e uma conexão direta com a paisagem de José Ignacio.',
        ],
        'alrededores' => [
            'es' => 'Los alrededores de José Ignacio ofrecen chacras, campos y casas de campo a pocos minutos del pueblo. Ideal para quienes sueñan con más espacio, aire libre y la posibilidad de tener su propio proyecto agreste sin alejarse de la costa.',
            'en' => 'The countryside around José Ignacio offers farms, fields, and country homes just minutes from the village. Ideal for those dreaming of more space, open air, and the chance to build their own rural retreat without straying far from the coast.',
            'pt' => 'Os arredores de José Ignacio oferecem chácaras, campos e casas de campo a poucos minutos do vilarejo. Ideal para quem sonha com mais espaço, ar livre e a possibilidade de ter seu próprio projeto rural sem se afastar da costa.',
        ],
        'otras-zonas' => [
            'es' => 'Más allá de José Ignacio, Punta del Este ofrece una variedad de barrios y balnearios con su propia identidad. Reunimos aquí propiedades en otras zonas de la región para quienes quieren explorar todo lo que la costa uruguaya tiene para ofrecer.',
            'en' => 'Beyond José Ignacio, Punta del Este offers a range of neighborhoods and seaside towns, each with its own character. Here we gather properties in other areas of the region for those looking to explore everything the Uruguayan coast has to offer.',
            'pt' => 'Além de José Ignacio, Punta del Este oferece uma variedade de bairros e balneários com identidade própria. Reunimos aqui propriedades em outras áreas da região para quem deseja explorar tudo o que a costa uruguaia tem a oferecer.',
        ],
    ];

    private function create(string $es, ?int $parentId, int $order = 0, ?string $slug = null, ?array $description = null): Neighborhood
    {
        return Neighborhood::create([
            'parent_id' => $parentId,
            'name' => ['es' => $es, 'en' => $es, 'pt' => $es],
            'description' => $description,
            'slug' => $slug ?? Str::slug($es),
            'order' => $order,
        ]);
    }
}
