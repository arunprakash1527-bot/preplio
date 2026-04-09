// Certification types
export interface Certification {
  id: string
  name: string
  code: string
  description: string
  provider: string
  parts: CertificationPart[]
}

export interface CertificationPart {
  part_number: number
  name: string
  total_questions: number
  duration_minutes: number
  pass_percentage: number
}

// User types
export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: "user" | "admin"
  exam_date: string | null
  hours_per_day: number
  created_at: string
  updated_at: string
}

// Document types
export interface Document {
  id: string
  title: string
  type: "pdf" | "docx" | "text" | "transcript" | "youtube" | "image"
  file_url: string | null
  file_size: number | null
  status: "pending" | "processing" | "completed" | "failed"
  total_chunks: number
  uploaded_by: string
  created_at: string
}

// Question types
export interface Question {
  id: string
  stem: string
  question_text: string
  options: Record<string, string>
  correct_answer: string
  explanation: string
  source_chunks: string[]
  difficulty: number
  topic: string
  certification_id: string
  exam_part: number | null
  is_approved: boolean
  is_flagged: boolean
  created_at: string
}

// Quiz types
export type QuizMode = "practice" | "mock_exam_1" | "mock_exam_2" | "quick_review"

export interface QuizSession {
  id: string
  user_id: string
  mode: QuizMode
  topic: string | null
  total_questions: number
  correct_answers: number
  score_percentage: number | null
  time_spent_seconds: number | null
  completed_at: string | null
  created_at: string
}

export interface QuestionAttempt {
  id: string
  session_id: string
  user_id: string
  question_id: string
  selected_answer: string
  is_correct: boolean
  time_spent_seconds: number | null
  next_review_date: string | null
  review_count: number
  created_at: string
}

// Topic mastery
export interface TopicMastery {
  id: string
  user_id: string
  topic: string
  total_attempts: number
  correct_attempts: number
  mastery_percentage: number
  last_practiced: string | null
}

// Chat types
export interface ChatConversation {
  id: string
  user_id: string
  title: string
  created_at: string
}

export interface ChatMessage {
  id: string
  conversation_id: string
  role: "user" | "assistant"
  content: string
  citations: Citation[] | null
  created_at: string
}

export interface Citation {
  document_title: string
  section: string | null
  page_ref: string | null
}

// Study plan types
export interface StudyPlan {
  id: string
  user_id: string
  exam_date: string
  schedule: StudyDay[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StudyDay {
  date: string
  topic: string
  activity: "study" | "practice" | "review" | "mock_exam"
  duration_minutes: number
  description: string
  completed?: boolean
}

// API response types
export interface ApiError {
  error: string
  details?: unknown
}
