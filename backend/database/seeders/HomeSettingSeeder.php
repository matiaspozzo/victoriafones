<?php

namespace Database\Seeders;

use App\Models\HomeSetting;
use App\Models\HomeZoneCard;
use Illuminate\Database\Seeder;

class HomeSettingSeeder extends Seeder
{
    public function run(): void
    {
        $setting = HomeSetting::current();

        // Keep admin edits on reseed: only fill in the text fields the very
        // first time (when they're still empty).
        if (blank($setting->getTranslation('about_title', 'es', false))) {
            $setting->setTranslations('about_title', [
                'es' => 'Tenemos la propiedad perfecta para cada cliente.',
                'en' => 'We have the perfect property for every client.',
                'pt' => 'Temos o imóvel perfeito para cada cliente.',
            ]);
            $setting->setTranslations('about_body', [
                'es' => '**Asesoramiento inmobiliario — para quienes buscan el lugar correcto y la inversión correcta**. En cada operación aplicamos información real, criterio genuino y un conocimiento profundo de José Ignacio, con seriedad y profesionalismo absolutos. José Ignacio es nuestro mercado, nuestra casa y nuestra especialidad.',
                'en' => '**Real estate advisory — for those seeking the right place and the right investment**. In every transaction we apply real information, genuine judgment, and a deep knowledge of José Ignacio, with absolute seriousness and professionalism. José Ignacio is our market, our home, and our specialty.',
                'pt' => '**Assessoria imobiliária — para quem busca o lugar certo e o investimento certo**. Em cada operação aplicamos informação real, critério genuíno e um profundo conhecimento de José Ignacio, com seriedade e profissionalismo absolutos. José Ignacio é o nosso mercado, a nossa casa e a nossa especialidade.',
            ]);
            $setting->setTranslations('zones_title', [
                'es' => 'Propiedades en Venta por Zona',
                'en' => 'Properties for Sale by Zone',
                'pt' => 'Propriedades à Venda por Zona',
            ]);
            // Matches what was previously hardcoded as Home.metaTitle/
            // metaDescription in messages.json, before those fields existed
            // here — same starting point, now editable.
            $setting->setTranslations('seo_title', [
                'es' => 'Propiedades en Venta, Alquiler y Administración en José Ignacio | Victoria Fones Real Estate',
                'en' => 'Properties for Sale, Rent and Management in José Ignacio | Victoria Fones Real Estate',
                'pt' => 'Imóveis à Venda, Aluguel e Administração em José Ignacio | Victoria Fones Real Estate',
            ]);
            $setting->setTranslations('seo_description', [
                'es' => 'Compra, venta, alquiler y administración de propiedades en José Ignacio, Punta del Este. Inmobiliaria boutique con conocimiento profundo de cada zona.',
                'en' => 'Buy, sell, rent and manage properties in José Ignacio, Punta del Este. A boutique real estate agency with deep local market knowledge.',
                'pt' => 'Compra, venda, aluguel e administração de imóveis em José Ignacio, Punta del Este. Imobiliária boutique com profundo conhecimento de cada região.',
            ]);
            $setting->save();
        }

        if ($setting->cards()->exists()) {
            return;
        }

        // Same photos/order/links the frontend previously hardcoded in
        // NeighborhoodGrid.tsx (ZONES) — seeded from the frontend's public/
        // folder so the home page looks identical right after this migrates,
        // before anyone touches the new admin UI.
        $publicDir = base_path('../frontend/public/neighborhoods');

        $cards = [
            ['label' => 'Pueblo José Ignacio', 'link' => '/propiedades-en-venta/pueblo-jose-ignacio', 'file' => 'home-links-jose-ignacio-town.webp'],
            ['label' => 'Pinar del Faro', 'link' => '/propiedades-en-venta/pinar-del-faro', 'file' => 'home-links-pinar-del-faro.webp'],
            ['label' => 'Club de Mar', 'link' => '/propiedades-en-venta/club-de-mar', 'file' => 'home-links-club-de-mar.webp'],
            ['label' => 'Laguna Escondida', 'link' => '/propiedades-en-venta/laguna-escondida', 'file' => 'home-links-laguna-escondida-v2.webp'],
            ['label' => 'Otras Zonas', 'link' => '/propiedades-en-venta/otras-zonas', 'file' => 'home-links-playa-brava.webp'],
            ['label' => 'Alrededores', 'link' => '/propiedades-en-venta/alrededores', 'file' => 'home-links-alrededores.webp'],
        ];

        foreach ($cards as $i => $data) {
            $card = HomeZoneCard::create([
                'home_setting_id' => $setting->id,
                'label' => $data['label'],
                'link' => $data['link'],
                'order' => $i,
            ]);

            $path = "{$publicDir}/{$data['file']}";
            if (is_file($path)) {
                $card->addMedia($path)->preservingOriginal()->toMediaCollection('image');
            }
        }
    }
}
