export type SeasonStatus = 'UPCOMING' | 'ACTIVE' | 'ENDED'

export interface SeasonResponse {
  seasonId: string
  seasonNumber: number
  startDate: string
  endDate: string
  status: SeasonStatus
}

export interface SeasonListResponse {
  seasons: SeasonResponse[]
}

export interface SeasonParticipantResponse {
  seasonParticipantId: string
  seasonId: string
  userId: string
  passedCategories: string[]
  baseSeedMoney: number
  achievementBonus: number
  rankingBonus: number
  totalSeedMoney: number
  paidAt: string
}

export const SEASON_STATUS_LABEL: Record<SeasonStatus, { label: string; color: string }> = {
  UPCOMING: { label: '예정', color: 'text-slate-500' },
  ACTIVE:   { label: '진행 중', color: 'text-brand-600' },
  ENDED:    { label: '종료', color: 'text-slate-400' },
}
