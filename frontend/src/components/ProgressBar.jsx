import React from 'react';

const ProgressBar = ({ progress, label }) => {
  return (
    <div className="w-full mt-4">
      {label && <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-brand-500 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs text-right text-gray-500 mt-1">{progress}%</p>
    </div>
  );
};

export default ProgressBar;
