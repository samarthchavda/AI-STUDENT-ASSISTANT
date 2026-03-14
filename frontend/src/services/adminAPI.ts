import axios from 'axios';

const resolveApiOrigin = (rawUrl: string) => {
  const trimmed = rawUrl.trim();
  if (!trimmed) return 'http://localhost:8000';

  try {
    const urlWithProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(urlWithProtocol);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return 'http://localhost:8000';
  }
};

const API_PREFIX = '/api';
const API_URL = `${resolveApiOrigin(import.meta.env.VITE_API_URL || 'http://localhost:8000')}${API_PREFIX}`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AdminStats {
  total_users: number;
  free_users: number;
  basic_users: number;
  pro_users: number;
  google_users: number;
  regular_users: number;
  total_chats: number;
  total_payments: number;
  total_revenue: number;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  plan: string;
  is_google_user: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminChat {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  role: string;
  content: string;
  timestamp: string;
}

export interface AdminPayment {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  payment_id: string;
  created_at: string;
}

export interface AdminProgress {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  subject: string;
  topic: string;
  score: number;
  completed_at: string;
}

export interface CompanyQuestion {
  id: number;
  company_name: string;
  question_text: string;
  category: string;
  difficulty: string;
  frequency: number;
  topic: string | null;
  year_asked: string | null;
}

export const adminAPI = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getAllUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get('/admin/users');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.users && Array.isArray(response.data.users)) {
      return response.data.users;
    }
    return [];
  },

  getAllChats: async (): Promise<AdminChat[]> => {
    const response = await api.get('/admin/chats');
    return response.data;
  },

  getAllPayments: async (): Promise<AdminPayment[]> => {
    const response = await api.get('/admin/payments');
    return response.data;
  },

  getAllProgress: async (): Promise<AdminProgress[]> => {
    const response = await api.get('/admin/progress');
    return response.data;
  },

  getAllCompanyQuestions: async (): Promise<CompanyQuestion[]> => {
    const response = await api.get('/admin/company-questions');
    return response.data;
  },

  bulkUploadCompanyQuestions: async (formData: FormData): Promise<any> => {
    const response = await api.post('/admin/company-questions/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getCompanyQuestionsTemplate: async (): Promise<{ template: string }> => {
    const response = await api.get('/admin/company-questions/sample-template');
    return response.data;
  },

  updateUserPlan: async (userId: number, plan: string): Promise<any> => {
    const response = await api.put(`/admin/users/${userId}/plan`, { plan });
    return response.data;
  },

  deleteUser: async (userId: number): Promise<any> => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
};
