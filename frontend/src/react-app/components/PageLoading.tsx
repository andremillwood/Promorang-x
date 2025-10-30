import { Loader2 } from 'lucide-react';

interface PageLoadingProps {
  title?: string;
  description?: string;
  showSpinner?: boolean;
  className?: string;
}

export function PageLoading({
  title = 'Loading...',
  description = 'Please wait while we load your content',
  showSpinner = true,
  className = '',
}: PageLoadingProps) {
  return (
    <div className={`min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          {showSpinner && (
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-blue-100"></div>
              <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
          )}
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="text-gray-600">{description}</p>
            )}
          </div>
          
          <div className="w-full max-w-xs mx-auto pt-4">
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
