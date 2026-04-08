import { useState, useEffect } from 'react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { ErrorLogger, ErrorSeverity } from '@/react-app/services/errorLogger';

interface ErrorLog {
  id: string;
  timestamp: string;
  name: string;
  message: string;
  severity: string;
  category: string;
  url: string;
  userAgent: string;
  userId?: string;
  stack?: string;
  context?: Record<string, unknown>;
}

export default function ErrorDashboard() {
  const { user } = useAuth();
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: 'all',
    category: 'all',
    search: '',
  });

  useEffect(() => {
    if (user?.isAdmin) {
      fetchErrorLogs();
    }
  }, [user]);

  const fetchErrorLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/error-logs');
      if (response.ok) {
        const data = await response.json();
        setErrorLogs(data);
      } else {
        console.error('Failed to fetch error logs');
      }
    } catch (error) {
      console.error('Error fetching error logs:', error);
      ErrorLogger.getInstance().error({
        error,
        category: ErrorLogger.ErrorCategory.API,
        severity: ErrorSeverity.ERROR,
        context: { component: 'ErrorDashboard' },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const response = await fetch(`/api/error-logs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      });

      if (response.ok) {
        setErrorLogs(errorLogs.map(log => 
          log.id === id ? { ...log, status: 'resolved' } : log
        ));
      }
    } catch (error) {
      console.error('Failed to resolve error:', error);
    }
  };

  const filteredLogs = errorLogs.filter(log => {
    const matchesSeverity = filters.severity === 'all' || log.severity === filters.severity;
    const matchesCategory = filters.category === 'all' || log.category === filters.category;
    const matchesSearch = log.message.toLowerCase().includes(filters.search.toLowerCase()) ||
                         (log.context && JSON.stringify(log.context).toLowerCase().includes(filters.search.toLowerCase()));
    return matchesSeverity && matchesCategory && matchesSearch;
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen-dynamic flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Error Monitoring Dashboard</h1>
      
      {/* Filters */}
      <div className="bg-pr-surface-card p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-pr-text-1 mb-1">Severity</label>
            <select
              className="w-full p-2 border rounded"
              value={filters.severity}
              onChange={(e) => setFilters({...filters, severity: e.target.value})}
            >
              <option value="all">All Severities</option>
              {Object.entries(ErrorLogger.ErrorSeverity).map(([key, value]) => (
                <option key={value} value={value}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-pr-text-1 mb-1">Category</label>
            <select
              className="w-full p-2 border rounded"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="all">All Categories</option>
              {Object.entries(ErrorLogger.ErrorCategory).map(([key, value]) => (
                <option key={value} value={value}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-pr-text-1 mb-1">Search</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Search errors..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Error Logs Table */}
      <div className="bg-pr-surface-card rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Loading error logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-pr-surface-2">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pr-text-2 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pr-text-2 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pr-text-2 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pr-text-2 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pr-text-2 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-pr-surface-card divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-pr-surface-2">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pr-text-2">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-pr-text-1">{log.name}</div>
                      <div className="text-sm text-pr-text-2 truncate max-w-xs">{log.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pr-text-2">
                      {log.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          log.severity === 'error' ? 'bg-orange-100 text-orange-800' :
                          log.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleResolve(log.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Mark as Resolved
                      </button>
                      <button className="text-pr-text-2 hover:text-pr-text-1">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
