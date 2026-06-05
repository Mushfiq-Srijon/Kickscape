<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    protected $fillable = [
        'name', 'team', 'position', 'goals', 'assists', 
        'appearances', 'yellow_cards', 'red_cards', 'bio'
    ];
}