import React from 'react';
import bagongPilipinasLogo from '../assets/img/Bagong Pilipinas Logo.png';
import doleLogo from '../assets/img/Department of Labor and Employment Logo.png';
import qcGovLogo from '../assets/img/Quezon City Government Logo.png';

const InstitutionalFooter = () => {
  const logos = [
    { src: bagongPilipinasLogo, alt: 'Bagong Pilipinas Logo' },
    { src: doleLogo, alt: 'Department of Labor and Employment Logo' },
    { src: qcGovLogo, alt: 'Quezon City Government Logo' },
  ];

  return (
    <footer className="w-full border-t border-slate-200 bg-white py-3 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-[12px] text-slate-700">
          <section className="space-y-4">
            <div>
            <h3 className="text-sm font-bold text-qc-blue">Public Employment Service Office</h3>
            <p>6th Floor, Civic Center Building A Quezon City Hall, Quezon City</p>
            <p>peso@quezoncity.gov.ph</p>
            <p>Official Facebook Page: of Public Employment Service Office</p>
            </div>

    
          </section>

          <section className="md:justify-self-end w-full md:w-auto flex flex-col items-center">
            <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-4">
              In Partnership With
            </p>
            <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
              {logos.map((logo) => (
                <img
                  key={logo.alt}
                  src={logo.src}
                  alt={logo.alt}
                  className="h-8 w-auto object-contain"
                  loading="lazy"
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </footer>
  );
};

export default InstitutionalFooter;
