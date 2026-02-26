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
import LandingPage, { PublicListings } from './pages/LandingPage';
import LoginScreen from './pages/Login'; 
import SeekerDashboard, { FindJobs, JobDetailsPage, DashboardOverview } from './pages/SeekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ResumeBuilderMain from './pages/ResumeBuilder/ResumeBuilderMain.jsx';

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
    };
};

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
        return { id: contactId, name: contactUser ? (contactUser.name || contactUser.companyName) : "User", hasUnread: messages.some(m => m.fromId === contactId && m.toId === user.id && !m.read) };
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
    const [selectedJob, setSelectedJob] = useState(null);
    const [targetChatId, setTargetChatId] = useState(null);
    const [toastMessages, setToastMessages] = useState([]);

    // helper used by seeker dashboard to view job metrics/details
    const handleViewJobDetails = (job, fromView = '') => {
        if (!job) return;
        setSelectedJob(job);
        setPreviousView(fromView);
        setCurrentView('job-details');
    };

    // Toast notification helper
    const showToast = (text, type = 'success') => {
        const id = Date.now();
        setToastMessages(prev => [...prev, { id, text, type }]);
        setTimeout(() => {
            setToastMessages(prev => prev.filter(msg => msg.id !== id));
        }, 3000); // Auto-remove after 3 seconds
    };

    useEffect(() => { localStorage.setItem('cjl_users', JSON.stringify(users)); }, [users]);
    useEffect(() => { localStorage.setItem('cjl_jobs', JSON.stringify(jobs)); }, [jobs]);
    useEffect(() => { localStorage.setItem('cjl_applications', JSON.stringify(applications)); }, [applications]);
    useEffect(() => { localStorage.setItem('cjl_notifications', JSON.stringify(notifications)); }, [notifications]);
    useEffect(() => { localStorage.setItem('cjl_messages', JSON.stringify(messages)); }, [messages]);
    useEffect(() => { localStorage.setItem('cjl_jobfairs', JSON.stringify(jobFairs)); }, [jobFairs]);

    const sendAutomatedEmail = (seekerEmail, seekerName, jobTitle, status, companyName, reason) => {
        const templateParams = { to_email: seekerEmail, to_name: seekerName, from_name: companyName, subject: `Update: ${status}`, message: `Your status for ${jobTitle} is now ${status}. ${reason || ''}` };
        emailjs.send('service_n4c8dmq', 'template_scnzurg', templateParams, 'i5z0CxEmLkBbQVES-');
    };

    const handleNavigate = (view) => {
        if (view === 'notifications') setNotifications(prev => prev.map(n => n.toId === user?.id ? { ...n, read: true } : n));
        setPreviousView(currentView); setCurrentView(view);
    };

    const handleLogin = (type, data) => {
        const normalized = normalizeUserProfile(data);
        setUser(normalized); localStorage.setItem('user', JSON.stringify(normalized));
        if (normalized.role === 'Admin') setCurrentView('admin-dash');
        else if (normalized.role === 'Employer') setCurrentView('employer-dash');
        else setCurrentView('seeker-dash');
    };

    const handleLogout = () => { setUser(null); localStorage.removeItem('user'); setCurrentView('home'); };

    const handleApply = (jobId) => {
    if (!user) return setCurrentView('login');
    
    // Check kung nag-apply na dati
    if (applications.some(a => a.jobId === jobId && a.seekerId === user.id)) {
        return showToast('You have already applied to this position!', 'warning');
    }

    const newApp = { 
        id: Date.now(), 
        jobId: jobId, 
        seekerId: user.id, 
        status: 'Applied', // 💡 ITO ANG KEY: Dapat 'Applied' ang spelling
        date: new Date().toLocaleDateString() 
    };

    setApplications(prev => {
        const updatedApps = [...prev, newApp];
        // I-save sa localStorage para pag-refresh ay nandoon pa rin
        localStorage.setItem('cjl_applications', JSON.stringify(updatedApps));
        return updatedApps;
    });

    showToast('Application submitted successfully! ✓', 'success');
    setCurrentView('seeker-dash'); // Auto-navigate sa dashboard
    };

    const handleUpdateAppStatus = (appId, newStatus, reason) => {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus, rejectionReason: reason } : a));
        const app = applications.find(a => a.id === appId);
        if (app) {
            const seeker = users.find(u => u.id === app.seekerId);
            const job = jobs.find(j => j.id === app.jobId);
            if (seeker && job) sendAutomatedEmail(seeker.email, seeker.name, job.title, newStatus, job.company, reason);
        }
    };

    const handleCancelApplication = (appId, reason = '') => {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'Cancelled', cancellationReason: reason } : a));
        showToast('Application withdrawn successfully', 'success');
    };

    const handleRegisterTraining = (trainingId) => {
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
        
        // Add user to registeredUsers and decrement slots
        setTrainings(prev => prev.map(t => 
            t.id === trainingId 
                ? { 
                    ...t, 
                    slots: (t.slots || 0) - 1,
                    registeredUsers: [...(t.registeredUsers || []), user.id]
                  }
                : t
        ));
        
        showToast(`Registered for ${training.title}! ✓`, 'success');
        setCurrentView('seeker-dash');
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

    const handleSendMessage = (toId, content) => {
        const newMsg = { id: Date.now(), fromId: user.id, toId, content, date: new Date().toLocaleDateString(), read: false };
        setMessages(prev => [newMsg, ...prev]);
    };

    const renderContent = () => {
        // 1. PUBLIC VIEWS (Routing Fix: Included explicit checks)
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
       // Halimbawa sa App.jsx:
        if (currentView === 'seeker-dash') return (
            <SeekerDashboard 
                profile={user} 
                applications={applications || []} // Gumamit ng || [] para hindi mag-blank kung null
                jobs={jobs || []} 
                trainings={trainings || []}
                jobFairs={jobFairs || []}
                onNavigate={setCurrentView}
                onViewJob={(j) => handleViewJobDetails(j, 'seeker-dash')}
                onCancelApplication={handleCancelApplication}
            />
        );

        if (currentView === 'employer-dash') return <EmployerDashboard profile={user} jobs={jobs} applications={applications} seekers={users.filter(u=>u.role==='Seeker')} onPostJob={(j) => setJobs([j,...jobs])} onUpdateStatus={handleUpdateAppStatus} onUpdateProfile={(u)=>setUser(u)} onOpenChat={(id)=>{setTargetChatId(id); setCurrentView('messages');}} />;
        if (currentView === 'admin-dash') return <AdminDashboard employers={users.filter(u => u.role === 'Employer')} onVerifyEmployer={()=>{}} jobFairs={jobFairs} onAddJobFair={()=>{}} />;
        if (currentView === 'matchmaker') return <FindJobs jobs={jobs} onApply={handleApply} applications={applications} userId={user.id} onJobClick={(j) => { setSelectedJob(j); setPreviousView('matchmaker'); setCurrentView('job-details'); }} />;
        if (currentView === 'job-details') {
            const matchInfo = calculateMatchScore(selectedJob?.requiredSkills || [], user?.skills || []);
            return (
                <JobDetailsPage 
                    job={selectedJob} 
                    matchData={matchInfo} // Siguraduhing naipapasa ito
                    onBack={() => setCurrentView(previousView)} 
                />
            );
        }       
        if (currentView === 'messages') return <MessagesPanel messages={messages} user={user} users={users} onBack={() => setCurrentView(previousView)} onSendMessage={handleSendMessage} onRead={(id) => setMessages(prev => prev.map(m => (m.fromId === id && m.toId === user.id) ? { ...m, read: true } : m))} initialChatId={targetChatId} />;
        if (currentView === 'notifications') return <NotificationsPanel notifications={notifications} user={user} onBack={() => setCurrentView(previousView)} />;
        if (currentView === 'resume-builder') return <ResumeBuilderMain user={user} onBack={() => setCurrentView('seeker-dash')} onSaveResume={(resumeData) => { const updatedUser = { ...user, resumeFile: resumeData.resumeFile, resumeType: resumeData.resumeType }; setUser(updatedUser); setResumeFileData(resumeData.resumeData); localStorage.setItem('user', JSON.stringify(updatedUser)); showToast('Resume saved successfully! Employers can now assess it.', 'success'); }} />;

        return <LandingPage onNavigate={handleNavigate} />;
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar user={user} onLogout={handleLogout} onNavigate={handleNavigate} unreadNotifs={notifications.filter(n => n.toId === user?.id && !n.read).length} currentView={currentView} />
            {renderContent()}
            <Toast messages={toastMessages} />
        </div>
    );
};

export default App;