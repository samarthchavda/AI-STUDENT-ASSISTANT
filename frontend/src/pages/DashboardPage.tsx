import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Brain, BookOpen, Code, Briefcase, Users, TrendingUp, 
  Target, CheckCircle2, Clock, Award, ArrowRight, Sparkles,
  FileText
} from 'lucide-react'
import Header from '../components/Header'
import { useAppStore } from '../store/useAppStore'
import { userAPI } from '../api/client'

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useAppStore((state) => state.user)
  const [stats, setStats] = useState({
    placementReadiness: 0,
    mockTestsAttempted: 0,
    resumeATSScore: 0,
    status: 'Active'
  })
  const [targetCompany, setTargetCompany] = useState('TCS NQT')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data: any = await userAPI.getUserStats()
        
        // Calculate placement readiness based on activity
        const readiness = Math.min(100, Math.floor(
          (data.mockTestsAttempted || 0) * 10 + 
          (data.resumeATSScore || 0) * 0.5 + 
          (data.questionsAsked || 0) * 0.2
        ))
        
        setStats({
          placementReadiness: readiness || 0,
          mockTestsAttempted: data.mockTestsAttempted || 0,
          resumeATSScore: data.resumeATSScore || 0,
          status: data.status || 'Active'
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        setStats({
          placementReadiness: 0,
          mockTestsAttempted: 0,
          resumeATSScore: 0,
          status: 'Active'
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchStats()
      // Load saved target company
      const saved = localStorage.getItem('targetCompany')
      if (saved) setTargetCompany(saved)
    } else {
      setLoading(false)
    }
  }, [user])

  const handleTargetCompanyChange = (company: string) => {
    setTargetCompany(company)
    localStorage.setItem('targetCompany', company)
  }

  const targetCompanies = [
    'TCS NQT',
    'Infosys',
    'Wipro',
    'Cognizant',
    'Accenture',
    'Amazon',
    'Google',
    'Microsoft',
    'Other'
  ]

  const placementTools = [
    {
      title: 'Placement Copilot',
      description: 'AI assistant for placement doubts',
      icon: Brain,
      color: 'from-blue-600 to-purple-600',
      path: '/chat',
      badge: 'Smart AI'
    },
    {
      title: 'Aptitude Tests',
      description: 'Practice quantitative & logical reasoning',
      icon: BookOpen,
      color: 'from-teal-600 to-emerald-600',
      path: '/exam-prep',
      badge: '15 Questions'
    },
    {
      title: 'Coding Practice',
      description: 'DSA problems & debugging help',
      icon: Code,
      color: 'from-orange-600 to-red-600',
      path: '/coding-help',
      badge: 'DSA Focus'
    },
    {
      title: 'Resume Builder',
      description: 'ATS score & job matching',
      icon: FileText,
      color: 'from-emerald-600 to-teal-600',
      path: '/career',
      badge: 'ATS Ready'
    },
    {
      title: 'Mock Interview',
      description: '4-round company simulation',
      icon: Users,
      color: 'from-indigo-600 to-blue-600',
      path: '/company-prep',
      badge: 'Live Practice'
    },
    {
      title: 'Career Guidance',
      description: 'Job search & interview prep',
      icon: Briefcase,
      color: 'from-violet-600 to-purple-600',
      path: '/career',
      badge: 'Expert Tips'
    }
  ]

  const quickActions = [
    {
      title: `${targetCompany} Pattern Test`,
      subtitle: 'Company-specific aptitude',
      icon: Target,
      action: () => navigate('/exam-prep')
    },
    {
      title: 'Daily 15-Min DSA Challenge',
      subtitle: 'Quick coding practice',
      icon: Code,
      action: () => navigate('/coding-help')
    },
    {
      title: 'Check Resume ATS Score',
      subtitle: 'Get instant feedback',
      icon: CheckCircle2,
      action: () => navigate('/career')
    }
  ]

  const placementStats = [
    {
      title: 'Placement Readiness',
      value: `${stats.placementReadiness}%`,
      icon: Target,
      color: 'text-green-600',
      subtitle: 'Based on your activity'
    },
    {
      title: 'Mock Tests Attempted',
      value: stats.mockTestsAttempted,
      icon: BookOpen,
      color: 'text-blue-600',
      subtitle: 'Keep practicing!'
    },
    {
      title: 'Resume ATS Score',
      value: stats.resumeATSScore > 0 ? `${stats.resumeATSScore}/100` : 'Not checked',
      icon: FileText,
      color: 'text-purple-600',
      subtitle: 'Upload to check'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Target Company */}
        <div className="glass-effect rounded-3xl p-8 mb-8 border border-white/20">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">
                  Placement Dashboard
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name || 'Student'}! 👋
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Your one-stop platform for placement preparation
              </p>
              
              {/* Target Company Selector */}
              <div className="flex items-center gap-3 mt-4">
                <span className="text-sm font-semibold text-gray-700">🎯 Targeting:</span>
                <select
                  value={targetCompany}
                  onChange={(e) => handleTargetCompanyChange(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {targetCompanies.map((company) => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="glass-effect rounded-2xl px-6 py-4 border border-primary-200">
                <div className="text-sm text-gray-600 mb-1">Current Plan</div>
                <div className="text-2xl font-bold gradient-text capitalize">
                  {user?.plan || 'Free'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Placement Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {placementStats.map((stat, index) => (
            <div key={index} className="glass-effect rounded-2xl p-6 border border-white/20 hover:border-primary-300 transition-all">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? '...' : stat.value}
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-1">{stat.title}</div>
              <div className="text-xs text-gray-500">{stat.subtitle}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="glass-effect rounded-2xl p-6 border border-white/20 hover:border-primary-300 transition-all hover:scale-105 text-left group"
              >
                <action.icon className="w-8 h-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
                <div className="font-semibold text-gray-900 mb-1">{action.title}</div>
                <div className="text-sm text-gray-600">{action.subtitle}</div>
                <ArrowRight className="w-5 h-5 text-primary-600 mt-2 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* Placement Tools */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-primary-600" />
            Placement Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {placementTools.map((tool, index) => (
              <Link
                key={index}
                to={tool.path}
                className="glass-effect rounded-2xl p-6 border border-white/20 hover:border-primary-300 transition-all hover:scale-105 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-100 text-primary-700">
                    {tool.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{tool.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                <div className="flex items-center text-primary-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  Get Started <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 glass-effect rounded-3xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Pro Tips for Placement Success</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-900">Practice Daily</div>
                <div className="text-sm text-gray-600">Solve at least 2 DSA problems every day</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-900">Update Resume</div>
                <div className="text-sm text-gray-600">Keep your resume ATS-friendly and updated</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-900">Mock Interviews</div>
                <div className="text-sm text-gray-600">Practice with our AI interviewer weekly</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-900">Track Progress</div>
                <div className="text-sm text-gray-600">Monitor your improvement over time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
