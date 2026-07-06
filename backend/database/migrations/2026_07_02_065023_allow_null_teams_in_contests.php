<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('contests', function (Blueprint $table) {
            $table->string('home_team')->nullable()->change();
            $table->string('away_team')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('contests', function (Blueprint $table) {
            $table->string('home_team')->nullable(false)->change();
            $table->string('away_team')->nullable(false)->change();
        });
    }
};