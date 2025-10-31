import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        console.error('OAuth error:', error, errorDescription);
        setStatus('error');
        setErrorMessage(errorDescription || error);
        return;
      }

      if (code) {
        try {
          // For demo purposes, simulate successful OAuth
          // In production, you'd send the code to your backend to exchange for tokens
          setStatus('success');

          // Redirect to home after a short delay
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1500);

        } catch (error) {
          console.error('OAuth callback error:', error);
          setStatus('error');
          setErrorMessage('Failed to complete authentication');
        }
      } else {
        // No code or error, this might be a direct visit
        navigate('/auth');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Sign In...</h2>
          <p className="text-gray-600">Please wait while we finish setting up your account.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-2xl mx-auto">
          <div className="mb-4">
            <XCircle className="w-12 h-12 mx-auto text-red-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Authentication Failed</h2>
          <p className="text-gray-700 mb-6">
            {errorMessage || 'There was an error completing your sign in. Please try again.'}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/auth')}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>

            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full px-6 py-3 bg-white/20 hover:bg-white/30 text-gray-900 rounded-lg font-medium transition-colors"
            >
              Return to Landing Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-2xl mx-auto">
        <div className="mb-4">
          <CheckCircle className="w-12 h-12 mx-auto text-green-400" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Authentication Successful!</h2>
        <p className="text-blue-200 mb-6">
          You will be redirected to the app automatically in a moment...
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard', { replace: true })}
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
