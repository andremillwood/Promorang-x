import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Simulate authentication completion
    const timer = setTimeout(() => {
      setIsComplete(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isComplete) {
      const redirectTimer = setTimeout(() => {
        navigate('/home', { replace: true });
      }, 2000);

      return () => clearTimeout(redirectTimer);
    }
  }, [isComplete, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-2xl mx-auto">
        <div className="mb-4">
          <CheckCircle className="w-12 h-12 mx-auto text-green-400" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Authentication Successful</h2>
        <p className="text-blue-200 mb-6">
          {isComplete
            ? 'You will be redirected to the app automatically in a moment...'
            : 'Completing authentication...'}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/home', { replace: true })}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Continue to App
          </button>

          <button
            onClick={() => navigate('/', { replace: true })}
            className="w-full px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
          >
            Return to Landing Page
          </button>
        </div>
      </div>
    </div>
  );
}
