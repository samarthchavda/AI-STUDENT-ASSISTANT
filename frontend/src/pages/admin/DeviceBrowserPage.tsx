import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Monitor, Globe, ArrowLeft, Tablet } from 'lucide-react';
import Header from '../../components/Header';
import { useAppStore } from '../../store/useAppStore';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DeviceBrowserSummary {
  total_users: number;
  total_sessions: number;
  device_types: number;
  browsers: number;
}

interface Distribution {
  device_type?: string;
  browser_name?: string;
  os_name?: string;
  category?: string;
  user_count: number;
  session_count: number;
  percentage: number;
}

interface UserPreference {
  user_id: number;
  name: string;
  email: string;
  primary_device: string;
  primary_browser: string;
  primary_os: string;
  device_count: number;
  total_sessions: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function DeviceBrowserPage() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DeviceBrowserSummary | null>(null);
  const [deviceDist, setDeviceDist] = useState<Distribution[]>([]);
  const [browserDist, setBrowserDist] = useState<Distribution[]>([]);
  const [osDist, setOsDist] = useState<Distribution[]>([]);
  const [mobileVsDesktop, setMobileVsDesktop] = useState<Distribution[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreference[]>([]);

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

      const [summaryRes, deviceRes, browserRes, osRes, mobileRes, prefsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tracking/admin/device-browser/summary`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tracking/admin/device-browser/device-distribution`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tracking/admin/device-browser/browser-distribution`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tracking/admin/device-browser/os-distribution`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tracking/admin/device-browser/mobile-vs-desktop`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tracking/admin/device-browser/user-preferences?limit=20`, { headers })
      ]);

      const summaryData = await summaryRes.json();
      const deviceData = await deviceRes.json();
      const browserData = await browserRes.json();
      const osData = await osRes.json();
      const mobileData = await mobileRes.json();
      const prefsData = await prefsRes.json();

      setSummary(summaryData);
      setDeviceDist(deviceData.data || []);
      setBrowserDist(browserData.data || []);
      setOsDist(osData.data || []);
      setMobileVsDesktop(mobileData.data || []);
      setUserPreferences(prefsData.data || []);
    } catch (error) {
      console.error('Failed to fetch device/browser data:', error);
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
            <p className="mt-4 text-gray-600">Loading device analytics...</p>
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
                <Smartphone className="w-8 h-8 text-blue-600" />
                Device & Browser Analytics
              </h1>
              <p className="text-gray-600 mt-1">Track device types, browsers, and OS distribution</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Users</span>
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary?.total_users || 0}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Sessions</span>
              <Monitor className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary?.total_sessions || 0}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Device Types</span>
              <Tablet className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary?.device_types || 0}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Browsers</span>
              <Globe className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary?.browsers || 0}</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Device Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Type Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceDist}
                  dataKey="user_count"
                  nameKey="device_type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {deviceDist.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Mobile vs Desktop */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mobile vs Desktop</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mobileVsDesktop}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="user_count" fill="#3B82F6" name="Users" />
                <Bar dataKey="session_count" fill="#10B981" name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Browser Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Browser Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={browserDist.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="browser_name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="user_count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* OS Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating System Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={osDist}
                  dataKey="user_count"
                  nameKey="os_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {osDist.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Preferences Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Device Preferences</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Primary Device</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Browser</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">OS</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Devices Used</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sessions</th>
                </tr>
              </thead>
              <tbody>
                {userPreferences.map((pref) => (
                  <tr key={pref.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{pref.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{pref.email}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                        {pref.primary_device}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{pref.primary_browser}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{pref.primary_os}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">{pref.device_count}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{pref.total_sessions}</td>
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
