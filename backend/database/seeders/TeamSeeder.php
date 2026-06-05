<?php

namespace Database\Seeders;

use App\Models\Team;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    public function run(): void
    {
        Team::create([
            'name' => 'Argentina',
            'country_code' => 'ARG',
            'played' => 2,
            'wins' => 2,
            'draws' => 0,
            'losses' => 0,
            'goals_for' => 5,
            'goals_against' => 1,
            'points' => 6,
            'group' => 'A',
        ]);

        Team::create([
            'name' => 'France',
            'country_code' => 'FRA',
            'played' => 2,
            'wins' => 1,
            'draws' => 1,
            'losses' => 0,
            'goals_for' => 4,
            'goals_against' => 2,
            'points' => 4,
            'group' => 'A',
        ]);

        Team::create([
            'name' => 'Brazil',
            'country_code' => 'BRA',
            'played' => 2,
            'wins' => 2,
            'draws' => 0,
            'losses' => 0,
            'goals_for' => 6,
            'goals_against' => 0,
            'points' => 6,
            'group' => 'B',
        ]);

        Team::create([
            'name' => 'Germany',
            'country_code' => 'GER',
            'played' => 2,
            'wins' => 1,
            'draws' => 0,
            'losses' => 1,
            'goals_for' => 3,
            'goals_against' => 2,
            'points' => 3,
            'group' => 'B',
        ]);
    }
}