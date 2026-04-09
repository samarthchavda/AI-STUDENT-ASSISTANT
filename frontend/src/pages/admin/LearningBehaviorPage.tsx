import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Target, TrendingUp, Clock, Award, Users, ArrowLeft, Sun, Sunset, Moon, CloudMoon } from 'lucide-react';
import Header from '../../components/Header';
import { useAppStore } from '../../store/useAppStore';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LearningBehaviorSummary {
  most_practiced_topic: string;
  most_practiced_category: string;
  preferred_difficulty: string;
  favorite_company: string;
  peak_study_time: string;
  total_actions: number;
  completed_count: number;
  skipped_count: number;
  solutions_viewed: number;
}

interface TopicData {
  topic: string;
  count: number;
  percentage: number;
}

interface DifficultyData {
  difficulty: string;
  count: number;
  percentage: number;
}

interface CompanyData {
  company: string;
  count: number;
}

interface StudyTimeData {
  time_of_day: string;
  count: number;
}

interface UserBehaviorData {
  id: number;
  name: string;
  email: string;
  plan: string;
  most_practiced_topic: string | null;
  preferred_difficulty: string | null;
  favorite_company: string | null;
  peak_study_time: string | null;
  total_actions: number;
  completed_count: number;
  skipped_count: number;
  solutions_viewed: number;
  completion_rate: number;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

const DIFFICULTY_COLORS: { [key: string]: string } = {
  'easy': '#10b981',
  'medium': '#f59e0b',
  'hard': '#ef4444'
};

const TIME_ICONS: { [key: string]: any } = {
  'morning': Sun,
  'afternoon': Sunset,
  'evening': Moon,
  'night': CloudMoon
};

export default function LearningBehaviorPage() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<LearningBehaviorSummary | null>(null);
  const [topicData, setTopicData] = useState<TopicData[]>([]);
  const [difficultyData, setDifficultyData] = useState<DifficultyData[]>([]);
  const [companyData, setCompanyData] = useState<CompanyData[]>([]);
  const [studyTimeData, setStudyTimeData] = useState<StudyTimeData[]>([]);
  const [users, setUsers] = useState<UserBehaviorData[]>([]);

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

      const [summaryRes, topicRes, difficultyRes, companyRes, studyTimeRes, usersRes] = await Promise.all([
        fetch(`${baseUrl}/tracking/admin/learning-behavior/summary?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/tracking/admin/learning-behavior/topic-distribution?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/tracking/admin/learning-behavior/difficulty-distribution?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/tracking/admin/learning-behavior/company-preference?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/tracking/admin/learning-behavior/study-time-heatmap?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/tracking/admin/learning-behavior/users-table?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }

      if (topicRes.ok) {
        const data = await topicRes.json();
        setTopicData(data.data || []);
      }

      if (difficultyRes.ok) {
        const data = await difficultyRes.json();
        setDifficultyData(data.data || []);
      }

      if (companyRes.ok) {
        const data = await companyRes.json();
        setCompanyData(data.data || []);
      }

      if (studyTimeRes.ok) {
        const data = await studyTimeRes.json();
        setStudyTimeData(data.data || []);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load learning behavior data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRate = () => {
    if (!summary) return 0;
    const total = summary.completed_count + summary.skipped_count;
    if (total === 0) return 0;
    return Math.round((summary.completed_count / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50">
        <Header />
        <div className="pt-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50">
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
                <h1 className="text-3xl font-black text-slate-900">🎓 Learning Behavior Analytics</h1>
                <p className="text-slate-600 mt-1">Understand how users learn and practice</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-sm font-medium"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={14}>Last 14 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Most Practiced</p>
                  <p className="text-lg font-black text-slate-900">
                    {summary?.most_practiced_topic || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Preferred Difficulty</p>
                  <p className="text-lg font-black text-slate-900 capitalize">
                    {summary?.preferred_difficulty || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Favorite Company</p>
                  <p className="text-lg font-black text-slate-900">
                    {summary?.favorite_company || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Peak Study Time</p>
                  <p className="text-lg font-black text-slate-900 capitalize">
                    {summary?.peak_study_time || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-sm opacity-90 mb-1">Total Actions</p>
              <p className="text-3xl font-black">{summary?.total_actions || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-sm opacity-90 mb-1">Completed</p>
              <p className="text-3xl font-black">{summary?.completed_count || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-sm opacity-90 mb-1">Skipped</p>
              <p className="text-3xl font-black">{summary?.skipped_count || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-sm opacity-90 mb-1">Completion Rate</p>
              <p className="text-3xl font-black">{getCompletionRate()}%</p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Topic Distribution */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Topic Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topicData}
                    dataKey="count"
                    nameKey="topic"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.topic} (${entry.percentage}%)`}
                  >
                    {topicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Difficulty Distribution */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Difficulty Preference
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={difficultyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="difficulty" 
                    stroke="#64748b"
                    style={{ fontSize: '12px', textTransform: 'capitalize' }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DIFFICULTY_COLORS[entry.difficulty] || '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Company Preference */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Company Preference
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={companyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis 
                    type="category" 
                    dataKey="company" 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Study Time Pattern */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Study Time Pattern
              </h3>
              <div className="grid grid-cols-2 gap-4 py-8">
                {studyTimeData.map((item) => {
                  const Icon = TIME_ICONS[item.time_of_day] || Clock;
                  const total = studyTimeData.reduce((sum, d) => sum + d.count, 0);
                  const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  
                  return (
                    <div key={item.time_of_day} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <Icon className="h-6 w-6 text-slate-700" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 capitalize">{item.time_of_day}</p>
                        <p className="text-2xl font-black text-slate-900">{percentage}%</p>
                        <p className="text-xs text-slate-500">{item.count} actions</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              User Learning Preferences
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">User</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Plan</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Top Topic</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Difficulty</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Fav Company</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Actions</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Completion</th>
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
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {user.most_practiced_topic || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {user.preferred_difficulty && (
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                            user.preferred_difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            user.preferred_difficulty === 'medium' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {user.preferred_difficulty}
                          </span>
                        )}
                        {!user.preferred_difficulty && '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {user.favorite_company || '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-medium text-slate-900">
                        {user.total_actions}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          user.completion_rate >= 80 ? 'bg-green-100 text-green-700' :
                          user.completion_rate >= 50 ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {user.completion_rate}%
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
    </div>
  );
}
