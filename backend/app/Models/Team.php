<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $fillable = [
        'name', 'country_code', 'played', 'wins', 'draws', 'losses',
        'goals_for', 'goals_against', 'points', 'group_position', 'group'
    ];
}