import { api } from '../api/client';

// ============= TYPES =============

export interface DashboardStats {
  total_solved: number;
  total_attempted: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  total_score: number;
  current_streak: number;
  longest_streak: number;
  total_submissions: number;
  ai_assisted_submissions: number;
  acceptance_rate: number;
  recent_solved: Array<{
    slug: string;
    title: string;
    difficulty: string;
    solved_at: string | null;
  }>;
  topic_progress: Array<{
    topic: string;
    solved: number;
    total: number;
  }>;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  is_active_today: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  email: string;
  score: number;
  solved_count: number;
  current_streak: number;
  total_submissions: number;
  ai_usage_count: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  user_rank: number | null;
  total_users: number;
}

export interface DSAAnalytics {
  total_submissions: number;
  accepted_submissions: number;
  failed_submissions: number;
  acceptance_rate: number;
  total_users: number;
  active_users_today: number;
  active_users_week: number;
  most_attempted_questions: Array<{
    slug: string;
    title: string;
    attempts: number;
  }>;
  most_solved_questions: Array<{
    slug: string;
    title: string;
    solved_count: number;
  }>;
  topic_usage: Array<{
    topic: string;
    attempts: number;
    solved: number;
  }>;
  difficulty_success_rate: Array<{
    difficulty: string;
    total: number;
    solved: number;
    success_rate: number;
  }>;
  top_performers: Array<{
    username: string;
    email: string;
    score: number;
    solved: number;
  }>;
}

export interface AIAnalytics {
  total_ai_requests: number;
  hint_requests: number;
  explain_requests: number;
  solution_requests: number;
  explain_code_requests: number;
  fix_code_requests: number;
  ai_usage_by_question: Array<{
    question_slug: string;
    action_type: string;
    count: number;
  }>;
  ai_usage_by_user: Array<{
    username: string;
    requests: number;
  }>;
  most_common_action: string;
}

// ============= USER DASHBOARD =============

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get('/dsa/dashboard');
  return response.data;
}

export async function getStreakData(): Promise<StreakData> {
  const response = await api.get('/dsa/streak');
  return response.data;
}

// ============= LEADERBOARD =============

export async function getLeaderboard(
  period: 'all' | 'week' | 'month' = 'all',
  limit: number = 100
): Promise<LeaderboardResponse> {
  const response = await api.get('/dsa/leaderboard', {
    params: { period, limit }
  });
  return response.data;
}

// ============= ADMIN ANALYTICS =============

export async function getDSAAnalytics(): Promise<DSAAnalytics> {
  const response = await api.get('/dsa/admin/analytics');
  return response.data;
}

export async function getAIAnalytics(): Promise<AIAnalytics> {
  const response = await api.get('/dsa/admin/ai-analytics');
  return response.data;
}
