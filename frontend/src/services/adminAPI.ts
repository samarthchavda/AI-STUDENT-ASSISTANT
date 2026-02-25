import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

export const adminAPI = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getAllUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get('/admin/users');
    return response.data;
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

  updateUserPlan: async (userId: number, plan: string): Promise<any> => {
    const response = await api.put(`/admin/users/${userId}/plan`, { plan });
    return response.data;
  },

  deleteUser: async (userId: number): Promise<any> => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
};
