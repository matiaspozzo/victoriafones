<?php

namespace App\Filament\Resources\NeighborhoodResource\Pages;

use App\Filament\Resources\NeighborhoodResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Filament\Resources\Pages\EditRecord\Concerns\Translatable;

class EditNeighborhood extends EditRecord
{
    use Translatable;

    protected static string $resource = NeighborhoodResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\LocaleSwitcher::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
