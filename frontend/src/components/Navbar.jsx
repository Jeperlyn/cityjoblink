// src/components/Navbar.jsx
import React from 'react';
import { Mail, LogOut, Bell, ChevronDown } from 'lucide-react';
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
      : "nav-link-fixed text-slate-500 hover:text-qc-blue";
  };

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <header className="bg-white/95 backdrop-blur-md text-slate-900 h-[60px] px-5 md:px-8 flex justify-between items-center sticky top-0 z-50 border-b border-slate-100 shadow-[0_1px_12px_rgba(0,0,0,0.06)]">

      {/* LEFT: Logo + Nav */}
      <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">

        {/* Logo */}
        <button
          onClick={() => user?.role === 'Seeker' || !user ? onNavigate('home') : handleDashboardClick()}
          className="flex items-center gap-2.5 shrink-0 focus:outline-none"
        >
          <img src={logoPESO} alt="QC PESO Logo" className="h-8 w-auto object-contain" />
          <span className="hidden md:inline font-extrabold text-lg text-qc-blue tracking-tight">
            CityJobLink
          </span>
        </button>

        {/* Nav Links */}
        <nav className="flex items-center gap-1 text-sm shrink-0">
          {(!user || user.role === 'Seeker') && (
            <button onClick={() => onNavigate('home')} className={getLinkClass('home')}>Home</button>
          )}
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

      {/* RIGHT: Actions + Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {!user ? (
          <button
            onClick={() => onNavigate('login')}
            className="btn-gold text-sm px-5 py-2 rounded-lg"
          >
            Login / Sign Up
          </button>
        ) : (
          <div className="flex items-center gap-3">

            {/* Icon actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onNavigate('notifications')}
                className={`relative p-2 rounded-lg transition-colors ${currentView === 'notifications' ? 'bg-qc-blue/10 text-qc-blue' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
                title="Notifications"
              >
                <Bell size={19} />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-white leading-none">
                    {unreadNotifs > 9 ? '9+' : unreadNotifs}
                  </span>
                )}
              </button>

              <button
                onClick={() => onNavigate('messages')}
                className={`relative p-2 rounded-lg transition-colors ${currentView === 'messages' ? 'bg-qc-blue/10 text-qc-blue' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
                title="Messages"
              >
                <Mail size={19} />
                {unreadMsgs > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-white leading-none">
                    {unreadMsgs > 9 ? '9+' : unreadMsgs}
                  </span>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-6 bg-slate-200" />

            {/* Profile */}
            <div className="hidden md:flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black shadow-sm select-none shrink-0"
                style={{ background: 'linear-gradient(135deg, #0038A8 0%, #0052f5 100%)' }}
              >
                {initials}
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Hello,</span>
                <span className="text-sm font-semibold text-slate-800 max-w-[120px] truncate">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-1"
              >
                <LogOut size={16} />
              </button>
            </div>

            {/* Mobile logout */}
            <button
              onClick={onLogout}
              title="Logout"
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={17} />
            </button>

          </div>
        )}
      </div>

    </header>
  );
};

export default Navbar;
