<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\FootballApiService;
use App\Models\Team;
use App\Models\Player;
use App\Models\Contest;

class SyncWorldCupData extends Command
{
    protected $signature = 'wc:sync';
    protected $description = 'Sync World Cup 2026 data from football-data.org';

    public function handle()
    {
        $api = new FootballApiService();

        $this->info('🔄 Syncing World Cup data...');

        // Sync teams
        $this->syncTeams($api);
        $this->info('✅ Teams synced');

        // Sync matches
        $this->syncMatches($api);
        $this->info('✅ Matches synced');

        // Sync standings
        $this->syncStandings($api);
        $this->info('✅ Standings synced');

        $this->info('🎉 Sync complete!');
    }

    private function syncTeams($api)
    {
        $response = $api->getMatches();

        if (!$response || !isset($response['matches'])) {
            $this->error('Failed to fetch matches');
            return;
        }

        $synced = 0;
        $teams = [];

        // Extract unique teams from matches
        foreach ($response['matches'] as $match) {
            if ($match['homeTeam']['name']) {
                $teams[$match['homeTeam']['id']] = $match['homeTeam'];
            }
            if ($match['awayTeam']['name']) {
                $teams[$match['awayTeam']['id']] = $match['awayTeam'];
            }
        }

        $this->info("Found " . count($teams) . " teams");

        // Sync teams
        foreach ($teams as $team) {
            $this->info("Syncing: {$team['name']} (ID: {$team['id']})");

            Team::updateOrCreate(
                ['name' => $team['name']],
                [
                    'api_id' => $team['id'],
                    'name' => $team['name'],
                    'country_code' => $team['shortName'] ?? substr($team['name'], 0, 3),
                ]
            );
            $synced++;
        }

        $this->info("✅ Teams synced: $synced");
    }

    private function syncMatches($api)
    {
        $response = $api->getMatches();

        if (!$response || !isset($response['matches'])) {
            $this->error('Failed to fetch matches');
            return;
        }

        $synced = 0;
        $skipped = 0;

        foreach ($response['matches'] as $match) {
            // Skip if teams are null (knockout rounds not yet determined)
            if (!$match['homeTeam']['name'] || !$match['awayTeam']['name']) {
                $skipped++;
                continue;
            }

            Contest::updateOrCreate(
                ['api_id' => $match['id']],
                [
                    'home_team' => $match['homeTeam']['name'],
                    'away_team' => $match['awayTeam']['name'],
                    'match_date' => $match['utcDate'],
                    'status' => $match['status'],
                    'home_score' => $match['score']['fullTime']['home'],
                    'away_score' => $match['score']['fullTime']['away'],
                    'group_stage' => $match['stage'] ?? 'Group Stage',
                    'api_id' => $match['id'],
                ]
            );

            $synced++;
        }

        $this->info("✅ Matches synced: $synced synced, $skipped skipped (knockout rounds)");
    }

    private function syncStandings($api)
    {
        // For now, assign groups manually based on team count
        $groups = ['GROUP_A', 'GROUP_B', 'GROUP_C', 'GROUP_D', 'GROUP_E', 'GROUP_F', 'GROUP_G', 'GROUP_H', 'GROUP_I', 'GROUP_J', 'GROUP_K', 'GROUP_L'];

        $teams = Team::all();
        $teamsPerGroup = ceil($teams->count() / 12);

        foreach ($teams as $index => $team) {
            $groupIndex = floor($index / $teamsPerGroup);
            $group = $groups[$groupIndex] ?? 'GROUP_A';

            $team->update(['group' => $group]);
        }

        $this->info("✅ Groups assigned to teams");
    }
}