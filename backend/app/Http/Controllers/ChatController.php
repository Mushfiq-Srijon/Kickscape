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

        try {
            // Enrich with WC data
            $standings = Team::orderBy('points', 'desc')->limit(10)->get();
            $topScorers = Player::orderBy('goals', 'desc')->limit(5)->get();
            $upcomingMatches = Contest::where('status', 'upcoming')
                ->orderBy('match_date')
                ->limit(3)
                ->get();

            $context = "Current World Cup 2026 Data:\n";
            $context .= "Top Teams: " . json_encode($standings) . "\n";
            $context .= "Top Scorers: " . json_encode($topScorers) . "\n";
            $context .= "Upcoming Matches: " . json_encode($upcomingMatches);

            // Call Groq API
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('GROQ_API_KEY'),
            ])->timeout(30)->post('https://api.groq.com/openai/v1/chat/completions', [
                        'model' => 'llama-3.3-70b-versatile', 
                        'messages' => [
                            [
                                'role' => 'user',
                                'content' => "You are a World Cup 2026 expert. Use this data:\n$context\n\nUser question: $query"
                            ]
                        ],
                        'max_tokens' => 1024,
                    ]);

            $data = $response->json();

            // Debug: Log the response
            \Log::info('Groq Response:', $data);

            // Check if response has choices
            if (!isset($data['choices']) || empty($data['choices'])) {
                throw new \Exception('Invalid Groq response: ' . json_encode($data));
            }

            $aiResponse = $data['choices'][0]['message']['content'];

            // Store in DB
            ChatHistory::create([
                'session_id' => $sessionId,
                'user_query' => $query,
                'ai_response' => $aiResponse,
            ]);

            return response()->json([
                'response' => $aiResponse,
                'session_id' => $sessionId
            ]);

        } catch (\Exception $e) {
            \Log::error('Chat Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}