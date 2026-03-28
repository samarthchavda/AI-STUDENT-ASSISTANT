import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { dsaAPI, DSAQuestionDetail } from '../api/client'
import Header from '../components/Header'
import Editor from '@monaco-editor/react'
import toast, { Toaster } from 'react-hot-toast'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  Play, Send, Lightbulb, BookOpen, ArrowLeft, CheckCircle,
  XCircle, Clock, Zap, Code2, Copy, X, FileText, Award, History
} from 'lucide-react'

type TabType = 'description' | 'editorial' | 'submissions'

export default function DSAProblemPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [problem, setProblem] = useState<DSAQuestionDetail | null>(null)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [output, setOutput] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('description')
  
  // Modals
  const [showSolutionModal, setShowSolutionModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [solution, setSolution] = useState<any>(null)
  const [loadingSolution, setLoadingSolution] = useState(false)

  useEffect(() => {
    loadProblem()
  }, [id])

  useEffect(() => {
    if (problem && problem.starter_code) {
      const starterCode = problem.starter_code[language as keyof typeof problem.starter_code]
      if (starterCode) {
        setCode(starterCode)
      }
    }
  }, [language, problem])

  const loadProblem = async () => {
    try {
      const res = await dsaAPI.getQuestion(Number(id))
      setProblem(res.data)
      if (res.data.starter_code?.python) {
        setCode(res.data.starter_code.python)
      }
    } catch (error) {
      console.error('Failed to load problem:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRun = async () => {
    if (!problem) return
    
    setRunning(true)
    setOutput(null)
    
    try {
      const res = await dsaAPI.runCode({
        problem_id: problem.id,
        code,
        language
      })
      setOutput(res.data)
    } catch (error: any) {
      setOutput({
        status: 'error',
        message: error.response?.data?.detail || 'Failed to run code'
      })
    } finally {
      setRunning(false)
    }
  }

  const handleGetSolution = async () => {
    if (!problem) return
    
    setLoadingSolution(true)
    setShowSolutionModal(true)
    
    try {
      const res = await dsaAPI.getSolution(problem.id, language)
      setSolution(res.data)
      
      // If cached, no loading was needed - instant!
      if (res.data.cached) {
        console.log('✅ Solution loaded from cache (instant)')
      } else {
        console.log('⚠️ Solution generated with AI (saved to cache for next time)')
      }
    } catch (error: any) {
      console.error('Failed to get solution:', error)
      
      // Check if it's a limit exceeded error
      if (error.response?.status === 403 && error.response?.data?.detail?.error === 'limit_exceeded') {
        setShowSolutionModal(false)
        setShowUpgradeModal(true)
      } else {
        setSolution({ 
          solution: 'Failed to load solution. Please try again.',
          solution_python: null,
          solution_javascript: null,
          solution_cpp: null,
          solutions_cache: null
        })
      }
    } finally {
      setLoadingSolution(false)
    }
  }

  const getLanguageSolutionCode = () => {
    if (!solution) return null
    
    // PRIORITY 1: Check solutions_cache (instant, no latency)
    if (solution.solutions_cache) {
      const cached = solution.solutions_cache[language]
      if (cached) {
        return cached
      }
    }
    
    // PRIORITY 2: Try language-specific field
    const languageKey = `solution_${language}` as keyof typeof solution
    if (solution[languageKey]) {
      return solution[languageKey] as string
    }
    
    // PRIORITY 3: Fallback to extracting from general solution field
    if (solution.solution) {
      // Look for code blocks with language tag
      const langPattern = new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\`\`\``)
      const match = solution.solution.match(langPattern)
      if (match) {
        return match[1].trim()
      }
      
      // Try without language tag
      const genericPattern = /```[\w]*\n([\s\S]*?)```/
      const genericMatch = solution.solution.match(genericPattern)
      if (genericMatch) {
        return genericMatch[1].trim()
      }
    }
    
    return null
  }

  const copyToEditor = async () => {
    const solutionCode = getLanguageSolutionCode()
    
    if (!solutionCode) {
      toast.error(`No solution available for ${language.toUpperCase()}`, {
        icon: '⚠️',
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
          fontWeight: '600',
        },
      })
      return
    }
    
    try {
      // Update the editor with solution code
      setCode(solutionCode)
      
      // Close the modal
      setShowSolutionModal(false)
      
      // Show success toast
      toast.success(`${language.toUpperCase()} solution copied to editor!`, {
        icon: '✨',
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
          fontWeight: '600',
        },
      })
      
      // Optional: Auto-run the code after a short delay
      setTimeout(() => {
        handleRun()
      }, 500)
      
    } catch (error) {
      console.error('Failed to copy solution:', error)
      toast.error('Failed to copy solution')
    }
  }

  const getLanguageMode = () => {
    switch (language) {
      case 'python': return 'python'
      case 'javascript': return 'javascript'
      case 'cpp': return 'cpp'
      default: return 'python'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-emerald-500 bg-emerald-50/50 border-emerald-200'
      case 'medium': return 'text-amber-500 bg-amber-50/50 border-amber-200'
      case 'hard': return 'text-rose-500 bg-rose-50/50 border-rose-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mb-4"></div>
          <p className="text-gray-300 font-medium">Loading problem...</p>
        </div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 mb-4">Problem not found</p>
          <button
            onClick={() => navigate('/dsa/dashboard')}
            className="text-purple-400 hover:text-purple-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      <Toaster position="top-right" />
      <Header />
      
      {/* Main Content - Fixed Height with Independent Scrolling */}
      <div className="flex-1 flex mt-20 overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 flex flex-col bg-white border-r border-gray-200">
          {/* Tabs Header */}
          <div className="flex items-center border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === 'description'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              Description
            </button>
            <button
              onClick={() => setActiveTab('editorial')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === 'editorial'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Editorial
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === 'submissions'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <History className="w-4 h-4" />
              Submissions
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {activeTab === 'description' && (
                <>
                  {/* Back Button */}
                  <button
                    onClick={() => navigate('/dsa/dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-medium">Back to Problems</span>
                  </button>

                  {/* Title */}
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{problem.title}</h1>

                  {/* Meta Info */}
                  <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {problem.topic.replace('_', ' ')}
                    </span>
                    {problem.company && problem.company.split(',').map((company, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-full text-sm font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        {company.trim()}
                      </span>
                    ))}
                  </div>

                  {/* User Progress - Glassmorphism */}
                  {problem.user_progress && (
                    <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold text-gray-900">Your Progress</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Status</p>
                          <p className="font-bold text-gray-900 capitalize">{problem.user_progress.status}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Attempts</p>
                          <p className="font-bold text-gray-900">{problem.user_progress.attempts}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Best Score</p>
                          <p className="font-bold text-gray-900">{problem.user_progress.best_score}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Problem Statement</h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{problem.description}</p>
                    </div>
                  </div>

                  {/* Examples */}
                  {problem.examples && problem.examples.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">Examples</h2>
                      {problem.examples.map((example, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-xl p-5 mb-4 border border-gray-200">
                          <p className="text-sm font-bold text-gray-900 mb-3">Example {idx + 1}</p>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-semibold text-gray-700">Input:</span>
                              <pre className="mt-1 text-sm text-gray-900 bg-white p-3 rounded-lg border border-gray-200 font-mono">{example.input}</pre>
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-700">Output:</span>
                              <pre className="mt-1 text-sm text-gray-900 bg-white p-3 rounded-lg border border-gray-200 font-mono">{example.output}</pre>
                            </div>
                            {example.explanation && (
                              <div>
                                <span className="text-sm font-semibold text-gray-700">Explanation:</span>
                                <p className="mt-1 text-sm text-gray-600 leading-relaxed">{example.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Constraints */}
                  {problem.constraints && (
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">Constraints</h2>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-gray-700 whitespace-pre-wrap font-mono text-sm">{problem.constraints}</p>
                      </div>
                    </div>
                  )}

                  {/* Complexity */}
                  {(problem.time_complexity || problem.space_complexity) && (
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">Expected Complexity</h2>
                      <div className="grid grid-cols-2 gap-4">
                        {problem.time_complexity && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-sm text-gray-600 mb-1">Time Complexity</p>
                            <p className="text-lg font-bold text-blue-700 font-mono">{problem.time_complexity}</p>
                          </div>
                        )}
                        {problem.space_complexity && (
                          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                            <p className="text-sm text-gray-600 mb-1">Space Complexity</p>
                            <p className="text-lg font-bold text-purple-700 font-mono">{problem.space_complexity}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'editorial' && (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Editorial coming soon!</p>
                  <button
                    onClick={handleGetSolution}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    View Solution
                  </button>
                </div>
              )}

              {activeTab === 'submissions' && (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No submissions yet</p>
                  <p className="text-sm text-gray-500 mt-2">Submit your solution to see it here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col bg-[#1e1e1e]">
          {/* Editor Header - Dark Theme */}
          <div className="bg-[#252526] border-b border-gray-700 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Code2 className="w-5 h-5 text-gray-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#3c3c3c] text-gray-200 px-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGetSolution}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                <BookOpen className="w-4 h-4" />
                Solution
              </button>
              <button
                onClick={handleRun}
                disabled={running}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {running ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Running
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run
                  </>
                )}
              </button>
              <button
                onClick={handleRun}
                disabled={running}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg"
              >
                <Send className="w-4 h-4" />
                Submit
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={getLanguageMode()}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                fontLigatures: true,
              }}
            />
          </div>

          {/* Output Panel */}
          <div className="h-64 bg-[#1e1e1e] border-t border-gray-700 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-yellow-400" />
                Output
              </h3>
              
              {running ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500 mb-3"></div>
                    <p className="text-gray-400 font-medium">Running your code...</p>
                  </div>
                </div>
              ) : output ? (
                <div>
                  {output.status === 'accepted' ? (
                    <div className="bg-emerald-900/30 border-2 border-emerald-500 rounded-xl p-6">
                      <div className="flex items-center gap-3 text-emerald-400 mb-3">
                        <CheckCircle className="w-6 h-6" />
                        <span className="text-xl font-bold">Accepted!</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-300 font-medium">✓ Passed {output.passed}/{output.total} test cases</p>
                        <p className="text-gray-300 font-medium">Score: <span className="text-emerald-400 text-lg font-bold">{output.score}%</span></p>
                        <p className="text-sm text-gray-400 mt-3">{output.message}</p>
                      </div>
                      
                      {/* Test Results Details */}
                      {output.test_results && output.test_results.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm text-gray-400 font-semibold mb-2">Test Cases:</p>
                          {output.test_results.map((test: any, idx: number) => (
                            <div key={idx} className="bg-emerald-900/20 rounded-lg p-3 text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-300 font-semibold">Test Case {test.test_case}</span>
                              </div>
                              <div className="text-gray-400 ml-6">
                                <p>Input: <span className="text-gray-300 font-mono">{JSON.stringify(test.input)}</span></p>
                                <p>Output: <span className="text-emerald-300 font-mono">{JSON.stringify(test.actual)}</span></p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : output.status === 'wrong_answer' ? (
                    <div className="bg-rose-900/30 border-2 border-rose-500 rounded-xl p-6">
                      <div className="flex items-center gap-3 text-rose-400 mb-3">
                        <XCircle className="w-6 h-6" />
                        <span className="text-xl font-bold">Wrong Answer</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-300 font-medium">✗ Passed {output.passed}/{output.total} test cases</p>
                        <p className="text-sm text-gray-400 mt-3">Review your logic and try again</p>
                      </div>
                      
                      {/* Test Results Details */}
                      {output.test_results && output.test_results.length > 0 && (
                        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                          <p className="text-sm text-gray-400 font-semibold mb-2">Test Cases:</p>
                          {output.test_results.map((test: any, idx: number) => (
                            <div key={idx} className={`rounded-lg p-3 text-sm ${
                              test.passed 
                                ? 'bg-emerald-900/20 border border-emerald-700/30' 
                                : 'bg-rose-900/20 border border-rose-700/30'
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                {test.passed ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-rose-400" />
                                )}
                                <span className={`font-semibold ${test.passed ? 'text-emerald-300' : 'text-rose-300'}`}>
                                  Test Case {test.test_case}
                                </span>
                              </div>
                              <div className="text-gray-400 ml-6 space-y-1">
                                <p>Input: <span className="text-gray-300 font-mono text-xs">{JSON.stringify(test.input)}</span></p>
                                <p>Expected: <span className="text-emerald-300 font-mono text-xs">{JSON.stringify(test.expected)}</span></p>
                                <p>Your Output: <span className={`font-mono text-xs ${test.passed ? 'text-emerald-300' : 'text-rose-300'}`}>
                                  {test.actual !== null ? JSON.stringify(test.actual) : 'None'}
                                </span></p>
                                {test.error && (
                                  <p className="text-rose-400 text-xs mt-1">Error: {test.error}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {output.error_message && (
                        <div className="mt-4 bg-rose-900/20 rounded-lg p-3">
                          <p className="text-rose-300 text-sm font-mono">{output.error_message}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-800 border border-gray-600 rounded-xl p-6">
                      <p className="text-gray-300 font-mono text-sm">{output.message || output.error_message}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">Click "Run" to execute your code</p>
                  <p className="text-sm text-gray-600 mt-2">Test cases will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Solution Modal - Slide Over */}
      {showSolutionModal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSolutionModal(false)}></div>
          
          <div className="fixed inset-y-0 right-0 max-w-4xl w-full bg-white shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto">
            <div className="min-h-full flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Optimized Solution</h3>
                    <p className="text-sm text-purple-100">
                      {solution?.cached ? (
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Instant Load (Cached)
                        </span>
                      ) : (
                        'AI Generated'
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSolutionModal(false)}
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 p-6">
                {loadingSolution ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mb-3"></div>
                      <p className="text-gray-600 font-medium">Loading solution...</p>
                    </div>
                  </div>
                ) : solution ? (
                  <div className="space-y-6">
                    {/* Language Selector - Instant Switching */}
                    {solution.solutions_cache && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-200 rounded-xl p-4">
                        <p className="text-sm text-gray-700 font-semibold mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-purple-600" />
                          Switch Language (Instant - No Loading)
                        </p>
                        <div className="flex gap-2">
                          {['python', 'javascript', 'cpp'].map((lang) => (
                            <button
                              key={lang}
                              onClick={() => setLanguage(lang)}
                              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                language === lang
                                  ? 'bg-purple-600 text-white shadow-lg'
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                              }`}
                            >
                              {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Approach Explanation */}
                    {solution.solution && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-purple-600" />
                          Approach & Algorithm
                        </h4>
                        <div className="prose prose-gray max-w-none">
                          <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans text-sm">
                            {solution.solution.split('```')[0].trim()}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Language-Specific Code */}
                    {(() => {
                      const solutionCode = getLanguageSolutionCode()
                      
                      if (solutionCode) {
                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                <Code2 className="w-5 h-5 text-purple-600" />
                                {language.toUpperCase()} Implementation
                              </h4>
                              <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
                                Optimized Solution
                              </span>
                            </div>
                            
                            <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
                              <SyntaxHighlighter
                                language={language === 'cpp' ? 'cpp' : language}
                                style={vscDarkPlus}
                                showLineNumbers={true}
                                customStyle={{
                                  margin: 0,
                                  padding: '1.5rem',
                                  fontSize: '14px',
                                  lineHeight: '1.6',
                                  borderRadius: '0',
                                }}
                                codeTagProps={{
                                  style: {
                                    fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                                  }
                                }}
                              >
                                {solutionCode}
                              </SyntaxHighlighter>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <p className="text-sm text-blue-900">
                                <span className="font-semibold">💡 Tip:</span> Read the inline comments to understand each step of the algorithm.
                              </p>
                            </div>
                          </div>
                        )
                      } else {
                        return (
                          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-8 text-center">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Code2 className="w-8 h-8 text-amber-600" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">
                              Solution for {language.toUpperCase()} is coming soon!
                            </h4>
                            <p className="text-gray-600 text-sm mb-4">
                              We're working on adding solutions for all languages. Try switching to Python for now.
                            </p>
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => setLanguage('python')}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors text-sm"
                              >
                                Switch to Python
                              </button>
                            </div>
                          </div>
                        )
                      }
                    })()}

                    {/* Complexity Analysis */}
                    {(solution.time_complexity || solution.space_complexity) && (
                      <div className="grid grid-cols-2 gap-4">
                        {solution.time_complexity && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-sm text-gray-600 mb-1">Time Complexity</p>
                            <p className="text-lg font-bold text-blue-700 font-mono">{solution.time_complexity}</p>
                          </div>
                        )}
                        {solution.space_complexity && (
                          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                            <p className="text-sm text-gray-600 mb-1">Space Complexity</p>
                            <p className="text-lg font-bold text-purple-700 font-mono">{solution.space_complexity}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">No solution available</p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between sticky bottom-0">
                <button
                  onClick={() => setShowSolutionModal(false)}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
                {getLanguageSolutionCode() && (
                  <button
                    onClick={copyToEditor}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all shadow-lg"
                  >
                    <Copy className="w-4 h-4" />
                    Copy {language.toUpperCase()} to Editor
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade to PRO Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowUpgradeModal(false)}></div>
            
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all">
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 px-8 py-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Unlock Unlimited Solutions</h2>
                  <p className="text-purple-100 text-lg">You've used your 2 free solution views</p>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 py-8">
                <div className="space-y-6">
                  {/* Benefits */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Unlimited AI Solutions</h3>
                        <p className="text-gray-600 text-sm">Get optimized, commented solutions for every DSA problem in Python, JavaScript, and C++</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Code2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Copy to Editor & Auto-Run</h3>
                        <p className="text-gray-600 text-sm">Instantly test solutions in your code editor with one click</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Progressive Hints System</h3>
                        <p className="text-gray-600 text-sm">Get AI-powered hints without spoiling the solution</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">AI Code Review</h3>
                        <p className="text-gray-600 text-sm">Get detailed feedback on your code quality and optimization</p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">Upgrade to PRO</p>
                    <div className="flex items-baseline justify-center gap-2 mb-3">
                      <span className="text-5xl font-bold text-gray-900">₹499</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <p className="text-sm text-purple-700 font-semibold">Save 40% with annual plan - ₹2,999/year</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-4">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="flex-1 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Upgrade to PRO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
