<?php

namespace App\Filament\Resources\NeighborhoodResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class FaqsRelationManager extends RelationManager
{
    protected static string $relationship = 'faqs';

    protected static ?string $title = 'Preguntas frecuentes';

    public static function getRecordTitleAttribute(): ?string
    {
        return 'question';
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('question')
                    ->label('Pregunta')
                    ->required()
                    ->columnSpanFull(),
                Forms\Components\Textarea::make('answer')
                    ->label('Respuesta')
                    ->required()
                    ->rows(3)
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('order')
                    ->label('Orden')
                    ->numeric()
                    ->default(0),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('question')
            ->defaultPaginationPageOption(25)
            ->columns([
                Tables\Columns\TextColumn::make('question')
                    ->label('Pregunta')
                    ->limit(60)
                    ->tooltip(fn (?string $state): ?string => $state),
                Tables\Columns\TextColumn::make('answer')
                    ->label('Respuesta')
                    ->limit(60)
                    ->tooltip(fn (?string $state): ?string => $state),
                Tables\Columns\TextColumn::make('order')
                    ->label('Orden'),
            ])
            ->defaultSort('order')
            ->reorderable('order')
            ->headerActions([
                Tables\Actions\CreateAction::make()->label('Crear'),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->label('Editar'),
                Tables\Actions\DeleteAction::make()->modalDescription('¿Estás seguro de que querés eliminar esta pregunta frecuente? Esta acción no se puede deshacer.'),
            ]);
    }
}
