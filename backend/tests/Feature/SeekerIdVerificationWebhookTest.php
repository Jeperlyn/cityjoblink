<?php

namespace Tests\Feature;

use Tests\TestCase;

class SeekerIdVerificationWebhookTest extends TestCase
{
    public function test_verification_webhook_route_is_not_available_anymore(): void
    {
        $response = $this->postJson('/api/webhooks/seeker-id-verification-result', [
            'unexpected' => 'payload',
        ]);

        $response->assertStatus(404);
    }
}
