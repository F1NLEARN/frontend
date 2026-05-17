import api from './axios'
import type {
  CommonResponse,
  CreateSessionResponse,
  QuizResponse,
  SubmitAnswerResponse,
  CloseSessionResponse,
  ConceptSummaryResponse,
  ChatMessageResponse,
  ChatHistoryResponse,
} from '../types'

export const quizApi = {
  createLearningSession: (category: string) =>
    api.post<CommonResponse<CreateSessionResponse>>('/quiz/sessions/learning', { category }),

  createPointSession: () =>
    api.post<CommonResponse<CreateSessionResponse>>('/quiz/sessions/point'),

  getQuiz: (sessionId: string, orderNo: number) =>
    api.get<CommonResponse<QuizResponse>>(`/quiz/sessions/${sessionId}/quizzes/${orderNo}`),

  submitAnswer: (sessionId: string, orderNo: number, submitted: number) =>
    api.post<CommonResponse<SubmitAnswerResponse>>(
      `/quiz/sessions/${sessionId}/quizzes/${orderNo}/answers`,
      { submitted }
    ),

  closeSession: (sessionId: string) =>
    api.post<CommonResponse<CloseSessionResponse>>(`/quiz/sessions/${sessionId}/close`),

  selectConceptIncludes: (sessionId: string, orderNos: number[]) =>
    api.post<CommonResponse<null>>(`/quiz/sessions/${sessionId}/concept-includes`, { orderNos }),

  getConceptSummary: (sessionId: string) =>
    api.get<CommonResponse<ConceptSummaryResponse>>(`/quiz/sessions/${sessionId}/concept-summary`),

  sendChatMessage: (sessionId: string, orderNo: number, message: string) =>
    api.post<CommonResponse<ChatMessageResponse>>(
      `/quiz/sessions/${sessionId}/quizzes/${orderNo}/chat`,
      { message }
    ),

  getChatHistory: (sessionId: string, orderNo: number) =>
    api.get<CommonResponse<ChatHistoryResponse>>(
      `/quiz/sessions/${sessionId}/quizzes/${orderNo}/chat`
    ),
}
