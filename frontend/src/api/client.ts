import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export interface ExplainTopicRequest {
  topic: string
  subject: string
  level: string
}

export interface GenerateNotesRequest {
  topic: string
  format: 'summary' | 'detailed' | 'mindmap'
}

export interface SolveDoubtRequest {
  question: string
  subject?: string
}

export interface CodeHelpRequest {
  code: string
  language: string
  task: 'explain' | 'debug' | 'optimize'
}

export interface MockTestRequest {
  subject: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  numQuestions: number
}

export interface PaymentRequest {
  plan: string
  paymentMethod: string
}

// API Functions
export const chatAPI = {
  sendMessage: (messages: ChatMessage[], language: string = 'english') => 
    api.post('/chat', { messages, language }),
  
  sendMessageStream: async (
    messages: ChatMessage[], 
    language: string = 'english',
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ messages, language })
    })

    if (!response.ok) {
      throw new Error('Failed to connect to streaming endpoint')
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('No reader available')
    }

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            
            if (data.error) {
              onError(data.error)
              return
            }
            
            if (data.done) {
              onComplete()
              return
            }
            
            if (data.chunk) {
              onChunk(data.chunk)
            }
          }
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Streaming error')
    }
  },
  
  explainTopic: (data: ExplainTopicRequest) => 
    api.post('/learning/explain', data),
  
  generateNotes: (data: GenerateNotesRequest) => 
    api.post('/learning/notes', data),
  
  solveDoubt: (data: SolveDoubtRequest) => 
    api.post('/learning/doubt', data),
}

export const examAPI = {
  generateMockTest: (data: MockTestRequest) => 
    api.post('/exam/mock-test', data),
  
  solvePreviousYear: (question: string, subject: string) => 
    api.post('/exam/solve-pyq', { question, subject }),
  
  generateStudyPlan: (examDate: string, subjects: string[]) => 
    api.post('/exam/study-plan', { examDate, subjects }),
}

export const codingAPI = {
  explainCode: (data: CodeHelpRequest) => 
    api.post('/coding/help', data),
  
  dsaHint: (problem: string) => 
    api.post('/coding/dsa-hint', { problem }),
  
  projectGuidance: (projectType: string, techStack: string[]) => 
    api.post('/coding/project-guide', { projectType, techStack }),
}

export const careerAPI = {
  uploadResume: (formData: FormData) => 
    api.post('/career/resume-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  analyzeResume: (resumeText: string) => 
    api.post('/career/resume-analyze', { resumeText }),
  
  interviewPrep: (company: string, role: string) => 
    api.post('/career/interview-prep', { company, role }),
  
  generateResume: (details: any) => 
    api.post('/career/resume-generate', details),
}

export const paymentAPI = {
  createCheckout: (data: PaymentRequest) => 
    api.post('/payment/checkout', data),
  
  verifyPayment: (sessionId: string) => 
    api.post('/payment/verify', { sessionId }),
  
  getPlans: () => 
    api.get('/payment/plans'),
}

export const userAPI = {
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  googleAuth: (credential: string) =>
    api.post('/auth/google', { credential }),
  
  getProfile: () =>
    api.get('/user/profile'),
  
  updateProgress: (data: any) =>
    api.post('/user/progress', data),
  
  getChatHistory: (limit: number = 50) =>
    api.get(`/chat/history?limit=${limit}`),
  
  getUserStats: async () => {
    const history = await api.get('/chat/history?limit=1000')
    const messages = history.data.history || []
    
    // Calculate stats from chat history
    const userMessages = messages.filter((m: any) => m.role === 'user')
    const totalSessions = Math.ceil(userMessages.length / 10) // Approximate sessions
    
    return {
      chatSessions: totalSessions,
      totalMessages: messages.length,
      questionsAsked: userMessages.length,
      lastActive: messages.length > 0 ? messages[0].timestamp : null
    }
  },
}
