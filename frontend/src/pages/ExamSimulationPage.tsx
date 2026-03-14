import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Clock, AlertTriangle, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import Header from '../components/Header'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
}

interface TestConfig {
  company: string
  category: string
  difficulty: string
}

interface CategoryStats {
  correct: number
  total: number
}

interface ProgressStats {
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

export default function ExamSimulationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Redirect if no test configuration
  const testConfig = location.state as TestConfig | null
  
  useEffect(() => {
    if (!testConfig) {
      navigate('/exam-prep')
    }
  }, [testConfig, navigate])

  // State Management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes in seconds
  const [warnings, setWarnings] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Mock Questions Data
  const questions: Question[] = [
    {
      id: 1,
      question: "If a train travels 120 km in 2 hours, what is its average speed?",
      options: ["50 km/h", "60 km/h", "70 km/h", "80 km/h"],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "What is the next number in the series: 2, 6, 12, 20, 30, ?",
      options: ["40", "42", "44", "46"],
      correctAnswer: 1
    },
    {
      id: 3,
      question: "If 5 workers can complete a task in 12 days, how many days will 10 workers take?",
      options: ["4 days", "6 days", "8 days", "10 days"],
      correctAnswer: 1
    },
    {
      id: 4,
      question: "The ratio of boys to girls in a class is 3:2. If there are 15 boys, how many girls are there?",
      options: ["8", "10", "12", "15"],
      correctAnswer: 1
    },
    {
      id: 5,
      question: "What is 15% of 200?",
      options: ["25", "30", "35", "40"],
      correctAnswer: 1
    }
  ]

  // Timer Logic - Countdown
  useEffect(() => {
    if (isSubmitted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          const correctCount = Object.entries(selectedAnswers).filter(
            ([index, answer]) => questions[parseInt(index)].correctAnswer === answer
          ).length

          // Update progress stats
          const stats = loadStats()
          stats.totalQuizzes += 1
          stats.totalCorrect += correctCount
          stats.totalQuestions += questions.length

          const categoryId = testConfig?.category || 'quantitative'
          if (!stats.categories[categoryId]) {
            stats.categories[categoryId] = { correct: 0, total: 0 }
          }
          stats.categories[categoryId].correct += correctCount
          stats.categories[categoryId].total += questions.length

          saveStats(stats)

          setIsSubmitted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isSubmitted, selectedAnswers, questions, testConfig])

  // Anti-Cheat: Tab Switch Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        setWarnings((prev) => {
          const newWarnings = prev + 1
          
          if (newWarnings >= 3) {
            alert('⚠️ Test auto-submitted due to multiple tab switches!')
            
            // Calculate score and save stats before auto-submit
            const correctCount = Object.entries(selectedAnswers).filter(
              ([index, answer]) => questions[parseInt(index)].correctAnswer === answer
            ).length

            const stats = loadStats()
            stats.totalQuizzes += 1
            stats.totalCorrect += correctCount
            stats.totalQuestions += questions.length

            const categoryId = testConfig?.category || 'quantitative'
            if (!stats.categories[categoryId]) {
              stats.categories[categoryId] = { correct: 0, total: 0 }
            }
            stats.categories[categoryId].correct += correctCount
            stats.categories[categoryId].total += questions.length

            saveStats(stats)

            setIsSubmitted(true)
          } else {
            alert(`⚠️ Warning ${newWarnings}/3: Do not switch tabs during the test!`)
          }
          
          return newWarnings
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isSubmitted, selectedAnswers, questions, testConfig])

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle answer selection
  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex
    })
  }

  // Navigation handlers
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleSubmit = () => {
    const confirmSubmit = window.confirm(
      `Are you sure you want to submit the test?\n\nAnswered: ${Object.keys(selectedAnswers).length}/${questions.length} questions`
    )
    
    if (confirmSubmit) {
      // Calculate score
      const correctCount = Object.entries(selectedAnswers).filter(
        ([index, answer]) => questions[parseInt(index)].correctAnswer === answer
      ).length

      // Update progress stats in localStorage
      const stats = loadStats()
      stats.totalQuizzes += 1
      stats.totalCorrect += correctCount
      stats.totalQuestions += questions.length

      // Update category-specific stats
      const categoryId = testConfig?.category || 'quantitative'
      if (!stats.categories[categoryId]) {
        stats.categories[categoryId] = { correct: 0, total: 0 }
      }
      stats.categories[categoryId].correct += correctCount
      stats.categories[categoryId].total += questions.length

      saveStats(stats)

      setIsSubmitted(true)
    }
  }

  // If no config, show loading
  if (!testConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  // Submission Screen
  if (isSubmitted) {
    const score = Object.entries(selectedAnswers).filter(
      ([index, answer]) => questions[parseInt(index)].correctAnswer === answer
    ).length

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Test Submitted Successfully!
              </h1>
              <p className="text-gray-600">
                Your {testConfig.company} {testConfig.category} test has been submitted
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-3xl font-bold text-blue-600">{score}</div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-700">{questions.length}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.round((score / questions.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
              </div>
            </div>

            {warnings > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  ⚠️ Tab Switch Warnings: {warnings}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => navigate('/exam-prep')}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Take Another Test
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Exam Screen
  const currentQuestion = questions[currentQuestionIndex]
  const isTimeCritical = timeLeft < 180 // Less than 3 minutes

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Exam Header - Company & Category */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Test Info */}
            <div>
              <h1 className="text-2xl font-bold">
                {testConfig.company} Simulation
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                {testConfig.category.charAt(0).toUpperCase() + testConfig.category.slice(1)} Aptitude • {testConfig.difficulty.charAt(0).toUpperCase() + testConfig.difficulty.slice(1)} Level
              </p>
            </div>

            {/* Timer & Warnings */}
            <div className="flex items-center gap-3">
              {/* Warnings Badge */}
              {warnings > 0 && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                  warnings >= 2 
                    ? 'bg-red-500 text-white border-2 border-red-300' 
                    : 'bg-yellow-400 text-yellow-900 border-2 border-yellow-300'
                }`}>
                  <AlertTriangle className="w-5 h-5" />
                  <span>Warnings: {warnings}/3</span>
                </div>
              )}

              {/* Timer */}
              <div
                className={`flex items-center gap-2 px-5 py-3 rounded-lg font-mono text-2xl font-bold border-2 ${
                  isTimeCritical
                    ? 'bg-red-600 text-white border-red-400 animate-pulse shadow-lg'
                    : 'bg-white text-green-600 border-green-300'
                }`}
              >
                <Clock className="w-6 h-6" />
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span className="font-semibold">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="font-semibold">
              Answered: {Object.keys(selectedAnswers).length}/{questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 shadow-md"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Question Body */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {/* Question Number Badge */}
          <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-semibold mb-4">
            Question {currentQuestionIndex + 1}
          </div>

          {/* Question Text */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedAnswers[currentQuestionIndex] === index
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Radio Button */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedAnswers[currentQuestionIndex] === index && (
                      <div className="w-3 h-3 bg-white rounded-full" />
                    )}
                  </div>

                  {/* Option Text */}
                  <span className="text-lg">
                    <span className="font-semibold mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between gap-4">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>

            {/* Submit Button (show on last question or if all answered) */}
            {(currentQuestionIndex === questions.length - 1 ||
              Object.keys(selectedAnswers).length === questions.length) && (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition shadow-lg"
              >
                Submit Test
              </button>
            )}

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-5 gap-3">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`aspect-square rounded-lg font-semibold text-lg transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white shadow-lg scale-110'
                    : selectedAnswers[index] !== undefined
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
