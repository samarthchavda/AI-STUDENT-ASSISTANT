import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Award, Target, AlertCircle, Users, ArrowLeft, Trophy } from 'lucide-react';
import Header from '../../components/Header';
import { useAppStore } from '../../store/useAppStore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceSummary {
  overall_avg_score: number;
  overall_avg_accuracy: number;
  total_users: number;
  total_attempts: number;
  highest_score: number;
  lowest_score: number;
}

interface ScoreTrend {
  date: string;
  avg_score: number;
  avg_accuracy: number;
  attempts: number;
  unique_users: number;
}

interface TopicData {
  topic: string;
  category: string;
  attempts: number;
  avg_score: number;
  avg_accuracy: number;
}

interface TopImprover {
  user_id: number;
  user_name: string;
  user_email: string;
  plan: string;
  initial_score: number;
  current_score: number;
  improvement: number;
  improvement_percent: number;
}

interface DifficultyData {
  difficulty: string;
  attempts: number;
  avg_score: number;
  avg_accuracy: number;
  unique_users: number;
}

interface UserPerformance {
  id: number;
  name: string;
  email: string;
  plan: string;
  total_attempts: number;
  avg_score: number;
  avg_accuracy: number;
  best_score: number;
  worst_score: number;
  most_practiced_topic: string;
  last_attempt: string | null;
}

export default function PerformanceTrendsPage() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [scoreTrends, setScoreTrends] = useState<ScoreTrend[]>([]);
  const [weakAreas, setWeakAreas] = useState<TopicData[]>([]);
  const [strongAreas, setStrongAreas] = useState<TopicData[]>([]);
  const [topImprovers, setTopImprovers] = useState<TopImprover[]>([]);
  const [difficultyData, setDifficultyData] = useState<DifficultyData[]>([]);
  const [users, setUsers] = useState<UserPerformance[]>([]);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/admin');
      return;
    }
    loadData();
  }, [user, navigate, days]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

      const [summaryRes, trendsRes, weakRes, strongRes, improversRes, difficultyRes, usersRes] = await Promise.all([
        fetch(`${baseUrl}/tracking/admin/performance/summary?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/tracking/admin/performance/score-trends?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/tracking/admin/performance/weak-areas?limit=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/tracking/admin/performance/strong-areas?limit=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/tracking/admin/performance/top-improvers?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/tracking/admin/performance/difficulty-breakdown?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/tracking/admin/performance/users-table?days=${days}&limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (trendsRes.ok) {
        const data = await trendsRes.json();
        setScoreTrends(data.data || []);
      }
      if (weakRes.ok) {
        const data = await weakRes.json();
        setWeakAreas(data.data || []);
      }
      if (strongRes.ok) {
        const data = await strongRes.json();
        setStrongAreas(data.data || []);
      }
      if (improversRes.ok) {
        const data = await improversRes.json();
        setTopImprovers(data.data || []);
      }
      if (difficultyRes.ok) {
        const data = await difficultyRes.json();
        setDifficultyData(data.data || []);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-50">
        <Header />
        <div className="pt-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-50">
      <Header />
      
      <div className="pt-24 px-4 sm:px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-900">📈 Performance Trends</h1>
                <p className="text-slate-600 mt-1">Track score improvements and identify learning gaps</p>
              </div>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-sm font-medium"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Avg Score</p>
                  <p className="text-2xl font-black text-slate-900">
                    {summary?.overall_avg_score.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Avg Accuracy</p>
                  <p className="text-2xl font-black text-slate-900">
                    {summary?.overall_avg_accuracy.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Active Users</p>
                  <p className="text-2xl font-black text-slate-900">
                    {summary?.total_users || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Attempts</p>
                  <p className="text-2xl font-black text-slate-900">
                    {summary?.total_attempts || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Score Trends Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Score & Accuracy Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scoreTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="avg_score" stroke="#10b981" strokeWidth={2} name="Avg Score %" dot={{ fill: '#10b981', r: 4 }} />
                <Line type="monotone" dataKey="avg_accuracy" stroke="#3b82f6" strokeWidth={2} name="Avg Accuracy %" dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weak & Strong Areas */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Weak Areas */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Weak Areas (Need Improvement)
              </h3>
              <div className="space-y-3">
                {weakAreas.map((area, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">{area.topic}</p>
                      <p className="text-xs text-slate-600">{area.category} • {area.attempts} attempts</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{area.avg_score.toFixed(1)}%</p>
                      <p className="text-xs text-slate-500">{area.avg_accuracy.toFixed(1)}% accuracy</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strong Areas */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-600" />
                Strong Areas (Excelling)
              </h3>
              <div className="space-y-3">
                {strongAreas.map((area, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">{area.topic}</p>
                      <p className="text-xs text-slate-600">{area.category} • {area.attempts} attempts</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{area.avg_score.toFixed(1)}%</p>
                      <p className="text-xs text-slate-500">{area.avg_accuracy.toFixed(1)}% accuracy</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Performance by Difficulty</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="difficulty" stroke="#64748b" style={{ fontSize: '12px', textTransform: 'capitalize' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Bar dataKey="avg_score" name="Avg Score %" radius={[8, 8, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Improvers */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Top Improvers 🏆
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Rank</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">User</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Initial</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Current</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  {topImprovers.map((improver, index) => (
                    <tr key={improver.user_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{improver.user_name}</p>
                          <p className="text-xs text-slate-500">{improver.user_email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-slate-600">{improver.initial_score.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-right text-sm font-medium text-green-600">{improver.current_score.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          +{improver.improvement.toFixed(1)}% ({improver.improvement_percent.toFixed(0)}%)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Users Performance Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">User Performance Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">User</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Plan</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Attempts</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Avg Score</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Best</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Top Topic</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          user.plan === 'pro' ? 'bg-purple-100 text-purple-700' :
                          user.plan === 'basic' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {user.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-slate-900">{user.total_attempts}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          user.avg_score >= 80 ? 'bg-green-100 text-green-700' :
                          user.avg_score >= 60 ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {user.avg_score.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-medium text-green-600">{user.best_score.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-sm text-slate-900">{user.most_practiced_topic || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
