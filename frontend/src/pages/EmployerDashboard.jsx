// src/pages/EmployerDashboard.jsx
import React, { useState } from 'react';
import { Edit3, User, X, FileText, ChevronUp, ChevronDown, MessageCircle, AlertCircle } from 'lucide-react'; 

const EmployerDashboard = ({ profile, jobs, applications, seekers, onPostJob, onUpdateJob, onUpdateProfile, onUploadDocs, onOpenChat, onUpdateStatus }) => {
  const [view, setView] = useState('dashboard');
  const [newJob, setNewJob] = useState({ title: '', salary: '', location: '', type: 'Full-time', requiredSkills: '', description: '' });
  const [hasFileToUpload, setHasFileToUpload] = useState(false);
  const [viewApplicant, setViewApplicant] = useState(null);
  const [expandedJob, setExpandedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);

  const myJobs = jobs.filter(j => j.employerId === profile.id);

  const handlePostJob = () => {
     // FIX: Filter out empty skills
     const skills = newJob.requiredSkills.split(',').map(s => s.trim()).filter(s => s !== ""); 

     if (editingJob) {
         onUpdateJob({
             ...newJob, 
             id: editingJob.id, 
             requiredSkills: skills, 
             employerId: profile.id, 
             company: profile.companyName, // FIX: Save Company Name
             status: editingJob.status
         });
     } else {
         onPostJob({
             ...newJob, 
             id: Date.now(), 
             requiredSkills: skills, 
             employerId: profile.id, 
             company: profile.companyName, // FIX: Save Company Name
             posted: 'Just now', 
             status: 'Open'
         });
     }
     setView('dashboard');
     setEditingJob(null);
     setNewJob({ title: '', salary: '', location: '', type: 'Full-time', requiredSkills: '', description: '' });
  };

  const handleEditJob = (job) => {
      setNewJob({...job, requiredSkills: job.requiredSkills.join(', ')});
      setEditingJob(job);
      setView('post');
  };

  const handleMessageClick = (seeker) => {
      onOpenChat(seeker.id);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
       <div className="flex justify-between mb-6"><div><h1 className="text-3xl font-bold">{profile.companyName}</h1><p>{profile.industry}</p></div>{view==='dashboard'&&<button onClick={()=>setView('post')} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">+ Post Job</button>}</div>
       {!profile.isVerified && (
         <div className="bg-orange-50 border-orange-200 border p-4 rounded mb-6">
            <h3 className="font-bold text-orange-800">Verification Required</h3>
            {profile.uploadedDocs ? <span className="text-sm font-bold text-orange-700">Pending Admin Review</span> : <div className="mt-2"><div className={`border-2 border-dashed p-3 mb-2 cursor-pointer ${hasFileToUpload?'bg-orange-100':''}`} onClick={()=>setHasFileToUpload(true)}>{hasFileToUpload?"Docs Selected":"Click to Select Docs"}</div>{hasFileToUpload && <button onClick={()=>onUploadDocs(profile.id)} className="bg-orange-600 text-white px-3 py-1 rounded text-sm font-bold">Submit Request</button>}</div>}
         </div>
       )}
       {view === 'post' ? (
         <div className="bg-white p-6 rounded border max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl font-bold">{editingJob ? 'Edit Job' : 'Post Job'}</h2>
            <input className="border w-full p-2 rounded" placeholder="Job Title" value={newJob.title} onChange={e=>setNewJob({...newJob, title:e.target.value})}/>
            <input className="border w-full p-2 rounded" placeholder="Location" value={newJob.location} onChange={e=>setNewJob({...newJob, location:e.target.value})}/>
            <input className="border w-full p-2 rounded" placeholder="Salary" value={newJob.salary} onChange={e=>setNewJob({...newJob, salary:e.target.value})}/>
            <textarea className="border w-full p-2 rounded h-32" placeholder="Description" value={newJob.description} onChange={e=>setNewJob({...newJob, description:e.target.value})}/>
            <input className="border w-full p-2 rounded" placeholder="Skills (comma separated)" value={newJob.requiredSkills} onChange={e=>setNewJob({...newJob, requiredSkills:e.target.value})}/>
            <div className="flex gap-2"><button disabled={!profile.isVerified} onClick={handlePostJob} className="bg-blue-600 text-white flex-1 py-2 rounded font-bold">Save</button><button onClick={()=>{setView('dashboard'); setEditingJob(null)}} className="border flex-1 py-2 rounded">Cancel</button></div>
         </div>
       ) : (
          <div className="space-y-4">{myJobs.map(j => (<div key={j.id} className="bg-white p-5 rounded border">
             <div className="flex justify-between items-start">
               <div><h3 className="font-bold text-lg">{j.title}</h3><span className="text-sm bg-green-100 text-green-800 px-2 rounded">{j.status}</span></div>
               <div className="flex gap-2">
                   <button onClick={()=>setExpandedJob(expandedJob === j.id ? null : j.id)} className="text-sm border px-3 py-1 rounded flex items-center gap-1">{expandedJob===j.id?<ChevronUp size={16}/>:<ChevronDown size={16}/>} View</button>
                   <button onClick={()=>handleEditJob(j)} className="text-sm bg-gray-100 px-3 py-1 rounded flex items-center gap-1"><Edit3 size={16}/> Edit</button>
               </div>
             </div>
             {expandedJob === j.id && <div className="mt-4 pt-4 border-t text-sm text-gray-600"><p className="font-bold mb-1">Description:</p>{j.description}</div>}
             
             <div className="mt-3 border-t pt-3"><h4 className="font-bold text-xs text-gray-500 uppercase mb-2">Applicants</h4>
                {applications.filter(a=>a.jobId===j.id).length === 0 ? <p className="text-xs text-gray-400 italic">No applicants yet.</p> : 
                 applications.filter(a=>a.jobId===j.id).map(a => { 
                    const s = seekers.find(u=>u.id===a.seekerId); 
                    const isCancelled = a.status === 'Cancelled';

                    return (
                        <div key={a.id} className={`flex flex-col gap-2 p-3 mt-2 rounded border transition-colors ${isCancelled ? 'bg-gray-100 border-gray-200 opacity-70' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex flex-wrap justify-between items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1 rounded-full ${isCancelled ? 'bg-gray-300 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                                        {isCancelled ? <AlertCircle size={16}/> : <User size={16}/>}
                                    </div>
                                    <div>
                                        <span className={`font-bold text-sm ${isCancelled ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{s?.name}</span>
                                        {isCancelled && <span className="text-xs text-red-500 font-bold ml-2">(Withdrew Application)</span>}
                                    </div>
                                </div>

                                <div className="flex gap-2 items-center">
                                    <button 
                                        onClick={() => !isCancelled && handleMessageClick(s)} 
                                        disabled={isCancelled}
                                        title="Chat" 
                                        className={`p-1 rounded ${isCancelled ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                                    >
                                        <MessageCircle size={18}/>
                                    </button>

                                    <button 
                                        onClick={()=> !isCancelled && setViewApplicant(s)} 
                                        disabled={isCancelled}
                                        className={`text-xs border px-2 py-1 rounded ${isCancelled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                                    >
                                        View Resume
                                    </button>
                                    
                                    <select 
                                        className={`text-xs border rounded p-1 ${isCancelled ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                                        value={a.status} 
                                        disabled={isCancelled}
                                        onChange={(e)=>{
                                            const newStatus = e.target.value;
                                            let reason = "";
                                            if (newStatus === 'Rejected') {
                                                reason = prompt("Please state the reason for rejection:");
                                                if (reason === null) return; 
                                            }
                                            onUpdateStatus(a.id, newStatus, reason);
                                        }}
                                    >
                                        {isCancelled ? <option>Cancelled</option> : (
                                            <>
                                                <option>Pending</option>
                                                <option>Viewing</option>
                                                <option>Interview</option>
                                                <option>Hired</option>
                                                <option>Rejected</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>
                            
                            {isCancelled && a.cancellationReason && (
                                <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                                    <span className="font-bold">Reason for withdrawal:</span> {a.cancellationReason}
                                </div>
                            )}
                        </div>
                    ) 
                })}
             </div>
          </div>))}</div>
       )}

       {viewApplicant && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-4 border-b pb-2"><h2 className="text-xl font-bold">{viewApplicant.name}'s Profile</h2><button onClick={() => setViewApplicant(null)}><X/></button></div>
               <div className="space-y-4">
                  <div><h3 className="font-bold text-sm text-gray-500">SUMMARY</h3><p className="text-sm">{viewApplicant.bio || "No summary provided."}</p></div>
                  <div><h3 className="font-bold text-sm text-gray-500">EXPERIENCE</h3>{viewApplicant.experience?.map((e,i)=><div key={i} className="text-sm mb-1"><p className="font-bold">{e.role}</p><p>{e.company}</p></div>)}</div>
                  <div><h3 className="font-bold text-sm text-gray-500">EDUCATION</h3>{viewApplicant.education?.map((e,i)=><div key={i} className="text-sm mb-1"><p className="font-bold">{e.course}</p><p>{e.institution}</p></div>)}</div>
                  <div><h3 className="font-bold text-sm text-gray-500">LICENSES</h3>{viewApplicant.licenses?.map((e,i)=><div key={i} className="text-sm mb-1"><p className="font-bold">{e.name}</p><p>{e.issuer}</p></div>)}</div>
                  <div><h3 className="font-bold text-sm text-gray-500">SKILLS</h3><div className="flex gap-1 flex-wrap">{viewApplicant.skills?.map(s=><span key={s} className="bg-gray-100 px-2 py-1 rounded text-xs">{s}</span>)}</div></div>
                  <div><h3 className="font-bold text-sm text-gray-500">LANGUAGES</h3><div className="flex gap-1 flex-wrap">{viewApplicant.languages?.map(s=><span key={s} className="bg-gray-100 px-2 py-1 rounded text-xs">{s}</span>)}</div></div>
                  {viewApplicant.resumeFile && <div className="bg-green-50 p-3 rounded border border-green-200 flex items-center gap-2 mt-4"><FileText className="text-green-600"/><span className="text-sm font-bold flex-1">{viewApplicant.resumeFile}</span><button className="text-xs text-blue-600 underline">Download</button></div>}
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default EmployerDashboard;