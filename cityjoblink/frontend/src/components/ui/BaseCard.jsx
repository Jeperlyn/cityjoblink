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
    <article className={`gov-card overflow-hidden flex flex-col h-full ${className}`.trim()}>
      {imageSrc ? (
        <div className="relative aspect-[16/9] w-full bg-slate-200">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="h-full w-full object-cover"
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
