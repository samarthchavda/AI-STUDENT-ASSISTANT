import { useState, useEffect } from 'react';
import { Activity, Database, Zap, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { adminAPI } from '../../services/adminAPI';

export default function SystemHealthPage() {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthData();
    const interval = setInterval(loadHealthData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadHealthData = async () => {
    try {
      const data = await adminAPI.getSystemHealth();
      setHealthData(data);
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      case 'critical': return <AlertCircle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600 mt-1">Real-time monitoring of system performance</p>
        </div>
        <button
          onClick={loadHealthData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {healthData && (
        <>
          {/* Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gemini API */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Gemini API</h3>
                    <p className="text-sm text-gray-500">AI Response Times</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${getStatusColor(healthData.gemini_api.status)}`}>
                  {getStatusIcon(healthData.gemini_api.status)}
                  <span className="text-xs font-medium capitalize">{healthData.gemini_api.status}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Avg Response Time</span>
                    <span className="font-semibold text-gray-900">{healthData.gemini_api.avg_response_time}ms</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((healthData.gemini_api.avg_response_time / 5000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">{healthData.gemini_api.success_rate}%</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Requests (24h)</span>
                  <span className="font-semibold text-gray-900">{healthData.gemini_api.total_requests}</span>
                </div>
              </div>
            </div>

            {/* Database */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Database</h3>
                    <p className="text-sm text-gray-500">Query Performance</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${getStatusColor(healthData.database.status)}`}>
                  {getStatusIcon(healthData.database.status)}
                  <span className="text-xs font-medium capitalize">{healthData.database.status}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Avg Query Time</span>
                    <span className="font-semibold text-gray-900">{healthData.database.avg_response_time}ms</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((healthData.database.avg_response_time / 1000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">{healthData.database.success_rate}%</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Queries (24h)</span>
                  <span className="font-semibold text-gray-900">{healthData.database.total_requests}</span>
                </div>
              </div>
            </div>

            {/* API Endpoints */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">API Endpoints</h3>
                    <p className="text-sm text-gray-500">Overall Performance</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${getStatusColor(healthData.api_endpoints.status)}`}>
                  {getStatusIcon(healthData.api_endpoints.status)}
                  <span className="text-xs font-medium capitalize">{healthData.api_endpoints.status}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Avg Response Time</span>
                    <span className="font-semibold text-gray-900">{healthData.api_endpoints.avg_response_time}ms</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((healthData.api_endpoints.avg_response_time / 2000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">{healthData.api_endpoints.success_rate}%</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Requests (24h)</span>
                  <span className="font-semibold text-gray-900">{healthData.api_endpoints.total_requests}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Legend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Status Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Healthy</p>
                  <p className="text-sm text-gray-500">All systems operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Warning</p>
                  <p className="text-sm text-gray-500">Performance degraded</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Critical</p>
                  <p className="text-sm text-gray-500">Immediate attention needed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center text-sm text-gray-500">
            Last updated: {new Date(healthData.timestamp).toLocaleString()}
          </div>
        </>
      )}
    </div>
  );
}
