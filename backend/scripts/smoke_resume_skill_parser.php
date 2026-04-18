<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$controller = app(App\Http\Controllers\AuthController::class);
$reflection = new ReflectionClass($controller);
$method = $reflection->getMethod('extractSkillsFromText');
$method->setAccessible(true);

$text = 'Experienced in leadership, inventory management, loading and unloading, packing, dependability, teamwork, and safety compliance.';
$skills = $method->invoke($controller, $text);

echo json_encode($skills, JSON_UNESCAPED_UNICODE) . PHP_EOL;
