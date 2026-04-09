import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, AlertTriangle, Target, ArrowLeft, Activity } from 'lucide-react';
import Header from '../../components/Header';
import { useAppStore } from '../../store/useAppStore';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EngagementSummary {
  dau: number;
  wau: number;
  mau: number;
  stickiness_ratio: number;
}

interface DAUWAUMAUData {
  date: string;
  dau: number;
  wau: number;
  mau: number;
  stickiness_ratio: number;
}

interface ChurnRiskUser {
  user_id: number;
  name: string;
  email: string;
  plan: string;
  days_inactive: number;
  churn_risk_level: string;
  churn_risk_score: number;
}

interface UserSegment {
  segment: string;
  user_count: number;
  avg_score: number;
  avg_active_days: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function EngagementMetricsPage() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<EngagementSummary | null>(null);
  const [dauWauMauData, setDauWauMauData] = useState<DAUWAUMAUData[]>([]);
  const [churnRiskUsers, setChurnRiskUsers] = useState<ChurnRiskUser[]>([]);
  const [userSegments, setUserSegments] = useState<UserSegment[]>([]);

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [summaryRes, dauRes, churnRes, segmentsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tracking/admin/engagement/summary`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tracking/admin/engagement/dau-wau-mau?days=30`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tracking/admin/engagement/churn-risk?limit=10`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tracking/admin/engagement/user-segments`, { headers })
      ]);

      const summaryData = await summaryRes.json();
      const dauData = await dauRes.json();
      const churnData = await churnRes.json();
      const segmentsData = await segmentsRes.json();

      setSummary(summaryData);
      setDauWauMauData(dauData.data || []);
      setChurnRiskUsers(churnData.data || []);
      setUserSegments(segmentsData.data || []);
    } catch (error) {
      console.error('Failed to fetch engagement metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading engagement metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-600" />
                Engagement Metrics
              </h1>
              <p className="text-gray-600 mt-1">DAU/WAU/MAU, Retention & Churn Analysis</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Daily Active Users</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary?.dau || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Today</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Weekly Active Users</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary?.wau || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Monthly Active Users</span>
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary?.mau || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Stickiness Ratio</span>
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{(summary?.stickiness_ratio || 0).toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">DAU/MAU</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* DAU/WAU/MAU Trend */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">DAU/WAU/MAU Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dauWauMauData.slice(0, 30).reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="dau" stroke="#3B82F6" name="DAU" strokeWidth={2} />
                <Line type="monotone" dataKey="wau" stroke="#10B981" name="WAU" strokeWidth={2} />
                <Line type="monotone" dataKey="mau" stroke="#8B5CF6" name="MAU" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* User Segments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement Segments</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userSegments}
                  dataKey="user_count"
                  nameKey="segment"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.segment}: ${entry.user_count}`}
                >
                  {userSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn Risk Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">High Churn Risk Users</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Days Inactive</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Risk Level</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {churnRiskUsers.map((user) => (
                  <tr key={user.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{user.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                        {user.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{user.days_inactive} days</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(user.churn_risk_level)}`}>
                        {user.churn_risk_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">{user.churn_risk_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
