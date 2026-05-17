export type AchievementCategory = 'STOCK' | 'ETF'
export type AchievementDifficulty = 'BRONZE' | 'SILVER' | 'GOLD'
export type ConditionType = 'FIRST_BUY' | 'HOLD_COUNT' | 'RETURN_RATE'

export interface AchievementResponse {
  achievementId: string
  name: string
  category: AchievementCategory
  difficulty: AchievementDifficulty
  conditionType: ConditionType
  conditionValue: number
}

export interface AchievementListResponse {
  achievements: AchievementResponse[]
}

export interface UserAchievementResponse {
  userAchievementId: string
  achievementId: string
  name: string
  category: AchievementCategory
  difficulty: AchievementDifficulty
  achievedAt: string
  seasonId: string
}

export interface UserAchievementListResponse {
  userAchievements: UserAchievementResponse[]
}

export const DIFFICULTY_META: Record<AchievementDifficulty, { emoji: string; label: string; color: string; bg: string }> = {
  BRONZE: { emoji: '🥉', label: '브론즈', color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' },
  SILVER: { emoji: '🥈', label: '실버',   color: 'text-slate-500',  bg: 'bg-slate-50 border-slate-200'  },
  GOLD:   { emoji: '🥇', label: '골드',   color: 'text-yellow-500', bg: 'bg-yellow-50 border-yellow-200' },
}

export const CATEGORY_LABEL: Record<AchievementCategory, string> = {
  STOCK: '국내 주식',
  ETF:   '국내 ETF',
}
