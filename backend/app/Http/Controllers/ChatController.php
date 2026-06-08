<?php

namespace App\Http\Controllers;

use App\Models\ChatHistory;
use App\Models\Team;
use App\Models\Player;
use App\Models\Contest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    public function askChatBot(Request $request)
    {
        $query = $request->input('query');
        $sessionId = $request->input('session_id', uniqid());

        // Fetch all real-time WC 2026 data
        $teams = Team::orderBy('group')->get();
        $matches = Contest::orderBy('match_date')->get();

        $wcContext = "# World Cup 2026 Complete Data\n\n";

        // Groups & Teams
        $wcContext .= "## Teams by Group:\n";
        foreach ($teams->groupBy('group') as $group => $groupTeams) {
            $wcContext .= "\n### $group\n";
            foreach ($groupTeams as $team) {
                $wcContext .= "- {$team->name} (P:{$team->played} W:{$team->wins} D:{$team->draws} L:{$team->losses} Pts:{$team->points})\n";
            }
        }

        // Matches
        $wcContext .= "\n## Upcoming Matches:\n";
        foreach ($matches->where('status', '!=', 'FINISHED')->take(10) as $match) {
            $wcContext .= "- {$match->home_team} vs {$match->away_team} ({$match->match_date->format('Y-m-d H:i')}) - {$match->status}\n";
        }

        // Completed Matches
        $wcContext .= "\n## Recent Results:\n";
        foreach ($matches->where('status', 'FINISHED')->take(5) as $match) {
            $wcContext .= "- {$match->home_team} {$match->home_score}-{$match->away_score} {$match->away_team}\n";
        }

        $systemPrompt = <<<PROMPT
You are an expert World Cup 2026 analyst with comprehensive knowledge about:
- All 48 participating teams and their players
- Historical World Cup data and statistics
- Player performance, careers, and current clubs
- Team tactics, formations, and coaching
- Match predictions and analysis
- Venues, dates, and tournament structure

Here is the real-time World Cup 2026 data:

$wcContext

Use this data combined with your extensive knowledge to answer ANY question about World Cup 2026, teams, players, matches, and predictions.
Be accurate and cite the real-time data when relevant.
PROMPT;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('GROQ_API_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => 'llama-3.3-70b-versatile',
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $query],
                    ],
                    'max_tokens' => 1500,
                ]);

        $aiResponse = $response->json()['choices'][0]['message']['content'];

        ChatHistory::create([
            'session_id' => $sessionId,
            'user_query' => $query,
            'ai_response' => $aiResponse,
        ]);

        return response()->json([
            'response' => $aiResponse,
            'session_id' => $sessionId,
        ]);
    }
}