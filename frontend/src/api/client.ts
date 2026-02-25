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
  sendMessage: (messages: ChatMessage[]) => 
    api.post('/chat', { messages }),
  
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
}
