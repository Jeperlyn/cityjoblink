import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Building2, CreditCard, FileCheck } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [mode, setMode] = useState('login'); 
  const [role, setRole] = useState('Seeker'); 
  const [loginError, setLoginError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '', name: '', industry: '', qcId: '' });

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    setLoginError(''); 
    
    // Siguraduhing may laman ang onLogin bago tawagin
    if (onLogin) {
        const success = onLogin(mode, mode === 'login' ? formData : { ...formData, role });
        if (!success) {
            setLoginError(mode === 'login' ? "User not found." : "Error registering.");
        }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2 text-center">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-gray-500 text-sm text-center mb-8">{mode === 'login' ? 'Log in to access dashboard.' : 'Join CityJobLink.'}</p>
        
        {mode === 'register' && (
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <button type="button" onClick={() => setRole('Seeker')} className={`flex-1 py-2 rounded-md text-sm font-bold ${role === 'Seeker' ? 'bg-white shadow text-cyan-600' : 'text-gray-500'}`}>Job Seeker</button>
            <button type="button" onClick={() => setRole('Employer')} className={`flex-1 py-2 rounded-md text-sm font-bold ${role === 'Employer' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>Employer</button>
          </div>
        )}
        
        {loginError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4 flex items-center gap-2 border border-red-100"><X size={16}/> {loginError}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && <div><input required className="w-full p-3 bg-gray-50 border rounded-lg" placeholder={role==='Employer'?"Company Name":"Full Name"} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>}
          
          {/* QC ID SECTION - Fixed CSS Conflict here */}
          {mode === 'register' && role === 'Seeker' && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
               {/* Removed 'block' class, kept 'flex' */}
               <label className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-1"><Building2 size={14}/> QCitizen Verification</label>
               <p className="text-[10px] text-gray-500 mb-2">This portal is exclusive to Quezon City residents. Please provide your QCitizen ID details.</p>
               <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={16} className="text-gray-400"/>
                  <input required className="w-full p-2 bg-white border rounded text-sm" placeholder="QCitizen ID Number" value={formData.qcId} onChange={e => setFormData({...formData, qcId: e.target.value})} />
               </div>
               <div className="flex items-center gap-2">
                  <FileCheck size={16} className="text-gray-400"/>
                  <div className="w-full p-2 bg-white border border-dashed rounded text-sm text-gray-400 cursor-pointer hover:bg-gray-50 text-center">Upload QC ID (Image/PDF)</div>
               </div>
            </div>
          )}

          {mode === 'register' && role === 'Employer' && <div><select className="w-full p-3 bg-gray-50 border rounded-lg" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}><option value="">Select Industry</option><option>BPO / Call Center</option><option>IT & Software</option><option>Government</option></select></div>}
          <div><input required type="email" className="w-full p-3 bg-gray-50 border rounded-lg" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
          <div><input required type="password" className="w-full p-3 bg-gray-50 border rounded-lg" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
          <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-colors mt-2">{mode === 'login' ? 'Log In' : 'Sign Up'}</button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500">{mode === 'login' ? "No account? " : "Have account? "} 
            <button type="button" onClick={() => {setMode(mode === 'login' ? 'register' : 'login'); setLoginError('');}} className="text-cyan-600 font-bold hover:underline">
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;