import React from 'react';

const ProgressBar = ({ progress, label, showPercentage = true, size = 'md', color = 'primary' }) => {
  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const colors = {
    primary: 'bg-primary-600',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    physics: 'bg-science-physics',
    chemistry: 'bg-science-chemistry',
    biology: 'bg-science-biology'
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizes[size]} dark:bg-gray-700`}>
        <div
          className={`${colors[color]} ${sizes[size]} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
