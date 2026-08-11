<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LeadResource\Pages;
use App\Models\Lead;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class LeadResource extends Resource
{
    protected static ?string $model = Lead::class;

    protected static ?string $navigationIcon = 'heroicon-o-envelope';

    protected static ?string $navigationLabel = 'Consultas';

    protected static ?string $modelLabel = 'Consulta';

    protected static ?string $pluralModelLabel = 'Consultas';

    public const TYPE_LABELS = ['form' => 'Formulario', 'whatsapp' => 'WhatsApp'];

    public const TYPE_COLORS = ['form' => 'info', 'whatsapp' => 'success'];

    public static function getNavigationBadge(): ?string
    {
        $count = static::getModel()::whereNull('read_at')->count();

        return $count > 0 ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'danger';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('property_id')
                    ->label('Propiedad')
                    ->relationship('property', 'code')
                    ->disabled(),
                Forms\Components\Select::make('type')
                    ->label('Tipo')
                    ->options(self::TYPE_LABELS)
                    ->disabled(),
                Forms\Components\TextInput::make('name')->label('Nombre')->disabled(),
                Forms\Components\TextInput::make('email')->label('Email')->email()->disabled(),
                Forms\Components\TextInput::make('phone')->label('Teléfono')->tel()->disabled(),
                Forms\Components\Textarea::make('message')->label('Mensaje')->columnSpanFull()->disabled(),
                Forms\Components\TextInput::make('locale')->label('Idioma')->disabled(),
                Forms\Components\TextInput::make('source_url')->label('URL de origen')->disabled(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultPaginationPageOption(25)
            ->columns([
                Tables\Columns\IconColumn::make('read_at')
                    ->label('Leído')
                    ->boolean()
                    ->trueIcon('heroicon-o-envelope-open')
                    ->falseIcon('heroicon-o-envelope')
                    ->trueColor('gray')
                    ->falseColor('danger')
                    ->getStateUsing(fn (Lead $record): bool => $record->read_at !== null)
                    ->sortable(query: fn ($query, string $direction) => $query->orderBy('read_at', $direction)),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Fecha')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('type')
                    ->label('Tipo')
                    ->formatStateUsing(fn (string $state): string => self::TYPE_LABELS[$state] ?? $state)
                    ->badge()
                    ->color(fn (string $state): string => self::TYPE_COLORS[$state] ?? 'gray'),
                Tables\Columns\TextColumn::make('property.code')
                    ->label('Propiedad'),
                Tables\Columns\TextColumn::make('name')
                    ->label('Nombre')
                    ->searchable(),
                Tables\Columns\TextColumn::make('email')
                    ->label('Email')
                    ->searchable(),
                Tables\Columns\TextColumn::make('phone')
                    ->label('Teléfono')
                    ->searchable(),
                Tables\Columns\TextColumn::make('locale')
                    ->label('Idioma'),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('Tipo')
                    ->options(self::TYPE_LABELS),
                Tables\Filters\TernaryFilter::make('read_at')
                    ->label('Leído')
                    ->queries(
                        true: fn ($query) => $query->whereNotNull('read_at'),
                        false: fn ($query) => $query->whereNull('read_at'),
                    ),
            ])
            ->actions([
                Tables\Actions\ViewAction::make()->label('Ver'),
                Tables\Actions\Action::make('toggleRead')
                    ->label(fn (Lead $record): string => $record->read_at ? 'Marcar no leído' : 'Marcar leído')
                    ->icon(fn (Lead $record): string => $record->read_at ? 'heroicon-o-envelope' : 'heroicon-o-envelope-open')
                    ->color('gray')
                    ->action(function (Lead $record): void {
                        // read_at is deliberately not $fillable, so update([...])
                        // silently no-ops on it — set + save directly instead.
                        $record->read_at = $record->read_at ? null : now();
                        $record->save();
                    }),
                Tables\Actions\DeleteAction::make()->modalDescription('¿Estás seguro de que querés eliminar esta consulta? Esta acción no se puede deshacer.'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\BulkAction::make('markRead')
                        ->label('Marcar como leído')
                        ->icon('heroicon-o-envelope-open')
                        ->action(fn ($records) => $records->each(function (Lead $record): void {
                            $record->read_at = now();
                            $record->save();
                        }))
                        ->deselectRecordsAfterCompletion(),
                    Tables\Actions\BulkAction::make('markUnread')
                        ->label('Marcar como no leído')
                        ->icon('heroicon-o-envelope')
                        ->action(fn ($records) => $records->each(function (Lead $record): void {
                            $record->read_at = null;
                            $record->save();
                        }))
                        ->deselectRecordsAfterCompletion(),
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListLeads::route('/'),
            'view' => Pages\ViewLead::route('/{record}'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
