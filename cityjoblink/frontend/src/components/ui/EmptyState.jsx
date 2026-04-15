import React from 'react';

const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
  minHeightClass = 'min-h-[360px]',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm text-center flex flex-col items-center justify-center p-10 ${minHeightClass} ${className}`.trim()}
    >
      {icon ? (
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-qc-blue/60 mb-5"
             style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #dbeafe 100%)' }}>
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-bold text-slate-800 mb-1.5">{title}</h3>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
