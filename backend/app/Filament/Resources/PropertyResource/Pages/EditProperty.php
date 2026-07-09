<?php

namespace App\Filament\Resources\PropertyResource\Pages;

use App\Filament\Resources\PropertyResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Filament\Resources\Pages\EditRecord\Concerns\Translatable;

class EditProperty extends EditRecord
{
    use Translatable;

    protected static string $resource = PropertyResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\LocaleSwitcher::make(),
            Actions\DeleteAction::make(),
        ];
    }

    /**
     * The translatable plugin calls this per locale while loading the form.
     * For empty locales we seed Título and Slug with the Spanish value as a
     * starting point — but leave the description blank until it's translated.
     */
    protected function mutateFormDataBeforeFill(array $data): array
    {
        $record = $this->getRecord();

        foreach (['title', 'slug'] as $field) {
            if (blank($data[$field] ?? null)) {
                $spanish = $record->getTranslation($field, 'es', false);
                if (filled($spanish)) {
                    $data[$field] = $spanish;
                }
            }
        }

        return $data;
    }
}
