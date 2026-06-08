<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\FootballApiService;
use App\Models\Player;
use App\Models\Team;

class SyncPlayerData extends Command
{
    protected $signature = 'players:sync';
    protected $description = 'Sync World Cup 2026 player data from football-data.org';

    public function handle()
    {
        $api = new FootballApiService();
        $this->info('🔄 Syncing player data...');

        $teams = Team::all();
        $synced = 0;
        $failed = [];

        foreach ($teams as $team) {
            if (!$team->api_id) {
                continue;
            }

            $retry = 0;
            $maxRetries = 8;
            $squad = null;

            // Retry logic for API calls
            while ($retry < $maxRetries && !$squad) {
                try {
                    sleep(3);
                    $squad = $api->getTeamSquad($team->api_id);
                    break;
                } catch (\Exception $e) {
                    $retry++;
                    if ($retry < $maxRetries) {
                        $this->warn("⚠️  Retry {$retry}/{$maxRetries} for {$team->name}");
                        sleep(5);
                    } else {
                        $this->error("❌ Skipping {$team->name}: " . $e->getMessage());
                        $failed[] = $team->name;
                        continue 2;
                    }
                }
            }

            if (!$squad || !isset($squad['squad'])) {
                $this->warn("⚠️  No squad data for {$team->name}");
                continue;
            }

            $teamPlayerCount = 0;
            foreach ($squad['squad'] as $playerData) {
                try {
                    Player::updateOrCreate(
                        ['api_id' => $playerData['id']],
                        [
                            'api_id' => $playerData['id'],
                            'name' => $playerData['name'],
                            'team' => $team->name,
                            'country' => $team->country_code,
                            'position' => $playerData['position'] ?? null,
                            'national_kit_number' => $playerData['shirtNumber'] ?? null,
                            'age' => $this->calculateAge($playerData['dateOfBirth'] ?? null),
                            'height' => isset($playerData['height']) ? $playerData['height'] / 100 : null,
                            'strong_foot' => 'right',
                            'club_name' => 'WC 2026',
                            'striking' => $this->generateStat($playerData['position'] ?? 'CM', 'striking'),
                            'defending' => $this->generateStat($playerData['position'] ?? 'CM', 'defending'),
                            'speed' => $this->generateStat($playerData['position'] ?? 'CM', 'speed'),
                            'passing' => $this->generateStat($playerData['position'] ?? 'CM', 'passing'),
                            'dribbling' => $this->generateStat($playerData['position'] ?? 'CM', 'dribbling'),
                            'physical' => $this->generateStat($playerData['position'] ?? 'CM', 'physical'),
                        ]
                    );
                    $teamPlayerCount++;
                    $synced++;
                } catch (\Exception $e) {
                    $this->error("Error syncing player {$playerData['name']}: " . $e->getMessage());
                }
            }

            $this->info("✅ {$team->name}: {$teamPlayerCount} players");
        }

        $this->info("\n🎉 Sync Complete!");
        $this->info("✅ Total players synced: $synced");
        
        if (!empty($failed)) {
            $this->warn("⚠️  Failed teams: " . implode(', ', $failed));
        }
    }

    private function calculateAge($dateOfBirth)
    {
        if (!$dateOfBirth) {
            return null;
        }

        try {
            $birth = \Carbon\Carbon::parse($dateOfBirth);
            return $birth->age;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function generateStat($position, $statType)
    {
        $stats = [
            'GK' => ['striking' => 20, 'defending' => 85, 'speed' => 60, 'passing' => 70, 'dribbling' => 30, 'physical' => 75],
            'CB' => ['striking' => 30, 'defending' => 90, 'speed' => 70, 'passing' => 75, 'dribbling' => 40, 'physical' => 85],
            'LB' => ['striking' => 40, 'defending' => 80, 'speed' => 80, 'passing' => 75, 'dribbling' => 70, 'physical' => 78],
            'RB' => ['striking' => 40, 'defending' => 80, 'speed' => 80, 'passing' => 75, 'dribbling' => 70, 'physical' => 78],
            'CM' => ['striking' => 60, 'defending' => 75, 'speed' => 75, 'passing' => 85, 'dribbling' => 75, 'physical' => 75],
            'LM' => ['striking' => 70, 'defending' => 60, 'speed' => 85, 'passing' => 80, 'dribbling' => 80, 'physical' => 72],
            'RM' => ['striking' => 70, 'defending' => 60, 'speed' => 85, 'passing' => 80, 'dribbling' => 80, 'physical' => 72],
            'ST' => ['striking' => 90, 'defending' => 40, 'speed' => 85, 'passing' => 70, 'dribbling' => 85, 'physical' => 78],
            'LW' => ['striking' => 80, 'defending' => 50, 'speed' => 90, 'passing' => 75, 'dribbling' => 90, 'physical' => 72],
            'RW' => ['striking' => 80, 'defending' => 50, 'speed' => 90, 'passing' => 75, 'dribbling' => 90, 'physical' => 72],
        ];

        $pos = substr($position, 0, 2);
        return $stats[$pos][$statType] ?? 60;
    }
}