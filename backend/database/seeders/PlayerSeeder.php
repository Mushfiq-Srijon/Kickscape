<?php

namespace Database\Seeders;

use App\Models\Player;
use Illuminate\Database\Seeder;

class PlayerSeeder extends Seeder
{
    public function run(): void
    {
        Player::create([
            'name' => 'Lionel Messi',
            'team' => 'Argentina',
            'position' => 'Forward',
            'goals' => 2,
            'assists' => 1,
            'appearances' => 2,
            'yellow_cards' => 0,
            'red_cards' => 0,
            'bio' => 'Argentine forward, considered one of the greatest players',
        ]);

        Player::create([
            'name' => 'Kylian Mbappé',
            'team' => 'France',
            'position' => 'Forward',
            'goals' => 3,
            'assists' => 1,
            'appearances' => 2,
            'yellow_cards' => 0,
            'red_cards' => 0,
            'bio' => 'French forward, known for his incredible speed and agility',
        ]);

        Player::create([
            'name' => 'Vinícius Júnior',
            'team' => 'Brazil',
            'position' => 'Forward',
            'goals' => 2,
            'assists' => 2,
            'appearances' => 2,
            'yellow_cards' => 1,
            'red_cards' => 0,
            'bio' => 'Brazilian winger, plays for Real Madrid',
        ]);

        Player::create([
            'name' => 'Serge Gnabry',
            'team' => 'Germany',
            'position' => 'Forward',
            'goals' => 1,
            'assists' => 0,
            'appearances' => 2,
            'yellow_cards' => 0,
            'red_cards' => 0,
            'bio' => 'German forward',
        ]);
    }
}