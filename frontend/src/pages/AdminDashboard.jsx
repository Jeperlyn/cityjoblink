// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { File, Calendar, Plus, Users, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';

// ✅ CONSTANT: Base URL para sa mga images galing sa Laravel Storage
// Siguraduhin nag-run ka ng 'php artisan storage:link' sa Laravel terminal
const STORAGE_URL = "http://localhost:8000/storage/";

const AdminDashboard = ({ employers, onVerifyEmployer, jobFairs, onAddJobFair }) => {
  const [activeTab, setActiveTab] = useState('employers'); 
  
  // MODAL STATES
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFairSuccessModal, setShowFairSuccessModal] = useState(false);
  const [selectedEmployerId, setSelectedEmployerId] = useState(null);

  // Form State for New Job Fair
  const [newFair, setNewFair] = useState({
      title: '',
      location: '',
      date: '',
      time: '',
      organizer: 'PESO QC & DOLE',
      description: '',
      imageFile: null, 
      highlightsString: ''
  });

  const handleImageChange = (e) => {
      if (e.target.files && e.target.files[0]) {
          setNewFair({ ...newFair, imageFile: e.target.files[0] });
      }
  };

  const getPreviewImageUrl = () => {
      if (newFair.imageFile) {
          return URL.createObjectURL(newFair.imageFile);
      }
      return 'https://via.placeholder.com/400x200?text=No+Image+Selected'; 
  };

  const handlePostFair = (e) => {
      e.preventDefault();
      const highlights = newFair.highlightsString.split(',').map(h => h.trim()).filter(h => h !== "");
      
      onAddJobFair({
          ...newFair,
          highlights: highlights
      });

      setNewFair({
          title: '', location: '', date: '', time: '', organizer: 'PESO QC & DOLE', description: '', 
          imageFile: null, 
          highlightsString: ''
      });

      setShowFairSuccessModal(true);
  };

  // ✅ LOGIC: Open Document in New Tab
  const handleViewDocs = (employer) => {
      // Kung File Object (galing sa upload preview na hindi pa saved)
      if (employer.qcIdFile instanceof File) {
          const url = URL.createObjectURL(employer.qcIdFile);
          window.open(url, '_blank');
      } 
      // Kung String (galing sa Laravel Database: 'id_images/filename.jpg')
      else if (employer.id_image) {
          window.open(`${STORAGE_URL}${employer.id_image}`, '_blank');
      }
      else {
          alert("No document file found.");
      }
  };

  // HANDLERS FOR EMPLOYER MODALS
  const handleApproveClick = (empId) => {
      setSelectedEmployerId(empId);
      setShowApproveModal(true);
  };

  const confirmApprove = () => {
      if (selectedEmployerId) {
          onVerifyEmployer(selectedEmployerId, true);
          setShowApproveModal(false);
          setSelectedEmployerId(null);
      }
  };

  const handleRejectClick = (empId) => {
      setSelectedEmployerId(empId);
      setShowRejectModal(true);
  };

  const confirmReject = () => {
      if (selectedEmployerId) {
          onVerifyEmployer(selectedEmployerId, false);
          setShowRejectModal(false);
          setSelectedEmployerId(null);
      }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-gray-50 relative">
      <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          <div className="flex bg-white rounded-lg p-1 shadow-sm border">
              <button 
                onClick={() => setActiveTab('employers')} 
                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'employers' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                  <Users size={16} className="inline mr-2"/> Verify Employers
              </button>
              <button 
                onClick={() => setActiveTab('jobfairs')} 
                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'jobfairs' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                  <Calendar size={16} className="inline mr-2"/> Manage Job Fairs
              </button>
          </div>
      </div>

      {/* --- TAB 1: EMPLOYER VERIFICATION --- */}
      {activeTab === 'employers' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
           <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
               <h2 className="font-bold text-lg text-gray-800">Employer Accounts</h2>
               <span className="text-sm text-gray-500">Total: {employers.length}</span>
           </div>
           <table className="w-full text-sm text-left">
              <thead className="bg-white border-b text-gray-600 uppercase text-xs">
                <tr>
                    <th className="px-6 py-4">Company Name</th>
                    <th className="px-6 py-4">ID / Documents</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employers.length === 0 ? (
                    <tr><td colSpan="4" className="text-center p-8 text-gray-500 italic">No employers found.</td></tr>
                ) : (
                    employers.map(e => (
                        <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <p className="font-bold text-gray-900">{e.companyName || e.name}</p>
                                <p className="text-xs text-gray-500">{e.email}</p>
                            </td>
                            <td className="px-6 py-4">
                                {/* ✅ FIX: Check uploadedDocs boolean OR existence of id_image string */}
                                {(e.uploadedDocs || e.id_image) ? (
                                    <button 
                                        onClick={() => handleViewDocs(e)} 
                                        className="text-blue-600 flex gap-1 items-center font-bold hover:underline bg-blue-50 px-3 py-1.5 rounded-full text-xs transition-colors border border-blue-100"
                                    >
                                        <File size={14}/> View ID
                                    </button> 
                                ) : (
                                    <span className="text-gray-400 italic text-xs">No Upload</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {e.isVerified ? 
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1 w-fit"><CheckCircle size={12}/> Verified</span> 
                                    : (e.uploadedDocs || e.id_image) 
                                        ? <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold border border-orange-200 flex items-center gap-1 w-fit"><Clock size={12}/> Pending</span>
                                        : <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs font-bold border border-gray-200">Incomplete</span>
                                }
                            </td>
                            <td className="px-6 py-4">
                                {/* ✅ FIX: Show buttons if Pending AND has Docs */}
                                {(!e.isVerified && (e.uploadedDocs || e.id_image)) && (
                                    <div className="flex gap-2">
                                        <button onClick={()=>handleApproveClick(e.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-sm">Approve</button>
                                        <button onClick={()=>handleRejectClick(e.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-sm">Reject</button>
                                    </div>
                                )}
                                {e.isVerified && <span className="text-gray-400 text-xs">Action Taken</span>}
                            </td>
                        </tr>
                    ))
                )}
              </tbody>
           </table>
        </div>
      )}

      {/* --- TAB 2: MANAGE JOB FAIRS --- */}
      {activeTab === 'jobfairs' && (
          <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* LEFT: FORM */}
              <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
                  <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><Plus size={20}/> Create New Job Fair</h2>
                  <form onSubmit={handlePostFair} className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Event Title</label>
                          <input required className="w-full border p-2 rounded bg-gray-50 focus:border-black outline-none transition-colors" placeholder="e.g. QC Mega Job Fair" value={newFair.title} onChange={e=>setNewFair({...newFair, title: e.target.value})}/>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                              <input required className="w-full border p-2 rounded bg-gray-50 focus:border-black outline-none transition-colors" placeholder="e.g. Dec 05, 2025" value={newFair.date} onChange={e=>setNewFair({...newFair, date: e.target.value})}/>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Time</label>
                              <input required className="w-full border p-2 rounded bg-gray-50 focus:border-black outline-none transition-colors" placeholder="e.g. 8:00 AM - 5:00 PM" value={newFair.time} onChange={e=>setNewFair({...newFair, time: e.target.value})}/>
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Venue / Location</label>
                          <input required className="w-full border p-2 rounded bg-gray-50 focus:border-black outline-none transition-colors" placeholder="e.g. QC Hall Quadrangle" value={newFair.location} onChange={e=>setNewFair({...newFair, location: e.target.value})}/>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Organizer</label>
                          <input className="w-full border p-2 rounded bg-gray-50 focus:border-black outline-none transition-colors" value={newFair.organizer} onChange={e=>setNewFair({...newFair, organizer: e.target.value})}/>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Cover Image</label>
                          <div className="flex items-center gap-2">
                              <input 
                                  type="file" 
                                  accept="image/*"
                                  className="w-full border p-2 rounded bg-gray-50 text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 transition-colors"
                                  onChange={handleImageChange}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                          <textarea required className="w-full border p-2 rounded bg-gray-50 h-24 focus:border-black outline-none transition-colors" placeholder="Event details..." value={newFair.description} onChange={e=>setNewFair({...newFair, description: e.target.value})}/>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Highlights (Comma separated)</label>
                          <input className="w-full border p-2 rounded bg-gray-50 focus:border-black outline-none transition-colors" placeholder="e.g. Free Printing, Career Coaching, Spot Hiring" value={newFair.highlightsString} onChange={e=>setNewFair({...newFair, highlightsString: e.target.value})}/>
                      </div>
                      <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors shadow-md">Post Job Fair Event</button>
                  </form>
              </div>

              {/* RIGHT: LIVE PREVIEW & LIST */}
              <div className="space-y-6">
                  <div className="bg-gray-100 p-4 rounded-xl border border-dashed border-gray-300">
                      <p className="text-center text-xs font-bold text-gray-400 uppercase mb-4">Seeker View Preview</p>
                      <div className="bg-white rounded-xl border shadow-sm overflow-hidden transform scale-95 origin-top">
                          <div className="h-40 bg-gray-200 relative">
                              <img src={getPreviewImageUrl()} alt="Preview" className="w-full h-full object-cover"/>
                          </div>
                          <div className="p-6">
                              <div className="flex gap-2 mb-2">
                                  <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded uppercase">Mega Event</span>
                                  <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded uppercase">{newFair.organizer}</span>
                              </div>
                              <h3 className="font-bold text-xl mb-2">{newFair.title || "Event Title"}</h3>
                              <div className="text-sm text-gray-600 space-y-1 mb-4">
                                  <div className="flex items-center gap-2"><MapPin size={14} className="text-cyan-600"/> {newFair.location || "Location"}</div>
                                  <div className="flex items-center gap-2"><Calendar size={14} className="text-cyan-600"/> {newFair.date || "Date"}</div>
                                  <div className="flex items-center gap-2"><Clock size={14} className="text-cyan-600"/> {newFair.time || "Time"}</div>
                              </div>
                              <p className="text-sm text-gray-500 line-clamp-3 mb-4">{newFair.description || "Event description will appear here..."}</p>
                              {newFair.highlightsString && (
                                  <div className="flex flex-wrap gap-2">
                                      {newFair.highlightsString.split(',').map((h, i) => (
                                          h.trim() && <span key={i} className="text-[10px] bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-full font-medium flex items-center gap-1"><CheckCircle size={10}/> {h}</span>
                                      ))}
                                  </div>
                              )}
                              <div className="mt-4 w-full bg-green-100 text-green-700 font-bold py-2 rounded text-center text-sm">You're Going!</div>
                          </div>
                      </div>
                  </div>

                  <div>
                      <h3 className="font-bold text-gray-700 mb-3">Active Job Fairs ({jobFairs.length})</h3>
                      <div className="space-y-3">
                          {jobFairs.map(f => (
                              <div key={f.id} className="bg-white p-3 rounded border flex justify-between items-center shadow-sm">
                                  <div className="flex gap-3 items-center">
                                      <img src={f.image} alt="" className="w-10 h-10 rounded object-cover bg-gray-200"/>
                                      <div>
                                          <p className="font-bold text-sm">{f.title}</p>
                                          <p className="text-xs text-gray-500">{f.date}</p>
                                      </div>
                                  </div>
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold text-gray-600">{f.participants?.length || 0} Registered</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* APPROVE MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in zoom-in duration-200">
                <div className="bg-green-50 p-6 flex flex-col items-center text-center border-b border-green-100">
                    <div className="p-4 bg-green-100 text-green-600 rounded-full mb-4"><CheckCircle size={40} /></div>
                    <h3 className="text-xl font-bold text-gray-900">Approve Employer?</h3>
                    <p className="text-sm text-gray-600 mt-2">This employer will be able to post jobs immediately.</p>
                </div>
                <div className="p-6 flex gap-3">
                    <button onClick={confirmApprove} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow">Confirm</button>
                    <button onClick={() => setShowApproveModal(false)} className="flex-1 bg-white text-gray-600 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors border">Cancel</button>
                </div>
            </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in zoom-in duration-200">
                <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
                    <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4"><XCircle size={40} /></div>
                    <h3 className="text-xl font-bold text-gray-900">Reject Employer?</h3>
                    <p className="text-sm text-gray-600 mt-2">The employer will be notified to re-upload documents.</p>
                </div>
                <div className="p-6 flex gap-3">
                    <button onClick={confirmReject} className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors shadow">Reject</button>
                    <button onClick={() => setShowRejectModal(false)} className="flex-1 bg-white text-gray-600 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors border">Cancel</button>
                </div>
            </div>
        </div>
      )}

      {/* JOB FAIR POSTED SUCCESS MODAL */}
      {showFairSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in zoom-in duration-200">
                <div className="bg-green-50 p-6 flex flex-col items-center text-center border-b border-green-100">
                    <div className="p-4 bg-green-100 text-green-600 rounded-full mb-4">
                        <CheckCircle size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Job Fair Posted!</h3>
                    <p className="text-sm text-gray-600 mt-2">The event is now live and visible to all job seekers.</p>
                </div>
                <div className="p-6">
                    <button onClick={() => setShowFairSuccessModal(false)} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg">Awesome</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;