import { api } from '../api/client';

export interface SubmissionCreate {
  question_slug: string;
  question_title: string;
  difficulty: string;
  topic: string;
  language: string;
  code: string;
  action_type: 'run' | 'submit';
  verdict: string;
  passed_testcases: number;
  total_testcases: number;
  runtime?: number;
  memory?: number;
  ai_used: boolean;
  ai_actions?: string[];
}

export interface Submission {
  id: number;
  question_slug: string;
  question_title: string;
  language: string;
  action_type: string;
  verdict: string;
  passed_testcases: number;
  total_testcases: number;
  runtime?: number;
  memory?: number;
  ai_used: boolean;
  created_at: string;
}

export interface ProgressSummary {
  total_solved: number;
  total_attempted: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  easy_attempted: number;
  medium_attempted: number;
  hard_attempted: number;
  recent_activity: Array<{
    question_slug: string;
    question_title: string;
    difficulty: string;
    status: string;
    latest_verdict: string;
    last_attempted_at: string;
  }>;
}

export interface StatusMap {
  [questionSlug: string]: {
    status: 'solved' | 'attempted' | 'unsolved';
    latest_verdict: string;
    attempts: number;
  };
}

// Save submission
export async function saveSubmission(submission: SubmissionCreate): Promise<{ id: number; status: string }> {
  console.log(`💾 [TRACKING SERVICE] Saving submission:`, {
    slug: submission.question_slug,
    verdict: submission.verdict,
    passed: `${submission.passed_testcases}/${submission.total_testcases}`,
    action: submission.action_type
  });
  
  try {
    const response = await api.post('/dsa/submissions', submission);
    console.log(`✅ [TRACKING SERVICE] Submission saved:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [TRACKING SERVICE] Failed to save submission:', error);
    throw error;
  }
}

// Get submission history for a question
export async function getSubmissions(questionSlug: string, limit: number = 10): Promise<Submission[]> {
  try {
    const response = await api.get(`/dsa/submissions/${questionSlug}`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch submissions:', error);
    return [];
  }
}

// Get user progress summary
export async function getProgress(): Promise<ProgressSummary> {
  try {
    const response = await api.get('/dsa/progress');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch progress:', error);
    return {
      total_solved: 0,
      total_attempted: 0,
      easy_solved: 0,
      medium_solved: 0,
      hard_solved: 0,
      easy_attempted: 0,
      medium_attempted: 0,
      hard_attempted: 0,
      recent_activity: []
    };
  }
}

// Get status map for all questions
export async function getStatusMap(): Promise<StatusMap> {
  try {
    const response = await api.get('/dsa/status-map');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch status map:', error);
    return {};
  }
}

// Track AI usage
export async function trackAIUsage(
  questionSlug: string,
  actionType: string,
  language: string,
  responseTime?: number
): Promise<void> {
  try {
    await api.post('/dsa/ai-usage', {
      question_slug: questionSlug,
      action_type: actionType,
      language,
      response_time: responseTime
    });
  } catch (error) {
    // Don't throw - AI tracking is non-critical
    console.error('Failed to track AI usage:', error);
  }
}
