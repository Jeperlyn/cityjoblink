<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Http\Controllers\FeatureController;
use Illuminate\Support\Facades\DB;

class NotificationMessageTest extends TestCase
{
    private FeatureController $controller;

    public function setUp(): void
    {
        parent::setUp();
        $this->controller = new FeatureController();
    }

    /**
     * Test job title shortening with various inputs.
     */
    public function test_shorten_job_title_abbreviates_senior(): void
    {
        // Using reflection to test private method
        $reflection = new \ReflectionClass($this->controller);
        $method = $reflection->getMethod('shortenJobTitle');
        $method->setAccessible(true);

        $input = 'Senior Full-Stack Developer';
        $result = $method->invoke($this->controller, $input);
        
        $this->assertStringStartsWith('Sr. ', $result);
        $this->assertEquals('Sr. Full-Stack Developer', $result);
    }

    /**
     * Test job title shortening with truncation.
     */
    public function test_shorten_job_title_truncates_long_titles(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $method = $reflection->getMethod('shortenJobTitle');
        $method->setAccessible(true);

        $input = 'Senior Full-Stack Developer specializing in Cloud Infrastructure';
        $result = $method->invoke($this->controller, $input, 25);
        
        $this->assertLessThanOrEqual(25, strlen($result));
        $this->assertStringEndsWith('...', $result);
    }

    /**
     * Test job title shortening with junior prefix.
     */
    public function test_shorten_job_title_abbreviates_junior(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $method = $reflection->getMethod('shortenJobTitle');
        $method->setAccessible(true);

        $input = 'Junior Frontend Developer';
        $result = $method->invoke($this->controller, $input);
        
        $this->assertStringStartsWith('Jr. ', $result);
        $this->assertEquals('Jr. Frontend Developer', $result);
    }

    /**
     * Test notification content generation for application submission.
     */
    public function test_generate_notification_application_submitted(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $method = $reflection->getMethod('generateNotificationContent');
        $method->setAccessible(true);

        $result = $method->invoke($this->controller, 'application_submitted', [
            'job_title' => 'Senior Frontend Developer',
        ]);

        $this->assertArrayHasKey('content', $result);
        $this->assertArrayHasKey('emoji', $result);
        $this->assertStringContainsString('Sr. Frontend Developer', $result['content']);
        $this->assertStringContainsString('submitted', $result['content']);
        $this->assertEquals('✔️', $result['emoji']);
    }

    /**
     * Test notification content generation for interview.
     */
    public function test_generate_notification_application_interview(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $method = $reflection->getMethod('generateNotificationContent');
        $method->setAccessible(true);

        $result = $method->invoke($this->controller, 'application_interview', [
            'job_title' => 'Frontend Engineer',
        ]);

        $this->assertArrayHasKey('content', $result);
        $this->assertStringContainsString('Interview', $result['content']);
        $this->assertStringContainsString('Frontend Engineer', $result['content']);
        $this->assertEquals('📝', $result['emoji']);
    }

    /**
     * Test notification content generation for hired.
     */
    public function test_generate_notification_application_hired(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $method = $reflection->getMethod('generateNotificationContent');
        $method->setAccessible(true);

        $result = $method->invoke($this->controller, 'application_hired', [
            'job_title' => 'Senior Full-Stack Developer',
        ]);

        $this->assertArrayHasKey('content', $result);
        $this->assertStringContainsString('Congratulations', $result['content']);
        $this->assertStringContainsString('hired', $result['content']);
        $this->assertStringContainsString('Sr. Full-Stack Developer', $result['content']);
        $this->assertEquals('🎉', $result['emoji']);
    }

    /**
     * Test notification content generation for declined.
     */
    public function test_generate_notification_application_declined(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $method = $reflection->getMethod('generateNotificationContent');
        $method->setAccessible(true);

        $result = $method->invoke($this->controller, 'application_declined', [
            'job_title' => 'Frontend Developer',
        ]);

        $this->assertArrayHasKey('content', $result);
        $this->assertStringContainsString('Unfortunately', $result['content']);
        $this->assertStringContainsString('Keep applying', $result['content']);
        $this->assertStringNotContainsString('decline_reason', $result['content']);
        $this->assertEquals('💪', $result['emoji']);
    }

    /**
     * Test notification content generation for auto-rejected education.
     */
    public function test_generate_notification_auto_rejected_education(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $method = $reflection->getMethod('generateNotificationContent');
        $method->setAccessible(true);

        $result = $method->invoke($this->controller, 'application_auto_rejected_education', [
            'job_title' => 'Senior Software Engineer',
            'required_education' => "Bachelor's Degree",
        ]);

        $this->assertArrayHasKey('content', $result);
        $this->assertStringContainsString("Bachelor's Degree", $result['content']);
        $this->assertStringContainsString('upskilling', $result['content']);
        $this->assertEquals('📚', $result['emoji']);
    }

    /**
     * Test notification content generation for new application to employer.
     */
    public function test_generate_notification_new_application_to_employer(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $method = $reflection->getMethod('generateNotificationContent');
        $method->setAccessible(true);

        $result = $method->invoke($this->controller, 'new_application_to_employer', [
            'job_title' => 'Senior Backend Developer',
            'seeker_name' => 'John Doe',
        ]);

        $this->assertArrayHasKey('content', $result);
        $this->assertStringContainsString('John Doe', $result['content']);
        $this->assertStringContainsString('Sr. Backend Developer', $result['content']);
        $this->assertEquals('👤', $result['emoji']);
    }

    /**
     * Test that all notification contents are under 500 characters for good UX.
     */
    public function test_notification_content_length_reasonable(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $method = $reflection->getMethod('generateNotificationContent');
        $method->setAccessible(true);

        $types = [
            'application_submitted',
            'application_interview',
            'application_hired',
            'application_declined',
            'application_auto_rejected_education',
            'new_application_to_employer',
        ];

        $testData = [
            'job_title' => 'Senior Full-Stack Developer specializing in Cloud Infrastructure',
            'seeker_name' => 'John Doe',
            'required_education' => "Bachelor's Degree in Computer Science",
        ];

        foreach ($types as $type) {
            $result = $method->invoke($this->controller, $type, $testData);
            $this->assertLessThan(500, strlen($result['content']), 
                "Notification type '{$type}' content is too long");
        }
    }

    /**
     * Test that user-friendly messages don't expose decline reason codes.
     */
    public function test_decline_notification_does_not_expose_reason_codes(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $method = $reflection->getMethod('generateNotificationContent');
        $method->setAccessible(true);

        $result = $method->invoke($this->controller, 'application_declined', [
            'job_title' => 'Frontend Developer',
        ]);

        $this->assertStringNotContainsString('skills_mismatch', $result['content']);
        $this->assertStringNotContainsString('education_requirement_not_met', $result['content']);
        $this->assertStringNotContainsString('failed_interview', $result['content']);
        $this->assertStringNotContainsString('position_filled', $result['content']);
    }

    /**
     * Integration test: verify notification meta structure contains emoji.
     */
    public function test_notification_meta_structure_includes_emoji(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $method = $reflection->getMethod('generateNotificationContent');
        $method->setAccessible(true);

        $result = $method->invoke($this->controller, 'application_hired', [
            'job_title' => 'Senior Developer',
        ]);

        // Simulate what would be stored in meta
        $metaData = [
            'type' => 'application_status',
            'status' => 'Hired',
            'emoji' => $result['emoji'],
        ];

        $this->assertArrayHasKey('emoji', $metaData);
        $this->assertNotEmpty($metaData['emoji']);
    }
}
