import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Clock3 } from 'lucide-react'

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
  correctAnswer?: number  // Optional, only available after submission
  explanation?: string
}

type LiveExamState = {
  config: ExamConfig
}

export default function ExamSimulationPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state as LiveExamState | null
  const config = state?.config

  const [questions, setQuestions] = useState<LiveQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})  // Changed to string (answer text)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState((config?.durationMinutes || 15) * 60)
  const [tabWarnings, setTabWarnings] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [pauseReason, setPauseReason] = useState('')
  const [sessionId, setSessionId] = useState<string>('')  // Store session ID

  const startTimeRef = useRef<number>(Date.now())
  const submittedRef = useRef(false)

  const requestExamFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return false

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      }
      return true
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    if (!config) {
      navigate('/exam-prep', { replace: true })
      return
    }

    const fetchQuestions = async () => {
      try {
        setIsLoading(true)
        setError('')

        // Fetch real questions from database
        const params = new URLSearchParams({
          company: config.company,
          difficulty: config.difficulty,
          limit: config.questionCount.toString()
        })

        const token = localStorage.getItem('token')
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        const fullUrl = `${apiBaseUrl}/api/aptitude/test?${params}`
        
        console.log('Fetching questions from:', fullUrl)
        console.log('Config:', config)
        
        const response = await fetch(fullUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          if (response.status === 403) {
            // Subscription limit reached
            const errorData = await response.json()
            if (errorData.detail?.error === 'subscription_limit_reached') {
              // Redirect to pricing page with message
              navigate('/pricing', {
                state: {
                  message: errorData.detail.message,
                  from: 'exam-prep'
                }
              })
              return
            }
          }
          
          const errorText = await response.text()
          console.error('API Error:', errorText)
          throw new Error('Failed to fetch questions')
        }

        const data = await response.json()
        const rawQuestions = Array.isArray(data?.questions) ? data.questions : []

        if (rawQuestions.length === 0) {
          setError('No questions available for this configuration. Please try different settings.')
          setIsLoading(false)
          return
        }

        // Transform data to match LiveQuestion format
        const normalized: LiveQuestion[] = rawQuestions.map((item: any) => ({
          id: item.id,
          question: item.question,
          options: Array.isArray(item.options) ? item.options : []
          // Note: correctAnswer and explanation are NOT included (secure mode)
        }))

        setQuestions(normalized)
        setSessionId(data.session_id || '')  // Store session ID
        setTimeLeft(config.durationMinutes * 60)
        startTimeRef.current = Date.now()
      } catch (err) {
        console.error('Error fetching questions:', err)
        setError('Unable to load questions right now. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [config, navigate])

  const totalQuestions = questions.length
  const currentQuestion = questions[currentIndex]
  const isLastQuestion = totalQuestions > 0 && currentIndex === totalQuestions - 1

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch (error) {
        console.error('Error exiting fullscreen:', error)
      }
    }
  }, [])

  const submitExam = useCallback(async () => {
    if (submittedRef.current) return
    submittedRef.current = true

    // Exit fullscreen before navigating
    await exitFullscreen()

    if (!config || questions.length === 0) {
      navigate('/exam-prep', { replace: true })
      return
    }

    try {
      // Prepare answers in the format: { question_id: selected_answer_text or null }
      const answersPayload: Record<number, string | null> = {}
      questions.forEach((question, index) => {
        const selectedOptionText = selectedAnswers[index]
        // Include all questions, use null for skipped
        answersPayload[question.id] = selectedOptionText !== undefined ? selectedOptionText : null
      })

      // Submit to backend for validation using authenticated API client
      const token = localStorage.getItem('token')
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/aptitude/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          answers: answersPayload
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Submit error:', errorData)
        throw new Error(errorData.detail || 'Failed to submit answers')
      }

      const result = await response.json()

      // Transform backend response to match frontend expectations
      const questionsWithAnswers = result.questions.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.options.indexOf(q.correct_answer),
        explanation: q.explanation,
        userAnswer: q.user_answer,
        isCorrect: q.is_correct
      }))

      const takenSeconds = Math.min(
        config.durationMinutes * 60,
        Math.round((Date.now() - startTimeRef.current) / 1000)
      )

      navigate('/exam-result', {
        replace: true,
        state: {
          config,
          questions: questionsWithAnswers,
          selectedAnswers: selectedAnswers,
          metrics: {
            correct: result.correct,
            wrong: result.wrong,
            skipped: result.skipped,
            scorePercent: result.score_percent,
            timeTakenSeconds: takenSeconds,
            totalTimeSeconds: config.durationMinutes * 60,
          },
        },
      })
    } catch (error) {
      console.error('Error submitting exam:', error)
      setError('Failed to submit exam. Please try again.')
      submittedRef.current = false
    }
  }, [config, exitFullscreen, navigate, questions, selectedAnswers, sessionId])

  useEffect(() => {
    if (isLoading || questions.length === 0 || isPaused) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          submitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isLoading, isPaused, questions.length, submitExam])

  useEffect(() => {
    if (isLoading || questions.length === 0 || submittedRef.current) return

    let mounted = true

    const startFocusMode = async () => {
      const entered = await requestExamFullscreen()
      if (mounted && !entered) {
        setIsPaused(true)
        setPauseReason('Full screen is required to continue the exam.')
      }
    }

    startFocusMode()

    return () => {
      mounted = false
    }
  }, [isLoading, questions.length, requestExamFullscreen])

  useEffect(() => {
    if (isLoading || questions.length === 0 || submittedRef.current) return

    const handleVisibilityChange = () => {
      if (!document.hidden || submittedRef.current) return

      setTabWarnings((prev) => {
        const nextWarnings = prev + 1
        window.alert('Warning: Tab switching is not allowed')

        if (nextWarnings >= 2) {
          submitExam()
        }

        return nextWarnings
      })
    }

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const hasModifier = event.ctrlKey || event.metaKey
      if (hasModifier && ['c', 'v', 'u'].includes(key)) {
        event.preventDefault()
      }
    }

    const handleFullscreenChange = () => {
      if (submittedRef.current) return
      if (!document.fullscreenElement) {
        setIsPaused(true)
        setPauseReason('Exam paused because full screen was exited. Resume to continue.')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [isLoading, questions.length, submitExam])

  const handleResumeExam = async () => {
    const entered = await requestExamFullscreen()
    if (!entered) {
      setPauseReason('Please allow full screen to resume the exam.')
      return
    }

    setPauseReason('')
    setIsPaused(false)
  }

  if (!config) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Step 2 · Live Exam</p>
          <h1 className="mt-3 text-2xl font-bold">Preparing your assessment…</h1>
        </div>
      </div>
    )
  }

  if (error || !currentQuestion) {
    return (
      <div className="min-h-screen bg-white px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-sm font-semibold text-red-600">{error || 'No question found'}</p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/exam-prep')}
              className="rounded-xl border border-slate-200 px-5 py-2.5 font-semibold text-slate-700"
            >
              Back to Setup
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const criticalTime = timeLeft <= 120

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-semibold text-slate-600">
              Step 2 · Live Exam · {config.company}
            </p>
            <p className="text-sm font-semibold text-slate-600">
              Question {currentIndex + 1} of {totalQuestions}
            </p>
            {tabWarnings > 0 && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                Warnings: {tabWarnings}/2
              </p>
            )}
            <div
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-bold ${
                criticalTime
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <Clock3 className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-5xl flex-col px-6 py-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-7 md:p-9">
          <h1 className="text-2xl font-black leading-relaxed text-slate-900">{currentQuestion.question}</h1>

          <div className="mt-7 grid gap-4">
            {currentQuestion.options.map((option, optionIndex) => {
              const selected = selectedAnswers[currentIndex] === option
              return (
                <button
                  key={`${currentQuestion.id}-${optionIndex}`}
                  onClick={() => setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: option }))}
                  className={`rounded-2xl border p-4 text-left text-base font-semibold transition ${
                    selected
                      ? 'border-blue-600 bg-blue-50 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50/40'
                  }`}
                >
                  <span className="mr-2 font-bold text-slate-500">{String.fromCharCode(65 + optionIndex)}.</span>
                  {option}
                </button>
              )
            })}
          </div>
        </section>

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <button
            onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            Skip
          </button>

          <button
            onClick={() => {
              if (isLastQuestion) {
                submitExam()
                return
              }
              setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))
            }}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {isLastQuestion ? 'Save & Finish' : 'Save & Next'}
          </button>
        </footer>
      </main>

      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Focus Mode</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Exam Paused</h2>
            <p className="mt-3 text-sm text-slate-600">{pauseReason || 'Resume full screen mode to continue.'}</p>
            <button
              onClick={handleResumeExam}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Resume Exam
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
