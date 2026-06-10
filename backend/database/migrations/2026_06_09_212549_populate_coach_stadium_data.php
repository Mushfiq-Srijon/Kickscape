<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // All 48 official coaches for WC 2026
        $coaches = [
            // Group A
            'Mexico' => 'Javier Aguirre',
            'South Korea' => 'Hong Myung-bo',
            'Czechia' => 'Miroslav Koubek',
            'South Africa' => 'Hugo Broos',
            
            // Group B
            'Canada' => 'Jesse Marsch',
            'Bosnia-Herzegovina' => 'Sergej Barbarez',
            'Qatar' => 'Julen Lopetegui',
            'Switzerland' => 'Murat Yakin',
            
            // Group C
            'Brazil' => 'Carlo Ancelotti',
            'Morocco' => 'Mohamed Ouahbi',
            'Scotland' => 'Steve Clarke',
            'Haiti' => 'Sebastien Migne',
            
            // Group D
            'United States' => 'Mauricio Pochettino',
            'Australia' => 'Tony Popovic',
            'Turkey' => 'Vincenzo Montella',
            'Paraguay' => 'Gustavo Alfaro',
            
            // Group E
            'Germany' => 'Julian Nagelsmann',
            'Curaçao' => 'Dick Advocaat',
            'Ivory Coast' => 'Emerse Fae',
            'Ecuador' => 'Sebastian Beccacece',
            
            // Group F
            'Netherlands' => 'Ronald Koeman',
            'Japan' => 'Hajime Moriyasu',
            'Sweden' => 'Graham Potter',
            'Tunisia' => 'Sabri Lamouchi',
            
            // Group G
            'Belgium' => 'Rudi Garcia',
            'Egypt' => 'Hossam Hassan',
            'Iran' => 'Amir Ghalenoei',
            'New Zealand' => 'Darren Bazeley',
            
            // Group H
            'Spain' => 'Luis de la Fuente',
            'Uruguay' => 'Marcelo Bielsa',
            'Cape Verde Islands' => 'Bubista',
            'Saudi Arabia' => 'Georgios Donis',
            
            // Group I
            'France' => 'Didier Deschamps',
            'Norway' => 'Stale Solbakken',
            'Senegal' => 'Pape Thiaw',
            'Iraq' => 'Graham Arnold',
            
            // Group J
            'Argentina' => 'Lionel Scaloni',
            'Austria' => 'Ralf Rangnick',
            'Algeria' => 'Vladimir Petkovic',
            'Jordan' => 'Jamal Sellami',
            
            // Group K
            'Portugal' => 'Roberto Martínez',
            'Congo DR' => 'Sebastien Desabre',
            'Uzbekistan' => 'Fabio Cannavaro',
            'Colombia' => 'Nestor Lorenzo',
            
            // Group L
            'England' => 'Thomas Tuchel',
            'Croatia' => 'Zlatko Dalic',
            'Ghana' => 'Carlos Queiroz',
            'Panama' => 'Thomas Christiansen',
        ];

        foreach ($coaches as $team => $coach) {
            DB::table('teams')->where('name', $team)->update(['coach' => $coach]);
        }

        // Group stage stadiums (first match of each group)
        $stadiums = [
            ['home' => 'Mexico', 'away' => 'South Africa', 'stadium' => 'NRG Stadium', 'city' => 'Houston, Texas'],
            ['home' => 'South Korea', 'away' => 'Czechia', 'stadium' => 'AT&T Stadium', 'city' => 'Arlington, Texas'],
            ['home' => 'Brazil', 'away' => 'Morocco', 'stadium' => 'MetLife Stadium', 'city' => 'East Rutherford, New Jersey'],
            ['home' => 'Haiti', 'away' => 'Scotland', 'stadium' => 'Levi\'s Stadium', 'city' => 'Santa Clara, California'],
            ['home' => 'United States', 'away' => 'Paraguay', 'stadium' => 'SoFi Stadium', 'city' => 'Los Angeles, California'],
            ['home' => 'Canada', 'away' => 'Bosnia-Herzegovina', 'stadium' => 'Estadio Azteca', 'city' => 'Mexico City'],
            ['home' => 'Germany', 'away' => 'Curaçao', 'stadium' => 'Empower Field', 'city' => 'Denver, Colorado'],
            ['home' => 'Netherlands', 'away' => 'Japan', 'stadium' => 'Lincoln Financial Field', 'city' => 'Philadelphia, Pennsylvania'],
            ['home' => 'Ivory Coast', 'away' => 'Ecuador', 'stadium' => 'Bank of America Stadium', 'city' => 'Charlotte, North Carolina'],
            ['home' => 'France', 'away' => 'Senegal', 'stadium' => 'Caesars Superdome', 'city' => 'New Orleans, Louisiana'],
            ['home' => 'Spain', 'away' => 'Cape Verde Islands', 'stadium' => 'FAU Stadium', 'city' => 'Boca Raton, Florida'],
            ['home' => 'England', 'away' => 'Croatia', 'stadium' => 'Arrowhead Stadium', 'city' => 'Kansas City, Missouri'],
        ];

        foreach ($stadiums as $match) {
            DB::table('contests')
                ->where('home_team', $match['home'])
                ->where('away_team', $match['away'])
                ->update(['stadium' => $match['stadium'], 'city' => $match['city']]);
        }
    }

    public function down(): void
    {
        DB::table('teams')->update(['coach' => null]);
        DB::table('contests')->update(['stadium' => null, 'city' => null]);
    }
};