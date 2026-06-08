<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    // Search players by name
    public function search(Request $request)
    {
        $query = $request->input('q', '');
        $team = $request->input('team', '');

        if (strlen($query) < 2) {
            return response()->json([
                'message' => 'Search query too short',
                'players' => []
            ], 400);
        }

        $players = Player::query();

        // Search by name
        $players->where('name', 'LIKE', "%{$query}%");

        // Filter by team if provided
        if ($team) {
            $players->where('team', $team);
        }

        $results = $players
            ->select('id', 'name', 'team', 'country', 'position', 'age', 'national_kit_number')
            ->limit(20)
            ->get();

        return response()->json([
            'total' => count($results),
            'players' => $results
        ]);
    }

    // Get player detail
    public function detail($id)
    {
        $player = Player::find($id);

        if (!$player) {
            return response()->json([
                'message' => 'Player not found'
            ], 404);
        }

        return response()->json([
            'player' => $player
        ]);
    }

    // Get all teams for filter
    public function teams()
    {
        $teams = Player::distinct()
            ->pluck('team')
            ->sort()
            ->values();

        return response()->json([
            'teams' => $teams
        ]);
    }
}