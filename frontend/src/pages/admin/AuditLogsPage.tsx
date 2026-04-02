import { useState, useEffect } from 'react';
import { Shield, Search, Filter, Clock, User, Activity } from 'lucide-react';
import { adminAPI } from '../../services/adminAPI';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [filterType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsData, statsData] = await Promise.all([
        adminAPI.getAuditLogs(100, filterType || undefined),
        adminAPI.getAuditStats()
      ]);
      setLogs(logsData.logs || []);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.action_details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.target_user_name && log.target_user_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getActionColor = (actionType: string) => {
    if (actionType.includes('delete')) return 'bg-red-100 text-red-700';
    if (actionType.includes('promote') || actionType.includes('upgrade')) return 'bg-green-100 text-green-700';
    if (actionType.includes('broadcast')) return 'bg-purple-100 text-purple-700';
    if (actionType.includes('update') || actionType.includes('edit')) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-1">Track all admin actions and system changes</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Total Actions</p>
                <p className="text-3xl font-bold mt-2">{stats.total_logs}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Shield className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Last 24 Hours</p>
                <p className="text-3xl font-bold mt-2">{stats.recent_activity_24h}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Activity className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Action Types</p>
                <p className="text-3xl font-bold mt-2">{Object.keys(stats.action_counts || {}).length}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Filter className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs by admin, user, or action..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Actions</option>
            {stats && Object.keys(stats.action_counts || {}).map(type => (
              <option key={type} value={type}>{type.replace(/_/g, ' ').toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Activity Log</h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No audit logs found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action_type)}`}>
                          {log.action_type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{log.admin_name}</span>
                          <span className="text-gray-400">({log.admin_email})</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-900 mb-2">{log.action_details}</p>
                      
                      {log.target_user_name && (
                        <p className="text-sm text-gray-600">
                          Target: <span className="font-medium">{log.target_user_name}</span>
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                        {log.ip_address && (
                          <span>IP: {log.ip_address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
