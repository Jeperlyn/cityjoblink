<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AdminReviewAndFeedbackTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (!extension_loaded('pdo_sqlite') || !in_array('sqlite', \PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('Skipping AdminReviewAndFeedbackTest: pdo_sqlite is not available in this environment.');
        }

        parent::setUp();
    }

    public function test_admin_can_unverify_and_verify_seeker_id_manually(): void
    {
        $seeker = User::factory()->create([
            'role' => 'Seeker',
            'email' => 'seeker-review@example.com',
            'seeker_id_doc_path' => 'storage/seeker-id-documents/10/sample-id.png',
            'seeker_id_doc_original_name' => 'sample-id.png',
            'id_verification_status' => 'manual_review',
            'is_priority_verified' => false,
        ]);

        $missingReason = $this->patchJson('/api/admin/seekers/review', [
            'seeker_id' => $seeker->id,
            'approved' => false,
        ]);

        $missingReason
            ->assertStatus(422)
            ->assertJsonPath('message', 'A reason is required when marking a seeker as unverified.');

        $rejectResponse = $this->patchJson('/api/admin/seekers/review', [
            'seeker_id' => $seeker->id,
            'approved' => false,
            'reason' => 'Submitted ID photo is too blurry to confirm ownership.',
        ]);

        $rejectResponse
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('seeker.id_verification_status', 'rejected')
            ->assertJsonPath('seeker.id_verification_reason', 'Submitted ID photo is too blurry to confirm ownership.');

        $seeker->refresh();

        $this->assertSame('rejected', $seeker->id_verification_status);
        $this->assertFalse((bool) $seeker->is_priority_verified);
        $this->assertSame('admin_manual_review', $seeker->id_verification_provider);
        $this->assertNotNull($seeker->id_verification_checked_at);

        $approveResponse = $this->patchJson('/api/admin/seekers/review', [
            'seeker_id' => $seeker->id,
            'approved' => true,
        ]);

        $approveResponse
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('seeker.id_verification_status', 'verified')
            ->assertJsonPath('seeker.id_verification_reason', null);

        $seeker->refresh();

        $this->assertSame('verified', $seeker->id_verification_status);
        $this->assertTrue((bool) $seeker->is_priority_verified);
    }

    public function test_seeker_can_submit_feedback_after_final_application_status(): void
    {
        $employer = User::factory()->create([
            'role' => 'Employer',
            'company_name' => 'Acme Logistics',
            'email' => 'employer-feedback@example.com',
            'is_verified' => true,
        ]);

        $seeker = User::factory()->create([
            'role' => 'Seeker',
            'email' => 'seeker-feedback@example.com',
        ]);

        $jobId = DB::table('jobs_catalog')->insertGetId([
            'employer_id' => $employer->id,
            'title' => 'Operations Associate',
            'company' => 'Acme Logistics',
            'location' => 'Quezon City',
            'salary_min' => 20000,
            'salary_max' => 26000,
            'employment_type' => 'Full-time',
            'industry' => 'Logistics',
            'required_skills' => json_encode(['communication']),
            'description' => 'Operations role',
            'status' => 'Open',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $applicationId = DB::table('applications')->insertGetId([
            'job_id' => $jobId,
            'seeker_id' => $seeker->id,
            'status' => 'Hired',
            'rejection_reason' => null,
            'applied_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->postJson('/api/applications/feedback', [
            'email' => $seeker->email,
            'application_id' => $applicationId,
            'rating' => 5,
            'feedback_comment' => 'Very smooth interview and onboarding process.',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Feedback submitted successfully.')
            ->assertJsonPath('feedback.rating', 5);

        $this->assertDatabaseHas('application_feedback', [
            'application_id' => $applicationId,
            'job_id' => $jobId,
            'employer_id' => $employer->id,
            'seeker_id' => $seeker->id,
            'rating' => 5,
        ]);
    }

    public function test_feedback_requires_final_application_status(): void
    {
        $employer = User::factory()->create([
            'role' => 'Employer',
            'company_name' => 'Northwind Systems',
            'is_verified' => true,
        ]);

        $seeker = User::factory()->create([
            'role' => 'Seeker',
            'email' => 'pending-feedback@example.com',
        ]);

        $jobId = DB::table('jobs_catalog')->insertGetId([
            'employer_id' => $employer->id,
            'title' => 'Support Specialist',
            'company' => 'Northwind Systems',
            'location' => 'Quezon City',
            'salary_min' => 18000,
            'salary_max' => 22000,
            'employment_type' => 'Full-time',
            'industry' => 'IT Services',
            'required_skills' => json_encode(['support']),
            'description' => 'Support role',
            'status' => 'Open',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $applicationId = DB::table('applications')->insertGetId([
            'job_id' => $jobId,
            'seeker_id' => $seeker->id,
            'status' => 'Interview',
            'rejection_reason' => null,
            'applied_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->postJson('/api/applications/feedback', [
            'email' => $seeker->email,
            'application_id' => $applicationId,
            'rating' => 4,
            'feedback_comment' => 'Trying to rate too early.',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('message', 'Feedback can only be submitted after the final application decision.');

        $this->assertDatabaseCount('application_feedback', 0);
    }

    public function test_admin_analytics_returns_ranked_employer_metrics(): void
    {
        $topEmployer = User::factory()->create([
            'role' => 'Employer',
            'company_name' => 'Top Employer Inc',
            'email' => 'top-employer@example.com',
            'is_verified' => true,
        ]);

        $otherEmployer = User::factory()->create([
            'role' => 'Employer',
            'company_name' => 'Other Employer LLC',
            'email' => 'other-employer@example.com',
            'is_verified' => false,
        ]);

        $seeker = User::factory()->create([
            'role' => 'Seeker',
            'email' => 'analytics-seeker@example.com',
            'seeker_id_doc_path' => 'storage/seeker-id-documents/40/id.png',
            'id_verification_status' => 'manual_review',
        ]);

        $topJobId = DB::table('jobs_catalog')->insertGetId([
            'employer_id' => $topEmployer->id,
            'title' => 'Data Analyst',
            'company' => 'Top Employer Inc',
            'location' => 'Quezon City',
            'salary_min' => 30000,
            'salary_max' => 42000,
            'employment_type' => 'Full-time',
            'industry' => 'Analytics',
            'required_skills' => json_encode(['sql']),
            'description' => 'Analytics role',
            'status' => 'Open',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $otherJobId = DB::table('jobs_catalog')->insertGetId([
            'employer_id' => $otherEmployer->id,
            'title' => 'Encoder',
            'company' => 'Other Employer LLC',
            'location' => 'Quezon City',
            'salary_min' => 17000,
            'salary_max' => 19000,
            'employment_type' => 'Full-time',
            'industry' => 'Administrative',
            'required_skills' => json_encode(['typing']),
            'description' => 'Encoder role',
            'status' => 'Open',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $hiredApplicationId = DB::table('applications')->insertGetId([
            'job_id' => $topJobId,
            'seeker_id' => $seeker->id,
            'status' => 'Hired',
            'rejection_reason' => null,
            'applied_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('applications')->insert([
            'job_id' => $otherJobId,
            'seeker_id' => $seeker->id,
            'status' => 'Rejected',
            'rejection_reason' => 'Not a fit',
            'applied_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('application_feedback')->insert([
            'application_id' => $hiredApplicationId,
            'job_id' => $topJobId,
            'employer_id' => $topEmployer->id,
            'seeker_id' => $seeker->id,
            'rating' => 5,
            'feedback_comment' => 'Great overall process.',
            'submitted_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->getJson('/api/admin/analytics');

        $response
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('analytics.summary.total_employers', 2)
            ->assertJsonPath('analytics.summary.pending_seeker_reviews', 1)
            ->assertJsonPath('analytics.summary.total_feedback', 1)
            ->assertJsonPath('analytics.top_employers.0.id', $topEmployer->id)
            ->assertJsonPath('analytics.top_employers.0.hired_count', 1);
    }
}