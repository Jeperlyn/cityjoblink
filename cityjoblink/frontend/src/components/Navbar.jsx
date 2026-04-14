// src/components/Navbar.jsx
import React from 'react';
import { Mail, LogOut, Bell } from 'lucide-react';
import logoPESO from '../assets/img/logo-PESO.png';

const Navbar = ({ user, onLogout, onNavigate, messages, unreadNotifs, currentView }) => {
  const unreadMsgs = messages ? messages.filter(m => m.toId === user?.id && !m.read).length : 0;

  const handleDashboardClick = () => {
    if (user.role === 'Seeker') onNavigate('seeker-dash');
    else if (user.role === 'Employer') onNavigate('employer-dash');
    else if (user.role === 'Admin') onNavigate('admin-dash');
  };

  const getLinkClass = (viewName) => {
    const isActive = currentView === viewName || (viewName === 'dashboard' && (currentView === 'seeker-dash' || currentView === 'employer-dash' || currentView === 'admin-dash'));
    return isActive 
      ? "nav-link-fixed is-active"
      : "nav-link-fixed text-slate-700 hover:text-qc-blue";
  };

  return (
    <header className="bg-white text-slate-900 h-16 px-6 flex justify-between items-center sticky top-0 z-50 shadow-sm border-b border-slate-200">
      
      {/* ========================================== */}
      {/* LEFT SIDE: Logo + Navigation Links         */}
      {/* ========================================== */}
      <div className="flex items-center gap-6 md:gap-10 overflow-x-auto no-scrollbar">
        
        {/* Logo */}
        <div 
          className="font-bold text-xl tracking-tight cursor-pointer flex items-center gap-2.5 shrink-0" 
          onClick={() => user?.role === 'Seeker' || !user ? onNavigate('home') : handleDashboardClick()}
        >
          <img src={logoPESO} alt="QC PESO Logo" className="h-9 w-auto object-contain" />
          <span className="hidden md:inline text-qc-blue">CityJobLink</span>
        </div>
        
        {/* Navigation Links (Moved to the left) */}
        <nav className="flex items-center gap-4 text-sm shrink-0">
          {(!user || user.role === 'Seeker') && <button onClick={() => onNavigate('home')} className={getLinkClass('home')}>Home</button>}
          {(!user || user.role === 'Seeker') && (
            <>
              <button onClick={() => onNavigate('matchmaker')} className={getLinkClass('matchmaker')}>Find Jobs</button>
              <button onClick={() => onNavigate('public-trainings')} className={getLinkClass('public-trainings')}>Trainings</button>
              <button onClick={() => onNavigate('public-jobfairs')} className={getLinkClass('public-jobfairs')}>Job Fairs</button>
            </>
          )}
          {user && (
             <button onClick={handleDashboardClick} className={getLinkClass('dashboard')}>Dashboard</button>
          )}
        </nav>

      </div>
      
      {/* ========================================== */}
      {/* RIGHT SIDE: User Actions & Profile         */}
      {/* ========================================== */}
      <div className="flex items-center gap-4 text-sm shrink-0 pl-4">
        {!user ? (
          <button 
            onClick={() => onNavigate('login')} 
            className="text-black bg-qc-gold hover:brightness-95 px-5 py-2 rounded-lg font-semibold transition-all shadow-sm"
          >
            Login / Sign Up
          </button>
        ) : (
          <div className="flex items-center gap-5">
            
            {/* Notification & Messages */}
            <div className="flex items-center gap-4">
              <button onClick={() => onNavigate('notifications')} className={`relative hover:text-qc-blue transition-colors ${currentView === 'notifications' ? 'text-qc-blue' : 'text-slate-500'}`}>
                <Bell size={20} />
                {unreadNotifs > 0 && <span className="absolute -top-1.5 -right-1.5 bg-qc-blue text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{unreadNotifs}</span>}
              </button>

              <button onClick={() => onNavigate('messages')} className={`relative hover:text-qc-blue transition-colors ${currentView === 'messages' ? 'text-qc-blue' : 'text-slate-500'}`}>
                <Mail size={20} />
                {unreadMsgs > 0 && <span className="absolute -top-1.5 -right-1.5 bg-qc-blue text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{unreadMsgs}</span>}
              </button>
            </div>

            {/* Profile Info (Hidden on very small screens to save space) */}
            <div className="hidden md:flex items-center gap-3 pl-5 border-l border-slate-200">
              <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">Hello,</span>
                <span className="text-sm font-semibold text-slate-800">{user.name}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-qc-blue font-bold">
                {user.name.charAt(0)}
              </div>
              <button onClick={onLogout} title="Logout" className="text-slate-500 hover:text-qc-blue ml-2 transition-colors">
                <LogOut size={18} />
              </button>
            </div>

            {/* Mobile Logout (Visible only on small screens) */}
            <button onClick={onLogout} title="Logout" className="md:hidden text-slate-500 hover:text-qc-blue transition-colors">
              <LogOut size={18} />
            </button>

          </div>
        )}
      </div>

    </header>
  );
};

export default Navbar;

