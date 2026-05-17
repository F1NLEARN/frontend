import api from './axios'
import type { CommonResponse } from '../types'
import type {
  AchievementListResponse,
  UserAchievementListResponse,
  AchievementCategory,
  AchievementDifficulty,
} from '../types/achievement'

export const achievementApi = {
  getAchievements: (params?: { category?: AchievementCategory; difficulty?: AchievementDifficulty }) =>
    api.get<CommonResponse<AchievementListResponse>>('/v1/achievements', { params }),

  getMyAchievements: (seasonId?: string) =>
    api.get<CommonResponse<UserAchievementListResponse>>('/v1/achievements/me', {
      params: seasonId ? { seasonId } : undefined,
    }),
}
