import api from './axios'
import type { CommonResponse } from '../types'
import type {
  SeasonListResponse,
  SeasonResponse,
  SeasonParticipantResponse,
} from '../types/season'

export const seasonApi = {
  getSeasons: () =>
    api.get<CommonResponse<SeasonListResponse>>('/v1/seasons'),

  getCurrentSeason: () =>
    api.get<CommonResponse<SeasonResponse>>('/v1/seasons/current'),

  getMyParticipation: (seasonId: string) =>
    api.get<CommonResponse<SeasonParticipantResponse>>(`/v1/seasons/${seasonId}/me`),

  registerParticipant: (seasonId: string, passedCategories: string[]) =>
    api.post<CommonResponse<SeasonParticipantResponse>>(
      `/v1/seasons/${seasonId}/participants`,
      { passedCategories }
    ),
}
