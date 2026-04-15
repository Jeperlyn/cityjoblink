// src/pages/AdminDashboard.jsx
import React, { useMemo, useState } from 'react';
import { File, Calendar, Plus, Users, MapPin, Clock, CheckCircle, XCircle, AlertTriangle, Star, TrendingUp, FileCheck, ExternalLink, ChevronDown, GraduationCap, Trash2 } from 'lucide-react';
import { buildBackendUrl } from '../lib/apiBase';

const seekerStatusLabels = {
    verified: 'Verified',
    rejected: 'Unverified',
    manual_review: 'Under Manual Review',
    pending: 'Pending Verification',
    not_submitted: 'Awaiting Admin Review',
    error: 'Verification Error',
};

const seekerStatusStyles = {
    verified: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    manual_review: 'bg-amber-100 text-amber-700 border-amber-200',
    pending: 'bg-blue-100 text-blue-700 border-blue-200',
    not_submitted: 'bg-slate-100 text-slate-700 border-slate-200',
    error: 'bg-red-100 text-red-700 border-red-200',
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
    });
};

const format12Hour = (time24) => {
    if (!time24) return '';
    let [hours, minutes] = time24.split(':');
    hours = parseInt(hours, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

const AdminDashboard = ({
    employers = [],
    seekers = [],
    analytics,
    onVerifyEmployer,
    onReviewSeeker,
    jobFairs = [],
    onAddJobFair,
    notify,
    onMessageEmployer,
    trainings = [],
    onAddTraining,
    onDeleteTraining,
}) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [analyticsTab, setAnalyticsTab] = useState('employer');
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showFairSuccessModal, setShowFairSuccessModal] = useState(false);
    const [selectedEmployerId, setSelectedEmployerId] = useState(null);
    const [seekerReviewModal, setSeekerReviewModal] = useState({
        open: false,
        approved: true,
        seeker: null,
        reason: '',
        isSubmitting: false,
    });
    const [seekerSubTab, setSeekerSubTab] = useState('qc');
    const [employerMessageModal, setEmployerMessageModal] = useState({ open: false, employer: null, text: '', isSending: false });

    const [newFair, setNewFair] = useState({
        title: '',
        location: '',
        date: '',
        startTime: '',
        endTime: '',
        organizer: 'PESO QC & DOLE',
        description: '',
        imageFile: null,
        highlightsString: '',
    });

    const [newTraining, setNewTraining] = useState({
        title: '',
        provider: 'QCTAC',
        type: '',
        description: '',
        slots: '',
        start_date: '',
        end_date: '',
    });
    const [showTrainingSuccessModal, setShowTrainingSuccessModal] = useState(false);
    const [isSubmittingTraining, setIsSubmittingTraining] = useState(false);

    const summary = analytics?.summary || {};
    const ratingBreakdown = analytics?.ratingBreakdown || [];
    const decisionBreakdown = analytics?.decisionBreakdown || [];
    const topEmployers = analytics?.topEmployers || [];
    const employerAnalytics = analytics?.employerAnalytics || {};
    const seekerAnalytics = analytics?.seekerAnalytics || {};
    const employerSummary = employerAnalytics?.summary || {};
    const employerTopCompanies = employerAnalytics?.topCompanies || [];
    const seekerSummary = seekerAnalytics?.summary || {};
    const ageBreakdown = seekerAnalytics?.ageBreakdown || {};
    const genderBreakdown = seekerAnalytics?.genderBreakdown || {};
    const residencyBreakdown = seekerAnalytics?.residencyBreakdown || {};
    const applicationStageBreakdown = seekerAnalytics?.applicationStageBreakdown || {};
    const hiredByResidency = seekerAnalytics?.hiredByResidency || {};
    const hiredByGender = seekerAnalytics?.hiredByGender || {};
    const hiredByPriority = seekerAnalytics?.hiredByPriority || {};

    const pendingEmployers = useMemo(
        () => employers.filter((employer) => {
            const status = employer.employerVerificationStatus || employer.employer_verification_status;
            if (status) {
                return status !== 'verified';
            }

            return employer.uploadedDocs && !employer.isVerified;
        }),
        [employers]
    );
    const maxRatingCount = useMemo(
        () => Math.max(...ratingBreakdown.map((item) => item.total || 0), 1),
        [ratingBreakdown]
    );

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setNewFair({ ...newFair, imageFile: e.target.files[0] });
        }
    };

    const getPreviewImageUrl = () => {
        if (newFair.imageFile) {
            return URL.createObjectURL(newFair.imageFile);
        }

        return 'https://via.placeholder.com/400x200?text=No+Image+Selected';
    };

    const handlePostFair = (e) => {
        e.preventDefault();

        const highlights = newFair.highlightsString
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

        // Construct final time string combining Start and End times
        const finalTime = newFair.startTime && newFair.endTime 
            ? `${format12Hour(newFair.startTime)} - ${format12Hour(newFair.endTime)}`
            : format12Hour(newFair.startTime) || '';

        onAddJobFair({
            ...newFair,
            time: finalTime,
            highlights,
        });

        setNewFair({
            title: '',
            location: '',
            date: '',
            startTime: '',
            endTime: '',
            organizer: 'PESO QC & DOLE',
            description: '',
            imageFile: null,
            highlightsString: '',
        });
        setShowFairSuccessModal(true);
    };

    const handlePostTraining = async (e) => {
        e.preventDefault();
        setIsSubmittingTraining(true);
        try {
            await onAddTraining({ ...newTraining, slots: Number(newTraining.slots) });
            setNewTraining({ title: '', provider: 'QCTAC', type: '', description: '', slots: '', start_date: '', end_date: '' });
            setShowTrainingSuccessModal(true);
        } catch (err) {
            notify('error', err.message || 'Failed to add training.');
        } finally {
            setIsSubmittingTraining(false);
        }
    };

    const handleDeleteTrainingClick = async (trainingId, trainingTitle) => {
        const Swal = (await import('sweetalert2')).default;
        const result = await Swal.fire({
            title: 'Delete Training?',
            text: `"${trainingTitle}" will be permanently removed.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc2626',
        });
        if (result.isConfirmed) {
            try {
                await onDeleteTraining(trainingId);
                notify('success', 'Training deleted.');
            } catch (err) {
                notify('error', err.message || 'Failed to delete training.');
            }
        }
    };

    const handleApproveClick = (empId) => {
        setSelectedEmployerId(empId);
        setShowApproveModal(true);
    };

    const confirmApprove = () => {
        if (selectedEmployerId) {
            onVerifyEmployer(selectedEmployerId, true);
            setShowApproveModal(false);
            setSelectedEmployerId(null);
        }
    };

    const handleRejectClick = (empId) => {
        setSelectedEmployerId(empId);
        setShowRejectModal(true);
    };

    const confirmReject = () => {
        if (selectedEmployerId) {
            onVerifyEmployer(selectedEmployerId, false);
            setShowRejectModal(false);
            setSelectedEmployerId(null);
        }
    };

    const openDocument = (rawPath, emptyMessage) => {
        if (!rawPath) {
            if (typeof notify === 'function') {
                notify(emptyMessage, 'warning');
            }
            return;
        }

        const docUrl = buildBackendUrl(rawPath);
        window.open(docUrl, '_blank', 'noopener,noreferrer');
    };

    const openEmployerDocument = (employer, type = 'general') => {
        const pathByType = {
            bir: employer?.verificationDocBirPath || employer?.verification_doc_bir_path,
            sec: employer?.verificationDocSecPath || employer?.verification_doc_sec_path,
            business_permit: employer?.verificationDocBusinessPermitPath || employer?.verification_doc_business_permit_path,
            general: employer?.verificationDocPath || employer?.verification_doc_path,
        };

        openDocument(
            pathByType[type] || pathByType.general,
            'No verification document available for this employer.'
        );
    };

    const openSeekerDocument = (seeker) => {
        openDocument(
            seeker?.seekerIdDocPath || seeker?.seeker_id_doc_path,
            'No QC ID document available for this seeker.'
        );
    };

    const openSeekerReviewModal = (seeker, approved) => {
        setSeekerReviewModal({
            open: true,
            approved,
            seeker,
            reason: approved ? '' : seeker?.idVerificationReason || '',
            isSubmitting: false,
        });
    };

    const closeSeekerReviewModal = () => {
        setSeekerReviewModal({
            open: false,
            approved: true,
            seeker: null,
            reason: '',
            isSubmitting: false,
        });
    };

    const confirmSeekerReview = async () => {
        if (!seekerReviewModal.seeker || typeof onReviewSeeker !== 'function') {
            return;
        }

        if (!seekerReviewModal.approved && !seekerReviewModal.reason.trim()) {
            return;
        }

        setSeekerReviewModal((prev) => ({ ...prev, isSubmitting: true }));

        const success = await onReviewSeeker(
            seekerReviewModal.seeker.id,
            seekerReviewModal.approved,
            seekerReviewModal.reason.trim()
        );

        if (success) {
            closeSeekerReviewModal();
            return;
        }

        setSeekerReviewModal((prev) => ({ ...prev, isSubmitting: false }));
    };

    const formatDateTime = (value) => {
        if (!value) return 'Not reviewed yet';

        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return value;
        }

        return parsed.toLocaleString();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 min-h-screen bg-slate-100 relative font-sans">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <p className="section-label mb-1">Admin Portal</p>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">System Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">Review employers and seeker IDs, then track workforce performance.</p>
                </div>
                <div className="flex flex-wrap gap-2 bg-white rounded-2xl p-2 shadow-sm border">
                    {[
                        { id: 'overview', label: 'Analytics', icon: <TrendingUp size={16} /> },
                        { id: 'employers', label: 'Verify Employers', icon: <Users size={16} /> },
                        { id: 'seekers', label: 'Verify Seekers', icon: <FileCheck size={16} /> },
                        { id: 'jobfairs', label: 'Manage Job Fairs', icon: <Calendar size={16} /> },
                        { id: 'trainings', label: 'Manage Trainings', icon: <GraduationCap size={16} /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-qc-blue text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-8">
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
                            <p className="text-sm text-gray-500 mt-1">Use the employer and seeker tabs to review PESO-ready reports and workforce trends.</p>
                        </div>
                        <div className="flex flex-wrap gap-2 bg-white rounded-2xl p-2 shadow-sm border">
                            {[
                                { id: 'employer', label: 'Employer Analytics' },
                                { id: 'seeker', label: 'Seeker Analytics' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setAnalyticsTab(tab.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${analyticsTab === tab.id ? 'bg-qc-blue text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {analyticsTab === 'employer' && (
                        <div className="space-y-8">
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {[
                                    { label: 'Total Employers', value: employerSummary.totalEmployers ?? summary.totalEmployers ?? employers.length, helper: `${employerSummary.verifiedEmployers ?? summary.verifiedEmployers ?? employers.filter((employer) => employer.isVerified).length} verified accounts` },
                                    { label: 'Employer Reviews Pending', value: employerSummary.pendingEmployerReviews ?? summary.pendingEmployerReviews ?? pendingEmployers.length, helper: 'Waiting for manual document approval' },
                                    { label: 'Jobs Posted', value: employerSummary.totalJobsPosted ?? 0, helper: 'Posts created inside the selected reporting window' },
                                    { label: 'Applications Received', value: employerSummary.totalApplicationsReceived ?? 0, helper: 'Submitted during the reporting window' },
                                    { label: 'Hires in Window', value: employerSummary.hiresInWindow ?? 0, helper: 'Confirmed hires in the selected period' },
                                    { label: 'QC vs Non-QC Signals', value: `${employerSummary.jobFairParticipationSignals ?? 0}`, helper: 'Job fair company attendance signals' },
                                ].map((card) => (
                                    <div key={card.label} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                                        <div className="h-1 bg-qc-blue w-full" />
                                        <div className="p-6">
                                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">{card.label}</p>
                                            <p className="text-3xl font-extrabold text-gray-900 mt-2">{card.value}</p>
                                            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{card.helper}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid xl:grid-cols-[2fr,1fr] gap-6">
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Top 10 Active Companies</h3>
                                            <p className="text-sm text-gray-500 mt-1">Ranked by hires, with job-fair participation signals shown for context.</p>
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Last 30 days</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 border-b text-gray-600 uppercase text-xs">
                                                <tr>
                                                    <th className="px-6 py-3">Company</th>
                                                    <th className="px-6 py-3">Jobs</th>
                                                    <th className="px-6 py-3">Applications</th>
                                                    <th className="px-6 py-3">Hires</th>
                                                    <th className="px-6 py-3">Job Fair Signals</th>
                                                    <th className="px-6 py-3">Conversion</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {employerTopCompanies.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No employer analytics available yet.</td>
                                                    </tr>
                                                ) : (
                                                    employerTopCompanies.slice(0, 10).map((company, index) => (
                                                        <tr key={company.id || `${company.label}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-black text-white text-xs font-black flex items-center justify-center">#{index + 1}</div>
                                                                    <div>
                                                                        <p className="font-bold text-gray-900">{company.label}</p>
                                                                        <p className="text-xs text-gray-500">{company.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 font-semibold text-gray-900">{company.totalJobs}</td>
                                                            <td className="px-6 py-4 font-semibold text-gray-900">{company.totalApplications}</td>
                                                            <td className="px-6 py-4 font-semibold text-gray-900">{company.hiredCount}</td>
                                                            <td className="px-6 py-4 font-semibold text-gray-900">{company.jobFairSignals}</td>
                                                            <td className="px-6 py-4 font-semibold text-gray-900">{Number(company.conversionRate || 0).toFixed(1)}%</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                        <h3 className="font-bold text-gray-900">Employer Feedback</h3>
                                        <div className="mt-5 space-y-4">
                                            {ratingBreakdown.map((item) => (
                                                <div key={item.rating}>
                                                    <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
                                                        <span>{item.rating} star{item.rating > 1 ? 's' : ''}</span>
                                                        <span>{item.total}</span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-amber-400"
                                                            style={{ width: `${(item.total / maxRatingCount) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                        <h3 className="font-bold text-gray-900">Application Pipeline</h3>
                                        <div className="mt-5 space-y-3">
                                            {decisionBreakdown.map((item) => (
                                                <div key={item.status} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                                                    <span className="text-sm font-semibold text-gray-700">{item.status}</span>
                                                    <span className="text-sm font-black text-gray-900">{item.total}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {analyticsTab === 'seeker' && (
                        <div className="space-y-8">
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {[
                                    { label: 'Total Seekers', value: seekerSummary.totalSeekers ?? seekers.length, helper: 'Registered seeker accounts in the system' },
                                    { label: 'QC Residents', value: seekerSummary.qcSeekers ?? residencyBreakdown.QC ?? 0, helper: 'Strict QC category only' },
                                    { label: 'Non-QC Residents', value: seekerSummary.nonQcSeekers ?? residencyBreakdown['Non-QC'] ?? 0, helper: 'Strict Non-QC category only' },
                                    { label: 'Verified Seekers', value: seekerSummary.verifiedSeekers ?? seekers.filter((seeker) => seeker.idVerificationStatus === 'verified').length, helper: 'Manually or system verified IDs' },
                                    { label: 'Priority Verified', value: seekerSummary.priorityVerifiedSeekers ?? seekers.filter((seeker) => seeker.isPriorityVerified).length, helper: 'QC residents with approved ID — shown first to employers' },
                                    { label: 'Applications in Window', value: seekerSummary.applicationsInWindow ?? 0, helper: 'Applications created in the selected period' },
                                    { label: 'Hired Seekers', value: seekerSummary.hiredSeekers ?? 0, helper: 'Applicants marked as hired' },
                                ].map((card) => (
                                    <div key={card.label} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                                        <div className="h-1 bg-qc-blue w-full" />
                                        <div className="p-6">
                                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">{card.label}</p>
                                            <p className="text-3xl font-extrabold text-gray-900 mt-2">{card.value}</p>
                                            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{card.helper}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid xl:grid-cols-2 gap-6">
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <h3 className="font-bold text-gray-900">Gender Breakdown</h3>
                                    <div className="mt-5 space-y-4">
                                        {Object.entries(genderBreakdown).map(([label, total]) => (
                                            <div key={label}>
                                                <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
                                                    <span>{label}</span>
                                                    <span>{total}</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                                    <div className="h-full rounded-full bg-cyan-500" style={{ width: `${(total / Math.max(...Object.values(genderBreakdown).map(Number), 1)) * 100}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <h3 className="font-bold text-gray-900">Age Breakdown</h3>
                                    <div className="mt-5 space-y-4">
                                        {Object.entries(ageBreakdown).map(([label, total]) => (
                                            <div key={label}>
                                                <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
                                                    <span>{label}</span>
                                                    <span>{total}</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(total / Math.max(...Object.values(ageBreakdown).map(Number), 1)) * 100}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <h3 className="font-bold text-gray-900">QC vs Non-QC</h3>
                                    <div className="mt-5 space-y-4">
                                        {Object.entries(residencyBreakdown).map(([label, total]) => (
                                            <div key={label}>
                                                <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
                                                    <span>{label}</span>
                                                    <span>{total}</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${(total / Math.max(...Object.values(residencyBreakdown).map(Number), 1)) * 100}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <h3 className="font-bold text-gray-900">Application Stages</h3>
                                    <div className="mt-5 space-y-3">
                                        {Object.entries(applicationStageBreakdown).map(([label, total]) => (
                                            <div key={label} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                                                <span className="text-sm font-semibold text-gray-700">{label}</span>
                                                <span className="text-sm font-black text-gray-900">{total}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                                        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                                            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Hired by Residency</p>
                                            <p className="mt-2 font-bold text-gray-900">QC: {hiredByResidency.QC ?? 0}</p>
                                            <p className="font-bold text-gray-900">Non-QC: {hiredByResidency['Non-QC'] ?? 0}</p>
                                        </div>
                                        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                                            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Hired by Gender</p>
                                            <p className="mt-2 font-bold text-gray-900">Male: {hiredByGender.Male ?? 0}</p>
                                            <p className="font-bold text-gray-900">Female: {hiredByGender.Female ?? 0}</p>
                                            <p className="font-bold text-gray-900">Other: {hiredByGender['Other/Unspecified'] ?? 0}</p>
                                        </div>
                                        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 col-span-2">
                                            <p className="text-xs font-black uppercase tracking-widest text-blue-600">Hired by Priority Status</p>
                                            <div className="mt-2 flex gap-6">
                                                <p className="font-bold text-gray-900">Priority Verified: <span className="text-blue-700">{hiredByPriority['Priority Verified'] ?? 0}</span></p>
                                                <p className="font-bold text-gray-900">Not Priority: {hiredByPriority['Not Priority'] ?? 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'employers' && (
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <h2 className="font-bold text-lg text-gray-900">Employer Verification Queue</h2>
                            <p className="text-sm text-gray-500 mt-1">Review uploaded company documents before allowing job postings.</p>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                            {pendingEmployers.length} pending review
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b text-gray-600 uppercase text-xs font-black tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Company</th>
                                    <th className="px-6 py-4">Documents</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center p-12 text-gray-500 italic">No employers available for verification.</td>
                                    </tr>
                                ) : (
                                    employers.map((employer) => (
                                        <tr key={employer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900">{employer.companyName || employer.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">{employer.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {(employer.verificationDocBirPath || employer.verification_doc_bir_path || employer.verificationDocSecPath || employer.verification_doc_sec_path || employer.verificationDocBusinessPermitPath || employer.verification_doc_business_permit_path || employer.uploadedDocs) ? (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        <button onClick={() => openEmployerDocument(employer, 'bir')} className="text-blue-600 font-bold hover:bg-blue-100 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 text-[10px] uppercase tracking-wider">
                                                            BIR
                                                        </button>
                                                        <button onClick={() => openEmployerDocument(employer, 'sec')} className="text-blue-600 font-bold hover:bg-blue-100 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 text-[10px] uppercase tracking-wider">
                                                            SEC
                                                        </button>
                                                        <button onClick={() => openEmployerDocument(employer, 'business_permit')} className="text-blue-600 font-bold hover:bg-blue-100 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 text-[10px] uppercase tracking-wider">
                                                            Permit
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">No files submitted</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {(employer.employerVerificationStatus || employer.employer_verification_status || (employer.isVerified ? 'verified' : (employer.uploadedDocs ? 'under_review' : 'pending'))) === 'verified' ? (
                                                    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border border-green-200">Verified</span>
                                                ) : (employer.employerVerificationStatus || employer.employer_verification_status || (employer.uploadedDocs ? 'under_review' : 'pending')) === 'under_review' ? (
                                                    <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border border-orange-200">Reviewing</span>
                                                ) : (
                                                    <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border border-amber-200">Pending</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {(employer.uploadedDocs || employer.verificationDocBirPath || employer.verification_doc_bir_path || employer.verificationDocSecPath || employer.verification_doc_sec_path || employer.verificationDocBusinessPermitPath || employer.verification_doc_business_permit_path) ? (
                                                    <div className="flex gap-2 justify-end flex-wrap">
                                                        {!employer.isVerified && (
                                                            <button onClick={() => handleApproveClick(employer.id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all hover:shadow-md active:scale-95">Approve</button>
                                                        )}
                                                        <button onClick={() => handleRejectClick(employer.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all hover:shadow-md active:scale-95">
                                                            {employer.isVerified ? 'Revert' : 'Pending'}
                                                        </button>
                                                        {!employer.isVerified && (
                                                            <button
                                                                onClick={() => setEmployerMessageModal({ open: true, employer, text: `Hello ${employer.companyName || employer.name},\n\nWe are following up on your employer verification. Please submit the required documents (BIR Certificate, SEC Registration, and Business Permit) to complete your account verification.\n\nThank you,\nPESO QC Team`, isSending: false })}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all hover:shadow-md active:scale-95"
                                                            >
                                                                Message
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2 justify-end">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Awaiting Docs</span>
                                                        <button
                                                            onClick={() => setEmployerMessageModal({ open: true, employer, text: `Hello ${employer.companyName || employer.name},\n\nWe noticed you haven't submitted your verification documents yet. Please upload your BIR Certificate, SEC Registration, and Business Permit to complete your employer account setup.\n\nThank you,\nPESO QC Team`, isSending: false })}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:shadow-md active:scale-95"
                                                        >
                                                            Request Docs
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'seekers' && (() => {
                const qcSeekers = seekers.filter(s => s.isQcResident);
                const nonQcSeekers = seekers.filter(s => !s.isQcResident);
                const activeSeekers = seekerSubTab === 'qc' ? qcSeekers : nonQcSeekers;
                const isQcTab = seekerSubTab === 'qc';

                return (
                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                        {/* Sub-tab toggle */}
                        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                                <h2 className="font-bold text-lg text-gray-900">
                                    {isQcTab ? 'Seeker QC ID Verification Table' : 'Non-QC Identity Verification Table'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {isQcTab
                                        ? 'Review QC ID documents for Quezon City resident applicants.'
                                        : 'Review identity documents for non-QC resident applicants.'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-bold">
                                    <button
                                        onClick={() => setSeekerSubTab('qc')}
                                        className={`px-4 py-2 transition-colors ${seekerSubTab === 'qc' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        QC Residents
                                        <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-white/20 px-1.5 text-[10px]">
                                            {qcSeekers.length}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setSeekerSubTab('nonqc')}
                                        className={`px-4 py-2 transition-colors border-l border-gray-200 ${seekerSubTab === 'nonqc' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        Non-QC Residents
                                        <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-white/20 px-1.5 text-[10px]">
                                            {nonQcSeekers.length}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto font-sans">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b text-gray-600 uppercase text-[10px] font-black tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Seeker Name</th>
                                        <th className="px-6 py-4">{isQcTab ? 'QC ID Number' : "Gov't ID Number"}</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Verification File</th>
                                        <th className="px-6 py-4">Last Checked</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeSeekers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center p-16 text-gray-500 italic">
                                                {isQcTab ? 'No QC resident ID documents found.' : 'No non-QC resident ID documents found.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        activeSeekers.map((seeker) => (
                                            <tr key={seeker.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900">{seeker.name}</span>
                                                        <span className="text-[11px] text-gray-400">{seeker.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                                        {seeker.qcId || seeker.qc_id || '---'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${seekerStatusStyles[seeker.idVerificationStatus] || seekerStatusStyles.not_submitted}`}>
                                                        {seekerStatusLabels[seeker.idVerificationStatus] || 'Unknown'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => openSeekerDocument(seeker)}
                                                        className="inline-flex items-center gap-1.5 text-blue-600 font-black text-[10px] uppercase tracking-wider hover:underline hover:text-blue-700"
                                                    >
                                                        <ExternalLink size={12} />
                                                        View Doc
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-semibold text-gray-600">{formatDateTime(seeker.idVerificationCheckedAt)}</span>
                                                        {isQcTab && (
                                                            <span className="text-[9px] text-gray-400 uppercase font-black tracking-tighter mt-0.5">
                                                                Priority: {seeker.isPriorityVerified ? 'Yes' : 'No'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={() => openSeekerReviewModal(seeker, true)}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:shadow active:scale-95"
                                                        >
                                                            Verify
                                                        </button>
                                                        <button
                                                            onClick={() => openSeekerReviewModal(seeker, false)}
                                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:shadow active:scale-95"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })()}

            {activeTab === 'jobfairs' && (
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border h-fit">
                        <h2 className="font-black text-xl mb-6 flex items-center gap-3 text-gray-900 border-b pb-4"><Plus size={24} className="text-cyan-600" /> Create New Job Fair</h2>
                        <form onSubmit={handlePostFair} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Event Title</label>
                                <input required className="w-full border-gray-200 border px-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-300" placeholder="Official Job Fair Title" value={newFair.title} onChange={(e) => setNewFair({ ...newFair, title: e.target.value })} />
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Event Date</label>
                                <input 
                                    type="date" 
                                    required 
                                    className="w-full border-gray-200 border px-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all cursor-pointer" 
                                    value={newFair.date} 
                                    onChange={(e) => setNewFair({ ...newFair, date: e.target.value })} 
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Start Time</label>
                                    <input 
                                        type="time" 
                                        required 
                                        className="w-full border-gray-200 border px-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all cursor-pointer" 
                                        value={newFair.startTime} 
                                        onChange={(e) => setNewFair({ ...newFair, startTime: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">End Time</label>
                                    <input 
                                        type="time" 
                                        required 
                                        className="w-full border-gray-200 border px-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all cursor-pointer" 
                                        value={newFair.endTime} 
                                        onChange={(e) => setNewFair({ ...newFair, endTime: e.target.value })} 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Venue / Location</label>
                                <input required className="w-full border-gray-200 border px-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all" placeholder="" value={newFair.location} onChange={(e) => setNewFair({ ...newFair, location: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Organizer</label>
                                <input className="w-full border-gray-200 border px-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-300" value={newFair.organizer} onChange={(e) => setNewFair({ ...newFair, organizer: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Cover Image</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-xl hover:border-cyan-500 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <Plus className="mx-auto h-10 w-10 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label className="relative cursor-pointer bg-white rounded-md font-bold text-cyan-600 hover:text-cyan-500 focus-within:outline-none">
                                                <span>Upload a file</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="sr-only"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                                        {newFair.imageFile && <p className="text-xs text-green-600 font-bold">{newFair.imageFile.name}</p>}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Description</label>
                                <textarea required className="w-full border-gray-200 border px-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none min-h-[100px]" placeholder="Briefly describe the event..." value={newFair.description} onChange={(e) => setNewFair({ ...newFair, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Highlights (Comma separated)</label>
                                <input className="w-full border-gray-200 border px-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-300" placeholder="e.g. Free Printing, Spot Hiring" value={newFair.highlightsString} onChange={(e) => setNewFair({ ...newFair, highlightsString: e.target.value })} />
                            </div>
                            <button type="submit" className="w-full bg-black text-white font-black py-4 rounded-xl hover:bg-gray-800 transition-all shadow-lg text-sm uppercase tracking-widest">Post Job Fair Event</button>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-100 p-6 rounded-3xl border border-dashed border-gray-300">
                            <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Seeker View Preview</p>
                            <div className="bg-white rounded-3xl border shadow-xl overflow-hidden transform transition-all hover:scale-[1.01]">
                                <div className="h-48 bg-gray-200 relative">
                                    <img src={getPreviewImageUrl()} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="p-8">
                                    <div className="flex gap-2 mb-4">
                                        <span className="bg-purple-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">Mega Event</span>
                                        <span className="bg-gray-100 text-gray-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">{newFair.organizer}</span>
                                    </div>
                                    <h3 className="font-black text-2xl mb-4 text-gray-900 leading-tight">{newFair.title || 'Official Job Fair Event Title'}</h3>
                                    <div className="text-sm text-gray-600 grid grid-cols-2 gap-y-3 gap-x-4 mb-6">
                                        <div className="flex items-center gap-2 font-bold"><MapPin size={16} className="text-cyan-600" /> {newFair.location || ' '}</div>
                                        <div className="flex items-center gap-2 font-bold"><Calendar size={16} className="text-cyan-600" /> {newFair.date ? formatDate(newFair.date) : '--- --, ----'}</div>
                                        <div className="flex items-center gap-2 font-bold col-span-2">
                                            <Clock size={16} className="text-cyan-600" /> 
                                            {newFair.startTime && newFair.endTime ? `${format12Hour(newFair.startTime)} - ${format12Hour(newFair.endTime)}` : '--:-- -- - --:-- --'}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-3 mb-6 italic leading-relaxed">{newFair.description || 'Description will appear here...'}</p>
                                    <div className="mt-8 w-full bg-green-600 text-white font-black py-4 rounded-2xl text-center text-xs uppercase tracking-widest shadow-lg shadow-green-100">You're Going!</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <h3 className="font-black text-gray-900 mb-5 uppercase text-[10px] tracking-widest flex items-center justify-between">Active Job Fairs <span className="bg-gray-900 text-white px-2 py-0.5 rounded-full">{jobFairs.length}</span></h3>
                            <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                                {jobFairs.map((fair) => (
                                    <div key={fair.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center group hover:border-cyan-200 hover:bg-white transition-all">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200">
                                                <img src={fair.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm text-gray-900">{fair.title}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Calendar size={10} /> {formatDate(fair.date)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-gray-900">{fair.participants?.length || 0}</p>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Participants</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'trainings' && (
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border h-fit">
                        <h2 className="font-black text-xl mb-6 flex items-center gap-3 text-gray-900 border-b pb-4"><Plus size={24} className="text-emerald-600" /> Add New Training</h2>
                        <form onSubmit={handlePostTraining} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Training Title</label>
                                <input required className="w-full border-gray-200 border px-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-300" placeholder="e.g. Barista NC II" value={newTraining.title} onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Training Type</label>
                                <select required className="w-full border-gray-200 border px-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all" value={newTraining.type} onChange={(e) => setNewTraining({ ...newTraining, type: e.target.value })}>
                                    <option value="">Select type...</option>
                                    <option value="Blended Training">Blended Training</option>
                                    <option value="Free Training">Free Training</option>
                                    <option value="Free Assessment">Free Assessment</option>
                                    <option value="Free Training and Assessment">Free Training and Assessment</option>
                                    <option value="Free Competency Assessment">Free Competency Assessment</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Provider</label>
                                <input required className="w-full border-gray-200 border px-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all" value={newTraining.provider} onChange={(e) => setNewTraining({ ...newTraining, provider: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Start Date</label>
                                    <input type="date" required className="w-full border-gray-200 border px-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all cursor-pointer" value={newTraining.start_date} onChange={(e) => setNewTraining({ ...newTraining, start_date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">End Date</label>
                                    <input type="date" required className="w-full border-gray-200 border px-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all cursor-pointer" value={newTraining.end_date} onChange={(e) => setNewTraining({ ...newTraining, end_date: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Available Slots</label>
                                <input type="number" required min="1" className="w-full border-gray-200 border px-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all" placeholder="e.g. 30" value={newTraining.slots} onChange={(e) => setNewTraining({ ...newTraining, slots: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Description</label>
                                <textarea className="w-full border-gray-200 border px-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none min-h-[80px]" placeholder="Briefly describe the training program..." value={newTraining.description} onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })} />
                            </div>
                            <button type="submit" disabled={isSubmittingTraining} className="w-full bg-black text-white font-black py-4 rounded-xl hover:bg-gray-800 disabled:bg-gray-400 transition-all shadow-lg text-sm uppercase tracking-widest">
                                {isSubmittingTraining ? 'Adding...' : 'Add Training'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <h3 className="font-black text-gray-900 mb-5 uppercase text-[10px] tracking-widest flex items-center justify-between">
                            Current Trainings <span className="bg-gray-900 text-white px-2 py-0.5 rounded-full">{trainings.length}</span>
                        </h3>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                            {trainings.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-bold">No trainings yet.</p>
                                    <p className="text-xs mt-1">Add a training using the form on the left.</p>
                                </div>
                            ) : (
                                trainings.map((training) => (
                                    <div key={training.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-start group hover:border-emerald-200 hover:bg-white transition-all">
                                        <div className="flex-1 min-w-0 mr-3">
                                            <p className="font-black text-sm text-gray-900 truncate">{training.title}</p>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">{training.type}</span>
                                                <span className="text-[10px] font-bold text-gray-400">{training.provider}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 mt-1">{training.slots} slots available</p>
                                            {(training.start_date || training.end_date) && (
                                                <p className="text-[10px] font-bold text-gray-400 mt-0.5 flex items-center gap-1">
                                                    <Calendar size={9} /> {formatDate(training.start_date)} – {formatDate(training.end_date)}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteTrainingClick(training.id, training.title)}
                                            className="shrink-0 p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                            title="Delete training"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showApproveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="bg-green-50 p-6 flex flex-col items-center text-center border-b border-green-100">
                            <div className="p-4 bg-green-100 text-green-600 rounded-full mb-4"><CheckCircle size={40} /></div>
                            <h3 className="text-xl font-bold text-gray-900">Approve Employer?</h3>
                            <p className="text-sm text-gray-600 mt-2">This employer will be able to post jobs immediately.</p>
                        </div>
                        <div className="p-6 flex gap-3">
                            <button onClick={confirmApprove} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow">Confirm</button>
                            <button onClick={() => setShowApproveModal(false)} className="flex-1 bg-white text-gray-600 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors border">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
                            <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4"><XCircle size={40} /></div>
                            <h3 className="text-xl font-bold text-gray-900">Return Employer To Pending?</h3>
                            <p className="text-sm text-gray-600 mt-2">This keeps the account editable so documents can be updated.</p>
                        </div>
                        <div className="p-6 flex gap-3">
                            <button onClick={confirmReject} className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors shadow">Set Pending</button>
                            <button onClick={() => setShowRejectModal(false)} className="flex-1 bg-white text-gray-600 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors border">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {seekerReviewModal.open && (() => {
                const isQcResident = seekerReviewModal.seeker?.isQcResident;
                const { approved } = seekerReviewModal;
                const modalTitle = approved
                    ? (isQcResident ? 'Verify seeker QC ID?' : 'Verify seeker identity?')
                    : (isQcResident ? 'Unverify seeker QC ID?' : 'Unverify seeker identity?');
                const modalBody = approved
                    ? (isQcResident
                        ? `${seekerReviewModal.seeker?.name} will gain priority verification status.`
                        : `${seekerReviewModal.seeker?.name}'s identity document will be marked as verified.`)
                    : (isQcResident
                        ? `${seekerReviewModal.seeker?.name} will lose priority verification status.`
                        : `${seekerReviewModal.seeker?.name}'s identity verification will be revoked.`);
                const rejectPlaceholder = isQcResident
                    ? 'Explain why the QC ID cannot be verified. This will be shown to the seeker.'
                    : 'Explain why the identity document cannot be verified. This will be shown to the seeker.';

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                            <div className={`p-6 border-b ${approved ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`p-4 rounded-full ${approved ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {approved ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{modalTitle}</h3>
                                        <p className="text-sm text-gray-600 mt-2">{modalBody}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                {!approved && (
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-wide text-gray-500">Reason for unverifying</label>
                                        <textarea value={seekerReviewModal.reason} onChange={(e) => setSeekerReviewModal((prev) => ({ ...prev, reason: e.target.value }))} rows={4} className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none focus:ring-2 focus:ring-red-400" placeholder={rejectPlaceholder} />
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button onClick={confirmSeekerReview} disabled={seekerReviewModal.isSubmitting || (!approved && !seekerReviewModal.reason.trim())} className={`flex-1 py-3 rounded-xl text-white font-bold transition-colors ${approved ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-300' : 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'}`}>{seekerReviewModal.isSubmitting ? 'Saving...' : approved ? 'Confirm Verification' : 'Confirm Unverify'}</button>
                                    <button onClick={closeSeekerReviewModal} className="flex-1 py-3 rounded-xl bg-white border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {employerMessageModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b bg-blue-50 border-blue-100">
                            <div className="flex items-start gap-4">
                                <div className="p-4 rounded-full bg-blue-100 text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Message Employer</h3>
                                    <p className="text-sm text-gray-600 mt-1">Sending to: <span className="font-bold">{employerMessageModal.employer?.companyName || employerMessageModal.employer?.name}</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase tracking-wide text-gray-500">Message</label>
                                <textarea
                                    value={employerMessageModal.text}
                                    onChange={(e) => setEmployerMessageModal(prev => ({ ...prev, text: e.target.value }))}
                                    rows={6}
                                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={async () => {
                                        if (!employerMessageModal.text.trim()) return;
                                        setEmployerMessageModal(prev => ({ ...prev, isSending: true }));
                                        try {
                                            await onMessageEmployer(employerMessageModal.employer.id, employerMessageModal.text.trim());
                                            notify('Message sent to employer.', 'success');
                                            setEmployerMessageModal({ open: false, employer: null, text: '', isSending: false });
                                        } catch (err) {
                                            notify(err?.message || 'Failed to send message.', 'error');
                                            setEmployerMessageModal(prev => ({ ...prev, isSending: false }));
                                        }
                                    }}
                                    disabled={employerMessageModal.isSending || !employerMessageModal.text.trim()}
                                    className="flex-1 py-3 rounded-xl text-white font-bold transition-colors bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                                >
                                    {employerMessageModal.isSending ? 'Sending...' : 'Send Message'}
                                </button>
                                <button
                                    onClick={() => setEmployerMessageModal({ open: false, employer: null, text: '', isSending: false })}
                                    className="flex-1 py-3 rounded-xl bg-white border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showFairSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-green-50 p-6 flex flex-col items-center text-center border-b border-green-100">
                            <div className="p-4 bg-green-100 text-green-600 rounded-full mb-4"><CheckCircle size={40} /></div>
                            <h3 className="text-xl font-bold text-gray-900">Job Fair Posted!</h3>
                            <p className="text-sm text-gray-600 mt-2">The event is now visible to job seekers.</p>
                        </div>
                        <div className="p-6">
                            <button onClick={() => setShowFairSuccessModal(false)} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showTrainingSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-emerald-50 p-6 flex flex-col items-center text-center border-b border-emerald-100">
                            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full mb-4"><GraduationCap size={40} /></div>
                            <h3 className="text-xl font-bold text-gray-900">Training Added!</h3>
                            <p className="text-sm text-gray-600 mt-2">The training is now visible to job seekers.</p>
                        </div>
                        <div className="p-6">
                            <button onClick={() => setShowTrainingSuccessModal(false)} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;