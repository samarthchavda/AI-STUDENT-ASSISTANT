import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Clock3, Code2 } from 'lucide-react'
import Header from '../components/Header'
import { codingAPI } from '../api/client'

type ChallengeQuestion = {
  id: number
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  time_limit_seconds: number
}

const difficultyBadgeClass: Record<ChallengeQuestion['difficulty'], string> = {
  easy: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  hard: 'bg-red-100 text-red-700 border-red-200',
}

const formatTimeLimit = (seconds: number) => {
  const mins = Math.max(1, Math.round(seconds / 60))
  return `${mins} mins`
}

export default function DSAPracticeDashboardPage() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await codingAPI.getChallengeQuestions()
        setQuestions(response.data?.questions || [])
      } catch (err: any) {
        console.error('Failed to load DSA questions:', err)
        setError(err?.response?.data?.detail || 'Could not load questions right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">DSA Practice Dashboard</h1>
              <p className="mt-2 text-slate-600">Pick a challenge and attempt it in a timed coding environment.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <Code2 className="w-4 h-4" />
              Structured Practice
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-500">Loading questions...</div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                Retry
              </button>
            </div>
          ) : questions.length === 0 ? (
            <div className="py-16 text-center text-slate-500">No active questions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-slate-600">
                    <th className="px-5 py-3 font-semibold">#</th>
                    <th className="px-5 py-3 font-semibold">Title</th>
                    <th className="px-5 py-3 font-semibold">Difficulty</th>
                    <th className="px-5 py-3 font-semibold">Access</th>
                    <th className="px-5 py-3 font-semibold">Time Limit</th>
                    <th className="px-5 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, index) => {
                    const isFree = q.id <= 5

                    return (
                      <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-700">{index + 1}</td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">{q.title}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${difficultyBadgeClass[q.difficulty]}`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isFree ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'
                          }`}>
                            {isFree ? 'Free' : 'Pro'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="w-4 h-4 text-slate-500" />
                            {formatTimeLimit(q.time_limit_seconds)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => navigate(`/dsa/editor/${q.id}`)}
                            className="inline-flex items-center rounded-lg bg-slate-900 text-white px-3.5 py-2 font-medium hover:bg-slate-800 transition-colors"
                          >
                            Attempt
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Link to="/chat" className="text-sm text-slate-600 hover:text-slate-900 underline">
            Back to AI Chat
          </Link>
        </div>
      </section>
    </div>
  )
}
