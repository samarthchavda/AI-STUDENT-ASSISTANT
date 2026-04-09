import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import { cleanQuestionText } from './utils/textCleaners'

type Difficulty = 'Easy' | 'Medium' | 'Hard'

type ExamConfig = {
  company: string
  category: string
  difficulty: Difficulty
  questionCount: number
  durationMinutes: number
}

type LiveQuestion = {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  userAnswer?: string
  isCorrect?: boolean
}

type ResultState = {
  config: ExamConfig
  questions: LiveQuestion[]
  selectedAnswers: Record<number, string>  // Changed to string
  metrics: {
    correct: number
    wrong: number
    skipped: number
    scorePercent: number
    timeTakenSeconds: number
    totalTimeSeconds: number
  }
}

type CategoryStats = { correct: number; total: number }
type ProgressStats = {
  totalQuizzes: number
  totalCorrect: number
  totalQuestions: number
  categories: Record<string, CategoryStats>
}

const STATS_KEY = 'aptitude_progress'

function loadStats(): ProgressStats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { totalQuizzes: 0, totalCorrect: 0, totalQuestions: 0, categories: {} }
}

function saveStats(stats: ProgressStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

export default function ExamResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showReview, setShowReview] = useState(false)
  const statsSavedRef = useRef(false)

  const result = location.state as ResultState | null

  if (!result?.config || !result?.metrics || !Array.isArray(result?.questions)) {
    navigate('/exam-prep', { replace: true })
    return null
  }

  const { config, questions, selectedAnswers, metrics } = result

  useEffect(() => {
    if (statsSavedRef.current) return

    const stats = loadStats()
    const category = config.category

    if (!stats.categories[category]) {
      stats.categories[category] = { correct: 0, total: 0 }
    }

    stats.totalQuizzes += 1
    stats.totalCorrect += metrics.correct
    stats.totalQuestions += questions.length
    stats.categories[category].correct += metrics.correct
    stats.categories[category].total += questions.length

    saveStats(stats)
    statsSavedRef.current = true
  }, [config.category, metrics.correct, questions.length])

  const categoryStrength = Math.max(0, Math.min(100, metrics.scorePercent))

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      <main className="mx-auto w-full max-w-5xl px-6 pt-24 pb-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Step 3 · Result Dashboard</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Assessment Summary</h1>
          <p className="mt-2 text-slate-600">
            {config.company} · {config.category} · {config.difficulty}
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Score Percentage</p>
            <p className="mt-3 text-4xl font-black text-slate-900">{metrics.scorePercent}%</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Time Taken</p>
            <p className="mt-3 text-4xl font-black text-slate-900">{formatTime(metrics.timeTakenSeconds)}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Questions</p>
            <p className="mt-3 text-2xl font-black text-slate-900">
              {metrics.correct} Correct · {metrics.wrong} Wrong · {metrics.skipped} Skipped
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">Performance Analysis</h2>
            <span className="text-sm font-semibold text-slate-600">Strength in this category: {categoryStrength}%</span>
          </div>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${categoryStrength}%` }} />
          </div>
        </section>

        <section className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setShowReview((prev) => !prev)}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300"
          >
            {showReview ? 'Hide Review' : 'Review Answers'}
          </button>
          <button
            onClick={() => navigate('/exam-prep')}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try Another Quiz
          </button>
        </section>

        {showReview && (
          <section className="mt-6 space-y-4">
            {questions.map((question, index) => {
              const userAnswerText = selectedAnswers[index]
              const isCorrect = question.isCorrect ?? false
              const isSkipped = userAnswerText === undefined

              return (
                <article 
                  key={`${question.id}-${index}`} 
                  className={`rounded-2xl border p-6 ${
                    isSkipped 
                      ? 'border-slate-300 bg-slate-50' 
                      : isCorrect 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-500">Question {index + 1}</p>
                      <h3 className="mt-2 text-lg font-bold text-slate-900">{cleanQuestionText(question.question)}</h3>
                    </div>
                    <span 
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        isSkipped 
                          ? 'bg-slate-200 text-slate-700' 
                          : isCorrect 
                          ? 'bg-green-600 text-white' 
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {isSkipped ? 'Skipped' : isCorrect ? 'Correct' : 'Wrong'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {question.options.map((option, optionIndex) => {
                      const isSelectedOption = userAnswerText === option
                      const isCorrectOption = question.correctAnswer === optionIndex

                      return (
                        <div
                          key={optionIndex}
                          className={`rounded-xl border p-3 ${
                            isCorrectOption
                              ? 'border-green-600 bg-green-100'
                              : isSelectedOption
                              ? 'border-red-600 bg-red-100'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            <span className={`flex-1 ${
                              isCorrectOption || isSelectedOption ? 'font-semibold' : ''
                            }`}>
                              {cleanQuestionText(option)}
                            </span>
                            {isCorrectOption && (
                              <span className="text-xs font-bold text-green-700">✓ Correct</span>
                            )}
                            {isSelectedOption && !isCorrectOption && (
                              <span className="text-xs font-bold text-red-700">✗ Your Answer</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {question.explanation && (
                    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Explanation</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">{cleanQuestionText(question.explanation)}</p>
                    </div>
                  )}
                </article>
              )
            })}
          </section>
        )}
      </main>
    </div>
  )
}
