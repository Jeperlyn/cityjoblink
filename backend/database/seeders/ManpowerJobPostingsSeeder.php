<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ManpowerJobPostingsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $companyAliases = [
            'WIZARD MANPOWER AND ALLIED SERVICES INC.' => [
                'WIZARD MANPOWER AND ALLIED SERVICES INC.',
            ],
            "D'VINCI MANPOWER SERVICES CORP." => [
                "D'VINCI MANPOWER SERVICES CORP.",
            ],
            'STELLAR 167 MANPOWER RECRUITMENT & SERVICES INC.' => [
                'STELLAR 167 MANPOWER RECRUITMENT & SERVICES INC.',
                'STELLAR 167 MANPOWER RECRUITMENT AND SERVICES INC.',
            ],
        ];

        $employerIds = [];
        foreach ($companyAliases as $canonicalCompany => $aliases) {
            $employer = DB::table('users')
                ->where('role', 'Employer')
                ->where('is_verified', true)
                ->where(function ($query) use ($aliases) {
                    foreach ($aliases as $alias) {
                        $query->orWhere('name', $alias)->orWhere('company_name', $alias);
                    }
                })
                ->first();

            if (!$employer) {
                throw new \RuntimeException("Verified employer not found for {$canonicalCompany}. Run DeterministicMockUsersSeeder first.");
            }

            $employerIds[$canonicalCompany] = $employer->id;
        }

        $targetEmployerIds = array_values($employerIds);

        DB::table('jobs_catalog')
            ->whereIn('employer_id', $targetEmployerIds)
            ->where(function ($query) {
                $query->where('location', 'like', '%, Metro Manila')
                    ->orWhere('title', '3 Wheels Delivery Rider');
            })
            ->delete();

        $jobs = [
            [
                'title' => 'Front End Cashier',
                'company' => 'WIZARD MANPOWER AND ALLIED SERVICES INC.',
                'location' => 'Manila',
                'salary_min' => 17000,
                'salary_max' => 21000,
                'employment_type' => 'Full-time',
                'industry' => 'Manpower Services',
                'required_skills' => ['Cash Handling', 'POS Operation', 'Customer Service', 'Attention to Detail', 'Time Management'],
                'educational_attainment_required' => 'At least Senior High School',
                'description' => 'As Front End Cashier, ikaw ang frontliner sa payments at customer concerns. Kailangan maayos sa pera, mabilis magbilang, at may friendly approach sa customers. Dapat physically fit at complete ang government mandatory requirements.',
            ],
            [
                'title' => 'Service Crew',
                'company' => 'WIZARD MANPOWER AND ALLIED SERVICES INC.',
                'location' => 'Quezon City',
                'salary_min' => 16800,
                'salary_max' => 20500,
                'employment_type' => 'Full-time',
                'industry' => 'Manpower Services',
                'required_skills' => ['Customer Service', 'Teamwork', 'Food Safety Basics', 'Communication', 'Adaptability'],
                'educational_attainment_required' => 'At least Senior High School',
                'description' => 'Bilang Service Crew, ikaw ang bahala sa mabilis at maayos na serbisyo sa customer. Open sa shifting schedule at willing ma-train. Priority ang good attitude, malinis magtrabaho, at physically fit.',
            ],
            [
                'title' => 'Delivery Rider',
                'company' => 'WIZARD MANPOWER AND ALLIED SERVICES INC.',
                'location' => 'Quezon City',
                'salary_min' => 18000,
                'salary_max' => 26000,
                'employment_type' => 'Full-time',
                'industry' => 'Logistics',
                'required_skills' => ['Defensive Driving', 'Route Navigation', 'Customer Service', 'Time Management', 'Vehicle Care'],
                'educational_attainment_required' => 'At least Senior High School',
                'description' => 'Delivery Rider for 2-3 wheels operations. Required ang valid professional driver\'s license, sariling maayos na motor/tricycle, at updated OR/CR. May allowance, incentives, HMO, at government-mandated benefits with immediate hiring.',
            ],
            [
                'title' => 'HR Staff',
                'company' => 'WIZARD MANPOWER AND ALLIED SERVICES INC.',
                'location' => 'Quezon City',
                'salary_min' => 22000,
                'salary_max' => 30000,
                'employment_type' => 'Full-time',
                'industry' => 'Business Services',
                'required_skills' => ['Recruitment Support', 'Interview Coordination', 'Employee Records Management', 'Communication', 'Microsoft Office'],
                'educational_attainment_required' => "At least Bachelor\'s Degree in HRDM or Psychology",
                'description' => 'HR Staff role focused on recruitment and employee support. Hinahanap ang organized, detail-oriented, at people-focused candidate na may strong communication skills. This is a full-time onsite role in Quezon City.',
            ],
            [
                'title' => 'Backroom Staff - Inbound',
                'company' => "D'VINCI MANPOWER SERVICES CORP.",
                'location' => 'Las Pinas',
                'salary_min' => 17500,
                'salary_max' => 22500,
                'employment_type' => 'Full-time',
                'industry' => 'Logistics',
                'required_skills' => ['Receiving Operations', 'Inventory Checking', 'Basic Documentation', 'Teamwork', 'Physical Stamina'],
                'educational_attainment_required' => 'At least Senior High School',
                'description' => 'Backroom Inbound Staff para sa receiving at checking ng items. Kailangan may valid government ID, Police or NBI Clearance, Medical Certificate, at TIN Number. Open to with or without experience basta willing ma-train.',
            ],
            [
                'title' => 'Backroom Staff - Outbound',
                'company' => "D'VINCI MANPOWER SERVICES CORP.",
                'location' => 'Pasay',
                'salary_min' => 17500,
                'salary_max' => 22500,
                'employment_type' => 'Full-time',
                'industry' => 'Logistics',
                'required_skills' => ['Order Dispatching', 'Packing Accuracy', 'Scan and Sort', 'Coordination', 'Shift Readiness'],
                'educational_attainment_required' => 'At least Senior High School',
                'description' => 'Backroom Outbound Staff para sa sorting at dispatch preparation. Dapat physically fit at kayang magtrabaho sa shifting schedule. May government benefits at mabilis na hiring process.',
            ],
            [
                'title' => 'Backroom Staff - Sortpack',
                'company' => "D'VINCI MANPOWER SERVICES CORP.",
                'location' => 'Quezon City',
                'salary_min' => 17800,
                'salary_max' => 23000,
                'employment_type' => 'Full-time',
                'industry' => 'Logistics',
                'required_skills' => ['Sorting', 'Packing', 'Labeling', 'Attention to Detail', 'Warehouse Safety'],
                'educational_attainment_required' => 'At least Senior High School',
                'description' => 'Sortpack team member para sa organized na paghihiwalay at pag-pack ng items. Candidate must have complete basic requirements at willing sa fast-paced warehouse setup. Start ASAP with priority hiring.',
            ],
            [
                'title' => 'Backroom Staff - General',
                'company' => "D'VINCI MANPOWER SERVICES CORP.",
                'location' => 'Pasig',
                'salary_min' => 17500,
                'salary_max' => 23000,
                'employment_type' => 'Full-time',
                'industry' => 'Logistics',
                'required_skills' => ['Warehouse Operations', 'Stock Handling', 'Process Compliance', 'Teamwork', 'Reliability'],
                'educational_attainment_required' => 'At least Senior High School',
                'description' => 'General Backroom role covering inbound, outbound, at sortpack functions depende sa deployment. Good fit sa candidates na physically fit at may commitment sa attendance at quality output. Government benefits included.',
            ],
            [
                'title' => 'Cook',
                'company' => 'STELLAR 167 MANPOWER RECRUITMENT & SERVICES INC.',
                'location' => 'Caloocan',
                'salary_min' => 18500,
                'salary_max' => 26000,
                'employment_type' => 'Full-time',
                'industry' => 'Food Services',
                'required_skills' => ['Food Preparation', 'Kitchen Sanitation', 'Portion Control', 'Time Management', 'Team Coordination'],
                'educational_attainment_required' => 'At least Senior High School',
                'description' => 'Cook position for high-volume kitchen setup. Expected ang consistent taste, proper food handling, at maayos na station management. Willing to follow kitchen standards and schedule requirements.',
            ],
            [
                'title' => 'Kitchen Assistant',
                'company' => 'STELLAR 167 MANPOWER RECRUITMENT & SERVICES INC.',
                'location' => 'Caloocan',
                'salary_min' => 17000,
                'salary_max' => 22000,
                'employment_type' => 'Full-time',
                'industry' => 'Food Services',
                'required_skills' => ['Food Prep Support', 'Cleaning and Sanitation', 'Stock Replenishment', 'Teamwork', 'Communication'],
                'educational_attainment_required' => 'At least Senior High School',
                'description' => 'Kitchen Assistant role na tutulong sa prep, cleaning, at inventory support. Kailangan maingat sa hygiene at mabilis kumilos during peak hours. Open sa entry-level applicants na willing ma-train.',
            ],
            [
                'title' => 'Warehouse Helper',
                'company' => 'STELLAR 167 MANPOWER RECRUITMENT & SERVICES INC.',
                'location' => 'Caloocan',
                'salary_min' => 17200,
                'salary_max' => 22500,
                'employment_type' => 'Full-time',
                'industry' => 'Logistics',
                'required_skills' => ['Loading and Unloading', 'Inventory Support', 'Packing', 'Safety Compliance', 'Dependability'],
                'educational_attainment_required' => 'At least Senior High School',
                'description' => 'Warehouse Helper na maghahandle ng loading/unloading at basic inventory tasks. Dapat physically fit at marunong sumunod sa safety procedures. Deployment is in Caloocan.',
            ],
            [
                'title' => 'All Around Maintenance',
                'company' => 'STELLAR 167 MANPOWER RECRUITMENT & SERVICES INC.',
                'location' => 'Mandaluyong',
                'salary_min' => 18000,
                'salary_max' => 25000,
                'employment_type' => 'Full-time',
                'industry' => 'Engineering Services',
                'required_skills' => ['General Repair', 'Preventive Maintenance', 'Tools Handling', 'Troubleshooting', 'Workplace Safety'],
                'educational_attainment_required' => 'At least Senior High School',
                'description' => 'All Around Maintenance para sa basic electrical, plumbing, at facility upkeep tasks. Candidate must be responsible, hands-on, at kaya magtrabaho on-site. Maintenance experience is a plus but not strictly required.',
            ],
            [
                'title' => 'Aircon Technician',
                'company' => 'STELLAR 167 MANPOWER RECRUITMENT & SERVICES INC.',
                'location' => 'Mandaluyong',
                'salary_min' => 21000,
                'salary_max' => 32000,
                'employment_type' => 'Full-time',
                'industry' => 'Engineering Services',
                'required_skills' => ['HVAC Diagnostics', 'Aircon Installation', 'Preventive Maintenance', 'Technical Reporting', 'Safety Compliance'],
                'educational_attainment_required' => 'At least Senior High School',
                'description' => 'Aircon Technician role for troubleshooting, installation, and preventive maintenance of cooling units. Preferred ang may technical-vocational background or field experience. Must be reliable and safety-conscious.',
            ],
            [
                'title' => 'Field Assembler',
                'company' => 'STELLAR 167 MANPOWER RECRUITMENT & SERVICES INC.',
                'location' => 'Mandaluyong',
                'salary_min' => 18500,
                'salary_max' => 24500,
                'employment_type' => 'Full-time',
                'industry' => 'Engineering Services',
                'required_skills' => ['On-site Assembly', 'Blueprint Reading Basics', 'Quality Check', 'Coordination', 'Time Management'],
                'educational_attainment_required' => 'At least Senior High School',
                'description' => 'Field Assembler na maghahandle ng on-site assembly at installation support. Dapat maingat sa quality at marunong makipag-coordinate sa team lead. Ready for site deployment in Mandaluyong.',
            ],
            [
                'title' => 'Warehouse Helper',
                'company' => 'STELLAR 167 MANPOWER RECRUITMENT & SERVICES INC.',
                'location' => 'Mandaluyong',
                'salary_min' => 17200,
                'salary_max' => 22500,
                'employment_type' => 'Full-time',
                'industry' => 'Logistics',
                'required_skills' => ['Stock Handling', 'Inventory Support', 'Packing', '5S', 'Teamwork'],
                'educational_attainment_required' => 'At least Senior High School',
                'description' => 'Warehouse Helper opening for Mandaluyong deployment. Role includes stock movement, organization, at packing support. Ideal sa masipag, physically fit, at dependable team players.',
            ],
        ];

        foreach ($jobs as $job) {
            $company = $job['company'];

            DB::table('jobs_catalog')->updateOrInsert(
                [
                    'employer_id' => $employerIds[$company],
                    'title' => $job['title'],
                    'location' => $job['location'],
                ],
                [
                    'company' => $company,
                    'salary_min' => $job['salary_min'],
                    'salary_max' => $job['salary_max'],
                    'employment_type' => $job['employment_type'],
                    'industry' => $job['industry'],
                    'required_skills' => json_encode($job['required_skills']),
                    'description' => $job['description'],
                    'educational_attainment_required' => $job['educational_attainment_required'],
                    'status' => 'Open',
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );
        }
    }
}
