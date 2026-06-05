<?php

namespace App\Http\Controllers;

use App\Models\Contest;
use Illuminate\Http\Request;

class ContestController extends Controller
{
    public function getMatches(Request $request)
    {
        $timezone = $request->query('timezone', 'UTC');
        
        $contests = Contest::orderBy('match_date')->get();
        
        $contests->each(function($contest) use ($timezone) {
            $contest->user_time = $contest->match_date->setTimezone($timezone);
        });
        
        return response()->json($contests);
    }
}