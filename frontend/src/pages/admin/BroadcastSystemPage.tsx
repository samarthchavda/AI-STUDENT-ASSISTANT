import { useState, useEffect } from 'react';
import { Send, Megaphone, Users, Clock, X } from 'lucide-react';
import { adminAPI } from '../../services/adminAPI';

export default function BroadcastSystemPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const loadBroadcasts = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getBroadcasts(50);
      setBroadcasts(data.broadcasts || []);
    } catch (error) {
      console.error('Failed to load broadcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      alert('Please enter both title and message');
      return;
    }

    setSending(true);
    try {
      const result = await adminAPI.createBroadcast({
        title: title.trim(),
        message: message.trim(),
        target_audience: targetAudience
      });
      
      alert(`✅ Broadcast sent to ${result.users_notified} users!`);
      setTitle('');
      setMessage('');
      setTargetAudience('all');
      loadBroadcasts();
    } catch (error: any) {
      alert(`Failed to send broadcast: ${error.response?.data?.detail || error.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleDeactivate = async (broadcastId: number) => {
    if (!confirm('Deactivate this broadcast banner?')) return;

    try {
      await adminAPI.deactivateBroadcast(broadcastId);
      alert('✅ Broadcast deactivated');
      loadBroadcasts();
    } catch (error: any) {
      alert(`Failed to deactivate: ${error.response?.data?.detail || error.message}`);
    }
  };

  const getAudienceBadge = (audience: string) => {
    const colors: any = {
      all: 'bg-purple-100 text-purple-700',
      pro: 'bg-yellow-100 text-yellow-700',
      basic: 'bg-blue-100 text-blue-700',
      free: 'bg-gray-100 text-gray-700'
    };
    return colors[audience] || colors.all;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Broadcast System</h1>
        <p className="text-gray-600 mt-1">Send announcements to all users or specific plan tiers</p>
      </div>

      {/* Create Broadcast Form */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-600 rounded-lg">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Broadcast</h2>
            <p className="text-sm text-gray-600">This will appear as a banner on user dashboards</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., New Feature Released!"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your announcement message..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{message.length}/500 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { value: 'all', label: 'All Users', icon: Users },
                { value: 'pro', label: 'PRO Users', icon: Users },
                { value: 'basic', label: 'BASIC Users', icon: Users },
                { value: 'free', label: 'FREE Users', icon: Users }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTargetAudience(value)}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    targetAudience === value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSendBroadcast}
            disabled={sending || !title.trim() || !message.trim()}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
          >
            {sending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Broadcast
              </>
            )}
          </button>
        </div>
      </div>

      {/* Broadcast History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Broadcast History</h2>
          <p className="text-sm text-gray-600 mt-1">Recent announcements sent to users</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No broadcasts sent yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {broadcasts.map((broadcast) => (
                <div
                  key={broadcast.id}
                  className={`p-4 rounded-lg border-2 ${
                    broadcast.is_active
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{broadcast.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAudienceBadge(broadcast.target_audience)}`}>
                          {broadcast.target_audience.toUpperCase()}
                        </span>
                        {broadcast.is_active && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3">{broadcast.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{broadcast.users_count} users</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(broadcast.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    {broadcast.is_active && (
                      <button
                        onClick={() => handleDeactivate(broadcast.id)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Deactivate broadcast"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
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
