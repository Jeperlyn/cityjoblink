// src/pages/LandingPage.jsx
import React from 'react';
import { CheckCircle, Star, School, MapPin } from 'lucide-react';

export const PublicListings = ({ type, data, onRegister, user }) => (
  <div className="max-w-6xl mx-auto p-6 min-h-screen">
    <h1 className="text-3xl font-bold mb-6">{type === 'trainings' ? 'Available Trainings' : 'Upcoming Job Fairs'}</h1>
    <div className="grid md:grid-cols-2 gap-6">
      {data.map(item => {
         const isRegistered = user && (type === 'trainings' ? item.registeredUsers.includes(user.id) : item.participants.includes(user.id));
         return (
          <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <span className="bg-cyan-100 text-cyan-800 text-xs px-2 py-1 rounded font-bold mb-2 inline-block">{type === 'trainings' ? item.type : 'Event'}</span>
                 <h3 className="font-bold text-xl">{item.title}</h3>
                 <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">{type === 'trainings' ? <School size={16}/> : <MapPin size={16}/>}{type === 'trainings' ? item.provider : item.location}</p>
               </div>
               {type === 'trainings' && <div className="text-center bg-gray-50 p-2 rounded"><span className="block text-xl font-bold text-cyan-600">{item.slots}</span><span className="text-[10px] text-gray-500 uppercase">Slots</span></div>}
             </div>
             <p className="text-gray-600 text-sm mb-6 line-clamp-2">{item.description}</p>
             {user ? (isRegistered ? <button disabled className="w-full bg-green-100 text-green-700 font-bold py-2 rounded-lg flex items-center justify-center gap-2"><CheckCircle size={16}/> Registered</button> : <button onClick={() => onRegister(item.id, type)} className="w-full bg-black text-white font-bold py-2 rounded-lg hover:bg-gray-800">{type === 'trainings' ? 'Register Now' : 'Join Event'}</button>) : <div className="text-center text-sm text-gray-500 italic bg-gray-50 py-2 rounded">Log in to participate</div>}
          </div>
         );
      })}
    </div>
  </div>
);

const LandingPage = ({ onNavigate }) => (
  <div className="bg-white min-h-screen">
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-24 px-6 text-center">
      <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">Trabaho para sa <span className="text-cyan-400">QCitizens</span></h1>
      <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">Ang CityJobLink ay ang opisyal na job matching portal ng Quezon City. Kumokonekta sa mga job seekers at verified employers.</p>
      <div className="flex justify-center gap-4">
        {/* BUTTONS FIXED: Directing to login screen if no user */}
        <button onClick={() => onNavigate('login')} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg">Maghanap ng Trabaho</button>
        <button onClick={() => onNavigate('login')} className="bg-transparent border-2 border-white hover:bg-white hover:text-black text-white font-bold py-3 px-8 rounded-lg text-lg">Mag-post ng Trabaho</button>
      </div>
    </div>
    <div className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Tungkol sa CityJobLink</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">Kami ay katuwang ng Quezon City PESO (Public Employment Service Office) upang magbigay ng libre, ligtas, at mabilis na serbisyo.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-10">
        {[{ icon: CheckCircle, title: "Verified Employers", desc: "Lahat ng kumpanya ay verified ng PESO." }, { icon: Star, title: "Smart Matching", desc: "Automated matching base sa iyong skills." }, { icon: School, title: "Free Trainings", desc: "Libreng skills training mula sa TESDA at QC LGU." }].map((item, i) => (
          <div key={i} className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6"><item.icon size={32} /></div>
            <h3 className="font-bold text-xl mb-3">{item.title}</h3><p className="text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
    <footer className="bg-gray-900 text-gray-400 py-12 text-center"><p>&copy; 2025 CityJobLink. Quezon City Government.</p></footer>
  </div>
);

export default LandingPage;