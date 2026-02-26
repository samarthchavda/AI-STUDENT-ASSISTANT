import { useState } from 'react'
import { Brain, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
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

interface QuizHistory {
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  completedQuestions: string[]
}

export default function ExamPrepPage() {
  const [category, setCategory] = useState('quantitative')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([])
  const numQuestions = 15 // Fixed to 15 questions

  const categories = [
    { id: 'quantitative', name: 'Quantitative Aptitude', icon: '🔢' },
    { id: 'logical', name: 'Logical Reasoning', icon: '🧩' },
    { id: 'verbal', name: 'Verbal Ability', icon: '📝' },
    { id: 'data', name: 'Data Interpretation', icon: '📊' }
  ]

  const generateQuestions = async (increaseDifficulty: boolean = false) => {
    setLoading(true)
    setShowResults(false)
    setCurrentQuestion(0)
    setScore(0)
    
    // If same category and increasing difficulty
    let newDifficulty = difficulty
    if (increaseDifficulty) {
      if (difficulty === 'easy') newDifficulty = 'medium'
      else if (difficulty === 'medium') newDifficulty = 'hard'
      setDifficulty(newDifficulty)
    }
    
    try {
      const response = await examAPI.generateMockTest({
        subject: 'Aptitude',
        topic: category,
        difficulty: newDifficulty,
        numQuestions
      })
      
      if (response.data.questions) {
        const newQuestions = response.data.questions.map((q: any) => ({
          ...q,
          userAnswer: undefined
        }))
        setQuestions(newQuestions)
        
        // Save to history
        setQuizHistory([...quizHistory, {
          category,
          difficulty: newDifficulty,
          completedQuestions: newQuestions.map((q: Question) => q.question)
        }])
      }
    } catch (error) {
      console.error('Error generating questions:', error)
      alert('Error generating questions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const startNewQuiz = (sameCategory: boolean) => {
    if (sameCategory) {
      // Same category with increased difficulty
      generateQuestions(true)
    } else {
      // Different category - reset to easy
      setDifficulty('easy')
      setQuestions([])
      setShowResults(false)
    }
  }

  const handleAnswer = (answerIndex: number) => {
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestion].userAnswer = answerIndex
    setQuestions(updatedQuestions)
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitTest = () => {
    const correctAnswers = questions.filter(
      (q) => q.userAnswer === q.correctAnswer
    ).length
    setScore(correctAnswers)
    setShowResults(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">
            <span className="gradient-text">Aptitude Preparation</span>
          </h1>
          <p className="text-gray-600">Practice aptitude questions for placement exams</p>
        </div>

        {questions.length === 0 ? (
          // Setup Screen
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Configure Your Test</h2>

              {/* Category Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Select Category</label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        category === cat.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{cat.icon}</div>
                      <div className="font-semibold text-sm">{cat.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Starting Difficulty Level</label>
                <div className="flex gap-3">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                        difficulty === level
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fixed Questions Info */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>📝 Quiz Format:</strong> Each quiz contains 15 questions. 
                  Complete the quiz to see your results and take another one!
                </p>
              </div>

              {/* Generate Button */}
              <button
                onClick={() => generateQuestions(false)}
                disabled={loading}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating Questions...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Brain className="w-5 h-5" />
                    Start Test
                  </span>
                )}
              </button>
            </div>
          </div>
        ) : showResults ? (
          // Results Screen
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Test Results</h2>
                <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl px-8 py-6">
                  <div className="text-5xl font-bold mb-2">
                    {score}/{questions.length}
                  </div>
                  <div className="text-lg">
                    {Math.round((score / questions.length) * 100)}% Score
                  </div>
                </div>
              </div>

              {/* Performance Message */}
              <div className={`p-4 rounded-lg mb-6 ${
                score / questions.length >= 0.8 ? 'bg-green-50 text-green-800' :
                score / questions.length >= 0.6 ? 'bg-yellow-50 text-yellow-800' :
                'bg-red-50 text-red-800'
              }`}>
                <p className="font-semibold text-center">
                  {score / questions.length >= 0.8 ? '🎉 Excellent! Keep it up!' :
                   score / questions.length >= 0.6 ? '👍 Good job! Practice more to improve.' :
                   '💪 Keep practicing! You\'ll get better.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => startNewQuiz(true)}
                  className="btn-primary py-4 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">Same Category</div>
                    <div className="text-xs opacity-90">
                      {difficulty === 'hard' ? 'Hard level' : 'Harder questions'}
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => startNewQuiz(false)}
                  className="btn-secondary py-4 flex items-center justify-center gap-2"
                >
                  <Brain className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">Different Category</div>
                    <div className="text-xs opacity-90">Choose new topic</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Detailed Solutions */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold mb-4">Detailed Solutions</h3>
              {questions.map((q, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start gap-3 mb-4">
                    {q.userAnswer === q.correctAnswer ? (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-lg mb-3">
                        Q{idx + 1}. {q.question}
                      </p>
                      <div className="space-y-2 mb-4">
                        {q.options.map((option, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-lg border-2 ${
                              optIdx === q.correctAnswer
                                ? 'border-green-500 bg-green-50'
                                : optIdx === q.userAnswer && q.userAnswer !== q.correctAnswer
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <span className="font-medium">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>{' '}
                            {option}
                            {optIdx === q.correctAnswer && (
                              <span className="ml-2 text-green-600 font-semibold">
                                ✓ Correct Answer
                              </span>
                            )}
                            {optIdx === q.userAnswer && q.userAnswer !== q.correctAnswer && (
                              <span className="ml-2 text-red-600 font-semibold">
                                ✗ Your Answer
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <p className="text-sm font-semibold text-blue-900 mb-2">
                          💡 Explanation:
                        </p>
                        <p className="text-sm text-blue-800">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Question Screen
          <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {questions.filter((q) => q.userAnswer !== undefined).length} Answered
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h3 className="text-2xl font-bold mb-6">
                {questions[currentQuestion].question}
              </h3>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      questions[currentQuestion].userAnswer === idx
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-semibold text-lg">
                      {String.fromCharCode(65 + idx)}.
                    </span>{' '}
                    <span className="text-lg">{option}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
                className="btn-secondary flex-1 py-3 disabled:opacity-50"
              >
                Previous
              </button>
              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={submitTest}
                  className="btn-primary flex-1 py-3"
                >
                  Submit Test
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="btn-primary flex-1 py-3"
                >
                  Next
                </button>
              )}
            </div>

            {/* Question Navigator */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h4 className="font-semibold mb-3">Question Navigator</h4>
              <div className="grid grid-cols-10 gap-2">
                {questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
                      idx === currentQuestion
                        ? 'bg-blue-600 text-white'
                        : q.userAnswer !== undefined
                        ? 'bg-green-100 text-green-700 border-2 border-green-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
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
