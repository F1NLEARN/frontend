import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import { simulationApi } from '../api/simulation'
import { seasonApi } from '../api/season'
import type { InvestmentAccountResponse, HoldingResponse, PortfolioAnalysisResponse } from '../types/simulation'
import type { SeasonResponse } from '../types/season'

function fmt(n: number) {
  return n?.toLocaleString('ko-KR') ?? '0'
}

function ProfitBadge({ value }: { value: number }) {
  const isPos = value >= 0
  return (
    <span className={`text-sm font-semibold ${isPos ? 'text-brand-600' : 'text-fin-red'}`}>
      {isPos ? '+' : ''}{value?.toFixed(2)}%
    </span>
  )
}

export default function SimulationPage() {
  const navigate = useNavigate()
  const [season, setSeason] = useState<SeasonResponse | null>(null)
  const [account, setAccount] = useState<InvestmentAccountResponse | null>(null)
  const [holdings, setHoldings] = useState<HoldingResponse[]>([])
  const [analysis, setAnalysis] = useState<PortfolioAnalysisResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [seasonRes, accountRes, holdingsRes] = await Promise.all([
          seasonApi.getCurrentSeason(),
          simulationApi.getAccount(),
          simulationApi.getHoldings(),
        ])
        setSeason(seasonRes.data.data)
        setAccount(accountRes.data.data)
        setHoldings(holdingsRes.data.data)
      } catch (e: unknown) {
        const status = (e as { response?: { status?: number } })?.response?.status
        if (status === 404) {
          setError('NO_ACCOUNT')
        } else {
          setError('LOAD_FAILED')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleRefreshAnalysis = async () => {
    setAnalysisLoading(true)
    try {
      const res = await simulationApi.refreshPortfolioAnalysis()
      setAnalysis(res.data.data)
    } catch {
      // ignore
    } finally {
      setAnalysisLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (error === 'NO_ACCOUNT') {
    return (
      <div className="min-h-screen bg-brand-50">
        <Header />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <span className="text-5xl">🌱</span>
          <h2 className="mt-4 text-xl font-bold text-slate-800">아직 투자 계정이 없어요</h2>
          <p className="mt-2 text-sm text-slate-500">
            포인트 퀴즈를 통과하고 시드머니를 받으면<br />모의 투자를 시작할 수 있어요!
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-bold text-white shadow-sm hover:opacity-90"
          >
            퀴즈 하러 가기
          </button>
        </div>
      </div>
    )
  }

  const totalAsset = (account?.cashBalance ?? 0) + (account?.totalEvaluationAmount ?? 0)

  return (
    <div className="min-h-screen bg-brand-50">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-5">
        {/* 시즌 배너 */}
        {season && (
          <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-white px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700">
                시즌 {season.seasonNumber}
              </span>
              <span className="text-xs text-slate-500">
                {season.startDate} ~ {season.endDate}
              </span>
            </div>
            <Link to="/rankings" className="text-xs font-semibold text-brand-600 hover:underline">
              랭킹 보기 →
            </Link>
          </div>
        )}

        {/* 계좌 요약 */}
        {account && (
          <div className="rounded-2xl bg-brand-gradient p-6 text-white shadow-md">
            <p className="text-sm font-medium text-brand-100">총 자산</p>
            <p className="mt-1 text-3xl font-black">₩{fmt(totalAsset)}</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
                <p className="text-xs text-brand-100">현금</p>
                <p className="mt-0.5 text-sm font-bold">₩{fmt(account.cashBalance)}</p>
              </div>
              <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
                <p className="text-xs text-brand-100">평가금액</p>
                <p className="mt-0.5 text-sm font-bold">₩{fmt(account.totalEvaluationAmount)}</p>
              </div>
              <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
                <p className="text-xs text-brand-100">총 손익</p>
                <p className={`mt-0.5 text-sm font-bold ${account.totalProfitLoss >= 0 ? 'text-white' : 'text-red-300'}`}>
                  {account.totalProfitLoss >= 0 ? '+' : ''}₩{fmt(account.totalProfitLoss)}
                </p>
              </div>
            </div>
            <div className="mt-2 text-right text-sm font-bold">
              수익률&nbsp;
              <span className={account.totalProfitRate >= 0 ? 'text-white' : 'text-red-300'}>
                {account.totalProfitRate >= 0 ? '+' : ''}{account.totalProfitRate?.toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        {/* 바로가기 */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '종목 매매', icon: '📈', to: '/simulation/stocks' },
            { label: '거래 내역', icon: '📋', to: '/simulation/trades' },
            { label: '업적', icon: '🏅', to: '/achievements' },
          ].map(({ label, icon, to }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-4 text-center shadow-sm transition hover:border-brand-300 hover:shadow-md"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-semibold text-slate-700">{label}</span>
            </Link>
          ))}
        </div>

        {/* 보유 종목 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">보유 종목</h3>
            <Link to="/simulation/stocks" className="text-xs font-semibold text-brand-600 hover:underline">
              매매하기 →
            </Link>
          </div>
          {holdings.length === 0 ? (
            <div className="py-8 text-center">
              <span className="text-3xl">📭</span>
              <p className="mt-2 text-sm text-slate-400">보유 종목이 없습니다</p>
              <Link
                to="/simulation/stocks"
                className="mt-3 inline-block rounded-xl bg-brand-100 px-4 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-200"
              >
                종목 탐색하기
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {holdings.map((h) => (
                <div key={h.holdingId} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{h.stockName}</p>
                    <p className="text-xs text-slate-500">{h.stockCode} · {h.quantity}주</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">₩{fmt(h.currentEvaluationAmount)}</p>
                    <ProfitBadge value={h.profitRate} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI 포트폴리오 분석 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient text-sm">🤖</div>
              <h3 className="text-base font-bold text-slate-800">AI 포트폴리오 분석</h3>
            </div>
            <button
              onClick={handleRefreshAnalysis}
              disabled={analysisLoading}
              className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-100 disabled:opacity-50"
            >
              {analysisLoading ? '분석 중...' : '분석 요청'}
            </button>
          </div>

          {!analysis ? (
            <p className="text-center py-6 text-sm text-slate-400">
              분석 요청 버튼을 눌러 AI 피드백을 받아보세요
            </p>
          ) : (
            <div className="space-y-4">
              {/* 진단 */}
              <div className={`rounded-xl border p-4 ${
                analysis.diagnosis.riskLevel === 'HIGH' ? 'border-red-200 bg-fin-red-light' :
                analysis.diagnosis.riskLevel === 'MEDIUM' ? 'border-yellow-200 bg-yellow-50' :
                'border-brand-200 bg-brand-50'
              }`}>
                <p className="text-sm font-bold text-slate-800 mb-1">📊 진단 요약</p>
                <p className="text-sm text-slate-700">{analysis.diagnosis.analysisSummary}</p>
                {analysis.diagnosis.warnings.map((w, i) => (
                  <p key={i} className="mt-1 text-xs text-amber-700">⚠️ {w}</p>
                ))}
              </div>

              {/* 자산 배분 */}
              <div>
                <p className="mb-2 text-xs font-bold text-slate-600">자산 배분</p>
                <div className="space-y-1.5">
                  {[
                    { label: '주식', value: analysis.allocation.stockWeight },
                    { label: 'ETF',  value: analysis.allocation.etfWeight  },
                    { label: '현금', value: analysis.allocation.cashWeight  },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="w-8 text-xs text-slate-500">{label}</span>
                      <div className="flex-1 overflow-hidden rounded-full bg-brand-100 h-2">
                        <div
                          className="h-full rounded-full bg-brand-gradient"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs font-bold text-slate-700">{Number(value).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 추천 */}
              {analysis.recommendations.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold text-slate-600">추천 액션</p>
                  <div className="space-y-2">
                    {analysis.recommendations.map((r, i) => (
                      <div key={i} className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-2.5">
                        <p className="text-xs font-bold text-brand-700">{r.targetCategory}</p>
                        <p className="text-xs text-slate-600">{r.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
