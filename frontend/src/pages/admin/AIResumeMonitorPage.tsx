import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import Header from '../../components/Header';
import { 
  Activity, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  FileText,
  Briefcase,
  FolderKanban,
  Target
} from 'lucide-react';

interface AIMonitorStats {
  total_ai_generations: number;
  success_count: number;
  failure_count: number;
  average_response_time: number;
  summary_generations: number;
  project_generations: number;
  experience_generations: number;
  template_recommendations: number;
  recent_requests: Array<{
    id: number;
    user_email: string;
    request_type: string;
    status: 'success' | 'failure';
    response_time: number;
    timestamp: string;
  }>;
}

const AIResumeMonitorPage = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [stats, setStats] = useState<AIMonitorStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Check if user is admin
    if (!user.isAdmin) {
      navigate('/dashboard');
      return;
    }
    
    loadStats();
  }, [user, navigate]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/ai-resume-monitor`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized access. Admin privileges required.');
        }
        throw new Error('Failed to load AI monitor stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load AI monitor data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Resume Monitor</h1>
              <p className="text-gray-500 mt-1">Monitor Gemini AI usage for resume generation</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && !stats ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading AI monitor data...</p>
            </div>
          ) : stats ? (
            <>
              {/* Top Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {/* Total AI Generations */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 uppercase">Total</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.total_ai_generations}</h3>
                  <p className="text-sm text-gray-500">Total AI Generations</p>
                </div>

                {/* Successful Requests */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-xs font-medium text-green-600 uppercase">Success</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.success_count}</h3>
                  <p className="text-sm text-gray-500">Successful Requests</p>
                </div>

                {/* Failed Requests */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <span className="text-xs font-medium text-red-600 uppercase">Failed</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.failure_count}</h3>
                  <p className="text-sm text-gray-500">Failed Requests</p>
                </div>

                {/* Average Response Time */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-blue-600 uppercase">Avg Time</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.average_response_time}ms</h3>
                  <p className="text-sm text-gray-500">Average Response Time</p>
                </div>
              </div>

              {/* Generation Types Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {/* Summary Generations */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Summary</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.summary_generations}</p>
                  <p className="text-xs text-gray-500 mt-1">Generations</p>
                </div>

                {/* Project Generations */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <FolderKanban className="w-5 h-5 text-cyan-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Projects</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.project_generations}</p>
                  <p className="text-xs text-gray-500 mt-1">Generations</p>
                </div>

                {/* Experience Generations */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Experience</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.experience_generations}</p>
                  <p className="text-xs text-gray-500 mt-1">Generations</p>
                </div>

                {/* Template Recommendations */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-pink-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Templates</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.template_recommendations}</p>
                  <p className="text-xs text-gray-500 mt-1">Recommendations</p>
                </div>
              </div>

              {/* Recent Requests Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Recent AI Requests</h3>
                  </div>
                </div>
                
                {stats.recent_requests && stats.recent_requests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Request Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Response Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Timestamp
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {stats.recent_requests.map((req) => (
                          <tr key={req.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-xs font-medium text-gray-600">
                                    {req.user_email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-900">{req.user_email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600 capitalize">
                                {req.request_type.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                  req.status === 'success'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {req.status === 'success' ? (
                                  <CheckCircle className="w-3 h-3" />
                                ) : (
                                  <XCircle className="w-3 h-3" />
                                )}
                                {req.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">
                                {req.response_time}ms
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">
                                {formatDate(req.timestamp)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No AI requests recorded yet</p>
                  </div>
                )}
              </div>
            </>
          ) : !loading && !error ? (
            /* Empty State */
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-500">AI monitoring data will appear here once resume generation starts.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AIResumeMonitorPage;
