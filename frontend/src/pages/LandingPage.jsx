import React from 'react';
import {
  CheckCircle,
  Star,
  School,
  MapPin,
  Calendar,
  Clock,
  Users,
  Briefcase,
  ArrowRight
} from 'lucide-react';

/* =======================
   PUBLIC LISTINGS
======================= */
export const PublicListings = ({ type, data, onRegister, user }) => (
  <div className="max-w-7xl mx-auto p-6 min-h-screen bg-gray-50">
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold mb-4 text-gray-900">
        {type === 'trainings'
          ? 'Skill Up with Free Trainings'
          : 'Upcoming Job Fairs'}
      </h1>
      <p className="text-gray-600 max-w-2xl mx-auto">
        {type === 'trainings'
          ? 'Enhance your skills with free courses provided by TESDA and the Quezon City Government.'
          : 'Join Now'}
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {data.map(item => {
        const isRegistered =
          user &&
          (type === 'trainings'
            ? item.registeredUsers?.includes(user.id)
            : item.participants?.includes(user.id));

        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 flex flex-col h-full"
          >
            {/* IMAGE HEADER (JOB FAIRS ONLY) */}
            {type === 'jobfairs' && (
              <div className="h-48 w-full bg-gray-200 relative group">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* 👇 COMPANIES COUNT */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-black shadow-sm flex items-center gap-1">
                  <Briefcase size={12} />
                  {item.companies?.length || 0} Companies Attending
                </div>
              </div>
            )}

            <div className="p-6 flex-1 flex flex-col">
              {/* TAGS */}
              <div className="flex gap-2 mb-4">
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${
                    type === 'trainings'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {type === 'trainings' ? item.type : 'Mega Job Fair'}
                </span>
                {item.organizer && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide bg-gray-100 text-gray-600">
                    {item.organizer}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-xl mb-3 text-gray-900 leading-tight">
                {item.title}
              </h3>

              {/* DETAILS */}
              <div className="space-y-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-cyan-600 mt-0.5" />
                  <span className="font-medium">
                    {item.location || item.provider}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-cyan-600" />
                    <span>{item.date}</span>
                  </div>

                  {item.time && (
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-cyan-600" />
                      <span>{item.time}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* DESCRIPTION */}
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6">
                {item.description}
              </p>

              {/* EVENT HIGHLIGHTS */}
              {type === 'jobfairs' && item.highlights && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase flex items-center gap-1">
                    <Star size={12} /> Event Highlights
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.highlights.map(h => (
                      <span
                        key={h}
                        className="text-[10px] bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-full font-medium flex items-center gap-1"
                      >
                        <CheckCircle size={10} /> {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTION BUTTON */}
              <div className="mt-auto">
                {user ? (
                  isRegistered ? (
                    <button
                      disabled
                      className="w-full bg-green-100 text-green-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-green-200"
                    >
                      <CheckCircle size={18} /> You're Registered
                    </button>
                  ) : (
                    <button
                      onClick={() => onRegister(item.id, type)}
                      className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 flex items-center justify-center gap-2 transition-colors shadow-lg"
                    >
                      Register for Free <ArrowRight size={16} />
                    </button>
                  )
                ) : (
                  <div className="text-center text-sm text-gray-500 italic bg-gray-50 py-3 rounded-xl border border-dashed border-gray-300">
                    Log in to register
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* =======================
   LANDING PAGE
======================= */
const LandingPage = ({ onNavigate }) => (
  <div className="min-h-screen">
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white py-24 px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-cyan-400 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Trabaho para sa <span className="text-cyan-400">QCitizens</span>
        </h1>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Isang job matching platform na nag-uugnay sa job seekers at verified
          employers ng Quezon City.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => onNavigate('login')}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-10 rounded-full text-lg shadow-2xl shadow-cyan-600/30 transition-all"
          >
            Maghanap ng Trabaho
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="bg-white/10 border border-white/30 hover:bg-white hover:text-black text-white font-bold py-4 px-10 rounded-full text-lg transition-all"
          >
            Mag-post ng Trabaho
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-12">
          <div className="glass-surface rounded-xl px-4 py-3 text-left">
            <p className="text-xs uppercase tracking-wider text-slate-300">Active Listings</p>
            <p className="text-2xl font-black text-white">1000+</p>
          </div>
          <div className="glass-surface rounded-xl px-4 py-3 text-left">
            <p className="text-xs uppercase tracking-wider text-slate-300">Partner Employers</p>
            <p className="text-2xl font-black text-white">250+</p>
          </div>
          <div className="glass-surface rounded-xl px-4 py-3 text-left">
            <p className="text-xs uppercase tracking-wider text-slate-300">Job Seekers Helped</p>
            <p className="text-2xl font-black text-white">10k+</p>
          </div>
        </div>
      </div>
    </div>

    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900">Why CityJobLink Works</h2>
        <p className="text-slate-600 mt-3">Fast, local, and designed for Quezon City workforce needs.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-4">
            <Briefcase size={22} />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Smart Job Matching</h3>
          <p className="text-slate-600 text-sm">Find opportunities aligned to your skills, profile, and goals.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
            <School size={22} />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Training Opportunities</h3>
          <p className="text-slate-600 text-sm">Access free upskilling programs from trusted public partners.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <Users size={22} />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Verified Employers</h3>
          <p className="text-slate-600 text-sm">Apply with confidence through curated and verified company listings.</p>
        </div>
      </div>
    </section>

    <footer className="bg-slate-950 text-slate-400 py-12 text-center border-t border-white/10">
      <p className="font-bold text-white text-lg mb-2">CityJobLink</p>
      <p>&copy; 2025 Quezon City Government. All rights reserved.</p>
    </footer>
  </div>
);

export default LandingPage;
