// src/pages/EmployerDashboard.jsx
import React, { useState, useRef } from 'react';
import { Edit3, User, X, FileText, ChevronUp, ChevronDown, MessageCircle, AlertCircle, CheckCircle, UploadCloud, Clock, Building, MapPin, Globe, Phone, Download, CreditCard, Calendar, Smile, Mail } from 'lucide-react'; 

const EmployerDashboard = ({ profile, jobs, applications, seekers, onPostJob, onUpdateJob, onUpdateProfile, onUploadDocs, onOpenChat, onUpdateStatus }) => {
  const [view, setView] = useState('dashboard');
  const [newJob, setNewJob] = useState({ title: '', salary: '', location: '', type: 'Full-time', requiredSkills: '', description: '' });
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const fileInputRef = useRef(null);
  
  // ✅ FIX 1: State to hold the actual FILE object
  const [selectedFile, setSelectedFile] = useState(null); 
  const [uploadedFileName, setUploadedFileName] = useState(null);

  const [viewApplicant, setViewApplicant] = useState(null);
  const [expandedJob, setExpandedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);

  const myJobs = jobs.filter(j => j.employerId === profile.id);

  const handlePostJob = () => {
      const skills = newJob.requiredSkills.split(',').map(s => s.trim()).filter(s => s !== ""); 

      if (editingJob) {
          onUpdateJob({
              ...newJob, 
              id: editingJob.id, 
              requiredSkills: skills, 
              employerId: profile.id, 
              company: profile.companyName, 
              status: editingJob.status
          });
      } else {
          onPostJob({
              ...newJob, 
              id: Date.now(), 
              requiredSkills: skills, 
              employerId: profile.id, 
              company: profile.companyName, 
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

  // ✅ FIX 2: Correctly store the File object
  const handleFileChange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
          setSelectedFile(file); // Save the object for uploading
          setUploadedFileName(file.name); // Save name for display
      }
  };

  // ✅ FIX 3: Pass the File object to the App.jsx function
  const handleSubmitDocs = () => {
      if (selectedFile) {
          onUploadDocs(selectedFile); // 👈 Passing the FILE, not the ID
          setShowSuccessModal(true); 
          // Optional: Reset file after submit
          setSelectedFile(null);
          setUploadedFileName(null);
      } else {
          alert("Please select a file first.");
      }
  };

  const handleDownloadResume = () => {
      if (viewApplicant && viewApplicant.resumeData) {
          const link = document.createElement('a');
          link.href = viewApplicant.resumeData;
          link.download = viewApplicant.resumeFile || "resume_download.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } else {
          alert("Resume file content not found or corrupted.");
      }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
       
       {view === 'dashboard' && (
         <>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900">
                        <Building className="text-cyan-600"/> Company Information
                    </h3>
                    <button onClick={()=>setView('post')} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-gray-800 transition-colors flex items-center gap-2">
                        <Edit3 size={16}/> Post New Job
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-gray-500 text-xs font-bold uppercase mb-1">Company Name</p>
                        <p className="font-bold text-gray-900">{profile.companyName}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-gray-500 text-xs font-bold uppercase mb-1">Industry</p>
                        <p className="font-bold text-gray-900">{profile.industry}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-1"><MapPin size={14} className="text-gray-400"/><p className="text-gray-500 text-xs font-bold uppercase">Address</p></div>
                        <p className="font-bold text-gray-900">{profile.companyAddress || "Not provided"}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-1"><Phone size={14} className="text-gray-400"/><p className="text-gray-500 text-xs font-bold uppercase">Contact No.</p></div>
                        <p className="font-bold text-gray-900">{profile.contactNumber || "Not provided"}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 md:col-span-2">
                        <div className="flex items-center gap-2 mb-1"><Globe size={14} className="text-gray-400"/><p className="text-gray-500 text-xs font-bold uppercase">Website</p></div>
                        {profile.companyWebsite ? (<a href={profile.companyWebsite} target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:underline cursor-pointer">{profile.companyWebsite}</a>) : (<p className="font-bold text-gray-900">Not provided</p>)}
                    </div>
                </div>
           </div>
           
           {!profile.isVerified && (
             <div className="bg-orange-50 border-orange-200 border p-4 rounded mb-6">
                <h3 className="font-bold text-orange-800 flex items-center gap-2"><AlertCircle size={20}/> Verification Required</h3>
                {profile.uploadedDocs ? (
                    <div className="mt-2 bg-white p-3 rounded border border-orange-100 flex items-center gap-2 text-orange-700 font-bold"><Clock size={18}/> Pending Admin Review</div>
                ) : (
                    <div className="mt-4">
                        <p className="text-sm text-orange-800 mb-2">Please upload your business permit or relevant documents to verify your account.</p>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.png,.doc,.docx"/>
                        <div className={`border-2 border-dashed p-6 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors flex flex-col items-center justify-center gap-2 mb-4 ${uploadedFileName ? 'bg-orange-100 border-orange-400' : 'border-orange-300'}`} onClick={() => fileInputRef.current.click()}>
                            {uploadedFileName ? (<><FileText className="text-orange-600" size={32}/><span className="font-bold text-orange-800">{uploadedFileName}</span><span className="text-xs text-orange-600">Click to change file</span></>) : (<><UploadCloud className="text-orange-400" size={32}/><span className="text-orange-800 font-medium">Click to Upload Documents</span><span className="text-xs text-orange-500">(PDF, JPG, PNG)</span></>)}
                        </div>
                        {uploadedFileName && <button onClick={handleSubmitDocs} className="bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-orange-700 transition-colors w-full sm:w-auto">Submit Verification Request</button>}
                    </div>
                )}
             </div>
           )}
         </>
       )}

       {view === 'post' ? (
         <div className="bg-white p-6 rounded-xl border border-gray-200 max-w-2xl mx-auto space-y-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">{editingJob ? 'Edit Job' : 'Create Job Post'}</h2>
                <button onClick={()=>{setView('dashboard'); setEditingJob(null)}} className="text-gray-400 hover:text-black"><X/></button>
            </div>
            <div className="grid md:grid-cols-2 gap-4"><input className="border w-full p-3 rounded bg-gray-50" placeholder="Job Title" value={newJob.title} onChange={e=>setNewJob({...newJob, title:e.target.value})}/><input className="border w-full p-3 rounded bg-gray-50" placeholder="Location (e.g. Quezon City)" value={newJob.location} onChange={e=>setNewJob({...newJob, location:e.target.value})}/></div>
            <div className="grid md:grid-cols-2 gap-4"><input className="border w-full p-3 rounded bg-gray-50" placeholder="Salary Range" value={newJob.salary} onChange={e=>setNewJob({...newJob, salary:e.target.value})}/><select className="border w-full p-3 rounded bg-gray-50" value={newJob.type} onChange={e=>setNewJob({...newJob, type:e.target.value})}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Freelance</option></select></div>
            <textarea className="border w-full p-3 rounded h-40 bg-gray-50" placeholder="Job Description & Responsibilities..." value={newJob.description} onChange={e=>setNewJob({...newJob, description:e.target.value})}/>
            <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Required Skills (Comma separated)</label><input className="border w-full p-3 rounded bg-gray-50" placeholder="e.g. Communication, Excel, Sales" value={newJob.requiredSkills} onChange={e=>setNewJob({...newJob, requiredSkills:e.target.value})}/></div>
            <div className="flex gap-2 pt-2"><button disabled={!profile.isVerified} onClick={handlePostJob} className="bg-black text-white flex-1 py-3 rounded-lg font-bold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed">{editingJob ? 'Update Job' : 'Post Job Now'}</button></div>
         </div>
       ) : (
         <div className="space-y-4">
           <h3 className="font-bold text-gray-800 text-lg">My Job Posts ({myJobs.length})</h3>
           {myJobs.length === 0 ? (<div className="text-center py-12 bg-gray-50 rounded border border-dashed text-gray-400">You haven't posted any jobs yet.</div>) : (myJobs.map(j => (<div key={j.id} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                   <div className="flex justify-between items-start"><div><h3 className="font-bold text-xl text-gray-900">{j.title}</h3><div className="flex gap-2 mt-1 mb-2"><span className={`text-xs px-2 py-1 rounded font-bold uppercase ${j.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{j.status}</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{j.type}</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{j.salary}</span></div></div><div className="flex gap-2"><button onClick={()=>setExpandedJob(expandedJob === j.id ? null : j.id)} className="text-sm border px-3 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-1">{expandedJob===j.id?<ChevronUp size={16}/>:<ChevronDown size={16}/>} Details</button><button onClick={()=>handleEditJob(j)} className="text-sm bg-black text-white px-3 py-2 rounded-lg font-medium hover:bg-gray-800 flex items-center gap-1"><Edit3 size={16}/> Edit</button></div></div>
                   {expandedJob === j.id && <div className="mt-4 pt-4 border-t text-sm text-gray-600 bg-gray-50 p-4 rounded"><p className="font-bold mb-1">Description:</p>{j.description}</div>}
                   <div className="mt-4 border-t pt-4"><h4 className="font-bold text-xs text-gray-500 uppercase mb-3 flex items-center gap-1"><User size={14}/> Applicants ({applications.filter(a=>a.jobId===j.id).length})</h4>{applications.filter(a=>a.jobId===j.id).length === 0 ? <p className="text-sm text-gray-400 italic">No applicants yet.</p> : applications.filter(a=>a.jobId===j.id).map(a => { const s = seekers.find(u=>u.id===a.seekerId); const isCancelled = a.status === 'Cancelled'; return (<div key={a.id} className={`flex flex-col gap-2 p-3 mt-2 rounded-lg border transition-colors ${isCancelled ? 'bg-gray-100 border-gray-200 opacity-70' : 'bg-white border-gray-200 shadow-sm'}`}><div className="flex flex-wrap justify-between items-center gap-2"><div className="flex items-center gap-3"><div className={`w-8 h-8 flex items-center justify-center rounded-full ${isCancelled ? 'bg-gray-300 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>{isCancelled ? <AlertCircle size={16}/> : <User size={16}/>}</div><div><span className={`font-bold text-sm block ${isCancelled ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{s?.name}</span><span className="text-xs text-gray-500">{a.date}</span>{isCancelled && <span className="text-xs text-red-500 font-bold ml-2">(Withdrew Application)</span>}</div></div><div className="flex gap-2 items-center"><button onClick={() => !isCancelled && handleMessageClick(s)} disabled={isCancelled} title="Message Applicant" className={`p-2 rounded-lg ${isCancelled ? 'text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}><MessageCircle size={18}/></button><button onClick={()=> !isCancelled && setViewApplicant(s)} disabled={isCancelled} className={`text-xs border px-3 py-2 rounded-lg font-medium ${isCancelled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-700'}`}>View Resume</button><select className={`text-xs border rounded-lg p-2 font-medium focus:outline-none ${isCancelled ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`} value={a.status} disabled={isCancelled} onChange={(e)=>{ const newStatus = e.target.value; let reason = ""; if (newStatus === 'Rejected') { reason = prompt("Please state the reason for rejection:"); if (reason === null) return; } onUpdateStatus(a.id, newStatus, reason); }}>{isCancelled ? <option>Cancelled</option> : (<><option>Pending</option><option>Viewing</option><option>Interview</option><option>Hired</option><option>Rejected</option></>)}</select></div></div>{isCancelled && a.cancellationReason && (<div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 italic">"<span className="font-bold">Reason:</span> {a.cancellationReason}"</div>)}</div>) })}</div>
               </div>))
           )}
         </div>
       )}

       {/* PROFILE CARD MODAL */}
       {viewApplicant && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl transform transition-all scale-100 animate-in zoom-in duration-200">
               
               {/* Header */}
               <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
                   <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                       <User className="text-cyan-600"/> Applicant Profile
                   </h2>
                   <button onClick={() => setViewApplicant(null)} className="text-gray-400 hover:text-black transition-colors">
                       <X size={24}/>
                   </button>
               </div>

               {/* Body: DISPLAYS PERSONAL INFO */}
               <div className="p-6 bg-gray-50">
                   <div className="grid grid-cols-1 gap-4 text-sm">
                       <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                           <p className="text-xs font-bold text-gray-400 uppercase mb-1">Full Name</p>
                           <p className="text-lg font-bold text-gray-900">{viewApplicant.name}</p>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                               <div className="flex items-center gap-2 mb-1">
                                   <CreditCard size={14} className="text-gray-400"/>
                                   <p className="text-xs font-bold text-gray-400 uppercase">QCitizen ID</p>
                               </div>
                               <p className="font-semibold text-gray-800">{viewApplicant.qcId || "N/A"}</p>
                           </div>
                           
                           <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                               <div className="flex items-center gap-2 mb-1">
                                   <Mail size={14} className="text-gray-400"/>
                                   <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                               </div>
                               <p className="font-semibold text-gray-800 truncate">{viewApplicant.email}</p>
                           </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                               <div className="flex items-center gap-2 mb-1">
                                   <Calendar size={14} className="text-gray-400"/>
                                   <p className="text-xs font-bold text-gray-400 uppercase">Birthday</p>
                               </div>
                               <p className="font-semibold text-gray-800">
                                   {viewApplicant.bdayMonth} {viewApplicant.bdayDay}, {viewApplicant.bdayYear}
                               </p>
                           </div>

                           <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                               <div className="flex items-center gap-2 mb-1">
                                   <Smile size={14} className="text-gray-400"/>
                                   <p className="text-xs font-bold text-gray-400 uppercase">Gender</p>
                               </div>
                               <p className="font-semibold text-gray-800">{viewApplicant.gender || "Not specified"}</p>
                           </div>
                       </div>
                   </div>
               </div>

               {/* Footer with Download Button */}
               <div className="p-4 border-t bg-white flex items-center justify-between">
                   <div className="flex items-center gap-2 text-sm text-gray-500">
                       <FileText size={16} className="text-red-500"/> 
                       <span className="truncate max-w-[200px] font-medium">{viewApplicant.resumeFile || "No Resume File"}</span>
                   </div>
                   
                   {viewApplicant.resumeFile && (
                       <button 
                           onClick={handleDownloadResume} 
                           className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg shadow-md transition-all"
                       >
                           <Download size={16}/> Download PDF
                       </button>
                   )}
               </div>
            </div>
        </div>
       )}

       {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in zoom-in duration-200">
                <div className="bg-green-50 p-6 flex flex-col items-center text-center border-b border-green-100">
                    <div className="p-4 bg-green-100 text-green-600 rounded-full mb-4">
                        <CheckCircle size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Request Sent!</h3>
                    <p className="text-sm text-gray-600 mt-2">Your verification documents have been submitted to the Admin.</p>
                </div>
                <div className="p-6">
                    <button onClick={() => setShowSuccessModal(false)} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg">OK</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default EmployerDashboard;