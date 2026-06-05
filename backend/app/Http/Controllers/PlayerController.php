<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    public function searchPlayers(Request $request)
    {
        $search = $request->query('q');
        $team = $request->query('team');
        
        $query = Player::query();
        
        if ($search) {
            $query->where('name', 'LIKE', "%{$search}%");
        }
        
        if ($team) {
            $query->where('team', $team);
        }
        
        return response()->json($query->get());
    }
}