<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContestController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Artisan;

Route::get('/matches', [ContestController::class, 'getMatches']);
Route::get('/teams/standings', [TeamController::class, 'getStandings']);
Route::post('/chat', [ChatController::class, 'askChatBot']);

// Protect with a secret key so random people can't trigger it
// Visit: https://kickscape-backend.onrender.com/api/admin/sync?key=kickscape2026
Route::get('/admin/sync', function (Illuminate\Http\Request $request) {
    $secret = env('SYNC_SECRET', 'kickscape2026');

    if ($request->query('key') !== $secret) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    $mode = $request->query('mode', 'fast'); // default to fast

    if ($mode === 'fast') {
        Artisan::call('wc:sync', ['--fast' => true]);
    } else {
        Artisan::call('wc:sync');
    }

    Artisan::call('players:sync');

    return response()->json([
        'message' => 'Sync complete',
        'mode' => $mode,
        'time' => now()->toDateTimeString(),
    ]);
});

Route::prefix('players')->group(function () {
    Route::get('/search', [PlayerController::class, 'search']);
    Route::get('/popular', [PlayerController::class, 'popular']);
    Route::get('/teams', [PlayerController::class, 'teams']);
    Route::get('/{id}', [PlayerController::class, 'detail']);
});