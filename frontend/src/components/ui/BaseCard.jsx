import React from 'react';

const BaseCard = ({
  children,
  className = '',
  imageSrc,
  imageAlt = '',
  imageOverlay,
  bodyClassName = '',
}) => {
  return (
    <article className={`gov-card overflow-hidden flex flex-col h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${className}`.trim()}>
      {imageSrc ? (
        <div className="relative w-full bg-slate-100 overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <img
            src={imageSrc}
            alt={imageAlt}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
            loading="lazy"
          />
          {imageOverlay}
        </div>
      ) : null}

      <div className={`p-6 flex-1 flex flex-col ${bodyClassName}`.trim()}>{children}</div>
    </article>
  );
};

export default BaseCard;
