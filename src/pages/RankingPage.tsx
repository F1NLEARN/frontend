import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { rankingApi } from '../api/ranking'
import { seasonApi } from '../api/season'
import type { RankingEntryResponse, RankingType, MyRankingResponse, RankingBadgeResponse } from '../types/ranking'
import { RANKING_TYPE_LABEL, BADGE_GRADE_LABEL } from '../types/ranking'
import type { SeasonResponse } from '../types/season'

export default function RankingPage() {
  const navigate = useNavigate()
  const [season, setSeason] = useState<SeasonResponse | null>(null)
  const [rankType, setRankType] = useState<RankingType>('ALL')
  const [rankings, setRankings] = useState<RankingEntryResponse[]>([])
  const [myRanking, setMyRanking] = useState<MyRankingResponse | null>(null)
  const [badges, setBadges] = useState<RankingBadgeResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const s = await seasonApi.getCurrentSeason()
        setSeason(s.data.data)
        const [rankRes, myRes, badgeRes] = await Promise.all([
          rankingApi.getRankings(s.data.data.seasonId, { type: rankType }),
          rankingApi.getMyRanking(s.data.data.seasonId),
          rankingApi.getMyBadges(),
        ])
        setRankings(rankRes.data.data.rankings)
        setMyRanking(myRes.data.data)
        setBadges(badgeRes.data.data)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!season) return
    setLoading(true)
    rankingApi.getRankings(season.seasonId, { type: rankType })
      .then((res) => setRankings(res.data.data.rankings))
      .finally(() => setLoading(false))
  }, [rankType, season])

  const myEntry = myRanking?.rankings.find((r) => r.rankingType === rankType)

  function rankEmoji(rank: number) {
    if (rank === 1) return '👑'
    if (rank === 2) return '🥇'
    if (rank === 3) return '🥈'
    return rank.toString()
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/simulation')} className="text-slate-400 hover:text-slate-600">←</button>
          <h2 className="text-xl font-black text-slate-800">랭킹</h2>
          {season && (
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700">
              시즌 {season.seasonNumber}
            </span>
          )}
        </div>

        {/* 내 뱃지 */}
        {badges.length > 0 && (
          <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-bold text-slate-600">🏅 보유 뱃지</p>
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => {
                const meta = BADGE_GRADE_LABEL[b.grade]
                return (
                  <div key={b.rankingBadgeId} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                    <span>{meta.emoji}</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {b.seasonNumber}시즌 {meta.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 내 순위 */}
        {myEntry && (
          <div className="rounded-2xl bg-brand-gradient p-4 text-white shadow-md">
            <p className="text-xs font-medium text-brand-100">내 순위 ({RANKING_TYPE_LABEL[rankType]})</p>
            <div className="mt-1 flex items-end gap-3">
              <p className="text-4xl font-black">{myEntry.rank != null ? `${myEntry.rank}위` : '-'}</p>
              <p className="mb-1 text-sm font-medium text-brand-100">점수 {Number(myEntry.score).toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* 탭 */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(Object.keys(RANKING_TYPE_LABEL) as RankingType[]).map((t) => (
            <button
              key={t}
              onClick={() => setRankType(t)}
              className={`shrink-0 rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                rankType === t
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-brand-300'
              }`}
            >
              {RANKING_TYPE_LABEL[t]}
            </button>
          ))}
        </div>

        {/* 랭킹 목록 */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : rankings.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">랭킹 데이터가 없습니다</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {rankings.map((r) => (
                <div key={r.userId} className={`flex items-center gap-4 px-5 py-3.5 ${r.rank <= 3 ? 'bg-brand-50/50' : ''}`}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-black text-brand-700">
                    {rankEmoji(r.rank)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{r.nickname}</p>
                  </div>
                  <p className="text-sm font-bold text-brand-600">{Number(r.score).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
