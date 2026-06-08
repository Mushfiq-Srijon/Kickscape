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
            // Basic Info
            $table->string('country')->nullable();
            $table->integer('age')->nullable();
            $table->decimal('height', 5, 2)->nullable(); // in meters
            $table->enum('strong_foot', ['left', 'right', 'both'])->nullable();
            $table->string('position')->nullable(); // GK, CB, LB, RB, CM, LM, RM, ST, etc.

            // Club Info
            $table->string('club_name')->nullable();
            $table->integer('club_kit_number')->nullable();
            $table->integer('national_kit_number')->nullable();

            // National Team Career
            $table->date('debut_date')->nullable();
            $table->integer('national_goals')->default(0);
            $table->integer('national_assists')->default(0);
            $table->integer('national_matches')->default(0);

            // Stats for visualization
            $table->integer('striking')->default(50); // 1-100
            $table->integer('defending')->default(50); // 1-100
            $table->integer('speed')->default(50); // 1-100
            $table->integer('passing')->default(50); // 1-100
            $table->integer('dribbling')->default(50); // 1-100
            $table->integer('physical')->default(50); // 1-100

            $table->string('photo_url')->nullable();
            $table->string('api_id')->unique()->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
