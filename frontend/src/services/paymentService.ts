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

export interface CreateOrderRequest {
  plan: string;
  billing_cycle: string;
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  plan: string;
  billing_cycle: string;
  user_name: string;
  user_email: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan: string;
  billing_cycle: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  subscription_id?: number;
  invoice_number?: string;
}

export interface SubscriptionStatus {
  has_subscription: boolean;
  subscription_id?: number;
  plan: string;
  billing_cycle?: string;
  source: string;
  status?: string;
  starts_at?: string;
  expires_at?: string;
  days_remaining?: number;
  expired_at?: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  plan_name: string;
  billing_cycle: string;
  amount_paid: number;
  currency: string;
  payment_id: string;
  validity_period: string;
  invoice_date: string;
}

export const paymentService = {
  createOrder: async (request: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const response = await api.post('/payments/create-order', request);
    return response.data;
  },

  verifyPayment: async (request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> => {
    const response = await api.post('/payments/verify', request);
    return response.data;
  },

  getSubscriptionStatus: async (): Promise<SubscriptionStatus> => {
    const response = await api.get('/payments/subscription/status');
    return response.data;
  },

  getInvoices: async (): Promise<Invoice[]> => {
    const response = await api.get('/payments/invoices');
    return response.data;
  },
};

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal: {
    ondismiss: () => void;
  };
}

export const openRazorpayCheckout = (options: RazorpayOptions) => {
  if (!window.Razorpay) {
    throw new Error('Razorpay SDK not loaded');
  }

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};
