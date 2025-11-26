// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { File, Calendar, Plus, Users, MapPin, Clock, CheckCircle, Image as ImageIcon } from 'lucide-react';

const AdminDashboard = ({ employers, onVerifyEmployer, jobFairs, onAddJobFair }) => {
  const [activeTab, setActiveTab] = useState('employers'); // 'employers' or 'jobfairs'
  
  // Form State for New Job Fair
  const [newFair, setNewFair] = useState({
      title: '',
      location: '',
      date: '',
      time: '',
      organizer: 'PESO QC & DOLE',
      description: '',
      imageFile: null, // 👇 Changed: Now stores the File object, not a URL string
      highlightsString: ''
  });

  // 👇 NEW: Handler for file input change
  const handleImageChange = (e) => {
      if (e.target.files && e.target.files[0]) {
          setNewFair({ ...newFair, imageFile: e.target.files[0] });
      }
  };

  // 👇 NEW: Helper to get image URL for preview
  const getPreviewImageUrl = () => {
      if (newFair.imageFile) {
          return URL.createObjectURL(newFair.imageFile);
      }
      return 'https://via.placeholder.com/400x200?text=No+Image+Selected'; // Default placeholder
  };

  const handlePostFair = (e) => {
      e.preventDefault();
      const highlights = newFair.highlightsString.split(',').map(h => h.trim()).filter(h => h !== "");
      
      // Pass the entire newFair object including the imageFile
      onAddJobFair({
          ...newFair,
          highlights: highlights
      });

      // Reset Form
      setNewFair({
          title: '', location: '', date: '', time: '', organizer: 'PESO QC & DOLE', description: '', 
          imageFile: null, // Reset image file
          highlightsString: ''
      });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-gray-50">
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
           <div className="p-6 border-b"><h2 className="font-bold text-lg">Pending Verifications</h2></div>
           <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b text-gray-600 uppercase text-xs">
                <tr>
                    <th className="px-6 py-3">Company</th>
                    <th className="px-6 py-3">Documents</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {employers.length === 0 ? (
                    <tr><td colSpan="4" className="text-center p-8 text-gray-500">No employers to verify.</td></tr>
                ) : (
                    employers.map(e => (
                        <tr key={e.id} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-bold text-gray-800">{e.companyName || e.name}</td>
                            <td className="px-6 py-4">
                                {e.uploadedDocs ? 
                                    <button onClick={()=>alert("Opening PDF Viewer...")} className="text-blue-600 flex gap-1 items-center font-bold hover:underline bg-blue-50 px-2 py-1 rounded">
                                        <File size={14}/> View Docs
                                    </button> 
                                    : <span className="text-gray-400 italic">None</span>
                                }
                            </td>
                            <td className="px-6 py-4">
                                {e.isVerified ? 
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">Verified</span> 
                                    : <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold border border-orange-200">Pending</span>
                                }
                            </td>
                            <td className="px-6 py-4">
                                {e.uploadedDocs && !e.isVerified && (
                                    <div className="flex gap-2">
                                        <button onClick={()=>onVerifyEmployer(e.id, true)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold transition-colors">Approve</button>
                                        <button onClick={()=>onVerifyEmployer(e.id, false)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold transition-colors">Reject</button>
                                    </div>
                                )}
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
          <div className="grid lg:grid-cols-2 gap-8">
              
              {/* LEFT: FORM */}
              <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
                  <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><Plus size={20}/> Create New Job Fair</h2>
                  <form onSubmit={handlePostFair} className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Event Title</label>
                          <input required className="w-full border p-2 rounded bg-gray-50" placeholder="e.g. QC Mega Job Fair" value={newFair.title} onChange={e=>setNewFair({...newFair, title: e.target.value})}/>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                              <input required className="w-full border p-2 rounded bg-gray-50" placeholder="e.g. Dec 05, 2025" value={newFair.date} onChange={e=>setNewFair({...newFair, date: e.target.value})}/>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Time</label>
                              <input required className="w-full border p-2 rounded bg-gray-50" placeholder="e.g. 8:00 AM - 5:00 PM" value={newFair.time} onChange={e=>setNewFair({...newFair, time: e.target.value})}/>
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Venue / Location</label>
                          <input required className="w-full border p-2 rounded bg-gray-50" placeholder="e.g. QC Hall Quadrangle" value={newFair.location} onChange={e=>setNewFair({...newFair, location: e.target.value})}/>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Organizer</label>
                          <input className="w-full border p-2 rounded bg-gray-50" value={newFair.organizer} onChange={e=>setNewFair({...newFair, organizer: e.target.value})}/>
                      </div>
                      {/* 👇 UPDATED: File Input for Image */}
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Cover Image</label>
                          <div className="flex items-center gap-2">
                              <input 
                                  type="file" 
                                  accept="image/*"
                                  className="w-full border p-2 rounded bg-gray-50 text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                                  onChange={handleImageChange}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                          <textarea required className="w-full border p-2 rounded bg-gray-50 h-24" placeholder="Event details..." value={newFair.description} onChange={e=>setNewFair({...newFair, description: e.target.value})}/>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Highlights (Comma separated)</label>
                          <input className="w-full border p-2 rounded bg-gray-50" placeholder="e.g. Free Printing, Career Coaching, Spot Hiring" value={newFair.highlightsString} onChange={e=>setNewFair({...newFair, highlightsString: e.target.value})}/>
                      </div>
                      <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors">Post Job Fair Event</button>
                  </form>
              </div>

              {/* RIGHT: LIVE PREVIEW & LIST */}
              <div className="space-y-6">
                  <div className="bg-gray-100 p-4 rounded-xl border border-dashed border-gray-300">
                      <p className="text-center text-xs font-bold text-gray-400 uppercase mb-4">Seeker View Preview</p>
                      
                      {/* PREVIEW CARD */}
                      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                          <div className="h-40 bg-gray-200 relative">
                              {/* 👇 UPDATED: Uses getPreviewImageUrl() */}
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

                  {/* EXISTING LIST */}
                  <div>
                      <h3 className="font-bold text-gray-700 mb-3">Active Job Fairs ({jobFairs.length})</h3>
                      <div className="space-y-3">
                          {jobFairs.map(f => (
                              <div key={f.id} className="bg-white p-3 rounded border flex justify-between items-center">
                                  <div className="flex gap-3 items-center">
                                      <img src={f.image} alt="" className="w-10 h-10 rounded object-cover bg-gray-200"/>
                                      <div>
                                          <p className="font-bold text-sm">{f.title}</p>
                                          <p className="text-xs text-gray-500">{f.date}</p>
                                      </div>
                                  </div>
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold">{f.participants?.length || 0} Registered</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;