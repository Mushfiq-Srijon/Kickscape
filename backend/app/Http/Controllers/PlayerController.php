<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class PlayerController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q', '');
        $team  = $request->input('team', '');

        if (strlen($query) < 2) {
            return response()->json([
                'message' => 'Search query too short',
                'players' => []
            ], 400);
        }

        $players = Player::query()->where('name', 'LIKE', "%{$query}%");
        if ($team) {
            $players->where('team', $team);
        }

        $results = $players
            ->select('id', 'name', 'team', 'position')
            ->orderBy('name')
            ->limit(20)
            ->get();

        return response()->json([
            'total'   => $results->count(),
            'players' => $results,
        ]);
    }

    public function detail($id)
    {
        $player = Player::find($id);

        if (!$player) {
            return response()->json(['message' => 'Player not found'], 404);
        }

        // Fetch Wikipedia bio — cache for 24 hours to avoid hammering the API
        $wiki = Cache::remember("wiki_player_{$player->id}", 86400, function () use ($player) {
            return $this->fetchWikipediaBio($player->name);
        });

        return response()->json([
            'player' => $player,
            'wiki'   => $wiki,
        ]);
    }

    public function teams()
    {
        $teams = Player::distinct()
            ->pluck('team')
            ->sort()
            ->values();

        return response()->json(['teams' => $teams]);
    }

    // -----------------------------------------------------------------------
    // Wikipedia summary fetch
    // Uses the free Wikipedia REST API — no key needed
    // -----------------------------------------------------------------------
    private function fetchWikipediaBio(string $playerName): ?array
    {
        try {
            // Encode the player name for the URL
            $encoded = urlencode(str_replace(' ', '_', $playerName));
            $url = "https://en.wikipedia.org/api/rest_v1/page/summary/{$encoded}";

            $response = Http::timeout(5)->get($url);

            if ($response->failed() || $response->status() === 404) {
                return null;
            }

            $data = $response->json();

            // Only return if it's actually a person/footballer article
            if (empty($data['extract'])) {
                return null;
            }

            return [
                'title'   => $data['title'] ?? $playerName,
                'extract' => $data['extract'] ?? null,
                'image'   => $data['thumbnail']['source'] ?? null,
                'url'     => $data['content_urls']['desktop']['page'] ?? null,
            ];
        } catch (\Exception $e) {
            return null;
        }
    }
}