<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    protected $fillable = [
        'api_id',
        'name',
        'team',
        'position',
        'age',
        'height',
        'strong_foot',
        'national_kit_number',
        'club_name',
        'date_of_birth',
        'goals',
        'assists',
        'appearances',
        'yellow_cards',
        'red_cards',
        'bio',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'height' => 'float',
    ];
}