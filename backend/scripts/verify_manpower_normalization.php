<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$companies = [
    'WIZARD MANPOWER AND ALLIED SERVICES INC.',
    "D'VINCI MANPOWER SERVICES CORP.",
    'STELLAR 167 MANPOWER RECRUITMENT & SERVICES INC.',
];

$db = Illuminate\Support\Facades\DB::table('jobs_catalog');

$oldTitle = (clone $db)
    ->whereIn('company', $companies)
    ->where('title', '3 Wheels Delivery Rider')
    ->count();

$newTitle = (clone $db)
    ->whereIn('company', $companies)
    ->where('title', 'Delivery Rider')
    ->count();

$metroSuffix = (clone $db)
    ->whereIn('company', $companies)
    ->where('location', 'like', '%Metro Manila%')
    ->count();

echo 'OLD_TITLE=' . $oldTitle . PHP_EOL;
echo 'NEW_TITLE=' . $newTitle . PHP_EOL;
echo 'METRO_SUFFIX=' . $metroSuffix . PHP_EOL;
