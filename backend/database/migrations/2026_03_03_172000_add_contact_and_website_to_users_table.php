<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'contact_number')) {
                $table->string('contact_number')->nullable()->after('address');
            }

            if (!Schema::hasColumn('users', 'company_website')) {
                $table->string('company_website')->nullable()->after('contact_number');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $drop = [];

            if (Schema::hasColumn('users', 'company_website')) {
                $drop[] = 'company_website';
            }

            if (Schema::hasColumn('users', 'contact_number')) {
                $drop[] = 'contact_number';
            }

            if (!empty($drop)) {
                $table->dropColumn($drop);
            }
        });
    }
};
