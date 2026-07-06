<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('contests', function (Blueprint $table) {
            $table->string('stage')->nullable()->after('group_stage');
        });
    }

    public function down()
    {
        Schema::table('contests', function (Blueprint $table) {
            $table->dropColumn('stage');
        });
    }
};