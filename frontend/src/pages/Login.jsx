import React, { useState, useRef, useEffect } from 'react';
import { X, Building2, CreditCard, FileCheck, HelpCircle, UploadCloud, Globe, MapPin, Phone, CheckCircle, AlertCircle, Loader2, Lock, UserCheck, ShieldCheck } from 'lucide-react';

// --- SMART MODAL COMPONENT ---
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
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
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
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [modal, setModal] = useState({ type: null, title: '', message: '' });
  
  const qcIdInputRef = useRef(null);

  const [formData, setFormData] = useState({ 
    email: '', password: '', firstName: '', middleName: '', lastName: '', suffix: '', 
    companyName: '', industry: '', companyAddress: '', companyWebsite: '', contactNumber: '', 
    qcId: '', qcIdFile: null, 
    bdayMonth: 'Jan', bdayDay: '1', bdayYear: '2005', gender: '',
    isQcResident: true 
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = Array.from({length: 31}, (_, i) => i + 1);
  const years = Array.from({length: 100}, (_, i) => new Date().getFullYear() - i);
  const suffixes = ["", "Jr.", "Sr.", "II", "III", "IV", "V"];

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

  // --- ❌ TEST CASE VALIDATIONS (CORE LOGIC) ---
  const validateForm = () => {
    // 1. Username / Name Validation
    const nameRegex = /^[a-zA-Z\s.-]*$/;
    const trimFName = formData.firstName.trim();
    const trimLName = formData.lastName.trim();

    if (!trimFName || !trimLName) return "Name fields cannot be empty or pure spaces.";
    if (trimFName.length < 2 || trimLName.length < 2) return "Names are too short (minimum 2 characters).";
    if (trimFName.length > 50 || trimLName.length > 50) return "Names exceed maximum length.";
    if (!nameRegex.test(formData.firstName) || !nameRegex.test(formData.lastName)) {
        return "Names cannot contain numbers, emojis, or special characters.";
    }

    // 2. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        return "Invalid email format (e.g. user@gmail.com). No spaces or multiple @ allowed.";
    }

    // 3. Age Validation (18 years old and up)
    const birthDate = new Date(`${formData.bdayMonth} ${formData.bdayDay}, ${formData.bdayYear}`);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
    if (age < 18) return "Registration failed: You must be at least 18 years old.";

    // 4. Password Validation
    const passErr = validatePassword(formData.password);
    if (passErr) return passErr;

    // 5. Seeker Specific (QC ID vs Other ID)
    if (role === 'Seeker' && !formData.gender) {
        return "Please select your gender.";
    }

    if (role === 'Seeker' && !formData.qcIdFile) {
        return formData.isQcResident ? "Submission of QCitizen ID is required for residents." : "Verification ID (Barangay/Gov ID) is required.";
    }

    return null;
  };

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(password)) return "Password requires at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password requires at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password requires at least one number.";
    if (!/[!@#$%^&*]/.test(password)) return "Password requires at least one special character.";
    if (password === formData.firstName) return "Password cannot be the same as your name.";
    return null; 
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const response = await fetch('http://localhost:8000/api/verify-otp', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json' 
                    },
                    body: JSON.stringify({ email: formData.email, otp: otpCode })
                });
                
        const data = await response.json();
        if (response.ok) {
            const loginResponse = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: formData.password })
            });
            const loginData = await loginResponse.json();
            if (loginData.status === 'success') {
                localStorage.setItem('user', JSON.stringify(loginData.user)); 
                if (onLogin) onLogin('login_success', loginData.user);
            } else {
               setModal({ type: 'error', title: 'Login Error', message: 'Verification successful but session failed.' });
            }
        } else {
            setModal({ type: 'error', title: 'Invalid OTP', message: 'The 6-digit code is incorrect. Please try again.' });
        }
    } catch (err) {
        setModal({ type: 'error', title: 'Server Error', message: 'Cannot reach verification server.' });
    } finally {
        setIsLoading(false);
    }
  };

const handleSubmit = async (e) => { 
    e.preventDefault(); 
    
    if (mode === 'register') {
        const error = validateForm();
        if (error) {
            setModal({ type: 'error', title: 'Validation Failed', message: error });
            return;
        }

        setIsLoading(true);
        try {
            const regResponse = await fetch('http://localhost:8000/api/register', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    middleName: formData.middleName,
                    suffix: formData.suffix,
                    companyName: formData.companyName,
                    qcId: formData.qcId,
                    bdayMonth: formData.bdayMonth,
                    bdayDay: formData.bdayDay,
                    bdayYear: formData.bdayYear,
                    gender: formData.gender,
                    isQcResident: formData.isQcResident,
                    email: formData.email,
                    password: formData.password,
                    role: role
                })
            });
            
            const regData = await regResponse.json();
            
            if (regData.status === 'success') {
                // Trigger the OTP screen
                setIsOtpStep(true); 
                const successMessage = regData.message || `We sent a verification code to ${formData.email}.`;
                setModal({ type: 'success', title: 'Code Sent!', message: successMessage });
            } else {
                setModal({ type: 'error', title: 'Registration Error', message: regData.message || "Email might already be taken." });
            }
        } catch (err) {
            setModal({ type: 'error', title: 'Connection Error', message: "Check your internet or server status." });
        } finally {
            setIsLoading(false);
        }
    } else {
        // --- LOGIN FLOW ---
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' 
                },
                body: JSON.stringify({ email: formData.email, password: formData.password })
            });
            const data = await response.json();
            if (data.status === 'success') {
                localStorage.setItem('user', JSON.stringify(data.user)); 
                if (onLogin) onLogin('login_success', data.user);
            } else {
                setModal({ type: 'error', title: 'Login Failed', message: data.message || "Invalid email or password. Please try again." });
            }
        } catch (err) {
            setModal({ type: 'error', title: 'Server Error', message: "Service is temporarily unavailable." });
        } finally {
            setIsLoading(false);
        }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-100 px-4 py-12 font-sans">
      <SmartModal type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal({ type: null })} />
        
      <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full animate-in fade-in zoom-in duration-300">
        
        {/* HEADER */}
        <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                {isOtpStep ? 'Security Check' : (mode === 'login' ? 'CityJobLink' : 'Registration')}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
                {isOtpStep ? 'Verify your identity to proceed.' : (mode === 'login' ? 'Access your QCitizen portal.' : "Join the local workforce today.")}
            </p>
        </div>
        
        {isOtpStep ? (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                    <ShieldCheck className="mx-auto text-blue-600 mb-2" size={28}/>
                    <p className="text-xs text-blue-800">OTP sent to: <br/><strong>{formData.email}</strong></p>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Enter 6-Digit Code</label>
                    <input 
                        required 
                        type="text" 
                        maxLength="6"
                        className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-center text-2xl tracking-[0.5em] font-black" 
                        placeholder="000000" 
                        value={otpCode} 
                        onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} 
                    />
                </div>
                <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-3 rounded-xl transition-all text-lg shadow-lg flex items-center justify-center gap-2 ${isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}>
                    {isLoading && <Loader2 className="animate-spin" size={20}/>}
                    Verify Account
                </button>
                <button type="button" onClick={() => setIsOtpStep(false)} className="w-full text-gray-400 text-sm hover:text-blue-600 transition-colors">Wrong email? Change it here.</button>
            </form>
        ) : (
            <>
                {mode === 'register' && (
                <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                    <button type="button" onClick={() => setRole('Seeker')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === 'Seeker' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Job Seeker</button>
                    <button type="button" onClick={() => setRole('Employer')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === 'Employer' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>Employer</button>
                </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && role === 'Seeker' && (
                    <>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input required className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                                <input className="w-1/3 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="M.I." maxLength={5} value={formData.middleName} onChange={e => setFormData({...formData, middleName: e.target.value})} />
                            </div>
                            <div className="flex gap-2">
                                <input required className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                                <select className="w-1/4 p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 text-sm" value={formData.suffix} onChange={e => setFormData({...formData, suffix: e.target.value})}><option value="">Suffix</option>{suffixes.map(s => s && <option key={s} value={s}>{s}</option>)}</select>
                            </div>
                        </div>

                        {/* RESIDENCY SWITCHER */}
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                            <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Are you a QC Resident?</span>
                            <div className="flex gap-1 bg-gray-200 p-1 rounded-lg">
                                <button type="button" onClick={() => setFormData({...formData, isQcResident: true})} className={`px-4 py-1 rounded-md text-[10px] font-black transition-all ${formData.isQcResident ? 'bg-blue-600 text-white shadow' : 'text-gray-500'}`}>YES</button>
                                <button type="button" onClick={() => setFormData({...formData, isQcResident: false})} className={`px-4 py-1 rounded-md text-[10px] font-black transition-all ${!formData.isQcResident ? 'bg-gray-600 text-white shadow' : 'text-gray-500'}`}>NO</button>
                            </div>
                        </div>

                        <div className="pt-1">
                            <label className="text-xs text-gray-500 font-bold ml-1">Date of Birth (Must be 18+)</label>
                            <div className="flex gap-2 mt-1">
                                <select className="flex-1 p-2 border border-gray-300 rounded-lg bg-white text-sm" value={formData.bdayMonth} onChange={e => setFormData({...formData, bdayMonth: e.target.value})}>{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                <select className="flex-1 p-2 border border-gray-300 rounded-lg bg-white text-sm" value={formData.bdayDay} onChange={e => setFormData({...formData, bdayDay: e.target.value})}>{days.map(d => <option key={d} value={d}>{d}</option>)}</select>
                                <select className="flex-1 p-2 border border-gray-300 rounded-lg bg-white text-sm" value={formData.bdayYear} onChange={e => setFormData({...formData, bdayYear: e.target.value})}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                            </div>
                        </div>

                        <div className="pt-1">
                            <label className="text-xs text-gray-500 font-bold ml-1">Gender</label>
                            <select
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm mt-1"
                                value={formData.gender}
                                onChange={e => setFormData({...formData, gender: e.target.value})}
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Binary">Binary</option>
                            </select>
                        </div>
                        
                        {/* ID SECTION */}
                        <div className={`${formData.isQcResident ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} p-4 rounded-xl border-2 border-dashed mt-2`}>
                            <label className={`text-[10px] font-black uppercase mb-2 flex items-center gap-1 ${formData.isQcResident ? 'text-blue-700' : 'text-orange-700'}`}>
                                <CreditCard size={14}/> {formData.isQcResident ? 'Priority QC Verification' : 'Standard ID Verification'}
                            </label>
                            <input required className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm mb-2" placeholder={formData.isQcResident ? "QC ID Number" : "Valid ID Number (Barangay/Passport)"} value={formData.qcId} onChange={e => setFormData({...formData, qcId: e.target.value})} />
                            <input type="file" ref={qcIdInputRef} onChange={handleQcIdChange} className="hidden" accept="image/*,application/pdf" />
                            <div onClick={() => qcIdInputRef.current.click()} className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[10px] cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-500 font-bold">
                                {formData.qcIdFile ? <><FileCheck className="text-green-600" size={14}/> {formData.qcIdFile.name}</> : <><UploadCloud size={14}/> Upload ID Document</>}
                            </div>
                        </div>
                    </>
                )}

                {/* EMPLOYER SECTION */}
                {mode === 'register' && role === 'Employer' && (
                    <div className="space-y-3">
                        <input required className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" placeholder="Company Name" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                        <select className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 text-sm" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}><option value="">Select Industry</option><option>BPO / Call Center</option><option>IT & Software</option><option>Healthcare</option><option>Retail & Sales</option></select>
                        <input required className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" placeholder="Business Address" value={formData.companyAddress} onChange={e => setFormData({...formData, companyAddress: e.target.value})} />
                    </div>
                )}
                
                <input required type="email" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Email (juan@gmail.com)" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input required type="password" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Password (Min. 8 Chars)" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />

                <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-3 rounded-xl transition-all mt-4 text-lg shadow-lg flex items-center justify-center gap-2 ${isLoading ? 'bg-gray-400' : 'bg-black hover:bg-gray-800 active:scale-95'}`}>
                    {isLoading && <Loader2 className="animate-spin" size={20}/>}
                    {mode === 'login' ? 'Log In' : 'Create Account'}
                </button>
                </form>
                
                <div className="mt-6 text-center border-t pt-6">
                    <button type="button" onClick={() => {setMode(mode === 'login' ? 'register' : 'login'); setModal({type: null})}} className="text-blue-600 font-bold hover:underline text-sm transition-all">
                        {mode === 'login' ? "New here? Register now." : "Already have an account? Login here."}
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default Login;