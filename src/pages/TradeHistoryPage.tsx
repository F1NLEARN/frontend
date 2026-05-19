import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { simulationApi } from '../api/simulation'
import type { TradeHistoryResponse, TradeType } from '../types/simulation'

function fmt(n: number) {
  return n?.toLocaleString('ko-KR') ?? '0'
}

const TRADE_TYPE_LABEL: Record<TradeType, string> = {
  BUY: '매수',
  SELL: '매도',
}

export default function TradeHistoryPage() {
  const [trades, setTrades] = useState<TradeHistoryResponse[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [filterType, setFilterType] = useState<TradeType | ''>('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (p: number, type: TradeType | '') => {
    setLoading(true)
    try {
      const res = await simulationApi.getTradeHistory({
        tradeType: type || undefined,
        page: p,
        size: 20,
      })
      const data = res.data.data
      setTrades(data.trades)
      setPage(data.page)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch {
      setTrades([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(0, filterType)
  }, [filterType, load])

  const handleFilterChange = (type: TradeType | '') => {
    setFilterType(type)
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/simulation" className="text-sm text-slate-500 hover:text-brand-600">
              ← 포트폴리오
            </Link>
            <span className="text-slate-300">/</span>
            <h1 className="text-base font-bold text-slate-800">거래 내역</h1>
          </div>
          <span className="text-xs text-slate-400">총 {totalElements}건</span>
        </div>

        {/* 필터 */}
        <div className="flex gap-2">
          {(['', 'BUY', 'SELL'] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleFilterChange(type)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                filterType === type
                  ? 'bg-brand-gradient text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300'
              }`}
            >
              {type === '' ? '전체' : TRADE_TYPE_LABEL[type]}
            </button>
          ))}
        </div>

        {/* 목록 */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : trades.length === 0 ? (
            <div className="py-16 text-center">
              <span className="text-4xl">📋</span>
              <p className="mt-2 text-sm text-slate-400">거래 내역이 없습니다</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {trades.map((t) => (
                <li key={t.tradeHistoryId} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-10 rounded-lg py-1 text-center text-xs font-bold ${
                        t.tradeType === 'BUY'
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-red-50 text-fin-red'
                      }`}
                    >
                      {TRADE_TYPE_LABEL[t.tradeType]}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{t.stockName}</p>
                      <p className="text-xs text-slate-400">
                        {t.stockCode} · {t.quantity}주 · 주당 ₩{fmt(t.tradePrice)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        t.tradeType === 'BUY' ? 'text-brand-600' : 'text-fin-red'
                      }`}
                    >
                      {t.tradeType === 'BUY' ? '-' : '+'}₩{fmt(t.totalTradeAmount)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {t.tradeAt?.slice(0, 10)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => load(page - 1, filterType)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:border-brand-300"
            >
              이전
            </button>
            <span className="text-xs text-slate-500">
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => load(page + 1, filterType)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:border-brand-300"
            >
              다음
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
