import React from 'react';

interface SkeletonLoaderProps {
  type: 'card' | 'list' | 'table' | 'text' | 'avatar' | 'button';
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type, 
  count = 1, 
  className = '' 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-white rounded-lg border p-4 space-y-3 ${className}`}>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6"></div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className={`space-y-3 ${className}`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded border">
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        );

      case 'table':
        return (
          <div className={`bg-white rounded-lg border overflow-hidden ${className}`}>
            <div className="h-12 bg-gray-50 border-b flex items-center px-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
            </div>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-16 border-b border-gray-100 flex items-center px-4 space-x-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <div className={`space-y-2 ${className}`}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={`h-4 bg-gray-200 rounded animate-pulse ${
                  index === 2 ? 'w-3/4' : 'w-full'
                }`}
              ></div>
            ))}
          </div>
        );

      case 'avatar':
        return (
          <div className={`h-10 w-10 bg-gray-200 rounded-full animate-pulse ${className}`}></div>
        );

      case 'button':
        return (
          <div className={`h-10 w-24 bg-gray-200 rounded animate-pulse ${className}`}></div>
        );

      default:
        return (
          <div className={`h-4 bg-gray-200 rounded animate-pulse ${className}`}></div>
        );
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

export default SkeletonLoader;