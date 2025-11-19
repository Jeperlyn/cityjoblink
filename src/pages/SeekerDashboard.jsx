// src/pages/SeekerDashboard.jsx
import React, { useState, useMemo } from 'react';
import { Edit3, Trash2, X, FileText, UploadCloud, Plus, ChevronLeft, Search, Filter, Star } from 'lucide-react';
import { MONTHS, YEARS, calculateMatchScore } from '../data/mockData';

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
        {userProfile?.skills?.length === 0 && <div className="text-xs text-orange-500 bg-orange-50 p-2 rounded">Tip: Go to Dashboard &gt; Profile to add skills!</div>}
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

const SeekerDashboard = ({ profile, applications, jobs, trainings, jobFairs, onUpdateProfile, onUpdateTrainings, onReviewCompany, onViewJob }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [modalType, setModalType] = useState(null);
  const [tempInput, setTempInput] = useState({});
  const [newSkillInput, setNewSkillInput] = useState("");

  const myTrainings = trainings.filter(t => t.registeredUsers.includes(profile.id));
  const myFairs = jobFairs.filter(f => f.participants.includes(profile.id));

  const handleAddEntry = () => {
    if (modalType === 'role') onUpdateProfile({...profile, experience: [...(profile.experience||[]), tempInput]});
    else if (modalType === 'education') onUpdateProfile({...profile, education: [...(profile.education||[]), tempInput]});
    else if (modalType === 'license') onUpdateProfile({...profile, licenses: [...(profile.licenses||[]), tempInput]});
    else if (modalType === 'language') onUpdateProfile({...profile, languages: [...(profile.languages||[]), tempInput.language]});
    else if (modalType === 'summary') onUpdateProfile({...profile, bio: tempInput.bio});
    else if (modalType === 'review') onReviewCompany(tempInput.appId, tempInput.rating, tempInput.comment);
    else if (modalType === 'resumeUpload') onUpdateProfile({...profile, resumeFile: "Uploaded_Resume.pdf", resumeType: 'uploaded'});
    setModalType(null); setTempInput({});
  };

  const handleDelete = (type, index) => {
    if (!window.confirm("Delete this item?")) return;
    if (type === 'experience') {
        const updated = [...(profile.experience || [])];
        updated.splice(index, 1);
        onUpdateProfile({...profile, experience: updated});
    } else if (type === 'education') {
        const updated = [...(profile.education || [])];
        updated.splice(index, 1);
        onUpdateProfile({...profile, education: updated});
    } else if (type === 'license') {
        const updated = [...(profile.licenses || [])];
        updated.splice(index, 1);
        onUpdateProfile({...profile, licenses: updated});
    } else if (type === 'skill') {
        const updated = [...(profile.skills || [])];
        updated.splice(index, 1);
        onUpdateProfile({...profile, skills: updated});
    } else if (type === 'language') {
        const updated = [...(profile.languages || [])];
        updated.splice(index, 1);
        onUpdateProfile({...profile, languages: updated});
    }
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim()) {
       onUpdateProfile({...profile, skills: [...(profile.skills || []), newSkillInput]});
       setNewSkillInput("");
    }
  };

  const handleCreateResume = () => {
     if (profile.experience?.length > 0 || profile.education?.length > 0) {
        onUpdateProfile({...profile, resumeFile: `Resume_${profile.name.replace(/\s+/g,'_')}.pdf`, resumeType: 'generated'});
        alert("Resume created!");
     } else alert("Add experience/education first.");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-end mb-6"><div><h1 className="text-3xl font-bold">My Dashboard</h1><p className="text-gray-500">Welcome back, {profile.name}</p></div></div>
      <div className="flex gap-4 mb-6 border-b overflow-x-auto">{['overview', 'profile & resume', 'trainings', 'jobfairs'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 px-4 font-medium capitalize ${activeTab === tab ? 'border-b-2 border-cyan-500 text-cyan-600' : 'text-gray-500'}`}>{tab === 'jobfairs' ? 'My Job Fairs' : tab === 'trainings' ? 'My Trainings' : tab}</button>))}</div>
      
      {activeTab === 'overview' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border"><h3 className="font-bold text-lg mb-4">Applications</h3>{applications.length === 0 ? <p className="text-gray-500">No applications yet.</p> : applications.map(app => { const job = jobs.find(j => j.id === app.jobId); return (<div key={app.id} className="flex justify-between items-center border-b pb-3 mb-3"><div className="flex-1"><h4 className="font-bold">{job?.title}</h4><p className="text-sm text-gray-500">{job?.company}</p><button onClick={() => onViewJob(job)} className="text-xs text-blue-600 underline">View Job</button></div><div className="text-right"><span className="block text-sm font-bold text-cyan-600">{app.status}</span>{!app.hasReviewed && <button onClick={() => {setModalType('review'); setTempInput({appId: app.id})}} className="text-xs border px-2 py-1 rounded mt-1">Rate Company</button>}</div></div>) })}</div>
      )}

      {activeTab === 'profile & resume' && (
         <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
               <section>
                  <div className="flex justify-between items-center mb-2"><h3 className="font-bold text-lg">Personal Summary</h3>{profile.bio ? <button onClick={()=>{setTempInput({bio:profile.bio}); setModalType('summary')}}><Edit3 size={16}/></button> : <button onClick={()=>setModalType('summary')} className="text-blue-600 text-sm font-bold border border-blue-600 px-4 py-1 rounded">Add summary</button>}</div>
                  {profile.bio && <div className="bg-gray-50 p-3 rounded text-sm">{profile.bio}</div>}
               </section>
               <section>
                  <h3 className="font-bold text-lg mb-2">Experience</h3>
                  {profile.experience?.map((exp, i) => (<div key={i} className="bg-gray-50 p-4 rounded mb-3 relative group border-l-4 border-cyan-500"><button className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100" onClick={()=>handleDelete('experience', i)}><Trash2 size={14}/></button><p className="font-bold">{exp.role}</p><p className="text-sm text-gray-600">{exp.company}</p><p className="text-xs text-gray-500">{exp.startMonth} {exp.startYear} - {exp.stillInRole?'Present':`${exp.endMonth || ''} ${exp.endYear || ''}`}</p><p className="text-sm mt-2">{exp.description}</p></div>))}
                  <button onClick={()=>setModalType('role')} className="border border-blue-700 text-blue-700 font-bold px-6 py-2 rounded-lg text-sm hover:bg-blue-50">Add role</button>
               </section>
               <section>
                  <h3 className="font-bold text-lg mb-2">Education</h3>
                  {profile.education?.map((edu, i) => (<div key={i} className="bg-gray-50 p-4 rounded mb-3 relative group border-l-4 border-purple-500"><button className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100" onClick={()=>handleDelete('education', i)}><Trash2 size={14}/></button><p className="font-bold">{edu.course}</p><p className="text-sm text-gray-600">{edu.institution}</p><p className="text-xs text-gray-500">Finished: {edu.year}</p><p className="text-sm mt-2">{edu.highlights}</p></div>))}
                  <button onClick={()=>setModalType('education')} className="border border-blue-700 text-blue-700 font-bold px-6 py-2 rounded-lg text-sm hover:bg-blue-50">Add education</button>
               </section>
               <section>
                  <h3 className="font-bold text-lg mb-2">Licences & Certifications</h3>
                  {profile.licenses?.map((lic, i) => (<div key={i} className="bg-gray-50 p-4 rounded mb-3 relative group border-l-4 border-yellow-500"><button className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100" onClick={()=>handleDelete('license', i)}><Trash2 size={14}/></button><p className="font-bold">{lic.name}</p><p className="text-sm">{lic.issuer}</p><p className="text-xs text-gray-500">{lic.issueMonth} {lic.issueYear} - {lic.noExpiry?'No Expiry':`${lic.expiryMonth} ${lic.expiryYear}`}</p></div>))}
                  <button onClick={()=>setModalType('license')} className="border border-blue-700 text-blue-700 font-bold px-6 py-2 rounded-lg text-sm hover:bg-blue-50">Add licence or certification</button>
               </section>
               <section>
                  <h3 className="font-bold text-lg mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2 mb-2">{profile.skills?.map((s, i) => (<span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700 flex items-center gap-2">{s} <button onClick={()=>handleDelete('skill', i)}><X size={14} className="hover:text-red-600"/></button></span>))}</div>
                  <button onClick={()=>setModalType('skill')} className="border border-blue-700 text-blue-700 font-bold px-6 py-2 rounded-lg text-sm hover:bg-blue-50">Add skills</button>
               </section>
               <section>
                  <h3 className="font-bold text-lg mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2 mb-2">{profile.languages?.map((l, i) => (<span key={i} className="bg-gray-100 px-3 py-1 rounded text-sm flex items-center gap-2">{l} <button onClick={()=>handleDelete('language', i)}><X size={14}/></button></span>))}</div>
                  <button onClick={()=>setModalType('language')} className="border border-blue-700 text-blue-700 font-bold px-6 py-2 rounded-lg text-sm hover:bg-blue-50">Add language</button>
               </section>
               <section className="border-t pt-4">
                  <h3 className="font-bold text-lg mb-2">Resume</h3>
                  {profile.resumeFile ? <div className="flex items-center gap-3 bg-green-50 p-4 rounded-lg border border-green-200"><FileText className="text-green-600"/><div className="flex-1"><span className="font-bold text-sm block">{profile.resumeFile}</span><span className="text-xs text-green-700">{profile.resumeType === 'generated' ? 'Generated from Profile' : 'Uploaded File'}</span></div><button onClick={()=>onUpdateProfile({...profile, resumeFile: null})}><Trash2 size={18} className="text-red-500"/></button></div> : <div className="flex flex-col sm:flex-row gap-4"><button onClick={handleCreateResume} className="flex-1 bg-blue-800 text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2"><FileText size={16}/> Create from Profile</button><button onClick={()=>setModalType('resumeUpload')} className="flex-1 border border-blue-700 text-blue-700 font-bold px-6 py-3 rounded-lg text-sm flex items-center justify-center gap-2"><UploadCloud size={16}/> Upload Resume</button></div>}
               </section>
            </div>
            {/* SIDEBAR - ABOUT NEXT ROLE */}
            <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="font-bold text-lg mb-4">About your next role</h3>
                    {['Availability', 'Preferred work types', 'Preferred locations', 'Right to work', 'Salary expectation', 'Classification of interest'].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-3 border-b last:border-0 cursor-pointer hover:bg-gray-50">
                            <span className="text-sm font-medium">{item}</span>
                            <Plus size={16} className="text-gray-400"/>
                        </div>
                    ))}
                </div>
            </div>
         </div>
      )}

      {activeTab === 'trainings' && <div className="grid md:grid-cols-2 gap-4">{myTrainings.map(t => <div key={t.id} className="bg-white p-5 rounded border"><h3 className="font-bold">{t.title}</h3><button onClick={()=>onUpdateTrainings(t.id, profile.id, 'leave')} className="text-red-500 text-sm mt-2">Cancel Registration</button></div>)}</div>}
      {activeTab === 'jobfairs' && <div className="grid md:grid-cols-2 gap-4">{myFairs.map(f => <div key={f.id} className="bg-white p-5 rounded border"><h3 className="font-bold">{f.title}</h3><span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Registered</span></div>)}</div>}

      {modalType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold capitalize">Add {modalType}</h2><button onClick={()=>setModalType(null)}><X/></button></div>
             <div className="space-y-3">
                {modalType==='summary' && <textarea className="w-full border p-2 rounded h-32" placeholder="Bio..." onChange={e=>setTempInput({...tempInput, bio:e.target.value})}/>}
                {modalType==='role' && <><input className="w-full border p-2 rounded" placeholder="Title" onChange={e=>setTempInput({...tempInput, role:e.target.value})}/><input className="w-full border p-2 rounded" placeholder="Company" onChange={e=>setTempInput({...tempInput, company:e.target.value})}/><div className="flex gap-2"><select className="border p-2 w-full" onChange={e=>setTempInput({...tempInput, startMonth:e.target.value})}><option>Month</option>{MONTHS.map(m=><option key={m}>{m}</option>)}</select><select className="border p-2 w-full" onChange={e=>setTempInput({...tempInput, startYear:e.target.value})}><option>Year</option>{YEARS.map(y=><option key={y}>{y}</option>)}</select></div><div className="flex gap-2"><select className="border p-2 w-full" onChange={e=>setTempInput({...tempInput, endMonth:e.target.value})}><option>Month</option>{MONTHS.map(m=><option key={m}>{m}</option>)}</select><select className="border p-2 w-full" onChange={e=>setTempInput({...tempInput, endYear:e.target.value})}><option>Year</option>{YEARS.map(y=><option key={y}>{y}</option>)}</select></div><div className="flex items-center gap-2 mt-2"><input type="checkbox" onChange={e=>setTempInput({...tempInput, stillInRole:e.target.checked})}/><label className="text-sm">Still in role</label></div><textarea className="w-full border p-2 mt-2 rounded h-24" placeholder="Description (recommended)" onChange={e=>setTempInput({...tempInput, description:e.target.value})}/></>}
                {modalType==='education' && <><input className="w-full border p-2 rounded" placeholder="Course" onChange={e=>setTempInput({...tempInput, course:e.target.value})}/><input className="w-full border p-2 rounded" placeholder="School" onChange={e=>setTempInput({...tempInput, institution:e.target.value})}/><select className="w-full border p-2 rounded" onChange={e=>setTempInput({...tempInput, year:e.target.value})}><option>Year Finished</option>{YEARS.map(y=><option key={y}>{y}</option>)}</select><textarea className="w-full border p-2 rounded h-24" placeholder="Course highlights (optional)" onChange={e=>setTempInput({...tempInput, highlights:e.target.value})}/></>}
                {modalType==='license' && <><input className="w-full border p-2 rounded" placeholder="Name" onChange={e=>setTempInput({...tempInput, name:e.target.value})}/><input className="w-full border p-2 rounded" placeholder="Issuer" onChange={e=>setTempInput({...tempInput, issuer:e.target.value})}/><div className="flex gap-2"><select className="border p-2 w-full" onChange={e=>setTempInput({...tempInput, issueMonth:e.target.value})}><option>Issue Month</option>{MONTHS.map(m=><option key={m}>{m}</option>)}</select><select className="border p-2 w-full" onChange={e=>setTempInput({...tempInput, issueYear:e.target.value})}><option>Issue Year</option>{YEARS.map(y=><option key={y}>{y}</option>)}</select></div><div className="flex gap-2"><select className="border p-2 w-full" disabled={tempInput.noExpiry} onChange={e=>setTempInput({...tempInput, expiryMonth:e.target.value})}><option>Expiry Month</option>{MONTHS.map(m=><option key={m}>{m}</option>)}</select><select className="border p-2 w-full" disabled={tempInput.noExpiry} onChange={e=>setTempInput({...tempInput, expiryYear:e.target.value})}><option>Expiry Year</option>{YEARS.map(y=><option key={y}>{y}</option>)}</select></div><div className="flex items-center gap-2 mt-2"><input type="checkbox" onChange={e=>setTempInput({...tempInput, noExpiry:e.target.checked})}/><label className="text-sm">No expiry</label></div></>}
                {modalType==='skill' && <><div className="flex gap-2"><input className="w-full border p-2 rounded" placeholder="Skill" value={newSkillInput} onChange={e=>setNewSkillInput(e.target.value)}/><button onClick={handleAddSkill} className="bg-blue-600 text-white px-3 rounded">Add</button></div><div className="flex gap-1 flex-wrap mt-2">{profile.skills?.map(s=><span key={s} className="bg-gray-100 px-2 rounded text-xs">{s}</span>)}</div></>}
                {modalType==='language' && <input className="w-full border p-2 rounded" placeholder="e.g. English, Mandarin" onChange={e=>setTempInput({...tempInput, language:e.target.value})}/>}
                {modalType==='review' && <><select className="w-full border p-2" onChange={e=>setTempInput({...tempInput, rating:e.target.value})}><option value="5">5 Stars</option></select><textarea className="w-full border p-2" placeholder="Comment" onChange={e=>setTempInput({...tempInput, comment:e.target.value})}/></>}
                {modalType==='resumeUpload' && <div className="border-dashed border-2 p-6 text-center cursor-pointer" onClick={handleAddEntry}>Click to Upload</div>}
                
                {modalType!=='skill' && <button onClick={handleAddEntry} className="bg-black text-white w-full py-2 rounded font-bold">Save</button>}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeekerDashboard;