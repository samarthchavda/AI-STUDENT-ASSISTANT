import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  BookOpen,
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
  type LucideIcon
} from 'lucide-react'
import Header from '../../components/Header'
import { useAppStore } from '../../store/useAppStore'

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

export default function DashboardPageNew() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [activeSidebar, setActiveSidebar] = useState('dashboard')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showCopilot, setShowCopilot] = useState(false)
  const [examAttempts, setExamAttempts] = useState<Record<string, number>>({})

  // Load exam attempts on mount
  useEffect(() => {
    loadExamAttempts()
  }, [])

  const loadExamAttempts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/aptitude/attempts-by-company`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const attempts = await response.json()
        console.log('📊 Loaded exam attempts by company:', attempts)
        setExamAttempts(attempts)
      }
    } catch (error) {
      console.error('Failed to load exam attempts:', error)
    }
  }

  // Sidebar navigation items
  const sidebarItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, route: '/dashboard' },
    { id: 'aptitude', label: 'Aptitude', icon: BookOpen, route: '/exam-prep' },
    { id: 'copilot', label: 'AI Copilot', icon: MessageSquare, route: '/chat' },
    { id: 'resume', label: 'Resume', icon: FileText, route: '/career' },
    { id: 'billing', label: 'Billing', icon: CreditCard, route: '/pricing' }
  ]

  // Stats cards
  const stats: StatCard[] = [
    { label: 'Placement Readiness', value: '75%', icon: Trophy, color: 'text-green-600' },
    { label: 'Mock Tests Taken', value: '12', icon: Target, color: 'text-blue-600' },
    { label: 'Resume ATS Score', value: '85/100', icon: FileText, color: 'text-purple-600' }
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

  // Mock Test Cards - Now using real user-specific attempt data
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
  ]

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

      <div className="flex pt-16">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-16 hidden lg:block">
          <div className="p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Navigation
            </h2>
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
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
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

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || 'Student'}! 👋
            </h1>
            <p className="text-gray-600">
              Your Placement Command Center - Track progress, practice, and ace your interviews
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>

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
                    <div
                      key={card.id}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
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
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                        >
                          Start Free Practice
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockTests.map((test) => {
                  const Icon = test.icon
                  const isLocked = test.isPremium && test.usedAttempts! >= test.totalAttempts!
                  const remainingAttempts = test.totalAttempts! - test.usedAttempts!

                  return (
                    <div
                      key={test.id}
                      className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all relative"
                    >
                      {isLocked && (
                        <div className="absolute top-4 right-4">
                          <Lock className="w-5 h-5 text-gray-400" />
                        </div>
                      )}

                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-purple-600 uppercase">
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
                            <div
                              className={`h-2 rounded-full ${isLocked ? 'bg-red-500' : 'bg-blue-600'}`}
                              style={{ width: `${(test.usedAttempts! / test.totalAttempts!) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => handleMockTestClick(test)}
                        className={`w-full px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                          isLocked
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
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
                    </div>
                  )
                })}
              </div>
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
