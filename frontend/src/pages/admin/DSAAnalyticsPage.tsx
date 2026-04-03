import { useState, useEffect } from 'react';
import { 
  BarChart3, Users, CheckCircle2, TrendingUp, 
  Code2, Target, Activity, Award, Brain 
} from 'lucide-react';
import Header from '../../components/Header';
import { getDSAAnalytics, getAIAnalytics, DSAAnalytics, AIAnalytics } from '../../services/dsaAnalyticsService';

export default function DSAAnalyticsPage() {
  const [dsaStats, setDsaStats] = useState<DSAAnalytics | null>(null);
  const [aiStats, setAiStats] = useState<AIAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dsa' | 'ai'>('dsa');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [dsa, ai] = await Promise.all([
        getDSAAnalytics(),
        getAIAnalytics()
      ]);
      setDsaStats(dsa);
      setAiStats(ai);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 px-4 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
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
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">DSA Analytics</h1>
            </div>
            <p className="text-gray-600">Monitor DSA module usage and performance</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 p-2 mb-6 shadow-sm inline-flex gap-2">
            <button
              onClick={() => setActiveTab('dsa')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dsa'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Code2 className="w-4 h-4 inline mr-2" />
              DSA Stats
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'ai'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Brain className="w-4 h-4 inline mr-2" />
              AI Usage
            </button>
          </div>

          {/* DSA Analytics Tab */}
          {activeTab === 'dsa' && dsaStats && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <Code2 className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold text-gray-900">{dsaStats.total_submissions}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Total Submissions</p>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-gray-900">{dsaStats.accepted_submissions}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Accepted</p>
                  <p className="text-xs text-green-600 mt-1">{dsaStats.acceptance_rate}% rate</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-purple-600" />
                    <span className="text-2xl font-bold text-gray-900">{dsaStats.total_users}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Total Users</p>
                  <p className="text-xs text-purple-600 mt-1">{dsaStats.active_users_week} active this week</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8 text-orange-600" />
                    <span className="text-2xl font-bold text-gray-900">{dsaStats.active_users_today}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Active Today</p>
                  <p className="text-xs text-orange-600 mt-1">Currently practicing</p>
                </div>
              </div>

              {/* Most Attempted & Solved */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Most Attempted Questions
                  </h2>
                  <div className="space-y-3">
                    {dsaStats.most_attempted_questions.slice(0, 5).map((q, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{q.title}</p>
                          <p className="text-xs text-gray-500">{q.slug}</p>
                        </div>
                        <span className="text-sm font-bold text-blue-600">{q.attempts}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Most Solved Questions
                  </h2>
                  <div className="space-y-3">
                    {dsaStats.most_solved_questions.slice(0, 5).map((q, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{q.title}</p>
                          <p className="text-xs text-gray-500">{q.slug}</p>
                        </div>
                        <span className="text-sm font-bold text-green-600">{q.solved_count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Topic Usage & Difficulty Success */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-purple-600" />
                    Topic Usage
                  </h2>
                  <div className="space-y-3">
                    {dsaStats.topic_usage.map((topic, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{topic.topic}</span>
                          <span className="text-xs text-gray-500">{topic.solved}/{topic.attempts}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${(topic.solved / topic.attempts) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    Difficulty Success Rate
                  </h2>
                  <div className="space-y-4">
                    {dsaStats.difficulty_success_rate.map((diff, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900">{diff.difficulty}</span>
                          <span className="text-lg font-bold text-orange-600">{diff.success_rate}%</span>
                        </div>
                        <p className="text-xs text-gray-600">{diff.solved} solved out of {diff.total} attempts</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Top Performers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dsaStats.top_performers.map((user, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
                          <p className="text-xs text-gray-600 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-600">Score: <span className="font-bold text-purple-600">{user.score}</span></span>
                        <span className="text-xs text-gray-600">Solved: <span className="font-bold text-green-600">{user.solved}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Analytics Tab */}
          {activeTab === 'ai' && aiStats && (
            <div className="space-y-6">
              {/* AI Usage Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                  <Brain className="w-8 h-8 mb-4 opacity-80" />
                  <p className="text-3xl font-bold mb-1">{aiStats.total_ai_requests}</p>
                  <p className="text-purple-100 text-sm">Total AI Requests</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                  <Code2 className="w-8 h-8 mb-4 opacity-80" />
                  <p className="text-3xl font-bold mb-1">{aiStats.solution_requests}</p>
                  <p className="text-blue-100 text-sm">Solution Requests</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                  <TrendingUp className="w-8 h-8 mb-4 opacity-80" />
                  <p className="text-3xl font-bold mb-1">{aiStats.hint_requests}</p>
                  <p className="text-green-100 text-sm">Hint Requests</p>
                </div>
              </div>

              {/* AI Action Breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Action Breakdown</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{aiStats.hint_requests}</p>
                    <p className="text-xs text-gray-600 mt-1">Hints</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{aiStats.explain_requests}</p>
                    <p className="text-xs text-gray-600 mt-1">Explanations</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{aiStats.solution_requests}</p>
                    <p className="text-xs text-gray-600 mt-1">Solutions</p>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">{aiStats.explain_code_requests}</p>
                    <p className="text-xs text-gray-600 mt-1">Code Explains</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{aiStats.fix_code_requests}</p>
                    <p className="text-xs text-gray-600 mt-1">Code Fixes</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Most Common Action: <span className="font-bold text-purple-600">{aiStats.most_common_action}</span>
                  </p>
                </div>
              </div>

              {/* AI Usage by Question & User */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Usage by Question</h2>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {aiStats.ai_usage_by_question.slice(0, 10).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{item.question_slug}</p>
                          <p className="text-xs text-gray-500">{item.action_type}</p>
                        </div>
                        <span className="text-sm font-bold text-purple-600">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Top AI Users</h2>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {aiStats.ai_usage_by_user.slice(0, 10).map((user, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {idx + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{user.username}</span>
                        </div>
                        <span className="text-sm font-bold text-purple-600">{user.requests}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
