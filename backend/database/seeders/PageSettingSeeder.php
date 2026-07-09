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
