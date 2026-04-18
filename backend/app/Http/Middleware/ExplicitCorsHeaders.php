<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ExplicitCorsHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->header('Origin');

        $allowedOrigins = (array) config('cors.allowed_origins', []);
        $allowedOriginPatterns = (array) config('cors.allowed_origins_patterns', []);

        $isPatternAllowed = false;
        if ($origin) {
            foreach ($allowedOriginPatterns as $pattern) {
                if (@preg_match($pattern, $origin)) {
                    $isPatternAllowed = true;
                    break;
                }
            }
        }

        $isAllowed = $origin && (in_array($origin, $allowedOrigins, true) || $isPatternAllowed);

        // Handle preflight requests
        if ($request->isMethod('OPTIONS')) {
            $response = response('', 200);
        } else {
            $response = $next($request);
        }

        // Add CORS headers if origin is allowed
        if ($isAllowed) {
            $allowHeaders = $request->header(
                'Access-Control-Request-Headers',
                'Content-Type, Authorization, X-Requested-With, Accept, ngrok-skip-browser-warning'
            );

            $response->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', $allowHeaders)
                ->header('Access-Control-Allow-Credentials', 'false')
                ->header('Access-Control-Max-Age', '86400');
        }

        return $response;
    }
}
