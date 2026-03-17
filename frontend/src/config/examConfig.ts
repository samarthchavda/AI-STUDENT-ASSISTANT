// Exam Configuration
// Production mode: 15 questions per exam

export const EXAM_CONFIG = {
  // Production: 15 questions per exam
  QUESTION_LIMIT: 15,
  
  // Duration per question (in seconds)
  SECONDS_PER_QUESTION: 60,
  
  // Minimum duration (in minutes)
  MIN_DURATION: 5,
}

// Helper function to calculate duration based on question count
export function calculateDuration(questionCount: number): number {
  const calculatedMinutes = Math.ceil((questionCount * EXAM_CONFIG.SECONDS_PER_QUESTION) / 60)
  return Math.max(calculatedMinutes, EXAM_CONFIG.MIN_DURATION)
}
