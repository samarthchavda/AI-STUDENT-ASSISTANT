import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code2, Trophy, Flame, Target, TrendingUp, Clock, 
  CheckCircle2, Zap, Brain, Calendar, Award, BarChart3 
} from 'lucide-react';
import Header from '../../components/Header';
import { getDashboardStats, DashboardStats } from '../../services/dsaAnalyticsService';

export default function DSADashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 px-4 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 px-4 flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Failed to load dashboard</p>
            <button
              onClick={loadDashboard}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">DSA Dashboard</h1>
                </div>
                <p className="text-gray-600">Track your coding progress and achievements</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/dsa')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Practice Problems
                </button>
                <button
                  onClick={() => navigate('/dsa/leaderboard')}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-yellow-600 hover:to-orange-600"
                >
                  <Trophy className="w-4 h-4 inline mr-2" />
                  Leaderboard
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Score */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Trophy className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{stats.total_score}</span>
              </div>
              <p className="text-purple-100 text-sm font-medium">Total Score</p>
              <p className="text-purple-200 text-xs mt-1">
                Rank: #{stats.total_score > 0 ? 'Loading...' : 'N/A'}
              </p>
            </div>

            {/* Current Streak */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Flame className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{stats.current_streak}</span>
              </div>
              <p className="text-orange-100 text-sm font-medium">Current Streak</p>
              <p className="text-orange-200 text-xs mt-1">
                Best: {stats.longest_streak} days
              </p>
            </div>

            {/* Problems Solved */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle2 className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{stats.total_solved}</span>
              </div>
              <p className="text-green-100 text-sm font-medium">Problems Solved</p>
              <p className="text-green-200 text-xs mt-1">
                {stats.total_attempted} attempted
              </p>
            </div>

            {/* Acceptance Rate */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{stats.acceptance_rate}%</span>
              </div>
              <p className="text-blue-100 text-sm font-medium">Acceptance Rate</p>
              <p className="text-blue-200 text-xs mt-1">
                {stats.total_submissions} submissions
              </p>
            </div>
          </div>

          {/* Difficulty Breakdown & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Difficulty Progress */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Progress by Difficulty
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-700">Easy</span>
                    <span className="text-sm font-bold text-green-700">{stats.easy_solved}</span>
                  </div>
                  <div className="w-full bg-green-100 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min((stats.easy_solved / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-yellow-700">Medium</span>
                    <span className="text-sm font-bold text-yellow-700">{stats.medium_solved}</span>
                  </div>
                  <div className="w-full bg-yellow-100 rounded-full h-3">
                    <div 
                      className="bg-yellow-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min((stats.medium_solved / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-700">Hard</span>
                    <span className="text-sm font-bold text-red-700">{stats.hard_solved}</span>
                  </div>
                  <div className="w-full bg-red-100 rounded-full h-3">
                    <div 
                      className="bg-red-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min((stats.hard_solved / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Activity Stats
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <span className="text-xs font-medium text-purple-900">AI Assisted</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">{stats.ai_assisted_submissions}</p>
                  <p className="text-xs text-purple-600 mt-1">
                    {stats.total_submissions > 0 
                      ? Math.round((stats.ai_assisted_submissions / stats.total_submissions) * 100)
                      : 0}% of total
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-medium text-blue-900">Submissions</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{stats.total_submissions}</p>
                  <p className="text-xs text-blue-600 mt-1">Total attempts</p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-orange-600" />
                    <span className="text-xs font-medium text-orange-900">Best Streak</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-700">{stats.longest_streak}</p>
                  <p className="text-xs text-orange-600 mt-1">days</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-medium text-green-900">Score</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{stats.total_score}</p>
                  <p className="text-xs text-green-600 mt-1">points</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recently Solved & Topic Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recently Solved */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                Recently Solved
              </h2>
              
              {stats.recent_solved.length === 0 ? (
                <div className="text-center py-8">
                  <Code2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">No problems solved yet</p>
                  <button
                    onClick={() => navigate('/dsa')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Start Practicing
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recent_solved.map((problem, idx) => (
                    <div 
                      key={idx}
                      onClick={() => navigate(`/dsa/problem/${problem.slug}`)}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{problem.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {problem.solved_at ? new Date(problem.solved_at).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                      <span className={`text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Topic Progress */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Topic Progress
              </h2>
              
              {stats.topic_progress.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 text-sm">No topics attempted yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.topic_progress.slice(0, 6).map((topic, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{topic.topic}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{topic.solved}/{topic.total}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(topic.solved / topic.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
