<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$rows = Illuminate\Support\Facades\DB::table('job_matches')
    ->orderByDesc('id')
    ->limit(5)
    ->get(['id', 'match_score', 'match_reasons']);

foreach ($rows as $row) {
    echo '--- ID=' . $row->id . ' SCORE=' . $row->match_score . PHP_EOL;
    echo (string) $row->match_reasons . PHP_EOL . PHP_EOL;
}
