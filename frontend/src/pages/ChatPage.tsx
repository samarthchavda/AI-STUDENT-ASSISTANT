import { useState, useRef, useEffect } from 'react'
import { Send, Brain, Loader, Mic, MicOff, Volume2, VolumeX, Plus, BookOpen, Code, Briefcase, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { chatAPI, ChatMessage } from '../api/client'
import Header from '../components/Header'

export default function ChatPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI Study Assistant. How can I help you today? You can ask me to:\n\n• Explain any topic\n• Generate notes\n• Solve doubts\n• Help with assignments\n• Practice questions\n\nJust ask me anything!'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState('english')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const plusMenuRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  // Auto-speak when a new assistant message is complete
  useEffect(() => {
    if (autoSpeak && !isLoading && messages.length > 1) {
      const lastMessage = messages[messages.length - 1]
      // Only speak if it's an assistant message with content and not the initial greeting
      if (lastMessage.role === 'assistant' && lastMessage.content && lastMessage.content !== messages[0].content) {
        speakText(lastMessage.content)
      }
    }
  }, [isLoading, messages.length])

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      
      // Set language based on selected language
      const langMap: { [key: string]: string } = {
        'english': 'en-US',
        'hindi': 'hi-IN',
        'gujarati': 'gu-IN'
      }
      recognitionRef.current.lang = langMap[language] || 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
        
        // Auto-send after voice input
        setTimeout(() => {
          if (transcript.trim()) {
            handleVoiceSend(transcript)
          }
        }, 500)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        // Don't show error to user, just stop listening
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [language])

  const handleVoiceSend = async (voiceInput: string) => {
    if (!voiceInput.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: voiceInput,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Add empty assistant message that will be filled with streaming content
    const assistantMessageIndex = messages.length + 1
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    }])

    try {
      await chatAPI.sendMessageStream(
        [...messages, userMessage],
        language,
        // onChunk - append each chunk to the assistant message
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
        // onComplete
        () => {
          setIsLoading(false)
        },
        // onError - Don't show error in chat
        (error: string) => {
          console.error('Chat error:', error)
          setMessages(prev => prev.slice(0, -1)) // Remove empty assistant message
          setIsLoading(false)
        }
      )
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.slice(0, -1)) // Remove empty assistant message
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
      // Update language before starting
      const langMap: { [key: string]: string } = {
        'english': 'en-US',
        'hindi': 'hi-IN',
        'gujarati': 'gu-IN'
      }
      recognitionRef.current.lang = langMap[language] || 'en-US'
      
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  // Text-to-Speech function
  const speakText = (text: string) => {
    // Stop any ongoing speech
    window.speechSynthesis.cancel()

    if (!autoSpeak) return

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Set language for speech
    const langMap: { [key: string]: string } = {
      'english': 'en-US',
      'hindi': 'hi-IN',
      'gujarati': 'gu-IN'
    }
    utterance.lang = langMap[language] || 'en-US'
    
    // Try to find and use specific voice (like Microsoft Guy - en-US-GuyNeural)
    const voices = window.speechSynthesis.getVoices()
    
    // Priority order for English voices
    const preferredVoices = [
      'Microsoft Guy Online (Natural) - English (United States)',
      'Microsoft David - English (United States)',
      'Google US English',
      'en-US-GuyNeural',
      'en-us-guyneural'
    ]
    
    let selectedVoiceObj = null
    
    // Try to find preferred voice
    for (const prefVoice of preferredVoices) {
      selectedVoiceObj = voices.find(v => 
        v.name.toLowerCase().includes(prefVoice.toLowerCase()) ||
        v.voiceURI.toLowerCase().includes(prefVoice.toLowerCase())
      )
      if (selectedVoiceObj) break
    }
    
    // If no preferred voice found, use any voice matching the language
    if (!selectedVoiceObj && language === 'english') {
      selectedVoiceObj = voices.find(v => v.lang.startsWith('en'))
    } else if (!selectedVoiceObj && language === 'hindi') {
      selectedVoiceObj = voices.find(v => v.lang.startsWith('hi'))
    } else if (!selectedVoiceObj && language === 'gujarati') {
      selectedVoiceObj = voices.find(v => v.lang.startsWith('gu'))
    }
    
    if (selectedVoiceObj) {
      utterance.voice = selectedVoiceObj
      console.log('Using voice:', selectedVoiceObj.name)
    }
    
    // Set voice properties
    utterance.rate = 1.0  // Speed
    utterance.pitch = 1.0  // Pitch
    utterance.volume = 1.0  // Volume

    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
    }

    speechSynthesisRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const toggleAutoSpeak = () => {
    setAutoSpeak(!autoSpeak)
    if (isSpeaking) {
      stopSpeaking()
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Add empty assistant message that will be filled with streaming content
    const assistantMessageIndex = messages.length + 1
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    }])

    try {
      await chatAPI.sendMessageStream(
        [...messages, userMessage],
        language,
        // onChunk - append each chunk to the assistant message
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
        // onComplete
        () => {
          setIsLoading(false)
        },
        // onError - Don't show error in chat, just log it
        (error: string) => {
          console.error('Chat error:', error)
          setMessages(prev => prev.slice(0, -1)) // Remove empty assistant message
          setIsLoading(false)
        }
      )
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.slice(0, -1)) // Remove empty assistant message
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }



  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {message.role === 'user' ? '👤' : <Brain className="w-6 h-6" />}
              </div>
              <div
                className={`flex-1 p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white ml-12'
                    : 'bg-white shadow-md mr-12'
                }`}
              >
                <div className="whitespace-pre-wrap text-base leading-relaxed font-normal">{message.content}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <Brain className="w-6 h-6 text-gray-700" />
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <Loader className="w-5 h-5 animate-spin text-primary-600" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {/* Language Selector */}
          <div className="flex gap-2 mb-3 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('english')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  language === 'english'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => setLanguage('hindi')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  language === 'hindi'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🇮🇳 हिंदी
              </button>
              <button
                onClick={() => setLanguage('gujarati')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  language === 'gujarati'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🇮🇳 ગુજરાતી
              </button>
            </div>
            
            {/* Auto-speak toggle */}
            <button
              onClick={toggleAutoSpeak}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                autoSpeak
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={autoSpeak ? 'Auto-speak ON' : 'Auto-speak OFF'}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {autoSpeak ? 'Voice ON' : 'Voice OFF'}
            </button>
          </div>
          
          <div className="flex gap-3 items-end">
            {/* Plus Menu Button */}
            <div className="relative" ref={plusMenuRef}>
              <button
                onClick={() => setShowPlusMenu(!showPlusMenu)}
                className="h-12 w-12 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                title="More options"
              >
                <Plus className={`w-5 h-5 transition-transform ${showPlusMenu ? 'rotate-45' : ''}`} />
              </button>
              
              {/* Plus Menu Dropdown */}
              {showPlusMenu && (
                <div className="absolute bottom-14 left-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-56 z-10">
                  <button
                    onClick={() => {
                      navigate('/exam-prep')
                      setShowPlusMenu(false)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3"
                  >
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Exam Prep</div>
                      <div className="text-xs text-gray-500">Practice questions</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      navigate('/coding-help')
                      setShowPlusMenu(false)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center gap-3"
                  >
                    <Code className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Coding Help</div>
                      <div className="text-xs text-gray-500">Debug & learn code</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      navigate('/career')
                      setShowPlusMenu(false)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center gap-3"
                  >
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">Career Guidance</div>
                      <div className="text-xs text-gray-500">Resume & interview</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      // TODO: Implement document upload
                      alert('Document upload feature coming soon!')
                      setShowPlusMenu(false)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors flex items-center gap-3"
                  >
                    <Upload className="w-5 h-5 text-orange-600" />
                    <div>
                      <div className="font-medium text-gray-900">Upload Document</div>
                      <div className="text-xs text-gray-500">PDF, DOC, TXT</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                language === 'hindi' 
                  ? "मुझसे कुछ भी पूछें... (भेजने के लिए Enter दबाएं)"
                  : language === 'gujarati'
                  ? "મને કંઈપણ પૂછો... (મોકલવા માટે Enter દબાવો)"
                  : "Ask me anything... (Press Enter to send)"
              }
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-base font-normal"
              rows={2}
              disabled={isLoading}
            />
            
            {/* Voice Input Button */}
            <button
              onClick={toggleVoiceInput}
              disabled={isLoading}
              className={`h-12 w-12 flex items-center justify-center rounded-lg transition-all ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
            
            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="btn-primary h-12 w-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {isListening && (
            <p className="text-xs text-red-500 mt-2 text-center animate-pulse">
              🎤 Listening... Speak now
            </p>
          )}
          
          {isSpeaking && (
            <p className="text-xs text-green-500 mt-2 text-center animate-pulse">
              🔊 Speaking... (Click Voice OFF to stop)
            </p>
          )}
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  )
}
