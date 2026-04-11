<?php

require __DIR__ . '/../vendor/autoload.php';

use Illuminate\Support\Facades\DB;

$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = DB::table('users')
    ->whereNotNull('resume_path')
    ->where(function ($query) {
        $query->whereNull('resume_stored_name')
            ->orWhereNull('resume_original_name');
    })
    ->get(['id', 'resume_path', 'resume_stored_name', 'resume_original_name']);

$updated = 0;

foreach ($users as $user) {
    $storedName = $user->resume_stored_name;
    $originalName = $user->resume_original_name;

    $path = trim((string) $user->resume_path);
    $basename = $path !== '' ? basename($path) : null;

    if (!$storedName && $basename) {
        $storedName = $basename;
    }

    if (!$originalName && $storedName) {
        $originalName = $storedName;
    }

    if ($storedName || $originalName) {
        DB::table('users')
            ->where('id', $user->id)
            ->update([
                'resume_stored_name' => $storedName,
                'resume_original_name' => $originalName,
                'updated_at' => now(),
            ]);

        $updated++;
    }
}

echo "Backfill complete. Updated {$updated} user(s).\n";
echo "Eligible rows scanned: {$users->count()}.\n";
