import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { simulationApi } from '../api/simulation'
import type { StockItemResponse, StockAssetType } from '../types/simulation'

function fmt(n: number) {
  return n?.toLocaleString('ko-KR') ?? '0'
}

type ModalMode = 'buy' | 'sell'

interface TradeModal {
  mode: ModalMode
  stock: StockItemResponse
}

export default function StockListPage() {
  const navigate = useNavigate()
  const [stocks, setStocks] = useState<StockItemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [assetType, setAssetType] = useState<StockAssetType | ''>('')
  const [page, setPage] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [modal, setModal] = useState<TradeModal | null>(null)
  const [qty, setQty] = useState('')
  const [tradeLoading, setTradeLoading] = useState(false)
  const [tradeMsg, setTradeMsg] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [favLoading, setFavLoading] = useState<Set<string>>(new Set())

  const fetchStocks = async (reset = false) => {
    setLoading(true)
    try {
      const currentPage = reset ? 0 : page
      const res = await simulationApi.getStocks({
        keyword: keyword || undefined,
        assetType: assetType || undefined,
        page: currentPage,
        size: 20,
      })
      const data = res.data.data
      if (reset) {
        setStocks(data.items)
        setPage(0)
      } else {
        setStocks((prev) => [...prev, ...data.items])
      }
      setHasNext(data.hasNext)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStocks(true)
    simulationApi.getFavorites().then(res => {
      setFavorites(new Set(res.data.data.map(f => f.symbol)))
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetType])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    fetchStocks(true)
  }

  const handleLoadMore = () => {
    setPage((p) => p + 1)
  }

  useEffect(() => {
    if (page > 0) fetchStocks(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const openModal = (mode: ModalMode, stock: StockItemResponse) => {
    setModal({ mode, stock })
    setQty('')
    setTradeMsg('')
  }

  const handleTrade = async () => {
    if (!modal || !qty || Number(qty) <= 0) return
    setTradeLoading(true)
    setTradeMsg('')
    try {
      if (modal.mode === 'buy') {
        await simulationApi.buyStock({ stockCode: modal.stock.stockCode, quantity: Number(qty) })
        setTradeMsg(`✅ ${modal.stock.name} ${qty}주 매수 완료!`)
      } else {
        await simulationApi.sellStock({ stockCode: modal.stock.stockCode, quantity: Number(qty) })
        setTradeMsg(`✅ ${modal.stock.name} ${qty}주 매도 완료!`)
      }
      setTimeout(() => setModal(null), 1500)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setTradeMsg(`❌ ${msg ?? '거래에 실패했습니다.'}`)
    } finally {
      setTradeLoading(false)
    }
  }

  const totalAmount = modal && qty
    ? (modal.stock.currentPrice ?? 0) * Number(qty)
    : 0

  const toggleFavorite = async (stock: StockItemResponse) => {
    if (favLoading.has(stock.stockCode)) return
    setFavLoading(prev => new Set(prev).add(stock.stockCode))
    try {
      if (favorites.has(stock.stockCode)) {
        await simulationApi.removeFavorite(stock.stockCode)
        setFavorites(prev => { const s = new Set(prev); s.delete(stock.stockCode); return s })
      } else {
        await simulationApi.addFavorite(stock.assetType, stock.stockCode)
        setFavorites(prev => new Set(prev).add(stock.stockCode))
      }
    } catch {
      // ignore
    } finally {
      setFavLoading(prev => { const s = new Set(prev); s.delete(stock.stockCode); return s })
    }
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* 헤더 */}
        <div className="mb-5 flex items-center gap-3">
          <button onClick={() => navigate('/simulation')} className="text-slate-400 hover:text-slate-600">
            ←
          </button>
          <h2 className="text-xl font-black text-slate-800">종목 매매</h2>
        </div>

        {/* 검색 & 필터 */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="종목명 또는 코드 검색"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="submit"
              className="rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"
            >
              검색
            </button>
          </form>
          <div className="flex gap-2">
            {(['', 'STOCK', 'ETF'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setAssetType(t)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  assetType === t
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'
                }`}
              >
                {t === '' ? '전체' : t}
              </button>
            ))}
          </div>
        </div>

        {/* 종목 목록 */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading && stocks.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : stocks.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">검색 결과가 없습니다</div>
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {stocks.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-lg px-2 py-0.5 text-xs font-bold ${
                          s.assetType === 'ETF'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-brand-100 text-brand-700'
                        }`}
                      >
                        {s.assetType}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.stockCode}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800">₩{fmt(s.currentPrice)}</p>
                      <button
                        onClick={() => toggleFavorite(s)}
                        disabled={favLoading.has(s.stockCode)}
                        className={`text-lg leading-none transition disabled:opacity-50 ${
                          favorites.has(s.stockCode) ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-300'
                        }`}
                        title={favorites.has(s.stockCode) ? '관심 해제' : '관심 등록'}
                      >
                        ★
                      </button>
                      {s.tradable ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openModal('buy', s)}
                            className="rounded-lg bg-brand-gradient px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
                          >
                            매수
                          </button>
                          <button
                            onClick={() => openModal('sell', s)}
                            className="rounded-lg border border-fin-red bg-fin-red-light px-3 py-1.5 text-xs font-bold text-fin-red hover:bg-red-100"
                          >
                            매도
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">거래불가</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {hasNext && (
                <div className="border-t border-slate-100 p-3 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="text-sm font-semibold text-brand-600 hover:underline disabled:opacity-50"
                  >
                    {loading ? '로딩 중...' : '더 보기'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* 매매 모달 */}
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
              <p className="text-sm font-bold text-slate-800">{modal.stock.name}</p>
              <p className="text-xs text-slate-500">{modal.stock.stockCode}</p>
              <p className="mt-1 text-base font-black text-slate-800">₩{fmt(modal.stock.currentPrice)}</p>
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

            {qty && Number(qty) > 0 && (
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
