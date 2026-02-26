// src/components/Navbar.jsx
import React from 'react';
import { Building2, Mail, LogOut, Bell } from 'lucide-react'; 

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
      ? "text-cyan-300 font-bold bg-white/10 px-3 py-1.5 rounded-lg"
      : "hover:text-cyan-200 hover:bg-white/5 transition-all px-3 py-1.5 rounded-lg";
  };

  return (
    <header className="bg-slate-950/90 text-white py-4 px-6 flex justify-between items-center sticky top-0 z-50 shadow-xl border-b border-white/10 backdrop-blur-md">
      <div className="font-bold text-xl md:text-2xl tracking-tight cursor-pointer flex items-center gap-2" onClick={() => user?.role === 'Seeker' || !user ? onNavigate('home') : handleDashboardClick()}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <Building2 size={18} className="text-white" />
        </div>
        <span className="hidden md:inline">CityJobLink</span>
        <span className="md:hidden">CJL</span>
      </div>
      
      <nav className="flex items-center gap-6 text-sm font-medium">
        {(!user || user.role === 'Seeker') && <button onClick={() => onNavigate('home')} className={getLinkClass('home')}>Home</button>}
        {(!user || user.role === 'Seeker') && (
          <>
            <button onClick={() => onNavigate('matchmaker')} className={getLinkClass('matchmaker')}>Find Jobs</button>
            <button onClick={() => onNavigate('public-trainings')} className={getLinkClass('public-trainings')}>Trainings</button>
            <button onClick={() => onNavigate('public-jobfairs')} className={getLinkClass('public-jobfairs')}>Job Fairs</button>
          </>
        )}
        {!user ? (
          <button onClick={() => onNavigate('login')} className="text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/30">Login / Sign Up</button>
        ) : (
          <>
            <button onClick={handleDashboardClick} className={getLinkClass('dashboard')}>Dashboard</button>
            <div className="flex items-center gap-4 pl-4 border-l border-white/20">
              
              <button onClick={() => onNavigate('notifications')} className={`relative hover:text-white ${currentView === 'notifications' ? 'text-white' : 'text-gray-400'}`}>
                <Bell size={20} />
                {unreadNotifs > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{unreadNotifs}</span>}
              </button>

              <button onClick={() => onNavigate('messages')} className={`relative hover:text-white ${currentView === 'messages' ? 'text-white' : 'text-gray-400'}`}>
                <Mail size={20} />
                {unreadMsgs > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{unreadMsgs}</span>}
              </button>
              <div className="hidden md:flex flex-col items-end leading-tight">
                <span className="text-xs text-gray-400">Hello,</span>
                <span className="text-sm font-bold">{user.name}</span>
              </div>
              <button onClick={onLogout} title="Logout" className="text-gray-400 hover:text-white ml-2"><LogOut size={18} /></button>
            </div>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;