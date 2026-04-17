<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // We changed this to '*' to allow your friend's IP to talk to your database
'allowed_origins' => [
    'http://localhost:5173', 
    'https://cityjoblink-frontend.vercel.app', // Your Vercel frontend
    'https://cityjoblink-frontend-git-main-jeperlyns-projects.vercel.app',
    'https://cityjoblink-frontend.vercel.app',
    'https://cityjoblink-frontend-g4t7rtauq-jeperlyns-projects.vercel.app',
    'https://choosy-showroom-baking.ngrok-free.dev', // Your new public API
],
    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
