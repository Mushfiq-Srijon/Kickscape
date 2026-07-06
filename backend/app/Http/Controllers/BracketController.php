<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\Contest;
use Illuminate\Http\Request;

class BracketController extends Controller
{
    public function getBracket()
    {
        $teams = Team::whereNotNull('group')->get()->groupBy('group');

        $groupStandings = [];
        foreach ($teams as $group => $groupTeams) {
            $sorted = $groupTeams->sortByDesc(function ($t) {
                return [$t->points, $t->goals_for - $t->goals_against, $t->goals_for];
            })->values();

            $groupStandings[$group] = $sorted->map(function ($t, $i) {
                $position = $i + 1;
                $qualified = false;
                if ($position <= 2) {
                    $qualified = ($t->played >= 3) || ($t->played >= 2 && $t->points >= 6);
                }
                return [
                    'name' => $t->name,
                    'crest' => $t->crest,
                    'flag' => $t->flag,
                    'points' => $t->points,
                    'played' => $t->played,
                    'goals_for' => $t->goals_for,
                    'goals_against' => $t->goals_against,
                    'position' => $position,
                    'qualified' => $qualified,
                ];
            })->toArray();
        }

        $thirdPlaceTeams = [];
        foreach ($groupStandings as $group => $standings) {
            if (isset($standings[2]) && $standings[2]['played'] >= 3) {
                $thirdPlaceTeams[] = array_merge($standings[2], ['group' => $group]);
            }
        }

        usort($thirdPlaceTeams, function ($a, $b) {
            if ($b['points'] !== $a['points'])
                return $b['points'] - $a['points'];
            return ($b['goals_for'] - $b['goals_against']) - ($a['goals_for'] - $a['goals_against']);
        });

        $qualifiedThird = array_slice($thirdPlaceTeams, 0, 8);
        $qualifiedThirdNames = array_column($qualifiedThird, 'name');

        foreach ($groupStandings as $group => $standings) {
            if (isset($standings[2]) && in_array($standings[2]['name'], $qualifiedThirdNames)) {
                $groupStandings[$group][2]['qualified'] = true;
            }
        }

        $teamLookup = Team::all()->keyBy('name');

        $buildTeamSlot = function (?string $name) use ($teamLookup) {
            if (!$name || $name === 'TBD') {
                return ['name' => null, 'label' => 'TBD', 'crest' => null, 'flag' => null, 'qualified' => false];
            }
            $team = $teamLookup->get($name);
            return [
                'name' => $name,
                'label' => $name,
                'crest' => $team->crest ?? null,
                'flag' => $team->flag ?? null,
                'qualified' => true,
            ];
        };
        $buildRound = function (string $stage) use ($buildTeamSlot) {
            $matches = Contest::where('stage', $stage)->orderBy('api_id')->get()->values();

            if ($stage === 'LAST_16') {
                // FIFA's real Round-of-16 pairing (Match 97 = Winner 89 v Winner 90,
                // Match 98 = Winner 93 v Winner 94, Match 99 = Winner 91 v Winner 92,
                // Match 100 = Winner 95 v Winner 96) does not follow simple sequential
                // left-to-right order — it's interleaved. Verified against your actual
                // fixture data (Brazil v Norway, Canada v Morocco, Mexico v England,
                // USA v Belgium all landed in the wrong slot under plain ascending order).
                // This reindexes ascending api_id positions 0..7 into bracket-visual order.
                $order = [0, 1, 4, 5, 2, 3, 6, 7];
                $matches = collect($order)->map(fn($i) => $matches[$i] ?? null)->filter()->values();
            }

            return $matches->map(function ($m) use ($buildTeamSlot) {
                return [
                    'home' => $buildTeamSlot($m->home_team),
                    'away' => $buildTeamSlot($m->away_team),
                    'match' => $m->api_id,
                    'venue' => $m->stadium ?? $m->city ?? '',
                    'date' => $m->match_date,
                    'home_score' => $m->home_score,
                    'away_score' => $m->away_score,
                    'status' => $m->status,
                ];
            })->values()->toArray();
        };

        return response()->json([
            'group_standings' => $groupStandings,
            'qualified_third' => $qualifiedThird,
            'r32' => $buildRound('LAST_32'),
            'r16' => $buildRound('LAST_16'),
            'qf' => $buildRound('QUARTER_FINALS'),
            'sf' => $buildRound('SEMI_FINALS'),
            'final' => $buildRound('FINAL')[0] ?? null,
        ]);
    }
}