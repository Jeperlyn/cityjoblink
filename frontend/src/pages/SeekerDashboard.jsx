// src/pages/SeekerDashboard.jsx
import React, { useState, useEffect, useRef } from 'react'; 
import { 
  Trash2, FileText, ChevronDown, ChevronUp, ChevronLeft, Search, 
  Briefcase, Info, User, Users, Lock, CheckCircle, XCircle, 
  Star, Target, Zap, TrendingUp, Upload, FilePlus, 
  ExternalLink, Clock, MapPin, FileCheck, X, AlertCircle
} from 'lucide-react';

// =====================================================
// 1. COMPONENT: APPLICATION PROGRESS STEPPER
// =====================================================
const ApplicationProcessSteps = ({ status }) => {
  const steps = [
    { id: 'Pending', label: 'Pending', icon: <FileText size={14}/> },
    { id: 'Viewing', label: 'Viewing', icon: <Target size={14}/> },
    { id: 'Interview', label: 'Interview', icon: <Zap size={14}/> },
    { id: 'Decision', label: 'Decision', icon: <TrendingUp size={14}/> }
  ];

  const getStepStatus = (stepId, currentStatus) => {
    const statusOrder = ['Pending', 'Viewing', 'Interview', 'Hired', 'Rejected', 'Cancelled'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentStatus === 'Cancelled') return 'bg-gray-100 text-gray-300 border-gray-200';
    
    if (stepId === 'Decision') {
      if (currentStatus === 'Hired') return 'bg-green-500 text-white border-green-500';
      if (currentStatus === 'Rejected') return 'bg-red-500 text-white border-red-500';
      return 'bg-gray-50 text-gray-300 border-gray-100';
    }

    if (stepId === currentStatus) return 'bg-cyan-600 text-white border-cyan-600 shadow-lg scale-110 z-10';
    if (statusOrder.indexOf(stepId) < currentIndex) return 'bg-cyan-600 text-white border-cyan-600';
    return 'bg-gray-50 text-gray-300 border-gray-100';
  };

  return (
    <div className="w-full py-10">
      <div className="flex items-center justify-between relative px-2">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full"></div>
        {steps.map((step) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-3 bg-white px-2">
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${getStepStatus(step.id, status)}`}>
              {step.icon}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${step.id === status ? 'text-cyan-700' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// =====================================================
// 2. COMPONENT: MATCH DETAILS PAGE (Skill Analysis)
// =====================================================
export const JobDetailsPage = ({ job, matchData, onBack }) => {
  if (!job) return <div className="p-20 text-center font-black">Job data not found.</div>;
  
  // Defensive check for matchData
  const matches = matchData?.matches || [];
  const score = matchData?.score || 0;
  const missingSkills = (job.requiredSkills || []).filter(skill => !matches.includes(skill));

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-black transition-all font-black text-xs uppercase tracking-widest mb-8">
        <ChevronLeft size={20}/> Back to Dashboard
      </button>

      <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-12 border-b border-gray-50 bg-gradient-to-br from-white to-gray-50/50 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">{job.title}</h1>
            <p className="text-xl font-bold text-cyan-600 uppercase tracking-widest">{job.company}</p>
          </div>
          <div className="text-center bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-50">
             <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Match Rate</p>
             <p className={`text-4xl font-black ${score >= 70 ? 'text-green-500' : 'text-orange-500'}`}>{score}%</p>
          </div>
        </div>

        <div className="p-12 grid md:grid-cols-2 gap-8">
          <div className="bg-green-50/50 p-8 rounded-[2.5rem] border border-green-100">
            <h4 className="flex items-center gap-2 text-[10px] font-black text-green-600 uppercase mb-4"><CheckCircle size={14}/> Matched Skills</h4>
            <div className="flex flex-wrap gap-2">
              {matches.length > 0 ? matches.map((s, i) => <span key={i} className="bg-white text-gray-800 text-xs font-bold px-4 py-2 rounded-xl border border-green-100 shadow-sm">{s}</span>) : <p className="text-xs text-gray-400 italic">No matches found</p>}
            </div>
          </div>
          <div className="bg-red-50/50 p-8 rounded-[2.5rem] border border-red-100">
            <h4 className="flex items-center gap-2 text-[10px] font-black text-red-400 uppercase mb-4"><XCircle size={14}/> Missing Skills</h4>
            <div className="flex flex-wrap gap-2">
              {missingSkills.length > 0 ? missingSkills.map((s, i) => <span key={i} className="bg-white text-gray-400 text-xs font-medium px-4 py-2 rounded-xl border border-red-50 italic">{s}</span>) : <p className="text-xs text-gray-400 italic">No missing skills</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// 3. COMPONENT: FIND JOBS (The Job Listings)
// =====================================================
export const FindJobs = ({ jobs = [], onApply, applications = [], userId }) => {
  const [keyword, setKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  // Extract unique locations and types from jobs
  const locations = [...new Set(jobs.map(j => j.location).filter(Boolean))].sort();
  const types = [...new Set(jobs.map(j => j.type).filter(Boolean))].sort();
  
  const filtered = jobs.filter(j => {
    const matchesKeyword = j.title.toLowerCase().includes(keyword.toLowerCase()) || j.company.toLowerCase().includes(keyword.toLowerCase());
    const matchesLocation = !selectedLocation || j.location === selectedLocation;
    const matchesType = !selectedType || j.type === selectedType;
    return matchesKeyword && matchesLocation && matchesType;
  });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Keyword Search */}
        <div className="relative">
          <Search className="absolute left-5 top-5 text-gray-300" size={24}/>
          <input value={keyword} onChange={e => setKeyword(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm outline-none focus:ring-2 focus:ring-cyan-500 font-medium" placeholder="Search positions..."/>
        </div>
        
        {/* Location and Type Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase mb-2 block">Location</label>
            <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-100 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-cyan-500 font-medium text-gray-900">
              <option value="">All Locations</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase mb-2 block">Job Type</label>
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-100 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-cyan-500 font-medium text-gray-900">
              <option value="">All Types</option>
              {types.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </div>
        
        {/* Results count */}
        <div className="text-xs font-bold text-gray-500 uppercase">
          Showing {filtered.length} of {jobs.length} positions
        </div>
      </div>
      <div className="grid gap-4">
        {filtered.map(job => {
          const isExp = expandedId === job.id;
          const hasApp = applications.some(a => a.jobId === job.id && a.seekerId === userId);
          return (
            <div key={job.id} className={`bg-white rounded-[2.5rem] border transition-all ${isExp ? 'border-cyan-200 shadow-xl' : 'border-gray-50 shadow-sm'}`}>
              <div className="p-8 flex justify-between items-center">
                <div className="flex gap-6 items-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isExp ? 'bg-cyan-600 text-white' : 'bg-gray-50 text-gray-400'}`}><Briefcase size={28}/></div>
                  <div><h3 className="font-black text-xl text-gray-900">{job.title}</h3><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{job.company}</p></div>
                </div>
                <button onClick={() => setExpandedId(isExp ? null : job.id)} className="text-xs font-black uppercase text-cyan-600 bg-cyan-50 px-6 py-3 rounded-2xl">{isExp ? <ChevronUp size={20}/> : 'View Details'}</button>
              </div>
              {isExp && (
                <div className="px-10 pb-12 pt-2 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-gray-100 mb-8 font-black text-sm uppercase">
                    <div><p className="text-gray-400 text-[10px]">Location</p><p>{job.location}</p></div>
                    <div><p className="text-gray-400 text-[10px]">Salary</p><p>{job.salary}</p></div>
                  </div>
                  <p className="mb-10 text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
                  {!hasApp ? <button onClick={() => onApply(job.id)} className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-black">Apply Now</button> : <div className="w-full bg-green-50 text-green-700 py-5 rounded-[2rem] font-black text-center border border-green-100 uppercase tracking-widest">Application Submitted</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =====================================================
// 4. COMPONENT: DASHBOARD OVERVIEW (Tracker)
// =====================================================
export const DashboardOverview = ({ applications = [], jobs = [], onCancelApplication, onViewJob }) => {
  const [withdrawModal, setWithdrawModal] = useState({ isOpen: false, appId: null });
  const [reason, setReason] = useState("");

  const activeApps = applications.filter(a => a.status !== 'Cancelled');
  const withdrawnApps = applications.filter(a => a.status === 'Cancelled');

  return (
    <div className="space-y-12 animate-in fade-in">
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <Briefcase className="text-cyan-600" size={28}/> Active Applications
        </h2>
        <div className="grid grid-cols-1 gap-6 mt-4">
          {activeApps.length === 0 ? (
            <div className="bg-white p-20 rounded-[3rem] border border-dashed text-center text-gray-400 uppercase font-bold">
              No active applications
            </div>
          ) : (
            activeApps.map(app => {
              const job = jobs.find(j => j.id === app.jobId);
              const canWithdraw = ['Pending', 'Viewing'].includes(app.status);
              return (
                <div key={app.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-2xl tracking-tighter">{job?.title}</h3>
                      <p className="text-sm font-bold text-cyan-600 uppercase tracking-widest">{job?.company}</p>
                    </div>
                    {canWithdraw ? (
                      <button onClick={() => setWithdrawModal({ isOpen: true, appId: app.id })} className="p-4 bg-red-50 text-red-500 rounded-3xl hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={22}/>
                      </button>
                    ) : (
                      <div className="p-4 bg-gray-50 text-gray-300 rounded-3xl border border-gray-100">
                        <Lock size={22}/>
                      </div>
                    )}
                  </div>
                  <ApplicationProcessSteps status={app.status} />
                  <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-50">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Applied: {app.date}</span>
                    <button onClick={() => onViewJob(job)} className="text-xs font-black uppercase text-cyan-600 bg-cyan-50 px-6 py-3 rounded-2xl hover:bg-cyan-600 hover:text-white transition-all">View Match Metrics</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {withdrawnApps.length > 0 && (
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <Trash2 className="text-red-500" size={28}/> Withdrawn Applications
          </h2>
          <div className="grid grid-cols-1 gap-6 mt-4">
            {withdrawnApps.map(app => {
              const job = jobs.find(j => j.id === app.jobId);
              return (
                <div key={app.id} className="bg-white p-10 rounded-[3rem] border border-gray-200 shadow-sm opacity-70">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-2xl tracking-tighter line-through">{job?.title}</h3>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{job?.company}</p>
                    </div>
                    <div className="p-4 bg-gray-50 text-gray-300 rounded-3xl border border-gray-100">
                      <Lock size={22}/>
                    </div>
                  </div>
                  <ApplicationProcessSteps status={app.status} />
                  <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-50">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Applied: {app.date}</span>
                    <button disabled className="text-xs font-black uppercase text-gray-400 bg-gray-50 px-6 py-3 rounded-2xl">Withdrawn</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {withdrawModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black mb-4">Confirm Withdrawal</h3>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-5 bg-gray-50 rounded-2xl h-32 mb-8 outline-none border-none shadow-inner" placeholder="Reason..."/>
            <div className="flex gap-4"><button onClick={() => setWithdrawModal({isOpen: false})} className="flex-1 py-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Cancel</button><button onClick={() => { onCancelApplication(withdrawModal.appId, reason); setWithdrawModal({isOpen: false}); }} className="flex-1 py-4 bg-red-500 text-white rounded-2xl text-sm font-black uppercase shadow-xl">Confirm</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================================
// 5. COMPONENTS: TRAININGS & JOB FAIRS
// =====================================================

// Helper: Check if withdrawal is allowed (at least 1 week before event)
const canWithdraw = (eventDate) => {
  if (!eventDate) return true;
  try {
    const event = new Date(eventDate);
    const today = new Date();
    const daysUntilEvent = Math.ceil((event - today) / (1000 * 60 * 60 * 24));
    return daysUntilEvent >= 7; // Allow withdrawal only if 7+ days before event
  } catch (e) {
    return true;
  }
};

export const MyTrainings = ({ trainings = [], profile, onWithdrawTraining }) => {
    const registered = trainings.filter(t => t.registeredUsers?.includes(profile?.id));
    return (
        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in">
            {registered.length === 0 ? (
                <div className="col-span-full bg-white p-16 rounded-[3rem] border border-dashed text-center text-gray-400 font-black uppercase tracking-widest">
                    No Registered Trainings
                </div>
            ) : (
                registered.map(t => (
                    <div key={t.id} className="bg-white p-8 rounded-[2.5rem] border border-cyan-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <p className="font-black text-gray-900 text-lg tracking-tight mb-1">{t.title}</p>
                                {t.provider && <p className="text-xs text-gray-500 font-bold uppercase">{t.provider}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                                {onWithdrawTraining && canWithdraw(t.date) && (
                                    <button
                                        onClick={() => onWithdrawTraining(t.id)}
                                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                        title="Withdraw (must be 7 days before event)"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                {onWithdrawTraining && !canWithdraw(t.date) && (
                                    <div className="p-2 bg-gray-50 text-gray-300 rounded-lg" title="Withdrawal not allowed (less than 7 days before event)">
                                        <Lock size={16} />
                                    </div>
                                )}
                                <div className="bg-cyan-100 text-cyan-700 p-2 rounded-full flex-shrink-0">
                                    <CheckCircle size={20} className="font-bold" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                            {t.date && (
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-cyan-600" />
                                    <span className="font-medium">{t.date}</span>
                                </div>
                            )}
                            {t.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-cyan-600" />
                                    <span className="font-medium">{t.location}</span>
                                </div>
                            )}
                            {t.slots != null && (
                                <div className="flex items-center gap-2">
                                    <Users size={14} className="text-cyan-600" />
                                    <span className="font-medium">{t.slots} slots available</span>
                                </div>
                            )}
                        </div> 
                        
                        <div className="flex items-center justify-between pt-3 border-t border-cyan-100">
                            <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle size={12} /> Enrollment Confirmed
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export const MyJobFairs = ({ jobFairs = [], profile, onWithdrawJobFair }) => {
    const joined = jobFairs.filter(f => f.participants?.includes(profile?.id));
    return (
        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in">
            {joined.length === 0 ? (
                <div className="col-span-full bg-white p-16 rounded-[3rem] border border-dashed text-center text-gray-400 font-black uppercase tracking-widest">
                    No Registered Job Fairs
                </div>
            ) : (
                joined.map(f => (
                    <div key={f.id} className="bg-white p-8 rounded-[2.5rem] border border-cyan-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <p className="font-black text-gray-900 text-lg tracking-tight mb-1">{f.title}</p>
                                {f.organizer && <p className="text-xs text-gray-500 font-bold uppercase">{f.organizer}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                                {onWithdrawJobFair && canWithdraw(f.date) && (
                                    <button
                                        onClick={() => onWithdrawJobFair(f.id)}
                                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                        title="Withdraw (must be 7 days before event)"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                {onWithdrawJobFair && !canWithdraw(f.date) && (
                                    <div className="p-2 bg-gray-50 text-gray-300 rounded-lg" title="Withdrawal not allowed (less than 7 days before event)">
                                        <Lock size={16} />
                                    </div>
                                )}
                                <div className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full flex-shrink-0">
                                    <CheckCircle size={18} className="font-bold" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                            {f.date && (
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-cyan-600" />
                                    <span className="font-medium">{f.date}</span>
                                </div>
                            )}
                            {f.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-cyan-600" />
                                    <span className="font-medium">{f.location}</span>
                                </div>
                            )}
                        </div>
                        
                        {f.companies && f.companies.length > 0 && (
                            <div className="mb-4">
                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Companies Attending</p>
                                <div className="flex flex-wrap gap-1">
                                    {f.companies.slice(0, 3).map((c, idx) => (
                                        <span key={idx} className="text-[10px] bg-cyan-50 text-cyan-600 px-2 py-1 rounded font-bold">{c}</span>
                                    ))}
                                    {f.companies.length > 3 && <span className="text-[10px] text-gray-500">+{f.companies.length - 3} more</span>}
                                </div>
                            </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-3 border-t border-cyan-100">
                            <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle size={12} /> Slot Confirmed
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

// =====================================================
// 6. MAIN DEFAULT EXPORT (Integrated Layout)
// =====================================================
const SeekerDashboard = ({ profile, applications = [], jobs = [], trainings = [], jobFairs = [], initialTab, onCancelApplication, onViewJob, onNavigate, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [resumeFile, setResumeFile] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [withdrawModal, setWithdrawModal] = useState({ isOpen: false, type: null, id: null, title: '' });
  const fileInputRef = useRef(null);

  const birthdayDisplay = profile?.birthdayDisplay
    || profile?.birthday_display
    || (profile?.bday_month && profile?.bday_day && profile?.bday_year
      ? `${profile.bday_month} ${profile.bday_day}, ${profile.bday_year}`
      : null);

  useEffect(() => { if (initialTab) setActiveTab(initialTab); }, [initialTab]);

  useEffect(() => {
    if (profile?.resume_path) {
      const segments = profile.resume_path.split('/');
      const fileName = segments[segments.length - 1] || 'resume.pdf';
      setResumeFile({ name: fileName, fromServer: true });
      return;
    }

    setResumeFile(null);
  }, [profile?.resume_path]);

  // Withdraw from training
  const handleWithdrawTraining = (trainingId) => {
    const training = trainings.find(t => t.id === trainingId);
    setWithdrawModal({
      isOpen: true,
      type: 'training',
      id: trainingId,
      title: training?.title || 'Training'
    });
  };

  // Withdraw from job fair
  const handleWithdrawJobFair = (jobFairId) => {
    const jobFair = jobFairs.find(f => f.id === jobFairId);
    setWithdrawModal({
      isOpen: true,
      type: 'jobfair',
      id: jobFairId,
      title: jobFair?.title || 'Job Fair'
    });
  };

  // Confirm withdrawal
  const handleConfirmWithdrawal = () => {
    // Withdrawal logic would be implemented here
    // This would typically be handled by the parent App component
    setWithdrawModal({ isOpen: false, type: null, id: null, title: '' });
  };

const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const userEmail = profile?.email;
  if (!userEmail) {
    alert('Missing account email. Please log in again before uploading.');
    return;
  }

  // Instantly update the UI so the user sees the file
  setResumeFile(file);

  // Package the file for the Laravel API
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('email', userEmail);

  try {
    const response = await fetch('http://localhost:8000/api/upload/resume', {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to save to backend');
    console.log('Success:', data.message);

    if (typeof onUpdateProfile === 'function' && data?.user) {
      onUpdateProfile(data.user);
    }
    
    // 🌟 Trigger the CityJobLink Toast!
    setToastMessage('Resume securely saved to profile!');
    
    // Auto-dismiss the toast after 3.5 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);

  } catch (error) {
    console.error('Upload Error:', error);
    // You could also trigger an error toast here if you wanted!
    alert(error?.message || 'Failed to upload resume to server. Please try again.');
  }
};

const handleRemoveResume = async () => {
  const confirmed = window.confirm('Are you sure you want to delete your uploaded resume? This will remove the stored PDF and parsed data.');
  if (!confirmed) {
    return;
  }

  const userEmail = profile?.email;
  if (!userEmail) {
    alert('Missing account email. Please log in again before deleting your resume.');
    return;
  }

  try {
    const response = await fetch('http://localhost:8000/api/upload/resume', {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: userEmail })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to remove resume');

    setResumeFile(null);
    if (typeof onUpdateProfile === 'function' && data?.user) {
      onUpdateProfile(data.user);
    }

    setToastMessage('Resume removed from profile.');
    setTimeout(() => setToastMessage(null), 3500);
  } catch (error) {
    console.error('Delete Resume Error:', error);
    alert(error?.message || 'Failed to remove resume. Please try again.');
  }
};

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-10"><h1 className="text-6xl font-black text-gray-900 tracking-tighter">CityJobLink</h1></header>
        
        {/* TABS: Gamit ang lowercase exact matching para sigurado ang click event */}
        <nav className="flex gap-2 mb-16 bg-white p-3 rounded-full border border-gray-100 shadow-sm w-fit overflow-x-auto mx-auto md:mx-0">
          {['overview', 'trainings', 'job fairs', 'profile'].map(tab => (
            <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`px-12 py-5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-gray-900 text-white shadow-2xl scale-110' : 'text-gray-400 hover:text-gray-900'}`}
            >
              {tab === 'trainings' ? 'Trainings' : tab}
            </button>
          ))}
        </nav>

        {activeTab === 'overview' && <DashboardOverview applications={applications} jobs={jobs} onCancelApplication={onCancelApplication} onViewJob={onViewJob} />}
        {activeTab === 'trainings' && <MyTrainings trainings={trainings} profile={profile} onWithdrawTraining={handleWithdrawTraining} />}
        {activeTab === 'job fairs' && <MyJobFairs jobFairs={jobFairs} profile={profile} onWithdrawJobFair={handleWithdrawJobFair} />}
        
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-12 rounded-[3.5rem] border shadow-sm">
              <h3 className="font-black text-3xl mb-10 flex items-center gap-4"><User size={32} className="text-cyan-500"/> Account Profile</h3>
              {birthdayDisplay && (
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8">
                  Birthday: {birthdayDisplay}
                </p>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Resume Builder */}
                <button onClick={() => onNavigate('resume-builder')} className="p-10 border-2 border-cyan-100 rounded-[2.5rem] hover:bg-cyan-50 transition-all text-left group">
                  <div className="bg-cyan-100 text-cyan-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><FilePlus size={24}/></div>
                  <h4 className="font-black text-xl mb-2">Resume Builder</h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">Create an optimized resume.</p>
                </button>

                {/* Resume Upload Module with Visual Holder */}
                <div className="p-10 border-2 border-dashed border-gray-200 rounded-[2.5rem] hover:bg-gray-50 transition-all text-left">
                  <div className="bg-gray-100 text-gray-400 w-12 h-12 rounded-2xl flex items-center justify-center mb-6"><Upload size={24}/></div>
                  <h4 className="font-black text-xl mb-2">Upload Resume</h4>
                  
                  {!resumeFile ? (
                    <>
                        <p className="text-xs text-gray-500 font-medium mb-6">Already have a file? Upload PDF.</p>
                        <button onClick={() => fileInputRef.current.click()} className="text-xs font-black text-cyan-600 uppercase tracking-widest hover:underline">Select File</button>
                    </>
                  ) : (
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm animate-in zoom-in">
                        <div className="flex items-center gap-3">
                            <FileCheck className="text-green-500" size={20}/>
                            <div className="overflow-hidden">
                                <p className="text-xs font-black text-gray-800 truncate max-w-[120px]">{resumeFile.name}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">PDF Document</p>
                            </div>
                        </div>
                        <button onClick={handleRemoveResume} className="p-2 hover:bg-red-50 text-red-400 rounded-full transition-colors"><X size={16}/></button>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileUpload} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Withdrawal Modal for Trainings & Job Fairs */}
        {withdrawModal.isOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-black mb-2">Confirm Withdrawal</h3>
              <p className="text-sm text-gray-600 mb-6">
                You are about to withdraw from <span className="font-bold">{withdrawModal.title}</span>. This will free up your slot for others.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-xs text-yellow-800">
                <p className="font-bold mb-1">⚠️ Important</p>
                <p>Withdrawals are only allowed up to 1 week before the event. After that, the slot cannot be released.</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setWithdrawModal({ isOpen: false, type: null, id: null, title: '' })}
                  className="flex-1 py-3 text-sm font-bold text-gray-600 uppercase tracking-widest border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmWithdrawal}
                  className="flex-1 py-3 bg-red-500 text-white rounded-2xl text-sm font-black uppercase shadow-xl hover:bg-red-600 transition-colors"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeekerDashboard;