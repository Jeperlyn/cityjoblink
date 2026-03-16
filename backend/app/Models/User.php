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
        'seeker_id_doc_path',
        'seeker_id_doc_original_name',
        'seeker_id_doc_stored_name',
        'id_verification_status',
        'id_verification_reason',
        'id_verification_confidence',
        'id_verification_provider',
        'id_verification_reference',
        'id_verification_checked_at',
        'id_extracted_qc_id',
        'id_extracted_name',
        'id_extracted_birthdate',
        'id_extracted_gender',
        'id_birthdate_matches_profile',
        'id_gender_matches_profile',
        'id_ocr_text',
        'is_priority_verified',
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
        'portfolio_url',
        'linkedin_url',
        'github_url',
        'facebook_url',
        'instagram_url',
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
            'is_priority_verified' => 'boolean',
            'id_verification_confidence' => 'float',
            'id_verification_checked_at' => 'datetime',
            'id_birthdate_matches_profile' => 'boolean',
            'id_gender_matches_profile' => 'boolean',
            'parsed_skill' => 'array',
        ];
    }
}
