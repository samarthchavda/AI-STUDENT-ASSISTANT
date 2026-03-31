import { useState, useEffect } from 'react';
import { Trophy, Star, Eye, EyeOff, Edit3, TrendingUp, Award } from 'lucide-react';
import { adminAPI } from '../../services/adminAPI';

export default function LeaderboardManagementPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [customRank, setCustomRank] = useState<string>('');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getLeaderboardManagement(100);
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (userId: number, currentVisibility: boolean) => {
    try {
      await adminAPI.updateLeaderboardEntry(userId, {
        is_visible: !currentVisibility,
        featured: false
      });
      await loadLeaderboard();
    } catch (error: any) {
      alert(`Failed to update: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleToggleFeatured = async (userId: number, currentFeatured: boolean) => {
    try {
      await adminAPI.updateLeaderboardEntry(userId, {
        is_visible: true,
        featured: !currentFeatured
      });
      await loadLeaderboard();
    } catch (error: any) {
      alert(`Failed to update: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleSetCustomRank = async (userId: number) => {
    const rank = parseInt(customRank);
    if (isNaN(rank) || rank < 1) {
      alert('Please enter a valid rank number');
      return;
    }

    try {
      await adminAPI.updateLeaderboardEntry(userId, {
        custom_rank: rank,
        is_visible: true,
        featured: false
      });
      setEditingUser(null);
      setCustomRank('');
      await loadLeaderboard();
    } catch (error: any) {
      alert(`Failed to update: ${error.response?.data?.detail || error.message}`);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'pro': return 'bg-purple-100 text-purple-700';
      case 'basic': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard Management</h1>
          <p className="text-gray-600 mt-1">Manage global rankings and featured users</p>
        </div>
        <button
          onClick={loadLeaderboard}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold mt-2">{leaderboard.length}</p>
            </div>
            <Trophy className="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Featured Users</p>
              <p className="text-3xl font-bold mt-2">{leaderboard.filter(u => u.featured).length}</p>
            </div>
            <Star className="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Visible</p>
              <p className="text-3xl font-bold mt-2">{leaderboard.filter(u => u.is_visible).length}</p>
            </div>
            <Eye className="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Custom Ranks</p>
              <p className="text-3xl font-bold mt-2">{leaderboard.filter(u => u.rank_override).length}</p>
            </div>
            <Award className="w-10 h-10 opacity-80" />
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Global Leaderboard</h2>
          <p className="text-sm text-gray-600 mt-1">Manage user rankings, visibility, and featured status</p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Problems</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Accuracy</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Streak</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaderboard.map((user) => (
                  <tr key={user.user_id} className={`hover:bg-gray-50 transition ${!user.is_visible ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getRankBadge(user.rank)}</span>
                        {user.rank_override && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Custom</span>
                        )}
                        {user.featured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPlanColor(user.plan)}`}>
                        {user.plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">{user.total_solved} total</div>
                        <div className="text-gray-500">
                          <span className="text-green-600">{user.easy_solved}E</span> / 
                          <span className="text-orange-600">{user.medium_solved}M</span> / 
                          <span className="text-red-600">{user.hard_solved}H</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{user.accuracy}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{user.total_score}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-orange-600 font-semibold">{user.streak_days} 🔥</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {editingUser === user.user_id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={customRank}
                              onChange={(e) => setCustomRank(e.target.value)}
                              placeholder="Rank"
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="1"
                            />
                            <button
                              onClick={() => handleSetCustomRank(user.user_id)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingUser(null);
                                setCustomRank('');
                              }}
                              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingUser(user.user_id);
                                setCustomRank(user.custom_rank?.toString() || '');
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Set custom rank"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleVisibility(user.user_id, user.is_visible)}
                              className={`p-2 rounded-lg transition-colors ${
                                user.is_visible
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-gray-400 hover:bg-gray-50'
                              }`}
                              title={user.is_visible ? 'Hide from leaderboard' : 'Show on leaderboard'}
                            >
                              {user.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleToggleFeatured(user.user_id, user.featured)}
                              className={`p-2 rounded-lg transition-colors ${
                                user.featured
                                  ? 'text-yellow-600 hover:bg-yellow-50'
                                  : 'text-gray-400 hover:bg-gray-50'
                              }`}
                              title={user.featured ? 'Remove from featured' : 'Add to featured'}
                            >
                              <Star className={`w-4 h-4 ${user.featured ? 'fill-yellow-600' : ''}`} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
