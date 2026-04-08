import { useLocation, useNavigate } from 'react-router-dom';

type NotFoundProps = {
  title?: string;
  message?: string;
};

export default function NotFound({ title, message }: NotFoundProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get state from navigation or use props
  const state = location.state as { title?: string; message?: string } | null;
  const displayTitle = title || state?.title || 'Page Not Found';
  const displayMessage = message || state?.message || 
    'The page you are looking for might have been removed or is temporarily unavailable.';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen-dynamic bg-pr-surface-card text-pr-text-1 px-4 py-12">
      <div className="max-w-md w-full text-center">
        <h1 className="text-5xl font-bold text-red-500 mb-4">{displayTitle}</h1>
        <p className="text-lg text-pr-text-2 mb-8">{displayMessage}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
