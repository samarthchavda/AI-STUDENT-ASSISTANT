import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrainCircuit, Building2, ChevronRight, HelpCircle, Landmark, Sparkles, Target, Trophy } from 'lucide-react'
import Header from '../components/Header'
import {
  CompanyPrepEvaluation,
  CompanyPrepMetadata,
  CompanyPrepQuestion,
  CompanyPrepSession,
  PracticeHistoryItem,
  companyPrepAPI,
} from '../api/client'
import { useAppStore } from '../store/useAppStore'

const roleFallbacks = [
  'Software Engineer',
  'Data Analyst',
  'Frontend Developer',
  'Backend Developer',
]

export default function CompanyPrepPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAppStore()

  const [metadata, setMetadata] = useState<CompanyPrepMetadata | null>(null)
  const [selectedCompany, setSelectedCompany] = useState('Microsoft')
  const [selectedRole, setSelectedRole] = useState('Software Engineer')
  const [topQuestions, setTopQuestions] = useState<CompanyPrepQuestion[]>([])
  const [session, setSession] = useState<CompanyPrepSession | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [explanation, setExplanation] = useState<any | null>(null)
  const [evaluation, setEvaluation] = useState<CompanyPrepEvaluation | null>(null)
  const [history, setHistory] = useState<PracticeHistoryItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loadingTopQuestions, setLoadingTopQuestions] = useState(false)
  const [startingSession, setStartingSession] = useState(false)
  const [evaluatingAnswer, setEvaluatingAnswer] = useState(false)
  const [explainingQuestion, setExplainingQuestion] = useState(false)
  const [completedScores, setCompletedScores] = useState<number[]>([])

  const deferredCompany = useDeferredValue(selectedCompany)
  const currentQuestion = session?.questions[currentIndex] ?? null

  const overallSessionScore = useMemo(() => {
    if (completedScores.length === 0) {
      return 0
    }
    return Math.round(completedScores.reduce((sum, score) => sum + score, 0) / completedScores.length)
  }, [completedScores])

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const response = await companyPrepAPI.getMetadata()
        startTransition(() => {
          setMetadata(response.data)
          if (response.data.companies.length > 0) {
            setSelectedCompany((current) => current || response.data.companies[0])
          }
          if (response.data.roles.length > 0) {
            setSelectedRole((current) => current || response.data.roles[0])
          }
        })
      } catch (requestError: any) {
        setError(requestError.response?.data?.detail || 'Failed to load company prep metadata')
      }
    }

    loadMetadata()
  }, [])

  useEffect(() => {
    const loadTopQuestions = async () => {
      if (!deferredCompany) {
        return
      }

      setLoadingTopQuestions(true)
      try {
        const response = await companyPrepAPI.getTopQuestions(deferredCompany)
        setTopQuestions(response.data.questions)
      } catch (requestError: any) {
        setError(requestError.response?.data?.detail || 'Failed to load top company questions')
      } finally {
        setLoadingTopQuestions(false)
      }
    }

    loadTopQuestions()
  }, [deferredCompany])

  useEffect(() => {
    const loadHistory = async () => {
      if (!isAuthenticated) {
        setHistory([])
        return
      }

      try {
        const response = await companyPrepAPI.getHistory(10)
        setHistory(response.data)
      } catch {
        setHistory([])
      }
    }

    loadHistory()
  }, [isAuthenticated])

  const handleStartInterview = async () => {
    setError(null)
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }

    setStartingSession(true)
    try {
      const response = await companyPrepAPI.startSession(selectedCompany, selectedRole, 6)
      startTransition(() => {
        setSession(response.data)
        setCurrentIndex(0)
        setAnswer('')
        setEvaluation(null)
        setExplanation(null)
        setCompletedScores([])
      })
    } catch (requestError: any) {
      if (requestError.response?.status === 401 || requestError.response?.status === 403) {
        navigate('/auth')
        return
      }
      setError(requestError.response?.data?.detail || 'Could not start company interview simulation')
    } finally {
      setStartingSession(false)
    }
  }

  const handleExplainQuestion = async () => {
    if (!currentQuestion) {
      return
    }

    setExplainingQuestion(true)
    try {
      const response = await companyPrepAPI.explainQuestion(currentQuestion.question, selectedCompany, selectedRole)
      setExplanation(response.data.explanation)
    } catch (requestError: any) {
      setError(requestError.response?.data?.detail || 'Could not explain this question')
    } finally {
      setExplainingQuestion(false)
    }
  }

  const handleEvaluateAnswer = async () => {
    if (!currentQuestion || !answer.trim()) {
      return
    }

    setEvaluatingAnswer(true)
    setError(null)
    try {
      const response = await companyPrepAPI.evaluateAnswer({
        company: selectedCompany,
        role: selectedRole,
        question: currentQuestion.question,
        answer,
        round_name: currentQuestion.round_name,
      })

      setEvaluation(response.data)
      setCompletedScores((current) => [...current, response.data.evaluation.score])

      const historyResponse = await companyPrepAPI.getHistory(10)
      setHistory(historyResponse.data)
    } catch (requestError: any) {
      if (requestError.response?.status === 401 || requestError.response?.status === 403) {
        navigate('/auth')
        return
      }
      setError(requestError.response?.data?.detail || 'Could not evaluate your answer')
    } finally {
      setEvaluatingAnswer(false)
    }
  }

  const handleNextQuestion = () => {
    if (!session || currentIndex >= session.questions.length - 1) {
      return
    }

    startTransition(() => {
      setCurrentIndex((index) => index + 1)
      setAnswer('')
      setEvaluation(null)
      setExplanation(null)
    })
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,118,110,0.92),rgba(17,24,39,0.96))] px-6 py-8 text-white shadow-[0_28px_80px_rgba(15,23,42,0.22)] sm:px-10">
          <div className="absolute -right-16 top-0 h-44 w-44 rounded-full bg-orange-400/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-teal-200/20 blur-2xl"></div>

          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-50">
                <BrainCircuit className="h-4 w-4" />
                Real Interview Simulation
              </div>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
                Company-specific mock interviews with saved practice history and AI evaluation.
              </h1>
              <p className="mt-4 max-w-2xl text-base text-teal-50/90 sm:text-lg">
                Pick a company, pick a role, and run through aptitude, coding, technical, and HR-style questions pulled from your question database.
              </p>
            </div>

            <div className="glass-effect rounded-[1.8rem] p-5 text-stone-900">
              <div className="grid gap-4">
                <label className="text-sm font-semibold text-stone-700">
                  Select Company
                  <select
                    value={selectedCompany}
                    onChange={(event) => setSelectedCompany(event.target.value)}
                    className="input-modern mt-2"
                  >
                    {(metadata?.companies ?? ['Microsoft', 'Amazon', 'Google', 'Tata Consultancy Services', 'Infosys']).map((company) => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-semibold text-stone-700">
                  Role Dropdown
                  <select
                    value={selectedRole}
                    onChange={(event) => setSelectedRole(event.target.value)}
                    className="input-modern mt-2"
                  >
                    {(metadata?.roles ?? roleFallbacks).map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </label>

                <button
                  onClick={handleStartInterview}
                  disabled={startingSession || !selectedCompany || !selectedRole}
                  className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Sparkles className="h-5 w-5" />
                  {startingSession ? 'Starting Interview...' : 'Start Interview'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-8">
            <section className="card">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Top Questions by Company</p>
                  <h2 className="mt-2 text-3xl font-bold text-stone-900">{selectedCompany} question bank</h2>
                </div>
                <div className="badge badge-primary px-4 py-2 text-sm">
                  {loadingTopQuestions ? 'Loading...' : `${topQuestions.length} questions ready`}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {topQuestions.slice(0, 6).map((question, index) => (
                  <div key={`${question.id}-${index}`} className="rounded-[1.5rem] border border-stone-200 bg-white/85 p-5 shadow-[0_10px_24px_rgba(33,24,9,0.05)]">
                    <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                      <span>{question.round_name}</span>
                      <span>{question.difficulty}</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-6 text-stone-900">{question.question}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-600">
                      <span className="rounded-full bg-stone-100 px-3 py-1">{question.category}</span>
                      {question.topic && <span className="rounded-full bg-stone-100 px-3 py-1">{question.topic}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">Mock Interview Feature</p>
                  <h2 className="mt-2 text-3xl font-bold text-stone-900">{session ? `${session.company} simulation` : 'Start a simulation'}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">
                    Score: {overallSessionScore}/100
                  </div>
                  {session && (
                    <div className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700">
                      Question {currentIndex + 1} of {session.questions.length}
                    </div>
                  )}
                </div>
              </div>

              {!session || !currentQuestion ? (
                <div className="mt-6 rounded-[1.75rem] border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center text-stone-600">
                  Select company and role, then press Start Interview to begin the round-by-round simulation.
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="badge badge-primary">{currentQuestion.round_name} Round</span>
                    <span className="badge badge-warning">{currentQuestion.category}</span>
                    <span className="badge badge-success">{currentQuestion.difficulty}</span>
                  </div>

                  <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(240,253,250,0.95))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                        <HelpCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Question {currentIndex + 1}</p>
                        <h3 className="mt-2 text-2xl font-bold text-stone-900">{currentQuestion.question}</h3>
                      </div>
                    </div>
                  </div>

                  <textarea
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    rows={8}
                    placeholder="Type your answer here. Keep it structured and interview-ready."
                    className="input-modern min-h-[190px]"
                  />

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleExplainQuestion}
                      disabled={explainingQuestion}
                      className="btn-secondary inline-flex items-center gap-2"
                    >
                      <Target className="h-4 w-4" />
                      {explainingQuestion ? 'Explaining...' : 'Explain This Question'}
                    </button>
                    <button
                      onClick={handleEvaluateAnswer}
                      disabled={evaluatingAnswer || !answer.trim()}
                      className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
                    >
                      <Trophy className="h-4 w-4" />
                      {evaluatingAnswer ? 'Evaluating...' : 'Evaluate Answer'}
                    </button>
                    <button
                      onClick={handleNextQuestion}
                      disabled={!evaluation || currentIndex >= (session.questions.length - 1)}
                      className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      Next Question
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {explanation && (
                    <div className="rounded-[1.75rem] border border-orange-100 bg-orange-50 p-6">
                      <h4 className="text-lg font-bold text-orange-900">AI Answer Explanation</h4>
                      <p className="mt-3 text-sm leading-6 text-orange-900/85">{explanation.simple_explanation}</p>
                      <div className="mt-4 grid gap-5 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-semibold text-orange-900">Core concepts</p>
                          <ul className="mt-2 space-y-2 text-sm text-orange-800">
                            {explanation.concepts?.map((concept: string) => (
                              <li key={concept}>• {concept}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-orange-900">How to structure the answer</p>
                          <ul className="mt-2 space-y-2 text-sm text-orange-800">
                            {explanation.answer_framework?.map((step: string) => (
                              <li key={step}>• {step}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {evaluation && (
                    <div className="rounded-[1.9rem] border border-teal-100 bg-teal-50 p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Evaluation</p>
                          <h4 className="mt-2 text-2xl font-bold text-stone-900">{evaluation.evaluation.verdict}</h4>
                        </div>
                        <div className="rounded-full bg-white px-5 py-3 text-lg font-bold text-teal-700 shadow-sm">
                          {evaluation.evaluation.score}/100
                        </div>
                      </div>

                      <div className="mt-5 grid gap-5 md:grid-cols-2">
                        <div className="rounded-[1.4rem] bg-white/85 p-5">
                          <p className="text-sm font-semibold text-stone-900">Strengths</p>
                          <ul className="mt-3 space-y-2 text-sm text-stone-700">
                            {evaluation.evaluation.strengths.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-[1.4rem] bg-white/85 p-5">
                          <p className="text-sm font-semibold text-stone-900">Improvements</p>
                          <ul className="mt-3 space-y-2 text-sm text-stone-700">
                            {evaluation.evaluation.improvements.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-5 rounded-[1.4rem] bg-white/85 p-5 text-sm leading-6 text-stone-700">
                        <p className="font-semibold text-stone-900">Improved sample answer</p>
                        <p className="mt-2 whitespace-pre-wrap">{evaluation.evaluation.sample_answer}</p>
                        <p className="mt-4 font-semibold text-stone-900">Likely follow-up question</p>
                        <p className="mt-1">{evaluation.evaluation.follow_up_question}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8">
            <section className="card">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Real Interview Simulation</p>
              <h3 className="mt-2 text-2xl font-bold text-stone-900">Round flow</h3>
              <div className="mt-5 space-y-3">
                {(session?.rounds ?? metadata?.rounds?.map((round) => ({ name: round, question_count: 0 })) ?? []).map((round) => (
                  <div key={round.name} className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-900 text-white">
                        {round.name === 'Aptitude' && <Landmark className="h-4 w-4" />}
                        {round.name === 'Coding' && <BrainCircuit className="h-4 w-4" />}
                        {round.name === 'Technical' && <Building2 className="h-4 w-4" />}
                        {round.name === 'HR' && <Target className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900">{round.name}</p>
                        <p className="text-xs text-stone-500">{round.question_count} question(s)</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Saved User Practice Data</p>
              <h3 className="mt-2 text-2xl font-bold text-stone-900">Recent attempts</h3>
              <div className="mt-5 space-y-4">
                {history.length === 0 ? (
                  <div className="rounded-2xl bg-stone-50 px-4 py-5 text-sm text-stone-500">
                    Your evaluated answers will appear here with score history.
                  </div>
                ) : history.map((entry) => (
                  <div key={entry.id} className="rounded-[1.5rem] border border-stone-200 bg-white/90 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-stone-900">{entry.company_name} • {entry.round_name}</p>
                      <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-700">{entry.score}/100</span>
                    </div>
                    <p className="mt-2 text-sm text-stone-700">{entry.question_text}</p>
                    <p className="mt-2 text-xs text-stone-500">{new Date(entry.practice_date).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}