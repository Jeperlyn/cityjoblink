// src/pages/LandingPage.jsx
import React from 'react';
import { CheckCircle, Star, School, MapPin, Calendar, Clock, Users, Briefcase, ArrowRight, AlignLeft } from 'lucide-react'; 

export const PublicListings = ({ type, data, onRegister, user }) => (
  <div className="max-w-7xl mx-auto p-6 min-h-screen bg-gray-50">
    <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
            {type === 'trainings' ? 'Skill Up with Free Trainings' : 'Upcoming Job Fairs'}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
            {type === 'trainings' 
                ? 'Enhance your skills with free courses provided by TESDA and the Quezon City Government.' 
                : 'Connect with top employers directly. Bring your resume and get hired on the spot!'}
        </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {data.map(item => {
          const isRegistered = user && (type === 'trainings' ? item.registeredUsers.includes(user.id) : item.participants.includes(user.id));
          
          return (
          <div key={item.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 flex flex-col h-full">
              
              {/* IMAGE HEADER (Only for Job Fairs) */}
              {type === 'jobfairs' && (
                  <div className="h-48 w-full bg-gray-200 relative group">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-black shadow-sm flex items-center gap-1">
                          <Users size={12}/> {item.participants.length} Going
                      </div>
                  </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                  {/* TAGS */}
                  <div className="flex gap-2 mb-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${type === 'trainings' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {type === 'trainings' ? item.type : 'Mega Event'}
                      </span>
                      {item.organizer && <span className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide bg-gray-100 text-gray-600">{item.organizer}</span>}
                  </div>

                  <h3 className="font-bold text-xl mb-3 text-gray-900 leading-tight">{item.title}</h3>
                  
                  {/* 👇 UPDATED: DETAILS SECTION (Location, Date, Time) */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-cyan-600 mt-0.5 shrink-0"/> 
                          <span className="font-medium">{item.location || item.provider}</span>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-cyan-600 shrink-0"/> 
                              <span>{item.date}</span>
                          </div>
                          {/* 👇 ADDED TIME HERE */}
                          {item.time && (
                              <div className="flex items-center gap-2">
                                  <Clock size={16} className="text-cyan-600 shrink-0"/> 
                                  <span>{item.time}</span>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* 👇 UPDATED: DESCRIPTION SECTION */}
                  <div className="mb-6">
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                          {item.description}
                      </p>
                  </div>

                  {/* HIGHLIGHTS (For Job Fairs) */}
                  {type === 'jobfairs' && item.highlights && (
                      <div className="mb-6">
                          <p className="text-xs font-bold text-gray-400 mb-2 uppercase flex items-center gap-1"><Star size={12}/> Event Highlights</p>
                          <div className="flex flex-wrap gap-2">
                              {item.highlights.map(h => (
                                  <span key={h} className="text-[10px] bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                      <CheckCircle size={10}/> {h}
                                  </span>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className="mt-auto">
                    {user ? (
                        isRegistered ? 
                        <button disabled className="w-full bg-green-100 text-green-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-default border border-green-200">
                            <CheckCircle size={18}/> You're Going!
                        </button> : 
                        <button onClick={() => onRegister(item.id, type)} className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-gray-200">
                            {type === 'trainings' ? 'Reserve a Slot' : 'Register for Free'} <ArrowRight size={16}/>
                        </button>
                    ) : (
                        <div className="text-center text-sm text-gray-500 italic bg-gray-50 py-3 rounded-xl border border-dashed border-gray-300">
                            Log in to participate
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

const LandingPage = ({ onNavigate }) => (
  <div className="bg-white min-h-screen">
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-24 px-6 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute right-[-10%] top-[-10%] w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
          <div className="absolute left-[-10%] bottom-[-10%] w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">Trabaho para sa <span className="text-cyan-400">QCitizens</span></h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Ang CityJobLink ay ang opisyal na job matching portal ng Quezon City. 
              Isang click lang, konektado ka na sa libu-libong trabaho.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => onNavigate('login')} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2">
                <Briefcase size={20}/> Maghanap ng Trabaho
            </button>
            <button onClick={() => onNavigate('login')} className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white hover:text-black text-white font-bold py-4 px-10 rounded-full text-lg transition-all">
                Mag-post ng Trabaho
            </button>
          </div>
      </div>
    </div>

    <div className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Bakit CityJobLink?</h2>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg">Kami ay katuwang ng Quezon City PESO (Public Employment Service Office) upang magbigay ng libre, ligtas, at mabilis na serbisyo.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-12">
        {[{ icon: CheckCircle, title: "Verified Employers", desc: "Lahat ng kumpanya ay dumaan sa masusing verification ng PESO QC." }, 
          { icon: Star, title: "Smart Matching", desc: "Hindi mo na kailangang maghanap. Ang system na ang maghahanap ng trabahong bagay sa skills mo." }, 
          { icon: School, title: "Free Trainings", desc: "Mag-upskill gamit ang libreng trainings mula sa TESDA at QC LGU para mas mabilis matanggap." }
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl text-center hover:shadow-xl border border-gray-100 transition-all hover:-translate-y-1 group">
            <div className="w-20 h-20 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                <item.icon size={40} />
            </div>
            <h3 className="font-bold text-2xl mb-4 text-gray-900">{item.title}</h3>
            <p className="text-gray-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>

    <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="font-bold text-white text-lg mb-2">CityJobLink</p>
            <p>&copy; 2025 Quezon City Government. All rights reserved.</p>
        </div>
    </footer>
  </div>
);

export default LandingPage;