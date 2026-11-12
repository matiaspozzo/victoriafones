<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DevelopmentResource\Pages;
use App\Filament\Resources\DevelopmentResource\RelationManagers\LotsRelationManager;
use App\Models\Amenity;
use App\Models\Development;
use App\Models\Neighborhood;
use Dotswan\MapPicker\Fields\Map;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Concerns\Translatable;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class DevelopmentResource extends Resource
{
    use Translatable;

    public const STATUS_LABELS = ['draft' => 'Borrador', 'published' => 'Publicado', 'archived' => 'Archivado'];

    public const STATUS_COLORS = ['draft' => 'warning', 'published' => 'success', 'archived' => 'gray'];

    protected static ?string $model = Development::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';

    protected static ?string $navigationLabel = 'Desarrollos';

    protected static ?string $modelLabel = 'Desarrollo';

    protected static ?string $pluralModelLabel = 'Desarrollos';

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
                        Forms\Components\Select::make('status')
                            ->label('Estado')
                            ->options(self::STATUS_LABELS)
                            ->default('draft')
                            ->required(),
                        Forms\Components\Select::make('neighborhood_id')
                            ->label('Barrio / lugar')
                            ->options(fn () => Neighborhood::indentedOptions())
                            ->searchable()
                            ->required(),
                        Forms\Components\TextInput::make('order')
                            ->label('Orden')
                            ->numeric()
                            ->default(0)
                            ->helperText('Menor número = aparece primero.'),
                    ]),

                Forms\Components\Section::make('Datos de la tarjeta')
                    ->description('Para mostrar "Lotes de X m² desde USD X" cuando no se cargan los lotes uno por uno. Si hay lotes cargados en la solapa Lotes, esos valores tienen prioridad; estos completan lo que falte (por ejemplo, el precio).')
                    ->columns(4)
                    ->collapsible()
                    ->schema([
                        Forms\Components\TextInput::make('lots_total')->label('Cantidad de lotes')->numeric()->minValue(0),
                        Forms\Components\TextInput::make('area_min_m2')->label('Lote más chico (m²)')->numeric()->minValue(0),
                        Forms\Components\TextInput::make('area_max_m2')->label('Lote más grande (m²)')->numeric()->minValue(0),
                        Forms\Components\TextInput::make('price_from_usd')
                            ->label('Precio desde (USD)')
                            ->numeric()
                            ->minValue(0)
                            ->helperText('Vacío = "Consultar".'),
                    ]),

                Forms\Components\Section::make('Conocé el proyecto')
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->label('Nombre del desarrollo')
                            ->required()
                            ->live(onBlur: true)
                            ->afterStateUpdated(function (Forms\Set $set, Forms\Get $get, ?string $state) {
                                if (blank($get('slug'))) {
                                    $set('slug', Str::slug($state));
                                }
                            })
                            ->columnSpanFull(),
                        Forms\Components\TextInput::make('slug')
                            ->label('Slug')
                            ->required()
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('excerpt')
                            ->label('Resumen')
                            ->columnSpanFull(),
                        Forms\Components\RichEditor::make('description')
                            ->label('Texto del proyecto')
                            ->columnSpanFull(),
                        Forms\Components\TextInput::make('seo_title')
                            ->label('SEO Title')
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('seo_description')
                            ->label('SEO Description')
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Servicios y Amenities')
                    ->description('Elegí las que correspondan. Si falta alguna, podés crearla desde el mismo selector.')
                    ->schema([
                        Forms\Components\Select::make('amenities')
                            ->label('Amenities')
                            ->relationship('amenities', 'slug')
                            ->getOptionLabelFromRecordUsing(fn (Amenity $record) => $record->name)
                            ->multiple()
                            ->preload()
                            ->searchable(false)
                            ->createOptionForm([
                                Forms\Components\TextInput::make('name_es')->label('Nombre (Español)')->required(),
                                Forms\Components\TextInput::make('name_en')->label('Nombre (Inglés)')->required(),
                                Forms\Components\TextInput::make('name_pt')->label('Nombre (Portugués)')->required(),
                            ])
                            ->createOptionUsing(function (array $data): int {
                                $slug = Str::slug($data['name_en']);
                                $amenity = Amenity::firstOrCreate(
                                    ['slug' => $slug],
                                    [
                                        'name' => ['es' => $data['name_es'], 'en' => $data['name_en'], 'pt' => $data['name_pt']],
                                        'icon' => 'check',
                                        'order' => (int) Amenity::query()->max('order') + 1,
                                    ],
                                );

                                return $amenity->getKey();
                            })
                            ->columnSpanFull(),
                        Forms\Components\Repeater::make('amenity_groups')
                            ->label('Amenities agrupadas (con detalle)')
                            ->helperText('Opcional. Para armar bloques como "Clubhouse & Wellness" con sus ítems y medidas. Se traduce por idioma (solapas ES / EN / PT).')
                            ->schema([
                                Forms\Components\TextInput::make('title')->label('Título del grupo')->required(),
                                Forms\Components\Repeater::make('items')
                                    ->label('Ítems')
                                    ->simple(Forms\Components\TextInput::make('item')->required())
                                    // Runs after the repeater wraps each value as ['item' => value]. Older rows were
                                    // stored already wrapped ({"item": "text"}), which ends up double-wrapped and
                                    // shows as [object Object]; unwrap to the text but keep the item keys.
                                    ->formatStateUsing(fn ($state) => collect($state ?? [])
                                        ->map(fn ($row) => ['item' => Development::itemText($row)])
                                        ->all())
                                    ->addActionLabel('Agregar ítem')
                                    ->reorderable(),
                            ])
                            ->itemLabel(fn (array $state): ?string => $state['title'] ?? null)
                            ->addActionLabel('Agregar grupo')
                            ->collapsible()
                            ->reorderable()
                            ->defaultItems(0)
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Fotos')
                    ->description('La primera foto es la portada de la tarjeta. Todas se muestran en el slider de la ficha.')
                    ->schema([
                        Forms\Components\SpatieMediaLibraryFileUpload::make('images')
                            ->collection('images')
                            ->conversion('card')
                            ->image()
                            ->multiple()
                            ->reorderable()
                            ->maxSize(32768)
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Masterplan')
                    ->schema([
                        Forms\Components\SpatieMediaLibraryFileUpload::make('masterplan')
                            ->collection('masterplan')
                            ->conversion('full')
                            ->image()
                            ->maxSize(32768)
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('masterplan_caption')
                            ->label('Leyenda / referencias del masterplan')
                            ->rows(2)
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Superficies')
                    ->description('Tabla opcional (lotes, áreas comunes, total…). Los nombres se cargan en los tres idiomas.')
                    ->collapsible()
                    ->schema([
                        Forms\Components\Repeater::make('surfaces')
                            ->label('Filas')
                            ->schema([
                                Forms\Components\TextInput::make('label_es')->label('Nombre (Español)')->required(),
                                Forms\Components\TextInput::make('label_en')->label('Nombre (Inglés)'),
                                Forms\Components\TextInput::make('label_pt')->label('Nombre (Portugués)'),
                                Forms\Components\TextInput::make('m2')->label('Superficie (m²)')->numeric()->required(),
                                Forms\Components\Toggle::make('is_total')->label('Es el total (se destaca)')->inline(false),
                            ])
                            ->columns(5)
                            ->itemLabel(fn (array $state): ?string => $state['label_es'] ?? null)
                            ->addActionLabel('Agregar fila')
                            ->reorderable()
                            ->defaultItems(0)
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Ubicación')
                    ->schema([
                        Forms\Components\Textarea::make('location_text')
                            ->label('Texto de ubicación (accesos, distancias)')
                            ->rows(3)
                            ->columnSpanFull(),
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
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultPaginationPageOption(25)
            ->defaultSort('order')
            ->columns([
                Tables\Columns\SpatieMediaLibraryImageColumn::make('images')
                    ->collection('images')
                    ->conversion('thumb')
                    ->limit(1)
                    ->square()
                    ->size(56)
                    ->label('Foto'),
                Tables\Columns\TextColumn::make('title')
                    ->label('Nombre')
                    ->searchable(),
                Tables\Columns\TextColumn::make('neighborhood.name')
                    ->label('Lugar'),
                Tables\Columns\TextColumn::make('lots_count')
                    ->label('Lotes')
                    ->counts('lots'),
                Tables\Columns\TextColumn::make('status')
                    ->label('Estado')
                    ->formatStateUsing(fn (string $state): string => self::STATUS_LABELS[$state] ?? $state)
                    ->badge()
                    ->color(fn (string $state): string => self::STATUS_COLORS[$state] ?? 'gray'),
                Tables\Columns\TextColumn::make('order')
                    ->label('Orden')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Estado')
                    ->options(self::STATUS_LABELS),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->label('Editar'),
                Tables\Actions\DeleteAction::make()->modalDescription('¿Estás seguro de que querés eliminar este desarrollo y todos sus lotes? Esta acción no se puede deshacer.'),
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
            LotsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDevelopments::route('/'),
            'create' => Pages\CreateDevelopment::route('/create'),
            'edit' => Pages\EditDevelopment::route('/{record}/edit'),
        ];
    }
}
