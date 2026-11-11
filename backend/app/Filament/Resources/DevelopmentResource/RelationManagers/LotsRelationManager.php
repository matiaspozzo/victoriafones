<?php

namespace App\Filament\Resources\DevelopmentResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class LotsRelationManager extends RelationManager
{
    protected static string $relationship = 'lots';

    protected static ?string $title = 'Lotes';

    public const STATUS_LABELS = ['available' => 'Disponible', 'reserved' => 'Reservado', 'sold' => 'Vendido'];

    public const STATUS_COLORS = ['available' => 'success', 'reserved' => 'warning', 'sold' => 'gray'];

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('label')
                    ->label('Identificador')
                    ->placeholder('Lote 12')
                    ->maxLength(100),
                Forms\Components\TextInput::make('area_m2')
                    ->label('Superficie')
                    ->numeric()
                    ->minValue(1)
                    ->suffix('m²')
                    ->required(),
                Forms\Components\TextInput::make('price_usd')
                    ->label('Precio (USD)')
                    ->numeric()
                    ->prefix('USD')
                    ->helperText('Vacío = "Consultar"'),
                Forms\Components\Select::make('status')
                    ->label('Estado')
                    ->options(self::STATUS_LABELS)
                    ->default('available')
                    ->required()
                    ->helperText('Los lotes vendidos no cuentan para "desde USD X".'),
                Forms\Components\TextInput::make('order')
                    ->label('Orden')
                    ->numeric()
                    ->default(0),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('label')
            ->defaultPaginationPageOption(25)
            ->columns([
                Tables\Columns\TextColumn::make('label')->label('Identificador'),
                Tables\Columns\TextColumn::make('area_m2')->label('Superficie')->suffix(' m²')->sortable(),
                Tables\Columns\TextColumn::make('price_usd')->label('Precio (USD)')->money('usd')->placeholder('Consultar')->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Estado')
                    ->formatStateUsing(fn (string $state): string => self::STATUS_LABELS[$state] ?? $state)
                    ->badge()
                    ->color(fn (string $state): string => self::STATUS_COLORS[$state] ?? 'gray'),
            ])
            ->defaultSort('order')
            ->headerActions([
                Tables\Actions\CreateAction::make()->label('Agregar lote'),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->label('Editar'),
                Tables\Actions\DeleteAction::make()->modalDescription('¿Estás seguro de que querés eliminar este lote? Esta acción no se puede deshacer.'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}
