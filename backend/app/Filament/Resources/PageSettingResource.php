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
                    ->helperText('Primera línea del encabezado azul. Usá **doble asterisco** para poner una palabra en negrita (ej. Todas las propiedades en **Venta**).')
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('hero_subtitle')
                    ->label('Subtítulo')
                    ->helperText('Segunda línea (opcional).')
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultPaginationPageOption(25)
            ->columns([
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
