<?php

namespace App\Filament\Resources\PropertyResource\Pages;

use App\Filament\Resources\PropertyResource;
use App\Services\PropertyFichaPdf;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Filament\Resources\Pages\EditRecord\Concerns\Translatable;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EditProperty extends EditRecord
{
    use Translatable;

    protected static string $resource = PropertyResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\LocaleSwitcher::make(),
            Actions\Action::make('ficha')
                ->label('Descargar Ficha PDF')
                ->icon('heroicon-o-document-arrow-down')
                ->color('gray')
                ->action(function (): StreamedResponse {
                    $pdfService = app(PropertyFichaPdf::class);
                    $record = $this->getRecord();
                    $document = $pdfService->render($record);

                    // Livewire only intercepts StreamedResponse/BinaryFileResponse as a
                    // browser download — Barryvdh's own ->download() returns a plain
                    // Response, which Livewire instead tries to JSON-encode as a normal
                    // action return value and chokes on the raw PDF binary.
                    return response()->streamDownload(
                        fn () => print ($document->output()),
                        $pdfService->filename($record),
                        ['Content-Type' => 'application/pdf'],
                    );
                }),
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
