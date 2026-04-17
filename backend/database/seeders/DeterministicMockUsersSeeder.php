<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;

class DeterministicMockUsersSeeder extends Seeder
{
    private const SHARED_PASSWORD = 'MockPass123!';

    /**
     * @var array<int, string>
     */
    private const EMPLOYER_NAMES = [
        'WIZARD MANPOWER AND ALLIED SERVICES INC.',
        'SPECIALIZED PRODUCTS AND SERVICES INC.',
        "D'VINCI MANPOWER SERVICES CORP.",
        'CONSULT ASIA BUSINESS SOLUTIONS AND ADVISORY SERVICES',
        'STELLAR 167 MANPOWER RECRUITMENT & SERVICES INC.',
        'SMOOTHMOVES INC.',
        'POINTS BUSINESS & INDUSTRIAL SERVICES INC.',
        'CAREER GROWTH MANAGEMENT CORPORATION',
        'MULTI ACCESS COOPERATIVE',
        'ALORICA TELESERVICES INC',
        'SMARTLINE HUMAN RESOURCE SERVICE INC.',
        'JIMINI FOODS GROUP HOLDINGS INC.',
        'EEI CORPORATION',
        'PMS PRIMEPOWER NETWORK INC.',
        'M&G PRIME MANAGEMENT SERVICES, INC.',
        'BUILD UP MANPOWER AND SERVICES INC.',
        'RAVAGO EQUIPMENT RENTALS INC.',
        'START-UP MANPOWER AND SERVICES INC.',
        'JOBS ADVANCEMENT CAREER CONSULTANT INCORPORATION',
        'ENVISION RECRUITMENT INC.',
        'TWD LOGISTICS INCORPORATED',
        'STARWORKS INTEGRATED SERVICES INC.',
        'SKILLED STAFF SOURCES INC.',
        'TOPSPOT MULTI-PURPOSE COOPERATIVE',
        'GREAT WORKFORCE MGT SOLUTIONS CORP.',
    ];

    /**
     * @var array<int, string>
     */
    private const NON_QC_CITIES = [
        'Manila',
        'Makati',
        'Pasig',
        'Taguig',
        'Mandaluyong',
        'Caloocan',
        'Pasay',
        'Paranaque',
        'Las Pinas',
        'Marikina',
        'Muntinlupa',
        'San Juan',
    ];

    /**
     * @var array<int, string>
     */
    private const SEEKER_TEMPLATES = [
        'Customer Service Specialist',
        'Warehouse Associate',
        'Admin Assistant',
        'Sales Associate',
        'Data Entry Clerk',
        'Production Operator',
        'Office Staff',
        'Cashier',
    ];

    /**
     * @var array<int, string>
     */
    private const EDUCATION_LEVELS = [
        'High School Diploma',
        'Vocational Certificate',
        'Associate Degree',
        "Bachelor's Degree",
    ];

    /**
     * @var array<int, string>
     */
    private const INDUSTRIES = [
        'Manpower Services',
        'Business Process Outsourcing',
        'Construction',
        'Logistics',
        'Retail',
        'Food Services',
        'Engineering Services',
        'Business Services',
    ];

    public function run(): void
    {
        $passwordHash = Hash::make(self::SHARED_PASSWORD);

        $resumeDir = storage_path('app/public/mock-resumes');
        $manifestDir = storage_path('app/mock-data');
        File::ensureDirectoryExists($resumeDir);
        File::ensureDirectoryExists($manifestDir);

        $credentialsRows = [];

        $this->seedEmployers($passwordHash, $credentialsRows);
        $this->seedJobseekers($passwordHash, $resumeDir, $credentialsRows);
        $this->writeCredentialsManifest($manifestDir, $credentialsRows);
    }

    /**
     * @param array<int, array<string, string>> $credentialsRows
     */
    private function seedEmployers(string $passwordHash, array &$credentialsRows): void
    {
        foreach (self::EMPLOYER_NAMES as $index => $companyName) {
            $num = $index + 1;
            $email = sprintf('employer%02d@cityjoblink.mock', $num);
            $industry = self::INDUSTRIES[$index % count(self::INDUSTRIES)];
            $city = self::NON_QC_CITIES[$index % count(self::NON_QC_CITIES)];
            $websiteSlug = $this->slugify($companyName);

            User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $companyName,
                    'company_name' => $companyName,
                    'email' => $email,
                    'role' => 'Employer',
                    'password' => $passwordHash,
                    'is_verified' => true,
                    'uploaded_docs' => true,
                    'email_verified_at' => now(),
                    'otp' => null,
                    'industry' => $industry,
                    'address' => $city . ', Metro Manila',
                    'contact_number' => sprintf('09%09d', $num),
                    'company_website' => 'https://www.' . $websiteSlug . '.example.com',
                    'employer_verification_status' => 'verified',
                    'employer_docs_submitted_at' => now(),
                    'employer_verified_at' => now(),
                ]
            );

            $credentialsRows[] = [
                'role' => 'Employer',
                'name' => $companyName,
                'email' => $email,
                'password' => self::SHARED_PASSWORD,
            ];
        }
    }

    /**
     * @param array<int, array<string, string>> $credentialsRows
     */
    private function seedJobseekers(string $passwordHash, string $resumeDir, array &$credentialsRows): void
    {
        for ($i = 1; $i <= 60; $i++) {
            $seekerNo = sprintf('%03d', $i);
            $email = 'seeker' . $seekerNo . '@cityjoblink.mock';
            $isQcResident = $i <= 48;
            $city = $isQcResident
                ? 'Quezon City'
                : self::NON_QC_CITIES[($i - 49) % count(self::NON_QC_CITIES)];
            $jobTemplate = self::SEEKER_TEMPLATES[($i - 1) % count(self::SEEKER_TEMPLATES)];
            $education = self::EDUCATION_LEVELS[($i - 1) % count(self::EDUCATION_LEVELS)];
            $skills = $this->buildSkillSetForTemplate($jobTemplate);

            $resumeFileName = 'seeker_' . $seekerNo . '_resume.pdf';
            $resumeAbsolutePath = $resumeDir . DIRECTORY_SEPARATOR . $resumeFileName;
            $resumeStoragePath = 'storage/mock-resumes/' . $resumeFileName;

            $this->writeDummyResumePdf($resumeAbsolutePath, 'Seeker ' . $seekerNo . ' - ' . $jobTemplate);

            User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => 'Seeker ' . $seekerNo,
                    'email' => $email,
                    'role' => 'Seeker',
                    'password' => $passwordHash,
                    'is_verified' => true,
                    'uploaded_docs' => false,
                    'email_verified_at' => now(),
                    'otp' => null,
                    'is_qc_resident' => $isQcResident,
                    'qc_id' => $isQcResident ? $this->formatQcCitizenId($i) : $this->formatMetroManilaExternalId($i),
                    'address' => $city . ', Metro Manila',
                    'bday_month' => $this->deterministicMonth($i),
                    'bday_day' => (($i - 1) % 28) + 1,
                    'bday_year' => 1986 + (($i - 1) % 17),
                    'gender' => $this->deterministicGender($i),
                    'educational_attainment' => $education,
                    'resume_path' => $resumeStoragePath,
                    'resume_original_name' => 'resume_' . $seekerNo . '.pdf',
                    'resume_stored_name' => $resumeFileName,
                    'resume_text' => $this->buildResumeText($seekerNo, $jobTemplate, $skills, $education, $city),
                    'parsed_skill' => $skills,
                    'portfolio_url' => 'https://portfolio-seeker-' . $seekerNo . '.example.com',
                    'linkedin_url' => 'https://linkedin.com/in/seeker-' . $seekerNo,
                    'github_url' => 'https://github.com/seeker-' . $seekerNo,
                    'facebook_url' => 'https://facebook.com/seeker.' . $seekerNo,
                    'instagram_url' => 'https://instagram.com/seeker.' . $seekerNo,
                    'id_verification_status' => $isQcResident ? 'verified' : 'not_submitted',
                    'is_priority_verified' => $isQcResident,
                ]
            );

            $credentialsRows[] = [
                'role' => 'Seeker',
                'name' => 'Seeker ' . $seekerNo,
                'email' => $email,
                'password' => self::SHARED_PASSWORD,
            ];
        }
    }

    private function deterministicMonth(int $index): string
    {
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        return $months[($index - 1) % count($months)];
    }

    private function deterministicGender(int $index): string
    {
        $genders = ['Male', 'Female', 'Binary'];

        return $genders[($index - 1) % count($genders)];
    }

    private function formatQcCitizenId(int $index): string
    {
        return sprintf('QC%02d-%03d-%03d-%04d', ($index % 90) + 10, ($index % 700) + 100, ($index % 700) + 100, $index);
    }

    private function formatMetroManilaExternalId(int $index): string
    {
        return sprintf('MM-NONQC-%04d', $index);
    }

    /**
     * @return array<int, string>
     */
    private function buildSkillSetForTemplate(string $template): array
    {
        $map = [
            'Customer Service Specialist' => ['Communication', 'Customer Support', 'Problem Solving', 'CRM'],
            'Warehouse Associate' => ['Inventory Management', 'Forklift Operation', 'Packing', 'Teamwork'],
            'Admin Assistant' => ['MS Office', 'Scheduling', 'Documentation', 'Email Management'],
            'Sales Associate' => ['Sales', 'Lead Generation', 'Negotiation', 'Product Knowledge'],
            'Data Entry Clerk' => ['Typing', 'Data Validation', 'Spreadsheet', 'Attention to Detail'],
            'Production Operator' => ['Machine Operation', 'Safety Compliance', 'Quality Check', '5S'],
            'Office Staff' => ['Filing', 'Record Keeping', 'Coordination', 'Time Management'],
            'Cashier' => ['POS Operation', 'Cash Handling', 'Customer Service', 'Basic Accounting'],
        ];

        return $map[$template] ?? ['Communication', 'Teamwork', 'Time Management'];
    }

    /**
     * @param array<int, string> $skills
     */
    private function buildResumeText(
        string $seekerNo,
        string $jobTemplate,
        array $skills,
        string $education,
        string $city
    ): string {
        $skillsLine = implode(', ', $skills);

        return "Professional Summary\n"
            . "Seeker {$seekerNo} is an entry-to-mid level {$jobTemplate} candidate from {$city} with strong reliability and communication.\n\n"
            . "Core Skills\n"
            . "{$skillsLine}\n\n"
            . "Experience\n"
            . "- 2023-2025: {$jobTemplate} at Metro Workforce Solutions\n"
            . "- 2021-2023: Operations Support Assistant at City Link Services\n\n"
            . "Education\n"
            . "- {$education}\n";
    }

    /**
     * @param array<int, array<string, string>> $credentialsRows
     */
    private function writeCredentialsManifest(string $manifestDir, array $credentialsRows): void
    {
        $csvPath = $manifestDir . DIRECTORY_SEPARATOR . 'mock-login-credentials.csv';
        $mdPath = $manifestDir . DIRECTORY_SEPARATOR . 'mock-login-credentials.md';

        $csvLines = ['role,name,email,password'];
        foreach ($credentialsRows as $row) {
            $csvLines[] = sprintf(
                '"%s","%s","%s","%s"',
                str_replace('"', '""', $row['role']),
                str_replace('"', '""', $row['name']),
                str_replace('"', '""', $row['email']),
                str_replace('"', '""', $row['password'])
            );
        }

        File::put($csvPath, implode(PHP_EOL, $csvLines) . PHP_EOL);

        $md = "# Mock Login Credentials\n\n"
            . "Shared password for all mock users: `" . self::SHARED_PASSWORD . "`\n\n"
            . "Total accounts: " . count($credentialsRows) . "\n"
            . "- Employers: 25\n"
            . "- Seekers: 60\n\n"
            . "CSV source: storage/app/mock-data/mock-login-credentials.csv\n";

        File::put($mdPath, $md);
    }

    private function writeDummyResumePdf(string $path, string $title): void
    {
        $safeTitle = str_replace(['(', ')'], ['[', ']'], $title);

        $content = "%PDF-1.4\n"
            . "% Mock resume for QA seeding\n"
            . "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            . "2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
            . "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj\n"
            . "4 0 obj<</Length 68>>stream\n"
            . "BT /F1 12 Tf 72 720 Td (" . $safeTitle . ") Tj ET\n"
            . "endstream\n"
            . "endobj\n"
            . "xref\n"
            . "0 5\n"
            . "0000000000 65535 f \n"
            . "0000000038 00000 n \n"
            . "0000000087 00000 n \n"
            . "0000000144 00000 n \n"
            . "0000000232 00000 n \n"
            . "trailer<</Size 5/Root 1 0 R>>\n"
            . "startxref\n"
            . "347\n"
            . "%%EOF\n";

        File::put($path, $content);
    }

    private function slugify(string $value): string
    {
        $value = strtolower($value);
        $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
        $value = trim($value, '-');

        return $value === '' ? 'company' : $value;
    }
}
