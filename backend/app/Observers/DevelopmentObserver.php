<?php

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

// Shared by Development and DevelopmentLot: any change to either refreshes
// the cached development pages, the home block and the map.
class DevelopmentObserver
{
    public function saved(Model $model): void
    {
        $this->revalidate();
    }

    public function deleted(Model $model): void
    {
        $this->revalidate();
    }

    private function revalidate(): void
    {
        $url = config('services.frontend.url');
        $secret = config('services.frontend.revalidate_secret');

        if (! $url || ! $secret) {
            return;
        }

        try {
            Http::timeout(5)->post(rtrim($url, '/').'/api/revalidate', [
                'secret' => $secret,
                'tags' => ['developments', 'properties'],
            ]);
        } catch (\Throwable $e) {
            Log::warning('Frontend revalidate request failed: '.$e->getMessage());
        }
    }
}
