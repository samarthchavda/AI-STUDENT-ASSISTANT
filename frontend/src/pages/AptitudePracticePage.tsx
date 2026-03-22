import { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronUp, ChevronRight, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Question {
  id: string
  question: string
  image: string | null
  has_image: boolean
  options: Array<{ key: string; text: string }>
  answer: string
  explanation: string
  category: string
  subcategory: string
  difficulty: string
  tags: string[]
  source: string
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

// Initial structure - will be populated dynamically from API
const getInitialCategoryStructure = (): ParentCategory[] => [
  {
    name: 'Aptitude',
    icon: '🔢',
    subCategories: []
  },
  {
    name: 'Logical Reasoning',
    icon: '🧠',
    subCategories: []
  },
  {
    name: 'Verbal Ability',
    icon: '📝',
    subCategories: []
  }
]

// Map subcategories to parent categories
const subcategoryToParent: { [key: string]: string } = {
  'Average': 'Aptitude',
  'Percentage': 'Aptitude',
  'Profit and Loss': 'Aptitude',
  'Time and Distance': 'Aptitude',
  'Time and Work': 'Aptitude',
  'Ratio and Proportion': 'Aptitude',
  'Simple Interest': 'Aptitude',
  'Compound Interest': 'Aptitude',
  'Pipes and Cisterns': 'Aptitude',
  'Problems on Trains': 'Aptitude',
  'Boats and Streams': 'Aptitude',
  'Alligation or Mixture': 'Aptitude',
  'Problems on Ages': 'Aptitude',
  'Calendar': 'Aptitude',
  'Clock': 'Aptitude',
  'Height and Distance': 'Aptitude',
  'Area': 'Aptitude',
  'Volume and Surface Area': 'Aptitude',
  'Permutation and Combination': 'Aptitude',
  'Probability': 'Aptitude',
  'True Discount': 'Aptitude',
  "Banker's Discount": 'Aptitude',
  'Stocks and Shares': 'Aptitude',
  'Puzzles': 'Logical Reasoning',
  'Verbal Reasoning': 'Logical Reasoning',
  'Odd Man Out': 'Logical Reasoning',
  'Series': 'Logical Reasoning',
  'Coding Decoding': 'Logical Reasoning',
  'Blood Relations': 'Logical Reasoning',
  'Synonyms': 'Verbal Ability',
  'Antonyms': 'Verbal Ability',
  'Sentence Correction': 'Verbal Ability',
  'Spotting Errors': 'Verbal Ability'
}

export default function AptitudePracticePage() {
  const [selectedCategory, setSelectedCategory] = useState('Average')
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOption, setSelectedOption] = useState<{ [key: string]: string }>({})
  const [expandedParents, setExpandedParents] = useState<string[]>(['Aptitude'])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [categoryCounts, setCategoryCounts] = useState<{ [key: string]: number }>({})
  const [categoryStructure, setCategoryStructure] = useState<ParentCategory[]>(getInitialCategoryStructure())
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const questionsPerPage = 10

  // Fetch category counts on mount and build dynamic structure
  useEffect(() => {
    fetchCategoryCounts()
  }, [])

  const fetchCategoryCounts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/aptitude/practice-categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const counts: { [key: string]: number } = {}
        
        // Build dynamic category structure
        const newStructure = getInitialCategoryStructure()
        
        data.categories.forEach((cat: any) => {
          counts[cat.subcategory] = cat.total_questions
          
          // Find parent category
          const parentName = subcategoryToParent[cat.subcategory] || 'Aptitude'
          const parent = newStructure.find(p => p.name === parentName)
          
          if (parent) {
            parent.subCategories.push({
              name: cat.subcategory,
              solved: 0,
              total: cat.total_questions
            })
          }
        })
        
        // Sort subcategories alphabetically within each parent
        newStructure.forEach(parent => {
          parent.subCategories.sort((a, b) => a.name.localeCompare(b.name))
        })
        
        setCategoryCounts(counts)
        setCategoryStructure(newStructure)
        
        // Set first available subcategory as selected
        if (newStructure[0]?.subCategories[0]) {
          setSelectedCategory(newStructure[0].subCategories[0].name)
        }
      }
    } catch (error) {
      console.error('Error fetching category counts:', error)
    }
  }

  useEffect(() => {
    setCurrentPage(1) // Reset to page 1 when category changes
    loadQuestions(1)
  }, [selectedCategory])

  useEffect(() => {
    if (currentPage > 1) {
      loadQuestions(currentPage)
    }
  }, [currentPage])

  const loadQuestions = async (page: number = 1) => {
    setLoading(true)
    setSelectedOption({})

    try {
      const offset = (page - 1) * questionsPerPage
      // Fetch questions from database with pagination
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/aptitude/practice-questions?subcategory=${encodeURIComponent(selectedCategory)}&limit=${questionsPerPage}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }

      const data = await response.json()
      
      const formattedQuestions: Question[] = data.questions.map((q: any) => ({
        ...q,
        showAnswer: false
      }))

      setQuestions(formattedQuestions)
      setTotalQuestions(data.total || formattedQuestions.length)
    } catch (error) {
      console.error('Error loading questions:', error)
      setQuestions([])
      setTotalQuestions(0)
    } finally {
      setLoading(false)
    }
  }

  const toggleAnswer = (questionId: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, showAnswer: !q.showAnswer } : q
    ))
  }

  const handleOptionSelect = (questionId: string, option: string) => {
    setSelectedOption(prev => ({ ...prev, [questionId]: option }))
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
    window.scrollTo({ top: 0, behavior: 'smooth' }) // Scroll to top
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' }) // Scroll to top when changing pages
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
              {filteredQuestions.length > 0 ? `${filteredQuestions.length} Questions` : 'No Questions'}
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
                              const totalQuestions = categoryCounts[sub.name] || 0
                              const isComingSoon = totalQuestions === 0
                              
                              return (
                                <button
                                  key={sub.name}
                                  onClick={() => !isComingSoon && handleSubCategoryClick(sub.name)}
                                  disabled={isComingSoon}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                    isActive
                                      ? 'bg-blue-50 text-blue-700 font-medium'
                                      : isComingSoon
                                      ? 'text-gray-400 cursor-not-allowed'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="flex-1">{sub.name}</span>
                                    {/* Count Badge */}
                                    {isComingSoon ? (
                                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
                                        Coming Soon
                                      </span>
                                    ) : (
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                          isActive
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}
                                      >
                                        {totalQuestions}
                                      </span>
                                    )}
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
              {filteredQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon!</h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Questions for <span className="font-semibold text-blue-600">{selectedCategory}</span> are being prepared. 
                    Check back soon or try another category!
                  </p>
                </div>
              ) : (
                filteredQuestions.map((question, index) => (
                <div key={question.id} className="p-6 hover:bg-gray-50 transition-colors">
                  {/* Question Number & Text */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                        Question {index + 1}
                      </span>
                    </div>
                    <p className="text-base text-gray-800 leading-relaxed font-normal">
                      {question.question}
                    </p>
                    {question.has_image && question.image && (
                      <img src={question.image} alt="Question" className="mt-3 max-w-md rounded-lg border border-gray-200" />
                    )}
                  </div>

                  {/* Options as Radio Buttons */}
                  <div className="space-y-2 mb-4">
                    {question.options.map((option) => {
                      const optionLetter = option.key
                      const isSelected = selectedOption[question.id] === optionLetter
                      const isCorrect = question.showAnswer && optionLetter === question.answer
                      const isWrong = question.showAnswer && isSelected && optionLetter !== question.answer

                      return (
                        <label
                          key={option.key}
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
                            {option.key}) {option.text}
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
                                {question.answer}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                                Correct Answer: Option {question.answer}
                              </h4>
                              <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-line">
                                <span className="font-semibold">Explanation:</span> {question.explanation}
                              </p>
                              {question.source && (
                                <p className="text-xs text-blue-600 mt-2">Source: {question.source}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )))}
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredQuestions.length > 0 && totalQuestions > questionsPerPage && (
            <div className="p-6 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {(() => {
                  const totalPages = Math.ceil(totalQuestions / questionsPerPage)
                  const pages = []
                  const maxVisible = 5
                  
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
                  let endPage = Math.min(totalPages, startPage + maxVisible - 1)
                  
                  if (endPage - startPage < maxVisible - 1) {
                    startPage = Math.max(1, endPage - maxVisible + 1)
                  }

                  // First page
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className="px-4 py-2 rounded-lg font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        1
                      </button>
                    )
                    if (startPage > 2) {
                      pages.push(
                        <span key="dots1" className="px-2 text-gray-400">...</span>
                      )
                    }
                  }

                  // Visible pages
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          currentPage === i
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {i}
                      </button>
                    )
                  }

                  // Last page
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="dots2" className="px-2 text-gray-400">...</span>
                      )
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className="px-4 py-2 rounded-lg font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {totalPages}
                      </button>
                    )
                  }

                  return pages
                })()}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(Math.min(Math.ceil(totalQuestions / questionsPerPage), currentPage + 1))}
                  disabled={currentPage >= Math.ceil(totalQuestions / questionsPerPage)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage >= Math.ceil(totalQuestions / questionsPerPage)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>

              {/* Page Info */}
              <div className="text-center mt-4 text-sm text-gray-600">
                Showing {((currentPage - 1) * questionsPerPage) + 1} - {Math.min(currentPage * questionsPerPage, totalQuestions)} of {totalQuestions} questions
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
