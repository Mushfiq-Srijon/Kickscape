<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('players', function (Blueprint $table) {
            // Only add columns that don't exist
            if (!Schema::hasColumn('players', 'country')) {
                $table->string('country')->nullable();
            }
            if (!Schema::hasColumn('players', 'age')) {
                $table->integer('age')->nullable();
            }
            if (!Schema::hasColumn('players', 'height')) {
                $table->decimal('height', 5, 2)->nullable();
            }
            if (!Schema::hasColumn('players', 'strong_foot')) {
                $table->enum('strong_foot', ['left', 'right', 'both'])->nullable();
            }
            if (!Schema::hasColumn('players', 'club_name')) {
                $table->string('club_name')->nullable();
            }
            if (!Schema::hasColumn('players', 'club_kit_number')) {
                $table->integer('club_kit_number')->nullable();
            }
            if (!Schema::hasColumn('players', 'national_kit_number')) {
                $table->integer('national_kit_number')->nullable();
            }
            if (!Schema::hasColumn('players', 'debut_date')) {
                $table->date('debut_date')->nullable();
            }
            if (!Schema::hasColumn('players', 'national_goals')) {
                $table->integer('national_goals')->default(0);
            }
            if (!Schema::hasColumn('players', 'national_assists')) {
                $table->integer('national_assists')->default(0);
            }
            if (!Schema::hasColumn('players', 'national_matches')) {
                $table->integer('national_matches')->default(0);
            }
            if (!Schema::hasColumn('players', 'striking')) {
                $table->integer('striking')->default(50);
            }
            if (!Schema::hasColumn('players', 'defending')) {
                $table->integer('defending')->default(50);
            }
            if (!Schema::hasColumn('players', 'speed')) {
                $table->integer('speed')->default(50);
            }
            if (!Schema::hasColumn('players', 'passing')) {
                $table->integer('passing')->default(50);
            }
            if (!Schema::hasColumn('players', 'dribbling')) {
                $table->integer('dribbling')->default(50);
            }
            if (!Schema::hasColumn('players', 'physical')) {
                $table->integer('physical')->default(50);
            }
            if (!Schema::hasColumn('players', 'photo_url')) {
                $table->string('photo_url')->nullable();
            }
        });
    }

    public function down()
    {
        Schema::table('players', function (Blueprint $table) {
            $table->dropColumnIfExists([
                'country',
                'age',
                'height',
                'strong_foot',
                'club_name',
                'club_kit_number',
                'national_kit_number',
                'debut_date',
                'national_goals',
                'national_assists',
                'national_matches',
                'striking',
                'defending',
                'speed',
                'passing',
                'dribbling',
                'physical',
                'photo_url'
            ]);
        });
    }
};
