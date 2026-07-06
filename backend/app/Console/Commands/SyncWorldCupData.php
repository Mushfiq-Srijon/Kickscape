<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\FootballApiService;
use App\Models\Team;
use App\Models\Player;
use App\Models\Contest;

class SyncWorldCupData extends Command
{
    protected $signature = 'wc:sync {--fast : Skip team details, only sync matches and standings}';
    protected $description = 'Sync World Cup 2026 data from football-data.org';

    public function handle()
    {
        $api = new FootballApiService();
        $this->info('🔄 Syncing World Cup data...');

        if (!$this->option('fast')) {
            $this->syncTeamDetails($api);
            $this->info('✅ Team details synced');
        } else {
            $this->info('⚡ Skipping team details (--fast mode)');
        }

        $this->syncMatches($api);
        $this->info('✅ Matches synced');

        $this->syncStandings($api);
        $this->info('✅ Standings synced');

        $this->info('🎉 Sync complete!');
    }

    private function syncTeamDetails($api)
    {
        // Only fetch teams missing crest or flag — skips if already filled
        $teams = Team::whereNotNull('api_id')
            ->where(function ($q) {
                $q->whereNull('crest')->orWhereNull('flag');
            })
            ->get();

        if ($teams->isEmpty()) {
            $this->info('✅ All team details already filled, skipping');
            return;
        }

        $this->info("🔄 Fetching details for {$teams->count()} teams missing crest/flag...");

        foreach ($teams as $team) {
            try {
                sleep(7);
                $data = $api->getTeamSquad($team->api_id);

                if (!$data || !isset($data['id'])) {
                    $this->warn("⚠️  No data for {$team->name}");
                    continue;
                }

                $updateData = [
                    'crest' => $data['crest'] ?? null,
                    'tla' => $data['tla'] ?? null,
                    'country_code' => $data['area']['code'] ?? null,
                    'flag' => $data['area']['flag'] ?? null,
                ];

                if (empty($team->coach) && isset($data['coach']['name'])) {
                    $updateData['coach'] = $data['coach']['name'];
                }

                $team->update($updateData);
                $this->info("✅ {$team->name}: synced");

            } catch (\Exception $e) {
                $this->error("❌ {$team->name}: " . $e->getMessage());
            }
        }
    }

    private function syncMatches($api)
{
    $response = $api->getMatches();
    $matches = $response['matches'] ?? [];

    foreach ($matches as $match) {
        $homeName = $match['homeTeam']['name'] ?? null;
        $awayName = $match['awayTeam']['name'] ?? null;

        Contest::updateOrCreate(
            ['api_id' => $match['id']],
            [
                'home_team' => $homeName,
                'away_team' => $awayName,
                'match_date' => $match['utcDate'],
                'status' => $match['status'],
                'home_score' => $match['score']['fullTime']['home'] ?? null,
                'away_score' => $match['score']['fullTime']['away'] ?? null,
                'group_stage' => $match['group'] ?? null,
                'stage' => $match['stage'] ?? null,
                'country' => $match['area']['name'] ?? null,
            ]
        );
    }
}

    private function syncStandings($api)
    {
        // football-data.org free tier returns incomplete standings
        // (group: null, missing winners) — calculate from our own match data instead
        $this->calculateStandingsFromMatches();
        $this->fixGroups();
    }

    private function calculateStandingsFromMatches()
    {
        Team::query()->update([
            'played' => 0,
            'wins' => 0,
            'draws' => 0,
            'losses' => 0,
            'goals_for' => 0,
            'goals_against' => 0,
            'points' => 0,
        ]);

        $finished = Contest::where('status', 'FINISHED')
            ->whereNotNull('home_score')
            ->whereNotNull('away_score')
            ->get();

        foreach ($finished as $match) {
            $hg = $match->home_score;
            $ag = $match->away_score;

            // Calculate home team result
            $homeWin = $hg > $ag;
            $awayWin = $ag > $hg;
            $draw = $hg === $ag;

            \DB::table('teams')->where('name', $match->home_team)->update([
                'played' => \DB::raw('played + 1'),
                'goals_for' => \DB::raw("goals_for + {$hg}"),
                'goals_against' => \DB::raw("goals_against + {$ag}"),
                'wins' => \DB::raw('wins + ' . ($homeWin ? 1 : 0)),
                'draws' => \DB::raw('draws + ' . ($draw ? 1 : 0)),
                'losses' => \DB::raw('losses + ' . ($awayWin ? 1 : 0)),
                'points' => \DB::raw('points + ' . ($homeWin ? 3 : ($draw ? 1 : 0))),
            ]);

            \DB::table('teams')->where('name', $match->away_team)->update([
                'played' => \DB::raw('played + 1'),
                'goals_for' => \DB::raw("goals_for + {$ag}"),
                'goals_against' => \DB::raw("goals_against + {$hg}"),
                'wins' => \DB::raw('wins + ' . ($awayWin ? 1 : 0)),
                'draws' => \DB::raw('draws + ' . ($draw ? 1 : 0)),
                'losses' => \DB::raw('losses + ' . ($homeWin ? 1 : 0)),
                'points' => \DB::raw('points + ' . ($awayWin ? 3 : ($draw ? 1 : 0))),
            ]);
        }

        $this->info('✅ Standings calculated from ' . $finished->count() . ' finished matches');
    }

    private function fixGroups()
    {
        \DB::statement("
            UPDATE teams t
            JOIN (
                SELECT home_team AS team_name, group_stage FROM contests
                WHERE group_stage IS NOT NULL AND group_stage != ''
                UNION
                SELECT away_team AS team_name, group_stage FROM contests
                WHERE group_stage IS NOT NULL AND group_stage != ''
            ) c ON t.name = c.team_name
            SET t.group = c.group_stage
        ");
        $this->info('✅ Groups re-applied');
    }
}