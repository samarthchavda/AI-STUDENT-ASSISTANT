import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Play, Zap, Crown, X, Lock } from 'lucide-react'
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

// All companies now use the same question count from config
const companies: Array<{ id: string; description: string }> = [
  {
    id: 'TCS',
    description: 'TCS placement aptitude questions',
  },
  {
    id: 'Infosys',
    description: 'Infosys aptitude and reasoning set',
  },
  {
    id: 'Wipro',
    description: 'Wipro placement questions',
  },
  {
    id: 'Cognizant',
    description: 'Cognizant aptitude questions',
  },
  {
    id: 'Accenture',
    description: 'Accenture placement pattern',
  },
  {
    id: 'HCL',
    description: 'HCL aptitude questions',
  },
]

// Category descriptions mapping
const categoryDescriptions: Record<string, string> = {
  'Quantitative Aptitude': 'Mathematical and numerical reasoning questions',
  'Logical Reasoning': 'Pattern recognition and logical thinking problems',
  'Verbal Ability': 'Language comprehension and verbal reasoning',
  'Technical Aptitude': 'Technical concepts and problem-solving questions',
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
          description: categoryDescriptions[cat] || `${cat} questions`,
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
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      {showUpgradeModal && <UpgradeModal />}

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 pt-24 pb-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Step 1 · Setup</p>
          <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">Configure Your Aptitude Assessment</h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600">Pick exam pattern, category, and difficulty before starting your live timed test.</p>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Choose Company Pattern</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {companies.map((company) => {
              const selected = company.id === selectedCompany
              return (
                <button
                  key={company.id}
                  onClick={() => setSelectedCompany(company.id)}
                  className={`relative rounded-2xl border p-5 text-left transition ${
                    selected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <p className="text-sm font-bold text-slate-900">{company.id}</p>
                  <p className="mt-1 text-sm text-slate-600">{company.description}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {questionCount} questions · {durationMinutes} mins
                  </p>
                  {selected && (
                    <span className="absolute right-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Choose Category</h2>
          {loading ? (
            <div className="mt-4 flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {categories.map((category) => {
                const selected = category.id === selectedCategory
                const limitData = categoryLimits[category.id]
                const isPro = user?.plan?.toLowerCase() === 'pro'
                const isLocked = !isPro && (limitData?.locked || false)
                const examCount = limitData?.count || 0
                
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
                    className={`relative rounded-2xl border p-5 text-left transition ${
                      isLocked
                        ? 'border-gray-300 bg-gray-50 opacity-60'
                        : selected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">{category.label}</p>
                        <p className="mt-1 text-sm text-slate-600">{category.description}</p>
                        {isLocked && (
                          <p className="mt-2 text-xs font-semibold text-orange-600">
                            🔒 Limit reached ({examCount}/2) - Upgrade to unlock
                          </p>
                        )}
                        {!isLocked && examCount > 0 && !isPro && (
                          <p className="mt-2 text-xs font-semibold text-blue-600">
                            {examCount}/2 exams used
                          </p>
                        )}
                      </div>
                      {isLocked ? (
                        <Lock className="h-5 w-5 flex-shrink-0 text-gray-400" />
                      ) : selected ? (
                        <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : null}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Difficulty Picker</h2>
          <div className="mt-4 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {(['Easy', 'Medium', 'Hard'] as const).map((level) => {
              const selected = difficulty === level
              return (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`rounded-lg px-6 py-2.5 text-sm font-semibold capitalize transition ${
                    selected ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {level}
                </button>
              )
            })}
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Ready Configuration</p>
            <p className="mt-1">
              {selectedCompany} · {categories.find((item) => item.id === selectedCategory)?.label} · {difficulty} ·{' '}
              {questionCount} questions in {durationMinutes} mins
            </p>
          </div>
        </section>

        <div className="mt-10 flex justify-center">
          <button
            onClick={handleStart}
            disabled={loading || !selectedCategory}
            className="inline-flex w-full sm:w-auto sm:min-w-[320px] items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 text-base sm:text-lg font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play className="h-5 w-5" />
            Start Quiz
            <Zap className="h-5 w-5" />
          </button>
        </div>
      </main>
    </div>
  )
}
