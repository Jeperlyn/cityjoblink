// src/App.jsx
import React, { useState, useEffect, useRef } from 'react'; 
// ✅ ADDED: Icons for Modals
import { ChevronLeft, Send, MessageCircle, User, Reply, AlertCircle, FileText, X, LogIn, AlertTriangle, CheckCircle } from 'lucide-react'; 

// Import Components
import Navbar from './components/Navbar';
import LandingPage, { PublicListings } from './pages/LandingPage';
import LoginScreen from './pages/Login';
import SeekerDashboard, { MatchmakerSearch, JobDetailsPage } from './pages/SeekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ResumeBuilderMain from './pages/ResumeBuilder/ResumeBuilderMain.jsx';

// Import Data
import { 
  ADMIN_ACCOUNT, 
  INITIAL_JOBS, 
  INITIAL_TRAININGS, 
  INITIAL_JOB_FAIRS, 
  INITIAL_APPLICATIONS, 
  INITIAL_MESSAGES, 
  INITIAL_NOTIFICATIONS, 
  calculateMatchScore 
} from './data/mockData';

// Helper: Time Ago
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

// MESSAGES PANEL
const MessagesPanel = ({ messages, user, users, onBack, onSendMessage, onRead, initialChatId }) => {
  const [activeChatId, setActiveChatId] = useState(initialChatId || null);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialChatId) {
        onRead(initialChatId);
    }
  }, [initialChatId]);

  const contacts = Array.from(new Set(
      messages
        .filter(m => m.fromId === user.id || m.toId === user.id)
        .map(m => m.fromId === user.id ? m.toId : m.fromId)
  ))
  .filter(contactId => contactId !== user.id) 
  .map(contactId => {
      const contactUser = users.find(u => u.id === contactId);
      const hasUnread = messages.some(m => m.fromId === contactId && m.toId === user.id && !m.read);
      
      return { 
          id: contactId, 
          name: contactUser ? (contactUser.name || contactUser.companyName) : "Unknown User",
          hasUnread 
      };
  });

  const activeMessages = activeChatId 
      ? messages.filter(m => (m.fromId === user.id && m.toId === activeChatId) || (m.fromId === activeChatId && m.toId === user.id)).sort((a,b) => a.id - b.id)
      : [];

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, activeChatId]);

  const handleSend = (e) => {
      e.preventDefault();
      if (!replyText.trim() || !activeChatId) return;
      onSendMessage(activeChatId, replyText);
      setReplyText("");
  };

  const handleContactClick = (contactId) => {
      setActiveChatId(contactId);
      onRead(contactId);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 h-[85vh] flex flex-col">
      <button onClick={onBack} className="flex items-center gap-2 mb-4 hover:text-cyan-600 transition-colors w-fit">
        <ChevronLeft/> Back to Dashboard
      </button>

      <div className="flex-1 bg-white rounded-xl shadow-lg border overflow-hidden flex">
          <div className={`w-full md:w-1/3 border-r bg-gray-50 flex flex-col ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-4 border-b bg-white font-bold text-lg flex items-center gap-2">
                  <MessageCircle size={20}/> Chats
              </div>
              <div className="flex-1 overflow-y-auto">
                  {contacts.length === 0 ? (
                      <div className="p-4 text-gray-500 text-sm italic">No conversations yet.</div>
                  ) : (
                      contacts.map(c => (
                          <div 
                              key={c.id} 
                              onClick={() => handleContactClick(c.id)}
                              className={`p-4 border-b cursor-pointer hover:bg-white transition-colors flex items-center gap-3 ${activeChatId === c.id ? 'bg-white border-l-4 border-l-cyan-500' : ''}`}
                          >
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 relative">
                                  <User size={20}/>
                                  {c.hasUnread && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>}
                              </div>
                              <div className="flex-1">
                                  <p className={`text-sm text-gray-800 ${c.hasUnread ? 'font-bold' : 'font-normal'}`}>{c.name}</p>
                                  <p className="text-xs text-gray-500">{c.hasUnread ? 'New message' : 'Click to view'}</p>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>

          <div className={`w-full md:w-2/3 flex flex-col ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
              {activeChatId ? (
                  <>
                      <div className="p-4 border-b bg-white flex items-center gap-2 shadow-sm">
                          <button onClick={()=>setActiveChatId(null)} className="md:hidden text-gray-500"><ChevronLeft/></button>
                          <div className="font-bold text-lg">
                              {contacts.find(c => c.id === activeChatId)?.name || "Chat"}
                          </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                          {activeMessages.map(m => {
                              const isMe = m.fromId === user.id;
                              return (
                                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-[70%] p-3 rounded-xl text-sm ${isMe ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'}`}>
                                          <p>{m.content}</p>
                                          <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-cyan-100' : 'text-gray-400'}`}>{m.date}</span>
                                      </div>
                                  </div>
                              )
                          })}
                          <div ref={messagesEndRef} />
                      </div>

                      <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
                          <input 
                              className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:border-cyan-500 bg-gray-50"
                              placeholder="Type a message..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                          />
                          <button type="submit" className="bg-cyan-600 text-white p-2 rounded-full hover:bg-cyan-700 transition-colors">
                              <Send size={18}/>
                          </button>
                      </form>
                  </>
              ) : (
                  <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
                      <MessageCircle size={64} className="mb-4 opacity-20"/>
                      <p>Select a conversation to start messaging</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

// Notifications Panel
const NotificationsPanel = ({ notifications, user, onBack }) => (
  <div className="max-w-4xl mx-auto p-6">
    <button onClick={onBack} className="flex items-center gap-2 mb-4"><ChevronLeft/> Back</button>
    <h1 className="text-2xl font-bold mb-4">Notifications</h1>
    {notifications.filter(n=>n.toId===user.id).length === 0 ? (
       <p className="text-gray-500">No notifications yet.</p>
    ) : (
       notifications.filter(n=>n.toId===user.id).map(n=>(
         <div key={n.id} className={`p-4 border-b ${n.read ? 'bg-white text-gray-600' : 'bg-blue-50 font-bold'}`}>
           <p>{n.content} <span className="text-xs text-gray-500 block mt-1 font-normal">{formatTimeAgo(n.date)}</span></p>
         </div>
       ))
    )}
  </div>
);

const App = () => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [previousView, setPreviousView] = useState('home'); 
  const [loginError, setLoginError] = useState('');
  
  // TAB STATE
  const [seekerActiveTab, setSeekerActiveTab] = useState('overview'); 

  // ✅ MODAL STATES
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); 
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); 

  // Cancel Modal Logic States
  const [appIdToCancel, setAppIdToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('cjl_users')) || [ADMIN_ACCOUNT]);
  const [jobs, setJobs] = useState(() => JSON.parse(localStorage.getItem('cjl_jobs')) || INITIAL_JOBS);
  const [applications, setApplications] = useState(() => JSON.parse(localStorage.getItem('cjl_applications')) || INITIAL_APPLICATIONS);
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem('cjl_messages')) || INITIAL_MESSAGES);
  const [trainings, setTrainings] = useState(INITIAL_TRAININGS);
  const [jobFairs, setJobFairs] = useState(() => JSON.parse(localStorage.getItem('cjl_jobfairs')) || INITIAL_JOB_FAIRS); 
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('cjl_notifications')) || INITIAL_NOTIFICATIONS);
  const [selectedJob, setSelectedJob] = useState(null);
  const [targetChatId, setTargetChatId] = useState(null);

  useEffect(() => { localStorage.setItem('cjl_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('cjl_jobs', JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem('cjl_applications', JSON.stringify(applications)); }, [applications]);
  useEffect(() => { localStorage.setItem('cjl_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('cjl_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('cjl_jobfairs', JSON.stringify(jobFairs)); }, [jobFairs]); 

  const handleNavigate = (view) => {
    if (view === 'notifications') {
      setNotifications(prev => prev.map(n => n.toId === user?.id ? { ...n, read: true } : n));
    }
    if (view === 'seeker-dash') setSeekerActiveTab('overview');
    setPreviousView(currentView); 
    setCurrentView(view);
  };

  const handleViewJobDetails = (job, fromView) => {
      setSelectedJob(job);
      setPreviousView(fromView); 
      setCurrentView('job-details');
  };

  const handleOpenChat = (partnerId) => {
    setTargetChatId(partnerId);
    handleReadMessages(partnerId); 
    setPreviousView(currentView);
    setCurrentView('messages');
  };

  const handleSendMessage = (toId, content) => {
      const newMsg = {
          id: Date.now(),
          fromId: user.id,
          toId: toId,
          senderName: user.name || user.companyName,
          content: content,
          date: new Date().toLocaleDateString(),
          read: false
      };
      setMessages(prev => [newMsg, ...prev]);
  };

  const handleReadMessages = (chatPartnerId) => {
      setMessages(prev => prev.map(m => (m.fromId === chatPartnerId && m.toId === user.id) ? { ...m, read: true } : m));
  };

  const handleLogin = (type, data) => {
    if (type === 'register') {
       const newUser = { id: Date.now(), ...data, isVerified: false, skills: [], education: [], experience: [], licenses: [], languages: [], uploadedDocs: false };
       const welcomeNotif = { id: Date.now() + 1, toId: newUser.id, content: `Welcome to CityJobLink, ${newUser.name}! Please complete your profile.`, read: false, date: Date.now() };
       setNotifications([welcomeNotif, ...notifications]);
       setUsers([...users, newUser]); setUser(newUser); setCurrentView(data.role === 'Seeker' ? 'matchmaker' : 'employer-dash');
    } else {
       const found = users.find(u => u.email === data.email && u.password === data.password);
       if (found) { setUser(found); setCurrentView(found.role === 'Seeker' ? 'matchmaker' : found.role === 'Employer' ? 'employer-dash' : 'admin-dash'); }
       else setLoginError("User not found.");
    }
  };

  const handleUpdateProfile = (updated) => { setUser(updated); setUsers(users.map(u => u.id === updated.id ? updated : u)); };
  
  const handleApply = (jobId) => {
      // 1. LOGIN CHECK MODAL
      if (!user) { 
        setShowLoginModal(true); 
        return; 
      }
      
      // 2. RESUME CHECK MODAL
      if (!user.resumeFile) {
          setShowResumeModal(true); 
          return;
      }

      if (applications.some(a => a.jobId === jobId && a.seekerId === user.id)) return alert("Applied already!");
      
      const newApp = { id: Date.now(), jobId, seekerId: user.id, status: 'Pending', date: new Date().toLocaleDateString() };
      setApplications([...applications, newApp]);

      const job = jobs.find(j => j.id === jobId);
      if (job) {
         const notif = { id: Date.now() + 1, toId: job.employerId, content: `New Applicant: ${user.name} applied for ${job.title}.`, read: false, date: Date.now() };
         setNotifications(prev => [notif, ...prev]);
      }
      
      // ✅ SUCCESS MODAL TRIGGER (Replaced alert)
      setShowSuccessModal(true);
  };

  // Trigger Logic for Cancellation Modal
  const initiateCancelApp = (appId) => {
      setAppIdToCancel(appId);
      setCancelReason(""); 
      setShowCancelModal(true);
  };

  // Confirm Logic (Action)
  const confirmCancelApp = () => {
      if (!appIdToCancel || !cancelReason.trim()) return;

      setApplications(applications.map(a => a.id === appIdToCancel ? { ...a, status: 'Cancelled', cancellationReason: cancelReason } : a));
      
      const app = applications.find(a => a.id === appIdToCancel);
      if (app) {
          const job = jobs.find(j => j.id === app.jobId);
          const notif = {
              id: Date.now(),
              toId: job.employerId,
              content: `Applicant ${user.name} CANCELLED their application for ${job.title}. Reason: "${cancelReason}"`,
              read: false,
              date: Date.now()
          };
          setNotifications(prev => [notif, ...prev]);
      }
      setShowCancelModal(false); 
      setAppIdToCancel(null);
  };

  const handleAddJobFair = (newFairData) => {
      let imageUrl = 'https://via.placeholder.com/400x200?text=Default+Image'; 
      if (newFairData.imageFile) imageUrl = URL.createObjectURL(newFairData.imageFile);
      const fairWithId = { ...newFairData, id: Date.now(), participants: [], image: imageUrl };
      delete fairWithId.imageFile;
      setJobFairs([fairWithId, ...jobFairs]);
  };

  // ✅ UPDATED: Removed alerts
  const handleVerifyEmployer = (empId, isApproved) => {
     if (isApproved) {
        setUsers(users.map(u => u.id === empId ? { ...u, isVerified: true } : u));
        setNotifications(prev => [{ id: Date.now(), toId: empId, content: "Your account has been VERIFIED by Admin. You can now post jobs.", read: false, date: Date.now() }, ...prev]);
        // Alert removed - handled by AdminDashboard Modal
     } else {
        setUsers(users.map(u => u.id === empId ? { ...u, uploadedDocs: false } : u));
        setNotifications(prev => [{ id: Date.now(), toId: empId, content: "Your verification was REJECTED. Please re-upload valid documents.", read: false, date: Date.now() }, ...prev]);
        // Alert removed - handled by AdminDashboard Modal
     }
  };

  const handleUpdateAppStatus = (appId, newStatus, reason) => {
     setApplications(applications.map(a => a.id === appId ? { ...a, status: newStatus, rejectionReason: reason } : a));
     const app = applications.find(a => a.id === appId);
     if (app) {
        const job = jobs.find(j => j.id === app.jobId);
        let content = `Update: Your application for ${job.title} is now ${newStatus}.`;
        if (newStatus === 'Rejected' && reason) content += ` Reason: "${reason}"`;
        setNotifications(prev => [{ id: Date.now(), toId: app.seekerId, content, read: false, date: Date.now() }, ...prev]);
     }
  };

  const renderContent = () => {
     if (!user && currentView === 'login') return <LoginScreen onLogin={handleLogin} loginError={loginError} setLoginError={setLoginError} />;
     if (currentView === 'home') return <LandingPage onNavigate={handleNavigate} />;
     if (currentView === 'resume-builder') return <ResumeBuilderMain user={user} onBack={() => setCurrentView('seeker-dash')} />;

     if (currentView === 'public-trainings') return <PublicListings type="trainings" data={trainings} user={user} onRegister={(id) => setTrainings(trainings.map(t => t.id===id ? {...t, slots:t.slots-1, registeredUsers:[...t.registeredUsers, user.id]} : t))} />;
     if (currentView === 'public-jobfairs') return <PublicListings type="jobfairs" data={jobFairs} user={user} onRegister={(id) => setJobFairs(jobFairs.map(f => f.id===id ? {...f, participants:[...f.participants, user.id]} : f))} />;

     if (currentView === 'seeker-dash') return <SeekerDashboard 
        profile={user} 
        applications={applications} 
        jobs={jobs} 
        trainings={trainings} 
        jobFairs={jobFairs} 
        initialTab={seekerActiveTab} 
        onUpdateProfile={handleUpdateProfile} 
        onUpdateTrainings={(id, uid, act) => setTrainings(trainings.map(t => t.id===id ? (act==='join' ? {...t, slots:t.slots-1, registeredUsers:[...t.registeredUsers, user.id]} : {...t, slots:t.slots+1, registeredUsers:t.registeredUsers.filter(x=>x!==uid)}) : t))} 
        onUpdateFairs={()=>{}} 
        onReviewCompany={()=>{}} 
        onViewJob={(j) => handleViewJobDetails(j, 'seeker-dash')}
        onCancelApplication={initiateCancelApp} 
        onNavigate={setCurrentView} 
     />;
     
     if (currentView === 'employer-dash') return <EmployerDashboard 
        profile={user} 
        jobs={jobs} 
        applications={applications} 
        seekers={users.filter(u=>u.role==='Seeker')} 
        onPostJob={j => {
             const existing = jobs.findIndex(x => x.id === j.id);
             if (existing !== -1) { const newJobs = [...jobs]; newJobs[existing] = j; setJobs(newJobs); } 
             else { setJobs([j,...jobs]); }
        }} 
        onUpdateJob={updated => setJobs(jobs.map(j => j.id === updated.id ? updated : j))} 
        onUpdateProfile={handleUpdateProfile} 
        
        // ✅ FIX: Removed alert("Request Sent") - handled by EmployerDashboard Modal
        onUploadDocs={(id) => {handleUpdateProfile({...user, uploadedDocs:true}); }} 
        
        onOpenChat={handleOpenChat} 
        onUpdateStatus={handleUpdateAppStatus} 
     />;

     if (currentView === 'admin-dash') return <AdminDashboard employers={users.filter(u => u.role === 'Employer')} onVerifyEmployer={handleVerifyEmployer} jobFairs={jobFairs} onAddJobFair={handleAddJobFair} />;
     if (currentView === 'matchmaker') return <MatchmakerSearch jobs={jobs} userProfile={user} onApply={handleApply} onJobClick={(j) => handleViewJobDetails(j, 'matchmaker')} />;
     
     if (currentView === 'job-details') {
        if (!selectedJob) return <div>Loading...</div>;
        return <JobDetailsPage 
            job={selectedJob} 
            matchData={calculateMatchScore(selectedJob.requiredSkills, user?.skills||[])} 
            onBack={() => setCurrentView(previousView)} 
            onApply={handleApply} 
            application={applications.find(a => a.jobId === selectedJob.id && a.seekerId === user?.id)}
            onCancel={initiateCancelApp} 
            hasApplied={applications.some(a => a.jobId === selectedJob.id && a.seekerId === user?.id)} 
        />;
     }

     if (currentView === 'messages') return <MessagesPanel messages={messages} user={user} users={users} onBack={() => setCurrentView(previousView || 'home')} onSendMessage={handleSendMessage} onRead={handleReadMessages} initialChatId={targetChatId} />;
     if (currentView === 'notifications') return <NotificationsPanel notifications={notifications} user={user} onBack={() => setCurrentView(previousView || 'home')} />;
     return <LandingPage onNavigate={handleNavigate} />;
  };

  const unreadNotifs = notifications.filter(n => n.toId === user?.id && !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 relative">
      <Navbar user={user} onLogout={()=>{setUser(null); setCurrentView('home'); setLoginError('')}} onNavigate={handleNavigate} messages={messages} notifications={notifications} unreadNotifs={unreadNotifs} currentView={currentView} />
      {renderContent()}

      {/* 1. RESUME REQUIRED MODAL (Orange) */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in zoom-in duration-200">
                <div className="bg-orange-50 p-6 flex items-center gap-4 border-b border-orange-100">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-full"><AlertCircle size={32} /></div>
                    <div><h3 className="text-xl font-bold text-gray-900">Resume Required</h3><p className="text-sm text-gray-600">You need a resume to apply.</p></div>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">Employers require a resume to review your application. Please upload one or create a new one using our Resume Builder.</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => { setShowResumeModal(false); setSeekerActiveTab('profile & resume'); setCurrentView('seeker-dash'); }} className="w-full bg-black text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-lg"><FileText size={18}/> Go to Resume / Profile</button>
                        <button onClick={() => setShowResumeModal(false)} className="w-full bg-white text-gray-500 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors border">Not Now</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* 2. LOGIN REQUIRED MODAL (Blue) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in zoom-in duration-200">
                <div className="bg-blue-50 p-6 flex flex-col items-center text-center border-b border-blue-100">
                    <div className="p-4 bg-blue-100 text-blue-600 rounded-full mb-4"><LogIn size={40} /></div>
                    <h3 className="text-xl font-bold text-gray-900">Log In First</h3>
                    <p className="text-sm text-gray-600 mt-2">You need an account to apply for jobs and access exclusive features.</p>
                </div>
                <div className="p-6 flex flex-col gap-3">
                    <button onClick={() => { setShowLoginModal(false); setCurrentView('login'); }} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg">Log In / Sign Up</button>
                    <button onClick={() => setShowLoginModal(false)} className="w-full bg-white text-gray-500 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors border">Cancel</button>
                </div>
            </div>
        </div>
      )}

      {/* 3. CANCEL APPLICATION MODAL (Red/Destructive) */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in zoom-in duration-200">
                <div className="bg-red-50 p-6 flex items-center gap-4 border-b border-red-100">
                    <div className="p-3 bg-red-100 text-red-600 rounded-full"><AlertTriangle size={32} /></div>
                    <div><h3 className="text-xl font-bold text-gray-900">Cancel Application?</h3><p className="text-sm text-gray-600">This action cannot be undone.</p></div>
                </div>
                <div className="p-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Why do you want to cancel?</label>
                    <textarea 
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none h-24 resize-none"
                        placeholder="Please state your reason..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                    ></textarea>
                    <div className="mt-6 flex gap-3">
                        <button onClick={confirmCancelApp} disabled={!cancelReason.trim()} className="flex-1 bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors shadow">Confirm Cancel</button>
                        <button onClick={() => { setShowCancelModal(false); setAppIdToCancel(null); }} className="flex-1 bg-white text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors border">Back</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* 4. SUCCESS APPLICATION MODAL (Green) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in zoom-in duration-200">
                <div className="bg-green-50 p-6 flex flex-col items-center text-center border-b border-green-100">
                    <div className="p-4 bg-green-100 text-green-600 rounded-full mb-4">
                        <CheckCircle size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Application Sent!</h3>
                    <p className="text-sm text-gray-600 mt-2">Good luck! The employer has received your application.</p>
                </div>
                <div className="p-6">
                    <button onClick={() => setShowSuccessModal(false)} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg">Awesome</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default App;