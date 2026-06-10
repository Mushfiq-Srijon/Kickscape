<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class FootballApiService
{
    private $baseUrl = 'https://api.football-data.org/v4';
    private $apiKey;

    public function __construct()
    {
        $this->apiKey = env('FOOTBALL_DATA_API_KEY');
    }

    private function request($endpoint, $params = [])
    {
        $response = Http::withHeaders([
            'X-Auth-Token' => $this->apiKey,
        ])->get("{$this->baseUrl}/{$endpoint}", $params);

        if ($response->failed()) {
            \Log::error('Football Data API Error: ' . $response->body());
            return null;
        }

        return $response->json();
    }

    // Get World Cup 2026 competition
    public function getCompetition()
    {
        return $this->request('competitions/WC');
    }

    // Get World Cup matches
    public function getMatches()
    {
        return $this->request('competitions/WC/matches', [
            'season' => 2026,
        ]);
    }

    // Get World Cup standings
    public function getStandings()
    {
        return $this->request('competitions/WC/standings', [
            'season' => 2026,
        ]);
    }

    // Get team details
    public function getTeam($teamId)
    {
        $url = "{$this->baseUrl}/teams/{$teamId}";
        return Http::get($url)->json();
    }

    // Get team squad (players)
    public function getTeamSquad($teamId)
    {
        return $this->request("teams/{$teamId}");
    }

    // Search teams by name
    public function searchTeams($name)
    {
        $response = $this->request('competitions/WC');

        if (!$response || !isset($response['teams'])) {
            return [];
        }

        return array_filter($response['teams'], function ($team) use ($name) {
            return stripos($team['name'], $name) !== false;
        });
    }
}