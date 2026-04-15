<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'n8n' => [
        'match_webhook_url' => env('N8N_MATCH_WEBHOOK_URL'),
        'seeker_webhook_url' => env('N8N_SEEKER_WEBHOOK_URL'),
        'seeker_resume_webhook_url' => env('N8N_SEEKER_RESUME_WEBHOOK_URL'),
        'basic_auth_user' => env('N8N_BASIC_AUTH_USER'),
        'basic_auth_password' => env('N8N_BASIC_AUTH_PASSWORD'),
        'timeout_seconds' => env('N8N_MATCH_TIMEOUT_SECONDS', 10),
        'id_verification_callback_secret' => env('N8N_SEEKER_ID_VERIFICATION_CALLBACK_SECRET'),
    ],

];
