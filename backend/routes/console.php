<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Cron can't express a true rolling "every 15 days" — twiceMonthly (1st and
// 16th) is the standard way to approximate that cadence. media:prune-originals
// still only touches originals older than 15 days regardless of when it runs.
Schedule::command('media:prune-originals')->twiceMonthly(1, 16, '00:00');
