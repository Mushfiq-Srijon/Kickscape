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
        $response = $api->getCompetition();

        if (!$response || !isset($response['teams'])) {
            $this->error('Failed to fetch teams');
            return;
        }

        foreach ($response['teams'] as $team) {
            Team::updateOrCreate(
                ['api_id' => $team['id']],
                [
                    'name' => $team['name'],
                    'country_code' => $team['shortName'] ?? substr($team['name'], 0, 3),
                    'api_id' => $team['id'],
                ]
            );
        }
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
        $response = $api->getStandings();

        if (!$response || !isset($response['standings'])) {
            $this->error('Failed to fetch standings');
            return;
        }

        foreach ($response['standings'] as $group) {
            foreach ($group['table'] as $standing) {
                Team::where('api_id', $standing['team']['id'])->update([
                    'played' => $standing['playedGames'],
                    'wins' => $standing['won'],
                    'draws' => $standing['draw'],
                    'losses' => $standing['lost'],
                    'goals_for' => $standing['goalsFor'],
                    'goals_against' => $standing['goalsAgainst'],
                    'points' => $standing['points'],
                    'group' => $group['group'] ?? null,
                ]);
            }
        }
    }
}