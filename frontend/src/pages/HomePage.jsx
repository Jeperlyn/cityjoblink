// Directory: C:\cityjoblink\frontend\src\pages\HomePage.jsx
import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../components/Header'; 

//
// --- 1. HERO SECTION ---
//
const HeroSection = () => {
  return (
    <section className="relative w-full">
      {/* Background Image */}
      <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[828px]">
        <img 
          src="/images/img_29103456_gelay.png" 
          alt="Quezon City aerial view with colorful circular landmark" 
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8">
          {/* Main Heading */}
          <h1 className="text-[22px] sm:text-[30px] md:text-[36px] lg:text-[45px] font-normal leading-[28px] sm:leading-[38px] md:leading-[45px] lg:leading-[57px] text-white font-krona mb-4 sm:mb-6 max-w-4xl">
            Building a Smarter Workforce for Quezon City
          </h1>
          
          {/* Subtitle */}
          <p className="text-[18px] sm:text-[24px] md:text-[30px] lg:text-[36px] font-normal leading-[22px] sm:leading-[30px] md:leading-[38px] lg:leading-[45px] text-white font-krona">
            Local | Career | Thrive
          </p>
        </div>
      </div>
    </section>
  );
};

//
// --- 2. ABOUT SECTION ---
//
const AboutSection = () => {
  return (
    <section className="w-full bg-gray-800 py-8 sm:py-12 md:py-16 lg:py-[26px]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-6xl mx-auto">
          {/* Section Title */}
          <h2 className="text-[22px] sm:text-[30px] md:text-[36px] lg:text-[45px] font-normal leading-[28px] sm:leading-[38px] md:leading-[45px] lg:leading-[56px] text-white font-krona mb-6 sm:mb-8 lg:mb-12">
            About the CityJobLink
          </h2>
          
          {/* Section Content */}
          <div className="text-[14px] sm:text-[18px] md:text-[22px] lg:text-[25px] font-normal leading-[20px] sm:leading-[26px] md:leading-[32px] lg:leading-[46px] text-white font-lohit text-center max-w-5xl">
            <p className="mb-4 sm:mb-6">
              CityJobLink is Quezon City's smart employment platform built to connect jobseekers and employers through automated matching and intelligent technology. It redefines how local opportunities are discovered and filled, making hiring and job searching faster, smarter, and more reliable.
            </p>
            <p>
              Developed with the support of the Quezon City Public Employment Service Office (PESO) and local business communities, CityJobLink promotes inclusive employment by bringing together technology, transparency, and local talent in one digital space.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

//
// --- 3. SERVICES SECTION ---
//
const ServicesSection = () => {
  return (
    <section className="w-full bg-gray-800 py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12">
          
          {/* For Jobseekers Section */}
          <div className="w-full lg:w-[48%] flex flex-col p-8">
            <div className="flex items-start gap-4 mb-6">
              {/* --- NOTE: You need to update this icon path --- */}
              <img 
                src="/images/img_image_1.png" 
                alt="Jobseeker icon" 
                className="w-[30px] h-[45px] sm:w-[38px] sm:h-[58px] lg:w-[46px] lg:h-[70px] flex-shrink-0 mt-2"
              />
              <h3 className="text-[18px] sm:text-[24px] md:text-[28px] lg:text-[35px] font-normal leading-[22px] sm:leading-[30px] md:leading-[35px] lg:leading-[44px] text-white">
                For Jobseekers
              </h3>
            </div>
            
            <div className="text-[14px] sm:text-[18px] md:text-[22px] lg:text-[27px] font-normal leading-[20px] sm:leading-[26px] md:leading-[30px] lg:leading-[34px] text-white">
              <p className="mb-4">
                CityJobLink helps you take control of your career with tools that make finding the right job easier than ever:
              </p>
              <ul className="space-y-2 list-none">
                <li>• Automated job matching based on your skills, education, and interests</li>
                <li>• Smart recommendations tailored to your profile and goals</li>
                <li>• Verified job listings from accredited local employers</li>
                <li>• Career resources including training opportunities and job-readiness tips</li>
                <li>• Secure access to manage applications and track opportunities in real time</li>
              </ul>
            </div>
          </div>
          
          {/* For Employers Section */}
          <div className="w-full lg:w-[48%] flex flex-col p-8">
            <div className="flex items-start gap-4 mb-6">
              {/* --- NOTE: You need to update this icon path --- */}
              <img 
                src="/images/img_profiles.png" 
                alt="Employer icon" 
                className="w-[45px] h-[50px] sm:w-[58px] sm:h-[65px] lg:w-[70px] lg:h-[78px] flex-shrink-0 mt-2"
              />
              <h3 className="text-[18px] sm:text-[24px] md:text-[28px] lg:text-[35px] font-normal leading-[22px] sm:leading-[30px] md:leading-[35px] lg:leading-[44px] text-white">
                For Employers
              </h3>
            </div>
            
            <div className="text-[14px] sm:text-[18px] md:text-[22px] lg:text-[27px] font-normal leading-[20px] sm:leading-[26px] md:leading-[30px] lg:leading-[34px] text-white">
              <p className="mb-4">
                CityJobLink empowers businesses to find the right talent efficiently and confidently:
              </p> {/* --- THIS WAS THE FIX (was </C>) --- */}
              <ul className="space-y-2 list-none">
                <li>• Post job vacancies and manage listings anytime</li>
                <li>• Automated candidate matching to speed up recruitment</li>
                <li>• Smart filtering tools to shortlist qualified applicants</li>
                <li>• Dashboard management for tracking applications and placements</li>
                <li>• Accredited access ensuring legitimacy and protection for both employers and jobseekers</li>
              </ul>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

//
// --- 4. THE MAIN HOMEPAGE COMPONENT ---
//
const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>CityJobLink - Building Smarter Workforce | Quezon City Job Portal</title>
        <meta name="description" content="CityJobLink connects Quezon City jobseekers with local employers through smart technology. Find jobs, explore career opportunities, and build your future with Local Career Thrive." />
        <meta property="og:title" content="CityJobLink - Building Smarter Workforce | Quezon City Job Portal" />
        <meta property="og:description" content="CityJobLink connects Quezon City jobseekers with local employers through smart technology. Find jobs, explore career opportunities, and build your future with Local Career Thrive." />
      </Helmet>

      <main className="w-full overflow-x-hidden">
        {/* We call all the components we defined above */}
        <Header />
        <HeroSection />
        
        <AboutSection />
        <ServicesSection />
        
      </main>
    </>
  );
};

export default HomePage;