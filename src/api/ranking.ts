import api from './axios'
import type { CommonResponse } from '../types'
import type {
  RankingListResponse,
  MyRankingResponse,
  RankingBadgeResponse,
  RankingType,
} from '../types/ranking'

export const rankingApi = {
  getRankings: (seasonId: string, params?: { type?: RankingType; page?: number; size?: number }) =>
    api.get<CommonResponse<RankingListResponse>>(`/v1/rankings/seasons/${seasonId}`, { params }),

  getMyRanking: (seasonId: string) =>
    api.get<CommonResponse<MyRankingResponse>>(`/v1/rankings/seasons/${seasonId}/me`),

  getMyBadges: (seasonId?: string) =>
    api.get<CommonResponse<RankingBadgeResponse[]>>('/v1/rankings/badges/me', {
      params: seasonId ? { seasonId } : undefined,
    }),
}
