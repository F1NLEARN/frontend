export type RankingType = 'ALL' | 'STOCK' | 'ETF' | 'ACHIEVEMENT'
export type BadgeGrade = 'CHAMPION' | 'GOLD' | 'SILVER' | 'BRONZE'

export interface RankingEntryResponse {
  rank: number
  userId: string
  nickname: string
  score: number
  rankingType: RankingType
  lastUpdatedAt: string
}

export interface RankingListResponse {
  seasonId: string
  rankingType: RankingType
  rankings: RankingEntryResponse[]
  totalCount: number
  page: number
  size: number
}

export interface MyRankingEntry {
  rankingType: RankingType
  rank: number | null
  score: number
}

export interface MyRankingResponse {
  seasonId: string
  userId: string
  rankings: MyRankingEntry[]
}

export interface RankingBadgeResponse {
  rankingBadgeId: string
  seasonId: string
  seasonNumber: number
  grade: BadgeGrade
  paidAt: string
}

export const BADGE_GRADE_LABEL: Record<BadgeGrade, { label: string; emoji: string; color: string }> = {
  CHAMPION: { label: '투자왕', emoji: '👑', color: 'text-yellow-500' },
  GOLD:     { label: '골드 투자자', emoji: '🥇', color: 'text-yellow-400' },
  SILVER:   { label: '실버 투자자', emoji: '🥈', color: 'text-slate-400' },
  BRONZE:   { label: '브론즈 투자자', emoji: '🥉', color: 'text-orange-400' },
}

export const RANKING_TYPE_LABEL: Record<RankingType, string> = {
  ALL: '전체',
  STOCK: '국내 주식',
  ETF: '국내 ETF',
  ACHIEVEMENT: '업적',
}
