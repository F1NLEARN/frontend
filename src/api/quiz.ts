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
    api.post<CommonResponse<CreateSessionResponse>>('/v1/quiz/sessions/learning', { category }),

  createPointSession: () =>
    api.post<CommonResponse<CreateSessionResponse>>('/v1/quiz/sessions/point'),

  getQuiz: (sessionId: string, orderNo: number) =>
    api.get<CommonResponse<QuizResponse>>(`/v1/quiz/sessions/${sessionId}/quizzes/${orderNo}`),

  submitAnswer: (sessionId: string, orderNo: number, submitted: number) =>
    api.post<CommonResponse<SubmitAnswerResponse>>(
      `/v1/quiz/sessions/${sessionId}/quizzes/${orderNo}/answers`,
      { submitted }
    ),

  closeSession: (sessionId: string) =>
    api.post<CommonResponse<CloseSessionResponse>>(`/v1/quiz/sessions/${sessionId}/close`),

  selectConceptIncludes: (sessionId: string, orderNos: number[]) =>
    api.post<CommonResponse<null>>(`/v1/quiz/sessions/${sessionId}/concept-includes`, { orderNos }),

  getConceptSummary: (sessionId: string) =>
    api.get<CommonResponse<ConceptSummaryResponse>>(`/v1/quiz/sessions/${sessionId}/concept-summary`),

  sendChatMessage: (sessionId: string, orderNo: number, message: string) =>
    api.post<CommonResponse<ChatMessageResponse>>(
      `/v1/quiz/sessions/${sessionId}/quizzes/${orderNo}/chat`,
      { message }
    ),

  getChatHistory: (sessionId: string, orderNo: number) =>
    api.get<CommonResponse<ChatHistoryResponse>>(
      `/v1/quiz/sessions/${sessionId}/quizzes/${orderNo}/chat`
    ),
}
