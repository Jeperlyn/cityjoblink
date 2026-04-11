// src/pages/SeekerDashboardv1.jsx
// BACKUP VERSION - Default template only
// ⚠️ All functional updates should be made in SeekerDashboard.jsx
// This file is kept as a default reference version

import React, { useState, useRef } from 'react';
import { User, Upload, FilePlus, FileCheck, X, Briefcase } from 'lucide-react';

/**
 * SeekerDashboardv1 - Default Backup Template
 * This is the minimal/default version for reference.
 * All active development should be in SeekerDashboard.jsx
 */
const SeekerDashboardv1 = ({ profile, applications = [], jobs = [], onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [resumeFile, setResumeFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setResumeFile(file);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-6xl font-black text-gray-900 tracking-tighter">CityJobLink</h1>
        </header>

        {/* Tabs */}
        <nav className="flex gap-2 mb-16 bg-white p-3 rounded-full border border-gray-100 shadow-sm w-fit">
          {['overview', 'applications', 'profile'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? 'bg-gray-900 text-white shadow-2xl scale-105'
                  : 'text-gray-400 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Briefcase className="text-cyan-600" size={28} /> Dashboard Overview
            </h2>
            <div className="bg-white p-12 rounded-[3rem] border border-dashed text-center text-gray-400 font-bold">
              Overview content
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-gray-900">My Applications</h2>
            <div className="bg-white p-12 rounded-[3rem] border border-dashed text-center text-gray-400 font-bold">
              Applications content
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-12 rounded-[3.5rem] border shadow-sm">
              <h3 className="font-black text-3xl mb-10 flex items-center gap-4">
                <User size={32} className="text-cyan-500" /> Account Profile
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Resume Builder */}
                <button
                  onClick={() => onNavigate?.('resume-builder')}
                  className="p-10 border-2 border-cyan-100 rounded-[2.5rem] hover:bg-cyan-50 transition-all text-left group"
                >
                  <div className="bg-cyan-100 text-cyan-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <FilePlus size={24} />
                  </div>
                  <h4 className="font-black text-xl mb-2">Resume Builder</h4>
                  <p className="text-xs text-gray-500 font-medium">Create optimized resume</p>
                </button>

                {/* Resume Upload */}
                <div className="p-10 border-2 border-dashed border-gray-200 rounded-[2.5rem] hover:bg-gray-50 transition-all text-left">
                  <div className="bg-gray-100 text-gray-400 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                    <Upload size={24} />
                  </div>
                  <h4 className="font-black text-xl mb-2">Upload Resume</h4>

                  {!resumeFile ? (
                    <>
                      <p className="text-xs text-gray-500 font-medium mb-6">Upload PDF resume</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-black text-cyan-600 uppercase tracking-widest hover:underline"
                      >
                        Select File
                      </button>
                    </>
                  ) : (
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <FileCheck className="text-green-500" size={20} />
                        <div>
                          <p className="text-xs font-black text-gray-800 truncate">{resumeFile.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">PDF</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setResumeFile(null)}
                        className="p-2 hover:bg-red-50 text-red-400 rounded-full transition-colors"
                      >
                        <X size={16} />
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
      </div>
    </div>
  );
};

export default SeekerDashboardv1;

