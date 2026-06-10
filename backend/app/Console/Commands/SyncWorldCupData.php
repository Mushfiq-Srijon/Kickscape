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

        $this->syncTeamDetails($api);
        $this->info('✅ Team details synced (crest, flag, tla, country_code, coach)');

        $this->syncMatches($api);
        $this->info('✅ Matches synced');

        $this->syncStandings($api);
        $this->info('✅ Standings synced');

        $this->info('🎉 Sync complete!');
    }

    // -----------------------------------------------------------------------
    // Sync crest, flag, tla, country_code, coach for each team individually
    // football-data.org /teams/{id} returns all these fields
    // -----------------------------------------------------------------------
    private function syncTeamDetails($api)
    {
        $teams = Team::whereNotNull('api_id')->get();

        foreach ($teams as $team) {
            try {
                sleep(7); // Stay within 10 req/min free tier limit
                $data = $api->getTeamSquad($team->api_id); // reuses existing getTeamSquad endpoint

                if (!$data || !isset($data['id'])) {
                    $this->warn("⚠️  No data for {$team->name}");
                    continue;
                }

                $updateData = [
                    'crest'        => $data['crest'] ?? null,
                    'tla'          => $data['tla'] ?? null,
                    'country_code' => $data['area']['code'] ?? null,
                    'flag'         => $data['area']['flag'] ?? null,
                ];

                // Only update coach if not already manually filled
                if (empty($team->coach) && isset($data['coach']['name'])) {
                    $updateData['coach'] = $data['coach']['name'];
                }

                $team->update($updateData);
                $this->info("✅ {$team->name}: crest, flag, tla synced");

            } catch (\Exception $e) {
                $this->error("❌ {$team->name}: " . $e->getMessage());
            }
        }
    }

    // -----------------------------------------------------------------------
    // Sync matches from WC competition endpoint
    // -----------------------------------------------------------------------
    private function syncMatches($api)
    {
        $response = $api->getMatches();
        $matches  = $response['matches'] ?? [];

        // Build team name → api_id map for syncing teams on the fly
        $teamMap = [];
        foreach ($matches as $match) {
            if ($match['homeTeam']['name']) {
                $teamMap[$match['homeTeam']['id']] = $match['homeTeam']['name'];
            }
            if ($match['awayTeam']['name']) {
                $teamMap[$match['awayTeam']['id']] = $match['awayTeam']['name'];
            }
        }

        // Ensure all teams exist in teams table with api_id
        foreach ($teamMap as $apiId => $teamName) {
            Team::firstOrCreate(
                ['name' => $teamName],
                ['api_id' => $apiId]
            );
        }

        foreach ($matches as $match) {
            if (!$match['homeTeam']['name'] || !$match['awayTeam']['name']) {
                continue;
            }

            Contest::updateOrCreate(
                ['api_id' => $match['id']],
                [
                    'home_team'   => $match['homeTeam']['name'],
                    'away_team'   => $match['awayTeam']['name'],
                    'match_date'  => $match['utcDate'],
                    'status'      => $match['status'],
                    'home_score'  => $match['score']['fullTime']['home'],
                    'away_score'  => $match['score']['fullTime']['away'],
                    'group_stage' => $match['group'] ?? null,
                    'country'     => $match['area']['name'] ?? null,
                ]
                // stadium/city intentionally not overwritten here
                // — managed by update_stadiums.sql
            );
        }
    }

    // -----------------------------------------------------------------------
    // Sync standings from WC standings endpoint
    // -----------------------------------------------------------------------
    private function syncStandings($api)
    {
        $response = $api->getStandings();

        if (!$response || !isset($response['standings'])) {
            $this->warn('⚠️  No standings data available yet');
            return;
        }

        foreach ($response['standings'] as $standing) {
            $group = $standing['group'] ?? null;

            foreach ($standing['table'] as $position => $entry) {
                $teamName = $entry['team']['name'] ?? null;
                if (!$teamName) continue;

                Team::where('name', $teamName)->update([
                    'group'          => $group,
                    'group_position' => $position + 1,
                    'played'         => $entry['playedGames'] ?? 0,
                    'wins'           => $entry['won'] ?? 0,
                    'draws'          => $entry['draw'] ?? 0,
                    'losses'         => $entry['lost'] ?? 0,
                    'goals_for'      => $entry['goalsFor'] ?? 0,
                    'goals_against'  => $entry['goalsAgainst'] ?? 0,
                    'points'         => $entry['points'] ?? 0,
                ]);
            }
        }
    }
}