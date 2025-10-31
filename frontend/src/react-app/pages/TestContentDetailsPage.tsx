import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Direct import to avoid path resolution issues
import { contentService } from '../services/contentService';

const TestContentDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState('');

  useEffect(() => {
    // Log environment for debugging
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      location: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
    });

    // Set API base URL from environment
    setApiBaseUrl(import.meta.env.VITE_API_URL || 'http://localhost:3001');

    const fetchContent = async () => {
      if (!id) {
        setError('No content ID provided');
        setLoading(false);
        return;
      }

      console.log('Starting to fetch content for ID:', id);
      
      try {
        // Test direct fetch first
        const testUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/content/${id}`;
        console.log('Testing direct fetch to:', testUrl);
        
        // First try with the content service
        console.log('Trying contentService.getContent...');
        const data = await contentService.getContent(id);
        console.log('Content data received via service:', data);
        setContent(data);
      } catch (err) {
        console.error('Error with content service:', err);
        
        // Fallback to direct fetch
        try {
          console.log('Falling back to direct fetch...');
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/content/${id}`,
            {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Direct fetch successful:', data);
          setContent(data);
        } catch (fetchErr) {
          console.error('Direct fetch failed:', fetchErr);
          setError(fetchErr.message || 'Failed to load content');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Loading Content...</h1>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold mb-2">Debug Information:</h2>
            <pre className="text-sm bg-white p-2 rounded border">
              Content ID: {id || 'N/A'}
              API Base: {apiBaseUrl || 'Not set'}
              
              Check the browser console for detailed logs.
            </pre>
          </div>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <div className="mt-4">
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Content Details</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
};

export default TestContentDetailsPage;
