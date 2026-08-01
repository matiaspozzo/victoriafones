<?php

namespace App\Filament\Resources\SiteSettingResource\Pages;

use App\Filament\Resources\SiteSettingResource;
use App\Models\SiteSetting;
use Filament\Resources\Pages\ListRecords;

class ListSiteSettings extends ListRecords
{
    protected static string $resource = SiteSettingResource::class;

    public function mount(): void
    {
        // Guarantees the singleton row exists even if SiteSettingSeeder never ran
        // (e.g. migrate without --seed on a fresh install).
        SiteSetting::current();

        parent::mount();
    }

    protected function getHeaderActions(): array
    {
        return [];
    }
}
