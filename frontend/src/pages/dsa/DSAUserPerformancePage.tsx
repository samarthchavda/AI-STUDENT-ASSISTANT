import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { adminAPI } from '../../services/adminAPI';
import Header from '../../components/Header';
import { 
  ArrowLeft,
  Search,
  TrendingUp,
  Award,
  Target,
  Activity,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface UserPerformance {
  user_id: number;
  user_name: string;
  user_email: string;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  total_solved: number;
  total_submissions: number;
  accepted_submissions: number;
  accuracy_rate: number;
  last_active: string | null;
  is_active_24h: boolean;
}

const DSAUserPerformancePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPerformance, setUserPerformance] = useState<UserPerformance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserPerformance[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!user.isAdmin) {
      navigate('/dashboard');
      return;
    }
    
    loadUserPerformance();
  }, [user, navigate]);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === '') {
      setFilteredUsers(userPerformance);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = userPerformance.filter(
        (u) =>
          u.user_name.toLowerCase().includes(query) ||
          u.user_email.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, userPerformance]);

  const loadUserPerformance = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.getDSAUserPerformance();
      setUserPerformance(data.users || []);
      setFilteredUsers(data.users || []);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate('/auth');
        return;
      }
      setError(err.response?.data?.detail || 'Failed to load user performance data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: number) => {
    navigate(`/admin/dsa/user-performance/${userId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 px-8 pb-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Panel
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">DSA User Performance Insights</h1>
              <p className="text-gray-500 mt-2">Analyze user activity, accuracy, and problem-solving patterns</p>
            </div>
            <button
              onClick={loadUserPerformance}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by user name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-500 mt-2">
              Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-6 flex items-center gap-6">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Table */}
        {!loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                User Performance Overview ({filteredUsers.length} users)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User Info
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Difficulty Breakdown
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Solved
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Accuracy Rate
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((userPerf) => (
                    <tr key={userPerf.user_id} className="hover:bg-gray-50 transition">
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div>
                          <button
                            onClick={() => handleUserClick(userPerf.user_id)}
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                          >
                            {userPerf.user_name}
                          </button>
                          <div className="text-xs text-gray-500 mt-1">{userPerf.user_email}</div>
                        </div>
                      </td>

                      {/* Difficulty Breakdown */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3" />
                            {userPerf.easy_solved} Easy
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                            <Target className="w-3 h-3" />
                            {userPerf.medium_solved} Med
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            <TrendingUp className="w-3 h-3" />
                            {userPerf.hard_solved} Hard
                          </span>
                        </div>
                      </td>

                      {/* Total Solved */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-2xl font-bold text-gray-900">{userPerf.total_solved}</span>
                          <span className="text-xs text-gray-500">problems</span>
                        </div>
                      </td>

                      {/* Accuracy Rate */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <div className={`text-2xl font-bold ${
                            userPerf.accuracy_rate >= 80 ? 'text-green-600' :
                            userPerf.accuracy_rate >= 50 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {userPerf.accuracy_rate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {userPerf.accepted_submissions}/{userPerf.total_submissions}
                          </div>
                        </div>
                      </td>

                      {/* Activity Heatmap */}
                      <td className="px-6 py-4 text-center">
                        {userPerf.is_active_24h ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-green-700">Active</span>
                          </div>
                        ) : userPerf.last_active ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-xs font-medium text-gray-600">
                              {new Date(userPerf.last_active).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No activity</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleUserClick(userPerf.user_id)}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                        >
                          <Activity className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && !loading && (
              <div className="p-12 text-center">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'No users have attempted DSA problems yet'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && filteredUsers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="text-3xl font-bold mb-1">
                {filteredUsers.reduce((sum, u) => sum + u.total_solved, 0)}
              </h3>
              <p className="text-sm text-indigo-100">Total Problems Solved</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="text-3xl font-bold mb-1">
                {(
                  filteredUsers.reduce((sum, u) => sum + u.accuracy_rate, 0) /
                  filteredUsers.length
                ).toFixed(1)}%
              </h3>
              <p className="text-sm text-green-100">Average Accuracy</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="text-3xl font-bold mb-1">
                {filteredUsers.filter((u) => u.is_active_24h).length}
              </h3>
              <p className="text-sm text-orange-100">Active in 24h</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="text-3xl font-bold mb-1">
                {filteredUsers.reduce((sum, u) => sum + u.total_submissions, 0)}
              </h3>
              <p className="text-sm text-purple-100">Total Submissions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DSAUserPerformancePage;
