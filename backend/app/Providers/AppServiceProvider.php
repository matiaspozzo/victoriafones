<?php

namespace App\Providers;

use App\Models\Neighborhood;
use App\Models\PageSetting;
use App\Models\Property;
use App\Models\SiteSetting;
use App\Observers\NeighborhoodObserver;
use App\Observers\PageSettingObserver;
use App\Observers\PropertyObserver;
use App\Observers\SiteSettingObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Property::observe(PropertyObserver::class);
        PageSetting::observe(PageSettingObserver::class);
        Neighborhood::observe(NeighborhoodObserver::class);
        SiteSetting::observe(SiteSettingObserver::class);
    }
}
