<?php

namespace App\Filament\Resources\LeadResource\Pages;

use App\Filament\Resources\LeadResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewLead extends ViewRecord
{
    protected static string $resource = LeadResource::class;

    public function mount(int|string $record): void
    {
        parent::mount($record);

        // Opening a lead is the natural "I've seen this" signal, same as an
        // email inbox — no separate click needed to clear it off the badge.
        // Set + save directly rather than update([...]) — read_at is
        // deliberately not in $fillable (kept out of the disabled lead form),
        // and mass-assignment silently skips non-fillable attributes instead
        // of throwing, so update() looked like it worked but never wrote it.
        if ($this->record->read_at === null) {
            $this->record->read_at = now();
            $this->record->save();
        }
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('toggleRead')
                ->label(fn (): string => $this->record->read_at ? 'Marcar no leído' : 'Marcar leído')
                ->icon(fn (): string => $this->record->read_at ? 'heroicon-o-envelope' : 'heroicon-o-envelope-open')
                ->color('gray')
                ->action(function (): void {
                    $this->record->read_at = $this->record->read_at ? null : now();
                    $this->record->save();
                }),
            Actions\DeleteAction::make(),
        ];
    }
}
