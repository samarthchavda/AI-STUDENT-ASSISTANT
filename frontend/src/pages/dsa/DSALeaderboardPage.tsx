import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Award, Flame, Code2, Brain, TrendingUp, Crown } from 'lucide-react';
import Header from '../../components/Header';
import { getLeaderboard, LeaderboardResponse } from '../../services/dsaAnalyticsService';

export default function DSALeaderboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const result = await getLeaderboard(period, 100);
      setData(result);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 px-4 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">DSA Leaderboard</h1>
                </div>
                <p className="text-gray-600">Compete with the best coders</p>
              </div>
              
              <button
                onClick={() => navigate('/dsa/dashboard')}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Period Filter */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Time Period:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriod('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    period === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setPeriod('month')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    period === 'month'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setPeriod('week')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    period === 'week'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  This Week
                </button>
              </div>
            </div>
          </div>

          {/* Your Rank Card */}
          {data?.user_rank && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Your Rank</p>
                  <p className="text-4xl font-bold">#{data.user_rank}</p>
                  <p className="text-blue-100 text-sm mt-2">
                    Out of {data.total_users} participants
                  </p>
                </div>
                <Award className="w-16 h-16 opacity-80" />
              </div>
            </div>
          )}

          {/* Top 3 Podium */}
          {data && data.leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <div className="pt-8">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 text-center border-2 border-gray-300 shadow-lg">
                  <Medal className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-gray-700 mb-1">2nd</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{data.leaderboard[1].username}</p>
                  <p className="text-xs text-gray-600 mt-1">{data.leaderboard[1].score} points</p>
                  <p className="text-xs text-gray-500 mt-1">{data.leaderboard[1].solved_count} solved</p>
                </div>
              </div>

              {/* 1st Place */}
              <div>
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-6 text-center border-2 border-yellow-400 shadow-xl">
                  <Crown className="w-16 h-16 text-yellow-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-yellow-700 mb-1">1st</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{data.leaderboard[0].username}</p>
                  <p className="text-xs text-gray-700 mt-1">{data.leaderboard[0].score} points</p>
                  <p className="text-xs text-gray-600 mt-1">{data.leaderboard[0].solved_count} solved</p>
                  {data.leaderboard[0].current_streak > 0 && (
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-medium text-orange-600">{data.leaderboard[0].current_streak} day streak</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3rd Place */}
              <div className="pt-8">
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-6 text-center border-2 border-orange-300 shadow-lg">
                  <Medal className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-orange-700 mb-1">3rd</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{data.leaderboard[2].username}</p>
                  <p className="text-xs text-gray-600 mt-1">{data.leaderboard[2].score} points</p>
                  <p className="text-xs text-gray-500 mt-1">{data.leaderboard[2].solved_count} solved</p>
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Rankings
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {data?.leaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-l-4 ${getRankBg(entry.rank)}`}
                >
                  {/* Rank */}
                  <div className="w-12 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{entry.username}</p>
                    <p className="text-xs text-gray-500 truncate">{entry.email}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-purple-600">
                        <Trophy className="w-4 h-4" />
                        <span className="text-sm font-bold">{entry.score}</span>
                      </div>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1 text-green-600">
                        <Code2 className="w-4 h-4" />
                        <span className="text-sm font-bold">{entry.solved_count}</span>
                      </div>
                      <p className="text-xs text-gray-500">Solved</p>
                    </div>

                    {entry.current_streak > 0 && (
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-orange-600">
                          <Flame className="w-4 h-4" />
                          <span className="text-sm font-bold">{entry.current_streak}</span>
                        </div>
                        <p className="text-xs text-gray-500">Streak</p>
                      </div>
                    )}

                    {entry.ai_usage_count > 0 && (
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-blue-600">
                          <Brain className="w-4 h-4" />
                          <span className="text-sm font-bold">{entry.ai_usage_count}</span>
                        </div>
                        <p className="text-xs text-gray-500">AI Used</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {data && data.leaderboard.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No rankings yet</p>
                <p className="text-sm text-gray-500 mt-2">Be the first to solve problems!</p>
                <button
                  onClick={() => navigate('/dsa')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start Practicing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
