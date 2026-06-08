<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContestController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\ChatController;

Route::get('/matches', [ContestController::class, 'getMatches']);
Route::get('/teams/standings', [TeamController::class, 'getStandings']);
Route::get('/players/search', [PlayerController::class, 'searchPlayers']);
Route::post('/chat', [ChatController::class, 'askChatBot']);
Route::prefix('players')->group(function () {
    Route::get('/search', [PlayerController::class, 'search']);
    Route::get('/teams', [PlayerController::class, 'teams']);
    Route::get('/{id}', [PlayerController::class, 'detail']);
});