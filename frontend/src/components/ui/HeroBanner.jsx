import React from 'react';

const HeroBanner = ({
  badge,
  title,
  subtitle,
  imageSrc,
  imageAlt = 'Hero banner',
  className = '',
  icon = null,
}) => {
  return (
    <section className={`gov-card overflow-hidden ${className}`.trim()}>
      <div className="relative h-[240px] text-white">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-qc-blue/80 via-qc-blue/65 to-slate-900/45" />

        <div className="relative z-10 h-full p-6 md:p-8">
          {badge ? (
            <div className="absolute left-6 top-6 md:left-8 md:top-8">
              <span className="inline-flex items-center rounded-md border border-blue-200/45 bg-qc-blue/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-blue-50">
                {badge}
              </span>
            </div>
          ) : null}

          <div className="h-full flex items-end">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 inline-flex items-center gap-2">
                {icon}
                <span>{title}</span>
              </h1>

              {subtitle ? (
                <p className="max-w-2xl text-sm md:text-base text-white/90 leading-relaxed">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
