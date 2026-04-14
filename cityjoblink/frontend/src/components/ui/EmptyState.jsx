import React from 'react';

const EmptyState = ({
  icon,
  title,
  description,
  className = '',
  minHeightClass = 'min-h-[400px]',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 shadow-sm text-center flex flex-col items-center justify-center p-8 ${minHeightClass} ${className}`.trim()}
    >
      {icon ? (
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 text-sm max-w-md">{description}</p>
    </div>
  );
};

export default EmptyState;
