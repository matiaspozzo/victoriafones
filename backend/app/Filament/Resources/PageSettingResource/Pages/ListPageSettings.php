<?php

namespace App\Filament\Resources\PageSettingResource\Pages;

use App\Filament\Resources\PageSettingResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
use Filament\Resources\Pages\ListRecords\Concerns\Translatable;

class ListPageSettings extends ListRecords
{
    use Translatable;

    protected static string $resource = PageSettingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\LocaleSwitcher::make(),
        ];
    }
}
