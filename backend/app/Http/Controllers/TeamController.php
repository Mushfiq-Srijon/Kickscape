<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function getStandings(Request $request)
    {
        $group = $request->query('group');
        
        $query = Team::orderBy('points', 'desc')
                      ->orderBy('goals_for', 'desc');
        
        if ($group) {
            $query->where('group', $group);
        }
        
        return response()->json($query->get());
    }
}