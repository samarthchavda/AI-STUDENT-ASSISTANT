import apiClient from '../api/client';

// ============= TYPES =============

export interface DailyChallenge {
  id: number;
  challenge_date: string;
  question_slug: string;
  question_title: string;
  difficulty: string;
  topic: string;
  bonus_points: number;
  is_completed: boolean;
  completion_time?: string;
}

export interface CompanySheet {
  id: number;
  company_name: string;
  display_name: string;
  description?: string;
  logo_url?: string;
  difficulty_level?: string;
  total_questions: number;
  is_premium: boolean;
  completed_questions: number;
  progress_percentage: number;
}

export interface CompanySheetQuestion {
  id: number;
  question_slug: string;
  question_title: string;
  question_type: string;
  difficulty: string;
  topic: string;
  is_completed: boolean;
  is_premium: boolean;
}

export interface SubscriptionInfo {
  plan_type: string;
  status: string;
  started_at: string;
  expires_at?: string;
  ai_requests_limit: number;
  ai_requests_used: number;
  ai_requests_remaining: number;
  features: {
    ai_requests_per_day: number;
    company_sheets_access: string;
    resume_templates_access: string;
    daily_challenges: boolean;
    advanced_analytics: boolean;
    priority_support: boolean;
  };
}

export interface Notification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

// ============= DAILY CHALLENGE =============

export async function getTodayChallenge(): Promise<DailyChallenge | null> {
  const response = await apiClient.get('/api/daily-challenge/today');
  return response.data;
}

export async function completeDailyChallenge(
  challengeId: number,
  timeTaken?: number
): Promise<{ message: string; bonus_earned: number }> {
  const response = await apiClient.post(`/api/daily-challenge/complete/${challengeId}`, {
    time_taken: timeTaken
  });
  return response.data;
}

export async function getChallengeHistory(limit: number = 30) {
  const response = await apiClient.get('/api/daily-challenge/history', {
    params: { limit }
  });
  return response.data;
}

// ============= COMPANY SHEETS =============

export async function getCompanySheets(): Promise<CompanySheet[]> {
  const response = await apiClient.get('/api/company-sheets/list');
  return response.data;
}

export async function getSheetQuestions(sheetId: number): Promise<CompanySheetQuestion[]> {
  const response = await apiClient.get(`/api/company-sheets/${sheetId}/questions`);
  return response.data;
}

export async function markQuestionComplete(
  sheetId: number,
  questionSlug: string
): Promise<{ message: string }> {
  const response = await apiClient.post(
    `/api/company-sheets/${sheetId}/questions/${questionSlug}/complete`
  );
  return response.data;
}

// ============= SUBSCRIPTION =============

export async function getSubscriptionStatus(): Promise<SubscriptionInfo> {
  const response = await apiClient.get('/api/subscription/status');
  return response.data;
}

export async function checkAIAccess(): Promise<{
  can_use: boolean;
  reason?: string;
  limit?: number;
  used?: number;
  upgrade_required?: boolean;
}> {
  const response = await apiClient.post('/api/subscription/check-ai-access');
  return response.data;
}

export async function recordAIUsage(): Promise<{ message: string }> {
  const response = await apiClient.post('/api/subscription/use-ai');
  return response.data;
}

export async function upgradeToPremium(
  paymentId?: string,
  amount?: number
): Promise<{ message: string; expires_at: string }> {
  const response = await apiClient.post('/api/subscription/upgrade-to-premium', {
    payment_id: paymentId,
    amount: amount
  });
  return response.data;
}

export async function getSubscriptionPlans() {
  const response = await apiClient.get('/api/subscription/plans');
  return response.data;
}

// ============= NOTIFICATIONS =============

export async function getNotifications(
  limit: number = 20,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  const response = await apiClient.get('/api/notifications/list', {
    params: { limit, unread_only: unreadOnly }
  });
  return response.data;
}

export async function getUnreadCount(): Promise<{ unread_count: number }> {
  const response = await apiClient.get('/api/notifications/unread-count');
  return response.data;
}

export async function markNotificationRead(notificationId: number): Promise<{ message: string }> {
  const response = await apiClient.post(`/api/notifications/${notificationId}/mark-read`);
  return response.data;
}

export async function markAllNotificationsRead(): Promise<{ message: string }> {
  const response = await apiClient.post('/api/notifications/mark-all-read');
  return response.data;
}

export async function deleteNotification(notificationId: number): Promise<{ message: string }> {
  const response = await apiClient.delete(`/api/notifications/${notificationId}`);
  return response.data;
}
