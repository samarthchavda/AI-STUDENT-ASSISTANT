import { useState, useRef, useEffect } from 'react'
import { Send, Brain, Loader, Mic, MicOff, Plus, BookOpen, Briefcase, Upload, Copy, Check, Zap, Bug, Sparkles, FileCode } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { chatAPI, ChatMessage } from '../../api/client'
import Header from '../../components/Header'
import { useAppStore } from '../../store/useAppStore'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'
import 'highlight.js/styles/github-dark.css'

const GUEST_CHAT_LIMIT = 10
const GUEST_CHAT_USAGE_KEY = 'guest_chat_usage'

const quickInputActions = [
  { label: 'Explain Code', icon: Sparkles, prompt: 'Explain this code in detail: ' },
  { label: 'Fix Bugs', icon: Bug, prompt: 'Debug this code: ' },
  { label: 'Optimize', icon: Zap, prompt: 'Optimize this code: ' },
  { label: 'Write Code', icon: FileCode, prompt: 'Write complete code for: ' },
  { label: 'Roadmap', icon: BookOpen, prompt: 'Create a placement preparation roadmap for ' },
  { label: 'Resume Help', icon: Briefcase, prompt: 'Review my resume and suggest improvements' },
]

export default function ChatPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAppStore()

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '### AI Coding Assistant\n\nHello! I\'m your engineering mentor. Ask me anything about:\n\n• Code debugging & optimization\n• DSA problems & solutions\n• Interview preparation\n• Career roadmaps\n• Resume reviews\n\nWhat can I help you with today?'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedCodeBlockKey, setCopiedCodeBlockKey] = useState<string | null>(null)
  const [guestChatsUsed, setGuestChatsUsed] = useState(() => Number(localStorage.getItem(GUEST_CHAT_USAGE_KEY) || 0))
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const plusMenuRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  
  const guestLimitReached = !isAuthenticated && guestChatsUsed >= GUEST_CHAT_LIMIT
  const guestChatsRemaining = Math.max(0, GUEST_CHAT_LIMIT - guestChatsUsed)

  const detectLanguage = (text: string) => {
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gujarati'
    if (/[\u0900-\u097F]/.test(text)) return 'hindi'
    return 'english'
  }

  const extractFollowUpSuggestions = (text: string): { mainText: string; suggestions: string[]; hasExamRedirect: boolean } => {
    const hasExamRedirect = text.includes('[REDIRECT_EXAM]')
    let cleanedText = text.replace(/\[REDIRECT_EXAM\]/g, '').trim()
    
    const suggestionPatterns = [
      /✅\s*If you want, I can also show you:(\n•[^\n]+)*/,
      /✅\s*જો તમે ઇચ્છો તો, હું આને પણ બતાવી શકું:(\n•[^\n]+)*/,
      /✅\s*अगर आप चाहें तो, मैं आपको यह भी दिखा सकता हूँ:(\n•[^\n]+)*/
    ]
    
    let match = null
    for (const pattern of suggestionPatterns) {
      match = cleanedText.match(pattern)
      if (match) break
    }
    
    if (match) {
      const mainText = cleanedText.substring(0, match.index).trim()
      const suggestionsText = match[0]
      const suggestions = suggestionsText
        .split('\n')
        .filter(line => line.trim().startsWith('•'))
        .map(line => line.replace(/^\s*•\s*/, '').trim())
        .filter(s => s.length > 0)
      
      return { mainText, suggestions, hasExamRedirect }
    }
    
    return { mainText: cleanedText, suggestions: [], hasExamRedirect }
  }

  const appendGuestLimitMessage = () => {
    setMessages((prev) => {
      const lockMessage = 'You have used all 10 free guest chats. Please Sign Up or Login to continue chatting.'
      const lastMessage = prev[prev.length - 1]
      if (lastMessage?.role === 'assistant' && lastMessage.content === lockMessage) {
        return prev
      }
      return [...prev, { role: 'assistant', content: lockMessage, timestamp: new Date().toISOString() }]
    })
  }

  const recordGuestChatUsage = () => {
    if (isAuthenticated) return
    setGuestChatsUsed((prev) => {
      const nextValue = prev + 1
      localStorage.setItem(GUEST_CHAT_USAGE_KEY, String(nextValue))
      return nextValue
    })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-focus input after AI response completes
  useEffect(() => {
    if (!isLoading && messages.length > 1 && messages[messages.length - 1].role === 'assistant') {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isLoading, messages])

  // Close plus menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false)
      }
    }
    if (showPlusMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPlusMenu])

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = navigator.language || 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
        setTimeout(() => {
          if (transcript.trim()) {
            handleVoiceSend(transcript)
          }
        }, 500)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const handleVoiceSend = async (voiceInput: string) => {
    if (!voiceInput.trim() || isLoading) return
    if (guestLimitReached) {
      appendGuestLimitMessage()
      return
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: voiceInput,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const assistantMessageIndex = messages.length + 1
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    }])

    try {
      const responseLanguage = detectLanguage(voiceInput)

      await chatAPI.sendMessageStream(
        [...messages, userMessage],
        responseLanguage,
        (chunk: string) => {
          setMessages(prev => {
            const newMessages = [...prev]
            newMessages[assistantMessageIndex] = {
              ...newMessages[assistantMessageIndex],
              content: newMessages[assistantMessageIndex].content + chunk
            }
            return newMessages
          })
        },
        () => {
          recordGuestChatUsage()
          setIsLoading(false)
        },
        (error: string) => {
          console.error('Chat error:', error)
          setMessages(prev => prev.slice(0, -1))
          setIsLoading(false)
        }
      )
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.slice(0, -1))
      setIsLoading(false)
    }
  }

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.lang = navigator.language || 'en-US'
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const submitPrompt = async (prompt: string) => {
    if (!prompt.trim() || isLoading) return
    if (guestLimitReached) {
      appendGuestLimitMessage()
      return
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const assistantMessageIndex = messages.length + 1
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    }])

    try {
      const responseLanguage = detectLanguage(prompt)

      await chatAPI.sendMessageStream(
        [...messages, userMessage],
        responseLanguage,
        (chunk: string) => {
          setMessages(prev => {
            const newMessages = [...prev]
            newMessages[assistantMessageIndex] = {
              ...newMessages[assistantMessageIndex],
              content: newMessages[assistantMessageIndex].content + chunk
            }
            return newMessages
          })
        },
        () => {
          recordGuestChatUsage()
          setIsLoading(false)
        },
        (error: string) => {
          console.error('Chat error:', error)
          setMessages(prev => prev.slice(0, -1))
          setIsLoading(false)
        }
      )
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.slice(0, -1))
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    await submitPrompt(input)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickPrompt = async (prompt: string) => {
    await submitPrompt(prompt)
  }

  const handleQuickAction = (actionPrompt: string) => {
    setInput(actionPrompt)
    inputRef.current?.focus()
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white pt-20">
        {/* Chat Messages - Modern Bubble Design */}
        <div className="px-4 py-8 pb-48 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-4xl space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => {
                const isUser = message.role === 'user'
                const { mainText, suggestions, hasExamRedirect } = extractFollowUpSuggestions(message.content)

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} group`}
                  >
                    {/* AI Avatar - Left Side */}
                    {!isUser && (
                      <div className="flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-sm">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Message Content */}
                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} ${isUser ? 'max-w-[80%]' : 'max-w-[85%]'}`}>
                      {/* Message Bubble */}
                      <div
                        className={`rounded-2xl px-5 py-3 shadow-sm ${
                          isUser
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-50 border border-gray-100'
                        }`}
                      >
                        {/* Message Text */}
                        <div className={`prose prose-sm max-w-none ${
                          isUser 
                            ? 'prose-invert prose-p:text-white prose-p:leading-relaxed prose-p:mb-2' 
                            : 'prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mb-3 prose-headings:mt-5 first:prose-headings:mt-0 prose-h3:text-base prose-h3:font-bold prose-h3:text-gray-900 prose-p:text-gray-800 prose-p:leading-relaxed prose-p:mb-3 prose-p:text-[15px] prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-strong:font-semibold prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-[\'\'] prose-code:after:content-[\'\'] prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:shadow-lg prose-ul:list-disc prose-ul:pl-5 prose-ul:leading-relaxed prose-ul:mb-3 prose-ul:space-y-1.5 prose-li:text-gray-800 prose-li:leading-relaxed prose-ol:list-decimal prose-ol:pl-5 prose-ol:leading-relaxed prose-ol:mb-3 prose-ol:space-y-1.5 prose-table:border-collapse prose-table:w-full prose-table:my-4 prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900 prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2 prose-td:text-gray-800 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:my-3'
                        }`}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                              code({ node, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '')
                                const language = match ? match[1] : ''
                                const codeString = String(children).replace(/\n$/, '')
                                const inline = !className
                                
                                if (!inline && language) {
                                  return (
                                    <div className="relative group/code my-3">
                                      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-xl border-b border-gray-700">
                                        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                          {language}
                                        </span>
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(codeString)
                                            setCopiedCodeBlockKey(codeString)
                                            setTimeout(() => setCopiedCodeBlockKey(null), 2000)
                                          }}
                                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-medium transition"
                                        >
                                          {copiedCodeBlockKey === codeString ? (
                                            <>
                                              <Check className="h-3 w-3" />
                                              Copied
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="h-3 w-3" />
                                              Copy
                                            </>
                                          )}
                                        </button>
                                      </div>
                                      <pre className="!mt-0 !rounded-t-none rounded-b-xl overflow-x-auto max-w-full">
                                        <code className={className} {...props}>
                                          {children}
                                        </code>
                                      </pre>
                                      
                                      {/* Logic Breakdown after code */}
                                      {!isUser && (
                                        <div className="mt-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 p-3">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                                            <span className="text-xs font-semibold text-blue-900">Logic Breakdown</span>
                                          </div>
                                          <ul className="text-xs text-blue-800 space-y-1 list-none">
                                            <li className="flex items-start gap-2">
                                              <span className="text-blue-600 mt-0.5">💻</span>
                                              <span>Code structure follows best practices with proper error handling</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                              <span className="text-blue-600 mt-0.5">🧠</span>
                                              <span>All variables are defined and imports are included at the top</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                              <span className="text-blue-600 mt-0.5">⚡</span>
                                              <span>Solution is optimized for readability and performance</span>
                                            </li>
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  )
                                }
                                
                                return (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                )
                              }
                            }}
                          >
                            {mainText}
                          </ReactMarkdown>

                          {/* Follow-up Suggestions */}
                          {!isUser && suggestions.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {suggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleQuickPrompt(suggestion)}
                                  className="w-full rounded-lg border border-orange-200 bg-orange-50/80 px-3 py-2 text-left text-xs text-orange-700 transition hover:border-orange-300 hover:bg-orange-100/60"
                                >
                                  • {suggestion}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Exam Redirect Card */}
                          {!isUser && hasExamRedirect && (
                            <div className="mt-4">
                              <div className="rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                                    <BookOpen className="h-5 w-5" />
                                  </div>
                                  <div className="rounded-full bg-green-100 border border-green-300 px-2 py-0.5 text-xs font-bold text-green-700">
                                    100% Free
                                  </div>
                                </div>
                                <h3 className="text-base font-bold text-gray-900 mb-1">
                                  Ready to Ace Your Placements?
                                </h3>
                                <p className="text-xs text-gray-600 mb-3">
                                  Practice 100% Free Company-Specific Mock Tests
                                </p>
                                <button
                                  onClick={() => navigate('/exam-prep')}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                                >
                                  <span>🚀</span>
                                  Go to Aptitude Center
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions Row - Visible on Hover */}
                      <div className="flex items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-gray-400">
                          {new Date(message.timestamp || Date.now()).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {!isUser && message.content && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(message.content)
                              setCopiedIndex(index)
                              setTimeout(() => setCopiedIndex(null), 2000)
                            }}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="h-3 w-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                Copy
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* User Avatar - Right Side */}
                    {isUser && (
                      <div className="flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                          {isAuthenticated ? 'U' : 'G'}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Loading State with Animation */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex gap-3 justify-start"
              >
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-sm">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 px-5 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Thinking</span>
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:300ms]" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Input Area - Fixed Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-transparent px-4 py-6">
          <div className="mx-auto w-full max-w-5xl">
            {guestLimitReached && (
              <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50 p-4 text-violet-800">
                <div className="text-sm font-semibold">Free chat limit reached</div>
                <div className="mt-1 text-sm">You used all 10 free guest chats. Continue with a free account.</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate('/signup')}
                    className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800"
                  >
                    Sign Up Free
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions Row */}
            <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {quickInputActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.prompt)}
                  disabled={isLoading || guestLimitReached}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <action.icon className="h-3.5 w-3.5" />
                  {action.label}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-3 rounded-2xl border border-gray-300 bg-white p-3 shadow-2xl transition-all focus-within:border-teal-400 focus-within:ring-4 focus-within:ring-teal-100/50">
              <div className="relative" ref={plusMenuRef}>
                <button
                  onClick={() => setShowPlusMenu(!showPlusMenu)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white transition hover:bg-gray-800"
                  title="More options"
                >
                  <Plus className={`h-5 w-5 transition-transform ${showPlusMenu ? 'rotate-45' : ''}`} />
                </button>

                {showPlusMenu && (
                  <div className="absolute bottom-16 left-0 z-10 w-64 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
                    <button
                      onClick={() => {
                        navigate('/exam-prep')
                        setShowPlusMenu(false)
                      }}
                      className="flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-gray-100"
                    >
                      <BookOpen className="mt-0.5 h-5 w-5 text-teal-700" />
                      <div>
                        <div className="font-semibold text-gray-900">Aptitude Prep</div>
                        <div className="text-xs leading-5 text-gray-500">Quantitative, logical & verbal tests</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        navigate('/career')
                        setShowPlusMenu(false)
                      }}
                      className="flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-gray-100"
                    >
                      <Briefcase className="mt-0.5 h-5 w-5 text-emerald-700" />
                      <div>
                        <div className="font-semibold text-gray-900">Career guidance</div>
                        <div className="text-xs leading-5 text-gray-500">Resume, jobs, and interview direction</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        alert('Document upload feature coming soon!')
                        setShowPlusMenu(false)
                      }}
                      className="flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-gray-100"
                    >
                      <Upload className="mt-0.5 h-5 w-5 text-violet-700" />
                      <div>
                        <div className="font-semibold text-gray-900">Upload document</div>
                        <div className="text-xs leading-5 text-gray-500">PDF, DOC, or notes for analysis</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={guestLimitReached ? 'Sign up or login to continue' : 'Ask me anything... I provide full, working code solutions with explanations'}
                className="min-h-[56px] flex-1 resize-none rounded-xl bg-transparent px-4 py-3 text-[15px] leading-relaxed text-gray-900 outline-none placeholder:text-gray-400"
                rows={2}
                disabled={isLoading || guestLimitReached}
              />

              <button
                onClick={toggleVoiceInput}
                disabled={isLoading || guestLimitReached}
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                  isListening
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:cursor-not-allowed disabled:opacity-50`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || guestLimitReached}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-lg transition hover:shadow-xl hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>

            {/* Status Bar */}
            <div className="mt-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                {!isAuthenticated && (
                  <span className="rounded-full bg-orange-100 px-2.5 py-1 font-medium text-orange-700">
                    {guestChatsRemaining} free chats left
                  </span>
                )}
                {isListening && (
                  <span className="flex items-center gap-1.5 text-red-600 font-medium">
                    <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                    Listening...
                  </span>
                )}
              </div>
              <span className="text-gray-400">
                Press Enter to send • Shift+Enter for new line
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
