<?php

namespace App\Filament\Resources;

use App\Filament\Resources\HomeResource\Pages;
use App\Models\HomeSetting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Concerns\Translatable;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class HomeResource extends Resource
{
    use Translatable;

    protected static ?string $model = HomeSetting::class;

    protected static ?string $navigationIcon = 'heroicon-o-home';

    protected static ?string $navigationLabel = 'Página de Inicio';

    protected static ?string $modelLabel = 'Página de Inicio';

    protected static ?string $pluralModelLabel = 'Página de Inicio';

    protected static ?int $navigationSort = 10;

    public static function getTranslatableLocales(): array
    {
        return ['es', 'en', 'pt'];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Acerca de')
                    ->description('Sección debajo del video, junto al botón "Ver Propiedades".')
                    ->schema([
                        Forms\Components\TextInput::make('about_title')
                            ->label('Título')
                            ->helperText('Para dar formato: **negrita**, __subrayado__, *cursiva*.')
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('about_body')
                            ->label('Texto')
                            ->rows(4)
                            ->helperText('Para dar formato: **negrita**, __subrayado__, *cursiva*.')
                            ->columnSpanFull(),
                    ]),
                Forms\Components\Section::make('Propiedades por zona')
                    ->description('El bloque de tarjetas con foto al final de la página de inicio.')
                    ->schema([
                        Forms\Components\TextInput::make('zones_title')
                            ->label('Título de la sección')
                            ->columnSpanFull(),
                        Forms\Components\Repeater::make('cards')
                            ->relationship('cards')
                            ->label('Tarjetas')
                            ->orderColumn('order')
                            ->schema([
                                Forms\Components\SpatieMediaLibraryFileUpload::make('image')
                                    ->label('Foto')
                                    ->collection('image')
                                    ->image()
                                    ->required()
                                    ->helperText('Se recorta automáticamente a 1200×675 y se convierte a WebP.')
                                    ->columnSpanFull(),
                                Forms\Components\TextInput::make('label')
                                    ->label('Texto')
                                    ->required()
                                    ->helperText('Ej. "Club de Mar". Igual en los 3 idiomas — no se traduce (es un nombre de lugar).'),
                                Forms\Components\TextInput::make('link')
                                    ->label('Link')
                                    ->required()
                                    ->helperText('Ej. /propiedades-en-venta/club-de-mar'),
                            ])
                            ->columns(2)
                            ->reorderable()
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => $state['label'] ?? null)
                            ->addActionLabel('Agregar tarjeta')
                            ->columnSpanFull(),
                    ]),
                Forms\Components\Section::make('SEO')
                    ->description('Título y descripción para buscadores (Google) y para la vista previa al compartir el link (WhatsApp, redes sociales). Si se dejan vacíos, se usa un texto genérico por defecto.')
                    ->schema([
                        Forms\Components\TextInput::make('seo_title')
                            ->label('SEO Title')
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('seo_description')
                            ->label('Meta Description')
                            ->rows(3)
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('about_title')
                    ->label('Título')
                    ->limit(50),
                Tables\Columns\TextColumn::make('cards_count')
                    ->label('Tarjetas')
                    ->counts('cards'),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Actualizado')
                    ->dateTime(),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->label('Editar'),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListHomeSettings::route('/'),
            'edit' => Pages\EditHomeSetting::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
