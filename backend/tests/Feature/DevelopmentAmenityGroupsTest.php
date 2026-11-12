<?php

namespace Tests\Feature;

use App\Filament\Resources\DevelopmentResource\Pages\EditDevelopment;
use App\Models\Development;
use App\Models\Neighborhood;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class DevelopmentAmenityGroupsTest extends TestCase
{
    use RefreshDatabase;

    private function development(array $groups): Development
    {
        $development = new Development;
        $development->setTranslations('title', ['es' => 'La Morenita']);
        $development->setTranslations('slug', ['es' => 'la-morenita']);
        $development->setTranslations('amenity_groups', ['es' => $groups, 'en' => [], 'pt' => []]);
        $development->status = 'published';
        $development->neighborhood_id = Neighborhood::create([
            'name' => ['es' => 'José Ignacio'],
            'slug' => 'jose-ignacio',
        ])->id;
        $development->lat = -34.84;
        $development->lng = -54.63;
        $development->save();

        return $development;
    }

    public function test_api_returns_plain_strings_for_wrapped_items(): void
    {
        $this->development([
            ['title' => 'Deportes', 'items' => [
                ['item' => ['item' => 'Cancha de pádel']],
                ['item' => 'Cancha de fútbol'],
                'Juegos de madera',
            ]],
        ]);

        $groups = $this->getJson('/api/developments/la-morenita')->assertOk()->json('data.amenity_groups');

        $this->assertSame(
            ['Cancha de pádel', 'Cancha de fútbol', 'Juegos de madera'],
            $groups[0]['items'],
        );
    }

    public function test_saving_in_filament_does_not_nest_items_deeper(): void
    {
        $development = $this->development([
            ['title' => 'Deportes', 'items' => ['Cancha de pádel', 'Cancha de fútbol']],
        ]);

        $this->actingAs(User::factory()->create());

        Livewire::test(EditDevelopment::class, ['record' => $development->getRouteKey()])
            ->call('save')
            ->assertHasNoFormErrors();

        $stored = $development->fresh()->getTranslation('amenity_groups', 'es');

        $this->assertSame(['Cancha de pádel', 'Cancha de fútbol'], $stored[0]['items']);
    }

    public function test_filament_shows_wrapped_items_as_text_and_saves_them_clean(): void
    {
        $development = $this->development([
            ['title' => 'Deportes', 'items' => [['item' => ['item' => 'Cancha de pádel']], ['item' => 'Fogones']]],
        ]);

        $this->actingAs(User::factory()->create());

        $component = Livewire::test(EditDevelopment::class, ['record' => $development->getRouteKey()]);

        $component->call('save')->assertHasNoFormErrors();

        $stored = $development->fresh()->getTranslation('amenity_groups', 'es');
        $this->assertSame(['Cancha de pádel', 'Fogones'], $stored[0]['items']);
    }
}
