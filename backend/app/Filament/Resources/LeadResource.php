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
            ])
            ->actions([
                Tables\Actions\ViewAction::make()->label('Ver'),
                Tables\Actions\DeleteAction::make()->modalDescription('¿Estás seguro de que querés eliminar esta consulta? Esta acción no se puede deshacer.'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
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
