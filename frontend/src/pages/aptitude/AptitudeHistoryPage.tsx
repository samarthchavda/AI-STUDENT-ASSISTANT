import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Award, ChevronRight, TrendingUp, BookOpen, ArrowLeft } from 'lucide-react'
import Header from '../../components/Header'
import { api } from '../../api/client'
import { cleanQuestionText } from './utils/textCleaners'

interface ExamHistory {
  id: number
  company: string
  category: string
  difficulty: string
  score: number
  total_questions: number
  correct: number
  wrong: number
  skipped: number
  score_percent: number
  exam_date: string
}

interface ExamDetail {
  id: number
  question: string
  options: string[]
  correct_answer: string
  user_answer: string | null
  is_correct: boolean
  explanation: string
}

export default function AptitudeHistoryPage() {
  const navigate = useNavigate()
  const [history, setHistory] = useState<ExamHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState<number | null>(null)
  const [examDetails, setExamDetails] = useState<ExamDetail[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await api.get('/aptitude/history')
      setHistory(response.data || [])
    } catch (error) {
      console.error('Failed to fetch exam history:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExamDetails = async (examId: number) => {
    try {
      setLoadingDetails(true)
      const response = await api.get(`/aptitude/history/${examId}`)
      setExamDetails(response.data.questions || [])
      setSelectedExam(examId)
    } catch (error) {
      console.error('Failed to fetch exam details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getScoreColor = (percent: number) => {
    if (percent >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (percent >= 60) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (percent >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'Easy') return 'text-green-700 bg-green-100'
    if (difficulty === 'Medium') return 'text-yellow-700 bg-yellow-100'
    return 'text-red-700 bg-red-100'
  }

  if (selectedExam !== null) {
    const exam = history.find((e) => e.id === selectedExam)
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="mx-auto max-w-5xl px-6 pt-24 pb-10">
          <button
            onClick={() => setSelectedExam(null)}
            className="mb-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </button>

          {exam && (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{exam.company} - {exam.category}</h1>
                  <p className="mt-2 text-gray-600">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getDifficultyColor(exam.difficulty)}`}>
                      {exam.difficulty}
                    </span>
                    <span className="ml-3 text-sm">{formatDate(exam.exam_date)}</span>
                  </p>
                </div>
                <div className={`rounded-xl border px-6 py-3 ${getScoreColor(exam.score_percent)}`}>
                  <p className="text-3xl font-bold">{exam.score_percent}%</p>
                  <p className="text-xs font-semibold">Score</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="rounded-lg bg-gray-50 p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{exam.total_questions}</p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{exam.correct}</p>
                  <p className="text-xs text-green-700">Correct</p>
                </div>
                <div className="rounded-lg bg-red-50 p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{exam.wrong}</p>
                  <p className="text-xs text-red-700">Wrong</p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{exam.skipped}</p>
                  <p className="text-xs text-yellow-700">Skipped</p>
                </div>
              </div>
            </div>
          )}

          <h2 className="mb-4 text-xl font-bold text-gray-900">Questions & Solutions</h2>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {examDetails.map((question, index) => (
                <div
                  key={question.id}
                  className={`rounded-2xl border p-6 ${
                    question.is_correct
                      ? 'border-green-200 bg-green-50/30'
                      : question.user_answer === null
                      ? 'border-yellow-200 bg-yellow-50/30'
                      : 'border-red-200 bg-red-50/30'
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Question {index + 1}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        question.is_correct
                          ? 'bg-green-100 text-green-700'
                          : question.user_answer === null
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {question.is_correct ? 'Correct' : question.user_answer === null ? 'Skipped' : 'Wrong'}
                    </span>
                  </div>

                  <p className="mb-4 text-gray-800">{cleanQuestionText(question.question)}</p>

                  <div className="mb-4 space-y-2">
                    {question.options.map((option, optIndex) => {
                      const isCorrect = option === question.correct_answer
                      const isUserAnswer = option === question.user_answer
                      
                      return (
                        <div
                          key={optIndex}
                          className={`rounded-lg border p-3 ${
                            isCorrect
                              ? 'border-green-500 bg-green-50'
                              : isUserAnswer
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCorrect && (
                              <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                                ✓ Correct
                              </span>
                            )}
                            {isUserAnswer && !isCorrect && (
                              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                                Your Answer
                              </span>
                            )}
                            <span className="text-gray-800">{cleanQuestionText(option)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="mb-1 text-sm font-semibold text-blue-900">Explanation:</p>
                    <p className="text-sm text-blue-800">{cleanQuestionText(question.explanation)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-5xl px-6 pt-24 pb-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Aptitude Exam History</h1>
          <p className="mt-3 text-gray-600">Review your past exams and track your progress over time</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No Exam History</h3>
            <p className="mt-2 text-sm text-gray-600">Take your first aptitude test to see your history here</p>
            <button
              onClick={() => navigate('/exam-prep')}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Start Your First Test
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((exam) => (
              <div
                key={exam.id}
                className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-lg"
                onClick={() => fetchExamDetails(exam.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-900">{exam.company}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getDifficultyColor(exam.difficulty)}`}>
                        {exam.difficulty}
                      </span>
                    </div>
                    
                    <p className="mb-3 text-sm text-gray-600">{exam.category}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(exam.exam_date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{exam.total_questions} Questions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="h-4 w-4" />
                        <span>{exam.correct} Correct</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`rounded-xl border px-6 py-3 text-center ${getScoreColor(exam.score_percent)}`}>
                      <p className="text-2xl font-bold">{exam.score_percent}%</p>
                      <p className="text-xs font-semibold">Score</p>
                    </div>
                    
                    <ChevronRight className="h-6 w-6 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <div className="flex-1 rounded-lg bg-green-50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-green-600">{exam.correct}</p>
                    <p className="text-xs text-green-700">Correct</p>
                  </div>
                  <div className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-red-600">{exam.wrong}</p>
                    <p className="text-xs text-red-700">Wrong</p>
                  </div>
                  <div className="flex-1 rounded-lg bg-yellow-50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-yellow-600">{exam.skipped}</p>
                    <p className="text-xs text-yellow-700">Skipped</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && history.length > 0 && (
          <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">Keep Improving!</h3>
                <p className="mt-1 text-sm text-blue-800">
                  You've completed {history.length} exam{history.length > 1 ? 's' : ''}. 
                  Review your mistakes and keep practicing to improve your scores.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
