<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('contests', function (Blueprint $table) {  // ← Changed from 'matches'
            $table->id();
            $table->string('home_team');
            $table->string('away_team');
            $table->dateTime('match_date');
            $table->string('status')->default('upcoming');
            $table->integer('home_score')->nullable();
            $table->integer('away_score')->nullable();
            $table->string('group_stage')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
