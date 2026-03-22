import axios from 'axios'

const resolveApiOrigin = (rawUrl: string) => {
  const trimmed = rawUrl.trim()
  if (!trimmed) return 'http://localhost:8000'

  try {
    const urlWithProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    const parsed = new URL(urlWithProtocol)
    return `${parsed.protocol}//${parsed.host}`
  } catch {
    return 'http://localhost:8000'
  }
}

const API_ORIGIN = resolveApiOrigin(import.meta.env.VITE_API_URL || 'http://localhost:8000')
const API_PREFIX = '/api'
const API_BASE_URL = `${API_ORIGIN}${API_PREFIX}`

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

export interface CompanyPrepQuestion {
  id: number
  company_name: string
  question: string
  category: string
  difficulty: string
  frequency: number
  topic: string | null
  year_asked: string | null
  round_name: string
}

export interface CompanyPrepMetadata {
  companies: string[]
  roles: string[]
  rounds: string[]
}

export interface CompanyPrepSession {
  session_id: string
  company: string
  role: string
  user_id: number
  simulation_mode: string
  rounds: Array<{ name: string; question_count: number }>
  questions: CompanyPrepQuestion[]
  top_questions: CompanyPrepQuestion[]
}

export interface CompanyPrepEvaluation {
  evaluation: {
    score: number
    verdict: string
    strengths: string[]
    improvements: string[]
    sample_answer: string
    follow_up_question: string
  }
  practice_id: number
  average_score: number
}

export interface PracticeHistoryItem {
  id: number
  company_name: string
  role: string
  round_name: string
  question_text: string
  user_answer: string
  ai_feedback: string | null
  sample_answer: string | null
  score: number
  practice_date: string
}

export interface ResumeSectionEnhanceRequest {
  section:
    | 'personal'
    | 'education'
    | 'experience'
    | 'projects'
    | 'certificates'
    | 'achievements'
    | 'hobbies'
    | 'skills'
  content: string
}

export interface ResumeAIActionRequest {
  action: 'suggest_skills' | 'enhance_bullets' | 'generate_summary' | 'generate_demo_resume'
  context: Record<string, string>
}

// API Functions
export const chatAPI = {
  sendMessage: (messages: ChatMessage[], language: string = 'auto') => 
    api.post('/chat', { messages, language }),

  sendPublicMessage: (messages: ChatMessage[], language: string = 'auto') =>
    api.post('/chat/public', { messages, language }),
  
  sendMessageStream: async (
    messages: ChatMessage[], 
    language: string = 'auto',
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ) => {
    const token = localStorage.getItem('token')

    if (!token) {
      try {
        const response = await api.post('/chat/public', { messages, language })
        const content = response.data?.response || ''
        if (content) {
          onChunk(content)
        }
        onComplete()
      } catch (error: any) {
        onError(error?.response?.data?.detail || 'Failed to send guest message')
      }
      return
    }

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

  getChallengeProblem: () =>
    api.get('/coding/challenge/problem'),

  getChallengeProblemById: (id: number | string) =>
    api.get(`/coding/challenge/problem/${id}`),

  getChallengeQuestions: () =>
    api.get<{ questions: Array<{ id: number; title: string; difficulty: 'easy' | 'medium' | 'hard'; time_limit_seconds: number }> }>('/coding/challenge/questions'),

  submitChallengeSolution: (payload: {
    problem_id: number | string
    code: string
    language: string
    submission_reason?: 'manual' | 'timeout' | 'disqualified'
    time_left_seconds?: number
    disqualified?: boolean
  }) => api.post('/coding/challenge/submit', payload),

  grantFifteenDayReward: (payload: { solved_count: number }) =>
    api.post('/coding/challenge/reward', payload),
}

export const careerAPI = {
  uploadResume: (formData: FormData, targetRole?: string, jobDescription?: string) => {
    const payload = new FormData()
    formData.forEach((value, key) => payload.append(key, value))
    if (targetRole) payload.append('target_role', targetRole)
    if (jobDescription) payload.append('job_description', jobDescription)

    return api.post('/career/resume-upload', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  analyzeResume: (resumeText: string, targetRole?: string, jobDescription?: string) => 
    api.post('/career/resume-analyze', {
      resumeText,
      target_role: targetRole,
      job_description: jobDescription,
    }),

  enhanceResumeSection: (data: ResumeSectionEnhanceRequest) =>
    api.post('/career/resume-enhance-section', data),

  resumeAIAction: (data: ResumeAIActionRequest) =>
    api.post('/career/resume-ai-action', data),
  
  interviewPrep: (company: string, role: string) => 
    api.post('/career/interview-prep', { company, role }),
  
  generateResume: (details: any) => 
    api.post('/career/resume-generate', details),

  generateResumePDF: (resumeText: string, templateType: 'classic' | 'modern' | 'minimal' = 'classic') =>
    api.post('/career/resume-generate', { resumeText, templateType }, {
      responseType: 'blob',
    }),

  generateResumePDFFromUpload: (formData: FormData, templateType: 'classic' | 'modern' | 'minimal' = 'classic') => {
    const payload = new FormData()
    formData.forEach((value, key) => payload.append(key, value))
    payload.append('template_type', templateType)

    return api.post('/career/resume-generate-upload', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    })
  },
}

export const paymentAPI = {
  createCheckout: (data: PaymentRequest) => 
    api.post('/payment/checkout', data),
  
  verifyPayment: (sessionId: string) => 
    api.post('/payment/verify', { sessionId }),

  upgradePlan: (plan_type: 'free' | 'basic' | 'pro') =>
    api.post('/upgrade-plan', { plan_type }),
  
  getPlans: () => 
    api.get('/payment/plans'),
}

export const companyPrepAPI = {
  getMetadata: () => api.get<CompanyPrepMetadata>('/company-prep/metadata'),

  getCompanyQuestions: (company: string, limit: number = 20) =>
    api.get<{ company: string; total: number; questions: CompanyPrepQuestion[] }>(`/company-questions/${encodeURIComponent(company)}`, {
      params: { limit },
    }),

  getTopQuestions: (company: string, limit: number = 20) =>
    api.get<{ company: string; title: string; questions: CompanyPrepQuestion[] }>(`/company-prep/top-questions/${encodeURIComponent(company)}`, {
      params: { limit },
    }),

  startSession: (company: string, role: string, questionCount: number = 6) =>
    api.post<CompanyPrepSession>('/company-prep/session/start', {
      company,
      role,
      question_count: questionCount,
    }),

  explainQuestion: (question: string, company?: string, role?: string) =>
    api.post<{ question: string; explanation: { concepts: string[]; simple_explanation: string; answer_framework: string[]; sample_answer: string } }>('/company-prep/question/explain', {
      question,
      company,
      role,
    }),

  evaluateAnswer: (payload: { company: string; role: string; question: string; answer: string; round_name: string }) =>
    api.post<CompanyPrepEvaluation>('/company-prep/answer/evaluate', payload),

  getHistory: (limit: number = 20) =>
    api.get<PracticeHistoryItem[]>('/company-prep/history', {
      params: { limit },
    }),
}

export const aptitudeAPI = {
  getTest: (company: string, difficulty: string, limit: number = 5) =>
    api.get('/aptitude/test', { params: { company, difficulty, limit } }),

  submitAnswers: (sessionId: string, answers: Record<number, string | null>) =>
    api.post('/aptitude/submit', { session_id: sessionId, answers }),

  getHistory: () =>
    api.get('/aptitude/history'),

  getExamDetails: (examId: number) =>
    api.get(`/aptitude/history/${examId}`),

  getCompanies: () =>
    api.get<string[]>('/aptitude/companies'),

  getCategories: (company?: string) =>
    api.get<string[]>('/aptitude/categories', { params: company ? { company } : {} }),

  getStats: (company?: string) =>
    api.get('/aptitude/stats', { params: company ? { company } : {} }),

  getUsageStats: () =>
    api.get('/aptitude/usage-stats'),
}

export const userAPI = {
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  googleAuth: (credential: string) =>
    api.post('/auth/google', { credential }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (email: string, otp: string, new_password: string) =>
    api.post('/auth/reset-password', { email, otp, new_password }),
  
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
    const sessionIds = new Set(
      messages
        .map((m: any) => m.session_id)
        .filter((sessionId: any) => sessionId !== undefined && sessionId !== null && sessionId !== '')
    )
    const lastActiveMessage = messages[0]
    const lastActive =
      lastActiveMessage?.timestamp ||
      lastActiveMessage?.created_at ||
      lastActiveMessage?.updated_at ||
      null
    
    return {
      chatSessions: sessionIds.size,
      totalMessages: messages.length,
      questionsAsked: userMessages.length,
      lastActive,
    }
  },
}
