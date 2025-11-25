// src/App.jsx
import React, { useState, useEffect, useRef } from 'react'; 
import { ChevronLeft, Send, MessageCircle, User, Reply } from 'lucide-react'; 

// Import Components
import Navbar from './components/Navbar';
import LandingPage, { PublicListings } from './pages/LandingPage';
import LoginScreen from './pages/Login';
import SeekerDashboard, { MatchmakerSearch, JobDetailsPage } from './pages/SeekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Import Data
import { ADMIN_ACCOUNT, INITIAL_JOBS, INITIAL_TRAININGS, INITIAL_JOB_FAIRS, INITIAL_APPLICATIONS, INITIAL_MESSAGES, INITIAL_NOTIFICATIONS, calculateMatchScore } from './data/mockData';

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

// MESSAGES PANEL (With Auto-Scroll, Real Names & Self-Chat Filter)
const MessagesPanel = ({ messages, user, users, onBack, onSendMessage, onRead, initialChatId }) => {
  const [activeChatId, setActiveChatId] = useState(initialChatId || null);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialChatId) {
        onRead(initialChatId);
    }
  }, [initialChatId]);

  // 1. Get Contacts, Filter Self, & Find Real Names
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

  // Auto-scroll effect
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
      setMessages(prev => prev.map(m => 
        (m.fromId === chatPartnerId && m.toId === user.id) 
        ? { ...m, read: true } 
        : m
      ));
  };

  const handleLogin = (type, data) => {
    if (type === 'register') {
       const newUser = { id: Date.now(), ...data, isVerified: false, skills: [], education: [], experience: [], licenses: [], languages: [], uploadedDocs: false };
       const welcomeNotif = { 
           id: Date.now() + 1, 
           toId: newUser.id, 
           content: `Welcome to CityJobLink, ${newUser.name}! Please complete your profile.`, 
           read: false, 
           date: Date.now() 
       };
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
     if (!user) { alert("Log in first"); return setCurrentView('login'); }
     if (applications.some(a => a.jobId === jobId && a.seekerId === user.id)) return alert("Applied already!");
     const newApp = { id: Date.now(), jobId, seekerId: user.id, status: 'Pending', date: new Date().toLocaleDateString() };
     setApplications([...applications, newApp]);

     const job = jobs.find(j => j.id === jobId);
     if (job) {
        const notif = {
            id: Date.now() + 1,
            toId: job.employerId,
            content: `New Applicant: ${user.name} applied for ${job.title}.`,
            read: false,
            date: Date.now()
        };
        setNotifications(prev => [notif, ...prev]);
     }
     alert("Application Sent!");
  };

  // Handle Cancellation by Seeker
  const handleCancelApplication = (appId, reason) => {
      setApplications(applications.map(a => a.id === appId ? { ...a, status: 'Cancelled', cancellationReason: reason } : a));
      
      const app = applications.find(a => a.id === appId);
      if (app) {
          const job = jobs.find(j => j.id === app.jobId);
          const notif = {
              id: Date.now(),
              toId: job.employerId,
              content: `Applicant ${user.name} CANCELLED their application for ${job.title}. Reason: "${reason}"`,
              read: false,
              date: Date.now()
          };
          setNotifications(prev => [notif, ...prev]);
          alert("Application Cancelled.");
      }
  };

  // 👇 UPDATED FUNCTION: Add Job Fair (for Admin) with image file handling
  const handleAddJobFair = (newFairData) => {
      // Create a URL for the image file if it exists
      let imageUrl = 'https://via.placeholder.com/400x200?text=Default+Image'; // Fallback
      if (newFairData.imageFile) {
          imageUrl = URL.createObjectURL(newFairData.imageFile);
      }

      const fairWithId = { 
          ...newFairData, 
          id: Date.now(), 
          participants: [],
          image: imageUrl // Store the generated URL
      };
      // Remove the imageFile object from the state to avoid memory leaks or unnecessary storage
      delete fairWithId.imageFile;

      setJobFairs([fairWithId, ...jobFairs]);
      alert("Job Fair Posted Successfully!");
  };

  const handleVerifyEmployer = (empId, isApproved) => {
     if (isApproved) {
        setUsers(users.map(u => u.id === empId ? { ...u, isVerified: true } : u));
        const notif = {
            id: Date.now(),
            toId: empId,
            content: "Your account has been VERIFIED by Admin. You can now post jobs.",
            read: false,
            date: Date.now()
        };
        setNotifications(prev => [notif, ...prev]);
        alert("Employer Approved!");
     } else {
        setUsers(users.map(u => u.id === empId ? { ...u, uploadedDocs: false } : u));
        const notif = {
            id: Date.now(),
            toId: empId,
            content: "Your verification was REJECTED. Please re-upload valid documents.",
            read: false,
            date: Date.now()
        };
        setNotifications(prev => [notif, ...prev]);
        alert("Employer Rejected.");
     }
  };

  const handleUpdateAppStatus = (appId, newStatus, reason) => {
     setApplications(applications.map(a => a.id === appId ? { ...a, status: newStatus, rejectionReason: reason } : a));
     
     const app = applications.find(a => a.id === appId);
     if (app) {
        const job = jobs.find(j => j.id === app.jobId);
        
        let content = `Update: Your application for ${job.title} is now ${newStatus}.`;
        if (newStatus === 'Rejected' && reason) {
            content += ` Reason: "${reason}"`;
        }

        const notif = {
            id: Date.now(),
            toId: app.seekerId,
            content: content,
            read: false,
            date: Date.now()
        };
        setNotifications(prev => [notif, ...prev]);
     }
  };

  const renderContent = () => {
     if (!user && currentView === 'login') return <LoginScreen onLogin={handleLogin} loginError={loginError} setLoginError={setLoginError} />;
     if (currentView === 'home') return <LandingPage onNavigate={handleNavigate} />;
     if (currentView === 'public-trainings') return <PublicListings type="trainings" data={trainings} user={user} onRegister={(id) => setTrainings(trainings.map(t => t.id===id ? {...t, slots:t.slots-1, registeredUsers:[...t.registeredUsers, user.id]} : t))} />;
     if (currentView === 'public-jobfairs') return <PublicListings type="jobfairs" data={jobFairs} user={user} onRegister={(id) => setJobFairs(jobFairs.map(f => f.id===id ? {...f, participants:[...f.participants, user.id]} : f))} />;

     if (currentView === 'seeker-dash') return <SeekerDashboard 
        profile={user} 
        applications={applications} 
        jobs={jobs} 
        trainings={trainings} 
        jobFairs={jobFairs} 
        onUpdateProfile={handleUpdateProfile} 
        onUpdateTrainings={(id, uid, act) => setTrainings(trainings.map(t => t.id===id ? (act==='join' ? {...t, slots:t.slots-1, registeredUsers:[...t.registeredUsers, user.id]} : {...t, slots:t.slots+1, registeredUsers:t.registeredUsers.filter(x=>x!==uid)}) : t))} 
        onUpdateFairs={()=>{}} 
        onReviewCompany={()=>{}} 
        onViewJob={(j) => handleViewJobDetails(j, 'seeker-dash')}
        onCancelApplication={handleCancelApplication} 
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
        onUploadDocs={(id) => {handleUpdateProfile({...user, uploadedDocs:true}); alert("Request Sent")}} 
        onOpenChat={handleOpenChat} 
        onUpdateStatus={handleUpdateAppStatus} 
     />;

     if (currentView === 'admin-dash') return <AdminDashboard 
        employers={users.filter(u => u.role === 'Employer')} 
        onVerifyEmployer={handleVerifyEmployer}
        jobFairs={jobFairs} 
        onAddJobFair={handleAddJobFair}
     />;
     
     if (currentView === 'matchmaker') return <MatchmakerSearch 
        jobs={jobs} 
        userProfile={user} 
        onApply={handleApply} 
        onJobClick={(j) => handleViewJobDetails(j, 'matchmaker')}
     />;
     
     if (currentView === 'job-details') {
        if (!selectedJob) return <div>Loading...</div>;
        return <JobDetailsPage 
            job={selectedJob} 
            matchData={calculateMatchScore(selectedJob.requiredSkills, user?.skills||[])} 
            onBack={() => setCurrentView(previousView)} 
            onApply={handleApply} 
            application={applications.find(a => a.jobId === selectedJob.id && a.seekerId === user?.id)}
            onCancel={handleCancelApplication}
            hasApplied={applications.some(a => a.jobId === selectedJob.id && a.seekerId === user?.id)} 
        />;
     }

     if (currentView === 'messages') return <MessagesPanel 
         messages={messages} 
         user={user}
         users={users} 
         onBack={() => setCurrentView(previousView || 'home')} 
         onSendMessage={handleSendMessage}
         onRead={handleReadMessages}
         initialChatId={targetChatId} 
     />;

     if (currentView === 'notifications') return <NotificationsPanel notifications={notifications} user={user} onBack={() => setCurrentView(previousView || 'home')} />;
     return <LandingPage onNavigate={handleNavigate} />;
  };

  const unreadNotifs = notifications.filter(n => n.toId === user?.id && !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar 
        user={user} 
        onLogout={()=>{setUser(null); setCurrentView('home'); setLoginError('')}} 
        onNavigate={handleNavigate} 
        messages={messages} 
        notifications={notifications}
        unreadNotifs={unreadNotifs}
        currentView={currentView} 
      />
      {renderContent()}
    </div>
  );
};

export default App;