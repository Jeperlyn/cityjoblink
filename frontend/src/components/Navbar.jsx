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
    // Updated to a professional blue theme with clean border indicators
    return isActive 
      ? "text-white font-semibold border-b-2 border-blue-500 pb-1" 
      : "text-gray-400 hover:text-white transition-colors pb-1 border-b-2 border-transparent hover:border-gray-600";
  };

  return (
    <header className="bg-gray-900 text-white py-3 px-6 flex justify-between items-center sticky top-0 z-50 shadow-md border-b border-gray-800">
      
      {/* ========================================== */}
      {/* LEFT SIDE: Logo + Navigation Links         */}
      {/* ========================================== */}
      <div className="flex items-center gap-6 md:gap-10 overflow-x-auto no-scrollbar">
        
        {/* Logo */}
        <div 
          className="font-bold text-xl tracking-tight cursor-pointer flex items-center gap-2.5 shrink-0" 
          onClick={() => user?.role === 'Seeker' || !user ? onNavigate('home') : handleDashboardClick()}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="hidden md:inline text-white">CityJobLink</span>
          <span className="md:hidden text-white">CJL</span>
        </div>
        
        {/* Navigation Links (Moved to the left) */}
        <nav className="flex items-center gap-5 text-sm shrink-0">
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
            className="text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold transition-all shadow-sm"
          >
            Login / Sign Up
          </button>
        ) : (
          <div className="flex items-center gap-5">
            
            {/* Notification & Messages */}
            <div className="flex items-center gap-4">
              <button onClick={() => onNavigate('notifications')} className={`relative hover:text-white transition-colors ${currentView === 'notifications' ? 'text-blue-400' : 'text-gray-400'}`}>
                <Bell size={20} />
                {unreadNotifs > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-gray-900">{unreadNotifs}</span>}
              </button>

              <button onClick={() => onNavigate('messages')} className={`relative hover:text-white transition-colors ${currentView === 'messages' ? 'text-blue-400' : 'text-gray-400'}`}>
                <Mail size={20} />
                {unreadMsgs > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-gray-900">{unreadMsgs}</span>}
              </button>
            </div>

            {/* Profile Info (Hidden on very small screens to save space) */}
            <div className="hidden md:flex items-center gap-3 pl-5 border-l border-gray-700">
              <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Hello,</span>
                <span className="text-sm font-semibold text-white">{user.name}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-blue-400 font-bold">
                {user.name.charAt(0)}
              </div>
              <button onClick={onLogout} title="Logout" className="text-gray-400 hover:text-red-400 ml-2 transition-colors">
                <LogOut size={18} />
              </button>
            </div>

            {/* Mobile Logout (Visible only on small screens) */}
            <button onClick={onLogout} title="Logout" className="md:hidden text-gray-400 hover:text-red-400 transition-colors">
              <LogOut size={18} />
            </button>

          </div>
        )}
      </div>

    </header>
  );
};

export default Navbar;

