<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SeekerIdDirectVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (!extension_loaded('pdo_sqlite') || !in_array('sqlite', \PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('Skipping SeekerIdDirectVerificationTest: pdo_sqlite is not available in this environment.');
        }

        parent::setUp();
    }

    public function test_upload_stores_seeker_id_document_without_running_validation_pipeline(): void
    {
        Http::fake();

        Storage::fake('public');

        $user = User::factory()->create([
            'role' => 'Seeker',
            'name' => 'Jeflyn Joy Maraggun Solito',
            'email' => 'jeflyn@example.com',
            'qc_id' => '0785-1257-8564-58',
        ]);

        $response = $this->postJson('/api/upload/seeker-id-document', [
            'email' => $user->email,
            'document' => UploadedFile::fake()->image('qc-id.png'),
            'qc_id' => '0785-1257-8564-58',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'ID document uploaded and stored successfully.');

        $user->refresh();

        $this->assertSame('not_submitted', $user->id_verification_status);
        $this->assertFalse((bool) $user->is_priority_verified);
        $this->assertNull($user->id_verification_provider);
        $this->assertNull($user->id_verification_reason);
        $this->assertNull($user->id_extracted_qc_id);
        $this->assertNull($user->id_ocr_text);
        $this->assertNotEmpty((string) $user->seeker_id_doc_path);
        $this->assertStringContainsString('storage/seeker-id-documents/', (string) $user->seeker_id_doc_path);

        Http::assertNothingSent();
    }

    public function test_upload_stores_document_even_when_qc_id_is_not_provided(): void
    {
        Http::fake();

        Storage::fake('public');

        $user = User::factory()->create([
            'role' => 'Seeker',
            'name' => 'Jeflyn Joy Maraggun Solito',
            'email' => 'jeflyn-reject@example.com',
            'qc_id' => '9999-9999-9999-99',
        ]);

        $response = $this->postJson('/api/upload/seeker-id-document', [
            'email' => $user->email,
            'document' => UploadedFile::fake()->image('qc-id.png'),
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'ID document uploaded and stored successfully.');

        $user->refresh();

        $this->assertSame('not_submitted', $user->id_verification_status);
        $this->assertFalse((bool) $user->is_priority_verified);
        $this->assertSame('9999-9999-9999-99', (string) $user->qc_id);
        $this->assertNotEmpty((string) $user->seeker_id_doc_path);
        $this->assertNull($user->id_verification_reason);

        Http::assertNothingSent();
    }
}
