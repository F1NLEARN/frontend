import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import { simulationApi } from '../api/simulation'
import { seasonApi } from '../api/season'
import type { InvestmentAccountResponse, HoldingResponse, PortfolioAnalysisResponse, FavoriteStockResponse } from '../types/simulation'
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

interface TradeModal {
  mode: 'buy' | 'sell'
  stockCode: string
  stockName: string
  currentPrice: number
}

export default function SimulationPage() {
  const navigate = useNavigate()
  const [season, setSeason] = useState<SeasonResponse | null>(null)
  const [account, setAccount] = useState<InvestmentAccountResponse | null>(null)
  const [holdings, setHoldings] = useState<HoldingResponse[]>([])
  const [favorites, setFavorites] = useState<FavoriteStockResponse[]>([])
  const [analysis, setAnalysis] = useState<PortfolioAnalysisResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<TradeModal | null>(null)
  const [qty, setQty] = useState('')
  const [tradeLoading, setTradeLoading] = useState(false)
  const [tradeMsg, setTradeMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      // 계좌·보유종목 (필수)
      try {
        const [accountRes, holdingsRes] = await Promise.all([
          simulationApi.getAccount(),
          simulationApi.getHoldings(),
        ])
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

      // 시즌 정보 (없어도 무방)
      try {
        const seasonRes = await seasonApi.getCurrentSeason()
        setSeason(seasonRes.data.data)
      } catch {
        // 진행 중인 시즌이 없으면 배너 미표시
      }

      // 관심 종목
      try {
        const favRes = await simulationApi.getFavorites()
        setFavorites(favRes.data.data)
      } catch {
        // ignore
      }

      // 기존 포트폴리오 분석 복원 (없으면 무시)
      try {
        const analysisRes = await simulationApi.getPortfolioAnalysis()
        if (analysisRes.data.data) setAnalysis(analysisRes.data.data)
      } catch {
        // 분석 이력 없으면 무시
      }
    }
    load()
  }, [])

  const openModal = (mode: 'buy' | 'sell', h: HoldingResponse) => {
    setModal({ mode, stockCode: h.stockCode, stockName: h.stockName, currentPrice: h.currentPrice })
    setQty('')
    setTradeMsg('')
  }

  const openModalFromFav = (mode: 'buy' | 'sell', f: FavoriteStockResponse) => {
    setModal({ mode, stockCode: f.symbol, stockName: f.stockName, currentPrice: 0 })
    setQty('')
    setTradeMsg('')
  }

  const handleTrade = async () => {
    if (!modal || !qty || Number(qty) <= 0) return
    setTradeLoading(true)
    setTradeMsg('')
    try {
      if (modal.mode === 'buy') {
        await simulationApi.buyStock({ stockCode: modal.stockCode, quantity: Number(qty) })
        setTradeMsg(`✅ ${modal.stockName} ${qty}주 매수 완료!`)
      } else {
        await simulationApi.sellStock({ stockCode: modal.stockCode, quantity: Number(qty) })
        setTradeMsg(`✅ ${modal.stockName} ${qty}주 매도 완료!`)
      }
      setTimeout(() => {
        setModal(null)
        simulationApi.getAccount().then(r => setAccount(r.data.data)).catch(() => {})
        simulationApi.getHoldings().then(r => setHoldings(r.data.data)).catch(() => {})
      }, 1500)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setTradeMsg(`❌ ${msg ?? '거래에 실패했습니다.'}`)
    } finally {
      setTradeLoading(false)
    }
  }

  const removeFavorite = async (symbol: string) => {
    try {
      await simulationApi.removeFavorite(symbol)
      setFavorites(prev => prev.filter(f => f.symbol !== symbol))
    } catch {
      // ignore
    }
  }

  const totalAmount = modal && qty && modal.currentPrice > 0
    ? modal.currentPrice * Number(qty)
    : null

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
                <div key={h.holdingId} className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{h.stockName}</p>
                      <p className="text-xs text-slate-500">{h.stockCode} · {h.quantity}주</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">₩{fmt(h.currentEvaluationAmount)}</p>
                      <ProfitBadge value={h.profitRate} />
                    </div>
                  </div>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      onClick={() => openModal('buy', h)}
                      className="flex-1 rounded-lg bg-brand-gradient py-1.5 text-xs font-bold text-white hover:opacity-90"
                    >
                      + 매수
                    </button>
                    <button
                      onClick={() => openModal('sell', h)}
                      className="flex-1 rounded-lg border border-fin-red bg-fin-red-light py-1.5 text-xs font-bold text-fin-red hover:bg-red-100"
                    >
                      - 매도
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 관심 종목 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">관심 종목</h3>
            <Link to="/simulation/stocks" className="text-xs font-semibold text-brand-600 hover:underline">
              종목 추가 →
            </Link>
          </div>
          {favorites.length === 0 ? (
            <div className="py-6 text-center">
              <span className="text-2xl">⭐</span>
              <p className="mt-2 text-sm text-slate-400">관심 종목이 없습니다</p>
              <Link
                to="/simulation/stocks"
                className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline"
              >
                종목 탐색하기 →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {favorites.map((f) => (
                <div key={f.favoriteStockId} className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-lg px-2 py-0.5 text-xs font-bold ${
                          f.assetType === 'ETF'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-brand-100 text-brand-700'
                        }`}
                      >
                        {f.assetType}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{f.stockName}</p>
                        <p className="text-xs text-slate-500">{f.symbol}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFavorite(f.symbol)}
                      className="ml-2 text-slate-300 hover:text-red-400 transition"
                      title="관심 해제"
                    >
                      ★
                    </button>
                  </div>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      onClick={() => openModalFromFav('buy', f)}
                      className="flex-1 rounded-lg bg-brand-gradient py-1.5 text-xs font-bold text-white hover:opacity-90"
                    >
                      + 매수
                    </button>
                    <button
                      onClick={() => openModalFromFav('sell', f)}
                      className="flex-1 rounded-lg border border-fin-red bg-fin-red-light py-1.5 text-xs font-bold text-fin-red hover:bg-red-100"
                    >
                      - 매도
                    </button>
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
                analysis.diagnosis.riskLevel === 'AGGRESSIVE' ? 'border-red-200 bg-fin-red-light' :
                analysis.diagnosis.riskLevel === 'NORMAL' ? 'border-yellow-200 bg-yellow-50' :
                'border-brand-200 bg-brand-50'
              }`}>
                <p className="text-sm font-bold text-slate-800 mb-1">📊 진단 요약</p>
                <p className="text-sm text-slate-700">{analysis.diagnosis.analysisSummary}</p>
                {analysis.diagnosis.warnings.map((w, i) => (
                  <p key={i} className="mt-1 text-xs text-amber-700">⚠️ {w}</p>
                ))}
              </div>

              {/* 자산 배분 */}
              {(() => {
                const { totalValuationAmount, totalAssetAmount } = analysis.portfolioSummary
                const valuationRatio = totalAssetAmount > 0 ? totalValuationAmount / totalAssetAmount : 0
                const allocationItems = [
                  { label: '주식', value: Number(analysis.allocation.stockWeight) * valuationRatio },
                  { label: 'ETF',  value: Number(analysis.allocation.etfWeight)   * valuationRatio },
                  { label: '현금', value: Number(analysis.allocation.cashWeight) },
                ]
                return (
                  <div>
                    <p className="mb-2 text-xs font-bold text-slate-600">자산 배분</p>
                    <div className="space-y-1.5">
                      {allocationItems.map(({ label, value }) => (
                        <div key={label} className="flex items-center gap-2">
                          <span className="w-8 text-xs text-slate-500">{label}</span>
                          <div className="flex-1 overflow-hidden rounded-full bg-brand-100 h-2">
                            <div
                              className="h-full rounded-full bg-brand-gradient"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs font-bold text-slate-700">{value.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

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

      {/* 매수/매도 모달 */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800">
                {modal.mode === 'buy' ? '📈 매수' : '📉 매도'}
              </h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="mb-4 rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-bold text-slate-800">{modal.stockName}</p>
              <p className="text-xs text-slate-500">{modal.stockCode}</p>
              {modal.currentPrice > 0 && (
                <p className="mt-1 text-base font-black text-slate-800">₩{fmt(modal.currentPrice)}</p>
              )}
            </div>

            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">수량</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="주수 입력"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {totalAmount !== null && qty && Number(qty) > 0 && (
              <div className="mb-4 rounded-xl bg-brand-50 border border-brand-100 px-4 py-2.5">
                <p className="text-xs text-slate-500">예상 {modal.mode === 'buy' ? '매수' : '매도'}금액</p>
                <p className="text-lg font-black text-brand-700">₩{fmt(totalAmount)}</p>
              </div>
            )}

            {tradeMsg && (
              <div className={`mb-3 rounded-xl px-4 py-2.5 text-sm font-medium ${
                tradeMsg.startsWith('✅') ? 'bg-brand-50 border border-brand-200 text-brand-700' : 'bg-fin-red-light border border-red-200 text-fin-red'
              }`}>
                {tradeMsg}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setModal(null)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                취소
              </button>
              <button
                onClick={handleTrade}
                disabled={!qty || Number(qty) <= 0 || tradeLoading || tradeMsg.startsWith('✅')}
                className={`flex-1 rounded-xl py-3 text-sm font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50 ${
                  modal.mode === 'buy' ? 'bg-brand-gradient' : 'bg-fin-red'
                }`}
              >
                {tradeLoading ? '처리 중...' : tradeMsg.startsWith('✅') ? '완료' : modal.mode === 'buy' ? '매수 확정' : '매도 확정'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
