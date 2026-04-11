<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->string('decline_reason_code', 100)->nullable()->after('rejection_reason');
            $table->text('decline_reason_text')->nullable()->after('decline_reason_code');
            $table->timestamp('declined_at')->nullable()->after('decline_reason_text');
        });

        DB::table('applications')
            ->where('status', 'Viewing')
            ->update([
                'status' => 'Pending',
                'updated_at' => now(),
            ]);

        DB::table('applications')
            ->whereIn('status', ['Rejected', 'Withdrawn', 'Cancelled'])
            ->update([
                'status' => 'Declined',
                'declined_at' => DB::raw('COALESCE(declined_at, updated_at, created_at, applied_at)'),
                'updated_at' => now(),
            ]);

        DB::table('applications')
            ->where('status', 'Declined')
            ->whereNull('decline_reason_code')
            ->update([
                'decline_reason_code' => DB::raw("CASE WHEN rejection_reason LIKE 'Automatically declined:%' THEN 'auto_education' ELSE 'others' END"),
                'decline_reason_text' => DB::raw('COALESCE(rejection_reason, decline_reason_text)'),
                'declined_at' => DB::raw('COALESCE(declined_at, updated_at, created_at, applied_at)'),
                'updated_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('applications')
            ->where('status', 'Declined')
            ->update([
                'status' => 'Rejected',
                'updated_at' => now(),
            ]);

        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn([
                'decline_reason_code',
                'decline_reason_text',
                'declined_at',
            ]);
        });
    }
};
