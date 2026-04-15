<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TrainingsSeeder extends Seeder
{
    public function run(): void
    {
        $trainings = [
            [
                'title'       => 'Barista NC II',
                'provider'    => 'QCTAC',
                'type'        => 'Blended Training',
                'description' => 'Blended training program for Barista NC II certification offered by the Quezon City Training and Assessment Center in partnership with QCSALFI.',
                'slots'       => 30,
                'start_date'  => '2026-05-01',
                'end_date'    => '2026-06-30',
            ],
            [
                'title'       => 'Dressmaking NC II',
                'provider'    => 'QCTAC',
                'type'        => 'Free Competency Assessment',
                'description' => 'Free competency assessment for Dressmaking NC II offered by the Quezon City Training and Assessment Center. Limited slots only.',
                'slots'       => 25,
                'start_date'  => '2026-05-01',
                'end_date'    => '2026-06-30',
            ],
            [
                'title'       => 'Bookkeeping NC III',
                'provider'    => 'QCTAC',
                'type'        => 'Free Competency Assessment',
                'description' => 'Free competency assessment for Bookkeeping NC III offered by the Quezon City Training and Assessment Center. Limited slots only.',
                'slots'       => 25,
                'start_date'  => '2026-05-01',
                'end_date'    => '2026-06-30',
            ],
            [
                'title'       => 'Shielded Metal Arc Welding (SMAW) NC II',
                'provider'    => 'QCTAC',
                'type'        => 'Free Training and Assessment',
                'description' => 'Free TESDA-accredited training and assessment for Shielded Metal Arc Welding NC II. Open to unemployed Quezon City residents.',
                'slots'       => 20,
                'start_date'  => '2026-05-01',
                'end_date'    => '2026-06-30',
            ],
            [
                'title'       => 'Driving NC II',
                'provider'    => 'QCTAC',
                'type'        => 'Free Training',
                'description' => 'Free TESDA-accredited Driving NC II training program for unemployed Quezon City residents.',
                'slots'       => 20,
                'start_date'  => '2026-05-01',
                'end_date'    => '2026-06-30',
            ],
            [
                'title'       => 'Computer Systems Servicing NC II',
                'provider'    => 'QCTAC',
                'type'        => 'Free Training and Assessment',
                'description' => 'Free TESDA-accredited training and assessment for Computer Systems Servicing NC II at the Quezon City Training and Assessment Center.',
                'slots'       => 20,
                'start_date'  => '2026-05-01',
                'end_date'    => '2026-06-30',
            ],
            [
                'title'       => 'Electrical Installation and Maintenance NC II',
                'provider'    => 'QCTAC',
                'type'        => 'Free Training and Assessment',
                'description' => 'Free TESDA-accredited training and assessment for Electrical Installation and Maintenance NC II at QCTAC.',
                'slots'       => 20,
                'start_date'  => '2026-05-01',
                'end_date'    => '2026-06-30',
            ],
            [
                'title'       => 'Plumbing NC II',
                'provider'    => 'QCTAC',
                'type'        => 'Free Assessment',
                'description' => 'Free TESDA competency assessment for Plumbing NC II. For skilled workers with at least one year of work experience.',
                'slots'       => 15,
                'start_date'  => '2026-05-01',
                'end_date'    => '2026-06-30',
            ],
        ];

        $now = now();
        foreach ($trainings as &$training) {
            $training['created_at'] = $now;
            $training['updated_at'] = $now;
        }

        DB::table('trainings')->insert($trainings);
    }
}
