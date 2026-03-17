// src/pages/EmployerDashboard.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    LayoutDashboard, Briefcase, Building2, MessageCircle, LogOut,
    Edit3, User, X, FileText, ChevronUp, ChevronDown, AlertCircle,
    CheckCircle, UploadCloud, Clock, MapPin, Globe, Phone, Eye, ExternalLink,
    CreditCard, Calendar, Smile, Mail, BookOpen, Star, Filter, TrendingUp,
    Target, ArrowRight, LayoutGrid, List, XCircle, Info
} from 'lucide-react';
import { API_BASE, buildBackendUrl } from '../lib/apiBase';

const JOB_LOCATION_GROUPS = [
    {
        label: 'City',
        options: [
            'Caloocan',
            'Las Pi\u00f1as',
            'Makati',
            'Malabon',
            'Mandaluyong',
            'Manila',
            'Marikina',
            'Muntinlupa',
            'Navotas',
            'Para\u00f1aque',
            'Pasay',
            'Pasig',
            'Quezon City',
            'San Juan',
            'Taguig',
            'Valenzuela'
        ]
    },
    {
        label: 'Municipality',
        options: ['Pateros']
    }
];

const JOB_LOCATION_VALUES = new Set(JOB_LOCATION_GROUPS.flatMap((group) => group.options));

const normalizeExternalUrl = (value) => {
    if (typeof value !== 'string') return null;

    const trimmed = value.trim();
    if (!trimmed) return null;

    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
        const url = new URL(withProtocol);
        if (!['http:', 'https:'].includes(url.protocol)) {
            return null;
        }

        return url.toString();
    } catch {
        return null;
    }
};

const buildApplicantBackgroundLinks = (applicant) => {
    if (!applicant) return [];

    const candidates = [
        { label: 'Portfolio / Website', value: applicant.portfolioUrl || applicant.portfolio_url },
        { label: 'LinkedIn', value: applicant.linkedinUrl || applicant.linkedin_url },
        { label: 'GitHub', value: applicant.githubUrl || applicant.github_url },
        { label: 'Facebook', value: applicant.facebookUrl || applicant.facebook_url },
        { label: 'Instagram', value: applicant.instagramUrl || applicant.instagram_url },
    ];

    const links = [];
    const seen = new Set();

    candidates.forEach((candidate) => {
        const normalizedUrl = normalizeExternalUrl(candidate.value);
        if (!normalizedUrl || seen.has(normalizedUrl)) {
            return;
        }

        seen.add(normalizedUrl);
        links.push({
            label: candidate.label,
            url: normalizedUrl,
        });
    });

    return links;
};

// Helper for Color Coding
const getMatchTextColorClass = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
};

const EmployerDashboard = ({ profile, jobs, applications, seekers, onPostJob, onUpdateJob, onUpdateProfile, onUploadDocs, onOpenChat, onUpdateStatus }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const [newJob, setNewJob] = useState({ title: '', salaryMin: '', salaryMax: '', location: '', type: 'Full-time', requiredSkills: '', educationalAttainmentRequired: '', description: '' });

    const [jobPostError, setJobPostError] = useState(null);

    const [targetApplicantId, setTargetApplicantId] = useState(null);
    const applicantRefs = useRef({});

    const [editProfileData, setEditProfileData] = useState({
        companyName: profile?.companyName || profile?.company_name || '',
        industry: profile?.industry || '',
        companyAddress: profile?.companyAddress || profile?.company_address || profile?.address || '',
        contactNumber: profile?.contactNumber || profile?.contact_number || '',
        companyWebsite: profile?.companyWebsite || profile?.company_website || ''
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const fileInputRef = useRef(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadedFileName, setUploadedFileName] = useState(null);
    const [viewApplicant, setViewApplicant] = useState(null);
    const [expandedJob, setExpandedJob] = useState(null);
    const [editingJob, setEditingJob] = useState(null);
    const [applicantStatusFilter, setApplicantStatusFilter] = useState('All');
    const [minFitScoreFilter, setMinFitScoreFilter] = useState('');

    // State for Kanban vs List View toggles per job
    const [viewModes, setViewModes] = useState({});
    
    // State for Match Insights Modal
    const [insightData, setInsightData] = useState(null);

    useEffect(() => {
        if (profile) {
            setEditProfileData({
                companyName: profile.companyName || profile.company_name || '',
                industry: profile.industry || '',
                companyAddress: profile.companyAddress || profile.company_address || profile.address || '',
                contactNumber: profile.contactNumber || profile.contact_number || '',
                companyWebsite: profile.companyWebsite || profile.company_website || ''
            });
        }
    }, [profile]);

    useEffect(() => {
        if (targetApplicantId && activeTab === 'jobs') {
            const timer = setTimeout(() => {
                const element = applicantRefs.current[targetApplicantId];
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                const clearTimer = setTimeout(() => setTargetApplicantId(null), 3000);
                return () => clearTimeout(clearTimer);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [targetApplicantId, activeTab, expandedJob]);

    const myJobs = useMemo(() => {
        if (!Array.isArray(jobs) || !profile?.id) return [];
        return jobs.filter(j => String(j.employerId) === String(profile.id));
    }, [jobs, profile?.id]);

    const recentActivities = useMemo(() => {
        if (!applications) return [];
        return [...applications]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
    }, [applications]);

    const getSortedApplicants = (jobId) => {
        if (!applications) return [];

        return applications
            .filter(a => String(a.jobId) === String(jobId))
            .filter(app => {
                const normalizedStatus = app.status === 'Cancelled' ? 'Withdrawn' : app.status;
                const statusPass = applicantStatusFilter === 'All' || normalizedStatus === applicantStatusFilter;
                const minFit = minFitScoreFilter === '' ? 0 : Number(minFitScoreFilter);
                const fitPass = Number(app.fitScore ?? 0) >= minFit;
                return statusPass && fitPass;
            })
            .sort((a, b) => (Number(b.fitScore) || 0) - (Number(a.fitScore) || 0));
    };

    const jobsToDisplay = useMemo(() => {
        const isFilterActive = applicantStatusFilter !== 'All' || minFitScoreFilter !== '';

        if (!isFilterActive) return myJobs;

        return myJobs.filter(j => getSortedApplicants(j.id).length > 0);
    }, [myJobs, applicantStatusFilter, minFitScoreFilter, applications]);

    const locateApplicant = (jobId, appId) => {
        setExpandedJob(jobId);
        setTargetApplicantId(appId);
        setActiveTab('jobs');
    };

    const handleSaveProfile = async () => {
        if (!editProfileData.industry || !editProfileData.companyAddress) {
            alert("Address and Industry are required to complete your profile.");
            return;
        }

        try {
            const payload = {
                email: profile.email,
                companyName: editProfileData.companyName,
                companyAddress: editProfileData.companyAddress,
                industry: editProfileData.industry,
                contactNumber: editProfileData.contactNumber,
                companyWebsite: editProfileData.companyWebsite
            };

            const response = await fetch(`${API_BASE}/employer/update-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.status === 'success') {
                const updatedUser = {
                    ...profile,          
                    ...data.user,         
                    companyName: editProfileData.companyName,
                    companyAddress: editProfileData.companyAddress,
                    address: editProfileData.companyAddress,      
                    company_address: editProfileData.companyAddress, 
                    industry: editProfileData.industry,
                    contactNumber: editProfileData.contactNumber,
                    contact_number: editProfileData.contactNumber, 
                    companyWebsite: editProfileData.companyWebsite,
                    company_website: editProfileData.companyWebsite 
                };

                localStorage.setItem('user', JSON.stringify(updatedUser));

                if (typeof onUpdateProfile === 'function') {
                    onUpdateProfile(updatedUser);
                }

                setActiveTab('overview');
                alert("Profile updated successfully!");
            } else {
                alert(data.message || "Failed to update profile.");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Network error while trying to save profile.");
        }
    };

    const handlePostJob = async () => {
        setJobPostError(null);

        const selectedLocationIsAllowed = Boolean(newJob.location) && (
            JOB_LOCATION_VALUES.has(newJob.location) || newJob.location === editingJob?.location
        );

        if (!newJob.title || newJob.title.trim().length < 5) {
            return setJobPostError("Job Title must be at least 5 characters long.");
        }
        if (!selectedLocationIsAllowed) {
            return setJobPostError("Please select a job location.");
        }
        if (!newJob.description || newJob.description.trim().length < 20) {
            return setJobPostError("Job Description must be at least 20 characters long.");
        }

        const noSpecialCharsRegex = /^[a-zA-Z0-9\s,.\-&]+$/;
        if (!noSpecialCharsRegex.test(newJob.title)) {
            return setJobPostError("Job Title contains invalid special characters (e.g., @, !, $, etc.).");
        }

        if (newJob.requiredSkills) {
            const skillsRegex = /^[a-zA-Z0-9\s,#+\-\.]+$/;
            if (!skillsRegex.test(newJob.requiredSkills)) {
                return setJobPostError("Required Skills contains invalid special characters. Use commas to separate.");
            }
        }

        if (newJob.salaryMin && newJob.salaryMax && Number(newJob.salaryMin) > Number(newJob.salaryMax)) {
            return setJobPostError("Minimum Salary cannot be greater than Maximum Salary.");
        }

        const skills = newJob.requiredSkills.split(',').map(s => s.trim()).filter(s => s !== "");
        const payload = {
            ...newJob,
            id: editingJob ? editingJob.id : Date.now(),
            requiredSkills: skills,
            employerId: profile.id,
            company: profile.companyName,
            status: editingJob ? editingJob.status : 'Open',
            posted: editingJob ? editingJob.posted : 'Just now'
        };

        const didSave = editingJob
            ? (typeof onUpdateJob === 'function' ? await onUpdateJob(payload) : false)
            : (typeof onPostJob === 'function' ? await onPostJob(payload) : false);

        if (!didSave) {
            return;
        }

        setActiveTab('jobs');
        setEditingJob(null);
        setNewJob({ title: '', salaryMin: '', salaryMax: '', location: '', type: 'Full-time', requiredSkills: '', educationalAttainmentRequired: '', description: '' });
    };

    const handleEditJob = (job) => {
        let formattedSkills = '';
        if (job.requiredSkills) {
            if (Array.isArray(job.requiredSkills)) {
                formattedSkills = job.requiredSkills.join(', ');
            } else if (typeof job.requiredSkills === 'string') {
                try {
                    const parsed = JSON.parse(job.requiredSkills);
                    formattedSkills = Array.isArray(parsed) ? parsed.join(', ') : job.requiredSkills;
                } catch {
                    formattedSkills = job.requiredSkills;
                }
            }
        }

        setNewJob({
            ...job,
            salaryMin: job.salaryMin ?? '',
            salaryMax: job.salaryMax ?? '',
            educationalAttainmentRequired: job.educationalAttainmentRequired || '',
            requiredSkills: formattedSkills
        });
        setEditingJob(job);
        setJobPostError(null);
        setActiveTab('post_job');
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            setUploadedFileName(file.name);
        }
    };

    const handleSubmitDocs = async () => {
        if (!uploadedFile) return alert("Select a file.");
        const ok = await onUploadDocs(uploadedFile);
        if (ok) setShowSuccessModal(true);
    };

    const toggleJobStatus = (job) => {
        const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
        if(typeof onUpdateJob === 'function') {
            onUpdateJob({ ...job, status: newStatus }); 
        }
    };

    const salaryOptions = Array.from({ length: 99 }, (_, index) => (index + 2) * 5000);
    const statusFilterOptions = ['All', 'Pending', 'Viewing', 'Interview', 'Hired', 'Rejected', 'Withdrawn'];
    const jobLocationOptions = useMemo(() => {
        if (newJob.location && !JOB_LOCATION_VALUES.has(newJob.location)) {
            return [
                { label: 'Current Saved Location', options: [newJob.location] },
                ...JOB_LOCATION_GROUPS,
            ];
        }

        return JOB_LOCATION_GROUPS;
    }, [newJob.location]);
    const applicantBackgroundLinks = useMemo(() => buildApplicantBackgroundLinks(viewApplicant), [viewApplicant]);

    const isProfileInfoComplete = profile?.industry && (profile?.address || profile?.companyAddress || profile?.company_address);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* SIDEBAR NAVIGATION */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                        <Building2 size={24} /> Employer Portal
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <LayoutDashboard size={18} /> Overview
                    </button>
                    <button onClick={() => setActiveTab('jobs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'jobs' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <Briefcase size={18} /> My Job Posts
                    </button>
                </nav>

                <div className="p-4 border-t">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="ml-64 flex-1 p-8">

                {/* VIEW 1: OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Welcome, {profile?.name || profile?.companyName || profile?.company_name || 'Employer'}!</h2>
                            <button onClick={() => { setActiveTab('post_job'); setJobPostError(null); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-md hover:bg-blue-700 flex items-center gap-2">
                                <Edit3 size={18} /> Post a New Job
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl border shadow-sm">
                                <p className="text-gray-500 text-sm font-bold uppercase">Active Jobs</p>
                                <p className="text-3xl font-black mt-1">{myJobs.length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border shadow-sm">
                                <p className="text-gray-500 text-sm font-bold uppercase">Total Applicants</p>
                                <p className="text-3xl font-black mt-1">{applications?.length || 0}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-between">
                                <p className="text-gray-500 text-sm font-bold uppercase">Profile Status</p>
                                {!isProfileInfoComplete ? (
                                    <span className="text-red-500 font-bold flex items-center gap-1 mt-1 animate-bounce"><AlertCircle size={16} /> Incomplete Info</span>
                                ) : !profile?.isVerified ? (
                                    <span className="text-orange-500 font-bold flex items-center gap-1 mt-1"><Clock size={16} /> Pending Admin Approval</span>
                                ) : (
                                    <span className="text-green-500 font-bold flex items-center gap-1 mt-1"><CheckCircle size={16} /> Complete & Verified</span>
                                )}
                            </div>
                        </div>

                        {!profile?.isVerified && (
                            <div className="bg-orange-50 border-orange-200 border p-6 rounded-2xl mb-6 shadow-sm mt-6">
                                <h3 className="font-bold text-orange-800 flex items-center gap-2 text-lg">
                                    <AlertCircle size={22} /> Verification Required
                                </h3>
                                {profile?.uploadedDocs ? (
                                    <div className="mt-4 bg-white p-4 rounded-xl border border-orange-100 flex items-center gap-3 text-orange-700 font-bold shadow-sm">
                                        <Clock size={20} /> Your documents are currently under Admin Review.
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        <p className="text-sm text-orange-800 mb-4 font-medium">
                                            Please upload your business permit or relevant documents to verify your account and enable job postings.
                                        </p>
                                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.png,.doc,.docx" />
                                        <div
                                            className={`border-2 border-dashed p-10 rounded-2xl cursor-pointer hover:bg-orange-100 transition-all flex flex-col items-center justify-center gap-3 mb-4 ${uploadedFileName ? 'bg-orange-100 border-orange-400' : 'border-orange-300'}`}
                                            onClick={() => fileInputRef.current.click()}
                                        >
                                            {uploadedFileName ? (
                                                <>
                                                    <FileText className="text-orange-600" size={40} />
                                                    <span className="font-bold text-orange-800">{uploadedFileName}</span>
                                                    <span className="text-xs text-orange-600 font-bold uppercase tracking-widest">Click to change file</span>
                                                </>
                                            ) : (
                                                <>
                                                    <UploadCloud className="text-orange-400" size={40} />
                                                    <span className="text-orange-800 font-black uppercase tracking-tighter text-center">Click to Upload Business Documents</span>
                                                    <span className="text-xs text-orange-500 font-bold">(PDF, JPG, PNG)</span>
                                                </>
                                            )}
                                        </div>
                                        {uploadedFileName && (
                                            <button onClick={handleSubmitDocs} className="bg-orange-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-tight shadow-lg hover:bg-orange-700 transition-all w-full sm:w-auto">
                                                Submit for Verification
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-white rounded-xl border shadow-sm overflow-hidden mt-8">
                            <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    <Clock size={18} className="text-blue-500" /> Recent Application Activity
                                </h3>
                            </div>
                            <div className="divide-y">
                                {recentActivities.length > 0 ? (
                                    recentActivities.map(activity => {
                                        const seeker = seekers.find(s => String(s.id) === String(activity.seekerId));
                                        const job = jobs.find(j => String(j.id) === String(activity.jobId));
                                        return (
                                            <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                        {seeker?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{seeker?.name || 'Unknown Applicant'}</p>
                                                        <p className="text-xs text-gray-500">Applied for <span className="font-semibold text-blue-600">{job?.title || 'Job Post'}</span></p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-100 text-gray-600 uppercase">
                                                        {activity.date}
                                                    </span>
                                                    <button
                                                        onClick={() => locateApplicant(activity.jobId, activity.id)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Locate Applicant"
                                                    >
                                                        <Target size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-8 text-center text-gray-400 text-sm italic">No recent activity yet.</div>
                                )}
                            </div>
                            <div className="p-3 bg-gray-50 text-center border-t">
                                <button onClick={() => setActiveTab('jobs')} className="text-xs font-bold text-blue-600 flex items-center gap-1 mx-auto hover:underline">
                                    View all applications <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>

                        {!isProfileInfoComplete && (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 text-red-600 rounded-full"><AlertCircle size={20} /></div>
                                    <div>
                                        <p className="font-bold text-red-900 text-sm">Action Required: Complete Employer Details</p>
                                        <p className="text-red-700 text-xs">Address and Industry are mandatory for job posting legitimacy.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* VIEW 2: JOB POSTS */}
                {activeTab === 'jobs' && (
                    <div className="space-y-6">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <h2 className="text-2xl font-bold text-gray-900">Manage Job Postings</h2>

                            <div className="flex flex-wrap gap-3 bg-white p-3 rounded-xl border shadow-sm">
                                <div className="flex items-center gap-2 border-r pr-3">
                                    <Filter size={16} className="text-gray-400" />
                                    <select
                                        className="text-xs font-bold bg-transparent outline-none cursor-pointer"
                                        value={applicantStatusFilter}
                                        onChange={(e) => setApplicantStatusFilter(e.target.value)}
                                    >
                                        {statusFilterOptions.map(opt => <option key={opt} value={opt}>{opt} Status</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={16} className="text-gray-400" />
                                    <input
                                        type="number"
                                        min="0" max="100"
                                        placeholder="Min Fit %"
                                        className="text-xs font-bold w-20 outline-none"
                                        value={minFitScoreFilter}
                                        onChange={(e) => setMinFitScoreFilter(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => { setApplicantStatusFilter('All'); setMinFitScoreFilter(''); }}
                                    className="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold hover:bg-gray-200 transition-colors"
                                >
                                    CLEAR
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {jobsToDisplay.length === 0 ? (
                                <div className="py-20 text-center bg-white rounded-xl border border-dashed text-gray-400">
                                    {(applicantStatusFilter !== 'All' || minFitScoreFilter !== '')
                                        ? "No job posts match your applicant filters."
                                        : "No job posts yet. Start by creating one!"}
                                </div>
                            ) : (
                                jobsToDisplay.map(j => {
                                    const isKanban = viewModes[j.id] === 'kanban';

                                    return (
                                    <div key={j.id} className="bg-white p-6 rounded-xl border shadow-sm transition-all duration-300 w-full overflow-hidden">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-xl">{j.title}</h3>
                                                <div className="flex gap-2 mt-2 items-center">
                                                    
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); toggleJobStatus(j); }} 
                                                        className={`text-xs px-2 py-1 rounded font-bold cursor-pointer hover:opacity-80 transition-opacity ${j.status === 'Open' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`} 
                                                        title="Click to toggle Open/Closed"
                                                    >
                                                        {j.status === 'Open' ? '🟢 Open' : '⚫ Closed'}
                                                    </button>

                                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold">
                                                        {j.salaryMin && j.salaryMax ? `₱${j.salaryMin.toLocaleString()} - ₱${j.salaryMax.toLocaleString()}` : (j.salary || "Negotiable")}
                                                    </span>
                                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">{j.type}</span>
                                                </div>
                                                {j.location && (
                                                    <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500">
                                                        <MapPin size={14} className="text-blue-500" />
                                                        <span>{j.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setExpandedJob(expandedJob === j.id ? null : j.id)} className="p-2 border rounded-lg hover:bg-gray-50">{expandedJob === j.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
                                                <button onClick={() => handleEditJob(j)} className="p-2 bg-gray-900 text-white rounded-lg hover:bg-black"><Edit3 size={20} /></button>
                                            </div>
                                        </div>

                                        {expandedJob === j.id && (
                                            <div className="mt-4 p-5 bg-gray-50 rounded-xl text-sm border space-y-4 animate-in slide-in-from-top-2 duration-300">
                                                <div>
                                                    <h4 className="text-xs font-black text-gray-400 uppercase mb-1">Job Description</h4>
                                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{j.description}</p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                                    <div>
                                                        <h4 className="text-xs font-black text-gray-400 uppercase mb-1 flex items-center gap-1"><MapPin size={12} /> Location</h4>
                                                        <p className="font-semibold text-gray-800">{j.location || "Not specified"}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-black text-gray-400 uppercase mb-1 flex items-center gap-1"> Educational Attainment</h4>
                                                        <p className="font-semibold text-gray-800">{j.educationalAttainmentRequired || "Not specified"}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-black text-gray-400 uppercase mb-1">Required Skills</h4>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {j.requiredSkills && j.requiredSkills.length > 0 ? (
                                                                Array.isArray(j.requiredSkills) ? j.requiredSkills.map((skill, idx) => (
                                                                    <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{skill}</span>
                                                                )) : <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{j.requiredSkills}</span>
                                                            ) : (
                                                                <span className="text-gray-500 italic">Not specified</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-6 pt-6 border-t w-full">
                                            
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                                                <h4 className="text-xs font-black text-gray-400 uppercase flex items-center gap-2">
                                                    <User size={14} /> Applicants ({getSortedApplicants(j.id).length})
                                                    {(applicantStatusFilter !== 'All' || minFitScoreFilter !== '') && <span className="text-[10px] text-orange-600 lowercase font-medium ml-1">(Filtered)</span>}
                                                </h4>
                                                
                                                {/* The Toggle Switch */}
                                                <div className="bg-gray-100 p-1 rounded-lg flex items-center gap-1 w-fit">
                                                    <button 
                                                        onClick={() => setViewModes(prev => ({...prev, [j.id]: 'list'}))} 
                                                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${!isKanban ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                                                    >
                                                        <List size={14}/> List
                                                    </button>
                                                    <button 
                                                        onClick={() => setViewModes(prev => ({...prev, [j.id]: 'kanban'}))} 
                                                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${isKanban ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                                                    >
                                                        <LayoutGrid size={14}/> Board
                                                    </button>
                                                </div>
                                            </div>

                                            {/* KANBAN BOARD VIEW */}
                                            {isKanban ? (
                                                <div className="w-full overflow-hidden">
                                                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x animate-in fade-in duration-300 w-full" style={{ scrollbarWidth: 'thin' }}>
                                                        {['Pending', 'Viewing', 'Interview', 'Hired', 'Rejected'].map(colStatus => {
                                                            const colApps = getSortedApplicants(j.id).filter(a => a.status === colStatus);
                                                            
                                                            return (
                                                                <div key={colStatus} className="min-w-[250px] w-[250px] shrink-0 bg-gray-50/80 border border-gray-200 rounded-2xl flex flex-col max-h-[600px] snap-center">
                                                                    <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-100/50 rounded-t-2xl">
                                                                        <h5 className="font-bold text-gray-700 text-sm">{colStatus}</h5>
                                                                        <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{colApps.length}</span>
                                                                    </div>
                                                                    
                                                                    {/* Column Body */}
                                                                    <div className="overflow-y-auto flex-1 p-3 space-y-3">
                                                                        {colApps.map(app => {
                                                                            const s = seekers.find(u => String(u.id) === String(app.seekerId));
                                                                            const isHighMatch = Number(app.fitScore ?? 0) >= 80;
                                                                            const isTargeted = String(targetApplicantId) === String(app.id);
                                                                            
                                                                            return (
                                                                                <div key={app.id} ref={el => applicantRefs.current[app.id] = el} className={`bg-white p-4 rounded-xl border shadow-sm transition-all duration-300 ${isTargeted ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:border-blue-300'}`}>
                                                                                    <div className="flex items-center gap-3 mb-3">
                                                                                        <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center font-bold ${isHighMatch ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                                                                            {s?.name?.charAt(0) || '?'}
                                                                                        </div>
                                                                                        <div className="overflow-hidden">
                                                                                            <p className="font-bold text-sm text-gray-900 truncate">{s?.name || 'Unknown'}</p>
                                                                                            <p className="text-[10px] text-gray-500 mt-0.5">{app.date}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    
                                                                                    {/* Match Insight Button (Kanban) */}
                                                                                    <div className="mb-3">
                                                                                        <button onClick={() => setInsightData({ app, seeker: s, job: j })} className="w-full text-left bg-gray-50 p-2.5 rounded-lg hover:bg-blue-50 transition-colors group border border-transparent hover:border-blue-100">
                                                                                            <div className="flex justify-between items-center mb-1.5">
                                                                                                <span className={`text-xs font-black ${isHighMatch ? 'text-emerald-600' : 'text-blue-600'}`}>{app.fitScore || 0}% Match</span>
                                                                                                <Target size={14} className="text-gray-400 group-hover:text-blue-500"/>
                                                                                            </div>
                                                                                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                                                                <div className={`h-full ${isHighMatch ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${app.fitScore || 0}%` }}></div>
                                                                                            </div>
                                                                                        </button>
                                                                                    </div>
                                                                                    
                                                                                    <div className="flex items-center justify-between gap-2 border-t pt-3">
                                                                                        <div className="flex gap-1">
                                                                                            <button onClick={() => s && onOpenChat(s.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md" title="Message"><MessageCircle size={16}/></button>
                                                                                            <button onClick={() => s && setViewApplicant(s)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md" title="View Document"><FileText size={16}/></button>
                                                                                        </div>
                                                                                        <select 
                                                                                            className="text-xs font-bold border rounded-md p-1.5 bg-gray-50 outline-none focus:ring-1 focus:ring-blue-500" 
                                                                                            value={app.status} 
                                                                                            onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                                                                                        >
                                                                                            <option>Pending</option><option>Viewing</option><option>Interview</option><option>Hired</option><option>Rejected</option>
                                                                                        </select>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                        
                                                                        {colApps.length === 0 && (
                                                                            <div className="text-center p-4 text-xs font-medium text-gray-400 italic border-2 border-dashed border-gray-200 rounded-xl">
                                                                                No applicants
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* EXISTING LIST VIEW */
                                                <div className="space-y-3 animate-in fade-in duration-300">
                                                    {getSortedApplicants(j.id).map(app => {
                                                        const s = seekers.find(u => String(u.id) === String(app.seekerId));
                                                        const isWithdrawn = app.status === 'Cancelled' || app.status === 'Withdrawn';
                                                        const isHighMatch = Number(app.fitScore ?? 0) >= 80;
                                                        const isTargeted = String(targetApplicantId) === String(app.id);

                                                        return (
                                                            <div
                                                                key={app.id}
                                                                ref={el => applicantRefs.current[app.id] = el}
                                                                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-500 gap-4 ${isTargeted ? 'ring-2 ring-blue-500 scale-[1.02] bg-blue-50 shadow-sm' : 'bg-white'} ${isHighMatch && !isWithdrawn && !isTargeted ? 'border-l-4 border-l-emerald-500 bg-emerald-50/20' : ''} ${isWithdrawn ? 'bg-gray-50 opacity-60 grayscale' : 'shadow-sm hover:shadow-md'}`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${isHighMatch && !isWithdrawn ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                                                        {s?.name?.charAt(0) || '?'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-sm flex items-center gap-2">
                                                                            {s?.name || 'Unknown'}
                                                                            {isHighMatch && !isWithdrawn && <span className="bg-emerald-600 text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase">Best Fit</span>}
                                                                            {isTargeted && <span className="animate-pulse bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase">Found!</span>}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">{app.date}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                                                                    {/* Match Insight Button (List) */}
                                                                    <div className="text-left sm:text-right w-full sm:w-auto">
                                                                        <button 
                                                                            onClick={() => setInsightData({ app, seeker: s, job: j })} 
                                                                            className="text-right group hover:bg-gray-50 p-1.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200 block w-full"
                                                                        >
                                                                            <div className="flex items-center sm:justify-end gap-1 mb-1">
                                                                                <Target size={14} className="text-gray-400 group-hover:text-blue-500"/>
                                                                                <p className={`text-xs font-black ${isHighMatch && !isWithdrawn ? 'text-emerald-700' : 'text-gray-600'}`}>{app.fitScore || 0}% Match</p>
                                                                            </div>
                                                                            <div className="w-full sm:w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden ml-auto">
                                                                                <div className={`h-full ${isHighMatch && !isWithdrawn ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${app.fitScore || 0}%` }}></div>
                                                                            </div>
                                                                        </button>

                                                                        {isWithdrawn && app.rejectionReason && (
                                                                            <p className="text-[10px] text-red-600 mt-1 max-w-[220px] truncate" title={`Withdrawal reason: ${app.rejectionReason}`}>
                                                                                Withdrawal reason: {app.rejectionReason}
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                                                                        <button
                                                                            onClick={() => !isWithdrawn && s && onOpenChat(s.id)}
                                                                            disabled={isWithdrawn}
                                                                            title="Message Applicant"
                                                                            className="p-2 border rounded-lg hover:bg-blue-50 bg-white text-blue-600 disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-sm"
                                                                        >
                                                                            <MessageCircle size={16} />
                                                                        </button>

                                                                        <button onClick={() => !isWithdrawn && s && setViewApplicant(s)} className="text-xs font-bold px-3 py-2 border rounded-lg hover:bg-gray-50 bg-white shadow-sm">View Doc</button>
                                                                        <select
                                                                            className="text-xs font-bold border rounded-lg p-2 bg-white shadow-sm outline-none"
                                                                            value={app.status}
                                                                            onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                                                                            disabled={isWithdrawn}
                                                                        >
                                                                            <option>Pending</option><option>Viewing</option><option>Interview</option><option>Hired</option><option>Rejected</option>
                                                                            {isWithdrawn && <option disabled>Withdrawn</option>}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* VIEW 3: COMPANY SETTINGS */}
                {activeTab === 'profile' && (
                    <div className="max-w-2xl space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Company Settings</h2>
                        <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Company Name</label>
                                    <input className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={editProfileData.companyName} onChange={e => setEditProfileData({ ...editProfileData, companyName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Industry *</label>
                                    <select
                                        className={`w-full p-3 border rounded-xl bg-gray-50 outline-none ${!editProfileData.industry && 'border-red-300'}`}
                                        value={editProfileData.industry}
                                        onChange={e => setEditProfileData({ ...editProfileData, industry: e.target.value })}
                                    >
                                        <option value="">Choose Industry</option>
                                        <option value="BPO / Call Center">BPO / Call Center</option>
                                        <option value="IT & Software">IT & Software</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Retail & Sales">Retail & Sales</option>
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Construction">Construction</option>
                                        <option value="Finance">Finance</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Address *</label>
                                <textarea className={`w-full p-3 border rounded-xl bg-gray-50 h-24 outline-none ${!editProfileData.companyAddress && 'border-red-300'}`} placeholder="Street, Barangay, City..." value={editProfileData.companyAddress} onChange={e => setEditProfileData({ ...editProfileData, companyAddress: e.target.value })} />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Contact No.</label>
                                    <input className="w-full p-3 border rounded-xl bg-gray-50" value={editProfileData.contactNumber} onChange={e => setEditProfileData({ ...editProfileData, contactNumber: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Website</label>
                                    <input className="w-full p-3 border rounded-xl bg-gray-50" value={editProfileData.companyWebsite} onChange={e => setEditProfileData({ ...editProfileData, companyWebsite: e.target.value })} />
                                </div>
                            </div>

                            <button onClick={handleSaveProfile} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">Save Profile Information</button>
                        </div>
                    </div>
                )}

                {/* VIEW 4: POST/EDIT JOB FORM */}
                {activeTab === 'post_job' && (
                    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border shadow-lg border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">{editingJob ? 'Edit Job Posting' : 'Create Job Post'}</h2>
                            <button onClick={() => { setActiveTab('jobs'); setEditingJob(null); setJobPostError(null); }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><X /></button>
                        </div>

                        {jobPostError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 animate-in fade-in zoom-in duration-300">
                                <AlertCircle size={20} />
                                <span className="text-sm font-bold">{jobPostError}</span>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="w-full p-3.5 border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Job Title" value={newJob.title} onChange={e => { const cleanValue = e.target.value.replace(/[^a-zA-Z0-9\s,.\-&]/g, ''); setNewJob({ ...newJob, title: cleanValue }); }} />
                                <select className="w-full p-3.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })}>
                                    <option value="">Select Job Location</option>
                                    {jobLocationOptions.map((group) => (
                                        <optgroup key={group.label} label={group.label}>
                                            {group.options.map((location) => (
                                                <option key={location} value={location}>{location}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select className="w-full p-3.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" value={newJob.salaryMin} onChange={e => setNewJob({ ...newJob, salaryMin: Number(e.target.value) })}>
                                    <option value="">Minimum Salary</option>
                                    {salaryOptions.map(val => <option key={val} value={val}>₱{val.toLocaleString()}</option>)}
                                </select>
                                <select className="w-full p-3.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" value={newJob.salaryMax} onChange={e => setNewJob({ ...newJob, salaryMax: Number(e.target.value) })}>
                                    <option value="">Maximum Salary</option>
                                    {salaryOptions.filter(v => v >= newJob.salaryMin).map(val => <option key={val} value={val}>₱{val.toLocaleString()}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select className="w-full p-3.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" value={newJob.type} onChange={e => setNewJob({ ...newJob, type: e.target.value })}>
                                    <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Freelance</option>
                                </select>
                                <select className="w-full p-3.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" value={newJob.educationalAttainmentRequired} onChange={e => setNewJob({ ...newJob, educationalAttainmentRequired: e.target.value })}>
                                    <option value="">Educational Attainment (Optional)</option><option value="High School Diploma">High School Diploma</option><option value="Associate Degree">Associate Degree</option><option value="Bachelor's Degree">Bachelor's Degree</option><option value="Master's Degree">Master's Degree</option><option value="Doctorate">Doctorate</option>
                                </select>
                            </div>

                            <textarea className="w-full p-3.5 border border-gray-200 rounded-lg bg-white placeholder-gray-400 h-44 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Job Description & Responsibilities..." value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} />

                            <div>
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2 block">Required Skills (Comma separated)</label>
                                <input className="w-full p-3.5 border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Communication, Excel, Sales" value={newJob.requiredSkills} onChange={e => { const cleanValue = e.target.value.replace(/[^a-zA-Z0-9\s,#+\-\.]/g, ''); setNewJob({ ...newJob, requiredSkills: cleanValue }); }} />
                            </div>

                            <button disabled={!profile?.isVerified} onClick={handlePostJob} className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-900 transition-all active:scale-[0.98] shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed mt-4">
                                {editingJob ? 'Update Job' : 'Post Job Now'}
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* ✅ BULLETPROOF MATCH INSIGHTS MODAL */}
            {insightData && (
                <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden transform animate-in zoom-in duration-200">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Target className="text-blue-600" /> Match Insights: {insightData.seeker?.name || 'Unknown Applicant'}
                            </h2>
                            <button onClick={() => setInsightData(null)}><X size={24} className="text-gray-400 hover:text-black" /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <div>
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-1">Overall Fit Score</h3>
                                    <p className={`text-4xl font-black ${getMatchTextColorClass(insightData.app?.fitScore || 0)}`}>{insightData.app?.fitScore || 0}%</p>
                                </div>
                                <div className="text-right">
                                     <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-1">Education Requirement</h3>
                                     <p className={`text-xl font-bold ${insightData.app?.educationMatch === false ? 'text-red-600' : 'text-green-600'}`}>
                                         {insightData.app?.educationMatch === false ? 'Failed' : 'Passed'}
                                     </p>
                                </div>
                            </div>

                            {/* ✅ NEW: EXPLICIT AUTO-DECLINE MESSAGE */}
                            {insightData.app?.educationMatch === false && (
                                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                    <h4 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-1"><AlertCircle size={16}/> Auto-Disqualified</h4>
                                    <p className="text-sm text-red-700">This candidate was automatically assigned a 0% match score because their educational attainment does not meet the minimum requirement for this position.</p>
                                </div>
                            )}
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-green-50/50 p-5 rounded-xl border border-green-100">
                                    <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2"><CheckCircle size={16}/> Matched Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(insightData.app?.matchedSkills) && insightData.app.matchedSkills.length > 0 ? insightData.app.matchedSkills.map((s, i) => (
                                            <span key={i} className="bg-white text-green-700 text-xs font-bold px-2.5 py-1 rounded shadow-sm border border-green-200">{s}</span>
                                        )) : <span className="text-xs text-gray-500">No matches</span>}
                                    </div>
                                </div>
                                <div className="bg-red-50/50 p-5 rounded-xl border border-red-100">
                                    <h4 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2"><XCircle size={16}/> Missing Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(insightData.app?.missingSkills) && insightData.app.missingSkills.length > 0 ? insightData.app.missingSkills.map((s, i) => (
                                            <span key={i} className="bg-white text-red-700 text-xs font-bold px-2.5 py-1 rounded shadow-sm border border-red-200">{s}</span>
                                        )) : <span className="text-xs text-gray-500">None missing</span>}
                                    </div>
                                </div>
                            </div>

                            {insightData.app?.matchReasons && (
                                <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                                    <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2"><Info size={16}/> System Reasoning</h4>
                                    <p className="text-sm text-gray-700">{insightData.app.matchReasons}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* APPLICANT PROFILE MODAL */}
            {viewApplicant && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform animate-in zoom-in duration-200">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2"><User className="text-blue-600" /> Applicant Profile</h2>
                            <button onClick={() => setViewApplicant(null)}><X size={24} className="text-gray-400 hover:text-black" /></button>
                        </div>
                        <div className="p-8 bg-gray-50 space-y-4">
                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                <p className="text-xs font-black text-gray-400 uppercase">Name</p>
                                <p className="text-lg font-bold">{viewApplicant.name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl border shadow-sm">
                                    <p className="text-xs font-black text-gray-400 uppercase mb-1">QCitizen ID</p>
                                    <p className="font-bold text-sm truncate">{viewApplicant.qcId || "N/A"}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border shadow-sm">
                                    <p className="text-xs font-black text-gray-400 uppercase mb-1">Gender</p>
                                    <p className="font-bold text-sm truncate">{viewApplicant.gender || "N/A"}</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                <p className="text-xs font-black text-gray-400 uppercase mb-1">Email</p>
                                <p className="font-bold text-sm truncate">{viewApplicant.email}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                <p className="text-xs font-black text-gray-400 uppercase mb-1">Education</p>
                                <p className="font-bold text-sm">{viewApplicant.educationalAttainment || "Not identified"}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                <p className="text-xs font-black text-gray-400 uppercase mb-2">Background Links</p>
                                {applicantBackgroundLinks.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {applicantBackgroundLinks.map((link) => (
                                            <a
                                                key={link.url}
                                                href={link.url}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors"
                                            >
                                                <ExternalLink size={14} />
                                                <span>{link.label}</span>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No background links provided by applicant.</p>
                                )}
                            </div>
                        </div>
                        <div className="p-6 flex justify-end gap-3 border-t bg-white">
                            {viewApplicant.resume_path ? (
                                <button
                                    onClick={() => window.open(buildBackendUrl(viewApplicant.resume_path), '_blank')}
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all"
                                >
                                    <Eye size={18} /> View Document
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="bg-gray-300 text-gray-500 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 cursor-not-allowed"
                                >
                                    <AlertCircle size={18} /> No Resume Available
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-200">
                        <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4"><CheckCircle size={40} /></div>
                        <h3 className="text-xl font-bold text-gray-900">Request Sent!</h3>
                        <p className="text-sm text-gray-600 mt-2 mb-6">Verification documents have been sent to Admin for review.</p>
                        <button onClick={() => setShowSuccessModal(false)} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg transition-all">Understood</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default EmployerDashboard;