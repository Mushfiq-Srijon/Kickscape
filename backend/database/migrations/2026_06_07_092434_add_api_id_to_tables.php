<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->integer('api_id')->nullable()->unique();
        });

        Schema::table('contests', function (Blueprint $table) {
            $table->integer('api_id')->nullable()->unique();
        });
    }

    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropColumn('api_id');
        });

        Schema::table('contests', function (Blueprint $table) {
            $table->dropColumn('api_id');
        });
    }
};