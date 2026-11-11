<?php

namespace App\Filament\Resources\DevelopmentResource\Pages;

use App\Filament\Resources\DevelopmentResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;
use Filament\Resources\Pages\CreateRecord\Concerns\Translatable;

class CreateDevelopment extends CreateRecord
{
    use Translatable;

    protected static string $resource = DevelopmentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\LocaleSwitcher::make(),
        ];
    }
}
