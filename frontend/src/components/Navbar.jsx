// src/components/Navbar.jsx
import React from 'react';
import { Building2, Mail, LogOut } from 'lucide-react';

const Navbar = ({ user, onLogout, onNavigate, messages, currentView }) => {
  const unreadMsgs = messages ? messages.filter(m => m.toId === user?.id && !m.read).length : 0;

  const handleDashboardClick = () => {
    if (user.role === 'Seeker') onNavigate('seeker-dash');
    else if (user.role === 'Employer') onNavigate('employer-dash');
    else if (user.role === 'Admin') onNavigate('admin-dash');
  };

  const getLinkClass = (viewName) => {
    const isActive = currentView === viewName || (viewName === 'dashboard' && (currentView === 'seeker-dash' || currentView === 'employer-dash' || currentView === 'admin-dash'));
    return isActive ? "text-cyan-400 font-bold border-b-2 border-cyan-400 pb-1" : "hover:text-cyan-400 transition-colors pb-1 border-b-2 border-transparent";
  };

  return (
    <header className="bg-black text-white py-4 px-6 flex justify-between items-center sticky top-0 z-50 shadow-md">
      <div className="font-bold text-xl md:text-2xl tracking-tight cursor-pointer flex items-center gap-2" onClick={() => user?.role === 'Seeker' || !user ? onNavigate('home') : handleDashboardClick()}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
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
          // BUTTON FIXED: Ensures clicking this navigates to login screen
          <button onClick={() => onNavigate('login')} className="text-white bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-md font-bold transition-colors">Login / Sign Up</button>
        ) : (
          <>
            <button onClick={handleDashboardClick} className={getLinkClass('dashboard')}>Dashboard</button>
            <div className="flex items-center gap-4 pl-4 border-l border-gray-700">
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