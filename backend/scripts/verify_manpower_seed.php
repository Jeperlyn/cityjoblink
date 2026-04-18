<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$titles = [
    'Front End Cashier',
    'Service Crew',
    'Delivery Rider',
    'HR Staff',
    'Backroom Staff - Inbound',
    'Backroom Staff - Outbound',
    'Backroom Staff - Sortpack',
    'Backroom Staff - General',
    'Cook',
    'Kitchen Assistant',
    'Warehouse Helper',
    'All Around Maintenance',
    'Aircon Technician',
    'Field Assembler',
];

$targetCompanies = [
    'WIZARD MANPOWER AND ALLIED SERVICES INC.',
    "D'VINCI MANPOWER SERVICES CORP.",
    'STELLAR 167 MANPOWER RECRUITMENT & SERVICES INC.',
];

$baseQuery = Illuminate\Support\Facades\DB::table('jobs_catalog')
    ->whereIn('company', $targetCompanies)
    ->whereIn('title', $titles);

$total = (clone $baseQuery)->count();
$hrRule = Illuminate\Support\Facades\DB::table('jobs_catalog')
    ->where('company', 'WIZARD MANPOWER AND ALLIED SERVICES INC.')
    ->where('title', 'HR Staff')
    ->value('educational_attainment_required');
$nonHrShs = (clone $baseQuery)
    ->where('title', '!=', 'HR Staff')
    ->where('educational_attainment_required', 'At least Senior High School')
    ->count();

$perCompany = (clone $baseQuery)
    ->select('company', Illuminate\Support\Facades\DB::raw('COUNT(*) as total'))
    ->groupBy('company')
    ->pluck('total', 'company')
    ->all();

echo 'TOTAL=' . $total . PHP_EOL;
echo 'HR_EDU=' . ($hrRule ?? 'NULL') . PHP_EOL;
echo 'NON_HR_SHS=' . $nonHrShs . PHP_EOL;
echo 'COMPANY_BREAKDOWN=' . json_encode($perCompany, JSON_UNESCAPED_UNICODE) . PHP_EOL;
