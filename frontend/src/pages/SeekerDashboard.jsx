// src/pages/SeekerDashboard.jsx
import React, { useState, useEffect, useRef } from 'react'; 
import { 
  Trash2, FileText, ChevronDown, ChevronUp, ChevronLeft, Search, 
  Briefcase, Info, User, Users, Lock, CheckCircle, XCircle, 
  Star, Target, Zap, TrendingUp, Upload, FilePlus, 
  ExternalLink, Clock, MapPin, FileCheck, X, AlertCircle, Calendar
} from 'lucide-react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { API_BASE } from '../lib/apiBase';

// =====================================================
// 1. COMPONENT: APPLICATION PROGRESS STEPPER
// =====================================================
const ApplicationProcessSteps = ({ status }) => {
  const steps = [
    { id: 'Pending', label: 'Pending', icon: <FileText size={16}/> },
    { id: 'Viewing', label: 'Viewing', icon: <Target size={16}/> },
    { id: 'Interview', label: 'Interview', icon: <Zap size={16}/> },
    { id: 'Decision', label: 'Decision', icon: <TrendingUp size={16}/> }
  ];

  const getStepStatus = (stepId, currentStatus) => {
    const statusOrder = ['Pending', 'Viewing', 'Interview', 'Hired', 'Rejected', 'Cancelled'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentStatus === 'Cancelled') return 'bg-gray-50 text-gray-300 border-gray-200';
    
    if (stepId === 'Decision') {
      if (currentStatus === 'Hired') return 'bg-green-500 text-white border-green-500';
      if (currentStatus === 'Rejected') return 'bg-red-500 text-white border-red-500';
      return 'bg-white text-gray-300 border-gray-200';
    }

    if (stepId === currentStatus) return 'bg-blue-600 text-white border-blue-600 shadow-md scale-110 z-10';
    if (statusOrder.indexOf(stepId) < currentIndex) return 'bg-blue-600 text-white border-blue-600';
    return 'bg-white text-gray-300 border-gray-200';
  };

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative px-4">
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full"></div>
        {steps.map((step) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${getStepStatus(step.id, status)}`}>
              {step.icon}
            </div>
            <span className={`text-xs font-semibold ${step.id === status ? 'text-blue-700' : 'text-gray-400'}`}>
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
  if (!job) return <div className="p-20 text-center font-bold text-gray-500">Job data not found.</div>;
  
  // Defensive check for matchData
  const matches = matchData?.matches || [];
  const score = matchData?.score || 0;
  const missingSkills = (job.requiredSkills || []).filter(skill => !matches.includes(skill));

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-300">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-all font-semibold text-sm mb-6">
        <ChevronLeft size={18}/> Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 md:p-10 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{job.title}</h1>
            <p className="text-lg font-medium text-blue-600 flex items-center gap-2">
              <Briefcase size={20}/> {job.company}
            </p>
          </div>
          <div className="text-center bg-gray-50 px-8 py-4 rounded-2xl border border-gray-100 min-w-[140px]">
             <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Match Rate</p>
             <p className={`text-3xl font-bold ${score >= 70 ? 'text-green-600' : 'text-orange-500'}`}>{score}%</p>
          </div>
        </div>

        <div className="p-8 md:p-10 grid md:grid-cols-2 gap-6">
          <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100">
            <h4 className="flex items-center gap-2 text-sm font-bold text-green-700 mb-4">
              <CheckCircle size={18}/> Matched Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {matches.length > 0 ? matches.map((s, i) => (
                <span key={i} className="bg-white text-gray-800 text-sm font-medium px-3 py-1.5 rounded-lg border border-green-200 shadow-sm">{s}</span>
              )) : <p className="text-sm text-gray-500 italic">No matches found</p>}
            </div>
          </div>
          
          <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
            <h4 className="flex items-center gap-2 text-sm font-bold text-red-700 mb-4">
              <XCircle size={18}/> Missing Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {missingSkills.length > 0 ? missingSkills.map((s, i) => (
                <span key={i} className="bg-white text-gray-600 text-sm font-medium px-3 py-1.5 rounded-lg border border-red-200">{s}</span>
              )) : <p className="text-sm text-gray-500 italic">No missing skills</p>}
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
export const FindJobs = ({ jobs = [], recommendations = [], onApply, applications = [], userId }) => {
  const [keyword, setKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  const locations = [...new Set(jobs.map(j => j.location).filter(Boolean))].sort();
  const types = [...new Set(jobs.map(j => j.type).filter(Boolean))].sort();
  
  const filtered = jobs.filter(j => {
    const matchesKeyword = j.title.toLowerCase().includes(keyword.toLowerCase()) || j.company.toLowerCase().includes(keyword.toLowerCase());
    const matchesLocation = !selectedLocation || j.location === selectedLocation;
    const matchesType = !selectedType || j.type === selectedType;
    return matchesKeyword && matchesLocation && matchesType;
  });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 animate-in fade-in duration-300">
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20}/>
          <input 
            value={keyword} 
            onChange={e => setKeyword(e.target.value)} 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors font-medium text-gray-900" 
            placeholder="Search job titles or companies..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium">
              <option value="">All Locations</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
          <div>
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium">
              <option value="">All Job Types</option>
              {types.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </div>
        
        <div className="text-sm font-semibold text-gray-500 pt-2">
          Showing {filtered.length} of {jobs.length} open positions
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="text-blue-600" size={24}/> FOR YOU (50%+ Match)
        </h2>
        {recommendations.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-gray-200 shadow-sm text-center">
            <p className="text-gray-700 font-bold">No 50%+ matches yet.</p>
            <p className="text-sm text-gray-500 mt-1">Upload or update your resume to refresh AI-powered recommendations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recommendations.map((rec, index) => {
              const recJob = rec?.job;
              if (!recJob) return null;

              const alreadyApplied = applications.some(a => a.jobId === recJob.id && a.seekerId === userId);

              return (
                <div key={`${recJob.id}-${index}`} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{recJob.title}</h3>
                      <p className="text-sm font-semibold text-blue-600">{recJob.company}</p>
                    </div>
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
                      {Number(rec.matchScore || 0)}% Match
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mb-4 space-y-1">
                    {recJob.location && <p><span className="font-semibold text-gray-700">Location:</span> {recJob.location}</p>}
                    {recJob.type && <p><span className="font-semibold text-gray-700">Type:</span> {recJob.type}</p>}
                  </div>

                  {rec.matchReasons && (
                    <p className="text-sm text-gray-600 mb-5 bg-gray-50 border border-gray-100 rounded-lg p-3">{rec.matchReasons}</p>
                  )}

                  {!alreadyApplied ? (
                    <button
                      onClick={() => onApply(recJob.id)}
                      className="w-full md:w-auto px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply for this Position
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-lg text-sm font-bold border border-green-200">
                      <CheckCircle size={16}/> Application Submitted
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="space-y-4">
        {filtered.map(job => {
          const isExp = expandedId === job.id;
          const hasApp = applications.some(a => a.jobId === job.id && a.seekerId === userId);
          return (
            <div key={job.id} className={`bg-white rounded-2xl border transition-all duration-200 ${isExp ? 'border-blue-300 shadow-lg' : 'border-gray-200 shadow-sm hover:border-blue-200 hover:shadow-md'}`}>
              <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer" onClick={() => setExpandedId(isExp ? null : job.id)}>
                <div className="flex gap-5 items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isExp ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                    <Briefcase size={24}/>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
                    <p className="text-sm font-medium text-gray-500 mt-0.5">{job.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex gap-2">
                    {job.location && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">{job.location}</span>}
                    {job.type && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">{job.type}</span>}
                  </div>
                  <button className="hidden md:block text-gray-400 hover:text-gray-600">
                    {isExp ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                  </button>
                </div>
              </div>

              {isExp && (
                <div className="px-6 md:px-8 pb-8 pt-2 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-100 mb-6">
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Location</p>
                      <p className="font-medium text-gray-900 text-sm">{job.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Salary</p>
                      <p className="font-medium text-gray-900 text-sm">{job.salary || 'Competitive'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Job Type</p>
                      <p className="font-medium text-gray-900 text-sm">{job.type}</p>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Job Description</h4>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
                  </div>

                  {!hasApp ? (
                    <button onClick={(e) => { e.stopPropagation(); onApply(job.id); }} className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm">
                      Apply for this Position
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-xl font-bold border border-green-200">
                      <CheckCircle size={18}/> Application Submitted
                    </div>
                  )}
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

  const openWithdrawModal = (appId) => {
    setWithdrawModal({ isOpen: true, appId });
    setReason("");
  };
  const closeWithdrawModal = () => {
    setWithdrawModal({ isOpen: false, appId: null });
    setReason("");
  };

  const handleConfirmWithdrawal = async () => {
    if (!reason.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Reason required',
        text: 'Please enter a reason before confirming.',
        toast: true,
        position: 'top',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true
      });
      return;
    }

    const success = await onCancelApplication(withdrawModal.appId, reason.trim());
    if (!success) {
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Withdrawn',
      text: 'Your application has been withdrawn.',
      toast: true,
      position: 'top',
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true
    });

    closeWithdrawModal();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="text-blue-600" size={24}/> Active Applications
        </h2>
        <div className="grid grid-cols-1 gap-5">
          {activeApps.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No active applications</h3>
              <p className="text-gray-500 text-sm">You haven't applied to any jobs yet. Start exploring!</p>
            </div>
          ) : (
            activeApps.map(app => {
              const job = jobs.find(j => j.id === app.jobId);
              const canWithdraw = ['Pending', 'Viewing'].includes(app.status);
              return (
                <div key={app.id} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all relative group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">{job?.title}</h3>
                      <p className="text-sm font-semibold text-blue-600 mt-1">{job?.company}</p>
                    </div>
                    {canWithdraw ? (
                      <button
                        onClick={() => openWithdrawModal(app.id)}
                        className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                        title="Withdraw Application"
                      >
                        <Trash2 size={20}/>
                      </button>
                    ) : (
                      <div className="p-2 text-gray-300" title="Cannot withdraw at this stage">
                        <Lock size={20}/>
                      </div>
                    )}
                  </div>
                  
                  <ApplicationProcessSteps status={app.status} />
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 pt-4 border-t border-gray-100 gap-4">
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                      <Clock size={14}/> Applied: {app.date}
                    </span>
                    <button onClick={() => onViewJob(job)} className="text-sm font-bold text-blue-600 bg-blue-50 px-5 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                      View Match Metrics
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {withdrawnApps.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trash2 className="text-gray-400" size={24}/> Application History
          </h2>
          <div className="grid grid-cols-1 gap-5">
            {withdrawnApps.map(app => {
              const job = jobs.find(j => j.id === app.jobId);
              return (
                <div key={app.id} className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200 opacity-80">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-xl text-gray-700 line-through">{job?.title}</h3>
                      <p className="text-sm font-medium text-gray-500 mt-1">{job?.company}</p>
                    </div>
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-lg">Withdrawn</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <Clock size={14}/> Applied: {app.date}
                    </span>
                    {app.rejectionReason && (
                      <p className="mt-3 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg p-3">
                        Withdrawal reason: {app.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Withdraw Modal */}
      {withdrawModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Withdraw Application</h3>
              <button onClick={closeWithdrawModal} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Please let us know why you are withdrawing your application.</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl h-32 mb-6 outline-none focus:ring-2 focus:ring-red-500 transition-shadow text-sm"
              placeholder="e.g., I have accepted another offer..."
            />
            <div className="flex gap-3">
              <button
                onClick={closeWithdrawModal}
                className="flex-1 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWithdrawal}
                className="flex-1 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm"
              >
                Confirm Withdrawal
              </button>
            </div>
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
    return daysUntilEvent >= 7;
  } catch (e) {
    return true;
  }
};

export const MyTrainings = ({ trainings = [], profile, onWithdrawTraining }) => {
    const registered = trainings.filter(t => t.registeredUsers?.includes(profile?.id));
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="text-blue-600" size={24}/> My Registered Trainings
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
                {registered.length === 0 ? (
                    <div className="col-span-full bg-white p-12 rounded-2xl border border-gray-200 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                           <Calendar size={32} />
                        </div>
                        <p className="text-gray-900 font-bold text-lg mb-1">No upcoming trainings</p>
                        <p className="text-gray-500 text-sm">Register for trainings to enhance your skills.</p>
                    </div>
                ) : (
                    registered.map(t => (
                        <div key={t.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="pr-10">
                                    <p className="font-bold text-gray-900 text-lg mb-1 leading-tight">{t.title}</p>
                                    {t.provider && <p className="text-xs text-blue-600 font-semibold">{t.provider}</p>}
                                </div>
                                <div className="absolute top-6 right-6">
                                    {onWithdrawTraining && canWithdraw(t.date) ? (
                                        <button onClick={() => onWithdrawTraining(t.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Withdraw (7 days notice required)">
                                            <Trash2 size={18} />
                                        </button>
                                    ) : (
                                        <div className="p-2 text-gray-300" title="Too late to withdraw">
                                            <Lock size={18} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-2.5 text-sm text-gray-600 mb-5 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                {t.date && (
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-gray-400" />
                                        <span className="font-medium">{t.date}</span>
                                    </div>
                                )}
                                {t.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-gray-400" />
                                        <span className="font-medium">{t.location}</span>
                                    </div>
                                )}
                            </div> 
                            
                            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                <CheckCircle size={16} className="text-green-500" />
                                <span className="text-xs font-bold text-green-700">Enrollment Confirmed</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export const MyJobFairs = ({ jobFairs = [], profile, onWithdrawJobFair }) => {
    const joined = jobFairs.filter(f => f.participants?.includes(profile?.id));
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="text-blue-600" size={24}/> My Job Fairs
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
                {joined.length === 0 ? (
                    <div className="col-span-full bg-white p-12 rounded-2xl border border-gray-200 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                           <Briefcase size={32} />
                        </div>
                        <p className="text-gray-900 font-bold text-lg mb-1">No upcoming job fairs</p>
                        <p className="text-gray-500 text-sm">Join job fairs to meet employers directly.</p>
                    </div>
                ) : (
                    joined.map(f => (
                        <div key={f.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="pr-10">
                                    <p className="font-bold text-gray-900 text-lg mb-1 leading-tight">{f.title}</p>
                                    {f.organizer && <p className="text-xs text-blue-600 font-semibold">{f.organizer}</p>}
                                </div>
                                <div className="absolute top-6 right-6">
                                    {onWithdrawJobFair && canWithdraw(f.date) ? (
                                        <button onClick={() => onWithdrawJobFair(f.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    ) : (
                                        <div className="p-2 text-gray-300">
                                            <Lock size={18} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-2.5 text-sm text-gray-600 mb-5 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                {f.date && (
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-gray-400" />
                                        <span className="font-medium">{f.date}</span>
                                    </div>
                                )}
                                {f.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-gray-400" />
                                        <span className="font-medium">{f.location}</span>
                                    </div>
                                )}
                            </div>
                            
                            {f.companies && f.companies.length > 0 && (
                                <div className="mb-5">
                                    <p className="text-xs font-semibold text-gray-500 mb-2">Attending Employers:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {f.companies.slice(0, 3).map((c, idx) => (
                                            <span key={idx} className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded-md font-medium">{c}</span>
                                        ))}
                                        {f.companies.length > 3 && <span className="text-xs text-gray-500 font-medium px-1 py-1">+{f.companies.length - 3} more</span>}
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                <CheckCircle size={16} className="text-green-500" />
                                <span className="text-xs font-bold text-green-700">Slot Confirmed</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// =====================================================
// 6. MAIN DEFAULT EXPORT (Integrated Layout)
// =====================================================
const toastMsg = (title, icon = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  Toast.fire({
    icon: icon,
    title: title
  });
};

const SeekerDashboard = ({ profile, applications = [], jobs = [], trainings = [], jobFairs = [], initialTab, onCancelApplication, onViewJob, onNavigate, onUpdateProfile, onWithdrawTraining }) => {
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
  const handleConfirmWithdrawal = async () => {
    if (withdrawModal.type === 'training') {
        if (typeof onWithdrawTraining === 'function') {
          const ok = await onWithdrawTraining(withdrawModal.id);
          if (!ok) {
            return;
          }
        } else {
          toastMsg("Training withdrawn successfully.");
        }
    } else if (withdrawModal.type === 'jobfair') {
        toastMsg("Job Fair withdrawn successfully.");
    }
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

    setResumeFile(file);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('email', userEmail);

    try {
      const response = await fetch(`${API_BASE}/upload/resume`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Failed to save to backend');
      
      if (typeof onUpdateProfile === 'function' && data?.user) {
        onUpdateProfile(data.user);
      }
      
      toastMsg('Resume securely saved to profile!');

    } catch (error) {
      console.error('Upload Error:', error);
      alert(error?.message || 'Failed to upload resume to server. Please try again.');
      setResumeFile(null); // revert on failure
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
      const response = await fetch(`${API_BASE}/upload/resume`, {
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

      toastMsg('Resume removed from profile.', 'info');
    } catch (error) {
      console.error('Delete Resume Error:', error);
      alert(error?.message || 'Failed to remove resume. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-8">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        
        {/* Header Section */}
        <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Seeker Dashboard</h1>
            <p className="text-gray-500 mt-1 font-medium">Manage your career journey and profile</p>
        </header>
        
        {/* Sleek Tab Navigation */}
        <nav className="flex gap-2 mb-10 bg-gray-100/80 p-1.5 rounded-2xl w-fit overflow-x-auto mx-auto md:mx-0 shadow-inner">
          {['overview', 'trainings', 'job fairs', 'profile'].map(tab => (
            <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'}`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {activeTab === 'overview' && <DashboardOverview applications={applications} jobs={jobs} onCancelApplication={onCancelApplication} onViewJob={onViewJob} />}
        {activeTab === 'trainings' && <MyTrainings trainings={trainings} profile={profile} onWithdrawTraining={handleWithdrawTraining} />}
        {activeTab === 'job fairs' && <MyJobFairs jobFairs={jobFairs} profile={profile} onWithdrawJobFair={handleWithdrawJobFair} />}
        
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl space-y-6 animate-in fade-in duration-300">
            <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-200 shadow-sm">
              
              {/* Profile Header */}
              <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
                    {profile?.name?.charAt(0) || <User />}
                </div>
                <div>
                    <h3 className="font-bold text-3xl text-gray-900 tracking-tight">
                    {profile?.name || "Job Seeker"}
                    </h3>
                    <p className="text-gray-500 font-medium mt-1">{profile?.email || "No email provided"}</p>
                </div>
              </div>

              {/* Information Grid */}
              <h4 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h4>
              <div className="grid md:grid-cols-2 gap-4 mb-10">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Birthday</p>
                  <p className="text-sm font-medium text-gray-900">{birthdayDisplay || "Not provided"}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Education</p>
                  <p className="text-sm font-medium text-gray-900">{profile?.educational_attainment || "Not Specified"}</p>
                </div>

                {/* MODIFIED: Separated ID Type and ID Number */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">ID Type</p>
                  <p className="text-sm font-medium text-gray-900">{profile?.id_type || "Gov ID"}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">ID Number</p>
                  <p className="text-sm font-medium text-gray-900 font-mono">{profile?.qc_id || "None"}</p>
                </div>
              </div>
              
              {/* Resume Tools Grid */}
              <h4 className="text-lg font-bold text-gray-900 mb-6">Resume & Documents</h4>
              <div className="grid md:grid-cols-2 gap-5">
                
                {/* Resume Builder */}
                <button 
                  onClick={() => onNavigate('resume-builder')} 
                  className="p-6 border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all text-left group bg-white"
                >
                  <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <FilePlus size={24}/>
                  </div>
                  <h4 className="font-bold text-lg mb-1 text-gray-900">Resume Builder</h4>
                  <p className="text-sm text-gray-500 font-medium">Create a structured, ATS-friendly resume from scratch.</p>
                </button>

                {/* Resume Upload Module */}
                <div className="p-6 border border-gray-200 rounded-2xl bg-white flex flex-col justify-between">
                  <div>
                      <div className="bg-gray-50 text-gray-400 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                        <Upload size={24}/>
                      </div>
                      <h4 className="font-bold text-lg mb-1 text-gray-900">Upload Existing Resume</h4>
                      <p className="text-sm text-gray-500 font-medium mb-4">Have your own PDF? Upload it directly to your profile.</p>
                  </div>
                  
                  {!resumeFile ? (
                    <button 
                      onClick={() => fileInputRef.current.click()} 
                      className="w-full py-2.5 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 border border-gray-200 transition-colors"
                    >
                      Select PDF File
                    </button>
                  ) : (
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center justify-between shadow-sm animate-in zoom-in-95">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileCheck className="text-blue-600 shrink-0" size={20}/>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-blue-900 truncate">
                            {resumeFile instanceof File ? resumeFile.name : (resumeFile.original_name || "Resume.pdf")}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={handleRemoveResume} 
                        className="p-1.5 hover:bg-white text-gray-400 hover:text-red-500 rounded-lg transition-colors shrink-0"
                        title="Remove Document"
                      >
                        <X size={18}/>
                      </button>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf" 
                    onChange={handleFileUpload} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generic Event Withdrawal Modal */}
        {withdrawModal.isOpen && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Confirm Withdrawal</h3>
                <button onClick={() => setWithdrawModal({ isOpen: false })} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                You are about to withdraw from <span className="font-bold text-gray-900">{withdrawModal.title}</span>. This will free up your slot for others.
              </p>
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-8 flex gap-3 text-orange-800">
                <AlertCircle className="shrink-0 mt-0.5" size={18}/>
                <p className="text-xs font-medium leading-relaxed">
                  Withdrawals are only permitted up to 7 days prior to the event. Re-registration is not guaranteed.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setWithdrawModal({ isOpen: false })}
                  className="flex-1 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmWithdrawal}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm"
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

