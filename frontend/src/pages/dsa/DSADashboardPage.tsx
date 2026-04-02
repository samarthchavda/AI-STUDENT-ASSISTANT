import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dsaAPI, DSAQuestion, DSADashboardStats } from '../../api/client'
import Header from '../../components/Header'
import { Code, Trophy, Target, TrendingUp, Calendar, ChevronRight, Filter, Zap, Brain, Network, Box, List, GitBranch, Hash, Layers, Binary, Shuffle, Search, ArrowUpDown, X } from 'lucide-react'

export default function DSADashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DSADashboardStats | null>(null)
  const [questions, setQuestions] = useState<DSAQuestion[]>([])
  const [dailyChallenge, setDailyChallenge] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Filters
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [topics, setTopics] = useState<any[]>([])
  const [difficulties, setDifficulties] = useState<any[]>([])
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProblems, setTotalProblems] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const problemsPerPage = 20

  useEffect(() => {
    loadData()
  }, [selectedTopic, selectedDifficulty, currentPage])

  const loadData = async () => {
    setLoading(true)
    try {
      const offset = (currentPage - 1) * problemsPerPage
      
      const [statsRes, questionsRes, topicsRes, difficultiesRes, dailyRes] = await Promise.all([
        dsaAPI.getDashboard(),
        dsaAPI.getQuestions({ 
          topic: selectedTopic || undefined, 
          difficulty: selectedDifficulty || undefined,
          limit: problemsPerPage,
          offset: offset
        }),
        dsaAPI.getTopics(),
        dsaAPI.getDifficulties(),
        dsaAPI.getDailyChallenge().catch(() => null)
      ])
      
      console.log('Questions Response:', questionsRes.data)
      
      setStats(statsRes.data)
      setQuestions(questionsRes.data.questions || [])
      setTotalProblems(questionsRes.data.total || 0)
      setHasMore(questionsRes.data.has_more || false)
      setTopics(topicsRes.data.topics || [])
      setDifficulties(difficultiesRes.data.difficulties || [])
      setDailyChallenge(dailyRes?.data)
    } catch (error) {
      console.error('Failed to load DSA data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-emerald-500 bg-emerald-50/50 border-emerald-200/50'
      case 'medium': return 'text-amber-500 bg-amber-50/50 border-amber-200/50'
      case 'hard': return 'text-rose-500 bg-rose-50/50 border-rose-200/50'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getTopicIcon = (topic: string) => {
    const iconMap: { [key: string]: any } = {
      'arrays': Box,
      'strings': List,
      'linked_lists': GitBranch,
      'trees': Network,
      'graphs': Network,
      'dynamic_programming': Brain,
      'greedy': Zap,
      'backtracking': Shuffle,
      'sorting': ArrowUpDown,
      'searching': Search,
      'hashing': Hash,
      'heaps': Layers,
      'tries': Binary,
      'stacks': Layers,
      'queues': List,
      'bit_manipulation': Binary
    }
    return iconMap[topic.toLowerCase()] || Code
  }

  const getCompanyColor = (company: string) => {
    const colors: { [key: string]: string } = {
      'amazon': 'bg-orange-50 text-orange-700 border-orange-200',
      'google': 'bg-blue-50 text-blue-700 border-blue-200',
      'microsoft': 'bg-sky-50 text-sky-700 border-sky-200',
      'facebook': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'apple': 'bg-gray-50 text-gray-700 border-gray-200',
      'netflix': 'bg-red-50 text-red-700 border-red-200',
      'uber': 'bg-slate-50 text-slate-700 border-slate-200',
      'airbnb': 'bg-pink-50 text-pink-700 border-pink-200',
      'tcs': 'bg-purple-50 text-purple-700 border-purple-200',
      'odoo': 'bg-violet-50 text-violet-700 border-violet-200',
      'default': 'bg-gray-50 text-gray-600 border-gray-200'
    }
    return colors[company.toLowerCase()] || colors.default
  }

  const CircularProgress = ({ value, max, color, label }: { value: number; max: number; color: string; label: string }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0
    const circumference = 2 * Math.PI * 45
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative w-32 h-32">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={color}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          <span className="text-xs text-gray-500">{label}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Mesh Gradient Background - Indigo/Blue Theme */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"></div>
        <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Header />
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Mobile Filter Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden fixed bottom-6 left-6 z-40 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        >
          <Filter className="w-6 h-6" />
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            DSA Practice Arena
          </h1>
          <p className="text-gray-600">Master Data Structures & Algorithms for top tech placements</p>
        </div>

        {/* Stats Cards with Circular Progress */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Problems Solved</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_solved}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 font-semibold">{stats.easy_solved}E</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-600 font-semibold">{stats.medium_solved}M</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-600 font-semibold">{stats.hard_solved}H</span>
                  </div>
                </div>
                <Target className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-center">
                <CircularProgress value={stats.accuracy} max={100} color="text-green-500" label="Accuracy" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-center">
                <CircularProgress value={stats.streak_days} max={30} color="text-orange-500" label="Day Streak" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Trophy className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-sm opacity-90 mb-1">Your Rank</p>
              <p className="text-3xl font-bold">#--</p>
              <p className="text-xs opacity-75 mt-2">Keep solving to rank up!</p>
            </div>
          </div>
        )}

        {/* Daily Challenge - Deep Purple/Indigo Glassmorphism */}
        {dailyChallenge && (
          <div className="relative bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 mb-8 border border-indigo-200/50 overflow-hidden">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-purple-600/90 to-blue-600/90 -z-10"></div>
            
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10 flex items-center justify-between text-white">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wider">Daily Challenge</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">{dailyChallenge.title}</h3>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium border border-white/30">
                    {dailyChallenge.topic?.replace('_', ' ')}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium capitalize border border-white/30">
                    {dailyChallenge.difficulty}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/dsa/problem/${dailyChallenge.id}`)}
                className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Solve Now
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Mobile Filter Overlay */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
              <div className="fixed top-20 left-0 bottom-0 w-80 bg-white overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Topic Filter with Icons */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Topic</label>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedTopic('')
                          setCurrentPage(1)
                          setMobileMenuOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          selectedTopic === '' 
                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm' 
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Code className="w-5 h-5" />
                        <span className="font-medium">All Topics</span>
                      </button>
                      {topics.map((topic) => {
                        const Icon = getTopicIcon(topic.value)
                        return (
                          <button
                            key={topic.value}
                            onClick={() => {
                              setSelectedTopic(topic.value)
                              setCurrentPage(1)
                              setMobileMenuOpen(false)
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                              selectedTopic === topic.value
                                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{topic.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Difficulty Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Difficulty</label>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedDifficulty('')
                          setCurrentPage(1)
                          setMobileMenuOpen(false)
                        }}
                        className={`w-full px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                          selectedDifficulty === ''
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        All Levels
                      </button>
                      {difficulties.map((diff) => (
                        <button
                          key={diff.value}
                          onClick={() => {
                            setSelectedDifficulty(diff.value)
                            setCurrentPage(1)
                            setMobileMenuOpen(false)
                          }}
                          className={`w-full px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                            selectedDifficulty === diff.value
                              ? diff.value === 'easy'
                                ? 'bg-emerald-500 text-white'
                                : diff.value === 'medium'
                                ? 'bg-amber-500 text-white'
                                : 'bg-rose-500 text-white'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {diff.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {(selectedTopic || selectedDifficulty) && (
                    <button
                      onClick={() => {
                        setSelectedTopic('')
                        setSelectedDifficulty('')
                        setCurrentPage(1)
                        setMobileMenuOpen(false)
                      }}
                      className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-semibold py-2 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}

                  {/* Weak Topics */}
                  {stats && stats.weak_topics.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        Focus Areas
                      </h4>
                      <div className="space-y-3">
                        {stats.weak_topics.slice(0, 5).map((topic) => (
                          <div key={topic.topic} className="text-sm">
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-700 font-medium capitalize">{topic.topic.replace('_', ' ')}</span>
                              <span className="text-gray-500 text-xs">{topic.solved}/{topic.attempts}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(topic.solved / topic.attempts) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Desktop Sidebar Navigation */}
          <div className="w-72 flex-shrink-0 hidden lg:block">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
              </div>

              {/* Topic Filter with Icons */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Topic</label>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedTopic('')
                      setCurrentPage(1)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      selectedTopic === '' 
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Code className="w-5 h-5" />
                    <span className="font-medium">All Topics</span>
                  </button>
                  {topics.map((topic) => {
                    const Icon = getTopicIcon(topic.value)
                    return (
                      <button
                        key={topic.value}
                        onClick={() => {
                          setSelectedTopic(topic.value)
                          setCurrentPage(1)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          selectedTopic === topic.value
                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{topic.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Difficulty</label>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedDifficulty('')
                      setCurrentPage(1)
                    }}
                    className={`w-full px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedDifficulty === ''
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All Levels
                  </button>
                  {difficulties.map((diff) => (
                    <button
                      key={diff.value}
                      onClick={() => {
                        setSelectedDifficulty(diff.value)
                        setCurrentPage(1)
                      }}
                      className={`w-full px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                        selectedDifficulty === diff.value
                          ? diff.value === 'easy'
                            ? 'bg-emerald-500 text-white'
                            : diff.value === 'medium'
                            ? 'bg-amber-500 text-white'
                            : 'bg-rose-500 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedTopic || selectedDifficulty) && (
                <button
                  onClick={() => {
                    setSelectedTopic('')
                    setSelectedDifficulty('')
                    setCurrentPage(1)
                  }}
                  className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-semibold py-2 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              )}

              {/* Weak Topics */}
              {stats && stats.weak_topics.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    Focus Areas
                  </h4>
                  <div className="space-y-3">
                    {stats.weak_topics.slice(0, 5).map((topic) => (
                      <div key={topic.topic} className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-700 font-medium capitalize">{topic.topic.replace('_', ' ')}</span>
                          <span className="text-gray-500 text-xs">{topic.solved}/{topic.attempts}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(topic.solved / topic.attempts) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Questions Grid - Card Based */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Problems</h2>
                <p className="text-gray-600">
                  Showing {((currentPage - 1) * problemsPerPage) + 1}-{Math.min(currentPage * problemsPerPage, totalProblems)} of {totalProblems} problems
                </p>
                <p className="text-sm text-indigo-600 mt-1 flex items-center gap-1">
                  <ArrowUpDown className="w-4 h-4" />
                  Sorted by difficulty: Easy → Medium → Hard
                </p>
              </div>
              
              {/* Page Info */}
              {totalProblems > problemsPerPage && (
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {Math.ceil(totalProblems / problemsPerPage)}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading problems...</p>
                </div>
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-white/50">
                <Code className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-4">No problems found</p>
                <button
                  onClick={loadData}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
                >
                  Try different filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {questions.map((question) => {
                  const Icon = getTopicIcon(question.topic)
                  return (
                    <div
                      key={question.id}
                      onClick={() => navigate(`/dsa/problem/${question.id}`)}
                      className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-lg">
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {question.title}
                            </h3>
                            <p className="text-sm text-gray-500 capitalize">{question.topic.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </div>

                      {/* Difficulty Badge */}
                      <div className="mb-4">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${getDifficultyColor(question.difficulty)}`}>
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            question.difficulty.toLowerCase() === 'easy' ? 'bg-emerald-500' :
                            question.difficulty.toLowerCase() === 'medium' ? 'bg-amber-500' :
                            'bg-rose-500'
                          }`}></span>
                          {question.difficulty}
                        </span>
                      </div>

                      {/* Company Tags */}
                      {question.company && (
                        <div className="flex flex-wrap gap-2">
                          {question.company.split(',').map((company, idx) => (
                            <span
                              key={idx}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getCompanyColor(company.trim())}`}
                            >
                              {company.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Hover Effect Indicator */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm text-indigo-600 font-semibold">Start Solving</span>
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <ChevronRight className="w-4 h-4 text-indigo-600" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            {/* Pagination Controls */}
            {totalProblems > problemsPerPage && !loading && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200'
                  }`}
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, Math.ceil(totalProblems / problemsPerPage)) }, (_, i) => {
                    const totalPages = Math.ceil(totalProblems / problemsPerPage)
                    let pageNum
                    
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!hasMore}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    !hasMore
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add custom animations to index.css */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
