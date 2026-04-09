import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Play, Zap, Crown, X, Lock, TrendingUp, Clock, FileText, Award, Target, Brain, MessageSquare, Code } from 'lucide-react'
import Header from '../../components/Header'
import { EXAM_CONFIG, calculateDuration } from '../../config/examConfig'
import { api } from '../../api/client'
import { useAppStore } from '../../store/useAppStore'

type Difficulty = 'Easy' | 'Medium' | 'Hard'

type ExamConfig = {
  company: string
  category: string
  difficulty: Difficulty
  questionCount: number
  durationMinutes: number
}

// Company data with question counts from database
const companies: Array<{ id: string; description: string; count: number; popular?: boolean }> = [
  {
    id: 'TCS',
    description: 'TCS placement aptitude questions',
    count: 1852,
    popular: true,
  },
  {
    id: 'Infosys',
    description: 'Infosys aptitude and reasoning set',
    count: 1509,
  },
  {
    id: 'Wipro',
    description: 'Wipro placement questions',
    count: 1232,
  },
  {
    id: 'Cognizant',
    description: 'Cognizant aptitude questions',
    count: 1239,
  },
  {
    id: 'Accenture',
    description: 'Accenture placement pattern',
    count: 1228,
  },
  {
    id: 'HCL',
    description: 'HCL aptitude questions',
    count: 1229,
  },
  {
    id: 'Capgemini',
    description: 'Capgemini placement questions',
    count: 1246,
  },
  {
    id: 'Deloitte',
    description: 'Deloitte aptitude questions',
    count: 1231,
  },
  {
    id: 'LTIMindtree',
    description: 'LTIMindtree placement questions',
    count: 1234,
  },
]

// Category descriptions and icons mapping
const categoryDescriptions: Record<string, { description: string; icon: any; color: string }> = {
  'Quantitative Aptitude': {
    description: 'Mathematical and numerical reasoning questions',
    icon: Target,
    color: 'blue',
  },
  'Logical Reasoning': {
    description: 'Pattern recognition and logical thinking problems',
    icon: Brain,
    color: 'purple',
  },
  'Verbal Ability': {
    description: 'Language comprehension and verbal reasoning',
    icon: MessageSquare,
    color: 'green',
  },
  'Technical Aptitude': {
    description: 'Technical concepts and problem-solving questions',
    icon: Code,
    color: 'orange',
  },
  'Data Interpretation': {
    description: 'Analyze and interpret data from charts and tables',
    icon: TrendingUp,
    color: 'pink',
  },
}

export default function ExamPrepPage() {
  const navigate = useNavigate()
  const user = useAppStore((state) => state.user)

  const [selectedCompany, setSelectedCompany] = useState(companies[0].id)
  const [categories, setCategories] = useState<Array<{ id: string; label: string; description: string }>>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium' as Difficulty)
  const [loading, setLoading] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [limitInfo, setLimitInfo] = useState<{ exams_taken: number; limit: number } | null>(null)
  const [categoryLimits, setCategoryLimits] = useState<Record<string, { count: number; locked: boolean }>>({})

  const questionCount = EXAM_CONFIG.QUESTION_LIMIT
  const durationMinutes = calculateDuration(questionCount)

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await api.get('/aptitude/categories')
        const fetchedCategories = response.data || []
        
        // Transform categories into the format needed
        const formattedCategories = fetchedCategories.map((cat: string) => ({
          id: cat,
          label: cat,
          description: categoryDescriptions[cat]?.description || `${cat} questions`,
        }))
        
        setCategories(formattedCategories)
        
        // Set first category as default
        if (formattedCategories.length > 0) {
          setSelectedCategory(formattedCategories[0].id)
        }

        // Fetch exam history to check limits for each category
        try {
          const historyResponse = await api.get('/aptitude/history')
          const history = historyResponse.data || []
          
          // Count exams per category
          const limits: Record<string, { count: number; locked: boolean }> = {}
          formattedCategories.forEach((cat: { id: string }) => {
            const count = history.filter((exam: any) => exam.category === cat.id).length
            limits[cat.id] = {
              count,
              locked: count >= 2  // FREE users limited to 2
            }
          })
          setCategoryLimits(limits)
        } catch (error) {
          console.error('Failed to fetch exam limits:', error)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        // Fallback to default categories
        const fallbackCategories = [
          {
            id: 'Quantitative Aptitude',
            label: 'Quantitative Aptitude',
            description: 'Mathematical and numerical reasoning questions',
          },
          {
            id: 'Logical Reasoning',
            label: 'Logical Reasoning',
            description: 'Pattern recognition and logical thinking problems',
          },
          {
            id: 'Verbal Ability',
            label: 'Verbal Ability',
            description: 'Language comprehension and verbal reasoning',
          },
          {
            id: 'Technical Aptitude',
            label: 'Technical Aptitude',
            description: 'Technical concepts and problem-solving questions',
          },
        ]
        setCategories(fallbackCategories)
        setSelectedCategory('Quantitative Aptitude')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleStart = async () => {
    // PRO users can always start exams
    const isPro = user?.plan?.toLowerCase() === 'pro'
    
    // Check if category is locked (only for non-PRO users)
    if (!isPro && categoryLimits[selectedCategory]?.locked) {
      setLimitInfo({
        exams_taken: categoryLimits[selectedCategory].count,
        limit: 2
      })
      setShowUpgradeModal(true)
      return
    }

    // Proceed to start exam
    const config: ExamConfig = {
      company: selectedCompany,
      category: selectedCategory,
      difficulty,
      questionCount: questionCount,
      durationMinutes: durationMinutes,
    }

    navigate('/exam-live', {
      state: {
        config,
      },
    })
  }

  const UpgradeModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="relative w-full max-w-md rounded-3xl border border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-8 shadow-2xl">
        <button
          onClick={() => setShowUpgradeModal(false)}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-4">
            <Crown className="h-12 w-12 text-white" />
          </div>
        </div>

        <h2 className="mb-3 text-center text-2xl font-black text-gray-900">
          Upgrade to Pro
        </h2>

        <p className="mb-6 text-center text-gray-600">
          You've reached the free limit of <strong>{limitInfo?.limit || 2} exams</strong> for this category.
          <br />
          <span className="text-sm text-gray-500">
            ({limitInfo?.exams_taken || 0}/{limitInfo?.limit || 2} exams taken)
          </span>
        </p>

        <div className="mb-6 space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
            <p className="text-sm text-gray-700">
              <strong>Unlimited</strong> aptitude tests
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
            <p className="text-sm text-gray-700">
              <strong>No repeat</strong> questions - fresh tests every time
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
            <p className="text-sm text-gray-700">
              <strong>Advanced</strong> analytics and insights
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
            <p className="text-sm text-gray-700">
              <strong>Priority</strong> AI support
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowUpgradeModal(false)}
            className="flex-1 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Maybe Later
          </button>
          <button
            onClick={() => navigate('/pricing')}
            className="flex-1 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 px-6 py-3 font-bold text-white shadow-lg hover:from-yellow-600 hover:to-orange-700"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header />

      {showUpgradeModal && <UpgradeModal />}

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-24 pb-16">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 mb-4">
            <Award className="h-4 w-4" />
            <span>12,000+ Questions from Top Companies</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-4">
            Crack Top Company
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Aptitude Tests
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Practice with real company patterns. Get instant results. Track your progress.
          </p>

          {/* Stats Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <div className="text-2xl sm:text-3xl font-black text-blue-600">12K+</div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium">Questions</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <div className="text-2xl sm:text-3xl font-black text-purple-600">9</div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium">Companies</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <div className="text-2xl sm:text-3xl font-black text-green-600">5</div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium">Categories</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <div className="text-2xl sm:text-3xl font-black text-orange-600">3</div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium">Difficulty Levels</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Selection */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Choose Company</h2>
                <span className="text-sm text-slate-500">{companies.length} companies</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map((company) => {
                  const selected = company.id === selectedCompany
                  return (
                    <button
                      key={company.id}
                      onClick={() => setSelectedCompany(company.id)}
                      className={`relative rounded-2xl border-2 p-5 text-left transition-all hover:scale-105 ${
                        selected
                          ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-200/50'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      {company.popular && (
                        <span className="absolute -top-2 -right-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
                          <Zap className="h-3 w-3" />
                          Popular
                        </span>
                      )}
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-lg font-black text-slate-900">{company.id}</p>
                        {selected && (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mb-3">{company.description}</p>
                      <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                        <FileText className="h-3.5 w-3.5" />
                        {company.count.toLocaleString()} questions
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Category Selection */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Choose Category</h2>
                <span className="text-sm text-slate-500">{categories.length} categories</span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {categories.map((category) => {
                    const selected = category.id === selectedCategory
                    const limitData = categoryLimits[category.id]
                    const isPro = user?.plan?.toLowerCase() === 'pro'
                    const isLocked = !isPro && (limitData?.locked || false)
                    const examCount = limitData?.count || 0
                    const categoryInfo = categoryDescriptions[category.id] || { icon: Target, color: 'blue', description: category.description }
                    const Icon = categoryInfo.icon
                    
                    const colorClasses = {
                      blue: 'from-blue-500 to-blue-600',
                      purple: 'from-purple-500 to-purple-600',
                      green: 'from-green-500 to-green-600',
                      orange: 'from-orange-500 to-orange-600',
                      pink: 'from-pink-500 to-pink-600',
                    }[categoryInfo.color] || 'from-blue-500 to-blue-600'
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          if (isLocked) {
                            setLimitInfo({
                              exams_taken: examCount,
                              limit: 2
                            })
                            setShowUpgradeModal(true)
                          } else {
                            setSelectedCategory(category.id)
                          }
                        }}
                        className={`relative rounded-2xl border-2 p-5 text-left transition-all hover:scale-105 ${
                          isLocked
                            ? 'border-gray-300 bg-gray-50 opacity-60 cursor-not-allowed'
                            : selected
                            ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-200/50'
                            : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 rounded-xl bg-gradient-to-br ${colorClasses} p-3 text-white shadow-lg`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-slate-900 mb-1">{category.label}</p>
                            <p className="text-xs text-slate-600 mb-2">{categoryInfo.description}</p>
                            {isLocked && (
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600">
                                <Lock className="h-3.5 w-3.5" />
                                Limit reached ({examCount}/2)
                              </div>
                            )}
                            {!isLocked && examCount > 0 && !isPro && (
                              <p className="text-xs font-semibold text-blue-600">
                                {examCount}/2 exams used
                              </p>
                            )}
                          </div>
                          {!isLocked && selected && (
                            <span className="flex-shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Difficulty Selection */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Select Difficulty</h2>
              <div className="grid grid-cols-3 gap-4">
                {(['Easy', 'Medium', 'Hard'] as const).map((level) => {
                  const selected = difficulty === level
                  const colors = {
                    Easy: { bg: 'from-green-500 to-emerald-600', text: 'text-green-700', border: 'border-green-600', badge: 'bg-green-100' },
                    Medium: { bg: 'from-yellow-500 to-orange-600', text: 'text-orange-700', border: 'border-orange-600', badge: 'bg-orange-100' },
                    Hard: { bg: 'from-red-500 to-rose-600', text: 'text-red-700', border: 'border-red-600', badge: 'bg-red-100' },
                  }[level]
                  
                  return (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`relative rounded-2xl border-2 p-5 text-center transition-all hover:scale-105 ${
                        selected
                          ? `${colors.border} bg-gradient-to-br from-white to-slate-50 shadow-lg`
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <div className={`mx-auto mb-3 h-12 w-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                        {level[0]}
                      </div>
                      <p className={`text-sm font-bold ${selected ? colors.text : 'text-slate-900'}`}>{level}</p>
                      {selected && (
                        <span className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </section>
          </div>

          {/* Right Column - Test Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Test Summary Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold">Test Summary</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <Award className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 mb-1">Company</p>
                      <p className="text-sm font-bold">{selectedCompany}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <Target className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 mb-1">Category</p>
                      <p className="text-sm font-bold">{categories.find((item) => item.id === selectedCategory)?.label || 'Select category'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 mb-1">Difficulty</p>
                      <p className="text-sm font-bold">{difficulty}</p>
                    </div>
                  </div>

                  <div className="h-px bg-white/10 my-4"></div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-400">Questions</span>
                    </div>
                    <span className="text-lg font-black">{questionCount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-400">Duration</span>
                    </div>
                    <span className="text-lg font-black">{durationMinutes} mins</span>
                  </div>
                </div>

                <button
                  onClick={handleStart}
                  disabled={loading || !selectedCategory}
                  className="mt-8 w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-base font-bold text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Play className="h-5 w-5" />
                  Start Test Now
                  <Zap className="h-5 w-5" />
                </button>

                <p className="mt-4 text-xs text-center text-slate-400">
                  Full screen mode required · No tab switching
                </p>
              </div>

              {/* Pro Features Card */}
              {user?.plan?.toLowerCase() !== 'pro' && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-6 border-2 border-yellow-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    <h3 className="text-sm font-bold text-slate-900">Upgrade to Pro</h3>
                  </div>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Unlimited tests</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:from-yellow-600 hover:to-orange-700 transition-all"
                  >
                    Upgrade Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
