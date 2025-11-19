// src/App.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';

// Import Components
import Navbar from './components/Navbar';
import LandingPage, { PublicListings } from './pages/LandingPage';
import LoginScreen from './pages/Login';
import SeekerDashboard, { MatchmakerSearch, JobDetailsPage } from './pages/SeekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Import Data
import { ADMIN_ACCOUNT, INITIAL_JOBS, INITIAL_TRAININGS, INITIAL_JOB_FAIRS, INITIAL_APPLICATIONS, INITIAL_MESSAGES, calculateMatchScore } from './data/mockData';

const MessagesPanel = ({ messages, user, onBack }) => (
  <div className="max-w-4xl mx-auto p-6"><button onClick={onBack} className="flex items-center gap-2 mb-4"><ChevronLeft/> Back</button><h1 className="text-2xl font-bold mb-4">Messages</h1>{messages.filter(m=>m.toId===user.id).map(m=><div key={m.id} className="p-4 border-b bg-white"><h4 className="font-bold">{m.senderName}</h4><p>{m.content}</p></div>)}</div>
);

const App = () => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [loginError, setLoginError] = useState('');
  
  // LocalStorage Persistence
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('cjl_users')) || [ADMIN_ACCOUNT]);
  const [jobs, setJobs] = useState(() => JSON.parse(localStorage.getItem('cjl_jobs')) || INITIAL_JOBS);
  const [applications, setApplications] = useState(() => JSON.parse(localStorage.getItem('cjl_applications')) || INITIAL_APPLICATIONS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [trainings, setTrainings] = useState(INITIAL_TRAININGS);
  const [jobFairs, setJobFairs] = useState(INITIAL_JOB_FAIRS);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => { localStorage.setItem('cjl_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('cjl_jobs', JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem('cjl_applications', JSON.stringify(applications)); }, [applications]);

  const handleLogin = (type, data) => {
    if (type === 'register') {
       const newUser = { id: Date.now(), ...data, isVerified: false, skills: [], education: [], experience: [], licenses: [], languages: [], uploadedDocs: false };
       setUsers([...users, newUser]); setUser(newUser); setCurrentView(data.role === 'Seeker' ? 'matchmaker' : 'employer-dash');
    } else {
       const found = users.find(u => u.email === data.email && u.password === data.password);
       if (found) { setUser(found); setCurrentView(found.role === 'Seeker' ? 'matchmaker' : found.role === 'Employer' ? 'employer-dash' : 'admin-dash'); }
       else setLoginError("User not found.");
    }
  };

  const handleUpdateProfile = (updated) => { setUser(updated); setUsers(users.map(u => u.id === updated.id ? updated : u)); };
  
  // --- DITO ANG UPDATE PARA SA LOG IN FIRST ALERT ---
  const handleApply = (jobId) => {
     if (!user) {
        alert("Log in first"); // Added alert here
        return setCurrentView('login');
     }
     if (applications.some(a => a.jobId === jobId && a.seekerId === user.id)) return alert("Applied already!");
     const newApp = { id: Date.now(), jobId, seekerId: user.id, status: 'Pending', date: new Date().toLocaleDateString() };
     setApplications([...applications, newApp]);
     alert("Application Sent!");
  };

  const handleVerifyEmployer = (empId, isApproved) => {
     if (isApproved) {
        setUsers(users.map(u => u.id === empId ? { ...u, isVerified: true } : u));
        alert("Employer Approved!");
     } else {
        setUsers(users.map(u => u.id === empId ? { ...u, uploadedDocs: false } : u));
        alert("Employer Rejected. They need to re-upload documents.");
     }
  };

  const handleUpdateAppStatus = (appId, newStatus) => {
     setApplications(applications.map(a => a.id === appId ? { ...a, status: newStatus } : a));
  };

  const renderContent = () => {
     // Fix navigation flow
     if (!user && currentView === 'login') return <LoginScreen onLogin={handleLogin} loginError={loginError} setLoginError={setLoginError} />;
     
     if (currentView === 'home') return <LandingPage onNavigate={setCurrentView} />;
     
     if (currentView === 'public-trainings') return <PublicListings type="trainings" data={trainings} user={user} onRegister={(id) => setTrainings(trainings.map(t => t.id===id ? {...t, slots:t.slots-1, registeredUsers:[...t.registeredUsers, user.id]} : t))} />;
     if (currentView === 'public-jobfairs') return <PublicListings type="jobfairs" data={jobFairs} user={user} onRegister={(id) => setJobFairs(jobFairs.map(f => f.id===id ? {...f, participants:[...f.participants, user.id]} : f))} />;

     if (currentView === 'seeker-dash') return <SeekerDashboard profile={user} applications={applications} jobs={jobs} trainings={trainings} jobFairs={jobFairs} onUpdateProfile={handleUpdateProfile} onUpdateTrainings={(id, uid, act) => setTrainings(trainings.map(t => t.id===id ? (act==='join' ? {...t, slots:t.slots-1, registeredUsers:[...t.registeredUsers, uid]} : {...t, slots:t.slots+1, registeredUsers:t.registeredUsers.filter(x=>x!==uid)}) : t))} onUpdateFairs={()=>{}} onReviewCompany={()=>{}} onViewJob={(j) => {setSelectedJob(j); setCurrentView('job-details')}}/>;
     
     if (currentView === 'employer-dash') return <EmployerDashboard profile={user} jobs={jobs} applications={applications} seekers={users.filter(u=>u.role==='Seeker')} onPostJob={j => {
         const existing = jobs.findIndex(x => x.id === j.id);
         if (existing !== -1) {
             const newJobs = [...jobs];
             newJobs[existing] = j;
             setJobs(newJobs);
         } else {
             setJobs([j,...jobs]);
         }
     }} onUpdateJob={updated => setJobs(jobs.map(j => j.id === updated.id ? updated : j))} onUpdateProfile={handleUpdateProfile} onUploadDocs={(id) => {handleUpdateProfile({...user, uploadedDocs:true}); alert("Request Sent")}} onSendMessage={()=>{}} onUpdateStatus={handleUpdateAppStatus} />;
     
     if (currentView === 'admin-dash') return <AdminDashboard employers={users.filter(u => u.role === 'Employer')} onVerifyEmployer={handleVerifyEmployer} />;
     
     // Updated logic for job details to handle non-logged in users viewing details from matchmaker/home
     if (currentView === 'matchmaker') return <MatchmakerSearch jobs={jobs} userProfile={user} onApply={handleApply} onJobClick={(j) => {setSelectedJob(j); setCurrentView('job-details')}}/>;
     
     if (currentView === 'job-details') {
        if (!selectedJob) return <div>Loading...</div>;
        return <JobDetailsPage job={selectedJob} matchData={calculateMatchScore(selectedJob.requiredSkills, user?.skills||[])} onBack={() => setCurrentView(user ? 'matchmaker' : 'home')} onApply={handleApply} hasApplied={applications.some(a => a.jobId === selectedJob.id && a.seekerId === user?.id)} />;
     }
     if (currentView === 'messages') return <MessagesPanel messages={messages} user={user} onBack={() => setCurrentView('home')} />;
     
     return <LandingPage onNavigate={setCurrentView} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar user={user} onLogout={()=>{setUser(null); setCurrentView('home'); setLoginError('')}} onNavigate={setCurrentView} messages={messages} currentView={currentView} />
      {renderContent()}
    </div>
  );
};

export default App;