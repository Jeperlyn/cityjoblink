// src/pages/AdminDashboard.jsx
import React, { useMemo, useState } from 'react';
import { File, Calendar, Plus, Users, MapPin, Clock, CheckCircle, XCircle, AlertTriangle, Star, TrendingUp, FileCheck } from 'lucide-react';
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

const AdminDashboard = ({
    employers = [],
    seekers = [],
    analytics,
    onVerifyEmployer,
    onReviewSeeker,
    jobFairs = [],
    onAddJobFair,
    notify,
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

    const [newFair, setNewFair] = useState({
        title: '',
        location: '',
        date: '',
        time: '',
        organizer: 'PESO QC & DOLE',
        description: '',
        imageFile: null,
        highlightsString: '',
    });

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

        onAddJobFair({
            ...newFair,
            highlights,
        });

        setNewFair({
            title: '',
            location: '',
            date: '',
            time: '',
            organizer: 'PESO QC & DOLE',
            description: '',
            imageFile: null,
            highlightsString: '',
        });
        setShowFairSuccessModal(true);
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
        <div className="max-w-7xl mx-auto p-6 min-h-screen bg-gray-50 relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
                    <p className="text-sm text-gray-500 mt-1">Review employers and seeker IDs, then track which employers are performing best.</p>
                </div>
                <div className="flex flex-wrap gap-2 bg-white rounded-2xl p-2 shadow-sm border">
                    {[
                        { id: 'overview', label: 'Analytics', icon: <TrendingUp size={16} /> },
                        { id: 'employers', label: 'Verify Employers', icon: <Users size={16} /> },
                        { id: 'seekers', label: 'Verify Seekers', icon: <FileCheck size={16} /> },
                        { id: 'jobfairs', label: 'Manage Job Fairs', icon: <Calendar size={16} /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === tab.id ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
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
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${analyticsTab === tab.id ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
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
                                    <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-500">{card.label}</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-3">{card.value}</p>
                                        <p className="text-sm text-gray-500 mt-2">{card.helper}</p>
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
                                    { label: 'Applications in Window', value: seekerSummary.applicationsInWindow ?? 0, helper: 'Applications created in the selected period' },
                                    { label: 'Hired Seekers', value: seekerSummary.hiredSeekers ?? 0, helper: 'Applicants marked as hired' },
                                ].map((card) => (
                                    <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-500">{card.label}</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-3">{card.value}</p>
                                        <p className="text-sm text-gray-500 mt-2">{card.helper}</p>
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
                            <thead className="bg-gray-50 border-b text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Company</th>
                                    <th className="px-6 py-3">Documents</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center p-10 text-gray-500">No employers available for verification.</td>
                                    </tr>
                                ) : (
                                    employers.map((employer) => (
                                        <tr key={employer.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900">{employer.companyName || employer.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">{employer.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {(employer.verificationDocBirPath || employer.verification_doc_bir_path || employer.verificationDocSecPath || employer.verification_doc_sec_path || employer.verificationDocBusinessPermitPath || employer.verification_doc_business_permit_path || employer.uploadedDocs) ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        <button onClick={() => openEmployerDocument(employer, 'bir')} className="text-blue-600 font-bold hover:underline bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 text-xs">
                                                            BIR
                                                        </button>
                                                        <button onClick={() => openEmployerDocument(employer, 'sec')} className="text-blue-600 font-bold hover:underline bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 text-xs">
                                                            SEC
                                                        </button>
                                                        <button onClick={() => openEmployerDocument(employer, 'business_permit')} className="text-blue-600 font-bold hover:underline bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 text-xs">
                                                            Permit
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">No file submitted</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {(employer.employerVerificationStatus || employer.employer_verification_status || (employer.isVerified ? 'verified' : (employer.uploadedDocs ? 'under_review' : 'pending'))) === 'verified' ? (
                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold border border-green-200">Verified</span>
                                                ) : (employer.employerVerificationStatus || employer.employer_verification_status || (employer.uploadedDocs ? 'under_review' : 'pending')) === 'under_review' ? (
                                                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold border border-orange-200">Pending Review</span>
                                                ) : (
                                                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold border border-amber-200">Pending Docs</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {(employer.uploadedDocs || employer.verificationDocBirPath || employer.verification_doc_bir_path || employer.verificationDocSecPath || employer.verification_doc_sec_path || employer.verificationDocBusinessPermitPath || employer.verification_doc_business_permit_path) ? (
                                                    <div className="flex gap-2">
                                                        {!employer.isVerified && (
                                                            <button onClick={() => handleApproveClick(employer.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors">Approve</button>
                                                        )}
                                                        <button onClick={() => handleRejectClick(employer.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors">
                                                            {employer.isVerified ? 'Revert to Pending' : 'Keep Pending'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Waiting for upload</span>
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

            {activeTab === 'seekers' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <h2 className="font-bold text-lg text-gray-900">Seeker QC ID Review</h2>
                            <p className="text-sm text-gray-500 mt-1">Manually verify or unverify each uploaded ID. Unverifying requires a clear admin reason.</p>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                            {seekers.length} seeker document{seekers.length === 1 ? '' : 's'}
                        </span>
                    </div>

                    {seekers.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
                            No seeker ID documents are waiting for admin review.
                        </div>
                    ) : (
                        <div className="grid xl:grid-cols-2 gap-5">
                            {seekers.map((seeker) => (
                                <div key={seeker.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <div className="flex items-start justify-between gap-4 mb-5">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{seeker.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{seeker.email}</p>
                                            <p className="text-xs text-gray-500 mt-2">QC ID: <span className="font-semibold text-gray-700">{seeker.qcId || seeker.qc_id || 'Not provided'}</span></p>
                                        </div>
                                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${seekerStatusStyles[seeker.idVerificationStatus] || seekerStatusStyles.not_submitted}`}>
                                            {seekerStatusLabels[seeker.idVerificationStatus] || 'Unknown'}
                                        </span>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4 mb-5">
                                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                            <p className="text-xs font-black uppercase tracking-wide text-gray-500">Document</p>
                                            <p className="text-sm font-semibold text-gray-900 mt-2 break-all">{seeker.seekerIdDocOriginalName || seeker.seekerIdDocStoredName || 'Stored file'}</p>
                                            <button onClick={() => openSeekerDocument(seeker)} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors">
                                                <File size={14} />
                                                Open QC ID
                                            </button>
                                        </div>
                                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                            <p className="text-xs font-black uppercase tracking-wide text-gray-500">Last Checked</p>
                                            <p className="text-sm font-semibold text-gray-900 mt-2">{formatDateTime(seeker.idVerificationCheckedAt)}</p>
                                            <p className="text-xs text-gray-500 mt-3">Priority verified: <span className="font-semibold text-gray-700">{seeker.isPriorityVerified ? 'Yes' : 'No'}</span></p>
                                        </div>
                                    </div>

                                    {seeker.idVerificationReason && (
                                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-medium mb-5">
                                            Latest admin reason: {seeker.idVerificationReason}
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button onClick={() => openSeekerReviewModal(seeker, true)} className="flex-1 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 transition-colors">
                                            Verify QC ID
                                        </button>
                                        <button onClick={() => openSeekerReviewModal(seeker, false)} className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 transition-colors">
                                            Unverify With Reason
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'jobfairs' && (
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border h-fit">
                        <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><Plus size={20} /> Create New Job Fair</h2>
                        <form onSubmit={handlePostFair} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Event Title</label>
                                <input required className="w-full border p-2 rounded bg-gray-50" placeholder="e.g. QC Mega Job Fair" value={newFair.title} onChange={(e) => setNewFair({ ...newFair, title: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                                    <input required className="w-full border p-2 rounded bg-gray-50" placeholder="e.g. Dec 05, 2025" value={newFair.date} onChange={(e) => setNewFair({ ...newFair, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Time</label>
                                    <input required className="w-full border p-2 rounded bg-gray-50" placeholder="e.g. 8:00 AM - 5:00 PM" value={newFair.time} onChange={(e) => setNewFair({ ...newFair, time: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Venue / Location</label>
                                <input required className="w-full border p-2 rounded bg-gray-50" placeholder="e.g. QC Hall Quadrangle" value={newFair.location} onChange={(e) => setNewFair({ ...newFair, location: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Organizer</label>
                                <input className="w-full border p-2 rounded bg-gray-50" value={newFair.organizer} onChange={(e) => setNewFair({ ...newFair, organizer: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Cover Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full border p-2 rounded bg-gray-50 text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                                    onChange={handleImageChange}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                <textarea required className="w-full border p-2 rounded bg-gray-50 h-24" placeholder="Event details..." value={newFair.description} onChange={(e) => setNewFair({ ...newFair, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Highlights (Comma separated)</label>
                                <input className="w-full border p-2 rounded bg-gray-50" placeholder="e.g. Free Printing, Career Coaching, Spot Hiring" value={newFair.highlightsString} onChange={(e) => setNewFair({ ...newFair, highlightsString: e.target.value })} />
                            </div>
                            <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors">Post Job Fair Event</button>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-100 p-4 rounded-2xl border border-dashed border-gray-300">
                            <p className="text-center text-xs font-bold text-gray-400 uppercase mb-4">Seeker View Preview</p>
                            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                                <div className="h-40 bg-gray-200 relative">
                                    <img src={getPreviewImageUrl()} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="p-6">
                                    <div className="flex gap-2 mb-2">
                                        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded uppercase">Mega Event</span>
                                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded uppercase">{newFair.organizer}</span>
                                    </div>
                                    <h3 className="font-bold text-xl mb-2">{newFair.title || 'Event Title'}</h3>
                                    <div className="text-sm text-gray-600 space-y-1 mb-4">
                                        <div className="flex items-center gap-2"><MapPin size={14} className="text-cyan-600" /> {newFair.location || 'Location'}</div>
                                        <div className="flex items-center gap-2"><Calendar size={14} className="text-cyan-600" /> {newFair.date || 'Date'}</div>
                                        <div className="flex items-center gap-2"><Clock size={14} className="text-cyan-600" /> {newFair.time || 'Time'}</div>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-3 mb-4">{newFair.description || 'Event description will appear here...'}</p>
                                    {newFair.highlightsString && (
                                        <div className="flex flex-wrap gap-2">
                                            {newFair.highlightsString.split(',').map((highlight, index) => (
                                                highlight.trim() ? <span key={index} className="text-[10px] bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-full font-medium flex items-center gap-1"><CheckCircle size={10} /> {highlight}</span> : null
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-4 w-full bg-green-100 text-green-700 font-bold py-2 rounded text-center text-sm">You're Going!</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-700 mb-3">Active Job Fairs ({jobFairs.length})</h3>
                            <div className="space-y-3">
                                {jobFairs.map((fair) => (
                                    <div key={fair.id} className="bg-white p-3 rounded-xl border flex justify-between items-center">
                                        <div className="flex gap-3 items-center">
                                            <img src={fair.image} alt="" className="w-10 h-10 rounded object-cover bg-gray-200" />
                                            <div>
                                                <p className="font-bold text-sm">{fair.title}</p>
                                                <p className="text-xs text-gray-500">{fair.date}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold">{fair.participants?.length || 0} Registered</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showApproveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
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

            {seekerReviewModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                        <div className={`p-6 border-b ${seekerReviewModal.approved ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-4 rounded-full ${seekerReviewModal.approved ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {seekerReviewModal.approved ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {seekerReviewModal.approved ? 'Verify seeker QC ID?' : 'Unverify seeker QC ID?'}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {seekerReviewModal.seeker?.name} will {seekerReviewModal.approved ? 'gain' : 'lose'} priority verification status.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {!seekerReviewModal.approved && (
                                <div>
                                    <label className="text-xs font-black uppercase tracking-wide text-gray-500">Reason for unverifying</label>
                                    <textarea
                                        value={seekerReviewModal.reason}
                                        onChange={(e) => setSeekerReviewModal((prev) => ({ ...prev, reason: e.target.value }))}
                                        rows={4}
                                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none focus:ring-2 focus:ring-red-400"
                                        placeholder="Explain why the QC ID cannot be verified. This will be shown to the seeker."
                                    />
                                    {!seekerReviewModal.reason.trim() && (
                                        <p className="text-xs text-red-600 font-semibold mt-2">A reason is required to unverify a seeker.</p>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={confirmSeekerReview}
                                    disabled={seekerReviewModal.isSubmitting || (!seekerReviewModal.approved && !seekerReviewModal.reason.trim())}
                                    className={`flex-1 py-3 rounded-xl text-white font-bold transition-colors ${seekerReviewModal.approved ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-300' : 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'}`}
                                >
                                    {seekerReviewModal.isSubmitting ? 'Saving...' : seekerReviewModal.approved ? 'Confirm Verification' : 'Confirm Unverify'}
                                </button>
                                <button onClick={closeSeekerReviewModal} className="flex-1 py-3 rounded-xl bg-white border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors">
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
        </div>
    );
};

export default AdminDashboard;

