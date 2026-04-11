import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, Send, MessageCircle, User, AlertCircle, FileText, X, LogIn, AlertTriangle, CheckCircle } from 'lucide-react'; 
import emailjs from '@emailjs/browser'; 

// Toast Notification Component
const Toast = ({ messages }) => (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 space-y-3 z-50 pointer-events-none">
        {messages.map((msg) => (
            <div
                key={msg.id}
                className={`px-8 py-4 rounded-full font-semibold text-white shadow-lg animate-in slide-in-from-top-4 fade-in pointer-events-auto ${
                    msg.type === 'success'
                        ? 'bg-green-500'
                        : msg.type === 'error'
                        ? 'bg-red-500'
                        : msg.type === 'warning'
                        ? 'bg-orange-500'
                        : 'bg-blue-500'
                }`}
            >
                <div className="flex items-center gap-3 whitespace-nowrap">
                    {msg.type === 'success' && <CheckCircle size={18} />}
                    {msg.type === 'error' && <AlertTriangle size={18} />}
                    {msg.text}
                </div>
            </div>
        ))}
    </div>
); 

// Import Components
import Navbar from './components/Navbar';
import InstitutionalFooter from './components/InstitutionalFooter';
import LandingPage, { PublicListings } from './pages/LandingPage';
import LoginScreen from './pages/Login'; 
import SeekerDashboard, { FindJobs, JobDetailsPage, DashboardOverview } from './pages/SeekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ResumeBuilderMain from './pages/ResumeBuilder/ResumeBuilderMain.jsx';
import { API_BASE } from './lib/apiBase';

// Import Data
import { 
    ADMIN_ACCOUNT, INITIAL_JOBS, INITIAL_TRAININGS, INITIAL_JOB_FAIRS, 
    INITIAL_APPLICATIONS, INITIAL_MESSAGES, INITIAL_NOTIFICATIONS, 
    calculateMatchScore, INITIAL_USERS 
} from './data/mockData';

// ==========================================
// 🛠️ HELPERS & SUB-COMPONENTS (Do Not Remove)
// ==========================================
const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    if (typeof timestamp !== 'number') return timestamp; 
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const normalizeUserProfile = (rawUser) => {
    if (!rawUser) return rawUser;
    return {
        ...rawUser,
        companyName: rawUser.companyName || rawUser.company_name || null,
        qcId: rawUser.qcId || rawUser.qc_id || '',
        isQcResident: typeof rawUser.isQcResident === 'boolean' ? rawUser.isQcResident : true,
        birthdayDisplay: rawUser.birthdayDisplay || rawUser.birthday_display || null,
        isVerified: typeof rawUser.isVerified === 'boolean' ? rawUser.isVerified : !!rawUser.is_verified,
        employerVerificationStatus: rawUser.employerVerificationStatus || rawUser.employer_verification_status || null,
        uploadedDocs: typeof rawUser.uploadedDocs === 'boolean' ? rawUser.uploadedDocs : !!rawUser.uploaded_docs,
        verificationDocPath: rawUser.verificationDocPath || rawUser.verification_doc_path || null,
        verificationDocBirPath: rawUser.verificationDocBirPath || rawUser.verification_doc_bir_path || null,
        verificationDocSecPath: rawUser.verificationDocSecPath || rawUser.verification_doc_sec_path || null,
        verificationDocBusinessPermitPath: rawUser.verificationDocBusinessPermitPath || rawUser.verification_doc_business_permit_path || null,
        seekerIdDocPath: rawUser.seekerIdDocPath || rawUser.seeker_id_doc_path || null,
        seekerIdDocOriginalName: rawUser.seekerIdDocOriginalName || rawUser.seeker_id_doc_original_name || null,
        seekerIdDocStoredName: rawUser.seekerIdDocStoredName || rawUser.seeker_id_doc_stored_name || null,
        portfolioUrl: rawUser.portfolioUrl || rawUser.portfolio_url || null,
        linkedinUrl: rawUser.linkedinUrl || rawUser.linkedin_url || null,
        githubUrl: rawUser.githubUrl || rawUser.github_url || null,
        facebookUrl: rawUser.facebookUrl || rawUser.facebook_url || null,
        instagramUrl: rawUser.instagramUrl || rawUser.instagram_url || null,
        idVerificationStatus: rawUser.idVerificationStatus || rawUser.id_verification_status || 'not_submitted',
        idVerificationReason: rawUser.idVerificationReason || rawUser.id_verification_reason || null,
        idVerificationConfidence: rawUser.idVerificationConfidence ?? rawUser.id_verification_confidence ?? null,
        idVerificationCheckedAt: rawUser.idVerificationCheckedAt || rawUser.id_verification_checked_at || null,
        idExtractedName: rawUser.idExtractedName || rawUser.id_extracted_name || null,
        idExtractedBirthdate: rawUser.idExtractedBirthdate || rawUser.id_extracted_birthdate || null,
        idExtractedGender: rawUser.idExtractedGender || rawUser.id_extracted_gender || null,
        idBirthdateMatchesProfile: rawUser.idBirthdateMatchesProfile ?? rawUser.id_birthdate_matches_profile ?? null,
        idGenderMatchesProfile: rawUser.idGenderMatchesProfile ?? rawUser.id_gender_matches_profile ?? null,
        isPriorityVerified: typeof rawUser.isPriorityVerified === 'boolean'
            ? rawUser.isPriorityVerified
            : !!rawUser.is_priority_verified,
    };
};

const parseJsonArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim()) {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
};

const mapBackendJob = (job) => {
    const min = job.salary_min;
    const max = job.salary_max;
    const salary = min != null && max != null
        ? `₱${min.toLocaleString()} - ₱${max.toLocaleString()}`
        : (min != null ? `₱${min.toLocaleString()}` : 'Negotiable');

    return {
        id: job.id,
        employerId: job.employer_id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.employment_type,
        industry: job.industry,
        companyWebsite: job.companyWebsite || job.company_website || job.employer_company_website || null,
        employerWebsite: job.employerWebsite || job.employer_website || job.employer_company_website || null,
        linkedinUrl: job.linkedinUrl || job.linkedin_url || null,
        githubUrl: job.githubUrl || job.github_url || null,
        facebookUrl: job.facebookUrl || job.facebook_url || null,
        instagramUrl: job.instagramUrl || job.instagram_url || null,
        twitterUrl: job.twitterUrl || job.twitter_url || job.xUrl || job.x_url || null,
        description: job.description || '',
        salary,
        salaryMin: min,
        salaryMax: max,
        status: job.status,
        requiredSkills: parseJsonArray(job.required_skills),
        educationalAttainmentRequired: job.educational_attainment_required || '',
    };
};

const mapBackendApplication = (app, seekerId) => ({
    id: app.id,
    jobId: app.job_id,
    seekerId,
    status: app.status === 'Rejected' ? 'Declined' : (app.status === 'Cancelled' || app.status === 'Withdrawn' ? 'Declined' : app.status),
    jobStatus: app.job_status || null,
    jobTitle: app.job_title || '',
    company: app.company || '',
    location: app.location || '',
    type: app.employment_type || '',
    date: app.applied_at || app.created_at || '',
    rejectionReason: app.rejection_reason || '',
    declineReasonCode: app.decline_reason_code || '',
    declineReasonText: app.decline_reason_text || '',
    declinedAt: app.declined_at || null,
    feedbackRating: Number(app.feedback_rating ?? 0),
    feedbackComment: app.feedback_comment || '',
    feedbackSubmittedAt: app.feedback_submitted_at || null,
});

const mapBackendEmployerApplication = (app) => ({
    id: app.id,
    jobId: app.job_id,
    seekerId: app.seeker_id,
    seekerName: app.seeker_name || '',
    seekerEmail: app.seeker_email || '',
    status: app.status === 'Rejected' ? 'Declined' : (app.status === 'Cancelled' || app.status === 'Withdrawn' ? 'Declined' : app.status),
    date: app.applied_at || app.created_at || '',
    rejectionReason: app.rejection_reason || '',
    declineReasonCode: app.decline_reason_code || '',
    declineReasonText: app.decline_reason_text || '',
    declinedAt: app.declined_at || null,
    fitScore: app.fit_score ?? 0,
    matchedSkills: app.matched_skills || [],
    missingSkills: app.missing_skills || [],
    educationMatch: app.education_match,
    matchReasons: app.match_reasons || '',
});

const mapBackendRecommendation = (item) => ({
    job: mapBackendJob(item),
    matchScore: Number(item.match_score ?? 0),
    matchReasons: item.match_reasons || '',
});

const MessagesPanel = ({ messages, user, users, onBack, onSendMessage, onRead, initialChatId }) => {
    const [activeChatId, setActiveChatId] = useState(initialChatId || null);
    const [replyText, setReplyText] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => { if (initialChatId) onRead(initialChatId); }, [initialChatId, onRead]);

    const contacts = Array.from(new Set(
        messages.filter(m => m.fromId === user.id || m.toId === user.id)
                .map(m => m.fromId === user.id ? m.toId : m.fromId)
    )).filter(contactId => contactId !== user.id) 
      .map(contactId => {
        const contactUser = users.find(u => u.id === contactId);
        const relatedMessage = messages.find((m) => m.fromId === contactId || m.toId === contactId);
        const inferredName = relatedMessage
            ? (relatedMessage.fromId === contactId
                ? (relatedMessage.fromName || relatedMessage.fromCompanyName)
                : (relatedMessage.toName || relatedMessage.toCompanyName))
            : null;

        return {
            id: contactId,
            name: contactUser ? (contactUser.name || contactUser.companyName) : (inferredName || `User #${contactId}`),
            hasUnread: messages.some(m => m.fromId === contactId && m.toId === user.id && !m.read),
        };
    });

    const activeMessages = useMemo(() => {
        return activeChatId ? messages.filter(m => (m.fromId === user.id && m.toId === activeChatId) || (m.fromId === activeChatId && m.toId === user.id)).sort((a,b) => a.id - b.id) : [];
    }, [messages, activeChatId, user.id]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeMessages]);

    return (
        <div className="max-w-6xl mx-auto p-4 h-[85vh] flex flex-col">
            <button onClick={onBack} className="flex items-center gap-2 mb-4 hover:text-cyan-600 font-bold"><ChevronLeft/> Back</button>
            <div className="flex-1 bg-white rounded-xl shadow-lg border overflow-hidden flex">
                <div className={`w-full md:w-1/3 border-r bg-gray-50 flex flex-col ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b bg-white font-bold text-lg">Chats</div>
                    <div className="flex-1 overflow-y-auto">
                        {contacts.map(c => (
                            <div key={c.id} onClick={() => { setActiveChatId(c.id); onRead(c.id); }} className={`p-4 border-b cursor-pointer hover:bg-white ${activeChatId === c.id ? 'bg-white border-l-4 border-l-cyan-500' : ''}`}>
                                <p className={`text-sm ${c.hasUnread ? 'font-bold' : ''}`}>{c.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`w-full md:w-2/3 flex flex-col ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
                    {activeChatId ? (
                        <>
                            <div className="p-4 border-b bg-white font-bold">{contacts.find(c => c.id === activeChatId)?.name}</div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {activeMessages.map(m => (
                                    <div key={m.id} className={`flex ${m.fromId === user.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-xl text-sm ${m.fromId === user.id ? 'bg-cyan-600 text-white' : 'bg-white border'}`}>{m.content}</div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); if(replyText.trim()) { onSendMessage(activeChatId, replyText); setReplyText(""); } }} className="p-3 bg-white border-t flex gap-2">
                                <input className="flex-1 border rounded-full px-4 py-2 outline-none" placeholder="Message..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                                <button type="submit" className="bg-cyan-600 text-white p-2 rounded-full"><Send size={18}/></button>
                            </form>
                        </>
                    ) : <div className="flex-1 flex items-center justify-center text-gray-400">Select a chat</div>}
                </div>
            </div>
        </div>
    );
};

const NotificationsPanel = ({ notifications, user, onBack }) => (
    <div className="max-w-4xl mx-auto p-6">
        <button onClick={onBack} className="flex items-center gap-2 mb-4 font-bold"><ChevronLeft/> Back</button>
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        {notifications.filter(n=>n.toId===user.id).map(n=>(
            <div key={n.id} className={`p-4 border-b ${n.read ? 'bg-white' : 'bg-blue-50 font-bold'}`}>
                <p>{n.content} <span className="text-xs text-gray-400 block mt-1">{formatTimeAgo(n.date)}</span></p>
            </div>
        ))}
    </div>
);

// ==========================================
// 🚀 MAIN APP COMPONENT
// ==========================================
const App = () => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? normalizeUserProfile(JSON.parse(stored)) : null;
    });
    const [resumeFileData, setResumeFileData] = useState(null);

    const [currentView, setCurrentView] = useState(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            const u = JSON.parse(stored);
            if (u.role === 'Admin') return 'admin-dash';
            if (u.role === 'Employer') return 'employer-dash';
            return 'seeker-dash';
        }
        return 'home';
    });

    const [previousView, setPreviousView] = useState('home'); 
    const [loginError, setLoginError] = useState('');
    const [seekerActiveTab, setSeekerActiveTab] = useState('overview'); 

    const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('cjl_users')) || INITIAL_USERS);
    const [jobs, setJobs] = useState(() => JSON.parse(localStorage.getItem('cjl_jobs')) || INITIAL_JOBS);
    const [applications, setApplications] = useState(() => JSON.parse(localStorage.getItem('cjl_applications')) || INITIAL_APPLICATIONS);
    const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem('cjl_messages')) || INITIAL_MESSAGES);
    const [trainings, setTrainings] = useState(INITIAL_TRAININGS);
    const [jobFairs, setJobFairs] = useState(() => JSON.parse(localStorage.getItem('cjl_jobfairs')) || INITIAL_JOB_FAIRS); 
    const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('cjl_notifications')) || INITIAL_NOTIFICATIONS);
    const [seekerRecommendations, setSeekerRecommendations] = useState([]);
    
    // Saved Jobs State
    const [savedJobs, setSavedJobs] = useState(() => JSON.parse(localStorage.getItem('cjl_saved_jobs')) || []);
    
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedJobMatchData, setSelectedJobMatchData] = useState(null);
    const [targetChatId, setTargetChatId] = useState(null);
    const [toastMessages, setToastMessages] = useState([]);
    const [adminEmployers, setAdminEmployers] = useState([]);
    const [adminSeekers, setAdminSeekers] = useState([]);
    const [adminAnalytics, setAdminAnalytics] = useState({
        summary: {},
        ratingBreakdown: [],
        decisionBreakdown: [],
        topEmployers: [],
        employerAnalytics: { summary: {}, topCompanies: [] },
        seekerAnalytics: {
            summary: {},
            ageBreakdown: {},
            genderBreakdown: {},
            residencyBreakdown: {},
            applicationStageBreakdown: {},
            hiredByResidency: {},
            hiredByGender: {},
        },
    });
    const [employerSeekers, setEmployerSeekers] = useState([]);

    const handleViewJobDetails = (job, fromView = '') => {
        if (!job) return;
        setSelectedJob(job);
        setSelectedJobMatchData(null);
        setPreviousView(fromView);
        setCurrentView('job-details');
    };

    const showToast = (text, type = 'success') => {
        const id = Date.now();
        setToastMessages(prev => [...prev, { id, text, type }]);
        setTimeout(() => {
            setToastMessages(prev => prev.filter(msg => msg.id !== id));
        }, 3000); 
    };

    useEffect(() => { localStorage.setItem('cjl_users', JSON.stringify(users)); }, [users]);
    useEffect(() => { localStorage.setItem('cjl_jobs', JSON.stringify(jobs)); }, [jobs]);
    useEffect(() => { localStorage.setItem('cjl_applications', JSON.stringify(applications)); }, [applications]);
    useEffect(() => { localStorage.setItem('cjl_notifications', JSON.stringify(notifications)); }, [notifications]);
    useEffect(() => { localStorage.setItem('cjl_messages', JSON.stringify(messages)); }, [messages]);
    useEffect(() => { localStorage.setItem('cjl_jobfairs', JSON.stringify(jobFairs)); }, [jobFairs]);
    useEffect(() => { localStorage.setItem('cjl_saved_jobs', JSON.stringify(savedJobs)); }, [savedJobs]);

    const fetchSeekerProfile = async (email) => {
        const response = await fetch(`${API_BASE}/seeker/profile?email=${encodeURIComponent(email)}`, {
            headers: { Accept: 'application/json' },
        });
        const data = await response.json();
        if (!response.ok || data.status !== 'success') throw new Error(data?.message || 'Failed loading profile');

        return normalizeUserProfile({
            ...data.user,
            birthday_display: data.birthday_display,
        });
    };

    // Fetch Saved Jobs API Call
    const fetchSavedJobs = async (email) => {
        try {
            const response = await fetch(`${API_BASE}/seeker/saved-jobs?email=${encodeURIComponent(email)}`, {
                headers: { Accept: 'application/json' },
            });
            const data = await response.json();
            if (data.status === 'success') {
                return data.saved_jobs || [];
            }
            return [];
        } catch (error) {
            // Fails silently and relies on localStorage fallback
            return JSON.parse(localStorage.getItem('cjl_saved_jobs')) || [];
        }
    };

    // ✅ FEATURE FIX: Added includeClosed parameter so employers can see closed jobs after updating them
    const fetchJobs = async (includeClosed = false) => {
        const url = includeClosed ? `${API_BASE}/jobs?include_closed=1` : `${API_BASE}/jobs`;
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        const data = await response.json();
        if (!response.ok || data.status !== 'success') throw new Error(data?.message || 'Failed loading jobs');
        return (data.jobs || []).map(mapBackendJob);
    };

    const fetchAdminEmployers = async () => {
        const response = await fetch(`${API_BASE}/admin/employers`, { headers: { Accept: 'application/json' } });
        const data = await response.json();
        if (!response.ok || data.status !== 'success') throw new Error(data?.message || 'Failed loading employers');

        return (data.employers || []).map((employer) => normalizeUserProfile(employer));
    };

    const fetchAdminSeekers = async () => {
        const response = await fetch(`${API_BASE}/admin/seekers`, { headers: { Accept: 'application/json' } });
        const data = await response.json();
        if (!response.ok || data.status !== 'success') throw new Error(data?.message || 'Failed loading seekers');

        return (data.seekers || []).map((seeker) => normalizeUserProfile(seeker));
    };

    const fetchAdminAnalytics = async () => {
        const response = await fetch(`${API_BASE}/admin/analytics`, { headers: { Accept: 'application/json' } });
        const data = await response.json();
        if (!response.ok || data.status !== 'success') throw new Error(data?.message || 'Failed loading analytics');

        const analytics = data.analytics || {};
        const employerAnalytics = analytics.employer_analytics || {};
        const seekerAnalytics = analytics.seeker_analytics || {};

        return {
            summary: {
                totalEmployers: Number(analytics.summary?.total_employers ?? 0),
                verifiedEmployers: Number(analytics.summary?.verified_employers ?? 0),
                pendingEmployerReviews: Number(analytics.summary?.pending_employer_reviews ?? 0),
                pendingSeekerReviews: Number(analytics.summary?.pending_seeker_reviews ?? 0),
                totalFeedback: Number(analytics.summary?.total_feedback ?? 0),
                averageRating: Number(analytics.summary?.average_rating ?? 0),
            },
            ratingBreakdown: (analytics.rating_breakdown || []).map((item) => ({
                rating: Number(item.rating ?? 0),
                total: Number(item.total ?? 0),
            })),
            decisionBreakdown: (analytics.decision_breakdown || []).map((item) => ({
                status: item.status,
                total: Number(item.total ?? 0),
            })),
            topEmployers: (analytics.top_employers || []).map((item) => {
                const normalized = normalizeUserProfile(item);

                return {
                    ...normalized,
                    employerLabel: item.employer_label || normalized.companyName || normalized.name || normalized.email,
                    totalJobs: Number(item.total_jobs ?? item.totalJobs ?? 0),
                    totalApplications: Number(item.total_applications ?? item.totalApplications ?? 0),
                    hiredCount: Number(item.hired_count ?? item.hiredCount ?? 0),
                    interviewCount: Number(item.interview_count ?? item.interviewCount ?? 0),
                    feedbackCount: Number(item.feedback_count ?? item.feedbackCount ?? 0),
                    averageRating: Number(item.average_rating ?? item.averageRating ?? 0),
                    conversionRate: Number(item.conversion_rate ?? item.conversionRate ?? 0),
                };
            }),
            employerAnalytics: {
                summary: {
                    totalEmployers: Number(employerAnalytics.summary?.totalEmployers ?? 0),
                    verifiedEmployers: Number(employerAnalytics.summary?.verifiedEmployers ?? 0),
                    pendingEmployerReviews: Number(employerAnalytics.summary?.pendingEmployerReviews ?? 0),
                    totalJobsPosted: Number(employerAnalytics.summary?.totalJobsPosted ?? 0),
                    totalApplicationsReceived: Number(employerAnalytics.summary?.totalApplicationsReceived ?? 0),
                    hiresInWindow: Number(employerAnalytics.summary?.hiresInWindow ?? 0),
                    jobFairParticipationSignals: Number(employerAnalytics.summary?.jobFairParticipationSignals ?? 0),
                    totalFeedback: Number(employerAnalytics.summary?.totalFeedback ?? 0),
                    averageRating: Number(employerAnalytics.summary?.averageRating ?? 0),
                },
                topCompanies: (employerAnalytics.topCompanies || []).map((item) => ({
                    id: item.id,
                    label: item.label || item.employerLabel || item.companyName || item.name || item.email,
                    email: item.email || '',
                    isVerified: Boolean(item.isVerified),
                    totalJobs: Number(item.totalJobs ?? 0),
                    totalApplications: Number(item.totalApplications ?? 0),
                    hiredCount: Number(item.hiredCount ?? 0),
                    interviewCount: Number(item.interviewCount ?? 0),
                    feedbackCount: Number(item.feedbackCount ?? 0),
                    averageRating: Number(item.averageRating ?? 0),
                    conversionRate: Number(item.conversionRate ?? 0),
                    jobFairSignals: Number(item.jobFairSignals ?? 0),
                })),
            },
            seekerAnalytics: {
                summary: {
                    totalSeekers: Number(seekerAnalytics.summary?.totalSeekers ?? 0),
                    qcSeekers: Number(seekerAnalytics.summary?.qcSeekers ?? 0),
                    nonQcSeekers: Number(seekerAnalytics.summary?.nonQcSeekers ?? 0),
                    verifiedSeekers: Number(seekerAnalytics.summary?.verifiedSeekers ?? 0),
                    applicationsInWindow: Number(seekerAnalytics.summary?.applicationsInWindow ?? 0),
                    hiredSeekers: Number(seekerAnalytics.summary?.hiredSeekers ?? 0),
                },
                ageBreakdown: seekerAnalytics.ageBreakdown || {},
                genderBreakdown: seekerAnalytics.genderBreakdown || {},
                residencyBreakdown: seekerAnalytics.residencyBreakdown || {},
                applicationStageBreakdown: seekerAnalytics.applicationStageBreakdown || {},
                hiredByResidency: seekerAnalytics.hiredByResidency || {},
                hiredByGender: seekerAnalytics.hiredByGender || {},
            },
        };
    };

    const refreshAdminData = async ({ includeEmployers = true, includeSeekers = true, includeAnalytics = true } = {}) => {
        const requests = [];

        if (includeEmployers) {
            requests.push(
                fetchAdminEmployers().then((data) => ({ key: 'employers', data }))
            );
        }

        if (includeSeekers) {
            requests.push(
                fetchAdminSeekers().then((data) => ({ key: 'seekers', data }))
            );
        }

        if (includeAnalytics) {
            requests.push(
                fetchAdminAnalytics().then((data) => ({ key: 'analytics', data }))
            );
        }

        const results = await Promise.allSettled(requests);
        const errors = [];

        results.forEach((result) => {
            if (result.status === 'fulfilled') {
                const { key, data } = result.value;

                if (key === 'employers') {
                    setAdminEmployers(data);
                }

                if (key === 'seekers') {
                    setAdminSeekers(data);
                }

                if (key === 'analytics') {
                    setAdminAnalytics(data);
                }

                return;
            }

            errors.push(result.reason);
        });

        return { errors };
    };

    const fetchTrainings = async () => {
        const response = await fetch(`${API_BASE}/trainings`, { headers: { Accept: 'application/json' } });
        const data = await response.json();
        if (!response.ok || data.status !== 'success') throw new Error(data?.message || 'Failed loading trainings');

        return (data.trainings || []).map((training) => ({
            id: training.id,
            title: training.title,
            provider: training.provider,
            type: training.type,
            description: training.description,
            date: training.start_date,
            slots: Number(training.available_slots ?? training.slots ?? 0),
            registeredUsers: Array.isArray(training.registered_user_ids)
                ? training.registered_user_ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
                : [],
        }));
    };

    const fetchApplications = async (email, seekerId) => {
        const response = await fetch(`${API_BASE}/applications/seeker?email=${encodeURIComponent(email)}`, {
            headers: { Accept: 'application/json' },
        });
        const data = await response.json();
        if (!response.ok || data.status !== 'success') throw new Error(data?.message || 'Failed loading applications');

        const active = (data.active_applications || []).map((app) => mapBackendApplication(app, seekerId));
        const withdrawn = (data.withdrawn_applications || []).map((app) => mapBackendApplication(app, seekerId));

        return [...active, ...withdrawn];
    };

    const fetchSeekerRecommendations = async (email, minScore = 50) => {
        const response = await fetch(`${API_BASE}/seeker/recommendations?email=${encodeURIComponent(email)}&min_score=${minScore}`, {
            headers: { Accept: 'application/json' },
        });

        const data = await response.json();
        if (!response.ok || data.status !== 'success') throw new Error(data?.message || 'Failed loading recommendations');

        return (data.recommendations || []).map(mapBackendRecommendation);
    };

    const fetchEmployerApplications = async (email) => {
        const response = await fetch(`${API_BASE}/applications/employer?email=${encodeURIComponent(email)}`, {
            headers: { Accept: 'application/json' },
        });

        const data = await response.json();
        if (!response.ok || data.status !== 'success') throw new Error(data?.message || 'Failed loading employer applications');

        const apps = (data.applications || []).map((app) => mapBackendEmployerApplication(app));

        const seekersMap = new Map();
        (data.applications || []).forEach((app) => {
            if (!seekersMap.has(app.seeker_id)) {
                seekersMap.set(app.seeker_id, {
                    id: app.seeker_id,
                    name: app.seeker_name,
                    email: app.seeker_email,
                    qcId: app.seeker_qc_id,
                    bdayMonth: app.bday_month,
                    bdayDay: app.bday_day,
                    bdayYear: app.bday_year,
                    gender: app.seeker_gender,
                    resume_path: app.seeker_resume_path,
                    resume_text: app.seeker_resume_text,
                    resumeFile: app.seeker_resume_path ? app.seeker_resume_path.split('/').pop() : null,
                    educationalAttainment: app.seeker_educational_attainment || null,
                    portfolioUrl: app.seeker_portfolio_url || null,
                    linkedinUrl: app.seeker_linkedin_url || null,
                    githubUrl: app.seeker_github_url || null,
                    facebookUrl: app.seeker_facebook_url || null,
                    instagramUrl: app.seeker_instagram_url || null,
                });
            }
        });

        return {
            applications: apps,
            seekers: Array.from(seekersMap.values()),
        };
    };

    const fetchMessages = async (email) => {
        const response = await fetch(`${API_BASE}/messages?email=${encodeURIComponent(email)}`, {
            headers: { Accept: 'application/json' },
        });

        const data = await response.json();
        if (!response.ok || data.status !== 'success') throw new Error(data?.message || 'Failed loading messages');

        return (data.messages || []).map((message) => ({
            id: message.id,
            fromId: message.from_user_id,
            toId: message.to_user_id,
            content: message.content,
            date: message.created_at,
            read: !!message.read_at,
            fromName: message.from_name,
            fromCompanyName: message.from_company_name,
            toName: message.to_name,
            toCompanyName: message.to_company_name,
        }));
    };

    const fetchNotifications = async (email) => {
        const response = await fetch(`${API_BASE}/notifications?email=${encodeURIComponent(email)}`, {
            headers: { Accept: 'application/json' },
        });
        const data = await response.json();
        if (!response.ok || data.status !== 'success') throw new Error(data?.message || 'Failed loading notifications');

        return (data.notifications || []).map((notification) => {
            const rawMeta = notification.meta;
            let parsedMeta = rawMeta;

            if (typeof rawMeta === 'string') {
                try {
                    parsedMeta = JSON.parse(rawMeta);
                } catch {
                    parsedMeta = null;
                }
            }

            return {
                id: notification.id,
                toId: notification.to_user_id,
                content: notification.content
                    || (parsedMeta?.type === 'message' && parsedMeta?.message_preview
                        ? `New message: ${parsedMeta.message_preview}`
                        : 'New notification.'),
                read: !!notification.read_at,
                date: notification.created_at,
                meta: parsedMeta,
            };
        });
    };

    const fetchMatchMetrics = async (email, jobId) => {
        const response = await fetch(`${API_BASE}/match-metrics?email=${encodeURIComponent(email)}&job_id=${jobId}`, {
            headers: { Accept: 'application/json' },
        });
        const data = await response.json();
        if (!response.ok || data.status !== 'success') throw new Error(data?.message || 'Failed loading match metrics');

        return {
            score: data.score || 0,
            matches: data.matched_skills || [],
            missingSkills: data.missing_skills || [],
        };
    };

    useEffect(() => {
        if (!user || user.role !== 'Seeker' || !user.email) return;

        const bootstrap = async () => {
            try {
                const [profileData, jobsData, trainingsData, applicationsData, notificationsData, recommendationsData, messagesData, savedJobsData] = await Promise.all([
                    fetchSeekerProfile(user.email),
                    fetchJobs(),
                    fetchTrainings(),
                    fetchApplications(user.email, user.id),
                    fetchNotifications(user.email),
                    fetchSeekerRecommendations(user.email, 50),
                    fetchMessages(user.email),
                    fetchSavedJobs(user.email),
                ]);

                setUser(profileData);
                localStorage.setItem('user', JSON.stringify(profileData));
                setJobs(jobsData);
                setTrainings(trainingsData);
                setApplications(applicationsData);
                setNotifications(notificationsData);
                setSeekerRecommendations(recommendationsData);
                setMessages(messagesData);
                setSavedJobs(savedJobsData);
            } catch (error) {
                console.error('Seeker bootstrap failed:', error);
            }
        };

        bootstrap();
    }, [user?.id, user?.role, user?.email]);

    useEffect(() => {
        if (!user?.email || currentView !== 'messages') return;

        const loadMessages = async () => {
            try {
                const refreshedMessages = await fetchMessages(user.email);
                setMessages(refreshedMessages);
            } catch (error) {
                console.error('Messages refresh failed:', error);
            }
        };

        loadMessages();
    }, [currentView, user?.email]);

    useEffect(() => {
        if (!user || user.role !== 'Admin') return;

        const bootstrapAdmin = async () => {
            const { errors } = await refreshAdminData();

            if (errors.length > 0) {
                console.error('Admin bootstrap partial failure:', errors);
            }
        };

        bootstrapAdmin();
    }, [user?.id, user?.role]);

    useEffect(() => {
        if (!user || user.role !== 'Employer' || !user.email) return;

        const bootstrapEmployer = async () => {
            try {
                const [jobsData, employerApplicationsData, messagesData, notificationsData] = await Promise.all([
                    fetch(`${API_BASE}/jobs?include_closed=1`, { headers: { Accept: 'application/json' } })
                        .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
                        .then(({ ok, data }) => {
                            if (!ok || data.status !== 'success') throw new Error(data?.message || 'Failed loading jobs');
                            return (data.jobs || []).map(mapBackendJob);
                        }),
                    fetchEmployerApplications(user.email),
                    fetchMessages(user.email),
                    fetchNotifications(user.email),
                ]);

                setJobs(jobsData);
                setApplications(employerApplicationsData.applications);
                setEmployerSeekers(employerApplicationsData.seekers);
                setMessages(messagesData);
                setNotifications(notificationsData);
            } catch (error) {
                console.error('Employer bootstrap failed:', error);
            }
        };

        bootstrapEmployer();
    }, [user?.id, user?.role, user?.email]);

    useEffect(() => {
        if (!user?.email || !selectedJob?.id || currentView !== 'job-details') return;

        const load = async () => {
            try {
                const backendMatch = await fetchMatchMetrics(user.email, selectedJob.id);
                setSelectedJobMatchData(backendMatch);
            } catch (error) {
                console.error('Match metrics fetch failed:', error);
                const fallback = calculateMatchScore(selectedJob?.requiredSkills || [], user?.skills || []);
                setSelectedJobMatchData(fallback);
            }
        };

        load();
    }, [user?.email, user?.skills, selectedJob?.id, currentView]);

    const sendAutomatedEmail = (seekerEmail, seekerName, jobTitle, status, companyName, reason) => {
        const templateParams = { to_email: seekerEmail, to_name: seekerName, from_name: companyName, subject: `Update: ${status}`, message: `Your status for ${jobTitle} is now ${status}. ${reason || ''}` };
        emailjs.send('service_n4c8dmq', 'template_scnzurg', templateParams, 'i5z0CxEmLkBbQVES-');
    };

    const handleNavigate = (view) => {
        if (view === 'notifications') {
            setNotifications(prev => {
                const unread = prev.filter(n => n.toId === user?.id && !n.read);

                unread.forEach((notification) => {
                    fetch(`${API_BASE}/notifications/read`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                        },
                        body: JSON.stringify({ notification_id: notification.id }),
                    }).catch((error) => {
                        console.error('Failed to mark notification as read:', error);
                    });
                });

                return prev.map(n => n.toId === user?.id ? { ...n, read: true } : n);
            });
        }

        setPreviousView(currentView);
        setCurrentView(view);
    };

    const handleLogin = (type, data) => {
        const normalized = normalizeUserProfile(data);
        setUser(normalized); localStorage.setItem('user', JSON.stringify(normalized));
        if (normalized.role === 'Admin') setCurrentView('admin-dash');
        else if (normalized.role === 'Employer') setCurrentView('employer-dash');
        else setCurrentView('seeker-dash');
    };

    const handleLogout = () => { setUser(null); localStorage.removeItem('user'); setCurrentView('home'); };

    const handleToggleSaveJob = async (jobId) => {
        if (!user?.email) return showToast('Please log in to save jobs.', 'error');

        const isSaved = savedJobs.includes(jobId);
        setSavedJobs(prev => isSaved ? prev.filter(id => id !== jobId) : [...prev, jobId]);

        try {
            const response = await fetch(`${API_BASE}/seeker/saved-jobs/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    job_id: jobId,
                }),
            });
            const data = await response.json();
            
            if (!response.ok || data.status !== 'success') {
                throw new Error('Failed to sync with server.');
            }
            
            if (data.is_saved !== undefined) {
                 setSavedJobs(prev => data.is_saved ? [...new Set([...prev, jobId])] : prev.filter(id => id !== jobId));
            }
            showToast(data.message || (data.is_saved ? 'Job saved!' : 'Job removed from saved list.'), 'success');
        } catch (error) {
            console.warn('Backend sync failed, falling back to local storage for saved jobs.');
            showToast(isSaved ? 'Job removed locally.' : 'Job saved locally.', 'success');
        }
    };

    const handleApply = async (jobId) => {
        if (!user) return setCurrentView('login');
        if (!user.email) return showToast('Missing account email.', 'error');

        try {
            const response = await fetch(`${API_BASE}/applications/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    job_id: jobId,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || 'Failed to apply.');
            }

            const refreshedApplications = await fetchApplications(user.email, user.id);
            setApplications(refreshedApplications);
            showToast('Application submitted successfully! ✓', 'success');
            setCurrentView('seeker-dash');
        } catch (error) {
            showToast(error?.message || 'Failed to apply.', 'error');
        }
    };

    const handleUpdateAppStatus = async (appId, newStatus, declineMeta = null) => {
        if (!user?.email) return;

        const declineReasonCode = declineMeta?.reasonCode || null;
        const declineReasonText = declineMeta?.reasonText || null;

        try {
            const response = await fetch(`${API_BASE}/applications/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    application_id: appId,
                    status: newStatus,
                    rejection_reason: declineReasonText,
                    decline_reason_code: declineReasonCode,
                    decline_reason_text: declineReasonText,
                }),
            });

            const data = await response.json();
            if (!response.ok || data.status !== 'success') {
                throw new Error(data?.message || 'Failed to update application status.');
            }

            const refreshed = await fetchEmployerApplications(user.email);
            setApplications(refreshed.applications);
            setEmployerSeekers(refreshed.seekers);

            const app = refreshed.applications.find((item) => item.id === appId);
            if (app) {
                const seeker = refreshed.seekers.find((candidate) => candidate.id === app.seekerId);
                const job = jobs.find((item) => item.id === app.jobId);
                if (seeker && job) {
                    sendAutomatedEmail(seeker.email, seeker.name, job.title, newStatus, job.company, declineReasonText);
                }
            }

            showToast('Application status updated.', 'success');
        } catch (error) {
            showToast(error?.message || 'Failed to update application status.', 'error');
        }
    };

    const handleRegisterTraining = async (trainingId) => {
        if (!user) return setCurrentView('login');
        
        // Check if already registered
        const training = trainings.find(t => t.id === trainingId);
        if (!training) {
            showToast('Training not found', 'error');
            return;
        }
        
        if (training.registeredUsers?.includes(user.id)) {
            showToast('You are already registered for this training!', 'warning');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/trainings/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    training_id: trainingId,
                }),
            });

            const data = await response.json();
            if (!response.ok || data.status !== 'success') {
                throw new Error(data?.message || 'Failed to register for training.');
            }

            const refreshedTrainings = await fetchTrainings();
            setTrainings(refreshedTrainings);

            showToast(`Registered for ${training.title}! ✓`, 'success');
            setCurrentView('seeker-dash');
        } catch (error) {
            showToast(error?.message || 'Failed to register for training.', 'error');
        }
    };

    const handleWithdrawTraining = async (trainingId) => {
        if (!user?.email) {
            showToast('Missing account email.', 'error');
            return false;
        }

        const training = trainings.find(t => t.id === trainingId);

        try {
            const response = await fetch(`${API_BASE}/trainings/withdraw`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    training_id: trainingId,
                }),
            });

            const data = await response.json();
            if (!response.ok || data.status !== 'success') {
                throw new Error(data?.message || 'Failed to withdraw from training.');
            }

            const refreshedTrainings = await fetchTrainings();
            setTrainings(refreshedTrainings);
            showToast(`Withdrawn from ${training?.title || 'training'}.`, 'success');
            return true;
        } catch (error) {
            showToast(error?.message || 'Failed to withdraw from training.', 'error');
            return false;
        }
    };

    const handleRegisterJobFair = (jobFairId) => {
        if (!user) return setCurrentView('login');
        
        // Check if already registered
        const jobFair = jobFairs.find(f => f.id === jobFairId);
        if (!jobFair) {
            showToast('Job Fair not found', 'error');
            return;
        }
        
        if (jobFair.participants?.includes(user.id)) {
            showToast('You are already registered for this job fair!', 'warning');
            return;
        }
        
        // Add user to participants
        setJobFairs(prev => prev.map(f => 
            f.id === jobFairId 
                ? { 
                    ...f, 
                    participants: [...(f.participants || []), user.id]
                  }
                : f
        ));
        
        showToast(`Registered for ${jobFair.title}! ✓`, 'success');
        setCurrentView('seeker-dash');
    };

    const handleSendMessage = async (toId, content) => {
        if (!user?.email) return;

        try {
            const response = await fetch(`${API_BASE}/messages/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    to_user_id: toId,
                    content,
                }),
            });

            const data = await response.json();
            if (!response.ok || data.status !== 'success') {
                throw new Error(data?.message || 'Failed sending message.');
            }

            const refreshedMessages = await fetchMessages(user.email);
            setMessages(refreshedMessages);
        } catch (error) {
            showToast(error?.message || 'Failed sending message.', 'error');
        }
    };

    const handleUploadEmployerDocs = async (documentType, file) => {
        if (!user?.email) {
            showToast('Missing account email.', 'error');
            return false;
        }

        if (!documentType) {
            showToast('Missing document type.', 'error');
            return false;
        }

        const formData = new FormData();
        formData.append('email', user.email);
        formData.append('document_type', documentType);
        formData.append('document', file);

        try {
            const response = await fetch(`${API_BASE}/upload/employer-documents`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok || data.status !== 'success') {
                throw new Error(data?.message || 'Failed to upload verification documents.');
            }

            const normalized = normalizeUserProfile(data.user);
            setUser(normalized);
            localStorage.setItem('user', JSON.stringify(normalized));
            showToast('Verification document submitted.', 'success');
            return true;
        } catch (error) {
            showToast(error?.message || 'Failed to upload verification documents.', 'error');
            return false;
        }
    };

    const handleVerifyEmployer = async (employerId, approved) => {
        try {
            const response = await fetch(`${API_BASE}/admin/employers/review`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    employer_id: employerId,
                    approved,
                }),
            });

            const data = await response.json();
            if (!response.ok || data.status !== 'success') {
                throw new Error(data?.message || 'Failed to review employer.');
            }

            const { errors } = await refreshAdminData({ includeSeekers: false });
            if (errors.length > 0) {
                console.error('Admin employer refresh partial failure:', errors);
            }
            showToast(approved ? 'Employer approved.' : 'Employer moved to pending for document updates.', 'success');
        } catch (error) {
            showToast(error?.message || 'Failed to review employer.', 'error');
        }
    };

    const handleReviewSeekerId = async (seekerId, approved, reason = '') => {
        try {
            const response = await fetch(`${API_BASE}/admin/seekers/review`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    seeker_id: seekerId,
                    approved,
                    reason: reason || null,
                }),
            });

            const data = await response.json();
            if (!response.ok || data.status !== 'success') {
                throw new Error(data?.message || 'Failed to review seeker ID.');
            }

            const { errors } = await refreshAdminData({ includeEmployers: false });
            if (errors.length > 0) {
                console.error('Admin seeker refresh partial failure:', errors);
            }
            showToast(approved ? 'Seeker ID verified.' : 'Seeker ID marked as unverified.', 'success');
            return true;
        } catch (error) {
            showToast(error?.message || 'Failed to review seeker ID.', 'error');
            return false;
        }
    };

    const handleSubmitEmployerFeedback = async (applicationId, rating, feedbackComment) => {
        if (!user?.email) {
            showToast('Missing account email.', 'error');
            return false;
        }

        try {
            const response = await fetch(`${API_BASE}/applications/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    application_id: applicationId,
                    rating,
                    feedback_comment: feedbackComment || null,
                }),
            });

            const data = await response.json();
            if (!response.ok || data.status !== 'success') {
                throw new Error(data?.message || 'Failed to submit feedback.');
            }

            const refreshedApplications = await fetchApplications(user.email, user.id);
            setApplications(refreshedApplications);
            showToast(data?.message || 'Feedback submitted successfully.', 'success');
            return true;
        } catch (error) {
            showToast(error?.message || 'Failed to submit feedback.', 'error');
            return false;
        }
    };

    const handlePostJob = async (jobPayload) => {
        if (!user?.email) {
            showToast('Missing account email.', 'error');
            return false;
        }

        try {
            const response = await fetch(`${API_BASE}/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    title: jobPayload.title,
                    location: jobPayload.location,
                    employment_type: jobPayload.type,
                    description: jobPayload.description,
                    required_skills: jobPayload.requiredSkills || [],
                    salary_min: jobPayload.salaryMin ?? null,
                    salary_max: jobPayload.salaryMax ?? null,
                    educational_attainment_required: jobPayload.educationalAttainmentRequired || null,
                    industry: user.industry || null,
                }),
            });

            const data = await response.json();
            if (!response.ok || data.status !== 'success') {
                throw new Error(data?.message || 'Failed to post job.');
            }

            const refreshedJobs = await fetchJobs(true); // Ensure employer gets refreshed closed jobs too
            setJobs(refreshedJobs);
            showToast('Job posted successfully.', 'success');
            return true;
        } catch (error) {
            showToast(error?.message || 'Failed to post job.', 'error');
            return false;
        }
    };

    const handleUpdateJob = async (updatedJobPayload) => {
        if (!user?.email) {
            showToast('Missing account email.', 'error');
            return false;
        }

        try {
            const response = await fetch(`${API_BASE}/jobs/${updatedJobPayload.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    title: updatedJobPayload.title,
                    location: updatedJobPayload.location,
                    employment_type: updatedJobPayload.type,
                    description: updatedJobPayload.description,
                    required_skills: updatedJobPayload.requiredSkills || [],
                    salary_min: updatedJobPayload.salaryMin ?? null,
                    salary_max: updatedJobPayload.salaryMax ?? null,
                    educational_attainment_required: updatedJobPayload.educationalAttainmentRequired || null,
                    industry: user.industry || null,
                    status: updatedJobPayload.status, // THIS IS THE LINE THAT FIXES THE TOGGLE
                }),
            });

            const data = await response.json();
            if (!response.ok || data.status !== 'success') {
                throw new Error(data?.message || 'Failed to update job.');
            }

            // ✅ Passed 'true' here to ensure the closed job stays in the list!
            const refreshedJobs = await fetchJobs(user?.role === 'Employer');
            setJobs(refreshedJobs);
            showToast('Job updated successfully.', 'success');
            return true;
        } catch (error) {
            showToast(error?.message || 'Failed to update job.', 'error');
            return false;
        }
    };

    const renderContent = () => {
        // 1. PUBLIC VIEWS
        if (currentView === 'home') return <LandingPage onNavigate={handleNavigate} />;
        if (currentView === 'trainings' || currentView === 'public-trainings') {
            return <PublicListings type="trainings" data={trainings} user={user} onRegister={handleRegisterTraining} />;
        }
        if (currentView === 'jobfairs' || currentView === 'public-jobfairs') {
            return <PublicListings type="jobfairs" data={jobFairs} user={user} onRegister={handleRegisterJobFair} />;
        }

        // 2. AUTH WALL
        if (!user || currentView === 'login') return <LoginScreen onLogin={handleLogin} loginError={loginError} setLoginError={setLoginError} />;

        // 3. PROTECTED VIEWS
        if (currentView === 'seeker-dash') return (
            <SeekerDashboard 
                profile={user} 
                applications={applications || []} 
                jobs={jobs || []} 
                trainings={trainings || []}
                jobFairs={jobFairs || []}
                savedJobs={savedJobs || []}
                initialTab={seekerActiveTab} 
                onNavigate={setCurrentView}
                onViewJob={(j) => handleViewJobDetails(j, 'seeker-dash')}
                onApply={handleApply}
                onToggleSaveJob={handleToggleSaveJob}
                onWithdrawTraining={handleWithdrawTraining}
                onSubmitEmployerFeedback={handleSubmitEmployerFeedback}
                onUpdateProfile={(updatedUser) => {
                    const normalized = normalizeUserProfile(updatedUser);
                    setUser(normalized);
                    localStorage.setItem('user', JSON.stringify(normalized));
                }}
                notify={showToast}
            />
        );

        if (currentView === 'employer-dash') return <EmployerDashboard profile={user} jobs={jobs} applications={applications} seekers={employerSeekers} onPostJob={handlePostJob} onUpdateJob={handleUpdateJob} onUpdateStatus={handleUpdateAppStatus} onUpdateProfile={(u)=>setUser(normalizeUserProfile(u))} onUploadDocs={handleUploadEmployerDocs} onOpenChat={(id)=>{setTargetChatId(id); setCurrentView('messages');}} notify={showToast} />;
        
        if (currentView === 'admin-dash') return <AdminDashboard employers={adminEmployers} seekers={adminSeekers} analytics={adminAnalytics} onVerifyEmployer={handleVerifyEmployer} onReviewSeeker={handleReviewSeekerId} jobFairs={jobFairs} onAddJobFair={()=>{}} notify={showToast} />;
        
        if (currentView === 'matchmaker') return <FindJobs jobs={jobs} recommendations={seekerRecommendations || []} onApply={handleApply} applications={applications} userId={user.id} profile={user} savedJobs={savedJobs || []} onToggleSaveJob={handleToggleSaveJob} onGoToProfile={() => { setSeekerActiveTab('profile'); setCurrentView('seeker-dash'); setTimeout(() => { document.getElementById('resume-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300); }} onJobClick={(j) => { setSelectedJob(j); setPreviousView('matchmaker'); setCurrentView('job-details'); }} />;
        
        if (currentView === 'job-details') {
            const matchInfo = selectedJobMatchData || calculateMatchScore(selectedJob?.requiredSkills || [], user?.skills || []);
            return (
                <JobDetailsPage 
                    job={selectedJob} 
                    matchData={matchInfo} 
                    onBack={() => setCurrentView(previousView)} 
                />
            );
        }       
        if (currentView === 'messages') return <MessagesPanel messages={messages} user={user} users={[...users, ...employerSeekers]} onBack={() => setCurrentView(previousView)} onSendMessage={handleSendMessage} onRead={async (id) => {
            if (!user?.email) return;
            try {
                await fetch(`${API_BASE}/messages/read`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ email: user.email, contact_user_id: id }),
                });

                const refreshedMessages = await fetchMessages(user.email);
                setMessages(refreshedMessages);
            } catch (error) {
                console.error('Failed to mark messages as read:', error);
            }
        }} initialChatId={targetChatId} />;
        if (currentView === 'notifications') return <NotificationsPanel notifications={notifications} user={user} onBack={() => setCurrentView(previousView)} />;
        if (currentView === 'resume-builder') return <ResumeBuilderMain user={user} onBack={() => setCurrentView('seeker-dash')} onSaveResume={(resumeData) => { const updatedUser = { ...user, resumeFile: resumeData.resumeFile, resumeType: resumeData.resumeType }; setUser(updatedUser); setResumeFileData(resumeData.resumeData); localStorage.setItem('user', JSON.stringify(updatedUser)); showToast('Resume saved successfully! Employers can now assess it.', 'success'); }} />;

        return <LandingPage onNavigate={handleNavigate} />;
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
            <Navbar user={user} onLogout={handleLogout} onNavigate={handleNavigate} unreadNotifs={notifications.filter(n => n.toId === user?.id && !n.read).length} currentView={currentView} />
            <main className="flex-1">
                {renderContent()}
            </main>
            <InstitutionalFooter />
            <Toast messages={toastMessages} />
        </div>
    );
};

export default App;