<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contest extends Model
{
    protected $fillable = [
        'home_team',
        'away_team',
        'match_date',
        'status',
        'home_score',
        'away_score',
        'group_stage',
        'stage',
        'country',
        'api_id',
        'stadium',
        'city',
    ];

    protected $casts = [
        'match_date' => 'datetime',
    ];
}