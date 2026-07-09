<?php

namespace App\Filament\Resources\PropertyResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class RentalPricesRelationManager extends RelationManager
{
    protected static string $relationship = 'rentalPrices';

    protected static ?string $title = 'Precios de alquiler';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('label')
                    ->label('Temporada / período')
                    ->required(),
                Forms\Components\TextInput::make('price_usd')
                    ->label('Precio (USD)')
                    ->numeric()
                    ->prefix('USD')
                    ->required(),
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
                Tables\Columns\TextColumn::make('label'),
                Tables\Columns\TextColumn::make('price_usd')->money('usd'),
                Tables\Columns\TextColumn::make('order'),
            ])
            ->defaultSort('order')
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ]);
    }
}
