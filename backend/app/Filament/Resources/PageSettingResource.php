<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PageSettingResource\Pages;
use App\Models\PageSetting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Concerns\Translatable;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PageSettingResource extends Resource
{
    use Translatable;

    protected static ?string $model = PageSetting::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationLabel = 'Encabezados de páginas';

    protected static ?string $modelLabel = 'Encabezado de página';

    protected static ?string $pluralModelLabel = 'Encabezados de páginas';

    protected static ?int $navigationSort = 90;

    public static function getTranslatableLocales(): array
    {
        return ['es', 'en', 'pt'];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('label')
                    ->label('Página')
                    ->disabled()
                    ->dehydrated(false)
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('hero_title')
                    ->label('Título del encabezado')
                    ->helperText('Primera línea del encabezado azul. Para dar formato: **negrita**, __subrayado__, *cursiva* (ej. Todas las propiedades en **Venta**).')
                    ->visible(fn (?PageSetting $record) => $record?->key !== 'home')
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('hero_subtitle')
                    ->label('Subtítulo')
                    ->helperText('Segunda línea (opcional).')
                    ->visible(fn (?PageSetting $record) => $record?->key !== 'home')
                    ->columnSpanFull(),
                Forms\Components\SpatieMediaLibraryFileUpload::make('hero')
                    ->label('Imagen de fondo')
                    ->collection('hero')
                    ->image()
                    ->helperText('Se recorta automáticamente a 1920×1080 en desktop y 828×1104 en mobile (se recorta desde el centro, así que en fotos horizontales conviene que lo importante esté centrado). Se convierte a WebP automáticamente. Si no se sube ninguna, se usa la imagen por defecto.')
                    ->visible(fn (?PageSetting $record) => $record?->key !== 'home')
                    ->columnSpanFull(),
                Forms\Components\Select::make('navbar_style')
                    ->label('Color del menú (antes de hacer scroll)')
                    ->options(['white' => 'Blanco', 'blue' => 'Azul'])
                    ->default('white')
                    ->required()
                    ->helperText('Elegí azul si la imagen de fondo es clara y el menú blanco no se lee bien. Una vez que se hace scroll, el menú siempre queda azul sólido con texto blanco.')
                    ->visible(fn (?PageSetting $record) => $record?->key !== 'home')
                    ->columnSpanFull(),
                Forms\Components\Section::make('Home')
                    ->description('Textos de la sección "Acerca de" y del listado de zonas en la página de inicio.')
                    ->visible(fn (?PageSetting $record) => $record?->key === 'home')
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
                        Forms\Components\TextInput::make('zones_title')
                            ->label('Título de "Propiedades por zona"')
                            ->columnSpanFull(),
                    ])
                    ->columns(1)
                    ->columnSpanFull(),
                Forms\Components\Section::make('Alquileres')
                    ->description('Permite ocultar temporalmente el listado de propiedades en alquiler (y el submenú de zonas) y mostrar en su lugar un texto informativo.')
                    ->visible(fn (?PageSetting $record) => $record?->key === 'alquiler')
                    ->schema([
                        Forms\Components\Toggle::make('rental_disabled')
                            ->label('Ocultar propiedades en alquiler')
                            ->helperText('Al activarlo, "Propiedades en Alquiler" deja de mostrar el listado y el submenú de zonas, y en su lugar se muestra el mensaje de abajo.')
                            ->inline(false),
                        Forms\Components\Textarea::make('rental_disabled_message')
                            ->label('Mensaje a mostrar')
                            ->rows(6)
                            ->helperText('Se muestra en lugar del listado mientras el alquiler está oculto. Dejá una línea en blanco entre párrafos.')
                            ->columnSpanFull(),
                    ])
                    ->columns(1)
                    ->columnSpanFull(),
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
                Tables\Columns\TextColumn::make('label')
                    ->label('Página')
                    ->searchable(),
                Tables\Columns\TextColumn::make('hero_title')
                    ->label('Título')
                    ->limit(50),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPageSettings::route('/'),
            'edit' => Pages\EditPageSetting::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
