<?php

namespace Database\Seeders;

use App\Models\Contest;
use Illuminate\Database\Seeder;

class ContestSeeder extends Seeder
{
    public function run(): void
    {
        Contest::create([
            'home_team' => 'Argentina',
            'away_team' => 'France',
            'match_date' => now()->addDays(2),
            'status' => 'upcoming',
            'group_stage' => 'Group A',
        ]);

        Contest::create([
            'home_team' => 'Brazil',
            'away_team' => 'Germany',
            'match_date' => now()->addDays(3),
            'status' => 'upcoming',
            'group_stage' => 'Group B',
        ]);

        Contest::create([
            'home_team' => 'Spain',
            'away_team' => 'England',
            'match_date' => now()->addDays(4),
            'status' => 'upcoming',
            'group_stage' => 'Group C',
        ]);
    }
}