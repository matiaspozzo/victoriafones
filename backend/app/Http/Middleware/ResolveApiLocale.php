<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveApiLocale
{
    private const SUPPORTED = ['es', 'en', 'pt'];

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->query('locale');
        $locale = in_array($locale, self::SUPPORTED, true) ? $locale : 'es';

        $request->attributes->set('locale', $locale);
        app()->setLocale($locale);

        return $next($request);
    }
}
