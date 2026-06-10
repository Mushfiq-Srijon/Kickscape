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

        $teams = Team::whereNotNull('api_id')->get();
        $synced = 0;
        $failed = [];

        foreach ($teams as $team) {
            $retry = 0;
            $maxRetries = 8;
            $squad = null;

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
                    $dob = $playerData['dateOfBirth'] ?? null;
                    $age = null;
                    if ($dob) {
                        try {
                            $age = \Carbon\Carbon::parse($dob)->age;
                        } catch (\Exception $e) {
                            $age = null;
                        }
                    }

                    // Height: API returns in cm as integer e.g. 183, convert to metres
                    $height = null;
                    if (!empty($playerData['height'])) {
                        $rawHeight = $playerData['height'];
                        // Some responses include "183 cm", strip non-numeric
                        $numericHeight = (float) preg_replace('/[^0-9.]/', '', $rawHeight);
                        if ($numericHeight > 0) {
                            $height = $numericHeight > 10 ? round($numericHeight / 100, 2) : $numericHeight;
                        }
                    }

                    Player::updateOrCreate(
                        ['api_id' => (string) $playerData['id']],
                        [
                            'name'              => $playerData['name'],
                            'team'              => $team->name,
                            'position'          => $playerData['position'] ?? null,
                            'age'               => $age,
                            'height'            => $height,
                            'strong_foot'       => null, // Not provided by football-data.org
                            'national_kit_number' => $playerData['shirtNumber'] ?? null,
                            'club_name'         => $playerData['currentTeam']['name'] ?? null,
                            'date_of_birth'     => $dob,
                        ]
                    );

                    $teamPlayerCount++;
                    $synced++;
                } catch (\Exception $e) {
                    $this->error("Error syncing {$playerData['name']}: " . $e->getMessage());
                }
            }

            $this->info("✅ {$team->name}: {$teamPlayerCount} players");
        }

        $this->info("\n🎉 Sync Complete! Total: $synced players");

        if (!empty($failed)) {
            $this->warn("⚠️  Failed teams: " . implode(', ', $failed));
        }
    }
}