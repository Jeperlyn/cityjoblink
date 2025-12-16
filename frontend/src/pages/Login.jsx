import React, { useState, useRef, useEffect } from 'react';
import { X, Building2, CreditCard, FileCheck, HelpCircle, UploadCloud, Globe, MapPin, Phone, CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react';

// --- SMART MODAL COMPONENT (Walang Pagbabago) ---
const SmartModal = ({ type, title, message, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform scale-100 transition-all">
        <div className={`p-6 text-center ${type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`mx-auto w-16 h-16 flex items-center justify-center rounded-full mb-4 ${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {type === 'success' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
          </div>
          <h3 className={`text-xl font-bold mb-2 ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {message}
          </p>
        </div>
        <div className="p-4 bg-gray-50 border-t">
          <button 
            onClick={onClose} 
            className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {type === 'success' ? 'Okay' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const Login = ({ onLogin }) => {
  const [mode, setMode] = useState('login'); 
  const [role, setRole] = useState('Seeker'); 
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP States
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [modal, setModal] = useState({ type: null, title: '', message: '' });
  const qcIdInputRef = useRef(null);
  const resumeInputRef = useRef(null); // 💡 NEW: Ref para sa Resume

  const [formData, setFormData] = useState({ 
    email: '', password: '', firstName: '', middleName: '', lastName: '', suffix: '', 
    companyName: '', industry: '', companyAddress: '', companyWebsite: '', contactNumber: '', 
    qcId: '', qcIdFile: null, 
    resumeFile: null, // 💡 NEW: Resume File State
    bdayMonth: 'Jan', bdayDay: '1', bdayYear: '2005', gender: ''
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = Array.from({length: 31}, (_, i) => i + 1);
  const years = Array.from({length: 100}, (_, i) => new Date().getFullYear() - i);
  const suffixes = ["", "Jr.", "Sr.", "II", "III", "IV", "V"];

  // Persistence logic (Keep this here for now)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        if (onLogin) onLogin('auto_login', user);
    }
  }, [onLogin]); 

const handleQcIdChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFormData({ ...formData, qcIdFile: file });
  };
// ...
  // 💡 NEW: Handle Resume File Change
  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFormData({ ...formData, resumeFile: file });
  };

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character (!@#$...).";
    return null; 
  };

const uploadResume = async (email, resumeFile) => {
    
    if (!resumeFile) {
        console.error("DEBUG: resumeFile is NULL or Undefined before sending!");
        return false;
    }
    console.log("DEBUG: File size being sent:", resumeFile.size); 
    // 🚩 CRITICAL DEBUG STEP 🚩
    console.log("DEBUG: Email being used for upload:", email); 
    
    const data = new FormData();
    data.append('email', email);
    data.append('resumeFile', resumeFile);
    
    console.log(`Attempting to upload resume for: ${email}`);
    
    try {
        const response = await fetch('http://localhost:5000/api/upload/resume', {
            method: 'POST',
            body: data, // Walang headers at walang JSON.stringify()
        });
        const result = await response.json();
        
        if (result.status !== 'success') {
            console.error("Resume Upload Error:", result.message);
            // Pwede mong i-log ang error pero huwag i-block ang OTP step
            return false;
        }
        return true;
    } catch (error) {
        console.error("Critical Resume Upload Failure (Network):", error);
        return false;
    }
  };


  // --- HANDLE OTP VERIFICATION ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        const response = await fetch('http://localhost:5000/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, otp: otpCode })
        });

        const data = await response.json();

        if (response.ok) {
            // OTP Verified! Attempt Auto Login
            const loginResponse = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: formData.password })
            });
            const loginData = await loginResponse.json();

            if (loginData.status === 'success') {
                // Save user to localStorage after successful OTP/Login
                localStorage.setItem('user', JSON.stringify(loginData.user)); 
                if (onLogin) onLogin('login_success', loginData.user);
            } else {
               setModal({ type: 'error', title: 'Login Error', message: 'OTP correct but login failed.' });
            }

        } else {
            setModal({ type: 'error', title: 'Invalid OTP', message: data.error || 'Please check the code and try again.' });
        }
    } catch (err) {
        console.error(err);
        setModal({ type: 'error', title: 'Server Error', message: 'Failed to verify OTP.' });
    } finally {
        setIsLoading(false);
    }
  };

  // --- MAIN SUBMIT HANDLER ---
  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    
    // --- REGISTER FLOW ---
    if (mode === 'register') {
        // Pre-validation (QC ID is required for Seeker)
        if (role === 'Seeker' && !formData.qcIdFile) {
            setModal({ type: 'error', title: 'Missing Document', message: 'Please upload your QCitizen ID.' });
            return;
        }
        // NEW: Resume is also required for Seeker
        if (role === 'Seeker' && !formData.resumeFile) {
            setModal({ type: 'error', title: 'Missing Document', message: 'Please upload your Resume (PDF/DOC).' });
            return;
        }
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            setModal({ type: 'error', title: 'Weak Password', message: passwordError });
            return; 
        }

        setIsLoading(true);
        try {
            // 1. Register User (Saves to DB & Sends OTP Automatically)
            const regResponse = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    role: role,
                    qcIdFileName: formData.qcIdFile ? formData.qcIdFile.name : null
                })
            });
            const regData = await regResponse.json();

            if (regData.status === 'success') {
                // 💡 NEW: I-handle ang Resume Upload pagkatapos ng successful registration
                if (role === 'Seeker' && formData.resumeFile) {
                    await uploadResume(formData.email, formData.resumeFile);
                }
                
                // 2. Success! Switch directly to OTP Mode
                setIsOtpStep(true); 
                setModal({ 
                    type: 'success', 
                    title: 'Registration Success!', 
                    message: `We sent a 6-digit code to ${formData.email}. Please enter it to verify.` 
                });
            } else {
                setModal({ type: 'error', title: 'Registration Failed', message: regData.message || "Error occurred." });
            }
        } catch (err) {
            console.error(err);
            setModal({ type: 'error', title: 'Connection Error', message: "Cannot connect to server." });
        } finally {
            setIsLoading(false);
        }

    } else {
        // --- LOGIN FLOW (Walang Pagbabago) ---
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });
            
            const data = await response.json();

            if (data.status === 'success') {
                localStorage.setItem('user', JSON.stringify(data.user)); 
                
                if (onLogin) onLogin('login_success', data.user);
            } else {
                setModal({ type: 'error', title: 'Login Failed', message: data.message || "Invalid credentials." });
            }
        } catch (err) {
            console.error(err);
            setModal({ type: 'error', title: 'Connection Error', message: "Cannot connect to server." });
        } finally {
            setIsLoading(false);
        }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-100 px-4 py-12 font-sans">
      <SmartModal 
        type={modal.type} title={modal.title} message={modal.message} 
        onClose={() => setModal({ type: null })} 
      />
        
      <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-200 max-w-md w-full">
        
        {/* HEADER */}
        <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                {isOtpStep ? 'Verify Email' : (mode === 'login' ? 'CityJobLink' : 'Create Account')}
            </h2>
            <p className="text-gray-500 text-sm">
                {isOtpStep ? 'Enter the code sent to your email.' : (mode === 'login' ? 'Welcome back, QCitizen!' : "It's quick and easy.")}
            </p>
        </div>
        
        {/* --- OTP INPUT SCREEN --- */}
        {isOtpStep ? (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                    <Lock className="mx-auto text-blue-600 mb-2" size={24}/>
                    <p className="text-xs text-blue-800">A secure code has been sent to <br/><strong>{formData.email}</strong></p>
                </div>
                {/* ... (OTP Input Field) ... */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Enter One-Time Password (OTP)</label>
                    <input 
                        required 
                        type="text" 
                        maxLength="6"
                        className="w-full p-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-center text-2xl tracking-widest font-bold" 
                        placeholder="0 0 0 0 0 0" 
                        value={otpCode} 
                        onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} 
                    />
                </div>
                {/* ... (Verify button) ... */}
                <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-3 rounded-lg transition-colors text-lg shadow-md flex items-center justify-center gap-2 ${isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
                    {isLoading && <Loader2 className="animate-spin" size={20}/>}
                    Verify & Login
                </button>

                <button type="button" onClick={() => setIsOtpStep(false)} className="w-full text-gray-500 text-sm hover:underline mt-4">
                    Back to Registration
                </button>
            </form>
        ) : (
            // --- LOGIN / REGISTER FORM ---
            <>
                {/* ... (Role Switcher) ... */}
                {mode === 'register' && (
                <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                    <button type="button" onClick={() => setRole('Seeker')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${role === 'Seeker' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Job Seeker</button>
                    <button type="button" onClick={() => setRole('Employer')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${role === 'Employer' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>Employer</button>
                </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && role === 'Seeker' && (
                    <>
                        {/* ... (Personal Details: Name, Birthday, Gender) ... */}
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input required className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                                <input className="w-1/3 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="M.I." maxLength={20} value={formData.middleName} onChange={e => setFormData({...formData, middleName: e.target.value})} />
                            </div>
                            <div className="flex gap-2">
                                <input required className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                                <select className="w-1/4 p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 text-sm" value={formData.suffix} onChange={e => setFormData({...formData, suffix: e.target.value})}><option value="">Suffix</option>{suffixes.map(s => s && <option key={s} value={s}>{s}</option>)}</select>
                            </div>
                        </div>
                        <div className="pt-1">
                            <div className="flex items-center gap-1 mb-1"><label className="text-xs text-gray-500 font-bold">Birthday</label><HelpCircle size={12} className="text-gray-400"/></div>
                            <div className="flex gap-2">
                                <select className="flex-1 p-2 border border-gray-300 rounded bg-white text-sm" value={formData.bdayMonth} onChange={e => setFormData({...formData, bdayMonth: e.target.value})}>{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                <select className="flex-1 p-2 border border-gray-300 rounded bg-white text-sm" value={formData.bdayDay} onChange={e => setFormData({...formData.bdayDay, bdayDay: e.target.value})}>{days.map(d => <option key={d} value={d}>{d}</option>)}</select>
                                <select className="flex-1 p-2 border border-gray-300 rounded bg-white text-sm" value={formData.bdayYear} onChange={e => setFormData({...formData, bdayYear: e.target.value})}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                            </div>
                        </div>
                        <div className="pt-1">
                            <div className="flex items-center gap-1 mb-1"><label className="text-xs text-gray-500 font-bold">Gender Identity</label><HelpCircle size={12} className="text-gray-400"/></div>
                            <div className="grid grid-cols-2 gap-2">
                                {['Female', 'Male', 'Non-Binary', 'Prefer not to say'].map((g) => (
                                    <label key={g} className={`flex items-center justify-between border p-2 rounded cursor-pointer transition-all hover:bg-gray-50 ${formData.gender === g ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}><span className="text-sm text-gray-700">{g}</span><input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={e => setFormData({...formData, gender: e.target.value})} className="accent-black"/></label>
                                ))}
                            </div>
                        </div>
                        
                        {/* 💡 NEW FIELD: RESUME UPLOAD */}
                        <div className="pt-1">
                            <div className="flex items-center gap-1 mb-1"><label className="text-xs text-gray-500 font-bold">Resume Upload</label><HelpCircle size={12} className="text-gray-400"/></div>
                            <div className="flex items-center gap-2">
                                <FileCheck size={16} className="text-gray-400 shrink-0"/>
                                {/* 💡 NEW: Resume Input Field */}
                                <input 
                                    type="file" 
                                    ref={resumeInputRef} 
                                    onChange={handleResumeChange} 
                                    className="hidden" 
                                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                                />
                                <div 
                                    onClick={() => resumeInputRef.current.click()} 
                                    className={`w-full p-3 border border-dashed rounded text-xs cursor-pointer hover:bg-gray-50 text-center transition-colors flex items-center justify-center gap-2 ${formData.resumeFile ? 'bg-green-50 border-green-400 text-green-700 font-bold' : 'bg-white border-gray-400 text-gray-400'}`}
                                >
                                    {formData.resumeFile ? <><FileCheck size={14}/> {formData.resumeFile.name}</> : <><UploadCloud size={14}/> Upload Resume (PDF/DOCX)</>}
                                </div>
                            </div>
                        </div>

                        {/* QCitizen ID Verification (Ibinago ang ref) */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                            <label className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-1"><Building2 size={14}/> QCitizen Verification</label>
                            <p className="text-[10px] text-gray-500 mb-2 leading-tight">This portal is exclusive to Quezon City residents.</p>
                            <div className="flex items-center gap-2 mb-2"><CreditCard size={16} className="text-gray-400 shrink-0"/><input required className="w-full p-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" placeholder="QCitizen ID Number" value={formData.qcId} onChange={e => setFormData({...formData, qcId: e.target.value})} /></div>
                            <div className="flex items-center gap-2"><FileCheck size={16} className="text-gray-400 shrink-0"/>
                                {/* 💡 Ibinago ang ref name to qcIdInputRef */}
                                <input type="file" ref={qcIdInputRef} onChange={handleQcIdChange} className="hidden" accept="image/*,application/pdf" />
                                <div onClick={() => qcIdInputRef.current.click()} className={`w-full p-2 border border-dashed rounded text-xs cursor-pointer hover:bg-gray-50 text-center transition-colors flex items-center justify-center gap-2 ${formData.qcIdFile ? 'bg-green-50 border-green-400 text-green-700 font-bold' : 'bg-white border-gray-400 text-gray-400'}`}>{formData.qcIdFile ? <><FileCheck size={14}/> {formData.qcIdFile.name}</> : <><UploadCloud size={14}/> Upload QC ID (Image/PDF)</>}</div>
                            </div>
                        </div>
                    </>
                )}

                {/* ... (Employer Register Form - Walang Pagbabago) ... */}
                {mode === 'register' && role === 'Employer' && (
                    <>
                        <div className="space-y-3">
                            <input required className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500" placeholder="Company Name" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                            <select className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-gray-500" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}><option value="">Select Industry</option><option>BPO / Call Center</option><option>IT & Software</option><option>Government</option><option>Retail & Sales</option><option>Education</option><option>Healthcare</option></select>
                            <div className="relative"><MapPin size={18} className="absolute top-3.5 left-3 text-gray-400"/><input required className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500" placeholder="Company Address (Quezon City)" value={formData.companyAddress} onChange={e => setFormData({...formData, companyAddress: e.target.value})} /></div>
                            <div className="flex gap-2"><div className="relative w-1/2"><Phone size={18} className="absolute top-3.5 left-3 text-gray-400"/><input required className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500" placeholder="Contact No." value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} /></div><div className="relative w-1/2"><Globe size={18} className="absolute top-3.5 left-3 text-gray-400"/><input className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500" placeholder="Website (Optional)" value={formData.companyWebsite} onChange={e => setFormData({...formData, companyWebsite: e.target.value})} /></div></div>
                        </div>
                    </>
                )}
                
                <div><input required type="email" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Email address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                
                <div>
                    <input required type="password" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    {mode === 'register' && <p className="text-[10px] text-gray-500 mt-1 px-1">Must be 8+ characters with uppercase, number, and symbol.</p>}
                </div>

                <p className="text-[11px] text-gray-500 text-center px-4 leading-tight">By clicking {mode === 'login' ? 'Log In' : 'Sign Up'}, you agree to our Terms, Data Policy and Cookies Policy.</p>
                <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-3 rounded-lg transition-colors mt-2 text-lg shadow-md flex items-center justify-center gap-2 ${isLoading ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'}`}>{isLoading && <Loader2 className="animate-spin" size={20}/>}{mode === 'login' ? 'Log In' : 'Sign Up'}</button>
                </form>
                <div className="mt-6 text-center border-t pt-6"><button type="button" onClick={() => {setMode(mode === 'login' ? 'register' : 'login'); setModal({type: null})}} className="text-blue-600 font-bold hover:underline text-sm">{mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Log In"}</button></div>
            </>
        )}
      </div>
    </div>
  );
};

export default Login;