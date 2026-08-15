<?php

namespace Database\Seeders;

use App\Models\PageSetting;
use Illuminate\Database\Seeder;

class PageSettingSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'key' => 'home',
                'label' => 'Home',
                'about_title' => [
                    'es' => 'Tenemos la propiedad perfecta para cada cliente.',
                    'en' => 'We have the perfect property for every client.',
                    'pt' => 'Temos o imóvel perfeito para cada cliente.',
                ],
                'about_body' => [
                    'es' => '**Asesoramiento inmobiliario — para quienes buscan el lugar correcto y la inversión correcta**. En cada operación aplicamos información real, criterio genuino y un conocimiento profundo de José Ignacio, con seriedad y profesionalismo absolutos. José Ignacio es nuestro mercado, nuestra casa y nuestra especialidad.',
                    'en' => '**Real estate advisory — for those seeking the right place and the right investment**. In every transaction we apply real information, genuine judgment, and a deep knowledge of José Ignacio, with absolute seriousness and professionalism. José Ignacio is our market, our home, and our specialty.',
                    'pt' => '**Assessoria imobiliária — para quem busca o lugar certo e o investimento certo**. Em cada operação aplicamos informação real, critério genuíno e um profundo conhecimento de José Ignacio, com seriedade e profissionalismo absolutos. José Ignacio é o nosso mercado, a nossa casa e a nossa especialidade.',
                ],
                'zones_title' => [
                    'es' => 'Propiedades en Venta por Zona',
                    'en' => 'Properties for Sale by Zone',
                    'pt' => 'Propriedades à Venda por Zona',
                ],
            ],
            [
                'key' => 'venta',
                'label' => 'Propiedades en Venta',
                'hero_title' => [
                    'es' => 'Todas las propiedades en **Venta**.',
                    'en' => 'All properties for **Sale**.',
                    'pt' => 'Todas as propriedades à **Venda**.',
                ],
                'hero_subtitle' => [
                    'es' => 'Punta del Este.',
                    'en' => 'Punta del Este.',
                    'pt' => 'Punta del Este.',
                ],
            ],
            [
                'key' => 'alquiler',
                'label' => 'Propiedades en Alquiler',
                'hero_title' => [
                    'es' => 'Todas las propiedades en **Alquiler**.',
                    'en' => 'All properties for **Rent**.',
                    'pt' => 'Todas as propriedades para **Aluguel**.',
                ],
                'hero_subtitle' => [
                    'es' => 'Punta del Este.',
                    'en' => 'Punta del Este.',
                    'pt' => 'Punta del Este.',
                ],
                'rental_disabled' => false,
                'rental_disabled_message' => [
                    'es' => "Trabajamos alquileres en José Ignacio y alrededores, para quienes buscan pasar sus vacaciones sin preocupaciones y para quienes confían su propiedad a nuestro cuidado.\n\nTenemos un portfolio de casas seleccionadas con criterio. Nos ocupamos de resolver cada detalle con anticipación, para que la experiencia —de quien alquila y de quien es propietario— sea de excelencia.\n\nNuestra forma de gestionar es formal y estructurada, de principio a fin. Así cuidamos cada vínculo, en cada temporada.",
                    'en' => "We handle rentals in José Ignacio and its surroundings, for those looking to spend their vacation worry-free and for those who trust us with the care of their property.\n\nWe have a portfolio of carefully selected homes. We take care of resolving every detail in advance, so the experience — for both tenant and owner — is one of excellence.\n\nOur way of managing is formal and structured, from start to finish. This is how we take care of every relationship, every season.",
                    'pt' => "Trabalhamos com aluguéis em José Ignacio e arredores, para quem busca passar as férias sem preocupações e para quem confia sua propriedade aos nossos cuidados.\n\nTemos um portfólio de casas selecionadas com critério. Cuidamos de resolver cada detalhe com antecedência, para que a experiência — de quem aluga e de quem é proprietário — seja de excelência.\n\nNossa forma de gerenciar é formal e estruturada, do início ao fim. Assim cuidamos de cada vínculo, em cada temporada.",
                ],
            ],
            [
                'key' => 'nuestras-propiedades',
                'label' => 'Nuestras Propiedades',
                'hero_title' => [
                    'es' => 'Nuestras **Propiedades**.',
                    'en' => 'Our **Properties**.',
                    'pt' => 'Nossas **Propriedades**.',
                ],
                'hero_subtitle' => [
                    'es' => 'Punta del Este.',
                    'en' => 'Punta del Este.',
                    'pt' => 'Punta del Este.',
                ],
            ],
            [
                'key' => 'quienes-somos',
                'label' => 'Quiénes Somos',
                'hero_title' => [
                    'es' => 'Acerca de Victoria Fones Real Estate.',
                    'en' => 'About Victoria Fones Real Estate.',
                    'pt' => 'Sobre Victoria Fones Real Estate.',
                ],
                'hero_subtitle' => [
                    'es' => '',
                    'en' => '',
                    'pt' => '',
                ],
            ],
            [
                'key' => 'contacto',
                'label' => 'Contacto',
                'hero_title' => [
                    'es' => 'Contacto.',
                    'en' => 'Contact.',
                    'pt' => 'Contato.',
                ],
                'hero_subtitle' => [
                    'es' => 'Estamos para ayudarte.',
                    'en' => "We're here to help.",
                    'pt' => 'Estamos aqui para ajudar.',
                ],
            ],
            [
                'key' => 'mapa',
                'label' => 'Mapa',
                'hero_title' => [
                    'es' => 'Explorá en el mapa.',
                    'en' => 'Explore on the map.',
                    'pt' => 'Explore no mapa.',
                ],
                'hero_subtitle' => [
                    'es' => 'Punta del Este.',
                    'en' => 'Punta del Este.',
                    'pt' => 'Punta del Este.',
                ],
            ],
        ];

        foreach ($pages as $page) {
            $existing = PageSetting::where('key', $page['key'])->first();
            if ($existing) {
                // Keep admin edits: only refresh the label.
                $existing->update(['label' => $page['label']]);

                continue;
            }
            PageSetting::create($page);
        }
    }
}
