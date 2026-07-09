<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PropertyResource\Pages;
use App\Filament\Resources\PropertyResource\RelationManagers\RentalPricesRelationManager;
use App\Models\Amenity;
use App\Models\Neighborhood;
use App\Models\Property;
use Dotswan\MapPicker\Fields\Map;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Concerns\Translatable;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PropertyResource extends Resource
{
    use Translatable;

    /** Content locales, in display order. */
    public const LOCALE_NAMES = ['es' => 'Español', 'en' => 'Inglés', 'pt' => 'Portugués'];

    public const STATUS_LABELS = ['draft' => 'Borrador', 'published' => 'Publicado', 'archived' => 'Archivado'];

    // Filament's default badge color (gray) reads poorly against the dark
    // theme's panel background — pick explicit, theme-aware colors instead.
    public const STATUS_COLORS = ['draft' => 'warning', 'published' => 'success', 'archived' => 'gray'];

    public const OPERATION_LABELS = ['sale' => 'Venta', 'rent' => 'Alquiler', 'sale_and_rent' => 'Venta y alquiler'];

    public const OPERATION_COLORS = ['sale' => 'info', 'rent' => 'warning', 'sale_and_rent' => 'primary'];

    protected static ?string $model = Property::class;

    protected static ?string $navigationIcon = 'heroicon-o-home-modern';

    protected static ?string $navigationLabel = 'Propiedades';

    protected static ?string $modelLabel = 'Propiedad';

    protected static ?string $pluralModelLabel = 'Propiedades';

    public static function getTranslatableLocales(): array
    {
        return ['es', 'en', 'pt'];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Identificación')
                    ->columns(3)
                    ->schema([
                        Forms\Components\TextInput::make('code')
                            ->label('Código')
                            ->required()
                            ->unique(ignoreRecord: true),
                        Forms\Components\Select::make('status')
                            ->label('Estado')
                            ->options([
                                'draft' => 'Borrador',
                                'published' => 'Publicado',
                                'archived' => 'Archivado',
                            ])
                            ->default('draft')
                            ->required(),
                        Forms\Components\Toggle::make('featured')
                            ->label('Destacada')
                            ->inline(false),
                        Forms\Components\Select::make('operation')
                            ->label('Operación')
                            ->options([
                                'sale' => 'Venta',
                                'rent' => 'Alquiler',
                                'sale_and_rent' => 'Venta y alquiler',
                            ])
                            ->required(),
                        Forms\Components\Select::make('type')
                            ->label('Tipo')
                            ->options([
                                'house' => 'Casa',
                                'apartment' => 'Apartamento',
                                'land' => 'Terreno',
                                'chacra' => 'Chacra',
                                'commercial' => 'Comercial',
                            ])
                            ->required(),
                        Forms\Components\Select::make('neighborhood_id')
                            ->label('Barrio')
                            ->options(fn () => Neighborhood::query()->pluck('name', 'id')->map(fn ($name) => is_array($name) ? ($name['es'] ?? reset($name)) : $name))
                            ->searchable()
                            ->required(),
                    ]),

                Forms\Components\Section::make('Contenido')
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->label('Título')
                            ->required()
                            ->columnSpanFull(),
                        Forms\Components\TextInput::make('slug')
                            ->label('Slug')
                            ->required()
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('excerpt')
                            ->label('Resumen')
                            ->columnSpanFull(),
                        Forms\Components\RichEditor::make('description')
                            ->label('Descripción')
                            // Description is NOT pre-filled with Spanish; it stays blank
                            // until translated. Warn which locales are still missing.
                            ->hint(function (Forms\Components\RichEditor $component): ?string {
                                $missing = self::missingDescriptionLocales($component->getRecord());
                                $names = array_map(fn (string $locale): string => self::LOCALE_NAMES[$locale], $missing);

                                return $missing ? 'Falta traducir la descripción en: '.implode(', ', $names) : null;
                            })
                            ->hintColor('danger')
                            ->hintIcon(fn (Forms\Components\RichEditor $component): ?string => self::missingDescriptionLocales($component->getRecord()) ? 'heroicon-m-exclamation-triangle' : null)
                            ->columnSpanFull(),
                        Forms\Components\TextInput::make('seo_title')
                            ->label('SEO Title')
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('seo_description')
                            ->label('SEO Description')
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Precio y dimensiones')
                    ->columns(3)
                    ->schema([
                        Forms\Components\TextInput::make('price_usd')
                            ->label('Precio (USD)')
                            ->numeric()
                            ->prefix('USD')
                            ->helperText('Vacío = "Consultar"'),
                        Forms\Components\TextInput::make('bedrooms')
                            ->label('Dormitorios')
                            ->numeric(),
                        Forms\Components\TextInput::make('bathrooms')
                            ->label('Baños')
                            ->numeric(),
                        Forms\Components\TextInput::make('built_area_m2')
                            ->label('m² construidos')
                            ->numeric()
                            ->suffix('m²'),
                        Forms\Components\TextInput::make('lot_area_m2')
                            ->label('m² de lote')
                            ->numeric()
                            ->suffix('m²'),
                        Forms\Components\TextInput::make('year_built')
                            ->label('Año de construcción')
                            ->numeric(),
                    ]),

                Forms\Components\Section::make('Ubicación')
                    ->schema([
                        Map::make('location')
                            ->label('Ubicación en el mapa')
                            ->columnSpanFull()
                            ->defaultLocation(latitude: -34.83, longitude: -54.66) // José Ignacio
                            ->afterStateHydrated(function (Map $component, $state, $record) {
                                if ($record && $record->lat && $record->lng) {
                                    $component->state(['lat' => (float) $record->lat, 'lng' => (float) $record->lng]);
                                }
                            })
                            ->afterStateUpdated(function (callable $set, $state) {
                                $set('lat', $state['lat'] ?? null);
                                $set('lng', $state['lng'] ?? null);
                            })
                            ->live()
                            ->clickable(true),
                        Forms\Components\TextInput::make('lat')
                            ->label('Latitud')
                            ->numeric()
                            ->required(),
                        Forms\Components\TextInput::make('lng')
                            ->label('Longitud')
                            ->numeric()
                            ->required(),
                    ]),

                Forms\Components\Section::make('Amenities')
                    ->schema([
                        Forms\Components\CheckboxList::make('amenities')
                            ->relationship('amenities', 'slug')
                            ->getOptionLabelFromRecordUsing(fn (Amenity $record) => $record->name)
                            ->columns(3)
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Imágenes del hero (portada)')
                    ->description('Hasta 3 imágenes para el slider superior de la ficha. Si se deja vacío, se usan las primeras 3 de la galería.')
                    ->schema([
                        Forms\Components\SpatieMediaLibraryFileUpload::make('hero')
                            ->collection('hero')
                            ->image()
                            ->multiple()
                            ->reorderable()
                            ->maxFiles(3)
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Galería de fotos')
                    ->schema([
                        Forms\Components\SpatieMediaLibraryFileUpload::make('images')
                            ->collection('images')
                            ->image()
                            ->multiple()
                            ->reorderable()
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    /**
     * Locale codes whose description translation is still empty.
     *
     * @return array<int, string>
     */
    protected static function missingDescriptionLocales(?Property $record): array
    {
        if (! $record) {
            return [];
        }

        $missing = [];
        foreach (array_keys(self::LOCALE_NAMES) as $locale) {
            $value = (string) $record->getTranslation('description', $locale, false);
            if (blank(trim(strip_tags($value)))) {
                $missing[] = $locale;
            }
        }

        return $missing;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultPaginationPageOption(25)
            ->columns([
                Tables\Columns\SpatieMediaLibraryImageColumn::make('images')
                    ->collection('images')
                    ->conversion('thumb')
                    ->limit(1)
                    ->square()
                    ->size(56)
                    ->label('Foto'),
                Tables\Columns\TextColumn::make('code')
                    ->label('Código')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('title')
                    ->label('Título')
                    ->searchable(),
                Tables\Columns\TextColumn::make('missing_locales')
                    ->label('Falta idioma')
                    ->state(function (Property $record): array {
                        $missing = self::missingDescriptionLocales($record);

                        return $missing ? array_map('strtoupper', $missing) : ['OK'];
                    })
                    ->badge()
                    ->color(fn (string $state): string => $state === 'OK' ? 'success' : 'danger'),
                Tables\Columns\TextColumn::make('status')
                    ->label('Estado')
                    ->formatStateUsing(fn (string $state): string => self::STATUS_LABELS[$state] ?? $state)
                    ->badge()
                    ->color(fn (string $state): string => self::STATUS_COLORS[$state] ?? 'gray'),
                Tables\Columns\TextColumn::make('operation')
                    ->label('Operación')
                    ->formatStateUsing(fn (string $state): string => self::OPERATION_LABELS[$state] ?? $state)
                    ->badge()
                    ->color(fn (string $state): string => self::OPERATION_COLORS[$state] ?? 'gray'),
                Tables\Columns\TextColumn::make('type')
                    ->label('Tipo'),
                Tables\Columns\TextColumn::make('neighborhood.name')
                    ->label('Barrio'),
                Tables\Columns\TextColumn::make('price_usd')
                    ->label('Precio (USD)')
                    ->money('usd')
                    ->sortable(),
                Tables\Columns\IconColumn::make('featured')
                    ->label('Destacada')
                    ->boolean(),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Actualizado')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Estado')
                    ->options(self::STATUS_LABELS),
                Tables\Filters\SelectFilter::make('operation')
                    ->label('Operación')
                    ->options(self::OPERATION_LABELS),
                Tables\Filters\SelectFilter::make('type')
                    ->label('Tipo')
                    ->options([
                        'house' => 'Casa',
                        'apartment' => 'Apartamento',
                        'land' => 'Terreno',
                        'chacra' => 'Chacra',
                        'commercial' => 'Comercial',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->label('Editar'),
                Tables\Actions\DeleteAction::make()->modalDescription('¿Estás seguro de que querés eliminar esta propiedad? Esta acción no se puede deshacer.'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            RentalPricesRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProperties::route('/'),
            'create' => Pages\CreateProperty::route('/create'),
            'edit' => Pages\EditProperty::route('/{record}/edit'),
        ];
    }
}
