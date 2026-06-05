<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContestController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\ChatController;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

Route::get('/matches', [ContestController::class, 'getMatches']);
Route::get('/teams/standings', [TeamController::class, 'getStandings']);
Route::get('/players/search', [PlayerController::class, 'searchPlayers']);
Route::post('/chat', [ChatController::class, 'askChatBot']);