<?php

namespace App\Filament\Resources\PageSettingResource\Pages;

use App\Filament\Resources\PageSettingResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Filament\Resources\Pages\EditRecord\Concerns\Translatable;

class EditPageSetting extends EditRecord
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
