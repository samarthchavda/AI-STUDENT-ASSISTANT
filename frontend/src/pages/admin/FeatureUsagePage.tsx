import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, TrendingUp, TrendingDown, AlertCircle, ArrowLeft, Target } from 'lucide-react';
import Header from '../../components/Header';
import { useAppStore } from '../../store/useAppStore';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FeatureUsageSummary {
  total_features: number;
  total_uses: number;
  total_unique_users: number;
  avg_success_rate: number;
}

interface Feature {
  feature_name: string;
  feature_category: string;
  total_uses: number;
  unique_users: number;
  success_rate: number;
  avg_duration: number;
  completion_rate?: number;
}

interface DropoffFeature {
  feature_name: string;
  opens: number;
  completions: number;
  abandons: number;
  dropoff_rate: number;
}

interface CategoryUsage {
  category: string;
  total_uses: number;
  unique_users: number;
  avg_duration: number;
  success_rate: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function FeatureUsagePage() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FeatureUsageSummary | null>(null);
  const [mostUsed, setMostUsed] = useState<Feature[]>([]);
  const [leastUsed, setLeastUsed] = useState<Feature[]>([]);
  const [dropoffFeatures, setDropoffFeatures] = useState<DropoffFeature[]>([]);
  const [categoryUsage, setCategoryUsage] = useState<CategoryUsage[]>([]);

  useEffect(() => {
    if (!user?.isAdmin) {
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

      const [summaryRes, mostUsedRes, leastUsedRes, dropoffRes, categoryRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tracking/admin/feature-usage/summary`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tracking/admin/feature-usage/most-used?limit=10`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tracking/admin/feature-usage/least-used?limit=10`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tracking/admin/feature-usage/dropoff-analysis`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tracking/admin/feature-usage/by-category`, { headers })
      ]);

      const summaryData = await summaryRes.json();
      const mostUsedData = await mostUsedRes.json();
      const leastUsedData = await leastUsedRes.json();
      const dropoffData = await dropoffRes.json();
      const categoryData = await categoryRes.json();

      setSummary(summaryData);
      setMostUsed(mostUsedData.data || []);
      setLeastUsed(leastUsedData.data || []);
      setDropoffFeatures(dropoffData.data || []);
      setCategoryUsage(categoryData.data || []);
    } catch (error) {
      console.error('Failed to fetch feature usage:', error);
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
            <p className="mt-4 text-gray-600">Loading feature usage...</p>
          </div>
        </div>
      </div>
    );
  }

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
                <Zap className="w-8 h-8 text-yellow-600" />
                Feature Usage Analytics
              </h1>
              <p className="text-gray-600 mt-1">Track feature adoption and usage patterns</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Features</span>
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary?.total_features || 0}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Uses</span>
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary?.total_uses.toLocaleString() || 0}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Unique Users</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary?.total_unique_users || 0}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Avg Success Rate</span>
              <AlertCircle className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{(summary?.avg_success_rate || 0).toFixed(1)}%</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Most Used Features */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Most Used Features
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mostUsed.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="feature_name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total_uses" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryUsage}
                  dataKey="total_uses"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {categoryUsage.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Least Used Features */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            Least Used Features (Need Attention)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Feature</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Uses</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Unique Users</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {leastUsed.map((feature, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{feature.feature_name}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                        {feature.feature_category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{feature.total_uses}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{feature.unique_users}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">{feature.success_rate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drop-off Analysis */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Feature Drop-off Analysis
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Feature</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Opens</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Completions</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Abandons</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Drop-off Rate</th>
                </tr>
              </thead>
              <tbody>
                {dropoffFeatures.slice(0, 10).map((feature, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{feature.feature_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{feature.opens}</td>
                    <td className="py-3 px-4 text-sm text-green-600 font-semibold">{feature.completions}</td>
                    <td className="py-3 px-4 text-sm text-red-600 font-semibold">{feature.abandons}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        feature.dropoff_rate > 50 ? 'bg-red-50 text-red-700' :
                        feature.dropoff_rate > 30 ? 'bg-orange-50 text-orange-700' :
                        'bg-green-50 text-green-700'
                      }`}>
                        {feature.dropoff_rate.toFixed(1)}%
                      </span>
                    </td>
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
