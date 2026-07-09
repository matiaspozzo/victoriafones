<?php

namespace App\Observers;

use App\Models\Property;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PropertyObserver
{
    public function created(Property $property): void
    {
        $this->revalidate($property);
    }

    public function updated(Property $property): void
    {
        $this->revalidate($property);
    }

    public function deleted(Property $property): void
    {
        $this->revalidate($property);
    }

    public function restored(Property $property): void
    {
        $this->revalidate($property);
    }

    public function forceDeleted(Property $property): void
    {
        $this->revalidate($property);
    }

    private function revalidate(Property $property): void
    {
        $url = config('services.frontend.url');
        $secret = config('services.frontend.revalidate_secret');

        if (! $url || ! $secret) {
            return;
        }

        try {
            Http::timeout(5)->post(rtrim($url, '/').'/api/revalidate', [
                'secret' => $secret,
                'tags' => ['properties', "property:{$property->code}"],
            ]);
        } catch (\Throwable $e) {
            Log::warning('Frontend revalidate request failed: '.$e->getMessage());
        }
    }
}
