// src/pages/Login.jsx
import React, { useState, useRef } from 'react';
import { X, Building2, CreditCard, FileCheck, HelpCircle, UploadCloud, Globe, MapPin, Phone } from 'lucide-react';

const Login = ({ onLogin, loginError, setLoginError }) => {
  const [mode, setMode] = useState('login'); 
  const [role, setRole] = useState('Seeker'); 
  
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    firstName: '', 
    middleName: '', 
    lastName: '', 
    suffix: '', 
    companyName: '', 
    industry: '', 
    companyAddress: '', 
    companyWebsite: '', 
    contactNumber: '', 
    qcId: '', 
    qcIdFile: null, 
    bdayMonth: 'Jan',
    bdayDay: '1',
    bdayYear: '2005',
    gender: ''
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = Array.from({length: 31}, (_, i) => i + 1);
  const years = Array.from({length: 100}, (_, i) => new Date().getFullYear() - i);
  const suffixes = ["", "Jr.", "Sr.", "II", "III", "IV", "V"];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFormData({ ...formData, qcIdFile: file });
  };

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    setLoginError(''); 
    
    // ✅ VALIDATION: Only Seekers are required to upload files here
    if (mode === 'register' && role === 'Seeker' && !formData.qcIdFile) {
        setLoginError("Please upload your QCitizen ID document.");
        return;
    }

    if (onLogin) {
        const middleInitial = formData.middleName ? `${formData.middleName.charAt(0)}.` : '';
        const suffixStr = formData.suffix ? ` ${formData.suffix}` : '';
        const fullName = `${formData.firstName} ${middleInitial} ${formData.lastName}${suffixStr}`.trim().replace(/\s+/g, ' ');

        const finalData = {
            ...formData,
            qcIdFileName: formData.qcIdFile ? formData.qcIdFile.name : null, 
            name: role === 'Employer' ? formData.companyName : fullName, 
            role
        };
        onLogin(mode, finalData);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-100 px-4 py-12 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-200 max-w-md w-full">
        
        <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                {mode === 'login' ? 'CityJobLink' : 'Create Account'}
            </h2>
            <p className="text-gray-500 text-sm">
                {mode === 'login' ? 'Welcome back, QCitizen!' : "It's quick and easy."}
            </p>
        </div>
        
        {mode === 'register' && (
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <button type="button" onClick={() => setRole('Seeker')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${role === 'Seeker' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Job Seeker</button>
            <button type="button" onClick={() => setRole('Employer')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${role === 'Employer' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>Employer</button>
          </div>
        )}
        
        {loginError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4 flex items-center gap-2 border border-red-100"><X size={16}/> {loginError}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && role === 'Seeker' && (
            <>
                {/* Seeker Fields */}
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input required className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                        <input className="w-1/3 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="M.I." maxLength={20} value={formData.middleName} onChange={e => setFormData({...formData, middleName: e.target.value})} />
                    </div>
                    <div className="flex gap-2">
                        <input required className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                        <select className="w-1/4 p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 text-sm" value={formData.suffix} onChange={e => setFormData({...formData, suffix: e.target.value})}>
                            <option value="">Suffix</option>
                            {suffixes.map(s => s && <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                
                {/* Birthday & Gender */}
                <div className="pt-1">
                    <div className="flex gap-2">
                        <select className="flex-1 p-2 border border-gray-300 rounded bg-white text-sm" value={formData.bdayMonth} onChange={e => setFormData({...formData, bdayMonth: e.target.value})}>{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                        <select className="flex-1 p-2 border border-gray-300 rounded bg-white text-sm" value={formData.bdayDay} onChange={e => setFormData({...formData, bdayDay: e.target.value})}>{days.map(d => <option key={d} value={d}>{d}</option>)}</select>
                        <select className="flex-1 p-2 border border-gray-300 rounded bg-white text-sm" value={formData.bdayYear} onChange={e => setFormData({...formData, bdayYear: e.target.value})}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                    </div>
                </div>
                <div className="pt-1">
                    <div className="grid grid-cols-2 gap-2">
                        {['Female', 'Male', 'Non-Binary', 'Prefer not to say'].map((g) => (
                            <label key={g} className={`flex items-center justify-between border p-2 rounded cursor-pointer transition-all hover:bg-gray-50 ${formData.gender === g ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}>
                                <span className="text-sm text-gray-700">{g}</span>
                                <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={e => setFormData({...formData, gender: e.target.value})} className="accent-black"/>
                            </label>
                        ))}
                    </div>
                </div>

                {/* SEEKER DOCUMENT UPLOAD */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                    <label className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-1"><Building2 size={14}/> QCitizen Verification</label>
                    <p className="text-[10px] text-gray-500 mb-2 leading-tight">This portal is exclusive to Quezon City residents.</p>
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCard size={16} className="text-gray-400 shrink-0"/>
                        <input required className="w-full p-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" placeholder="QCitizen ID Number" value={formData.qcId} onChange={e => setFormData({...formData, qcId: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-2">
                        <FileCheck size={16} className="text-gray-400 shrink-0"/>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
                        <div onClick={() => fileInputRef.current.click()} className={`w-full p-2 border border-dashed rounded text-xs cursor-pointer hover:bg-gray-50 text-center transition-colors flex items-center justify-center gap-2 ${formData.qcIdFile ? 'bg-green-50 border-green-400 text-green-700 font-bold' : 'bg-white border-gray-400 text-gray-400'}`}>
                            {formData.qcIdFile ? <><FileCheck size={14}/> {formData.qcIdFile.name}</> : <><UploadCloud size={14}/> Upload QC ID (Image/PDF)</>}
                        </div>
                    </div>
                </div>
            </>
          )}

          {mode === 'register' && role === 'Employer' && (
            <>
                <div className="space-y-3">
                    <input required className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500" placeholder="Company Name" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                    <select className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-gray-500" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}>
                        <option value="">Select Industry</option>
                        <option>BPO / Call Center</option>
                        <option>IT & Software</option>
                        <option>Government</option>
                        <option>Retail & Sales</option>
                        <option>Education</option>
                        <option>Healthcare</option>
                    </select>
                    
                    <div className="relative">
                        <MapPin size={18} className="absolute top-3.5 left-3 text-gray-400"/>
                        <input required className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500" placeholder="Company Address (Quezon City)" value={formData.companyAddress} onChange={e => setFormData({...formData, companyAddress: e.target.value})} />
                    </div>
                    
                    <div className="flex gap-2">
                        <div className="relative w-1/2">
                            <Phone size={18} className="absolute top-3.5 left-3 text-gray-400"/>
                            <input required className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500" placeholder="Contact No." value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
                        </div>
                        <div className="relative w-1/2">
                            <Globe size={18} className="absolute top-3.5 left-3 text-gray-400"/>
                            <input className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500" placeholder="Website (Optional)" value={formData.companyWebsite} onChange={e => setFormData({...formData, companyWebsite: e.target.value})} />
                        </div>
                    </div>
                </div>

                {/* ✅ REMOVED DOCUMENT UPLOAD FOR EMPLOYER HERE */}
                {/* Upload will happen in Dashboard after login */}
            </>
          )}

          <div>
            <input required type="email" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Email address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <input required type="password" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          <p className="text-[11px] text-gray-500 text-center px-4 leading-tight">
             By clicking {mode === 'login' ? 'Log In' : 'Sign Up'}, you agree to our Terms, Data Policy and Cookies Policy.
          </p>

          <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-colors mt-2 text-lg shadow-md">
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-6 text-center border-t pt-6">
          <button type="button" onClick={() => {setMode(mode === 'login' ? 'register' : 'login'); setLoginError('');}} className="text-blue-600 font-bold hover:underline text-sm">
            {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;