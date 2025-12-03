// src/pages/SeekerDashboard.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
// ✅ FIXED IMPORTS: Calendar, Clock, MapPin are essential for Job Fairs tab
import { Edit3, Trash2, X, FileText, UploadCloud, Plus, ChevronLeft, Search, Filter, Star, CheckCircle, XCircle, Calendar, Clock, MapPin, Ticket, Printer, User, Smile } from 'lucide-react';
import { calculateMatchScore } from '../data/mockData';

// --- 1. MATCHMAKER SEARCH (Cards) ---
export const MatchmakerSearch = ({ jobs, userProfile, onJobClick, onApply }) => {
  const [keyword, setKeyword] = useState('');
  
  const processedJobs = useMemo(() => {
    const safeSkills = userProfile?.skills || [];
    return jobs.map(job => ({ ...job, matchData: calculateMatchScore(job.requiredSkills, safeSkills) }))
      .filter(job => {
          const searchTerm = keyword.toLowerCase();
          const title = job.title ? job.title.toLowerCase() : "";
          const company = job.company ? job.company.toLowerCase() : "";
          return title.includes(searchTerm) || company.includes(searchTerm);
      })
      .sort((a, b) => b.matchData.score - a.matchData.score);
  }, [jobs, keyword, userProfile]);

  const recommendedJobs = processedJobs.filter(j => j.matchData.score >= 70);

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
      <aside className="hidden lg:block lg:col-span-1 bg-white rounded-xl p-6 shadow-sm border h-fit sticky top-24">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Filter size={18}/> Smart Filters</h3>
        <div className="text-sm text-gray-600 mb-4">Jobs matching your skills: <br/><span className="font-bold text-cyan-600">{userProfile?.skills?.length > 0 ? userProfile.skills.join(", ") : "No skills listed"}</span></div>
        {userProfile?.skills?.length === 0 && <div className="text-xs text-orange-500 bg-orange-50 p-2 rounded">Tip: Upload a resume to extract skills!</div>}
      </aside>
      <main className="lg:col-span-3 space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border flex gap-2"><Search className="text-gray-400" /><input className="flex-1 outline-none" placeholder="Search by job title..." value={keyword} onChange={e => setKeyword(e.target.value)} /></div>
        
        {recommendedJobs.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4"><Star className="text-cyan-500 fill-cyan-500" size={20} /><h2 className="text-xl font-bold">Jobs for You (Smart Match)</h2></div>
            <div className="grid md:grid-cols-2 gap-4">
                {recommendedJobs.map(job => (
                    <div key={job.id} className="bg-white p-5 rounded-xl shadow-sm border border-cyan-100 hover:border-cyan-400 transition-all relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 bg-cyan-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">{job.matchData.score}% MATCH</div>
                        <div>
                            <h3 className="font-bold text-lg">{job.title}</h3>
                            <p className="text-sm text-gray-500 mb-2">{job.company || "Company Confidential"}</p>
                            <div className="mb-4">
                                <p className="text-xs text-gray-400 mb-1">Matched Skills:</p>
                                <div className="flex flex-wrap gap-1">
                                    {job.matchData.matches.slice(0, 3).map(skill => (
                                        <span key={skill} className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100">{skill}</span>
                                    ))}
                                    {job.matchData.matches.length > 3 && <span className="text-[10px] text-gray-400">+{job.matchData.matches.length - 3} more</span>}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => onJobClick(job)} className="w-full bg-black text-white py-2 rounded-lg text-sm font-bold hover:bg-gray-800">View Details</button>
                    </div>
                ))}
            </div>
          </section>
        )}
        
        <h2 className="text-xl font-bold pt-4 border-t">All Opportunities</h2>
        {processedJobs.map(job => (
            <div key={job.id} className="bg-white p-5 rounded-xl shadow-sm border flex justify-between items-center">
                <div><h3 className="font-bold">{job.title}</h3><p className="text-sm text-gray-500">{job.company || "Company Confidential"}</p></div>
                <button onClick={() => onJobClick(job)} className="border px-4 py-2 rounded hover:bg-gray-50 text-sm font-bold">View Details</button>
            </div>
        ))}
      </main>
    </div>
  );
};

// --- 2. JOB DETAILS PAGE ---
export const JobDetailsPage = ({ job, matchData, onBack, onApply, application, onCancel }) => {
  if (!job) return null;

  const cleanJobSkills = job.requiredSkills.filter(s => s && s.trim() !== "");
  const missingSkills = cleanJobSkills.filter(skill => !matchData.matches.includes(skill));
  const hasRequirements = cleanJobSkills.length > 0;
  const canCancel = application && ['Pending', 'Viewing', 'Interview'].includes(application.status);

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-4 hover:text-black"><ChevronLeft size={20}/> Back</button>
      
      <div className="bg-white p-8 rounded-xl border shadow-sm">
         <div className="flex justify-between items-start">
             <div>
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-lg text-gray-600 mb-4">{job.company || "Company Confidential"}</p>
             </div>
             <div className={`text-center p-3 rounded-lg border ${matchData.score >= 70 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                 <span className="block text-2xl font-bold">{matchData.score}%</span>
                 <span className="text-[10px] uppercase font-bold tracking-wider">Match Score</span>
             </div>
         </div>

         <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-8">
             <h3 className="font-bold text-gray-800 mb-3">Skill Matching Analysis</h3>
             <div className="grid md:grid-cols-2 gap-6">
                 <div>
                     <p className="text-xs font-bold text-green-600 uppercase mb-2 flex items-center gap-1"><CheckCircle size={14}/> You have:</p>
                     <div className="flex flex-wrap gap-2">
                         {matchData.matches.length > 0 ? matchData.matches.map(s => (
                             <span key={s} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">{s}</span>
                         )) : <span className="text-sm text-gray-400 italic">No matching skills found.</span>}
                     </div>
                 </div>
                 <div>
                     <p className="text-xs font-bold text-red-500 uppercase mb-2 flex items-center gap-1"><XCircle size={14}/> Missing:</p>
                     <div className="flex flex-wrap gap-2">
                         {!hasRequirements ? (
                             <span className="text-sm text-gray-500 italic">No specific skills required.</span>
                         ) : missingSkills.length > 0 ? (
                             missingSkills.map(s => (
                                 <span key={s} className="bg-red-50 text-red-600 text-sm px-3 py-1 rounded-full font-medium border border-red-100">{s}</span>
                             ))
                         ) : (
                             <span className="text-sm text-green-600 italic font-medium">None! You're a perfect match.</span>
                         )}
                     </div>
                 </div>
             </div>
         </div>

         {application ? (
             <div className={`mb-8 p-6 rounded-xl border-l-8 shadow-sm ${
                 application.status === 'Rejected' ? 'bg-red-50 border-red-500' :
                 application.status === 'Cancelled' ? 'bg-gray-50 border-gray-400' :
                 'bg-green-50 border-green-500'
             }`}>
                 <div className="flex items-start gap-4">
                     <div className={`p-3 rounded-full ${
                         application.status === 'Rejected' ? 'bg-red-200 text-red-700' :
                         application.status === 'Cancelled' ? 'bg-gray-200 text-gray-600' :
                         'bg-green-200 text-green-700'
                     }`}>
                         {application.status === 'Rejected' ? <XCircle size={32}/> : 
                          application.status === 'Cancelled' ? <XCircle size={32}/> : 
                          <CheckCircle size={32}/>}
                     </div>
                     <div className="flex-1">
                         <h3 className={`text-xl font-bold ${
                             application.status === 'Rejected' ? 'text-red-800' :
                             application.status === 'Cancelled' ? 'text-gray-800' :
                             'text-green-800'
                         }`}>
                             {application.status === 'Pending' ? 'Application Submitted!' :
                              application.status === 'Viewing' ? 'Application Viewed' :
                              application.status === 'Interview' ? 'For Interview' :
                              application.status === 'Hired' ? 'You are Hired! 🎉' :
                              application.status === 'Rejected' ? 'Application Not Selected' :
                              'Application Withdrawn'}
                         </h3>
                         <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">Applied on: {application.date}</p>

                         {application.status === 'Rejected' && application.rejectionReason && (
                             <div className="mt-3 bg-white border border-red-100 p-3 rounded text-sm text-red-700">
                                 <span className="font-bold">Employer's Note:</span> {application.rejectionReason}
                             </div>
                         )}
                         {application.status === 'Cancelled' && application.cancellationReason && (
                             <div className="mt-3 bg-white border border-gray-200 p-3 rounded text-sm text-gray-600">
                                 <span className="font-bold">Your Reason:</span> {application.cancellationReason}
                             </div>
                         )}
                     </div>
                 </div>

                 {canCancel && (
                     <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                         <button 
                            onClick={() => onCancel(application.id)}
                            className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
                         >
                            <Trash2 size={14}/> Withdraw Application
                         </button>
                     </div>
                 )}
             </div>
         ) : (
             <div className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
                 <div>
                     <h3 className="font-bold text-blue-900 text-lg">Interested in this role?</h3>
                     <p className="text-blue-700 text-sm">Make sure your profile is updated before applying.</p>
                 </div>
                 <button onClick={()=>onApply(job.id)} className="bg-black text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-800 shadow-lg transition-all transform hover:scale-105">
                     Apply Now
                 </button>
             </div>
         )}

         <h3 className="font-bold text-lg mb-3 mt-8">Job Description</h3>
         <p className="text-gray-700 mb-8 leading-relaxed whitespace-pre-line">{job.description}</p>
         
         <h3 className="font-bold text-lg mb-3">Job Overview</h3>
         <div className="grid md:grid-cols-2 gap-4 text-sm bg-gray-50 p-5 rounded-xl border">
             <div className="flex justify-between border-b pb-2 border-gray-200">
                 <span className="text-gray-500">Salary Offer</span>
                 <span className="font-bold text-gray-900">{job.salary}</span>
             </div>
             <div className="flex justify-between border-b pb-2 border-gray-200">
                 <span className="text-gray-500">Work Location</span>
                 <span className="font-bold text-gray-900">{job.location}</span>
             </div>
             <div className="flex justify-between border-b pb-2 border-gray-200 md:border-b-0">
                 <span className="text-gray-500">Employment Type</span>
                 <span className="font-bold text-gray-900">{job.type}</span>
             </div>
             <div className="flex justify-between">
                 <span className="text-gray-500">Date Posted</span>
                 <span className="font-bold text-gray-900">{job.posted}</span>
             </div>
         </div>
      </div>
    </div>
  );
};

// --- 3. SEEKER DASHBOARD (Main) ---
const SeekerDashboard = ({ profile, applications, jobs, trainings, jobFairs, initialTab, onUpdateProfile, onUpdateTrainings, onReviewCompany, onViewJob, onCancelApplication, onNavigate }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (initialTab) {
        setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [modalType, setModalType] = useState(null);
  const [tempInput, setTempInput] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fileInputRef = useRef(null);

  const myTrainings = trainings.filter(t => t.registeredUsers.includes(profile.id));
  const myFairs = jobFairs.filter(f => f.participants.includes(profile.id));

  // ✅ UPDATED: File Upload Logic (Converts to Base64)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check size limit (2MB limit dahil sa LocalStorage restriction)
      if (file.size > 2 * 1024 * 1024) {
          alert("File is too large! Please upload a file smaller than 2MB.");
          return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfile({
          ...profile, 
          resumeFile: file.name, 
          resumeType: 'uploaded',
          resumeData: reader.result // ✅ Ito ang nagse-save ng laman ng file
        });
        setShowUploadModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEntry = () => {
    if (modalType === 'review') onReviewCompany(tempInput.appId, tempInput.rating, tempInput.comment);
    setModalType(null); setTempInput({});
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".pdf,.doc,.docx" 
        onChange={handleFileUpload} 
      />

      <div className="flex justify-between items-end mb-6">
        <div>
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-gray-500">Welcome back, {profile.name}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b overflow-x-auto">
        {['overview', 'profile & resume', 'trainings', 'jobfairs'].map(tab => (
            <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`pb-2 px-4 font-medium capitalize whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-cyan-500 text-cyan-600' : 'text-gray-500'}`}
            >
                {tab === 'jobfairs' ? 'My Job Fairs' : tab === 'trainings' ? 'My Trainings' : tab}
            </button>
        ))}
      </div>
      
      {activeTab === 'overview' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold text-lg mb-4">Applications</h3>
            {applications.length === 0 ? <p className="text-gray-500">No applications yet.</p> : applications.map(app => { 
                const job = jobs.find(j => j.id === app.jobId); 
                const canCancel = ['Pending', 'Viewing', 'Interview'].includes(app.status);

                return (
                    <div key={app.id} className="flex justify-between items-start border-b pb-4 mb-4 last:border-0">
                        <div className="flex-1">
                            <h4 className="font-bold text-lg">{job?.title}</h4>
                            <p className="text-sm text-gray-500 mb-1">{job?.company || "Company Confidential"}</p>
                            <button onClick={() => onViewJob(job)} className="text-xs text-blue-600 underline font-bold">View Job Details</button>
                            
                            {app.status === 'Rejected' && app.rejectionReason && (
                                <div className="mt-2 bg-red-50 border border-red-100 p-2 rounded text-xs text-red-700 max-w-md">
                                    <span className="font-bold">Rejection Reason:</span> {app.rejectionReason}
                                </div>
                            )}

                            {app.status === 'Cancelled' && app.cancellationReason && (
                                <div className="mt-2 bg-gray-100 border border-gray-200 p-2 rounded text-xs text-gray-600 max-w-md">
                                    <span className="font-bold">You cancelled this. Reason:</span> {app.cancellationReason}
                                </div>
                            )}
                        </div>
                        
                        <div className="text-right flex flex-col items-end gap-2">
                            <span className={`block text-sm font-bold px-3 py-1 rounded-full ${
                                app.status === 'Hired' ? 'bg-green-100 text-green-800' :
                                app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                app.status === 'Cancelled' ? 'bg-gray-200 text-gray-600' :
                                app.status === 'Interview' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {app.status}
                            </span>

                            {canCancel && (
                                <button 
                                    onClick={() => onCancelApplication(app.id)}
                                    className="text-xs text-red-600 hover:text-red-800 hover:underline font-medium"
                                >
                                    Cancel Application
                                </button>
                            )}

                            {!app.hasReviewed && app.status === 'Hired' && <button onClick={() => {setModalType('review'); setTempInput({appId: app.id})}} className="text-xs border px-3 py-1 rounded mt-2 hover:bg-gray-50">Rate Company</button>}
                        </div>
                    </div>
                ) 
            })}
        </div>
      )}

      {activeTab === 'profile & resume' && (
         <div className="space-y-6">
            
            {/* ✅ NEW: PERSONAL INFORMATION SECTION */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                    <User className="text-cyan-600"/> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-gray-500 text-xs font-bold uppercase mb-1">Full Name</p>
                        <p className="font-bold text-gray-900">{profile.name}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-gray-500 text-xs font-bold uppercase mb-1">QCitizen ID</p>
                        <p className="font-bold text-gray-900">{profile.qcId || "N/A"}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock size={14} className="text-gray-400"/>
                            <p className="text-gray-500 text-xs font-bold uppercase">Birthday</p>
                        </div>
                        <p className="font-bold text-gray-900">
                            {profile.bdayMonth} {profile.bdayDay}, {profile.bdayYear}
                        </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                            <Smile size={14} className="text-gray-400"/>
                            <p className="text-gray-500 text-xs font-bold uppercase">Gender</p>
                        </div>
                        <p className="font-bold text-gray-900">{profile.gender || "Not specified"}</p>
                    </div>
                </div>
            </div>

            {/* EXISTING RESUME SECTION */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <FileText className="text-cyan-600"/> Current Resume
                </h3>
                {profile.resumeFile ? (
                    <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded shadow-sm">
                                <FileText size={32} className="text-red-500"/>
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{profile.resumeFile}</p>
                                <p className="text-xs text-green-700">Ready for applications</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => fileInputRef.current.click()} className="text-sm text-blue-600 font-bold hover:underline">Replace</button>
                            <button onClick={()=>onUpdateProfile({...profile, resumeFile: null})} className="text-sm text-red-500 font-bold hover:underline">Remove</button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 mb-4">No resume uploaded yet.</p>
                        <button onClick={() => fileInputRef.current.click()} className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 flex items-center gap-2 mx-auto">
                            <UploadCloud size={18}/> Upload PDF Resume
                        </button>
                    </div>
                )}
            </div>

            {/* EXISTING BUILDER PROMO */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg text-white p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-bold mb-2">Don't have a resume?</h3>
                    <p className="text-blue-100 max-w-md">Create a professional resume in minutes using our AI-powered builder. Choose from multiple templates, download the PDF, and upload it here.</p>
                </div>
                <button 
                    onClick={() => onNavigate('resume-builder')} 
                    className="bg-white text-blue-700 px-6 py-3 rounded-lg font-bold shadow-md hover:bg-gray-100 transition flex items-center gap-2 whitespace-nowrap"
                >
                    <Edit3 size={18}/> Open Resume Builder
                </button>
            </div>
         </div>
      )}

      {activeTab === 'trainings' && <div className="grid md:grid-cols-2 gap-4">{myTrainings.map(t => <div key={t.id} className="bg-white p-5 rounded border"><h3 className="font-bold">{t.title}</h3><button onClick={()=>onUpdateTrainings(t.id, profile.id, 'leave')} className="text-red-500 text-sm mt-2">Cancel Registration</button></div>)}</div>}
      
      {activeTab === 'jobfairs' && (
        <div className="space-y-4">
            {myFairs.length === 0 ? <p className="text-gray-500 text-center py-8">You haven't registered for any job fairs yet.</p> : myFairs.map(f => (
                <div key={f.id} className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                    <div className="w-full md:w-48 h-40 bg-gray-200 shrink-0 relative"><img src={f.image} alt={f.title} className="w-full h-full object-cover"/></div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2"><h3 className="font-bold text-xl">{f.title}</h3><span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle size={12}/> Going</span></div>
                            <div className="text-sm text-gray-600 space-y-1 mb-4">
                                <div className="flex items-center gap-2"><Calendar size={14} className="text-cyan-600"/> {f.date}</div>
                                <div className="flex items-center gap-2"><Clock size={14} className="text-cyan-600"/> {f.time}</div>
                                <div className="flex items-center gap-2"><MapPin size={14} className="text-cyan-600"/> {f.location}</div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex gap-3"><button onClick={() => setSelectedTicket(f)} className="text-sm font-bold text-blue-600 flex items-center gap-2 hover:bg-blue-50 px-3 py-2 rounded transition-colors"><Ticket size={16}/> View Ticket</button></div>
                    </div>
                </div>
            ))}
        </div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black z-10"><X size={24}/></button>
                <div className="bg-black text-white p-6 text-center relative overflow-hidden">
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rotate-45"></div>
                    <h3 className="font-bold text-lg uppercase tracking-widest opacity-70 mb-1">Digital Entry Pass</h3>
                    <h2 className="text-2xl font-bold relative z-10">{selectedTicket.title}</h2>
                </div>
                <div className="p-8 text-center space-y-6">
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-6 rounded-xl">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Your Queuing Number</p>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter">QF-{selectedTicket.id.toString().slice(-2)}{profile.id.toString().slice(-3)}</h1>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center justify-center gap-2"><Calendar size={16} className="text-cyan-600"/> {selectedTicket.date}</div>
                        <div className="flex items-center justify-center gap-2"><Clock size={16} className="text-cyan-600"/> {selectedTicket.time}</div>
                        <div className="flex items-center justify-center gap-2"><MapPin size={16} className="text-cyan-600"/> {selectedTicket.location}</div>
                    </div>
                    <div className="pt-6 border-t">
                        <button onClick={() => window.print()} className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-black w-full font-medium transition-colors"><Printer size={16}/><span>Print Ticket / Queue Number</span></button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {modalType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
             <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold capitalize">Action</h2><button onClick={()=>setModalType(null)}><X/></button></div>
             <div className="space-y-3">
                {modalType==='summary' && <textarea className="w-full border p-2 rounded h-32" placeholder="Bio..." onChange={e=>setTempInput({...tempInput, bio:e.target.value})}/>}
                {modalType==='review' && <><select className="w-full border p-2" onChange={e=>setTempInput({...tempInput, rating:e.target.value})}><option value="5">5 Stars</option></select><textarea className="w-full border p-2" placeholder="Comment" onChange={e=>setTempInput({...tempInput, comment:e.target.value})}/></>}
                {modalType!=='review' && <button onClick={handleAddEntry} className="bg-black text-white w-full py-2 rounded font-bold">Save</button>}
                {modalType==='review' && <button onClick={handleAddEntry} className="bg-black text-white w-full py-2 rounded font-bold">Submit Review</button>}
             </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in zoom-in duration-200">
                <div className="bg-green-50 p-6 flex flex-col items-center text-center border-b border-green-100">
                    <div className="p-4 bg-green-100 text-green-600 rounded-full mb-4">
                        <CheckCircle size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Resume Uploaded!</h3>
                    <p className="text-sm text-gray-600 mt-2">Your resume has been successfully attached to your profile.</p>
                </div>
                <div className="p-6">
                    <button onClick={() => setShowUploadModal(false)} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg">Great</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default SeekerDashboard;