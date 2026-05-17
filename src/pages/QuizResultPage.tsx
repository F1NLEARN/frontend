import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { quizApi } from '../api/quiz'
import type { CloseSessionResponse } from '../types'

export default function QuizResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state?.result as CloseSessionResponse | undefined

  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState(false)

  const isLearning = result?.sessionType === 'LEARNING'
  const passed = result?.passStatus === 'PASS'
  const scorePercent = result
    ? Math.round((result.correctCount / result.totalCount) * 100)
    : 0

  useEffect(() => {
    if (!sessionId || !isLearning) return
    setSummaryLoading(true)

    const poll = async (retries = 10) => {
      try {
        const { data } = await quizApi.getConceptSummary(sessionId)
        setSummary(data.data.summaryContent)
        setSummaryLoading(false)
      } catch {
        if (retries > 0) {
          setTimeout(() => poll(retries - 1), 2000)
        } else {
          setSummaryError(true)
          setSummaryLoading(false)
        }
      }
    }
    poll()
  }, [sessionId, isLearning])

  if (!result) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-50">
        <p className="text-slate-500">결과 정보를 찾을 수 없습니다.</p>
      </div>
    )
  }

  const emoji =
    result.sessionType === 'POINT'
      ? passed ? '🏆' : '😓'
      : scorePercent >= 80 ? '🎉' : scorePercent >= 50 ? '👍' : '📚'

  return (
    <div className="min-h-screen bg-brand-50">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-10">
        {/* 결과 카드 */}
        <div className="rounded-2xl border border-brand-100 bg-white p-8 shadow-sm">
          {/* 상단 배너 */}
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="text-5xl">{emoji}</span>
            <h2 className="mt-3 text-2xl font-black text-slate-800">
              {isLearning
                ? '학습 완료!'
                : passed
                ? '합격!'
                : '아쉽지만 불합격'}
            </h2>
            {!isLearning && (
              <p
                className={`mt-1 text-sm font-semibold ${
                  passed ? 'text-brand-600' : 'text-fin-red'
                }`}
              >
                {passed
                  ? `시드머니 +${result.seedMoney?.toLocaleString()}원 획득! 🎊`
                  : '다음엔 더 잘할 수 있어요!'}
              </p>
            )}
          </div>

          {/* 점수 게이지 */}
          <div className="mb-6 rounded-2xl bg-brand-50 p-5">
            <div className="mb-3 flex items-end justify-between">
              <span className="text-sm font-semibold text-slate-600">정확도</span>
              <span className="text-3xl font-black text-brand-600">{scorePercent}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-brand-100">
              <div
                className="h-full rounded-full bg-brand-gradient transition-all duration-1000"
                style={{ width: `${scorePercent}%` }}
              />
            </div>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '정답', value: result.correctCount, color: 'text-brand-600' },
              { label: '오답', value: result.totalCount - result.correctCount, color: 'text-fin-red' },
              { label: '전체', value: result.totalCount, color: 'text-slate-700' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center"
              >
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          {/* 포인트 퀴즈 결과 뱃지 */}
          {!isLearning && (
            <div
              className={`mt-4 rounded-xl px-4 py-3 text-center text-sm font-bold ${
                passed
                  ? 'bg-brand-50 border border-brand-200 text-brand-700'
                  : 'bg-fin-red-light border border-red-200 text-fin-red'
              }`}
            >
              {passed ? `✅ PASS · 시드머니 ${result.seedMoney?.toLocaleString()}원` : '❌ FAIL · 70% 이상 정답 시 PASS'}
            </div>
          )}
        </div>

        {/* AI 개념 정리 */}
        {isLearning && (
          <div className="mt-5 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient text-sm shadow-sm">
                📖
              </div>
              <h3 className="text-base font-bold text-slate-800">AI 개념 정리</h3>
            </div>

            {summaryLoading && (
              <div className="flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                <p className="text-sm text-brand-600">AI가 개념을 정리하고 있습니다...</p>
              </div>
            )}

            {summary && (
              <div className="rounded-xl bg-brand-50 border border-brand-100 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {summary}
                </p>
              </div>
            )}

            {summaryError && (
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-400">
                개념 정리를 아직 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
              </p>
            )}
          </div>
        )}

        {/* 홈으로 */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 w-full rounded-xl bg-brand-gradient py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
        >
          홈으로 돌아가기
        </button>
      </main>
    </div>
  )
}
