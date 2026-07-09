<?php

namespace App\Filament\Resources\NeighborhoodResource\Pages;

use App\Filament\Resources\NeighborhoodResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;
use Filament\Resources\Pages\CreateRecord\Concerns\Translatable;

class CreateNeighborhood extends CreateRecord
{
    use Translatable;

    protected static string $resource = NeighborhoodResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\LocaleSwitcher::make(),
        ];
    }
}
