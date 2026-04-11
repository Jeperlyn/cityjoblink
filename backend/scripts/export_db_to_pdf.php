<?php

require __DIR__ . '/../vendor/autoload.php';

use Dompdf\Dompdf;
use Illuminate\Foundation\Application;

// Bootstrap Laravel application so we can use DB facade and env
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

// Create backups directory if missing
$backupDir = __DIR__ . '/../backups';
if (!is_dir($backupDir)) {
    mkdir($backupDir, 0755, true);
}

$ts = date('Y-m-d_H-i-s');
$outPdf = $backupDir . "/db_report_{$ts}.pdf";

// Fetch table list for Postgres via information_schema
$tables = array_map(function($r){ return $r->table_name; }, DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type='BASE TABLE' ORDER BY table_name"));

$html = '<!doctype html><html><head><meta charset="utf-8"><title>DB Report</title>';
$html .= '<style>body{font-family: DejaVu Sans, sans-serif;} table{border-collapse:collapse;width:100%;margin-bottom:1rem} th,td{border:1px solid #ccc;padding:6px;text-align:left} th{background:#f4f4f4}</style>';
$html .= "</head><body>";
$html .= "<h1>Database report ({$ts})</h1>";

foreach ($tables as $table) {
    $html .= "<h2>Table: {$table}</h2>";

    try {
        $rows = DB::table($table)->take(100)->get();
    } catch (Exception $e) {
        $html .= "<p><em>Could not read table: {$e->getMessage()}</em></p>";
        continue;
    }

    if ($rows->isEmpty()) {
        $html .= "<p><em>No rows</em></p>";
        continue;
    }

    // Build table header
    $html .= '<table><thead><tr>';
    $first = $rows->first();
    foreach ($first as $col => $val) {
        $html .= '<th>' . htmlspecialchars($col) . '</th>';
    }
    $html .= '</tr></thead><tbody>';

    foreach ($rows as $row) {
        $html .= '<tr>';
        foreach ($row as $val) {
            $cell = is_null($val) ? '<em>null</em>' : htmlspecialchars((string)$val);
            // truncate long texts
            if (strlen(strip_tags($cell)) > 200) {
                $cell = htmlspecialchars(mb_substr(strip_tags($cell), 0, 200)) . '...';
            }
            $html .= '<td>' . $cell . '</td>';
        }
        $html .= '</tr>';
    }

    $html .= '</tbody></table>';
}

$html .= "</body></html>";

// Render PDF using Dompdf
$dompdf = new Dompdf();
$dompdf->set_option('isRemoteEnabled', true);
$dompdf->loadHtml($html);
$dompdf->setPaper('A4', 'portrait');
$dompdf->render();
$pdfOutput = $dompdf->output();
file_put_contents($outPdf, $pdfOutput);

echo "PDF generated: {$outPdf}\n";

return 0;
