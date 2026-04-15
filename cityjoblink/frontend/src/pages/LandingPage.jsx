import React from 'react';
import InstitutionalFooter from '../components/InstitutionalFooter';
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

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
};
import HeroBanner from '../components/ui/HeroBanner';
import BaseCard from '../components/ui/BaseCard';
import EmptyState from '../components/ui/EmptyState';

/* =======================
   PUBLIC LISTINGS
======================= */
export const PublicListings = ({ type, data, onRegister, user }) => (
  <div className="min-h-screen bg-slate-100 px-4 md:px-6 py-8">
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
          icon={type === 'trainings' ? <School size={20} className="text-white/70" /> : <Briefcase size={20} className="text-white/70" />}
        />
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={type === 'trainings' ? <School size={28} /> : <Briefcase size={28} />}
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
                className="col-span-12 md:col-span-6 lg:col-span-4"
                imageSrc={
                  type === 'jobfairs'
                    ? item.image
                      ? item.image.startsWith('http')
                        ? item.image
                        : `http://localhost:8000${item.image}`
                      : null
                    : undefined
                }
                imageAlt={item.title}
                imageOverlay={type === 'jobfairs' ? (
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5">
                    <Briefcase size={11} />
                    {item.companies?.length || 0} Companies
                  </div>
                ) : null}
              >
                {/* TAGS */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide ${type === 'trainings'
                      ? 'bg-qc-blue/10 text-qc-blue'
                      : 'bg-amber-100 text-amber-700'
                      }`}
                  >
                    {type === 'trainings' ? item.type : 'Mega Job Fair'}
                  </span>
                  {item.organizer && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide bg-slate-100 text-slate-500">
                      {item.organizer}
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-lg mb-3 text-slate-900 leading-snug">
                  {item.title}
                </h3>

                {/* DETAILS */}
                <div className="space-y-1.5 text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-qc-blue mt-0.5 shrink-0" />
                    <span className="font-medium leading-snug">{item.location || item.provider}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-qc-blue" />
                      <span>{formatDate(item.date)}</span>
                    </div>
                    {item.time && (
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-qc-blue" />
                        <span>{item.time}</span>
                      </div>
                    )}
                  </div>
                  {type === 'trainings' && item.slots != null && (
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-qc-blue" />
                      <span className="font-semibold">{item.slots} slots available</span>
                    </div>
                  )}
                </div>

                {/* DESCRIPTION */}
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                  {item.description}
                </p>

                {/* EVENT HIGHLIGHTS */}
                {type === 'jobfairs' && item.highlights && Array.isArray(item.highlights) && item.highlights.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-1">
                      <Star size={10} /> Highlights
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.highlights.map((highlight, index) => (
                        <span
                          key={index}
                          className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-full font-semibold flex items-center gap-1"
                        >
                          <CheckCircle size={9} /> {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ATTEND / REGISTER BUTTON */}
                {type === 'jobfairs' && (
                  <div className="mt-auto pt-1">
                    {isRegistered ? (
                      <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 font-bold py-2.5 px-4 rounded-xl border border-emerald-200 text-sm">
                        <CheckCircle size={15} /> Registered
                      </div>
                    ) : (
                      <button
                        onClick={() => onRegister && onRegister(item.id)}
                        className="w-full bg-qc-gold text-black font-bold py-2.5 px-4 rounded-xl hover:brightness-95 active:scale-[0.98] transition-all text-sm shadow-sm"
                      >
                        Attend This Job Fair
                      </button>
                    )}
                  </div>
                )}

                {type === 'trainings' && (
                  <div className="mt-auto pt-1">
                    {isRegistered ? (
                      <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 font-bold py-2.5 px-4 rounded-xl border border-emerald-200 text-sm">
                        <CheckCircle size={15} /> Enrolled
                      </div>
                    ) : item.slots === 0 ? (
                      <div className="w-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold py-2.5 px-4 rounded-xl border border-gray-200 text-sm cursor-not-allowed">
                        No Slots Available
                      </div>
                    ) : (
                      <button
                        onClick={() => onRegister && onRegister(item.id)}
                        className="w-full bg-qc-blue text-white font-bold py-2.5 px-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all text-sm shadow-sm"
                      >
                        Register for Free
                      </button>
                    )}
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
    <>
    <div className="bg-slate-100 min-h-screen text-slate-800">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <img
          src={loginBg}
          alt="Quezon City landscape"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Gradient: strong qc-blue left-side, fades out so the photo is visible on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-qc-blue/85 via-qc-blue/50 to-qc-blue/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        <div className="relative layout-container py-20 md:py-32 min-h-[420px] flex items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 backdrop-blur-sm px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white mb-5">
              Official QC PESO Portal
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-5 drop-shadow-lg">
              Empowering{' '}
              <span className="text-qc-gold">Quezon City&apos;s</span>{' '}
              Workforce
            </h1>
            <p className="text-base md:text-lg leading-relaxed max-w-xl text-white/90 drop-shadow-sm">
              CityJobLink is the official QC PESO digital bridge connecting residents with
              verified employment opportunities, practical training programs, and trusted
              career support services across Quezon City.
            </p>
          </div>
        </div>
      </section>

      {/* ── Info Cards ─────────────────────────────────────── */}
      <section className="layout-container py-10 md:py-14">
        <div className="grid md:grid-cols-2 gap-6">

          <article className="gov-card overflow-hidden">
            {/* Gold top accent bar */}
            <div className="h-1 bg-qc-gold w-full" />
            <div className="p-7 md:p-8">
              <p className="section-label mb-3">About</p>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-5 leading-tight">
                PESO & CityJobLink
              </h2>
              <div className="space-y-5 text-slate-600 text-sm leading-relaxed">
                <div>
                  <h4 className="font-bold text-qc-blue mb-1.5">Empowering Quezon City's Workforce</h4>
                  <p>
                    The Public Employment Service Office (PESO) of Quezon City is the city's
                    primary department dedicated to providing a full employment cycle and lifelong
                    learning for all QCitizens. CityJobLink is the official employment and labor
                    market portal of the Quezon City Government.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-qc-blue mb-1.5">Who We Are</h4>
                  <p>
                    CityJobLink is the digital arm of QC PESO, serving as the central hub that
                    bridges job seekers, employers, and local policymakers. We are more than just
                    a job board — we are a comprehensive ecosystem designed to drive Quezon City's
                    socio-economic growth and foster an inclusive, productive local workforce.
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className="gov-card overflow-hidden">
            <div className="h-1 bg-qc-blue w-full" />
            <div className="p-7 md:p-8">
              <p className="section-label mb-3">Services</p>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-5 leading-tight">
                Our Integrated Services
              </h2>
              <div className="space-y-5">
                {[
                  {
                    label: 'Job Matching',
                    desc: 'Connect with verified employers and discover AI-matched career opportunities tailored to your skills within the QC labor market.',
                  },
                  {
                    label: 'Skills Training',
                    desc: 'Register for free workforce readiness and competency programs designed to boost your employability and professional growth.',
                  },
                  {
                    label: 'Job Fairs',
                    desc: 'Stay updated on upcoming local recruitment events and meet employers in person — fostering direct connections within the QC community.',
                  },
                ].map((svc) => (
                  <div key={svc.label} className="flex gap-3">
                    <div className="mt-0.5 w-2 h-2 rounded-full bg-qc-gold shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">{svc.label}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{svc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

        </div>
      </section>
    </div>
    <InstitutionalFooter />
    </>
  );
};

export default LandingPage;