import React, { useState, useRef, useEffect } from 'react';
import { X, Building2, CreditCard, FileCheck, HelpCircle, UploadCloud, Globe, MapPin, Phone, CheckCircle, AlertCircle, Loader2, Lock, UserCheck, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { API_BASE } from '../lib/apiBase';
import loginBackground from '../assets/img/login.jpg';
import logoPESO from '../assets/img/logo-PESO.png';
import {
    formatQcId338,
} from '../lib/qcQrParser';

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
    const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
    const [forgotCodeSent, setForgotCodeSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [modal, setModal] = useState({ type: null, title: '', message: '' });
  
  const qcIdInputRef = useRef(null);
    const employerBirInputRef = useRef(null);
    const employerSecInputRef = useRef(null);
    const employerBusinessPermitInputRef = useRef(null);

  const [formData, setFormData] = useState({ 
        email: '', password: '', confirmPassword: '', resetOtp: '', firstName: '', middleName: '', lastName: '', suffix: '', 
    companyName: '', industry: '', companyAddress: '', companyWebsite: '', contactNumber: '', 
    qcId: '', qcIdFile: null, 
        employerBirFile: null, employerSecFile: null, employerBusinessPermitFile: null,
    bdayMonth: 'Jan', bdayDay: '1', bdayYear: '2005', gender: '',
    isQcResident: true 
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = Array.from({length: 31}, (_, i) => i + 1);
  
  // FIXED: Restrict years to ensure user is at least 18 years old
  const maxYear = new Date().getFullYear() - 18;
  const years = Array.from({length: 100}, (_, i) => maxYear - i);

    const nameRegex = /^[a-zA-Z\s.-]*$/;
    const qcIdRegex = /^\d{3}-\d{3}-\d{8}(?:-\d{1,2})?$/;

    const sanitizeNameInput = (value, maxLength = 100) => value.replace(/[^a-zA-Z\s.-]/g, '').slice(0, maxLength);

    const calculateAge = (monthLabel, dayValue, yearValue) => {
        const monthIndex = months.indexOf(monthLabel);
        const dayNumber = Number(dayValue);
        const yearNumber = Number(yearValue);

        if (monthIndex < 0 || !Number.isInteger(dayNumber) || !Number.isInteger(yearNumber)) {
            return null;
        }

        const birthDate = new Date(yearNumber, monthIndex, dayNumber);
        if (
            birthDate.getFullYear() !== yearNumber ||
            birthDate.getMonth() !== monthIndex ||
            birthDate.getDate() !== dayNumber
        ) {
            return null;
        }

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age -= 1;
        }

        return age;
    };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        if (onLogin) onLogin('auto_login', user);
    }
  }, [onLogin]); 

  const handleQcIdChange = (e) => {
    const file = e.target.files?.[0];
        if (file) {
            setFormData((prev) => ({ ...prev, qcIdFile: file }));
        }
  };

    const handleQcIdInputChange = (e) => {
        const value = e.target.value;

        // Non-QC residents use standard alphanumeric IDs.
        if (!formData.isQcResident) {
            const alphanumericValue = value.replace(/[^a-zA-Z0-9-\s]/g, '').toUpperCase();
            setFormData((prev) => ({ ...prev, qcId: alphanumericValue }));
            return;
        }

        // QC residents: digits-only input, then format to ###-###-########-## style.
        setFormData((prev) => ({ ...prev, qcId: formatQcId338(value) }));
    };

  // --- ❌ TEST CASE VALIDATIONS (CORE LOGIC) ---
  const validateForm = () => {
    // 1. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        return "Invalid email format (e.g. user@gmail.com). No spaces or multiple @ allowed.";
    }

    // 2. Password Validation
    const passErr = validatePassword(formData.password);
    if (passErr) return passErr;
    if (formData.password !== formData.confirmPassword) {
        return "Password confirmation does not match.";
    }

    if (role === 'Seeker') {
        const trimFName = formData.firstName.trim();
        const trimMName = formData.middleName.trim();
        const trimLName = formData.lastName.trim();
        const trimSuffix = formData.suffix.trim();

        if (!trimFName || !trimLName) return "Name fields cannot be empty or pure spaces.";
        if (trimFName.length < 2 || trimLName.length < 2) return "Names are too short (minimum 2 characters).";
        if (trimFName.length > 50 || trimLName.length > 50 || trimMName.length > 50 || trimSuffix.length > 20) return "Names exceed maximum length.";
        if (!nameRegex.test(formData.firstName) || !nameRegex.test(formData.middleName) || !nameRegex.test(formData.lastName) || !nameRegex.test(formData.suffix)) {
            return "Names cannot contain numbers, emojis, or special characters.";
        }

        const age = calculateAge(formData.bdayMonth, formData.bdayDay, formData.bdayYear);
        if (age === null) return "Please provide a valid date of birth.";
        if (age < 18) return "Registration failed: You must be at least 18 years old.";

        if (!formData.qcId) {
            return formData.isQcResident
                ? "QC ID number is required for residents."
                : "Valid ID number is required for non-residents.";
        }
        
        // FIXED: Conditional validation for QC vs Non-QC ID formats
        if (formData.isQcResident) {
            if (!qcIdRegex.test(formData.qcId)) {
                return "QC ID format is invalid. Use ###-###-######## with optional -## for 15 to 16 digits.";
            }
        } else {
            // FIXED: Enforce uppercase A-Z only
            const standardIdRegex = /^[A-Z0-9-\s]+$/;
            if (!standardIdRegex.test(formData.qcId)) {
                return "Standard ID must only contain uppercase letters, numbers, dashes, and spaces.";
            }
        }

        if (!formData.gender) {
            return "Please select your gender.";
        }

        if (!formData.qcIdFile) {
            return formData.isQcResident ? "Submission of QCitizen ID is required for residents." : "Verification ID (Barangay/Gov ID) is required.";
        }
    }

    if (role === 'Employer') {
        if (!formData.companyName.trim()) {
            return "Company name is required for employer registration.";
        }

        if (!formData.companyAddress.trim()) {
            return "Business address is required for employer registration.";
        }
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

    const employerRequirements = [
        {
            key: 'employerBirFile',
            label: 'BIR Registration',
            inputRef: employerBirInputRef,
        },
        {
            key: 'employerSecFile',
            label: 'SEC Registration',
            inputRef: employerSecInputRef,
        },
        {
            key: 'employerBusinessPermitFile',
            label: 'Business Permit',
            inputRef: employerBusinessPermitInputRef,
        },
    ];

    const uploadedEmployerRequirementCount = employerRequirements.filter((doc) => Boolean(formData[doc.key])).length;

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const response = await fetch(`${API_BASE}/verify-otp`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json' 
                    },
                    body: JSON.stringify({ email: formData.email, otp: otpCode })
                });
                
        const data = await response.json();
        if (response.ok) {
            const loginResponse = await fetch(`${API_BASE}/login`, {
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

    const handleForgotPasswordRequest = async (e) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setModal({ type: 'error', title: 'Invalid Email', message: 'Please enter a valid email address.' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/forgot-password/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email: formData.email })
            });

            const data = await response.json();
            if (data.status === 'success') {
                setForgotCodeSent(true);
                const successMessage = data.dev_otp
                    ? `${data.message}\n\nDEV OTP: ${data.dev_otp}`
                    : (data.message || `Reset code sent to ${formData.email}`);
                setModal({ type: 'success', title: 'Code Sent!', message: successMessage });
            } else {
                setModal({ type: 'error', title: 'Request Failed', message: data.message || 'Unable to send reset code.' });
            }
        } catch (err) {
            setModal({ type: 'error', title: 'Server Error', message: 'Cannot reach password reset server.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPasswordReset = async (e) => {
        e.preventDefault();

        if (!formData.resetOtp || formData.resetOtp.length !== 6) {
            setModal({ type: 'error', title: 'Invalid Code', message: 'Please enter the 6-digit reset code.' });
            return;
        }

        const passErr = validatePassword(formData.password);
        if (passErr) {
            setModal({ type: 'error', title: 'Validation Failed', message: passErr });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setModal({ type: 'error', title: 'Validation Failed', message: 'Password confirmation does not match.' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/forgot-password/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email,
                    otp: formData.resetOtp,
                    password: formData.password,
                    password_confirmation: formData.confirmPassword,
                })
            });

            const data = await response.json();
            if (data.status === 'success') {
                setModal({ type: 'success', title: 'Password Reset', message: data.message || 'Password has been reset.' });
                setIsForgotPasswordMode(false);
                setForgotCodeSent(false);
                setFormData((prev) => ({
                    ...prev,
                    password: '',
                    confirmPassword: '',
                    resetOtp: '',
                }));
            } else {
                setModal({ type: 'error', title: 'Reset Failed', message: data.message || 'Unable to reset password.' });
            }
        } catch (err) {
            setModal({ type: 'error', title: 'Server Error', message: 'Cannot reach password reset server.' });
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
            const registrationPayload = new FormData();
            registrationPayload.append('firstName', formData.firstName || '');
            registrationPayload.append('lastName', formData.lastName || '');
            registrationPayload.append('middleName', formData.middleName || '');
            registrationPayload.append('suffix', formData.suffix || '');
            registrationPayload.append('companyName', formData.companyName || '');
            registrationPayload.append('industry', formData.industry || '');
            registrationPayload.append('companyAddress', formData.companyAddress || '');
            registrationPayload.append('qcId', formData.qcId || '');
            registrationPayload.append('bdayMonth', formData.bdayMonth || '');
            registrationPayload.append('bdayDay', formData.bdayDay || '');
            registrationPayload.append('bdayYear', formData.bdayYear || '');
            registrationPayload.append('gender', formData.gender || '');
            registrationPayload.append('isQcResident', formData.isQcResident ? '1' : '0');
            registrationPayload.append('email', formData.email || '');
            registrationPayload.append('password', formData.password || '');
            registrationPayload.append('password_confirmation', formData.confirmPassword || '');
            registrationPayload.append('role', role);

            if (role === 'Seeker' && formData.qcIdFile) {
                registrationPayload.append('qcIdFile', formData.qcIdFile);
            }

            if (role === 'Employer') {
                if (formData.employerBirFile) registrationPayload.append('employerBirFile', formData.employerBirFile);
                if (formData.employerSecFile) registrationPayload.append('employerSecFile', formData.employerSecFile);
                if (formData.employerBusinessPermitFile) registrationPayload.append('employerBusinessPermitFile', formData.employerBusinessPermitFile);
            }

            const regResponse = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 
                    'Accept': 'application/json'
                },
                body: registrationPayload
            });
            
            const regData = await regResponse.json();
            
            if (regData.status === 'success') {
// Trigger the OTP screen
                setIsOtpStep(true); 
                const successMessage = regData.dev_otp
                    ? `${regData.message}\n\nDEV OTP: ${regData.dev_otp}`
                    : (regData.message || `We sent a verification code to ${formData.email}.`);
                setModal({ type: 'success', title: 'Code Sent!', message: successMessage });
            } else {
                setModal({ type: 'error', title: 'Registration Error', message: regData.message || "Email might already be taken." });
            }
        } catch (err) {
            const serverMessage = err?.message || "Check your internet or server status.";
            setModal({ type: 'error', title: 'Connection Error', message: serverMessage });
        } finally {
            setIsLoading(false);
        }
    } else {
// --- LOGIN FLOW ---
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/login`, {
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
        <main
            className="relative min-h-screen flex flex-col font-sans bg-cover bg-center"
            style={{ backgroundImage: `url(${loginBackground})` }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
            {/* Spacer to push form to center */}
            <div className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
      <SmartModal type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal({ type: null })} />
        
            <section className="relative w-full max-w-md md:max-w-lg bg-white/95 p-6 md:p-8 rounded-2xl shadow-2xl border border-white/70 animate-in fade-in zoom-in duration-300">
        
                <header className="text-center mb-6">
                        <img src={logoPESO} alt="PESO QC Logo" className="h-20 md:h-24 w-auto mx-auto mb-4 object-contain" />
                        <h1 className="text-3xl font-bold text-qc-blue tracking-tight">
                                CityJobLink
                        </h1>
                    <h2 className="text-base font-semibold text-slate-700 mt-1">
                {isOtpStep ? 'Security Check' : (isForgotPasswordMode ? 'Reset Password' : 'Welcome, QCitizens!')}
                    </h2>
            <p className="text-gray-500 text-sm mt-1">
                {isOtpStep ? 'Verify your identity to proceed.' : (isForgotPasswordMode ? 'Request and verify your password reset code.' : (mode === 'login' ? 'Access your Employment Portal' : "Join the local workforce today."))}
            </p>
                </header>
        
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
                        className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-qc-blue text-center text-2xl tracking-[0.5em] font-black" 
                        placeholder="000000" 
                        value={otpCode} 
                        onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} 
                    />
                </div>
                <button type="submit" disabled={isLoading} className={`w-full text-black font-bold py-3 rounded-xl transition-all text-lg shadow-lg flex items-center justify-center gap-2 ${isLoading ? 'bg-gray-300' : 'bg-[#FFD700] hover:bg-yellow-400 active:scale-95'}`}>
                    {isLoading && <Loader2 className="animate-spin" size={20}/>}
                    Verify Account
                </button>
                <button type="button" onClick={() => setIsOtpStep(false)} className="w-full text-gray-500 text-sm hover:text-qc-blue transition-colors">Wrong email? Change it here.</button>
            </form>
        ) : (
            <>
                {isForgotPasswordMode ? (
                    <form onSubmit={forgotCodeSent ? handleForgotPasswordReset : handleForgotPasswordRequest} className="space-y-4">
                        <input
                            required
                            type="email"
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-qc-blue"
                            placeholder="Email (juan@gmail.com)"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />

                        {forgotCodeSent && (
                            <>
                                <input
                                    required
                                    type="text"
                                    maxLength="6"
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-qc-blue"
                                    placeholder="6-digit reset code"
                                    value={formData.resetOtp}
                                    onChange={e => setFormData({...formData, resetOtp: e.target.value.replace(/[^0-9]/g, '')})}
                                />
                                <div className="relative">
                                    <input
                                        required
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-full p-3 pr-11 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-qc-blue"
                                        placeholder="New Password (Min. 8 Chars)"
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-3 flex items-center"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={18} className="text-gray-500" /> : <Eye size={18} className="text-gray-500" />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        required
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className="w-full p-3 pr-11 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-qc-blue"
                                        placeholder="Confirm New Password"
                                        value={formData.confirmPassword}
                                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-3 flex items-center"
                                        aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} className="text-gray-500" /> : <Eye size={18} className="text-gray-500" />}
                                    </button>
                                </div>
                            </>
                        )}

                        <button type="submit" disabled={isLoading} className={`w-full text-black font-bold py-3 rounded-xl transition-all mt-4 text-lg shadow-lg flex items-center justify-center gap-2 ${isLoading ? 'bg-gray-300' : 'bg-[#FFD700] hover:bg-yellow-400 active:scale-95'}`}>
                            {isLoading && <Loader2 className="animate-spin" size={20}/>}
                            {forgotCodeSent ? 'Reset Password' : 'Send Reset Code'}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsForgotPasswordMode(false);
                                setForgotCodeSent(false);
                                setFormData({...formData, password: '', confirmPassword: '', resetOtp: ''});
                                setModal({ type: null });
                            }}
                            className="w-full text-gray-500 hover:text-qc-blue text-sm font-semibold transition-colors"
                        >
                            Back to Login
                        </button>
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
                                        <input required className="flex-1 p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-qc-blue" placeholder="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: sanitizeNameInput(e.target.value, 50)})} />
                                        <input className="w-1/3 p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-qc-blue" placeholder="M.I." maxLength={50} value={formData.middleName} onChange={e => setFormData({...formData, middleName: sanitizeNameInput(e.target.value, 50)})} />
                                    </div>
                                    <div className="flex gap-2">
                                        <input required className="flex-1 p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-qc-blue" placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: sanitizeNameInput(e.target.value, 50)})} />
                                        <input className="w-1/4 p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 text-sm" placeholder="Suffix" maxLength={20} value={formData.suffix} onChange={e => setFormData({...formData, suffix: sanitizeNameInput(e.target.value, 20)})} />
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                                    <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Are you a QC Resident?</span>
                                    <div className="flex gap-1 bg-gray-200 p-1 rounded-lg">
                                        {/* FIXED: Clear qcId when toggling YES/NO so invalid data doesn't carry over */}
                                        <button type="button" onClick={() => setFormData({...formData, isQcResident: true, qcId: ''})} className={`px-4 py-1 rounded-md text-[10px] font-black transition-all ${formData.isQcResident ? 'bg-blue-600 text-white shadow' : 'text-gray-500'}`}>YES</button>
                                        <button type="button" onClick={() => setFormData({...formData, isQcResident: false, qcId: ''})} className={`px-4 py-1 rounded-md text-[10px] font-black transition-all ${!formData.isQcResident ? 'bg-gray-600 text-white shadow' : 'text-gray-500'}`}>NO</button>
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
                                
                                <div className={`${formData.isQcResident ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} p-4 rounded-xl border-2 border-dashed mt-2`}>
                                    <label className={`text-[10px] font-black uppercase mb-2 flex items-center gap-1 ${formData.isQcResident ? 'text-blue-700' : 'text-orange-700'}`}>
                                        <CreditCard size={14}/> {formData.isQcResident ? 'Priority QC Verification' : 'Standard ID Verification'}
                                    </label>
                                    <input required className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm mb-2" placeholder={formData.isQcResident ? "QC ID Number (e.g., 123-000-12345678-14)" : "Valid ID Number"} value={formData.qcId} onChange={handleQcIdInputChange} maxLength={20} />
                                    {formData.isQcResident && (
                                        <p className="text-[11px] mb-2 font-semibold text-blue-700">
                                            Enter 14 to 16 digits. It will auto-format as 123-000-12345678-14.
                                        </p>
                                    )}
                                    <input type="file" ref={qcIdInputRef} onChange={handleQcIdChange} className="hidden" accept="image/*,application/pdf" />
                                    <div onClick={() => qcIdInputRef.current.click()} className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[10px] cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-500 font-bold">
                                        {formData.qcIdFile ? <><FileCheck className="text-green-600" size={14}/> {formData.qcIdFile.name}</> : <><UploadCloud size={14}/> Upload ID Document</>}
                                    </div>
                                </div>
                            </>
                        )}

                        {mode === 'register' && role === 'Employer' && (
                            <div className="space-y-3">
                                <input required className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" placeholder="Company Name" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                                <select className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 text-sm" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}>
                                    <option value="">Select Industry</option>
                                    <option>Agriculture, Forestry And Fishing (A)</option>
                                    <option>Mining And Quarrying (B)</option>
                                    <option>Manufacturing (C)</option>
                                    <option>Electricity, Gas, Steam And Air Conditioning Supply (D)</option>
                                    <option>Water Supply; Sewerage, Waste Management And Remediation Activities (E)</option>
                                    <option>Construction (F)</option>
                                    <option>Wholesale and Retail Trade; Repair of Motor Vehicles and Motorcycles (G)</option>
                                    <option>Transportation and Storage (H)</option>
                                    <option>Accommodation and Food Service Activities (I)</option>
                                    <option>Information and Communication (J)</option>
                                    <option>Financial and Insurance Activities (K)</option>
                                    <option>Real Estate Activities (L)</option>
                                    <option>Professional, Scientific and Technical Activities (M)</option>
                                    <option>Administrative and Support Service Activities (N)</option>
                                    <option>Public Administration and Defense; Compulsory Social Security (O)</option>
                                    <option>Education (P)</option>
                                    <option>Human Health and Social Work Activities (Q)</option>
                                    <option>Arts, Entertainment and Recreation (R)</option>
                                    <option>Other Service Activities (S)</option>
                                    <option>Activities of Households as Employers; Undifferentiated Goods-and Services-Producing Activities of Households for Own Use (T)</option>
                                    <option>Activities of Extra-Territorial Organizations and Bodies (U)</option>
                                </select>
                                <input required className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" placeholder="Business Address" value={formData.companyAddress} onChange={e => setFormData({...formData, companyAddress: e.target.value})} />
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                    For outside employers not yet registered in the QC database, you can complete registration now and submit all required documents below to stay in Pending status until verification.
                                </p>
                            </div>
                        )}
                        
                        <input required type="email" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-qc-blue" placeholder="Email (juan@gmail.com)" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        <div className="relative">
                            <input required type={showPassword ? 'text' : 'password'} className="w-full p-3 pr-11 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-qc-blue" placeholder="Password (Min. 8 Chars)" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={18} className="text-gray-500" /> : <Eye size={18} className="text-gray-500" />}
                            </button>
                        </div>
                        {mode === 'register' && (
                            <div className="relative">
                                <input required type={showConfirmPassword ? 'text' : 'password'} className="w-full p-3 pr-11 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-qc-blue" placeholder="Confirm Password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center"
                                    aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} className="text-gray-500" /> : <Eye size={18} className="text-gray-500" />}
                                </button>
                            </div>
                        )}

                        {mode === 'register' && role === 'Employer' && (
                            <div className="mt-2 border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-wide text-amber-700">Requirements Upload (Bottom Section)</p>
                                        <p className="text-xs text-amber-800 mt-1">Upload BIR, SEC, and Business Permit files after basic information. Missing files keep the account in Pending status so you can update later.</p>
                                    </div>
                                    <span className="text-[11px] font-black text-amber-700 bg-white border border-amber-200 rounded-full px-2 py-1">
                                        {uploadedEmployerRequirementCount}/3 Uploaded
                                    </span>
                                </div>

                                {employerRequirements.map((doc) => (
                                    <div key={doc.key} className="bg-white border border-amber-200 rounded-lg p-3 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-800">{doc.label}</p>
                                            <p className="text-xs text-gray-500 truncate">{formData[doc.key]?.name || 'No file selected'}</p>
                                        </div>
                                        <>
                                            <input
                                                type="file"
                                                ref={doc.inputRef}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] || null;
                                                    setFormData((prev) => ({ ...prev, [doc.key]: file }));
                                                }}
                                                className="hidden"
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => doc.inputRef.current?.click()}
                                                className="shrink-0 text-xs font-black uppercase tracking-wide bg-amber-600 text-white px-3 py-2 rounded-lg hover:bg-amber-700"
                                            >
                                                {formData[doc.key] ? 'Replace' : 'Upload'}
                                            </button>
                                        </>
                                    </div>
                                ))}
                            </div>
                        )}

                        {mode === 'login' && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsForgotPasswordMode(true);
                                        setForgotCodeSent(false);
                                        setFormData({...formData, password: '', confirmPassword: '', resetOtp: ''});
                                        setModal({ type: null });
                                    }}
                                    className="text-sm font-semibold text-qc-blue hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} className={`w-full text-black font-bold py-3 rounded-xl transition-all mt-4 text-lg shadow-lg flex items-center justify-center gap-2 ${isLoading ? 'bg-gray-300' : 'bg-[#FFD700] hover:bg-yellow-400 active:scale-95'}`}>
                            {isLoading && <Loader2 className="animate-spin" size={20}/>}
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                        </form>
                    </>
                )}
                
                <div className="mt-6 text-center border-t pt-6">
                    <button type="button" onClick={() => {
                        setMode(mode === 'login' ? 'register' : 'login');
                        setIsForgotPasswordMode(false);
                        setForgotCodeSent(false);
                        setFormData({...formData, password: '', confirmPassword: '', resetOtp: ''});
                        setModal({type: null});
                    }} className="text-qc-blue font-bold hover:underline text-sm transition-all">
                        {mode === 'login' ? "New here? Register now." : "Already have an account? Login here."}
                    </button>
                </div>
            </>
        )}
      </section>
            </div>{/* end flex-1 center */}

    </main>
  );
};

export default Login;
