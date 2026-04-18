// src/pages/SeekerDashboard.jsx
import React, { useState, useEffect, useRef } from 'react'; 
import { 
  Trash2, FileText, ChevronDown, ChevronUp, ChevronLeft, Search,
  Briefcase, Info, User, Users, Lock, CheckCircle, XCircle,
  Star, Target, Zap, TrendingUp, Upload, FilePlus, Bookmark,
  ExternalLink, Clock, MapPin, FileCheck, X, AlertCircle, Calendar, Eye, LayoutDashboard
} from 'lucide-react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { API_BASE, buildDocumentViewUrl } from '../lib/apiBase';
import HeroBanner from '../components/ui/HeroBanner';
import loginBg from '../assets/img/login.jpg';
import { formatQcId338, parseQcQrPayload } from '../lib/qcQrParser';
import { EDUCATION_MINIMUM_OPTIONS, inferEducationLevel } from '../lib/educationLevels';

// =====================================================
// 1. COMPONENT: APPLICATION PROGRESS STEPPER
// =====================================================
const ApplicationProcessSteps = ({ status }) => {
  const steps = [
    { id: 'Pending', label: 'Pending', icon: <FileText size={16}/> },
    { id: 'Interview', label: 'Interview', icon: <Zap size={16}/> },
    { id: 'Decision', label: 'Decision', icon: <TrendingUp size={16}/> }
  ];

  const getStepStatus = (stepId, currentStatus) => {
    const statusOrder = ['Pending', 'Interview', 'Hired', 'Declined'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    if (stepId === 'Decision') {
      if (currentStatus === 'Hired') return 'bg-green-500 text-white border-green-500';
      if (currentStatus === 'Declined') return 'bg-red-500 text-white border-red-500';
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

const normalizeExternalUrl = (value) => {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
};

const inferEmployerLinkLabel = (url) => {
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    if (hostname.includes('linkedin.')) return 'LinkedIn';
    if (hostname.includes('github.')) return 'GitHub';
    if (hostname.includes('facebook.') || hostname.includes('fb.')) return 'Facebook';
    if (hostname.includes('instagram.')) return 'Instagram';
    if (hostname.includes('twitter.') || hostname.includes('x.')) return 'X';
    if (hostname.includes('tiktok.')) return 'TikTok';

    return 'Website';
  } catch {
    return 'Website';
  }
};

const buildEmployerLinks = (job) => {
  if (!job) return [];

  const candidates = [
    { label: 'Website', value: job.companyWebsite || job.company_website || job.employerWebsite || job.website },
    { label: 'LinkedIn', value: job.linkedinUrl || job.linkedin_url || job.employerLinkedIn || job.companyLinkedIn },
    { label: 'GitHub', value: job.githubUrl || job.github_url || job.employerGithub || job.companyGithub },
    { label: 'Facebook', value: job.facebookUrl || job.facebook_url || job.employerFacebook || job.companyFacebook },
    { label: 'Instagram', value: job.instagramUrl || job.instagram_url || job.employerInstagram || job.companyInstagram },
    { label: 'X', value: job.twitterUrl || job.twitter_url || job.xUrl || job.x_url || job.employerX },
  ];

  const links = [];
  const seenUrls = new Set();

  candidates.forEach((candidate) => {
    const normalizedUrl = normalizeExternalUrl(candidate.value);
    if (!normalizedUrl || seenUrls.has(normalizedUrl)) {
      return;
    }

    seenUrls.add(normalizedUrl);
    links.push({
      label: candidate.label === 'Website' ? inferEmployerLinkLabel(normalizedUrl) : candidate.label,
      url: normalizedUrl,
    });
  });

  return links;
};

const EmployerLinks = ({ job, compact = false, containerClassName = '' }) => {
  const links = buildEmployerLinks(job);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className={`${compact ? 'space-y-2' : 'space-y-3'} ${containerClassName}`.trim()}>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Employer Links</p>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noreferrer noopener"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            <ExternalLink size={14} />
            <span>{link.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

const getMatchColorClass = (score) => {
  if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
};
const getMatchTextColorClass = (score) => {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
};

// =====================================================
// 2. COMPONENT: MATCH DETAILS PAGE (Skill Analysis)
// =====================================================
export const JobDetailsPage = ({ job, matchData, onBack }) => {
  if (!job) return <div className="p-20 text-center font-bold text-gray-500">Job data not found.</div>;
  
  const matches = matchData?.matches || [];
  const score = matchData?.score || 0;
  const missingSkills = Array.isArray(matchData?.missingSkills)
    ? matchData.missingSkills
    : (job.requiredSkills || []).filter(skill => !matches.includes(skill));
  const unlistedMatchedSkills = Array.isArray(matchData?.matchEvidence?.unlisted_matched_skills)
    ? matchData.matchEvidence.unlisted_matched_skills.filter(Boolean)
    : [];
  const matchedSkillsFromEvidence = matchData?.matchedSkillKeywords || matchData?.matchEvidence?.matched_skill_keywords || [];
  const missingSkillsFromEvidence = matchData?.missingSkillKeywords || matchData?.matchEvidence?.missing_skill_keywords || missingSkills;
  const matchedFromTitle = matchData?.matchedTitleKeywords || matchData?.matchEvidence?.matched_title_keywords || [];

  const mergedMatchedSkills = Array.from(new Set([
    ...(Array.isArray(matches) ? matches : []),
    ...(Array.isArray(matchedSkillsFromEvidence) ? matchedSkillsFromEvidence : []),
    ...(Array.isArray(matchedFromTitle) ? matchedFromTitle : []),
    ...(Array.isArray(unlistedMatchedSkills) ? unlistedMatchedSkills : []),
  ])).filter(Boolean);

  const mergedMissingSkills = Array.from(new Set([
    ...(Array.isArray(missingSkills) ? missingSkills : []),
    ...(Array.isArray(missingSkillsFromEvidence) ? missingSkillsFromEvidence : []),
  ])).filter(Boolean);

  const MISSING_DISPLAY_LIMIT = 2;
  const displayedMatchedSkills = mergedMatchedSkills;
  const displayedMissingSkills = mergedMissingSkills.slice(0, MISSING_DISPLAY_LIMIT);
  const hiddenMissingSkillsCount = Math.max(0, mergedMissingSkills.length - displayedMissingSkills.length);

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
             <p className={`text-3xl font-bold ${getMatchTextColorClass(score)}`}>{score}%</p>
          </div>
        </div>

        <EmployerLinks job={job} containerClassName="px-8 md:px-10 pt-8" />

        <div className="p-8 md:p-10 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100">
            <h4 className="flex items-center gap-2 text-sm font-bold text-green-700 mb-4">
              <CheckCircle size={18}/> Matched Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {displayedMatchedSkills.length > 0 ? displayedMatchedSkills.map((s, i) => (
                <span key={i} className="bg-white text-gray-800 text-sm font-medium px-3 py-1.5 rounded-lg border border-green-200 shadow-sm">{s}</span>
              )) : <p className="text-sm text-gray-500 italic">No matches found</p>}
            </div>
          </div>
          
          <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
            <h4 className="flex items-center gap-2 text-sm font-bold text-red-700 mb-4">
              <XCircle size={18}/> Missing Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {displayedMissingSkills.length > 0 ? displayedMissingSkills.map((s, i) => (
                <span key={i} className="bg-white text-gray-600 text-sm font-medium px-3 py-1.5 rounded-lg border border-red-200">{s}</span>
              )) : <p className="text-sm text-gray-500 italic">No missing skills</p>}
            </div>
            {hiddenMissingSkillsCount > 0 && (
              <p className="text-xs text-red-600 mt-3">+{hiddenMissingSkillsCount} more missing skill(s)</p>
            )}
            {mergedMissingSkills.length > displayedMissingSkills.length && (
              <p className="text-xs text-gray-500 mt-1">Showing top missing skills for cleaner comparison.</p>
            )}
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
// ✅ FEATURE: Added savedJobs and onToggleSaveJob
export const FindJobs = ({ jobs = [], recommendations = [], onApply, applications = [], userId, profile, onGoToProfile, savedJobs = [], onToggleSaveJob, cooldownMap = {} }) => {
  const [keyword, setKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedEducationLevel, setSelectedEducationLevel] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [expandedRecId, setExpandedRecId] = useState(null);
  
  const idVerificationStatus = profile?.idVerificationStatus || profile?.id_verification_status;
  const isVerified = !profile || idVerificationStatus === 'verified';
  const hasResume = profile?.resume_path || profile?.resumePath || (profile?.educational_attainment && profile?.educational_attainment !== 'Not Specified');

  const locations = [...new Set(jobs.map(j => j.location).filter(Boolean))].sort();
  const types = [...new Set(jobs.map(j => j.type).filter(Boolean))].sort();
  
  const filtered = jobs.filter(j => {
    const matchesKeyword = j.title.toLowerCase().includes(keyword.toLowerCase()) || j.company.toLowerCase().includes(keyword.toLowerCase());
    const matchesLocation = !selectedLocation || j.location === selectedLocation;
    const matchesType = !selectedType || j.type === selectedType;
    const jobRequiredLevel = inferEducationLevel(j.educationalAttainmentRequired || '');
    const matchesEducation = !selectedEducationLevel
      || (selectedEducationLevel === 'not_specified'
        ? !jobRequiredLevel
        : jobRequiredLevel === selectedEducationLevel);
    return matchesKeyword && matchesLocation && matchesType && matchesEducation;
  });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 animate-in fade-in duration-300">
      <HeroBanner
        badge="Job Matching"
        title="Find Your Next Job"
        subtitle="Browse AI-matched job opportunities tailored to your skills and location."
        imageSrc={loginBg}
        imageAlt="Find jobs banner"
        icon={<Briefcase size={20} className="text-white/70" />}
      />
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20}/>
          <input 
            value={keyword} 
            onChange={e => setKeyword(e.target.value)} 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-qc-blue/25 focus:bg-white transition-colors font-medium text-gray-900" 
            placeholder="Search job titles or companies..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-qc-blue/25 text-gray-700 font-medium">
              <option value="">All Locations</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
          <div>
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-qc-blue/25 text-gray-700 font-medium">
              <option value="">All Job Types</option>
              {types.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <select value={selectedEducationLevel} onChange={e => setSelectedEducationLevel(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-qc-blue/25 text-gray-700 font-medium">
              <option value="">All Education Requirements</option>
              <option value="not_specified">Not Specified</option>
              {EDUCATION_MINIMUM_OPTIONS.map((option) => (
                <option key={option.level} value={option.level}>{option.label}</option>
              ))}
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
              const isSaved = savedJobs.includes(recJob.id);
              const scoreNum = Number(rec.matchScore || 0);
              const isRecExpanded = expandedRecId === recJob.id;

              const recCooldownUntil = cooldownMap[recJob.id];
              const recIsOnCooldown = !!recCooldownUntil;
              const recCooldownDate = recIsOnCooldown ? new Date(recCooldownUntil).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) : null;

              let btnText = 'Apply for this Position';
              let btnTitle = '';
              let btnAction = () => onApply(recJob.id);
              let btnClass = 'text-white bg-blue-600 hover:bg-blue-700';

              if (!isVerified) {
                  btnText = 'Verification Required';
                  btnTitle = 'Click to verify your ID in your profile';
                  btnAction = () => { if (onGoToProfile) onGoToProfile(); };
                  btnClass = 'text-gray-700 bg-gray-200 hover:bg-gray-300';
              } else if (!hasResume) {
                  btnText = 'Upload Resume First';
                  btnTitle = 'Click to upload your resume in your profile';
                  btnAction = () => { if (onGoToProfile) onGoToProfile(); };
                  btnClass = 'text-gray-700 bg-gray-200 hover:bg-gray-300';
              }

              return (
                <div key={`${recJob.id}-${index}`} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{recJob.title}</h3>
                      <p className="text-sm font-semibold text-blue-600">{recJob.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); if(onToggleSaveJob) onToggleSaveJob(recJob.id); }} className={`p-2 rounded-full transition-colors ${isSaved ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`} title={isSaved ? "Remove from Saved" : "Save Job"}>
                          <Bookmark size={20} className={isSaved ? "fill-current" : ""} />
                      </button>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-black border ${getMatchColorClass(scoreNum)}`}>
                        {scoreNum}% Match
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4 space-y-1">
                    {recJob.location && <p><span className="font-semibold text-gray-700">Location:</span> {recJob.location}</p>}
                    {recJob.type && <p><span className="font-semibold text-gray-700">Type:</span> {recJob.type}</p>}
                  </div>

                  <EmployerLinks job={recJob} compact containerClassName="mb-4" />

                  <div className="mb-5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedRecId(isRecExpanded ? null : recJob.id);
                      }}
                      className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
                    >
                      {isRecExpanded ? 'Hide Description' : 'Show Description'}
                      {isRecExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {isRecExpanded && (
                      <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Job Description</h4>
                        <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700">
                          {recJob.description || 'No job description provided.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {alreadyApplied ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-lg text-sm font-bold border border-green-200">
                      <CheckCircle size={16}/> Application Submitted
                    </div>
                  ) : recIsOnCooldown ? (
                    <button disabled className="w-full md:w-auto px-5 py-2.5 text-sm font-bold rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200">
                      Apply again on {recCooldownDate}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); btnAction(); }}
                      className={`w-full md:w-auto px-5 py-2.5 text-sm font-bold rounded-lg transition-colors ${btnClass}`}
                      title={btnTitle}
                    >
                      {btnText}
                    </button>
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
          const isSaved = savedJobs.includes(job.id);
          const cooldownUntil = cooldownMap[job.id];
          const isOnCooldown = !!cooldownUntil;
          const cooldownDate = isOnCooldown ? new Date(cooldownUntil).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) : null;

          let btnText = 'Apply for this Position';
          let btnTitle = '';
          let btnAction = () => onApply(job.id);
          let btnClass = 'text-white bg-blue-600 hover:bg-blue-700';

          if (!isVerified) {
              btnText = 'Verification Required';
              btnTitle = 'Click to verify your ID in your profile';
              btnAction = () => { if (onGoToProfile) onGoToProfile(); };
              btnClass = 'text-gray-700 bg-gray-200 hover:bg-gray-300';
          } else if (!hasResume) {
              btnText = 'Upload Resume First';
              btnTitle = 'Click to upload your resume in your profile';
              btnAction = () => { if (onGoToProfile) onGoToProfile(); };
              btnClass = 'text-gray-700 bg-gray-200 hover:bg-gray-300';
          }

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
                  <button onClick={(e) => { e.stopPropagation(); if(onToggleSaveJob) onToggleSaveJob(job.id); }} className={`p-2 rounded-full transition-colors ${isSaved ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`} title={isSaved ? "Remove from Saved" : "Save Job"}>
                      <Bookmark size={20} className={isSaved ? "fill-current" : ""} />
                  </button>
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

                  <EmployerLinks job={job} compact containerClassName="mb-8" />

                  {hasApp ? (
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-xl font-bold border border-green-200">
                      <CheckCircle size={18}/> Application Submitted
                    </div>
                  ) : isOnCooldown ? (
                    <button disabled className="w-full md:w-auto px-8 py-3 rounded-xl font-bold bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200">
                      Apply again on {cooldownDate}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); btnAction(); }}
                      className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold transition-colors shadow-sm ${btnClass}`}
                      title={btnTitle}
                    >
                      {btnText}
                    </button>
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
export const DashboardOverview = ({ applications = [], jobs = [], onViewJob, onSubmitEmployerFeedback }) => {
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const [feedbackSavingAppId, setFeedbackSavingAppId] = useState(null);

  const activeApps = applications;

  const getFeedbackDraft = (app) => {
    if (feedbackDrafts[app.id]) {
      return feedbackDrafts[app.id];
    }

    return {
      rating: Number(app.feedbackRating || 0),
      comment: app.feedbackComment || '',
    };
  };

  const updateFeedbackDraft = (app, patch) => {
    setFeedbackDrafts((prev) => ({
      ...prev,
      [app.id]: {
        ...getFeedbackDraft(app),
        ...patch,
      },
    }));
  };

  const handleSubmitFeedback = async (app) => {
    if (typeof onSubmitEmployerFeedback !== 'function') {
      return;
    }

    const draft = getFeedbackDraft(app);
    if (!draft.rating) {
      Swal.fire({
        icon: 'warning',
        title: 'Rating required',
        text: 'Please select a star rating before submitting your feedback.',
        toast: true,
        position: 'top',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true
      });
      return;
    }

    setFeedbackSavingAppId(app.id);

    try {
      const success = await onSubmitEmployerFeedback(app.id, draft.rating, draft.comment.trim());
      if (!success) {
        return;
      }

      Swal.fire({
        icon: 'success',
        title: app.feedbackRating ? 'Feedback updated' : 'Feedback submitted',
        text: 'Your employer rating has been saved.',
        toast: true,
        position: 'top',
        timer: 2200,
        showConfirmButton: false,
        timerProgressBar: true
      });
    } finally {
      setFeedbackSavingAppId(null);
    }
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
              const jobDisplay = job || {
                id: app.jobId,
                title: app.jobTitle,
                company: app.company,
                location: app.location,
                type: app.type,
              };
              const isJobClosed = (app.jobStatus || '').toLowerCase() === 'closed';
              const canRateEmployer = ['Hired', 'Declined'].includes(app.status);
              const feedbackDraft = getFeedbackDraft(app);
              const hasSubmittedFeedback = Number(app.feedbackRating || 0) > 0;

              return (
                <div key={app.id} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all relative group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">{jobDisplay?.title || 'Job Posting'}</h3>
                      <p className="text-sm font-semibold text-blue-600 mt-1">{jobDisplay?.company || 'Company'}</p>
                      {isJobClosed && (
                        <span className="inline-flex mt-2 items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700">
                          Job Closed
                        </span>
                      )}
                    </div>
                    <div className="p-2 text-gray-300" title="Status managed by employer">
                      <Lock size={20}/>
                    </div>
                  </div>
                  
                  <ApplicationProcessSteps status={app.status} />

                  {canRateEmployer && (
                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                        <div>
                          <p className="text-sm font-black text-amber-900 uppercase tracking-wide">Employer Feedback</p>
                          <p className="text-sm text-amber-800 mt-1">
                            Rate your experience with {jobDisplay?.company || 'this employer'} now that the application reached its final decision.
                          </p>
                        </div>
                        {hasSubmittedFeedback && (
                          <span className="inline-flex items-center rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-bold text-amber-800">
                            Submitted
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        {[1, 2, 3, 4, 5].map((value) => {
                          const active = value <= Number(feedbackDraft.rating || 0);

                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => updateFeedbackDraft(app, { rating: value })}
                              className={`p-2 rounded-xl border transition-colors ${active ? 'border-amber-400 bg-white text-amber-500' : 'border-amber-200 bg-white text-gray-300 hover:text-amber-400 hover:border-amber-300'}`}
                              aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                            >
                              <Star size={20} className={active ? 'fill-current' : ''} />
                            </button>
                          );
                        })}
                        <span className="text-sm font-semibold text-amber-900 ml-1">
                          {feedbackDraft.rating ? `${feedbackDraft.rating}/5 stars` : 'Select a rating'}
                        </span>
                      </div>

                      <textarea
                        value={feedbackDraft.comment}
                        onChange={(e) => updateFeedbackDraft(app, { comment: e.target.value })}
                        className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-amber-400"
                        rows={4}
                        placeholder="Share a short note about communication, interview handling, or overall hiring experience."
                      />

                      <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <p className="text-xs text-amber-900/80 font-medium">
                          {app.feedbackSubmittedAt
                            ? `Last updated: ${app.feedbackSubmittedAt}`
                            : 'Your rating helps admin identify the top employers in the system.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleSubmitFeedback(app)}
                          disabled={feedbackSavingAppId === app.id || !feedbackDraft.rating}
                          className="px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 disabled:bg-amber-300 transition-colors"
                        >
                          {feedbackSavingAppId === app.id
                            ? 'Saving...'
                            : hasSubmittedFeedback
                            ? 'Update Feedback'
                            : 'Submit Feedback'}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 pt-4 border-t border-gray-100 gap-4">
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                      <Clock size={14}/> Applied: {app.date}
                    </span>
                    {job ? (
                      <button onClick={() => onViewJob(job)} className="text-sm font-bold text-blue-600 bg-blue-50 px-5 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                        View Match Metrics
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-gray-400">Job details unavailable</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

    </div>
  );
};

// =====================================================
// 5. COMPONENTS: TRAININGS, JOB FAIRS & SAVED JOBS
// =====================================================

// ✅ NEW FEATURE: Saved Jobs View Component
export const MySavedJobs = ({ jobs = [], savedJobs = [], applications = [], userId, profile, onApply, onToggleSaveJob, onGoToProfile, cooldownMap = {} }) => {
  const [expandedId, setExpandedId] = useState(null);
  
  const idVerificationStatus = profile?.idVerificationStatus || profile?.id_verification_status;
  const isVerified = !profile || idVerificationStatus === 'verified';
  const hasResume = profile?.resume_path || profile?.resumePath || (profile?.educational_attainment && profile?.educational_attainment !== 'Not Specified');

  const mySavedData = jobs.filter(j => savedJobs.includes(j.id));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Bookmark className="text-blue-600" size={24}/> My Saved Jobs
        </h2>
        
        {mySavedData.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <Bookmark size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No saved jobs yet</h3>
            <p className="text-gray-500 text-sm">Click the bookmark icon on any job posting to save it for later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mySavedData.map(job => {
              const isExp = expandedId === job.id;
              const hasApp = applications.some(a => a.jobId === job.id && a.seekerId === userId);
              const cooldownUntil = cooldownMap[job.id];
              const isOnCooldown = !!cooldownUntil;
              const cooldownDate = isOnCooldown ? new Date(cooldownUntil).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) : null;

              let btnText = 'Apply for this Position';
              let btnTitle = '';
              let btnAction = () => onApply(job.id);
              let btnClass = 'text-white bg-blue-600 hover:bg-blue-700';

              if (!isVerified) {
                  btnText = 'Verification Required';
                  btnTitle = 'Click to verify your ID in your profile';
                  btnAction = () => { if (onGoToProfile) onGoToProfile(); };
                  btnClass = 'text-gray-700 bg-gray-200 hover:bg-gray-300';
              } else if (!hasResume) {
                  btnText = 'Upload Resume First';
                  btnTitle = 'Click to upload your resume in your profile';
                  btnAction = () => { if (onGoToProfile) onGoToProfile(); };
                  btnClass = 'text-gray-700 bg-gray-200 hover:bg-gray-300';
              }

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
                      <button onClick={(e) => { e.stopPropagation(); if(onToggleSaveJob) onToggleSaveJob(job.id); }} className="p-2 rounded-full text-blue-600 bg-blue-50 transition-colors" title="Remove from Saved">
                          <Bookmark size={20} className="fill-current" />
                      </button>
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

                      <EmployerLinks job={job} compact containerClassName="mb-8" />

                      {hasApp ? (
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-xl font-bold border border-green-200">
                          <CheckCircle size={18}/> Application Submitted
                        </div>
                      ) : isOnCooldown ? (
                        <button disabled className="w-full md:w-auto px-8 py-3 rounded-xl font-bold bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200">
                          Apply again on {cooldownDate}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); btnAction(); }}
                          className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold transition-colors shadow-sm ${btnClass}`}
                          title={btnTitle}
                        >
                          {btnText}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
};


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

const SeekerDashboard = ({ profile, applications = [], jobs = [], trainings = [], jobFairs = [], savedJobs = [], initialTab, onViewJob, onNavigate, onUpdateProfile, onWithdrawTraining, onSubmitEmployerFeedback, onToggleSaveJob, onApply, notify, onWithdrawJobFair, cooldownMap = {} }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [resumeFile, setResumeFile] = useState(null);
  const [idDocumentFile, setIdDocumentFile] = useState(null);
  const [idNumberInput, setIdNumberInput] = useState(profile?.qc_id || '');
  const [backgroundLinks, setBackgroundLinks] = useState({
    portfolioUrl: profile?.portfolioUrl || profile?.portfolio_url || '',
    linkedinUrl: profile?.linkedinUrl || profile?.linkedin_url || '',
    githubUrl: profile?.githubUrl || profile?.github_url || '',
    facebookUrl: profile?.facebookUrl || profile?.facebook_url || '',
    instagramUrl: profile?.instagramUrl || profile?.instagram_url || '',
  });
  const [personalInfo, setPersonalInfo] = useState({
    bdayMonth: profile?.bday_month || '',
    bdayDay: profile?.bday_day ? String(profile.bday_day) : '',
    bdayYear: profile?.bday_year ? String(profile.bday_year) : '',
    gender: profile?.gender || '',
  });
  const [isSavingBackgroundLinks, setIsSavingBackgroundLinks] = useState(false);
  const [isIdUploading, setIsIdUploading] = useState(false);
  const [idQrFeedback, setIdQrFeedback] = useState({ type: '', message: '' });
  const [idQrPreview, setIdQrPreview] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [withdrawModal, setWithdrawModal] = useState({ isOpen: false, type: null, id: null, title: '' });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const fileInputRef = useRef(null);
  const idFileInputRef = useRef(null);

  const idVerificationStatus = profile?.idVerificationStatus || profile?.id_verification_status || 'not_submitted';
  const idVerificationReason = profile?.idVerificationReason || profile?.id_verification_reason || '';
  const isPriorityVerified = typeof profile?.isPriorityVerified === 'boolean'
    ? profile.isPriorityVerified
    : !!profile?.is_priority_verified;

  const isQcResident = profile?.isQcResident ?? profile?.is_qc_resident ?? false;
  const idLabel = isQcResident ? 'QC ID' : 'Government ID';
  const idSectionTitle = isQcResident ? 'QC ID Verification' : 'Government ID Verification';
  const idSectionSubtitle = isQcResident
    ? 'If your QCitizen ID is invalid, you can re-upload it here.'
    : 'If your government ID was rejected or needs updating, you can re-upload it here.';

  const verificationLabels = {
    verified: 'Verified',
    rejected: 'Invalid ID',
    manual_review: 'Manual Review',
    pending: 'Pending Verification',
    error: 'Verification Error',
    not_submitted: 'Not Submitted',
  };

  const verificationStyles = {
    verified: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    manual_review: 'bg-amber-50 text-amber-700 border-amber-200',
    pending: 'bg-blue-50 text-blue-700 border-blue-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    not_submitted: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const isIdInvalid = ['rejected', 'error'].includes(idVerificationStatus);
  const canReuploadId = ['rejected', 'error', 'manual_review'].includes(idVerificationStatus);

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

  useEffect(() => {
    if (profile?.seekerIdDocPath || profile?.seeker_id_doc_path) {
      const source = profile?.seeker_id_doc_original_name
        || profile?.seeker_id_doc_stored_name
        || profile?.seekerIdDocPath
        || profile?.seeker_id_doc_path;
      const segments = String(source || '').split('/');
      const fileName = segments[segments.length - 1] || 'id-document';
      setIdDocumentFile({ name: fileName, fromServer: true });
      return;
    }

    setIdDocumentFile(null);
  }, [profile?.seekerIdDocPath, profile?.seeker_id_doc_path, profile?.seeker_id_doc_original_name, profile?.seeker_id_doc_stored_name]);

  useEffect(() => {
    setIdNumberInput(profile?.qc_id || '');
    setIdQrFeedback({ type: '', message: '' });
    setIdQrPreview(null);
  }, [profile?.qc_id]);

  useEffect(() => {
    setBackgroundLinks({
      portfolioUrl: profile?.portfolioUrl || profile?.portfolio_url || '',
      linkedinUrl: profile?.linkedinUrl || profile?.linkedin_url || '',
      githubUrl: profile?.githubUrl || profile?.github_url || '',
      facebookUrl: profile?.facebookUrl || profile?.facebook_url || '',
      instagramUrl: profile?.instagramUrl || profile?.instagram_url || '',
    });
  }, [
    profile?.portfolioUrl,
    profile?.portfolio_url,
    profile?.linkedinUrl,
    profile?.linkedin_url,
    profile?.githubUrl,
    profile?.github_url,
    profile?.facebookUrl,
    profile?.facebook_url,
    profile?.instagramUrl,
    profile?.instagram_url,
  ]);

  useEffect(() => {
    setPersonalInfo({
      bdayMonth: profile?.bday_month || '',
      bdayDay: profile?.bday_day ? String(profile.bday_day) : '',
      bdayYear: profile?.bday_year ? String(profile.bday_year) : '',
      gender: profile?.gender || '',
    });
  }, [profile?.bday_month, profile?.bday_day, profile?.bday_year, profile?.gender]);

  const handleWithdrawTraining = (trainingId) => {
    const training = trainings.find(t => t.id === trainingId);
    setWithdrawModal({
      isOpen: true,
      type: 'training',
      id: trainingId,
      title: training?.title || 'Training'
    });
  };

  const handleWithdrawJobFair = (jobFairId) => {
    const jobFair = jobFairs.find(f => f.id === jobFairId);
    setWithdrawModal({
      isOpen: true,
      type: 'jobfair',
      id: jobFairId,
      title: jobFair?.title || 'Job Fair'
    });
  };

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
        if (typeof onWithdrawJobFair === 'function') {
            const ok = await onWithdrawJobFair(withdrawModal.id);
            if (!ok) return;
        } else {
            toastMsg("Job Fair withdrawn successfully.");
        }
    }
    setWithdrawModal({ isOpen: false, type: null, id: null, title: '' });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const userEmail = profile?.email;
    if (!userEmail) {
      if (typeof notify === 'function') {
        notify('Please log in again before uploading your resume.', 'warning');
      }
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
      if (typeof notify === 'function') {
        notify(error?.message || 'Failed to upload resume to server. Please try again.', 'error');
      }
      setResumeFile(null); 
    }
  };

  const handleRemoveResume = async () => {
    const result = await Swal.fire({
      title: 'Delete Resume?',
      text: 'This will remove the stored PDF and parsed data. This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) {
      return;
    }

    const userEmail = profile?.email;
    if (!userEmail) {
      if (typeof notify === 'function') {
        notify('Please log in again before deleting your resume.', 'warning');
      }
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
      if (typeof notify === 'function') {
        notify(error?.message || 'Failed to remove resume. Please try again.', 'error');
      }
    }
  };

  const handleIdDocumentSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setIdDocumentFile(file);
  };

  const handleIdNumberInputChange = (e) => {
    const value = e.target.value;
    const parsedQr = parseQcQrPayload(value);

    if (!parsedQr.isQrPayload) {
      setIdQrFeedback({ type: '', message: '' });
      setIdQrPreview(null);
      setIdNumberInput(value);
      return;
    }

    const fields = parsedQr.fields || {};
    const normalizedQcId = fields.qcIdDigits?.length === 14
      ? formatQcId338(fields.qcIdDigits)
      : value;

    setIdNumberInput(normalizedQcId);

    if (!parsedQr.isValid) {
      setIdQrFeedback({
        type: 'error',
        message: parsedQr.errors.join(' '),
      });
      setIdQrPreview(null);
      return;
    }

    setIdQrFeedback({
      type: 'success',
      message: 'QR payload parsed. QC ID was filled automatically.',
    });

    setIdQrPreview({
      name: fields.name?.fullName || null,
      birthdateYYMMDD: fields.birthdateYYMMDD || null,
      gender: fields.gender || null,
    });
  };

  const handleSaveBackgroundLinks = async () => {
    const userEmail = profile?.email;
    if (!userEmail) {
      alert('Missing account email. Please log in again before saving links.');
      return;
    }

    const linkFields = [
      { stateKey: 'portfolioUrl', payloadKey: 'portfolio_url', label: 'Portfolio / Website' },
      { stateKey: 'linkedinUrl', payloadKey: 'linkedin_url', label: 'LinkedIn URL' },
      { stateKey: 'githubUrl', payloadKey: 'github_url', label: 'GitHub URL' },
      { stateKey: 'facebookUrl', payloadKey: 'facebook_url', label: 'Facebook URL' },
      { stateKey: 'instagramUrl', payloadKey: 'instagram_url', label: 'Instagram URL' },
    ];

    const payload = { email: userEmail };

    const bdayMonth = String(personalInfo.bdayMonth || '').trim();
    const bdayDay = String(personalInfo.bdayDay || '').trim();
    const bdayYear = String(personalInfo.bdayYear || '').trim();
    const gender = String(personalInfo.gender || '').trim();

    if (!bdayMonth || !bdayDay || !bdayYear || !gender) {
      alert('Birthday and gender are required.');
      return;
    }

    payload.bday_month = bdayMonth;
    payload.bday_day = Number(bdayDay);
    payload.bday_year = Number(bdayYear);
    payload.gender = gender;

    for (const field of linkFields) {
      const rawValue = String(backgroundLinks[field.stateKey] || '').trim();
      if (!rawValue) {
        payload[field.payloadKey] = null;
        continue;
      }

      const normalizedUrl = normalizeExternalUrl(rawValue);
      if (!normalizedUrl) {
        alert(`${field.label} must be a valid URL.`);
        return;
      }

      payload[field.payloadKey] = normalizedUrl;
    }

    try {
      setIsSavingBackgroundLinks(true);

      const response = await fetch(`${API_BASE}/seeker/update-profile`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || data?.status !== 'success') {
        throw new Error(data?.message || 'Failed to update seeker profile details.');
      }

      if (typeof onUpdateProfile === 'function' && data?.user) {
        onUpdateProfile(data.user);
      }

      toastMsg('Profile details saved successfully.');
    } catch (error) {
      console.error('Save seeker links error:', error);
      alert(error?.message || 'Failed to save profile details. Please try again.');
    } finally {
      setIsSavingBackgroundLinks(false);
    }
  };

  const handleUploadIdDocument = async () => {
    const userEmail = profile?.email;
    if (!userEmail) {
      alert('Missing account email. Please log in again before uploading your ID.');
      return;
    }

    if (!idNumberInput.trim()) {
      alert(`Please enter your ${idLabel} number before uploading.`);
      return;
    }

    if (!idDocumentFile) {
      alert('Please select your QCitizen ID file first.');
      return;
    }

    const formData = new FormData();
    formData.append('email', userEmail);
    formData.append('qc_id', idNumberInput.trim());
    formData.append('document', idDocumentFile);

    try {
      setIsIdUploading(true);

      const response = await fetch(`${API_BASE}/upload/seeker-id-document`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to upload ID document.');
      }

      if (typeof onUpdateProfile === 'function' && data?.user) {
        onUpdateProfile(data.user);
      }

      toastMsg(canReuploadId ? `${idLabel} re-uploaded. Verification restarted.` : `${idLabel} uploaded. Verification in progress.`);
    } catch (error) {
      console.error('ID Upload Error:', error);
      alert(error?.message || 'Failed to upload ID document. Please try again.');
    } finally {
      setIsIdUploading(false);
    }
  };

  const handleRedirectToProfile = () => {
    setActiveTab('profile');
    setTimeout(() => {
      document.getElementById('resume-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  let filledFields = 0;
  let totalFields = 5;
  if (profile?.name && profile?.email && profile?.bday_month && profile?.bday_day && profile?.bday_year && profile?.gender) filledFields++; 
  if (profile?.educational_attainment && profile?.educational_attainment !== 'Not Specified') filledFields++; 
  if (profile?.qc_id) filledFields++; 
  if (resumeFile) filledFields++; 
  if (backgroundLinks.portfolioUrl || backgroundLinks.linkedinUrl || backgroundLinks.githubUrl || backgroundLinks.facebookUrl || backgroundLinks.instagramUrl) filledFields++; 
  
  const profileCompleteness = Math.round((filledFields / totalFields) * 100);

  const getResumeUrl = () => {
    if (!profile?.resume_path) return '';
    if (profile.resume_path.startsWith('http')) return profile.resume_path;
    return buildDocumentViewUrl(profile.resume_path);
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20 pt-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Banner */}
        <div className="mb-8">
          <HeroBanner
            badge="My Dashboard"
            title="Job Seeker My Dashboard"
            subtitle="Manage your career journey, applications, and profile."
            imageSrc={loginBg}
            imageAlt="Dashboard banner"
            icon={<LayoutDashboard size={20} className="text-white/70" />}
          />
        </div>

        {isIdInvalid && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 animate-in fade-in duration-200">
            <div>
              <p className="text-sm font-black text-red-700 uppercase tracking-wider">{idSectionTitle} Failed</p>
              <p className="text-sm text-red-700 mt-1">
                {idVerificationReason || 'Your uploaded QCitizen ID could not be validated. Please re-upload a clearer copy to continue priority verification.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors w-full md:w-auto"
            >
              Re-upload in Profile
            </button>
          </div>
        )}
        
        {/* Tab Navigation */}
        <nav className="flex gap-1.5 mb-10 bg-slate-200/60 p-1.5 rounded-2xl w-fit overflow-x-auto no-scrollbar mx-auto md:mx-0">
          {['overview', 'saved jobs', 'trainings', 'job fairs', 'profile'].map(tab => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-200 whitespace-nowrap ${activeTab === tab ? 'bg-white text-qc-blue shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {activeTab === 'overview' && <DashboardOverview applications={applications} jobs={jobs} onViewJob={onViewJob} onSubmitEmployerFeedback={onSubmitEmployerFeedback} />}
        {/* ✅ FEATURE: Render the new MySavedJobs tab */}
        {activeTab === 'saved jobs' && <MySavedJobs jobs={jobs} savedJobs={savedJobs} applications={applications} profile={profile} userId={profile?.id} onApply={onApply} onToggleSaveJob={onToggleSaveJob} onGoToProfile={handleRedirectToProfile} cooldownMap={cooldownMap} />}
        {activeTab === 'trainings' && <MyTrainings trainings={trainings} profile={profile} onWithdrawTraining={handleWithdrawTraining} />}
        {activeTab === 'job fairs' && <MyJobFairs jobFairs={jobFairs} profile={profile} onWithdrawJobFair={handleWithdrawJobFair} />}
        
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl space-y-6 animate-in fade-in duration-300">

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                       Profile Completeness
                    </h4>
                    <span className="font-bold text-blue-600">{profileCompleteness}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                       className={`h-2.5 rounded-full transition-all duration-500 ${profileCompleteness === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                       style={{ width: `${profileCompleteness}%` }}
                    ></div>
                </div>
                <p className="text-xs text-gray-500 mt-3">Complete your profile (Resume, Links, ID) to increase your chances of getting hired.</p>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-200 shadow-sm">
              
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

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">ID Type</p>
                  <p className="text-sm font-medium text-gray-900">{profile?.id_type || "Gov ID"}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Gender</p>
                  <p className="text-sm font-medium text-gray-900">{profile?.gender || "Not provided"}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{idLabel} Number</p>
                  <p className="text-sm font-medium text-gray-900 font-mono">{profile?.qc_id || "None"}</p>
                </div>
              </div>

              <h4 className="text-lg font-bold text-gray-900 mb-6">Required Profile Details</h4>
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 mb-10">
                <p className="text-sm text-gray-500 font-medium mb-4">Keep these details complete so your age and gender are always available in your profile.</p>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Birth Month</label>
                    <select
                      value={personalInfo.bdayMonth}
                      onChange={(e) => setPersonalInfo((prev) => ({ ...prev, bdayMonth: e.target.value }))}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-qc-blue/25"
                    >
                      <option value="">Month</option>
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Birth Day</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={personalInfo.bdayDay}
                      onChange={(e) => setPersonalInfo((prev) => ({ ...prev, bdayDay: e.target.value }))}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-qc-blue/25"
                      placeholder="Day"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Birth Year</label>
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      value={personalInfo.bdayYear}
                      onChange={(e) => setPersonalInfo((prev) => ({ ...prev, bdayYear: e.target.value }))}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-qc-blue/25"
                      placeholder="Year"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Gender</label>
                    <select
                      value={personalInfo.gender}
                      onChange={(e) => setPersonalInfo((prev) => ({ ...prev, gender: e.target.value }))}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-qc-blue/25"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Binary">Binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-bold text-gray-900 mb-6">Background Links For Employers</h4>
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 mb-10">
                <p className="text-sm text-gray-500 font-medium mb-4">Add your public profiles so employers can run background checks if available.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Portfolio / Website</label>
                    <input
                      value={backgroundLinks.portfolioUrl}
                      onChange={(e) => setBackgroundLinks((prev) => ({ ...prev, portfolioUrl: e.target.value }))}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-qc-blue/25"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">LinkedIn</label>
                    <input
                      value={backgroundLinks.linkedinUrl}
                      onChange={(e) => setBackgroundLinks((prev) => ({ ...prev, linkedinUrl: e.target.value }))}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-qc-blue/25"
                      placeholder="https://www.linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">GitHub</label>
                    <input
                      value={backgroundLinks.githubUrl}
                      onChange={(e) => setBackgroundLinks((prev) => ({ ...prev, githubUrl: e.target.value }))}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-qc-blue/25"
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Facebook</label>
                    <input
                      value={backgroundLinks.facebookUrl}
                      onChange={(e) => setBackgroundLinks((prev) => ({ ...prev, facebookUrl: e.target.value }))}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-qc-blue/25"
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Instagram</label>
                    <input
                      value={backgroundLinks.instagramUrl}
                      onChange={(e) => setBackgroundLinks((prev) => ({ ...prev, instagramUrl: e.target.value }))}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-qc-blue/25"
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={handleSaveBackgroundLinks}
                    disabled={isSavingBackgroundLinks}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                  >
                    {isSavingBackgroundLinks ? 'Saving...' : 'Save Profile Details'}
                  </button>
                </div>
              </div>
              
              <h4 id="resume-section" className="text-lg font-bold text-gray-900 mb-6">Resume & Documents</h4>
              <div className="grid md:grid-cols-2 gap-5">
                
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
                      <div className="flex items-center gap-1 shrink-0">
                         {profile?.resume_path && (
                            <button 
                                onClick={() => setIsPreviewOpen(true)} 
                                className="p-1.5 hover:bg-white text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
                                title="Preview Resume"
                            >
                                <Eye size={18}/>
                            </button>
                         )}
                         <button 
                            onClick={handleRemoveResume} 
                            className="p-1.5 hover:bg-white text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                            title="Remove Document"
                         >
                            <X size={18}/>
                         </button>
                      </div>
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

                <div className="p-6 border border-gray-200 rounded-2xl bg-white md:col-span-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{idSectionTitle}</h4>
                      <p className="text-sm text-gray-500 font-medium">{idSectionSubtitle}</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-black border ${verificationStyles[idVerificationStatus] || verificationStyles.not_submitted}`}>
                      {verificationLabels[idVerificationStatus] || 'Unknown'}
                    </span>
                  </div>

                  {isPriorityVerified && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
                      <p className="font-black uppercase tracking-wide text-[10px] text-blue-600 mb-1">QC Priority Active</p>
                      <p className="font-semibold">Your applications appear first in employer applicant lists as a verified QC resident.</p>
                    </div>
                  )}

                  {idVerificationReason && (
                    <div className={`mb-4 rounded-xl p-3 text-sm border ${isIdInvalid ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                      {idVerificationReason}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">{idLabel} Number</label>
                      <input
                        value={idNumberInput}
                        onChange={handleIdNumberInputChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-qc-blue/25"
                        placeholder={isQcResident ? "Enter your QC ID number or QR payload" : "Enter your ID number"}
                      />
                      {idQrFeedback.message && (
                        <p className={`mt-2 text-xs font-semibold ${idQrFeedback.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                          {idQrFeedback.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">ID File</label>
                      <button
                        type="button"
                        onClick={() => idFileInputRef.current?.click()}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-left hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-700 truncate block">
                          {idDocumentFile ? idDocumentFile.name : 'Select image or PDF'}
                        </span>
                      </button>
                      <input
                        type="file"
                        ref={idFileInputRef}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf,image/*,application/pdf"
                        onChange={handleIdDocumentSelect}
                      />
                    </div>
                  </div>

                  {idQrPreview && (
                    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700 space-y-1">
                      <p><span className="font-bold">Parsed Name:</span> {idQrPreview.name || 'N/A'}</p>
                      <p><span className="font-bold">Parsed Birthdate (YYMMDD):</span> {idQrPreview.birthdateYYMMDD || 'N/A'}</p>
                      <p><span className="font-bold">Parsed Gender:</span> {idQrPreview.gender || 'N/A'}</p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleUploadIdDocument}
                      disabled={isIdUploading}
                      className="px-5 py-2.5 bg-qc-blue text-white rounded-xl font-bold hover:bg-[#002d8a] disabled:opacity-50 transition-colors"
                    >
                      {isIdUploading ? 'Uploading...' : (canReuploadId ? `Re-upload ${idLabel}` : `Upload ${idLabel}`)}
                    </button>
                    {idVerificationStatus === 'pending' && (
                      <span className="text-sm text-blue-600 font-semibold self-center">Verification is running in the background.</span>
                    )}
                  </div>
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

        {isPreviewOpen && profile?.resume_path && (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl flex flex-col w-full max-w-4xl h-[85vh] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                     <FileText size={20} className="text-blue-600"/>
                     Document Preview
                  </h3>
                  <button onClick={() => setIsPreviewOpen(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg p-2 transition-colors">
                     <X size={20}/>
                  </button>
                </div>
                <div className="flex-1 bg-gray-200 p-4">
                  <iframe
                    src={getResumeUrl()}
                    className="w-full h-full rounded-xl shadow-sm border border-gray-300 bg-white"
                    title="Resume Preview"
                  ></iframe>
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SeekerDashboard;