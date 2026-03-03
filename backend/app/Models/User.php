<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'company_name',
        'qc_id',
        'bday_month',
        'bday_day',
        'bday_year',
        'gender',
        'is_qc_resident',
        'email',
        'role',
        'password',
        'otp',
        'is_verified',
        'uploaded_docs',
        'verification_doc_path',
        'resume_path',
        'resume_original_name',
        'resume_stored_name',
        'resume_text',
        'parsed_skill',
        'educational_attainment',
        'industry',
        'address',
        'contact_number',
        'company_website',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
            'uploaded_docs' => 'boolean',
            'is_qc_resident' => 'boolean',
            'parsed_skill' => 'array',
        ];
    }
}
