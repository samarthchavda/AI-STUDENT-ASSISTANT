import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  BookOpen,
  Code2,
  MessageSquare,
  FileText,
  CreditCard,
  Target,
  Trophy,
  TrendingUp,
  Clock,
  Award,
  Lock,
  Sparkles,
  ChevronRight,
  X,
  BookOpenCheck,
  Activity,
  Menu,
  Flame,
  Zap,
  type LucideIcon
} from 'lucide-react'
import Header from '../../components/Header'
import { useAppStore } from '../../store/useAppStore'
import { getDashboardStats, getStreakData, DashboardStats, StreakData } from '../../services/dsaAnalyticsService'

interface SidebarItem {
  id: string
  label: string
  icon: LucideIcon
  route: string
}

interface StatCard {
  label: string
  value: string | number
  icon: LucideIcon
  color: string
}

interface PracticeCard {
  id: string
  title: string
  description: string
  badge: string
  badgeColor: string
  route: string
  icon: LucideIcon
  isFree: boolean
  usageText?: string
}

interface MockTestCard {
  id: string
  company: string
  title: string
  description: string
  difficulty: string
  duration: string
  route: string
  icon: LucideIcon
  isPremium: boolean
  usedAttempts?: number
  totalAttempts?: number
}

interface ActivityItem {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  iconClass: string
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Mini Sparkline Component
const Sparkline = ({ color }: { color: string }) => {
  const points = [40, 45, 42, 50, 48, 55, 52, 60]
  const max = Math.max(...points)
  const normalized = points.map(p => (p / max) * 20)
  
  return (
    <svg width="60" height="24" className="absolute bottom-2 right-2 opacity-40">
      <polyline
        points={normalized.map((y, i) => `${i * 8.5},${24 - y}`).join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function DashboardPageNew() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [activeSidebar, setActiveSidebar] = useState('dashboard')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showCopilot, setShowCopilot] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [userStats, setUserStats] = useState({
    mockTestsTaken: 0,
    placementReadiness: 0,
    resumeScore: 0
  })
  const [dsaStats, setDsaStats] = useState<DashboardStats | null>(null)
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [loadingDSA, setLoadingDSA] = useState(true)
  const [examAttempts, setExamAttempts] = useState<Record<string, number>>({})
  const [examUnlockStatus, setExamUnlockStatus] = useState<Record<string, boolean>>({})

  // Load exam history and stats on mount
  useEffect(() => {
    loadExamHistory()
    loadDSAStats()
    loadExamAttempts()
    loadExamUnlockStatus()
  }, [])

  const loadExamAttempts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('No token available, skipping exam attempts load')
        return
      }
      
      const response = await fetch('/api/aptitude/attempts-by-company', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const attempts = await response.json()
        console.log('📊 Loaded exam attempts by company:', attempts)
        setExamAttempts(attempts)
      } else {
        console.log('Failed to load exam attempts:', response.status)
      }
    } catch (error) {
      console.error('Failed to load exam attempts:', error)
    }
  }

  const loadExamUnlockStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch('/api/aptitude/company-exam-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const status = await response.json()
        const unlockMap: Record<string, boolean> = {}
        Object.keys(status).forEach(key => {
          unlockMap[key] = status[key].is_unlocked
        })
        setExamUnlockStatus(unlockMap)
      }
    } catch (error) {
      console.error('Failed to load exam unlock status:', error)
    }
  }

  const loadDSAStats = async () => {
    try {
      const [stats, streak] = await Promise.all([
        getDashboardStats(),
        getStreakData()
      ])
      setDsaStats(stats)
      setStreakData(streak)
    } catch (error) {
      console.error('Failed to load DSA stats:', error)
    } finally {
      setLoadingDSA(false)
    }
  }

  const loadExamHistory = async () => {
    setLoadingActivities(true)
    try {
      const token = localStorage.getItem('token')
      
      // Debug: Log current user info
      console.log('🔐 Loading data for user:', {
        userId: user?.id,
        email: user?.email,
        name: user?.name,
        hasToken: !!token
      })
      
      const response = await fetch('/api/aptitude/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const aptitudeHistory = await response.json()
        
        // Debug: Log fetched data
        console.log('📊 Fetched exam history:', {
          count: aptitudeHistory.length,
          firstExam: aptitudeHistory[0],
          userId: user?.id
        })
        
        // Calculate real stats from user data
        const mockTests = aptitudeHistory.length
        const avgScore = aptitudeHistory.length > 0 
          ? aptitudeHistory.reduce((sum: number, exam: any) => sum + exam.score_percent, 0) / aptitudeHistory.length 
          : 0
        
        setUserStats({
          mockTestsTaken: mockTests,
          placementReadiness: Math.round(avgScore),
          resumeScore: 0 // TODO: Fetch from resume API when available
        })
        
        // Convert to activity items
        const activityItems: ActivityItem[] = aptitudeHistory.slice(0, 10).map((exam: any) => ({
          id: `aptitude-${exam.id}`,
          title: `${exam.category} Test`,
          subtitle: `Score: ${exam.score_percent}% • ${exam.correct_answers}/${exam.total_questions} correct • ${new Date(exam.completed_at).toLocaleDateString()}`,
          icon: BookOpen,
          iconClass: 'bg-blue-50 border-blue-200 text-blue-600'
        }))
        
        setActivities(activityItems)
      } else {
        console.error('❌ Failed to load history:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to load exam history:', error)
    } finally {
      setLoadingActivities(false)
    }
  }

  // Sidebar navigation items
  const sidebarItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, route: '/dashboard' },
    { id: 'dsa', label: 'DSA Practice', icon: Code2, route: '/dsa' },
    { id: 'aptitude', label: 'Aptitude', icon: BookOpen, route: '/exam-prep' },
    { id: 'copilot', label: 'AI Copilot', icon: MessageSquare, route: '/chat' },
    { id: 'resume', label: 'Resume', icon: FileText, route: '/career' },
    { id: 'billing', label: 'Billing', icon: CreditCard, route: '/pricing' }
  ]

  // Stats cards - Now using real user data
  const stats: StatCard[] = [
    { label: 'Placement Readiness', value: `${userStats.placementReadiness}%`, icon: Trophy, color: 'text-green-600' },
    { label: 'Mock Tests Taken', value: userStats.mockTestsTaken, icon: Target, color: 'text-blue-600' },
    { label: 'Resume ATS Score', value: userStats.resumeScore > 0 ? `${userStats.resumeScore}/100` : 'Not Created', icon: FileText, color: 'text-purple-600' }
  ]

  // Free Practice Cards
  const practiceCards: PracticeCard[] = [
    {
      id: 'free-aptitude',
      title: 'Unlimited Free Practice',
      description: 'Practice unlimited aptitude questions with instant explanations. No time limits!',
      badge: '100% FREE',
      badgeColor: 'bg-green-100 text-green-700',
      route: '/practice-aptitude',
      icon: Sparkles,
      isFree: true,
      usageText: 'Unlimited Questions Available'
    }
  ]

  // Mock Test Cards - Now using real user-specific attempt data and admin unlock status
  const mockTests: MockTestCard[] = [
    {
      id: 'tcs-nqt',
      company: 'TCS',
      title: 'TCS NQT Mock Test',
      description: 'Complete mock test with Quantitative, Logical & Verbal sections',
      difficulty: 'Medium',
      duration: '90 mins',
      route: '/exam-simulation?company=TCS',
      icon: Award,
      isPremium: user?.plan?.toLowerCase() === 'free',
      usedAttempts: examAttempts['tcs'] || 0,
      totalAttempts: 2
    },
    {
      id: 'infosys',
      company: 'Infosys',
      title: 'Infosys Placement Test',
      description: 'Aptitude + Reasoning + Verbal Ability mock test',
      difficulty: 'Medium',
      duration: '75 mins',
      route: '/exam-simulation?company=Infosys',
      icon: Award,
      isPremium: user?.plan?.toLowerCase() === 'free',
      usedAttempts: examAttempts['infosys'] || 0,
      totalAttempts: 2
    },
    {
      id: 'wipro',
      company: 'Wipro',
      title: 'Wipro NLTH Mock Test',
      description: 'National Level Talent Hunt pattern questions',
      difficulty: 'Easy',
      duration: '60 mins',
      route: '/exam-simulation?company=Wipro',
      icon: Award,
      isPremium: user?.plan?.toLowerCase() === 'free',
      usedAttempts: examAttempts['wipro'] || 0,
      totalAttempts: 2
    },
    {
      id: 'amazon',
      company: 'Amazon',
      title: 'Amazon SDE Assessment',
      description: 'DSA coding questions + aptitude for SDE role',
      difficulty: 'Hard',
      duration: '120 mins',
      route: '/exam-simulation?company=Amazon',
      icon: Award,
      isPremium: user?.plan?.toLowerCase() === 'free',
      usedAttempts: examAttempts['amazon'] || 0,
      totalAttempts: 2
    },
    {
      id: 'microsoft',
      company: 'Microsoft',
      title: 'Microsoft SDE Mock',
      description: 'Coding + System Design + Aptitude assessment',
      difficulty: 'Hard',
      duration: '150 mins',
      route: '/exam-simulation?company=Microsoft',
      icon: Award,
      isPremium: user?.plan?.toLowerCase() === 'free',
      usedAttempts: examAttempts['microsoft'] || 0,
      totalAttempts: 2
    },
    {
      id: 'google',
      company: 'Google',
      title: 'Google STEP Mock',
      description: 'Student Training in Engineering Program assessment',
      difficulty: 'Hard',
      duration: '180 mins',
      route: '/exam-simulation?company=Google',
      icon: Award,
      isPremium: user?.plan?.toLowerCase() === 'free',
      usedAttempts: examAttempts['google'] || 0,
      totalAttempts: 2
    }
  ].filter(test => {
    // Filter out locked exams based on admin settings
    const companyKey = test.company.toLowerCase()
    return examUnlockStatus[companyKey] !== false // Show if unlocked or status not loaded yet
  })

  const handleMockTestClick = (test: MockTestCard) => {
    // Check if user has exceeded free attempts
    if (test.isPremium && test.usedAttempts! >= test.totalAttempts!) {
      setShowUpgradeModal(true)
      return
    }
    navigate(test.route)
  }

  const UpgradeModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={() => setShowUpgradeModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upgrade to Pro
          </h2>
          <p className="text-gray-600 mb-6">
            You've used all your free attempts for this test. Upgrade to Pro for unlimited mock tests!
          </p>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Pro Plan Benefits:</h3>
            <ul className="text-sm text-gray-700 space-y-1 text-left">
              <li>✅ Unlimited mock tests for all companies</li>
              <li>✅ Detailed performance analytics</li>
              <li>✅ Priority AI support</li>
              <li>✅ Resume review by experts</li>
              <li>✅ Interview preparation resources</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={() => {
                setShowUpgradeModal(false)
                navigate('/pricing')
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const CopilotFAB = () => (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setShowCopilot(!showCopilot)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Mini Copilot Window */}
      {showCopilot && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <span className="font-semibold">AI Copilot</span>
            </div>
            <button
              onClick={() => setShowCopilot(false)}
              className="text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="text-center text-gray-600 text-sm">
              <p className="mb-4">Quick AI assistance for your placement prep!</p>
              <button
                onClick={() => navigate('/chat')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open Full Copilot
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <Header />

      <div className="flex pt-20">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden fixed bottom-6 left-6 z-40 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <aside className="fixed top-20 left-0 bottom-0 w-64 bg-gray-50 border-r border-gray-100 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Navigation
                  </h2>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 hover:bg-gray-200 rounded">
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeSidebar === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSidebar(item.id)
                          if (item.route) navigate(item.route)
                          setMobileMenuOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>
            </aside>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="w-64 bg-gray-50 border-r border-gray-100 min-h-screen sticky top-20 hidden lg:block">
          <div className="p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Navigation
            </h2>
            <nav className="space-y-1">
              {sidebarItems.map((item, index) => {
                const Icon = item.icon
                const isActive = activeSidebar === item.id
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      setActiveSidebar(item.id)
                      if (item.route) navigate(item.route)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </motion.button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Clean Premium Hero Section */}
          <div className="mb-6 relative overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-gray-200 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      Welcome back, {user?.name || 'Student'}! 👋
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Let's crush your placement goals today
                    </p>
                  </div>
                </div>
                
                {/* Plan Badge & Primary CTA */}
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-white rounded-full border border-gray-300 flex items-center gap-2 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span className="font-semibold text-xs uppercase text-gray-700">{user?.plan || 'Free'} Plan</span>
                  </div>
                  {user?.plan?.toLowerCase() === 'free' && (
                    <button
                      onClick={() => navigate('/pricing')}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
                    >
                      Upgrade
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Compact Quick Actions Row */}
          <div className="mb-6 mt-2">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/dsa')}
                className="flex items-center gap-2.5 px-5 py-3 bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-xl text-sm font-semibold text-gray-700 hover:text-purple-700 transition-all shadow-sm hover:shadow"
              >
                <Code2 className="w-4 h-4" />
                Practice DSA
              </button>
              <button
                onClick={() => navigate('/practice-aptitude')}
                className="flex items-center gap-2.5 px-5 py-3 bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-xl text-sm font-semibold text-gray-700 hover:text-green-700 transition-all shadow-sm hover:shadow"
              >
                <BookOpen className="w-4 h-4" />
                Aptitude Test
              </button>
              <button
                onClick={() => navigate('/career')}
                className="flex items-center gap-2.5 px-5 py-3 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl text-sm font-semibold text-gray-700 hover:text-blue-700 transition-all shadow-sm hover:shadow"
              >
                <FileText className="w-4 h-4" />
                Resume Builder
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="flex items-center gap-2.5 px-5 py-3 bg-white hover:bg-pink-50 border border-gray-200 hover:border-pink-300 rounded-xl text-sm font-semibold text-gray-700 hover:text-pink-700 transition-all shadow-sm hover:shadow"
              >
                <MessageSquare className="w-4 h-4" />
                AI Copilot
              </button>
            </div>
          </div>

          {/* Today's Focus Card - More Compact */}
          <div className="mb-6">
            <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                    🎯 Today's Focus
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {dsaStats?.total_solved === 0 
                      ? "Start your DSA journey! Solve your first problem today."
                      : streakData?.current_streak === 0
                      ? "Keep your streak alive! Solve a problem to continue your momentum."
                      : userStats.resumeScore === 0
                      ? "Build your resume to unlock ATS score and stand out to recruiters."
                      : "Great progress! Continue practicing to improve your placement readiness."}
                  </p>
                  <button
                    onClick={() => {
                      if (dsaStats?.total_solved === 0 || streakData?.current_streak === 0) {
                        navigate('/dsa')
                      } else if (userStats.resumeScore === 0) {
                        navigate('/career')
                      } else {
                        navigate('/practice-aptitude')
                      }
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-2"
                  >
                    Take Action
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Stats Grid - Cleaner Design */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon
              const iconColors = {
                'text-green-600': { bg: 'bg-green-100', iconColor: 'text-green-600', stroke: '#16a34a' },
                'text-blue-600': { bg: 'bg-blue-100', iconColor: 'text-blue-600', stroke: '#2563eb' },
                'text-purple-600': { bg: 'bg-purple-100', iconColor: 'text-purple-600', stroke: '#9333ea' },
                'text-orange-600': { bg: 'bg-orange-100', iconColor: 'text-orange-600', stroke: '#ea580c' }
              }
              const colorConfig = iconColors[stat.color as keyof typeof iconColors]
              
              return (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all relative overflow-hidden group cursor-pointer"
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-11 h-11 rounded-lg ${colorConfig.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${colorConfig.iconColor}`} />
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">+{5 + index * 2}%</span>
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                    <div className="text-xs text-gray-500 mt-1">This week</div>
                  </div>
                  
                  {/* Sparkline */}
                  <Sparkline color={colorConfig.stroke} />
                </motion.div>
              )
            })}
          </motion.div>

          {/* DSA Progress Section - Enhanced */}
          {!loadingDSA && dsaStats && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Code2 className="w-6 h-6 text-purple-600" />
                  DSA Practice Progress
                </h2>
                <button
                  onClick={() => navigate('/dsa')}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Practice DSA
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                {/* Total Solved */}
                <motion.div
                  variants={fadeInUp}
                  className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Trophy className="w-8 h-8 opacity-80" />
                    <TrendingUp className="w-5 h-5 opacity-60" />
                  </div>
                  <div className="text-4xl font-bold mb-1">{dsaStats.total_solved}</div>
                  <div className="text-green-100 text-sm">Problems Solved</div>
                  <div className="mt-3 text-xs text-green-100">
                    {dsaStats.easy_solved}E • {dsaStats.medium_solved}M • {dsaStats.hard_solved}H
                  </div>
                </motion.div>

                {/* Current Streak */}
                <motion.div
                  variants={fadeInUp}
                  className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Flame className="w-8 h-8 opacity-80" />
                    <Zap className="w-5 h-5 opacity-60" />
                  </div>
                  <div className="text-4xl font-bold mb-1">{streakData?.current_streak || 0}</div>
                  <div className="text-orange-100 text-sm">Day Streak</div>
                  <div className="mt-3 text-xs text-orange-100">
                    Longest: {streakData?.longest_streak || 0} days
                  </div>
                </motion.div>

                {/* Total Score */}
                <motion.div
                  variants={fadeInUp}
                  className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Award className="w-8 h-8 opacity-80" />
                    <TrendingUp className="w-5 h-5 opacity-60" />
                  </div>
                  <div className="text-4xl font-bold mb-1">{dsaStats.total_score}</div>
                  <div className="text-purple-100 text-sm">Total Score</div>
                  <div className="mt-3 text-xs text-purple-100">
                    {dsaStats.acceptance_rate}% acceptance rate
                  </div>
                </motion.div>

                {/* Leaderboard Rank */}
                <motion.div
                  variants={fadeInUp}
                  onClick={() => navigate('/dsa/leaderboard')}
                  className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Target className="w-8 h-8 opacity-80" />
                    <ChevronRight className="w-5 h-5 opacity-60" />
                  </div>
                  <div className="text-4xl font-bold mb-1">{dsaStats.total_submissions}</div>
                  <div className="text-blue-100 text-sm">Total Submissions</div>
                  <div className="mt-3 text-xs text-blue-100">
                    View Leaderboard →
                  </div>
                </motion.div>
              </div>

              {/* Recent Solved Problems - Enhanced with Compact Empty State */}
              {dsaStats.recent_solved && dsaStats.recent_solved.length > 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-600" />
                    Recently Solved
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dsaStats.recent_solved.slice(0, 6).map((problem, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate(`/dsa/problem/${problem.slug}`)}
                        className="p-3 bg-gray-50 hover:bg-green-50 rounded-lg border border-gray-200 hover:border-green-300 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900 truncate flex-1 group-hover:text-green-700">
                            {problem.title}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                            problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Trophy className="w-3 h-3 text-green-600" />
                          <p className="text-xs text-gray-500">
                            {problem.solved_at ? new Date(problem.solved_at).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/dsa/dashboard')}
                    className="mt-4 w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    View Full DSA Dashboard
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="bg-purple-50 rounded-xl border border-purple-200 p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Code2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Start Your DSA Journey!</h3>
                  <p className="text-sm text-gray-600 mb-4">Solve your first problem and begin building your coding skills</p>
                  <button
                    onClick={() => navigate('/dsa')}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-all inline-flex items-center gap-2"
                  >
                    Start Practicing
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* DSA Loading State */}
          {loadingDSA && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <Code2 className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">DSA Practice Progress</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Continue Where You Left Off Section - More Compact */}
          {activities.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Continue Where You Left Off
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activities.slice(0, 3).map((activity) => {
                  const ActivityIcon = activity.icon
                  return (
                    <div
                      key={activity.id}
                      className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl p-4 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${activity.iconClass} group-hover:scale-105 transition-transform`}>
                          <ActivityIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 mb-0.5 truncate">{activity.title}</p>
                          <p className="text-xs text-gray-600 line-clamp-2">{activity.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Practice & Exam Arena */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Practice & Exam Arena
            </h2>

            {/* Free Practice Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                Unlimited Free Practice
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {practiceCards.map((card) => {
                  const Icon = card.icon
                  return (
                    <motion.div
                      key={card.id}
                      variants={fadeInUp}
                      className="relative bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 rounded-2xl border-2 border-green-300 p-6 hover:shadow-2xl transition-all overflow-hidden"
                      style={{
                        backgroundImage: 'radial-gradient(at 20% 30%, rgba(16, 185, 129, 0.15) 0px, transparent 50%), radial-gradient(at 80% 70%, rgba(59, 130, 246, 0.15) 0px, transparent 50%)'
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">
                              {card.title}
                            </h4>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${card.badgeColor} mt-1`}>
                              {card.badge}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{card.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700 font-medium">
                          {card.usageText}
                        </span>
                        <button
                          onClick={() => navigate(card.route)}
                          className="relative px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 overflow-hidden group"
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                          <span className="relative">Start Free Practice</span>
                          <ChevronRight className="w-4 h-4 relative" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Premium Mock Tests Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Premium Exam Mock Tests
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {mockTests.map((test, index) => {
                  const Icon = test.icon
                  const isLocked = test.isPremium && test.usedAttempts! >= test.totalAttempts!
                  const remainingAttempts = test.totalAttempts! - test.usedAttempts!
                  const isPro = user?.plan?.toLowerCase() === 'pro'

                  return (
                    <motion.div
                      key={test.id}
                      variants={fadeInUp}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all relative"
                    >
                      {isLocked && (
                        <div className="absolute top-4 right-4">
                          <Lock className="w-5 h-5 text-gray-400" />
                        </div>
                      )}

                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          {/* Lock icon on company logo for non-PRO users */}
                          {!isPro && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center">
                              <Lock className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-purple-600 uppercase flex items-center gap-1">
                            {test.company}
                          </div>
                          <h4 className="font-bold text-gray-900">{test.title}</h4>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{test.description}</p>

                      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {test.difficulty}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {test.duration}
                        </span>
                      </div>

                      {test.isPremium && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Free Attempts</span>
                            <span className={`font-semibold ${isLocked ? 'text-red-600' : 'text-blue-600'}`}>
                              {test.usedAttempts}/{test.totalAttempts}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(test.usedAttempts! / test.totalAttempts!) * 100}%` }}
                              transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                              className={`h-2 rounded-full ${isLocked ? 'bg-red-500' : 'bg-blue-600'}`}
                            ></motion.div>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => handleMockTestClick(test)}
                        className={`w-full px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                          isLocked
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:scale-105'
                        }`}
                        disabled={isLocked}
                      >
                        {isLocked ? (
                          <>
                            <Lock className="w-4 h-4" />
                            Upgrade to Unlock
                          </>
                        ) : (
                          <>
                            Take Mock Test
                            {remainingAttempts > 0 && test.isPremium && (
                              <span className="text-xs">({remainingAttempts} left)</span>
                            )}
                          </>
                        )}
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity Section - Cleaner */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Recent Activity
              </h2>
              <button
                onClick={() => navigate('/aptitude-history')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all"
              >
                <BookOpenCheck className="w-4 h-4" />
                View All
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              {loadingActivities ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 animate-pulse"
                    >
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">No activity yet</h3>
                  <p className="text-sm text-gray-600 mb-4">Start practicing to see your progress here</p>
                  <button
                    onClick={() => navigate('/practice-aptitude')}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all inline-flex items-center gap-2"
                  >
                    Start Practice
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {activities.map((activity) => {
                    const ActivityIcon = activity.icon
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all group"
                      >
                        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${activity.iconClass} group-hover:scale-105 transition-transform`}>
                          <ActivityIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 mb-0.5">{activity.title}</p>
                          <p className="text-xs text-gray-600">{activity.subtitle}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Floating Copilot */}
      <CopilotFAB />

      {/* Upgrade Modal */}
      {showUpgradeModal && <UpgradeModal />}
    </div>
  )
}
