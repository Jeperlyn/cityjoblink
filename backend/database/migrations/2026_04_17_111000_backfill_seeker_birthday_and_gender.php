<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('users')
            ->where('role', 'Seeker')
            ->whereNull('bday_month')
            ->update(['bday_month' => 'Jan']);

        DB::table('users')
            ->where('role', 'Seeker')
            ->whereNull('bday_day')
            ->update(['bday_day' => 1]);

        DB::table('users')
            ->where('role', 'Seeker')
            ->whereNull('bday_year')
            ->update(['bday_year' => 1995]);

        DB::table('users')
            ->where('role', 'Seeker')
            ->where(function ($query) {
                $query->whereNull('gender')->orWhere('gender', '');
            })
            ->update(['gender' => 'Other']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op: avoid erasing user profile data during rollback.
    }
};
