<?php

namespace App\Filament\Widgets;

use App\Models\Lead;
use Carbon\Carbon;
use Filament\Widgets\ChartWidget;

class LeadsChartWidget extends ChartWidget
{
    protected static ?string $heading = 'Consultas recibidas (últimos 30 días)';

    protected function getData(): array
    {
        $days = collect(range(29, 0))->map(fn (int $i) => now()->subDays($i)->format('Y-m-d'));

        $counts = Lead::query()
            ->selectRaw('date(created_at) as day, count(*) as total')
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->groupBy('day')
            ->pluck('total', 'day');

        return [
            'datasets' => [
                [
                    'label' => 'Consultas',
                    'data' => $days->map(fn (string $day) => $counts[$day] ?? 0)->values(),
                    'borderColor' => '#03071c',
                    'backgroundColor' => 'rgba(3, 7, 28, 0.1)',
                ],
            ],
            'labels' => $days->map(fn (string $day) => Carbon::parse($day)->format('d/m'))->values(),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
