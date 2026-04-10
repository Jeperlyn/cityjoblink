<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SkillCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $catalog = [
            'Technical Skills' => [
                'Auditing',
                'Computer Literate',
                'Cybersecurity (Ethical Hacking, Penetration Testing)',
                'Database Management (MySQL, PostgreSQL, MongoDB)',
                'Excel for Financial Modelling',
                'Financial Analysis',
                'First Aid and CPR',
                'Graphic Design (Adobe Photoshop, Illustrator)',
                'Industrial Automation',
                'JavaScript (Node.js, React, Angular)',
                'Laboratory Techniques',
                'Marketing Communications',
                'Medical Technology',
                'Networking (TCP/IP, DNS, VPN)',
                'Patient Care',
                'Programming (C/C++, Python, Java)',
                'Quality Assurance',
                'Robotics',
                'Social Media Marketing (Facebook, Instagram, LinkedIn)',
                'Surveying',
                'Taxation',
                'User Interface Design (Figma, Sketch)',
                'Video Editing (Premiere Pro, Final Cut Pro)',
                'Web Design (UI/UX)',
                'Web Development (HTML, CSS)',
                'Welding',
            ],
            'Managerial Skills' => [
                'Budgeting and Cost Control',
                'Conflict Management',
                'Decision-Making',
                'Healthcare Administration',
                'Inventory Management',
                'Leadership',
                'Logistics Management',
                'Managing Change',
                'Merchandising',
                'Procurement and Sourcing',
                'Project Planning and Scheduling',
                'Resource Allocation',
                'Retail Management',
                'Risk Assessment',
                'Safety Management',
                'Sales Strategy',
                'Scheduling and Planning',
                'Supply Chain Optimization',
                'Warehouse Management',
            ],
            'Soft Skills' => [
                'Active Listening',
                'Adaptability',
                'Analytical Thinking',
                'Attention to Detail',
                'Auditory Attention',
                'Client Handling',
                'Client Interaction',
                'Creativity',
                'Critical Thinking',
                'Customer Focus',
                'Customer Support',
                'Empathy',
                'Flexibility in Work Environment',
                'Focus and Productivity',
                'Innovation and Creativity',
                'Interpersonal Skills',
                'Learning Agility',
                'Negotiation Skills',
                'Patience',
                'Presentation Skills',
                'Problem Resolution',
                'Public Speaking',
                'Self-Awareness',
                'Self-Regulation',
                'Social Skills',
                'Speech Clarity',
                'Stress Management',
                'Task Prioritization',
                'Teamwork',
                'Time Management',
                'Written Communication',
            ],
        ];

        foreach ($catalog as $categoryName => $skills) {
            $categorySlug = Str::slug($categoryName);

            DB::table('skill_categories')->updateOrInsert(
                ['name' => $categoryName],
                [
                    'slug' => $categorySlug,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            $category = DB::table('skill_categories')->where('name', $categoryName)->first();
            if (!$category) {
                continue;
            }

            foreach ($skills as $skillName) {
                DB::table('skills')->updateOrInsert(
                    [
                        'category_id' => $category->id,
                        'skill_name' => $skillName,
                    ],
                    [
                        'slug' => Str::slug($categoryName . '-' . $skillName),
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
            }
        }
    }
}
