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
} from 'lucide-react';
import loginBg from '../assets/img/login.jpg';
import HeroBanner from '../components/ui/HeroBanner';
import BaseCard from '../components/ui/BaseCard';
import EmptyState from '../components/ui/EmptyState';

/* =======================
   PUBLIC LISTINGS
======================= */
export const PublicListings = ({ type, data, onRegister, user }) => (
  <div className="min-h-screen bg-slate-50 px-6 py-8">
    <div className="layout-container">
      <div className="mb-8">
        <HeroBanner
          badge={type === 'trainings' ? 'Free Learning' : 'Hiring Events'}
          title={type === 'trainings' ? 'Skill Up with Free Trainings' : 'Upcoming Job Fairs'}
          subtitle={type === 'trainings'
            ? 'Build your credentials through free learning opportunities and practical workforce programs provided by TESDA and the Quezon City Government.'
            : 'Discover verified hiring events and connect with employers actively recruiting within Quezon City and nearby areas.'}
          imageSrc={loginBg}
          imageAlt="Job fair and trainings background"
          icon={type === 'trainings' ? <School size={22} className="text-blue-100" /> : <Briefcase size={22} className="text-blue-100" />}
        />
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={type === 'trainings' ? <School size={32} /> : <Briefcase size={32} />}
          title={type === 'trainings' ? 'No trainings available' : 'No job fairs available'}
          description={type === 'trainings'
            ? 'Please check back later for newly posted training programs.'
            : 'Please check back later for newly posted hiring events.'}
        />
      ) : (
      <div className="layout-grid-12">
        {data.map(item => {
        const isRegistered =
          user &&
          (type === 'trainings'
            ? item.registeredUsers?.includes(user.id)
            : item.participants?.includes(user.id));

        return (
          <BaseCard
            key={item.id}
            className="col-span-12 md:col-span-6 lg:col-span-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            imageSrc={type === 'jobfairs' ? item.image : undefined}
            imageAlt={item.title}
            imageOverlay={type === 'jobfairs' ? (
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm flex items-center gap-1">
                <Briefcase size={12} />
                {item.companies?.length || 0} Companies Attending
              </div>
            ) : null}
          >
              {/* TAGS */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${
                    type === 'trainings'
                      ? 'bg-qc-blue/10 text-qc-blue'
                      : 'bg-qc-gold/20 text-black'
                  }`}
                >
                  {type === 'trainings' ? item.type : 'Mega Job Fair'}
                </span>
                {item.organizer && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide bg-slate-100 text-slate-600">
                    {item.organizer}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-xl mb-3 text-slate-900 leading-tight">
                {item.title}
              </h3>

              {/* DETAILS */}
              <div className="space-y-2 text-sm text-slate-700 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-qc-blue mt-0.5" />
                  <span className="font-medium">
                    {item.location || item.provider}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-qc-blue" />
                    <span>{item.date}</span>
                  </div>

                  {item.time && (
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-qc-blue" />
                      <span>{item.time}</span>
                    </div>
                  )}
                </div>

                {type === 'trainings' && item.slots != null && (
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-qc-blue" />
                    <span className="font-medium">{item.slots} slots available</span>
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}
              <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-6">
                {item.description}
              </p>

              {/* EVENT HIGHLIGHTS */}
              {type === 'jobfairs' && item.highlights && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-1">
                    <Star size={12} /> Event Highlights
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.highlights.map(h => (
                      <span
                        key={h}
                        className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-full font-medium flex items-center gap-1"
                      >
                        <CheckCircle size={10} /> {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

          </BaseCard>
        );
        })}
      </div>
      )}
    </div>
  </div>
);

/* =======================
   LANDING PAGE
======================= */
const LandingPage = ({ onNavigate }) => {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <section className="relative overflow-hidden">
        <img
          src={loginBg}
          alt="Quezon City landscape"
          className="absolute inset-0 h-full w-full object-cover object-right saturate-150 contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/74 via-white/56 to-white/25" />

        <div className="relative layout-container py-16 md:py-24">
          <div className="max-w-3xl rounded-gov border border-white/70 bg-white/55 p-6 md:p-8 shadow-lg">
            <h1 className="text-4xl md:text-6xl font-bold text-qc-blue mb-4">
              Empowering <span className="text-qc-gold">Quezon City's</span> Workforce
            </h1>
            <p className="text-base md:text-lg leading-relaxed text-slate-800">
              CityJobLink is the official QC PESO digital bridge connecting residents with
              verified employment opportunities, practical training programs, and trusted
              career support services across Quezon City.
            </p>
      
          </div>
        </div>
      </section>

      <section className="layout-container py-8 md:py-10">
        <div className="grid md:grid-cols-2 gap-6">
          <article className="gov-card p-6 md:p-7">
            <h2 className="text-2xl md:text-3xl font-bold text-qc-gold mb-3">
              About PESO and CityJobLink
            </h2>
            <div className="space-y-4 text-slate-800">
        

              <h4 className="text-lg md:text-xl font-bold text-qc-blue">
                Empowering Quezon City's Workforce
              </h4>

              <p className="leading-relaxed text-sm md:text-base text-justify">
                The Public Employment Service Office (PESO) of Quezon City is the city’s
                primary department dedicated to providing a full employment cycle and lifelong
                learning for all QCitizens. To fulfill this mission in the digital age, we
                have established CityJobLink-the official employment and labor market portal
                of the Quezon City Government.
              </p>

              <h4 className="text-lg md:text-xl font-bold text-qc-blue">Who We Are</h4>

              <p className="leading-relaxed text-sm md:text-base text-justify">
                CityJobLink is the digital arm of QC PESO, serving as the central hub that
                bridges the gap between job seekers, employers, and local policymakers. We are
                more than just a job board; we are a comprehensive ecosystem designed to drive
                Quezon City's socio-economic growth.
              </p>

              <p className="leading-relaxed text-sm md:text-base text-justify">
                By fostering industrial peace and promoting synergy between workers and
                management, we ensure that the city’s development is inclusive, stable, and
                forward-moving. Through CityJobLink, QC PESO provides accessible, reliable,
                and verified pathways to work, helping build a productive and resilient local
                workforce.
              </p>
            </div>
          </article>

          <article className="gov-card p-6 md:p-7">
            <h2 className="text-2xl md:text-3xl font-bold text-qc-gold mb-3">
              Our Integrated Services
            </h2>
            <div className="space-y-4 text-slate-800">
        

              <p className="leading-relaxed text-sm md:text-base text-justify">
                Driven by our mission to ensure social protection and economic sustainability,
                CityJobLink delivers these core PESO services directly to your screen:
              </p>

              <div>
                <h4 className="text-lg md:text-xl font-bold text-qc-blue mb-2">Job Matching</h4>
                <p className="leading-relaxed text-sm md:text-base text-justify">
                  Connect with verified employers and discover career opportunities
                  specifically tailored to your skills and profile within the Quezon City
                  labor market.
                </p>
              </div>

              <div>
                <h4 className="text-lg md:text-xl font-bold text-qc-blue mb-2">Skills Training</h4>
                <p className="leading-relaxed text-sm md:text-base text-justify">
                  Access and voluntarily register for workforce readiness and competency
                  enhancement programs designed to boost your employability and professional
                  growth.
                </p>
              </div>

              <div>
                <h4 className="text-lg md:text-xl font-bold text-qc-blue mb-2">Job Fairs</h4>
                <p className="leading-relaxed text-sm md:text-base text-justify">
                  Stay updated on upcoming local recruitment events and sign up to meet
                  potential employers in person, fostering direct synergy within the QC
                  community.
                </p>
              </div>

            </div>
          </article>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;


