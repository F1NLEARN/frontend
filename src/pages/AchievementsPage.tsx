import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { achievementApi } from '../api/achievement'
import { seasonApi } from '../api/season'
import type { AchievementResponse, UserAchievementResponse } from '../types/achievement'
import { DIFFICULTY_META, CATEGORY_LABEL } from '../types/achievement'
import type { SeasonResponse } from '../types/season'

export default function AchievementsPage() {
  const navigate = useNavigate()
  const [season, setSeason] = useState<SeasonResponse | null>(null)
  const [all, setAll] = useState<AchievementResponse[]>([])
  const [mine, setMine] = useState<UserAchievementResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [seasonRes, allRes, mineRes] = await Promise.all([
          seasonApi.getCurrentSeason(),
          achievementApi.getAchievements(),
          achievementApi.getMyAchievements(),
        ])
        setSeason(seasonRes.data.data)
        setAll(allRes.data.data.achievements)
        setMine(mineRes.data.data.userAchievements)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const achievedIds = new Set(mine.map((m) => m.achievementId))
  const achievedCount = mine.filter((m) => season && m.seasonId === season.seasonId).length

  const grouped = all.reduce<Record<string, AchievementResponse[]>>((acc, a) => {
    const key = a.category
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-brand-50">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/simulation')} className="text-slate-400 hover:text-slate-600">←</button>
          <h2 className="text-xl font-black text-slate-800">업적</h2>
        </div>

        {/* 이번 시즌 달성 현황 */}
        {season && (
          <div className="rounded-2xl bg-brand-gradient p-5 text-white shadow-md">
            <p className="text-sm font-medium text-brand-100">시즌 {season.seasonNumber} 업적 달성</p>
            <div className="mt-2 flex items-end gap-2">
              <p className="text-4xl font-black">{achievedCount}</p>
              <p className="mb-1 text-sm text-brand-100">/ {all.length}개</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${all.length ? (achievedCount / all.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-slate-700">
                {category === 'STOCK' ? '📈' : '🗂️'} {CATEGORY_LABEL[category as keyof typeof CATEGORY_LABEL]}
              </h3>
              <div className="space-y-3">
                {items
                  .sort((a, b) => {
                    const order = { BRONZE: 0, SILVER: 1, GOLD: 2 }
                    return order[a.difficulty] - order[b.difficulty]
                  })
                  .map((a) => {
                    const meta = DIFFICULTY_META[a.difficulty]
                    const achieved = achievedIds.has(a.achievementId)
                    return (
                      <div
                        key={a.achievementId}
                        className={`flex items-center gap-3 rounded-xl border p-3.5 transition ${
                          achieved ? meta.bg : 'border-slate-100 bg-slate-50 opacity-60'
                        }`}
                      >
                        <span className={`text-2xl ${!achieved ? 'grayscale' : ''}`}>{meta.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold ${achieved ? 'text-slate-800' : 'text-slate-500'}`}>
                              {a.name}
                            </p>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold border ${meta.bg} ${meta.color}`}>
                              {meta.label}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {a.conditionType === 'FIRST_BUY' && '첫 매수 달성'}
                            {a.conditionType === 'HOLD_COUNT' && `${a.conditionValue}종목 이상 보유`}
                            {a.conditionType === 'RETURN_RATE' && `수익률 +${a.conditionValue}% 달성`}
                          </p>
                        </div>
                        {achieved && (
                          <span className="rounded-full bg-brand-100 px-2 py-1 text-xs font-bold text-brand-700">
                            달성 ✓
                          </span>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}
