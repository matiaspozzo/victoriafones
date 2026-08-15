<?php

namespace App\Filament\Resources\HomeResource\Pages;

use App\Filament\Resources\HomeResource;
use App\Models\HomeSetting;
use Filament\Resources\Pages\ListRecords;

class ListHomeSettings extends ListRecords
{
    protected static string $resource = HomeResource::class;

    public function mount(): void
    {
        // Guarantees the singleton row exists even if HomeSettingSeeder never
        // ran (e.g. migrate without --seed on a fresh install).
        HomeSetting::current();

        parent::mount();
    }

    protected function getHeaderActions(): array
    {
        return [];
    }
}
