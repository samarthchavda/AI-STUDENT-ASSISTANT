import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, TrendingUp, Zap, Activity, Calendar, ArrowLeft } from 'lucide-react';
import Header from '../../components/Header';
import { useAppStore } from '../../store/useAppStore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TimeTrackingSummary {
  avg_daily_time_minutes: number;
  total_time_hours: number;
  active_users_count: number;
  peak_hour: string;
  total_sessions: number;
}

interface DailyChartData {
  date: string;
  total_minutes: number;
  active_users: number;
  sessions: number;
}

interface PeakHourData {
  hour: number;
  day: string;
  day_index: number;
  count: number;
}

interface UserTimeData {
  id: number;
  name: string;
  email: string;
  plan: string;
  today_minutes: number;
  week_minutes: number;
  avg_session_minutes: number;
  last_activity: string | null;
  is_online: boolean;
}

export default function TimeTrackingPage() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<TimeTrackingSummary | null>(null);
  const [dailyChart, setDailyChart] = useState<DailyChartData[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHourData[]>([]);
  const [users, setUsers] = useState<UserTimeData[]>([]);

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

      const [summaryRes, chartRes, peakRes, usersRes] = await Promise.all([
        fetch(`/api/tracking/admin/summary?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/tracking/admin/daily-chart?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/tracking/admin/peak-hours?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/tracking/admin/users-table?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }

      if (chartRes.ok) {
        const data = await chartRes.json();
        setDailyChart(data.data || []);
      }

      if (peakRes.ok) {
        const data = await peakRes.json();
        setPeakHours(data.data || []);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load time tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Prepare heatmap data
  const heatmapData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const grid: { [key: string]: number } = {};
    peakHours.forEach(item => {
      const key = `${item.day_index}-${item.hour}`;
      grid[key] = item.count;
    });

    return { days, hours, grid };
  };

  const heatmap = heatmapData();
  const maxCount = Math.max(...peakHours.map(h => h.count), 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <Header />
        <div className="pt-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
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
                <h1 className="text-3xl font-black text-slate-900">⏱️ Time Tracking</h1>
                <p className="text-slate-600 mt-1">Monitor user activity and engagement</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Avg Daily Time</p>
                  <p className="text-2xl font-black text-slate-900">
                    {formatMinutes(summary?.avg_daily_time_minutes || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Time</p>
                  <p className="text-2xl font-black text-slate-900">
                    {Math.round(summary?.total_time_hours || 0)}h
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Active Users</p>
                  <p className="text-2xl font-black text-slate-900">
                    {summary?.active_users_count || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Peak Hour</p>
                  <p className="text-2xl font-black text-slate-900">
                    {summary?.peak_hour || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Sessions</p>
                  <p className="text-2xl font-black text-slate-900">
                    {summary?.total_sessions || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Daily Time Chart */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Daily Active Time
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
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
                    formatter={(value) => formatMinutes(Number(value))}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total_minutes" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Total Minutes"
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Active Users Chart */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Active Users & Sessions
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
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
                  <Legend />
                  <Bar dataKey="active_users" fill="#10b981" name="Active Users" />
                  <Bar dataKey="sessions" fill="#8b5cf6" name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Peak Hours Heatmap */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              Peak Hours Heatmap
            </h3>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <div className="flex gap-1">
                  <div className="flex flex-col justify-around pr-2">
                    {heatmap.days.map(day => (
                      <div key={day} className="h-6 text-xs text-slate-600 font-medium">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex gap-1 mb-1">
                      {heatmap.hours.map(hour => (
                        <div key={hour} className="w-6 text-xs text-center text-slate-600">
                          {hour % 3 === 0 ? hour : ''}
                        </div>
                      ))}
                    </div>
                    {[1, 2, 3, 4, 5, 6, 0].map(dayIndex => (
                      <div key={dayIndex} className="flex gap-1 mb-1">
                        {heatmap.hours.map(hour => {
                          const key = `${dayIndex}-${hour}`;
                          const count = heatmap.grid[key] || 0;
                          const intensity = count / maxCount;
                          const bgColor = count === 0 
                            ? 'bg-slate-100' 
                            : `bg-blue-${Math.ceil(intensity * 6) * 100}`;
                          
                          return (
                            <div
                              key={hour}
                              className={`w-6 h-6 rounded ${bgColor} ${count > 0 ? 'hover:ring-2 hover:ring-blue-400' : ''}`}
                              title={`${heatmap.days[dayIndex === 0 ? 6 : dayIndex - 1]} ${hour}:00 - ${count} activities`}
                              style={{
                                backgroundColor: count > 0 ? `rgba(59, 130, 246, ${0.2 + intensity * 0.8})` : undefined
                              }}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">User Time Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">User</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Plan</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Today</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">This Week</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Avg Session</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Status</th>
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
                      <td className="py-3 px-4 text-right text-sm text-slate-900">
                        {formatMinutes(user.today_minutes)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-medium text-slate-900">
                        {formatMinutes(user.week_minutes)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-slate-600">
                        {formatMinutes(user.avg_session_minutes)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {user.is_online ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            Online
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Offline</span>
                        )}
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
