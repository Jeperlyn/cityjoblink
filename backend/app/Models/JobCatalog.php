<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobCatalog extends Model
{
    protected $table = 'jobs_catalog'; // Force it to use your table name

    protected $fillable = [
        'title', 
        'description', 
        'required_skills', 
        'status', 
        'educational_attainment_required'
    ];

    // Tell Laravel that required_skills is a JSON/Array
    protected $casts = [
        'required_skills' => 'array',
    ];
}