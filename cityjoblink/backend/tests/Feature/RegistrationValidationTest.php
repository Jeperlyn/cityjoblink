<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RegistrationValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (!extension_loaded('pdo_sqlite') || !in_array('sqlite', \PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('Skipping RegistrationValidationTest: pdo_sqlite is not available in this environment.');
        }

        parent::setUp();
    }

    public function test_registration_rejects_numeric_characters_in_name_fields(): void
    {
        Mail::fake();
        Storage::fake('public');

        $response = $this->post('/api/register', $this->validSeekerPayload([
            'firstName' => 'Juan1',
        ]), ['Accept' => 'application/json']);

        $response
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonValidationErrors(['firstName']);
    }

    public function test_registration_rejects_underage_seeker(): void
    {
        Mail::fake();
        Storage::fake('public');

        $response = $this->post('/api/register', $this->validSeekerPayload([
            'bdayYear' => (string) (now()->year - 17),
            'bdayMonth' => 'Dec',
            'bdayDay' => '31',
        ]), ['Accept' => 'application/json']);

        $response
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Registration failed: You must be at least 18 years old.');
    }

    public function test_registration_rejects_invalid_qc_id_format(): void
    {
        Mail::fake();
        Storage::fake('public');

        $response = $this->post('/api/register', $this->validSeekerPayload([
            'qcId' => '123-45-12345678',
        ]), ['Accept' => 'application/json']);

        $response
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonValidationErrors(['qcId']);
    }

    public function test_registration_accepts_valid_14_digit_qc_id_format(): void
    {
        Mail::fake();
        Storage::fake('public');

        $response = $this->post('/api/register', $this->validSeekerPayload([
            'email' => 'valid14@example.com',
            'qcId' => '123-456-12345678',
        ]), ['Accept' => 'application/json']);

        $response
            ->assertOk()
            ->assertJsonPath('status', 'success');
    }

    public function test_registration_accepts_valid_16_digit_qc_id_format(): void
    {
        Mail::fake();
        Storage::fake('public');

        $response = $this->post('/api/register', $this->validSeekerPayload([
            'email' => 'valid16@example.com',
            'qcId' => '123-456-12345678-12',
        ]), ['Accept' => 'application/json']);

        $response
            ->assertOk()
            ->assertJsonPath('status', 'success');
    }

    private function validSeekerPayload(array $overrides = []): array
    {
        $payload = [
            'email' => 'seeker@example.com',
            'password' => 'StrongPass1!',
            'password_confirmation' => 'StrongPass1!',
            'role' => 'Seeker',
            'firstName' => 'Juan',
            'middleName' => 'Dela',
            'lastName' => 'Cruz',
            'suffix' => 'Jr.',
            'qcId' => '123-456-12345678',
            'isQcResident' => '1',
            'bdayMonth' => 'Jan',
            'bdayDay' => '1',
            'bdayYear' => (string) (now()->year - 20),
            'gender' => 'Male',
            'qcIdFile' => UploadedFile::fake()->image('seeker-id.png'),
        ];

        return array_merge($payload, $overrides);
    }
}
