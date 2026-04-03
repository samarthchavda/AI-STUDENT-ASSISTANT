import axios from 'axios';

const resolveApiOrigin = (rawUrl: string) => {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  try {
    const urlWithProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(urlWithProtocol);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return '';
  }
};

const API_PREFIX = '/api';
const API_ORIGIN = resolveApiOrigin(import.meta.env.VITE_API_URL || '');
const API_URL = API_ORIGIN ? `${API_ORIGIN}${API_PREFIX}` : API_PREFIX;

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
  phone?: string;
  phone_verified?: boolean;
  college?: string;
  branch?: string;
  cgpa?: string;
  graduation_year?: string;
  linkedin_url?: string;
  github_url?: string;
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

export interface AdminChatUserSummary {
  user_id: number;
  user_name: string;
  user_email: string;
  plan: string;
  chat_count: number;
  last_message_at: string;
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

export interface AdminSubscription {
  user_id: number;
  user_name: string;
  user_email: string;
  plan: string;
  status: string;
  source: string;
  billing_cycle: string | null;
  amount: number;
  payment_id: string | null;
  start_date: string;
  expiry_date: string | null;
  granted_by: string | null;
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

  getChatUsersSummary: async (): Promise<AdminChatUserSummary[]> => {
    const response = await api.get('/admin/chats/users-summary');
    return response.data;
  },

  getUserChats: async (userId: number): Promise<AdminChat[]> => {
    const response = await api.get(`/admin/chats/user/${userId}`);
    return response.data;
  },

  getChatsByEmail: async (email: string): Promise<AdminChat[]> => {
    const response = await api.get(`/admin/chats/${encodeURIComponent(email)}`);
    return response.data;
  },

  getAllPayments: async (): Promise<AdminPayment[]> => {
    const response = await api.get('/admin/payments');
    return response.data;
  },

  getAllSubscriptions: async (): Promise<AdminSubscription[]> => {
    const response = await api.get('/admin/subscriptions');
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

  getAptitudeUsersSummary: async (): Promise<any[]> => {
    const response = await api.get('/admin/aptitude-users-summary');
    return response.data;
  },

  getUserAptitudeHistory: async (userId: number): Promise<any> => {
    const response = await api.get(`/admin/users/${userId}/aptitude-history`);
    return response.data;
  },

  // AI Monitor APIs
  getTopAIUsers: async (limit: number = 10): Promise<any[]> => {
    const response = await api.get(`/admin/ai-monitor/top-users?limit=${limit}`);
    return response.data;
  },

  getCostSummary: async (): Promise<any> => {
    const response = await api.get('/admin/ai-monitor/cost-summary');
    return response.data;
  },

  getDailyUsage: async (days: number = 30): Promise<any[]> => {
    const response = await api.get(`/admin/ai-monitor/daily-usage?days=${days}`);
    return response.data;
  },

  // Broadcast APIs
  sendBroadcast: async (data: { title: string; message: string; target_audience: string }): Promise<any> => {
    const response = await api.post('/admin/broadcast/send', data);
    return response.data;
  },

  getBroadcastHistory: async (skip: number = 0, limit: number = 50): Promise<any[]> => {
    const response = await api.get(`/admin/broadcast/history?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getBroadcastStats: async (): Promise<any> => {
    const response = await api.get('/admin/broadcast/stats');
    return response.data;
  },

  // System Health APIs
  getSystemHealth: async (): Promise<any> => {
    const response = await api.get('/admin/system-health');
    return response.data;
  },

  getSystemHealthHistory: async (metricType: string, hours: number = 24): Promise<any> => {
    const response = await api.get(`/admin/system-health/history?metric_type=${metricType}&hours=${hours}`);
    return response.data;
  },

  // Broadcast System APIs
  createBroadcast: async (data: { title: string; message: string; target_audience: string }): Promise<any> => {
    const response = await api.post('/admin/broadcast', data);
    return response.data;
  },

  getBroadcasts: async (limit: number = 50): Promise<any> => {
    const response = await api.get(`/admin/broadcasts?limit=${limit}`);
    return response.data;
  },

  deactivateBroadcast: async (broadcastId: number): Promise<any> => {
    const response = await api.delete(`/admin/broadcast/${broadcastId}`);
    return response.data;
  },

  // Audit Logs APIs
  getAuditLogs: async (limit: number = 100, actionType?: string): Promise<any> => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (actionType) params.append('action_type', actionType);
    const response = await api.get(`/admin/audit-logs?${params.toString()}`);
    return response.data;
  },

  getAuditStats: async (): Promise<any> => {
    const response = await api.get('/admin/audit-logs/stats');
    return response.data;
  },

  // User Sessions APIs
  getUserSessions: async (): Promise<any> => {
    const response = await api.get('/admin/users/sessions');
    return response.data;
  },

  // Growth Features APIs
  
  // Leaderboard Management
  getLeaderboardManagement: async (limit: number = 100): Promise<any> => {
    const response = await api.get(`/admin/growth/leaderboard?limit=${limit}`);
    return response.data;
  },

  updateLeaderboardEntry: async (userId: number, data: { custom_rank?: number; is_visible: boolean; featured: boolean }): Promise<any> => {
    const response = await api.put(`/admin/growth/leaderboard/${userId}`, data);
    return response.data;
  },

  getLeaderboardHistory: async (userId: number, days: number = 30): Promise<any> => {
    const response = await api.get(`/admin/growth/leaderboard/history/${userId}?days=${days}`);
    return response.data;
  },

  // Transaction Logs
  getTransactionLogs: async (params?: { limit?: number; status?: string; start_date?: string; end_date?: string }): Promise<any> => {
    const response = await api.get('/admin/growth/transactions', { params });
    return response.data;
  },

  updateTransaction: async (paymentId: number, data: { notes?: string; refund_status?: string; refund_amount?: number }): Promise<any> => {
    const response = await api.put(`/admin/growth/transactions/${paymentId}`, data);
    return response.data;
  },

  // Smart Notifications (Nudge System)
  getInactiveUsers: async (days: number = 7, limit: number = 100): Promise<any> => {
    const response = await api.get(`/admin/growth/inactive-users?days=${days}&limit=${limit}`);
    return response.data;
  },

  sendNudgeEmail: async (data: { user_ids: number[]; subject: string; message: string }): Promise<any> => {
    const response = await api.post('/admin/growth/nudge', data);
    return response.data;
  },

  // Referral Tracking
  getReferralStats: async (): Promise<any> => {
    const response = await api.get('/admin/growth/referrals');
    return response.data;
  },

  getUserReferrals: async (userId: number): Promise<any> => {
    const response = await api.get(`/admin/growth/referrals/${userId}`);
    return response.data;
  },

  getUsersWithReferrals: async (limit: number = 100): Promise<any> => {
    const response = await api.get(`/admin/growth/users-with-referrals?limit=${limit}`);
    return response.data;
  },

  // Revenue Analytics
  getRevenueAnalytics: async (days: number = 30): Promise<any> => {
    const response = await api.get(`/admin/growth/revenue?days=${days}`);
    return response.data;
  },

  // Invoices API
  getAllInvoices: async (): Promise<any[]> => {
    const response = await api.get('/admin/invoices');
    return response.data;
  },

};
