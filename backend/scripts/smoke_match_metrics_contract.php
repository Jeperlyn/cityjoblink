<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = Illuminate\Support\Facades\DB::table('users')
    ->where('role', 'Seeker')
    ->whereNotNull('email')
    ->first(['id', 'email']);

$job = Illuminate\Support\Facades\DB::table('jobs_catalog')
    ->first(['id']);

if (!$user || !$job) {
    echo "NO_DATA" . PHP_EOL;
    exit(0);
}

$url = 'http://127.0.0.1:8000/api/match-metrics?email=' . urlencode((string) $user->email) . '&job_id=' . (int) $job->id;
$response = @file_get_contents($url);

echo ($response === false ? 'REQUEST_FAILED' : $response) . PHP_EOL;
