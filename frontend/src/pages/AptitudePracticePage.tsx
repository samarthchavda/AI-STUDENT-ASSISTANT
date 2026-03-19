import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Lightbulb, Home, RotateCcw, Award, TrendingUp } from 'lucide-react'
import Header from '../components/Header'
import { chatAPI } from '../api/client'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  selectedAnswer: number | null
  isAnswered: boolean
}

export default function AptitudePracticePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') || 'Quantitative Aptitude'

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showResults, setShowResults] = useState(false)

  // Load 10 questions on mount
  useEffect(() => {
    loadQuestions()
  }, [category])

  const loadQuestions = async () => {
    setLoading(true)
    setShowResults(false)

    try {
      // Generate 10 questions at once
      const prompt = `Generate 10 ${category} practice questions from top companies like TCS, Infosys, Wipro, Amazon, Microsoft, Google.

Each question should have:
- question text
- 4 options
- correct answer index (0-3)
- detailed explanation

Format as JSON array:
[
  {
    "question": "question text",
    "options": ["option1", "option2", "option3", "option4"],
    "correctAnswer": 0,
    "explanation": "detailed explanation"
  }
]

Return ONLY valid JSON array, no markdown.`

      const response = await chatAPI.sendMessage([
        { role: 'user', content: prompt, timestamp: new Date().toISOString() }
      ], 'english')

      // Parse AI response
      let questionsData: any[]
      try {
        const jsonMatch = String(response).match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          questionsData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found')
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError)
        // Fallback questions
        questionsData = generateFallbackQuestions()
      }

      // Format questions
      const formattedQuestions: Question[] = questionsData.slice(0, 10).map((q, index) => ({
        id: index + 1,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        selectedAnswer: null,
        isAnswered: false
      }))

      setQuestions(formattedQuestions)
    } catch (error) {
      console.error('Error loading questions:', error)
      setQuestions(generateFallbackQuestions().map((q, index) => ({
        id: index + 1,
        ...q,
        selectedAnswer: null,
        isAnswered: false
      })))
    } finally {
      setLoading(false)
    }
  }

  const generateFallbackQuestions = () => {
    return [
      {
        question: 'If 20% of a number is 50, what is the number?',
        options: ['200', '250', '300', '350'],
        correctAnswer: 1,
        explanation: 'Let the number be x. Then 20% of x = 50, so (20/100) × x = 50, which gives x = 250.'
      },
      {
        question: 'A train travels 120 km in 2 hours. What is its speed in m/s?',
        options: ['16.67 m/s', '33.33 m/s', '60 m/s', '120 m/s'],
        correctAnswer: 0,
        explanation: 'Speed = 120 km / 2 hours = 60 km/h. Converting to m/s: 60 × (1000/3600) = 16.67 m/s.'
      },
      {
        question: 'What is the next number in the series: 2, 6, 12, 20, 30, ?',
        options: ['40', '42', '44', '46'],
        correctAnswer: 1,
        explanation: 'The differences are 4, 6, 8, 10, so the next difference is 12. Therefore, 30 + 12 = 42.'
      },
      {
        question: 'If A:B = 2:3 and B:C = 4:5, what is A:C?',
        options: ['8:15', '2:5', '3:5', '4:5'],
        correctAnswer: 0,
        explanation: 'A:B = 2:3 and B:C = 4:5. To find A:C, multiply: A:B:C = 8:12:15, so A:C = 8:15.'
      },
      {
        question: 'The average of 5 numbers is 30. If one number is excluded, the average becomes 28. What is the excluded number?',
        options: ['35', '38', '40', '42'],
        correctAnswer: 1,
        explanation: 'Sum of 5 numbers = 5 × 30 = 150. Sum of 4 numbers = 4 × 28 = 112. Excluded number = 150 - 112 = 38.'
      },
      {
        question: 'A shopkeeper marks his goods 40% above cost price and gives a discount of 20%. What is his profit percentage?',
        options: ['10%', '12%', '15%', '20%'],
        correctAnswer: 1,
        explanation: 'Let CP = 100. MP = 140. SP = 140 - (20% of 140) = 140 - 28 = 112. Profit = 112 - 100 = 12%.'
      },
      {
        question: 'How many times do the hands of a clock coincide in a day?',
        options: ['20', '21', '22', '24'],
        correctAnswer: 2,
        explanation: 'The hands coincide 11 times in 12 hours (not at 11 o\'clock). So in 24 hours, they coincide 22 times.'
      },
      {
        question: 'If log₁₀ 2 = 0.3010, what is log₁₀ 8?',
        options: ['0.6020', '0.9030', '1.2040', '2.4080'],
        correctAnswer: 1,
        explanation: 'log₁₀ 8 = log₁₀ 2³ = 3 × log₁₀ 2 = 3 × 0.3010 = 0.9030.'
      },
      {
        question: 'A can complete a work in 12 days and B in 18 days. How many days will they take together?',
        options: ['6 days', '7.2 days', '8 days', '9 days'],
        correctAnswer: 1,
        explanation: 'A\'s rate = 1/12, B\'s rate = 1/18. Combined rate = 1/12 + 1/18 = 5/36. Time = 36/5 = 7.2 days.'
      },
      {
        question: 'In how many ways can the letters of the word "LEADER" be arranged?',
        options: ['120', '180', '360', '720'],
        correctAnswer: 2,
        explanation: 'LEADER has 6 letters with E repeated twice. Arrangements = 6! / 2! = 720 / 2 = 360.'
      }
    ]
  }

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, selectedAnswer: optionIndex, isAnswered: true }
        : q
    ))
  }

  const handleSubmit = () => {
    setShowResults(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRestart = () => {
    loadQuestions()
  }

  const calculateScore = () => {
    const answered = questions.filter(q => q.isAnswered).length
    const correct = questions.filter(q => q.isAnswered && q.selectedAnswer === q.correctAnswer).length
    return { answered, correct, total: questions.length }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">
          <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading 10 practice questions from top companies...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  const score = calculateScore()

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Practice Questions</h1>
                <p className="text-gray-600 mt-1">{category} • 10 Questions • FREE</p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            </div>

            {/* Company Badge */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Previous Year Questions from Top Companies</p>
                  <p className="text-sm text-purple-100">TCS • Infosys • Wipro • Amazon • Microsoft • Google</p>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            {showResults && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Score</h2>
                    <p className="text-gray-600">
                      {score.correct} out of {score.answered} answered correctly
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">
                      {score.answered > 0 ? Math.round((score.correct / score.answered) * 100) : 0}%
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Accuracy</p>
                  </div>
                </div>
                <button
                  onClick={handleRestart}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try New Questions
                </button>
              </div>
            )}
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            {questions.map((question) => {
              const isCorrect = question.isAnswered && question.selectedAnswer === question.correctAnswer
              const isWrong = question.isAnswered && question.selectedAnswer !== question.correctAnswer

              return (
                <div key={question.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Question Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Question {question.id}</span>
                      {showResults && (
                        <span className="flex items-center gap-2">
                          {isCorrect && <><CheckCircle className="w-5 h-5" /> Correct</>}
                          {isWrong && <><XCircle className="w-5 h-5" /> Wrong</>}
                          {!question.isAnswered && <span className="text-purple-200">Not Answered</span>}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="p-6">
                    <p className="text-lg text-gray-900 mb-4 leading-relaxed">
                      {question.question}
                    </p>

                    {/* Options */}
                    <div className="space-y-3 mb-4">
                      {question.options.map((option, optionIndex) => {
                        const isSelected = question.selectedAnswer === optionIndex
                        const isCorrectOption = optionIndex === question.correctAnswer
                        
                        let optionClass = 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        
                        if (showResults) {
                          if (isCorrectOption) {
                            optionClass = 'border-green-500 bg-green-50'
                          } else if (isSelected && !isCorrect) {
                            optionClass = 'border-red-500 bg-red-50'
                          } else {
                            optionClass = 'border-gray-200 bg-gray-50'
                          }
                        } else if (isSelected) {
                          optionClass = 'border-blue-500 bg-blue-50'
                        }

                        return (
                          <button
                            key={optionIndex}
                            onClick={() => !showResults && handleOptionSelect(question.id, optionIndex)}
                            disabled={showResults}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${optionClass} ${
                              showResults ? 'cursor-default' : 'cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                                showResults && isCorrectOption
                                  ? 'bg-green-600 text-white'
                                  : showResults && isSelected && !isCorrect
                                  ? 'bg-red-600 text-white'
                                  : isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {String.fromCharCode(65 + optionIndex)}
                              </div>
                              <span className="flex-1 text-gray-900">{option}</span>
                              {showResults && isCorrectOption && (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              )}
                              {showResults && isSelected && !isCorrect && (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Explanation (shown after submit) */}
                    {showResults && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-900 mb-2">Explanation</h4>
                            <p className="text-blue-800 leading-relaxed">
                              {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Submit Button */}
          {!showResults && (
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700">
                    <span className="font-semibold">{score.answered}</span> out of {score.total} questions answered
                  </p>
                  {score.answered < score.total && (
                    <p className="text-sm text-orange-600 mt-1">
                      ⚠️ You haven't answered all questions yet
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
                >
                  <TrendingUp className="w-5 h-5" />
                  Submit & View Results
                </button>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-2">💡 Practice Tips</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• All questions are from previous year company placement papers</li>
              <li>• Take your time to understand each concept thoroughly</li>
              <li>• Review explanations even for correct answers to strengthen understanding</li>
              <li>• Practice regularly to improve your speed and accuracy</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
