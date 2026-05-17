// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  userId: string
  email: string
  nickname: string
  status: string
  role: string
  accessToken: string
  refreshToken: string
  tokenType: string
  accessTokenExpiresInSec: number
}

export interface UserMeResponse {
  userId: string
  email: string
  nickname: string
  status: string
  userRole: string
}

export interface TokenRefreshResponse {
  accessToken: string
  refreshToken: string
  accessTokenExpiresInSec: number
}

// ─── Quiz Session ─────────────────────────────────────────────────────────────

export type SessionType = 'LEARNING' | 'POINT'
export type PassStatus = 'PASS' | 'FAIL' | 'IN_PROGRESS'

export interface QuizItemResponse {
  quizSessionQuizId: string
  orderNo: number
}

export interface CreateSessionResponse {
  sessionId: string
  sessionType: SessionType
  category: string | null
  totalCount: number
  quizzes: QuizItemResponse[]
  startedAt: string
}

export interface ChoiceResponse {
  no: number
  content: string
}

export interface QuizResponse {
  quizSessionQuizId: string
  orderNo: number
  quizId: string
  title: string
  question: string
  choices: ChoiceResponse[]
}

export interface SubmitAnswerResponse {
  quizId: string
  submitted: number
  correct: boolean
  correctNo: number
}

export interface CloseSessionResponse {
  sessionId: string
  sessionType: SessionType
  passStatus: PassStatus
  score: number
  correctCount: number
  totalCount: number
  seedMoney: number | null
  endedAt: string
}

export interface ConceptSummaryResponse {
  summaryContent: string
}

// ─── Chatbot ──────────────────────────────────────────────────────────────────

export interface ChatMessageResponse {
  answer: string
}

export interface ChatHistoryMessage {
  role: 'USER' | 'ASSISTANT'
  content: string
}

export interface ChatHistoryResponse {
  messages: ChatHistoryMessage[]
}

// ─── Common ───────────────────────────────────────────────────────────────────

export interface CommonResponse<T> {
  success: boolean
  message: string
  data: T
}

export type MainTopic = 'DOMESTIC_STOCK' | 'DOMESTIC_ETF' | 'FUTURES' | 'BASIC_FINANCE'

export const MAIN_TOPIC_LABELS: Record<MainTopic, string> = {
  DOMESTIC_STOCK: '국내 주식',
  DOMESTIC_ETF: '국내 ETF',
  FUTURES: '선물',
  BASIC_FINANCE: '기초 금융',
}
