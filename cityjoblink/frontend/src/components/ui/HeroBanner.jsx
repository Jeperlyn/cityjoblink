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
      <div className="relative h-[260px] text-white">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        {/* Richer gradient: strong blue on left, fades to dark slate on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-qc-blue via-qc-blue/75 to-slate-900/60" />
        {/* Subtle bottom vignette for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        <div className="relative z-10 h-full p-7 md:p-10 flex flex-col justify-between">
          {badge ? (
            <div className="self-start">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 backdrop-blur-sm px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white/90">
                {icon && <span className="opacity-80">{icon}</span>}
                {badge}
              </span>
            </div>
          ) : <div />}

          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-[2.1rem] font-extrabold tracking-tight leading-tight mb-2 drop-shadow-sm">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm md:text-[0.9rem] text-white/85 leading-relaxed max-w-xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
