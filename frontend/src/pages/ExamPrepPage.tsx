import { useState, useEffect, useRef } from 'react'
import { Brain, CheckCircle, XCircle, RefreshCw, Clock, Target, TrendingUp, Award } from 'lucide-react'
import { examAPI } from '../api/client'
import Header from '../components/Header'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  userAnswer?: number
}

interface CategoryStats { correct: number; total: number }
interface ProgressStats {
  totalQuizzes: number
  totalCorrect: number
  totalQuestions: number
  categories: Record<string, CategoryStats>
}

const TIMER_SECONDS = 15 * 60
const STATS_KEY = 'aptitude_progress'

function loadStats(): ProgressStats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { totalQuizzes: 0, totalCorrect: 0, totalQuestions: 0, categories: {} }
}
function saveStats(s: ProgressStats) { localStorage.setItem(STATS_KEY, JSON.stringify(s)) }

export default function ExamPrepPage() {
  const [selectedCompany, setSelectedCompany] = useState('General Practice')
  const [category, setCategory] = useState('quantitative')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [timeTaken, setTimeTaken] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [progress, setProgress] = useState<ProgressStats>(loadStats)

  // Refs to avoid stale closures in async callbacks
  const questionsRef = useRef<Question[]>([])
  const categoryRef = useRef(category)
  const startTimeRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const submittedRef = useRef(false)

  useEffect(() => { questionsRef.current = questions }, [questions])
  useEffect(() => { categoryRef.current = category }, [category])

  const numQuestions = 15
  
  const companies = [
    { id: 'General Practice', name: 'General Practice', badge: 'Default' },
    { id: 'TCS NQT', name: 'TCS NQT', badge: 'Official Pattern' },
    { id: 'Infosys', name: 'Infosys', badge: 'Official Pattern' },
    { id: 'Wipro', name: 'Wipro', badge: 'Official Pattern' },
    { id: 'Amazon', name: 'Amazon', badge: 'Official Pattern' },
  ]
  
  const companyPatterns: Record<string, { questions: number; minutes: number; description: string }> = {
    'General Practice': { questions: 15, minutes: 15, description: '15 Questions - 15 Minutes' },
    'TCS NQT': { questions: 20, minutes: 25, description: '20 Questions - 25 Minutes (Official TCS Pattern)' },
    'Infosys': { questions: 10, minutes: 10, description: '10 Questions - 10 Minutes (Official Infosys Pattern)' },
    'Wipro': { questions: 16, minutes: 16, description: '16 Questions - 16 Minutes (Official Wipro Pattern)' },
    'Amazon': { questions: 20, minutes: 20, description: '20 Questions - 20 Minutes (Official Amazon Pattern)' },
  }
  
  const categories = [
    { id: 'quantitative', name: 'Quantitative Aptitude', icon: '🔢' },
    { id: 'logical', name: 'Logical Reasoning', icon: '🧩' },
    { id: 'verbal', name: 'Verbal Ability', icon: '📝' },
    { id: 'data', name: 'Data Interpretation', icon: '📊' },
  ]

  const isDifficultyLocked = selectedCompany !== 'General Practice'

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimerActive(false)
  }

  const doSubmit = () => {
    if (submittedRef.current) return
    submittedRef.current = true
    stopTimer()
    const taken = Math.min(TIMER_SECONDS, Math.round((Date.now() - startTimeRef.current) / 1000))
    setTimeTaken(taken)
    const correct = questionsRef.current.filter(q => q.userAnswer === q.correctAnswer).length
    setScore(correct)
    setShowResults(true)

    const catId = categoryRef.current
    const updated = loadStats()
    updated.totalQuizzes += 1
    updated.totalCorrect += correct
    updated.totalQuestions += questionsRef.current.length
    if (!updated.categories[catId]) updated.categories[catId] = { correct: 0, total: 0 }
    updated.categories[catId].correct += correct
    updated.categories[catId].total += questionsRef.current.length
    saveStats(updated)
    setProgress(updated)
  }

  // Countdown timer
  useEffect(() => {
    if (!timerActive) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          doSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerActive]) // eslint-disable-line react-hooks/exhaustive-deps

  const generateQuestions = async (increaseDifficulty = false, overrideCategory?: string) => {
    stopTimer()
    submittedRef.current = false
    setLoading(true)
    setShowResults(false)
    setCurrentQuestion(0)
    setScore(0)
    setTimeLeft(TIMER_SECONDS)

    let newDifficulty = difficulty
    if (increaseDifficulty && difficulty !== 'hard') {
      newDifficulty = difficulty === 'easy' ? 'medium' : 'hard'
      setDifficulty(newDifficulty)
    }
    const useCategory = overrideCategory ?? category
    if (overrideCategory) { setCategory(overrideCategory); categoryRef.current = overrideCategory }

    try {
      const response = await examAPI.generateMockTest({
        subject: 'Aptitude', topic: useCategory, difficulty: newDifficulty, numQuestions,
      })
      if (response.data.questions) {
        const qs = response.data.questions.map((q: any) => ({ ...q, userAnswer: undefined }))
        setQuestions(qs)
        questionsRef.current = qs
        startTimeRef.current = Date.now()
        setTimerActive(true)
      }
    } catch (error) {
      console.error('Error generating questions:', error)
      alert('Error generating questions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (answerIndex: number) => {
    const updated = [...questions]
    updated[currentQuestion].userAnswer = answerIndex
    setQuestions(updated)
  }

  // Progress helpers
  const avgScore = progress.totalQuestions
    ? Math.round((progress.totalCorrect / progress.totalQuestions) * 100) : 0

  const catName = (id: string) => categories.find(c => c.id === id)?.name ?? id

  const bestCat = () => {
    const entries = Object.entries(progress.categories)
    if (!entries.length) return null
    return entries.reduce((b, cur) => {
      const bp = b[1].total ? b[1].correct / b[1].total : 0
      const cp = cur[1].total ? cur[1].correct / cur[1].total : 0
      return cp > bp ? cur : b
    })
  }
  const weakCat = () => {
    const entries = Object.entries(progress.categories).filter(([, s]) => s.total >= 5)
    if (!entries.length) return null
    return entries.reduce((w, cur) => {
      const wp = w[1].total ? w[1].correct / w[1].total : 1
      const cp = cur[1].total ? cur[1].correct / cur[1].total : 1
      return cp < wp ? cur : w
    })
  }

  const nextCategoryOf = (cur: string) => {
    const order = ['quantitative', 'logical', 'verbal', 'data']
    return order[(order.indexOf(cur) + 1) % order.length]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">
            <span className="gradient-text">Aptitude Preparation</span>
          </h1>
          <p className="text-gray-600">Practice aptitude questions for TCS, Infosys, Wipro, Amazon & Microsoft placements</p>
        </div>

        {questions.length === 0 ? (
          // ── Setup Screen ──────────────────────────────────────────────
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Progress Tracker */}
            {progress.totalQuizzes > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-lg">Your Progress</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-700">{progress.totalQuizzes}</div>
                    <div className="text-xs text-blue-600 mt-1">Quizzes Done</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-700">{avgScore}%</div>
                    <div className="text-xs text-green-600 mt-1">Avg Score</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-xl">
                    <div className="text-sm font-bold text-emerald-700 leading-tight">
                      {bestCat() ? catName(bestCat()![0]).split(' ')[0] : '—'}
                    </div>
                    <div className="text-xs text-emerald-600 mt-1">Best Category</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-xl">
                    <div className="text-sm font-bold text-red-700 leading-tight">
                      {weakCat() ? catName(weakCat()![0]).split(' ')[0] : '—'}
                    </div>
                    <div className="text-xs text-red-600 mt-1">Needs Work</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(progress.categories).map(([id, s]) => (
                    <div key={id}>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{catName(id)}</span>
                        <span>{s.correct}/{s.total} ({s.total ? Math.round(s.correct / s.total * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${s.total ? Math.round(s.correct / s.total * 100) : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Configure Your Test</h2>

              {/* Target Company Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Select Target Company</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {companies.map((comp) => (
                    <button key={comp.id} onClick={() => setSelectedCompany(comp.id)}
                      className={`py-6 px-4 rounded-xl border-2 transition-all relative min-h-[100px] flex flex-col items-center justify-center ${selectedCompany === comp.id ? 'border-primary-600 bg-primary-50 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}>
                      {comp.badge && (
                        <span className={`absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full font-medium ${selectedCompany === comp.id ? 'bg-primary-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
                          {comp.badge}
                        </span>
                      )}
                      <div className="text-base font-semibold text-gray-800">{comp.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Select Category</label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button key={cat.id} onClick={() => setCategory(cat.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${category === cat.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="text-2xl mb-2">{cat.icon}</div>
                      <div className="font-semibold text-sm">{cat.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium">Starting Difficulty Level</label>
                  {isDifficultyLocked && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                      🔒 Locked to Real Exam Pattern
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <button key={level} 
                      onClick={() => !isDifficultyLocked && setDifficulty(level)}
                      disabled={isDifficultyLocked}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                        isDifficultyLocked 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' 
                          : difficulty === level 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-800">
                  <strong>⏱ {companyPatterns[selectedCompany].description}</strong> — Quiz auto-submits when time runs out.
                </p>
              </div>

              <button onClick={() => generateQuestions(false)} disabled={loading}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" /> Generating Questions...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Brain className="w-5 h-5" /> Start {selectedCompany} Quiz
                  </span>
                )}
              </button>
            </div>
          </div>

        ) : showResults ? (
          // ── Results Screen ────────────────────────────────────────────
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
              <h2 className="text-2xl font-bold text-center mb-5">Quiz Results</h2>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="flex justify-center mb-1"><Target className="w-5 h-5 text-blue-600" /></div>
                  <div className="text-2xl font-bold text-blue-700">{score}/{questions.length}</div>
                  <div className="text-xs text-blue-600 mt-1">Score</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="flex justify-center mb-1"><Award className="w-5 h-5 text-green-600" /></div>
                  <div className="text-2xl font-bold text-green-700">{Math.round((score / questions.length) * 100)}%</div>
                  <div className="text-xs text-green-600 mt-1">Accuracy</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="flex justify-center mb-1"><Clock className="w-5 h-5 text-purple-600" /></div>
                  <div className="text-2xl font-bold text-purple-700">{formatTime(timeTaken)}</div>
                  <div className="text-xs text-purple-600 mt-1">Time Taken</div>
                </div>
              </div>

              {/* Performance Message */}
              <div className={`p-3 rounded-lg mb-5 text-sm ${score / questions.length >= 0.8 ? 'bg-green-50 text-green-800' : score / questions.length >= 0.6 ? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-800'}`}>
                <p className="font-semibold text-center">
                  {score / questions.length >= 0.8 ? '🎉 Excellent! Placement ready!' :
                    score / questions.length >= 0.6 ? '👍 Good job! A bit more practice needed.' :
                      '💪 Keep practicing! Review the solutions below.'}
                </p>
              </div>

              {/* Next Quiz Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={() => generateQuestions(difficulty !== 'hard')}
                  className="btn-primary py-3 flex flex-col items-center gap-1 text-sm">
                  <RefreshCw className="w-4 h-4" />
                  <span className="font-semibold">Same Category</span>
                  <span className="text-xs opacity-90">
                    {difficulty === 'easy' ? 'Easy → Medium' : difficulty === 'medium' ? 'Medium → Hard' : 'Hard (Max)'}
                  </span>
                </button>
                <button onClick={() => generateQuestions(false, nextCategoryOf(category))}
                  className="btn-secondary py-3 flex flex-col items-center gap-1 text-sm">
                  <Brain className="w-4 h-4" />
                  <span className="font-semibold">Next Category</span>
                  <span className="text-xs opacity-90">{catName(nextCategoryOf(category)).split(' ')[0]}</span>
                </button>
                <button onClick={() => { setQuestions([]); setShowResults(false) }}
                  className="py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 flex flex-col items-center gap-1 text-sm transition">
                  <Target className="w-4 h-4" />
                  <span className="font-semibold">Choose Category</span>
                  <span className="text-xs text-gray-500">Back to setup</span>
                </button>
              </div>
            </div>

            {/* Detailed Solutions */}
            <h3 className="text-xl font-bold mb-3">Detailed Solutions</h3>
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-start gap-2 mb-3">
                    {q.userAnswer === q.correctAnswer
                      ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-2">Q{idx + 1}. {q.question}</p>
                      <div className="space-y-1.5 mb-3">
                        {q.options.map((option, optIdx) => (
                          <div key={optIdx}
                            className={`p-2 rounded-md border text-sm ${optIdx === q.correctAnswer ? 'border-green-500 bg-green-50' : optIdx === q.userAnswer && q.userAnswer !== q.correctAnswer ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                            <span className="font-medium text-xs">{String.fromCharCode(65 + optIdx)}.</span>{' '}
                            <span className="text-xs">{option}</span>
                            {optIdx === q.correctAnswer && <span className="ml-2 text-green-600 font-semibold text-xs">✓ Correct Answer</span>}
                            {optIdx === q.userAnswer && q.userAnswer !== q.correctAnswer && <span className="ml-2 text-red-600 font-semibold text-xs">✗ Your Answer</span>}
                          </div>
                        ))}
                      </div>
                      <div className="bg-blue-50 border-l-2 border-blue-500 p-2 rounded">
                        <p className="text-xs font-semibold text-blue-900 mb-1">💡 Explanation:</p>
                        <p className="text-xs text-blue-800 leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        ) : (
          // ── Question Screen ───────────────────────────────────────────
          <div className="max-w-4xl mx-auto">
            {/* Progress + Timer */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Question {currentQuestion + 1} of {questions.length}
                  <span className="ml-3 text-gray-400">
                    ({questions.filter(q => q.userAnswer !== undefined).length} answered)
                  </span>
                </span>
                <div className={`flex items-center gap-1.5 font-mono font-bold text-lg px-3 py-1 rounded-lg transition-colors ${timeLeft <= 60 ? 'bg-red-100 text-red-600 animate-pulse' : timeLeft <= 300 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  <Clock className="w-4 h-4" />{formatTime(timeLeft)}
                </div>
              </div>
              {/* Question progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1.5">
                <div className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
              </div>
              {/* Time remaining bar */}
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div className={`h-1 rounded-full transition-all duration-1000 ${timeLeft <= 60 ? 'bg-red-500' : timeLeft <= 300 ? 'bg-yellow-400' : 'bg-green-400'}`}
                  style={{ width: `${(timeLeft / TIMER_SECONDS) * 100}%` }} />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h3 className="text-xl font-bold mb-6">{questions[currentQuestion].question}</h3>
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, idx) => (
                  <button key={idx} onClick={() => handleAnswer(idx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${questions[currentQuestion].userAnswer === idx ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                    <span className="font-semibold text-lg">{String.fromCharCode(65 + idx)}.</span>{' '}
                    <span className="text-lg">{option}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <button onClick={() => setCurrentQuestion(q => q - 1)} disabled={currentQuestion === 0}
                className="btn-secondary flex-1 py-3 disabled:opacity-50">Previous</button>
              {currentQuestion === questions.length - 1 ? (
                <button onClick={() => doSubmit()} className="btn-primary flex-1 py-3">Submit Quiz</button>
              ) : (
                <button onClick={() => setCurrentQuestion(q => q + 1)} className="btn-primary flex-1 py-3">Next</button>
              )}
            </div>

            {/* Question Navigator */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h4 className="font-semibold mb-3">Question Navigator</h4>
              <div className="grid grid-cols-10 gap-2">
                {questions.map((q, idx) => (
                  <button key={idx} onClick={() => setCurrentQuestion(idx)}
                    className={`aspect-square rounded-lg font-semibold text-sm transition-all ${idx === currentQuestion ? 'bg-blue-600 text-white' : q.userAnswer !== undefined ? 'bg-green-100 text-green-700 border-2 border-green-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
