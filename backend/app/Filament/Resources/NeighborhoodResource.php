<?php

namespace App\Filament\Resources;

use App\Filament\Resources\NeighborhoodResource\Pages;
use App\Models\Neighborhood;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Concerns\Translatable;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class NeighborhoodResource extends Resource
{
    use Translatable;

    protected static ?string $model = Neighborhood::class;

    protected static ?string $navigationIcon = 'heroicon-o-map';

    protected static ?string $navigationLabel = 'Barrios';

    protected static ?string $modelLabel = 'Barrio';

    protected static ?string $pluralModelLabel = 'Barrios';

    public static function getTranslatableLocales(): array
    {
        return ['es', 'en', 'pt'];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('parent_id')
                    ->label('Barrio padre')
                    ->relationship('parent', 'slug')
                    ->searchable(),
                Forms\Components\TextInput::make('name')
                    ->label('Nombre')
                    ->required()
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn (Forms\Set $set, ?string $state) => $set('slug', Str::slug($state)))
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('slug')
                    ->label('Slug')
                    ->required()
                    ->unique(ignoreRecord: true),
                Forms\Components\Textarea::make('description')
                    ->label('Descripción')
                    ->helperText('Se muestra en la página de listado de este barrio (bloque título + descripción).')
                    ->rows(4)
                    ->columnSpanFull(),
                Forms\Components\SpatieMediaLibraryFileUpload::make('hero')
                    ->label('Imagen de fondo')
                    ->collection('hero')
                    ->image()
                    ->helperText('Se muestra en la página de listado de este barrio. Se recorta automáticamente a 1920×1080 en desktop y 828×1104 en mobile (desde el centro) y se convierte a WebP. Si no se sube ninguna, se usa la imagen por defecto de la zona.')
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('order')
                    ->label('Orden')
                    ->numeric()
                    ->default(0),
                Forms\Components\TextInput::make('center_lat')
                    ->label('Latitud central')
                    ->numeric(),
                Forms\Components\TextInput::make('center_lng')
                    ->label('Longitud central')
                    ->numeric(),
                Forms\Components\Section::make('SEO')
                    ->description('Metadatos para buscadores y para la vista previa al compartir el link (WhatsApp, redes sociales).')
                    ->schema([
                        Forms\Components\TextInput::make('seo_title')
                            ->label('SEO Title')
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('seo_description')
                            ->label('SEO Description')
                            ->columnSpanFull(),
                        Forms\Components\SpatieMediaLibraryFileUpload::make('og_image')
                            ->label('Imagen para compartir (OG image)')
                            ->collection('og_image')
                            ->image()
                            ->helperText('Se recorta automáticamente a 1200×630, el tamaño estándar para vistas previas. Si no se sube ninguna, se usa la imagen del sitio por defecto.')
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultPaginationPageOption(25)
            ->columns([
                Tables\Columns\SpatieMediaLibraryImageColumn::make('hero')
                    ->collection('hero')
                    ->conversion('desktop')
                    ->square()
                    ->size(56)
                    ->label('Imagen'),
                Tables\Columns\TextColumn::make('name')
                    ->label('Nombre')
                    ->searchable(),
                Tables\Columns\TextColumn::make('parent.name')
                    ->label('Padre'),
                Tables\Columns\TextColumn::make('slug')
                    ->label('Slug')
                    ->searchable(),
                Tables\Columns\TextColumn::make('order')
                    ->label('Orden')
                    ->sortable(),
            ])
            ->defaultSort('order')
            ->actions([
                Tables\Actions\EditAction::make()->label('Editar'),
                Tables\Actions\DeleteAction::make()->modalDescription('¿Estás seguro de que querés eliminar este barrio? Esta acción no se puede deshacer.'),
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
            'index' => Pages\ListNeighborhoods::route('/'),
            'create' => Pages\CreateNeighborhood::route('/create'),
            'edit' => Pages\EditNeighborhood::route('/{record}/edit'),
        ];
    }
}
