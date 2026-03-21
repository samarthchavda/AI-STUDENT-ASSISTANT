import { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronUp, ChevronRight, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { chatAPI } from '../api/client'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
  showAnswer: boolean
}

interface SubCategory {
  name: string
  solved: number
  total: number
}

interface ParentCategory {
  name: string
  icon: string
  subCategories: SubCategory[]
}

const categoryStructure: ParentCategory[] = [
  {
    name: 'Quantitative Aptitude',
    icon: '🔢',
    subCategories: [
      { name: 'Arithmetic Aptitude', solved: 12, total: 50 },
      { name: 'Percentage', solved: 8, total: 40 },
      { name: 'Profit and Loss', solved: 15, total: 45 },
      { name: 'Ratio and Proportion', solved: 10, total: 35 },
      { name: 'Time and Work', solved: 20, total: 50 },
      { name: 'Time and Distance', solved: 5, total: 40 },
      { name: 'Problems on Ages', solved: 7, total: 30 },
      { name: 'Simple Interest', solved: 12, total: 35 },
      { name: 'Compound Interest', solved: 9, total: 30 },
      { name: 'Data Interpretation', solved: 3, total: 45 }
    ]
  },
  {
    name: 'Logical Reasoning',
    icon: '🧠',
    subCategories: [
      { name: 'Logical Reasoning', solved: 18, total: 60 },
      { name: 'Blood Relations', solved: 14, total: 40 },
      { name: 'Coding-Decoding', solved: 11, total: 35 },
      { name: 'Syllogism', solved: 6, total: 30 },
      { name: 'Puzzles', solved: 22, total: 55 },
      { name: 'Series', solved: 16, total: 45 },
      { name: 'Odd Man Out', solved: 9, total: 25 }
    ]
  },
  {
    name: 'Verbal Ability',
    icon: '📝',
    subCategories: [
      { name: 'Synonyms', solved: 25, total: 50 },
      { name: 'Antonyms', solved: 20, total: 50 },
      { name: 'Sentence Correction', solved: 10, total: 40 },
      { name: 'Reading Comprehension', solved: 5, total: 30 },
      { name: 'Spotting Errors', solved: 12, total: 35 }
    ]
  },
  {
    name: 'Company Specific',
    icon: '🏢',
    subCategories: [
      { name: 'TCS Questions', solved: 30, total: 100 },
      { name: 'Infosys Questions', solved: 25, total: 80 },
      { name: 'Wipro Questions', solved: 15, total: 70 },
      { name: 'Amazon Questions', solved: 8, total: 60 },
      { name: 'Microsoft Questions', solved: 5, total: 50 }
    ]
  }
]

export default function AptitudePracticePage() {
  const [selectedCategory, setSelectedCategory] = useState('Arithmetic Aptitude')
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOption, setSelectedOption] = useState<{ [key: number]: string }>({})
  const [expandedParents, setExpandedParents] = useState<string[]>(['Quantitative Aptitude'])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    loadQuestions()
  }, [selectedCategory])

  const loadQuestions = async () => {
    setLoading(true)
    setSelectedOption({})

    try {
      const prompt = `Generate 15 ${selectedCategory} practice questions.

Each question should have:
- question text
- 4 options (A, B, C, D)
- correct answer (A, B, C, or D)
- detailed step-by-step explanation

Format as JSON array:
[
  {
    "question": "question text",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "correctAnswer": "A",
    "explanation": "detailed explanation"
  }
]

Return ONLY valid JSON array, no markdown.`

      const response = await chatAPI.sendMessage([
        { role: 'user', content: prompt, timestamp: new Date().toISOString() }
      ], 'english')

      let questionsData: any[]
      try {
        const jsonMatch = String(response).match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          questionsData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found')
        }
      } catch (parseError) {
        questionsData = generateFallbackQuestions()
      }

      const formattedQuestions: Question[] = questionsData.slice(0, 15).map((q, index) => ({
        id: index + 1,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        showAnswer: false
      }))

      setQuestions(formattedQuestions)
    } catch (error) {
      console.error('Error loading questions:', error)
      setQuestions(generateFallbackQuestions().map((q, index) => ({
        id: index + 1,
        ...q,
        showAnswer: false
      })))
    } finally {
      setLoading(false)
    }
  }

  const generateFallbackQuestions = () => {
    return [
      {
        question: 'If 20% of a number is 50, what is the number?',
        options: ['A) 200', 'B) 250', 'C) 300', 'D) 350'],
        correctAnswer: 'B',
        explanation: 'Let the number be x. Then 20% of x = 50, so (20/100) × x = 50, which gives x = 250.'
      },
      {
        question: 'A train travels 120 km in 2 hours. What is its speed in m/s?',
        options: ['A) 16.67 m/s', 'B) 33.33 m/s', 'C) 60 m/s', 'D) 120 m/s'],
        correctAnswer: 'A',
        explanation: 'Speed = 120 km / 2 hours = 60 km/h. Converting to m/s: 60 × (1000/3600) = 16.67 m/s.'
      },
      {
        question: 'What is the next number in the series: 2, 6, 12, 20, 30, ?',
        options: ['A) 40', 'B) 42', 'C) 44', 'D) 46'],
        correctAnswer: 'B',
        explanation: 'The differences are 4, 6, 8, 10, so the next difference is 12. Therefore, 30 + 12 = 42.'
      },
      {
        question: 'If A:B = 2:3 and B:C = 4:5, what is A:C?',
        options: ['A) 8:15', 'B) 2:5', 'C) 3:5', 'D) 4:5'],
        correctAnswer: 'A',
        explanation: 'A:B = 2:3 and B:C = 4:5. To find A:C, multiply: A:B:C = 8:12:15, so A:C = 8:15.'
      },
      {
        question: 'The average of 5 numbers is 30. If one number is excluded, the average becomes 28. What is the excluded number?',
        options: ['A) 35', 'B) 38', 'C) 40', 'D) 42'],
        correctAnswer: 'B',
        explanation: 'Sum of 5 numbers = 5 × 30 = 150. Sum of 4 numbers = 4 × 28 = 112. Excluded number = 150 - 112 = 38.'
      },
      {
        question: 'A shopkeeper marks his goods 40% above cost price and gives a discount of 20%. What is his profit percentage?',
        options: ['A) 10%', 'B) 12%', 'C) 15%', 'D) 20%'],
        correctAnswer: 'B',
        explanation: 'Let CP = 100. MP = 140. SP = 140 - (20% of 140) = 140 - 28 = 112. Profit = 112 - 100 = 12%.'
      },
      {
        question: 'How many times do the hands of a clock coincide in a day?',
        options: ['A) 20', 'B) 21', 'C) 22', 'D) 24'],
        correctAnswer: 'C',
        explanation: 'The hands coincide 11 times in 12 hours (not at 11 o\'clock). So in 24 hours, they coincide 22 times.'
      },
      {
        question: 'If log₁₀ 2 = 0.3010, what is log₁₀ 8?',
        options: ['A) 0.6020', 'B) 0.9030', 'C) 1.2040', 'D) 2.4080'],
        correctAnswer: 'B',
        explanation: 'log₁₀ 8 = log₁₀ 2³ = 3 × log₁₀ 2 = 3 × 0.3010 = 0.9030.'
      },
      {
        question: 'A can complete a work in 12 days and B in 18 days. How many days will they take together?',
        options: ['A) 6 days', 'B) 7.2 days', 'C) 8 days', 'D) 9 days'],
        correctAnswer: 'B',
        explanation: 'A\'s rate = 1/12, B\'s rate = 1/18. Combined rate = 1/12 + 1/18 = 5/36. Time = 36/5 = 7.2 days.'
      },
      {
        question: 'In how many ways can the letters of the word "LEADER" be arranged?',
        options: ['A) 120', 'B) 180', 'C) 360', 'D) 720'],
        correctAnswer: 'C',
        explanation: 'LEADER has 6 letters with E repeated twice. Arrangements = 6! / 2! = 720 / 2 = 360.'
      },
      {
        question: 'Find the compound interest on Rs. 10,000 at 10% per annum for 2 years compounded annually.',
        options: ['A) Rs. 2,000', 'B) Rs. 2,100', 'C) Rs. 2,200', 'D) Rs. 2,500'],
        correctAnswer: 'B',
        explanation: 'CI = P(1 + r/100)^n - P = 10000(1.1)² - 10000 = 12100 - 10000 = Rs. 2,100.'
      },
      {
        question: 'A man buys an article for Rs. 80 and sells it for Rs. 100. What is his profit percentage?',
        options: ['A) 20%', 'B) 25%', 'C) 30%', 'D) 35%'],
        correctAnswer: 'B',
        explanation: 'Profit = 100 - 80 = 20. Profit% = (20/80) × 100 = 25%.'
      },
      {
        question: 'If the ratio of boys to girls in a class is 3:2 and there are 15 boys, how many girls are there?',
        options: ['A) 8', 'B) 10', 'C) 12', 'D) 15'],
        correctAnswer: 'B',
        explanation: 'Boys:Girls = 3:2. If boys = 15, then 3x = 15, so x = 5. Girls = 2x = 2 × 5 = 10.'
      },
      {
        question: 'A car covers a distance of 300 km in 5 hours. What is its average speed?',
        options: ['A) 50 km/h', 'B) 60 km/h', 'C) 70 km/h', 'D) 80 km/h'],
        correctAnswer: 'B',
        explanation: 'Average speed = Total distance / Total time = 300 / 5 = 60 km/h.'
      },
      {
        question: 'The sum of three consecutive odd numbers is 63. What is the largest number?',
        options: ['A) 19', 'B) 21', 'C) 23', 'D) 25'],
        correctAnswer: 'C',
        explanation: 'Let the numbers be x, x+2, x+4. Then x + (x+2) + (x+4) = 63, so 3x + 6 = 63, x = 19. Largest = 19 + 4 = 23.'
      }
    ]
  }

  const toggleParent = (parentName: string) => {
    setExpandedParents(prev =>
      prev.includes(parentName)
        ? prev.filter(p => p !== parentName)
        : [...prev, parentName]
    )
  }

  const handleSubCategoryClick = (subCategoryName: string) => {
    setSelectedCategory(subCategoryName)
    setSidebarOpen(false) // Close sidebar on mobile after selection
  }

  const toggleAnswer = (questionId: number) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, showAnswer: !q.showAnswer } : q
    ))
  }

  const handleOptionSelect = (questionId: number, option: string) => {
    setSelectedOption(prev => ({ ...prev, [questionId]: option }))
  }

  const filteredQuestions = questions.filter(q =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <h1 className="text-xl font-bold text-gray-900">Aptitude Practice</h1>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="text-sm text-gray-600 hidden sm:block">
              {filteredQuestions.length} Questions
            </div>
          </div>
        </div>
      </header>

      {/* 2-Column Layout */}
      <div className="flex max-w-7xl mx-auto relative">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar - Nested Categories with Accordion */}
        <aside
          className={`
            w-64 flex-shrink-0 border-r border-gray-100 h-screen sticky top-[57px] overflow-y-auto bg-white
            fixed lg:static z-40 transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
              Practice Categories
            </h2>
            
            <nav className="space-y-1">
              {categoryStructure.map((parent) => {
                const isExpanded = expandedParents.includes(parent.name)
                
                return (
                  <div key={parent.name} className="mb-2">
                    {/* Parent Category */}
                    <button
                      onClick={() => toggleParent(parent.name)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{parent.icon}</span>
                        <span>{parent.name}</span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {/* Sub-categories with Accordion Animation */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-2">
                            {parent.subCategories.map((sub) => {
                              const isActive = selectedCategory === sub.name
                              const progressPercent = Math.round((sub.solved / sub.total) * 100)
                              
                              return (
                                <button
                                  key={sub.name}
                                  onClick={() => handleSubCategoryClick(sub.name)}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                    isActive
                                      ? 'bg-blue-50 text-blue-700 font-medium'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="flex-1">{sub.name}</span>
                                    {/* Progress Badge */}
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        isActive
                                          ? 'bg-blue-100 text-blue-700'
                                          : 'bg-gray-100 text-gray-600'
                                      }`}
                                    >
                                      {sub.solved}/{sub.total}
                                    </span>
                                  </div>
                                  {/* Progress Bar */}
                                  <div className="mt-1.5 h-1 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        isActive ? 'bg-blue-600' : 'bg-gray-400'
                                      }`}
                                      style={{ width: `${progressPercent}%` }}
                                    />
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Right Main Area - Questions */}
        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading questions...</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredQuestions.map((question) => (
                <div key={question.id} className="p-6 hover:bg-gray-50 transition-colors">
                  {/* Question Number & Text */}
                  <div className="mb-4">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded mb-2">
                      Question {question.id}
                    </span>
                    <p className="text-base text-gray-800 leading-relaxed font-normal">
                      {question.question}
                    </p>
                  </div>

                  {/* Options as Radio Buttons */}
                  <div className="space-y-2 mb-4">
                    {question.options.map((option) => {
                      const optionLetter = option.charAt(0)
                      const isSelected = selectedOption[question.id] === optionLetter
                      const isCorrect = question.showAnswer && optionLetter === question.correctAnswer
                      const isWrong = question.showAnswer && isSelected && optionLetter !== question.correctAnswer

                      return (
                        <label
                          key={option}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            isCorrect
                              ? 'bg-green-50 border border-green-300'
                              : isWrong
                              ? 'bg-red-50 border border-red-300'
                              : isSelected
                              ? 'bg-blue-50 border border-blue-300'
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={isSelected}
                            onChange={() => handleOptionSelect(question.id, optionLetter)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={`text-sm ${
                            isCorrect ? 'text-green-800 font-medium' : 
                            isWrong ? 'text-red-800' : 
                            'text-gray-700'
                          }`}>
                            {option}
                          </span>
                          {isCorrect && (
                            <span className="ml-auto text-green-600 text-xs font-semibold">✓ Correct</span>
                          )}
                        </label>
                      )
                    })}
                  </div>

                  {/* View Answer Button */}
                  <button
                    onClick={() => toggleAnswer(question.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {question.showAnswer ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Hide Answer
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        View Answer
                      </>
                    )}
                  </button>

                  {/* Answer Explanation - Smooth Expand */}
                  <AnimatePresence>
                    {question.showAnswer && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {question.correctAnswer}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                                Correct Answer: Option {question.correctAnswer}
                              </h4>
                              <p className="text-sm text-blue-800 leading-relaxed">
                                <span className="font-semibold">Explanation:</span> {question.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {!loading && filteredQuestions.length > 0 && (
            <div className="p-6 text-center border-t border-gray-100">
              <button
                onClick={loadQuestions}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Load More Questions
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
