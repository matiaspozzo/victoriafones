<?php

namespace App\Filament\Resources\DevelopmentResource\Pages;

use App\Filament\Resources\DevelopmentResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Filament\Resources\Pages\EditRecord\Concerns\Translatable;

class EditDevelopment extends EditRecord
{
    use Translatable;

    protected static string $resource = DevelopmentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\LocaleSwitcher::make(),
            Actions\DeleteAction::make(),
        ];
    }

    /**
     * Seed Nombre and Slug with the Spanish value for locales not translated
     * yet, as a starting point (same behaviour as properties).
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
