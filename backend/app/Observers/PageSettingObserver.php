<?php

namespace App\Observers;

use App\Models\PageSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PageSettingObserver
{
    public function saved(PageSetting $page): void
    {
        $url = config('services.frontend.url');
        $secret = config('services.frontend.revalidate_secret');

        if (! $url || ! $secret) {
            return;
        }

        try {
            Http::timeout(5)->post(rtrim($url, '/').'/api/revalidate', [
                'secret' => $secret,
                'tags' => ['properties'],
            ]);
        } catch (\Throwable $e) {
            Log::warning('Frontend revalidate request failed: '.$e->getMessage());
        }
    }
}
