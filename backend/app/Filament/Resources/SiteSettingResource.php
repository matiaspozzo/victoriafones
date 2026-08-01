<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SiteSettingResource\Pages;
use App\Models\SiteSetting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SiteSettingResource extends Resource
{
    protected static ?string $model = SiteSetting::class;

    protected static ?string $navigationIcon = 'heroicon-o-chart-bar';

    protected static ?string $navigationLabel = 'Scripts de tracking';

    protected static ?string $modelLabel = 'Scripts de tracking';

    protected static ?string $pluralModelLabel = 'Scripts de tracking';

    protected static ?int $navigationSort = 91;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Google Analytics')
                    ->schema([
                        Forms\Components\TextInput::make('google_analytics_id')
                            ->label('Measurement ID')
                            ->placeholder('G-XXXXXXXXXX')
                            ->helperText('El ID que empieza con "G-" (Admin → Data Streams, en Google Analytics). Vacío = no se carga.')
                            ->columnSpanFull(),
                    ]),
                Forms\Components\Section::make('Meta / Facebook Pixel')
                    ->schema([
                        Forms\Components\TextInput::make('facebook_pixel_id')
                            ->label('Pixel ID')
                            ->placeholder('123456789012345')
                            ->helperText('El ID numérico del pixel (Meta Events Manager → Data Sources). Vacío = no se carga.')
                            ->columnSpanFull(),
                    ]),
                Forms\Components\Section::make('Scripts adicionales')
                    ->description('Para cualquier otro script de tracking (Hotjar, LinkedIn, TikTok, etc.) que todavía no tiene su propio campo. Se agrega tal cual al final del <head> del sitio — solo HTML/JS de confianza.')
                    ->schema([
                        Forms\Components\Textarea::make('additional_scripts')
                            ->label('HTML/JS')
                            ->rows(6)
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('google_analytics_id')
                    ->label('Google Analytics')
                    ->placeholder('— no configurado —'),
                Tables\Columns\TextColumn::make('facebook_pixel_id')
                    ->label('Facebook Pixel')
                    ->placeholder('— no configurado —'),
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
            'index' => Pages\ListSiteSettings::route('/'),
            'edit' => Pages\EditSiteSetting::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
