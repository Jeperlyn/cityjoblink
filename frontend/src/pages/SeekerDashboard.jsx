// src/pages/SeekerDashboard.jsx
import React, { useState, useMemo, useRef } from 'react';
import { Edit3, Trash2, X, FileText, UploadCloud, Plus, ChevronLeft, Search, Filter, Star } from 'lucide-react';
import { calculateMatchScore } from '../data/mockData';

// --- Extra Components (Matchmaker & JobDetails) ---

export const MatchmakerSearch = ({ jobs, userProfile, onJobClick, onApply }) => {
  const [keyword, setKeyword] = useState('');
  const processedJobs = useMemo(() => {
    const safeSkills = userProfile?.skills || [];
    return jobs.map(job => ({ ...job, matchData: calculateMatchScore(job.requiredSkills, safeSkills) }))
      .filter(job => job.title.toLowerCase().includes(keyword.toLowerCase()) || job.company.toLowerCase().includes(keyword.toLowerCase()))
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
            <div className="grid md:grid-cols-2 gap-4">{recommendedJobs.map(job => (<div key={job.id} className="bg-white p-5 rounded-xl shadow-sm border border-cyan-100 hover:border-cyan-400 transition-all relative overflow-hidden"><div className="absolute top-0 right-0 bg-cyan-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">{job.matchData.score}% MATCH</div><h3 className="font-bold text-lg">{job.title}</h3><p className="text-sm text-gray-500 mb-2">{job.company}</p><button onClick={() => onJobClick(job)} className="w-full bg-black text-white py-2 rounded-lg text-sm font-bold hover:bg-gray-800">View Details</button></div>))}</div>
          </section>
        )}
        <h2 className="text-xl font-bold pt-4 border-t">All Opportunities</h2>
        {processedJobs.map(job => (<div key={job.id} className="bg-white p-5 rounded-xl shadow-sm border flex justify-between items-center"><div><h3 className="font-bold">{job.title}</h3><p className="text-sm text-gray-500">{job.company}</p></div><button onClick={() => onJobClick(job)} className="border px-4 py-2 rounded hover:bg-gray-50 text-sm font-bold">View Details</button></div>))}
      </main>
    </div>
  );
};

export const JobDetailsPage = ({ job, matchData, onBack, onApply, hasApplied }) => {
  if (!job) return null;
  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-4"><ChevronLeft size={20}/> Back</button>
      <div className="bg-white p-8 rounded-xl border shadow-sm">
         <h1 className="text-3xl font-bold">{job.title}</h1>
         <p className="text-lg text-gray-600 mb-4">{job.company}</p>
         {matchData && <div className="bg-blue-50 p-3 rounded mb-4 text-blue-800 font-bold">Job Match: {matchData.score}%</div>}
         <p className="text-gray-700 mb-6">{job.description}</p>
         {hasApplied ? <button disabled className="bg-green-100 text-green-700 px-6 py-3 rounded font-bold">Applied</button> : <button onClick={()=>onApply(job.id)} className="bg-blue-600 text-white px-6 py-3 rounded font-bold">Apply Now</button>}
      </div>
    </div>
  );
};

// --- Main Seeker Dashboard ---

const SeekerDashboard = ({ profile, applications, jobs, trainings, jobFairs, onUpdateProfile, onUpdateTrainings, onReviewCompany, onViewJob, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [modalType, setModalType] = useState(null);
  const [tempInput, setTempInput] = useState({});
  
  // 1. UseRef para sa File Upload
  const fileInputRef = useRef(null);

  const myTrainings = trainings.filter(t => t.registeredUsers.includes(profile.id));
  const myFairs = jobFairs.filter(f => f.participants.includes(profile.id));

  // 2. Handle File Selection (Pag may pinili sa folder)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdateProfile({
        ...profile, 
        resumeFile: file.name, 
        resumeType: 'uploaded'
      });
      setModalType(null); // Close modal if open
      alert(`Resume uploaded successfully: ${file.name}`);
    }
  };

  const handleAddEntry = () => {
    if (modalType === 'review') onReviewCompany(tempInput.appId, tempInput.rating, tempInput.comment);
    // Note: resumeUpload logic is now handled by handleFileUpload directly
    setModalType(null); setTempInput({});
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      
      {/* 3. Hidden Input Element - Ito ang nagbubukas ng folder */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".pdf,.doc,.docx" 
        onChange={handleFileUpload} 
      />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        <div>
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-gray-500">Welcome back, {profile.name}</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-6 border-b overflow-x-auto">
        {['overview', 'resume & documents', 'trainings', 'jobfairs'].map(tab => (
            <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`pb-2 px-4 font-medium capitalize whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-cyan-500 text-cyan-600' : 'text-gray-500'}`}
            >
                {tab === 'jobfairs' ? 'My Job Fairs' : tab === 'trainings' ? 'My Trainings' : tab}
            </button>
        ))}
      </div>
      
      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border"><h3 className="font-bold text-lg mb-4">Applications</h3>{applications.length === 0 ? <p className="text-gray-500">No applications yet.</p> : applications.map(app => { const job = jobs.find(j => j.id === app.jobId); return (<div key={app.id} className="flex justify-between items-center border-b pb-3 mb-3"><div className="flex-1"><h4 className="font-bold">{job?.title}</h4><p className="text-sm text-gray-500">{job?.company}</p><button onClick={() => onViewJob(job)} className="text-xs text-blue-600 underline">View Job</button></div><div className="text-right"><span className="block text-sm font-bold text-cyan-600">{app.status}</span>{!app.hasReviewed && <button onClick={() => {setModalType('review'); setTempInput({appId: app.id})}} className="text-xs border px-2 py-1 rounded mt-1">Rate Company</button>}</div></div>) })}</div>
      )}

      {/* TAB: RESUME & DOCUMENTS */}
      {activeTab === 'resume & documents' && (
         <div className="space-y-6">
            
            {/* Section 1: Current Status */}
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
                            <button 
                                onClick={() => fileInputRef.current.click()} 
                                className="text-sm text-blue-600 font-bold hover:underline"
                            >
                                Replace
                            </button>
                            <button 
                                onClick={()=>onUpdateProfile({...profile, resumeFile: null})} 
                                className="text-sm text-red-500 font-bold hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 mb-4">No resume uploaded yet.</p>
                        <button 
                            onClick={() => fileInputRef.current.click()} 
                            className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 flex items-center gap-2 mx-auto"
                        >
                            <UploadCloud size={18}/> Upload PDF Resume
                        </button>
                    </div>
                )}
            </div>

            {/* Section 2: The Resume Builder Promo */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg text-white p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-bold mb-2">Don't have a resume?</h3>
                    <p className="text-blue-100 max-w-md">
                        Create a professional resume in minutes using our AI-powered builder. 
                        Choose from multiple templates, download the PDF, and upload it here.
                    </p>
                </div>
                <button 
                    onClick={() => onNavigate('resume-builder')}
                    className="bg-white text-blue-700 px-6 py-3 rounded-lg font-bold shadow-md hover:bg-gray-100 transition flex items-center gap-2 whitespace-nowrap"
                >
                    <Edit3 size={18}/>
                    Open Resume Builder
                </button>
            </div>

         </div>
      )}

      {activeTab === 'trainings' && <div className="grid md:grid-cols-2 gap-4">{myTrainings.map(t => <div key={t.id} className="bg-white p-5 rounded border"><h3 className="font-bold">{t.title}</h3><button onClick={()=>onUpdateTrainings(t.id, profile.id, 'leave')} className="text-red-500 text-sm mt-2">Cancel Registration</button></div>)}</div>}
      {activeTab === 'jobfairs' && <div className="grid md:grid-cols-2 gap-4">{myFairs.map(f => <div key={f.id} className="bg-white p-5 rounded border"><h3 className="font-bold">{f.title}</h3><span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Registered</span></div>)}</div>}

      {/* MODALS */}
      {modalType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
             <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold capitalize">Action</h2><button onClick={()=>setModalType(null)}><X/></button></div>
             <div className="space-y-3">
                {modalType==='review' && <><select className="w-full border p-2" onChange={e=>setTempInput({...tempInput, rating:e.target.value})}><option value="5">5 Stars</option></select><textarea className="w-full border p-2" placeholder="Comment" onChange={e=>setTempInput({...tempInput, comment:e.target.value})}/></>}
                
                {modalType==='resumeUpload' && (
                    <div 
                        className="border-dashed border-2 border-blue-300 bg-blue-50 p-8 text-center rounded-lg cursor-pointer hover:bg-blue-100 transition" 
                        onClick={() => fileInputRef.current.click()} 
                    >
                        <UploadCloud size={40} className="mx-auto text-blue-500 mb-2"/>
                        <p className="font-bold text-blue-900">Click to Upload PDF</p>
                        <p className="text-xs text-blue-600">Supports PDF, DOCX</p>
                    </div>
                )}
                
                {modalType==='review' && <button onClick={handleAddEntry} className="bg-black text-white w-full py-2 rounded font-bold">Save</button>}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeekerDashboard;