import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { quizApi } from '../api/quiz'
import { MAIN_TOPIC_LABELS, type MainTopic } from '../types'

const TOPICS: { key: MainTopic; emoji: string; desc: string }[] = [
  { key: 'DOMESTIC_STOCK', emoji: '📈', desc: '국내 상장 주식의 기본 개념과 투자 원칙' },
  { key: 'DOMESTIC_ETF',   emoji: '🗂️', desc: 'ETF 구조, 운용 방식과 활용 전략'      },
  { key: 'FUTURES',        emoji: '⚡', desc: '선물 거래의 원리와 헤징 전략'           },
  { key: 'BASIC_FINANCE',  emoji: '💡', desc: '금리, 환율, 재무제표 등 기초 금융'      },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const startLearning = async (category: MainTopic) => {
    setError('')
    // 진행 중인 학습 세션이 있으면 이어서 풀기
    const activeId = sessionStorage.getItem(`quiz_active_learning_${category}`)
    if (activeId && sessionStorage.getItem(`quiz_session_${activeId}`)) {
      const session = JSON.parse(sessionStorage.getItem(`quiz_session_${activeId}`)!)
      navigate(`/quiz/session/${activeId}`, { state: { session } })
      return
    }
    setLoading(true)
    try {
      const { data } = await quizApi.createLearningSession(category)
      const { sessionId } = data.data
      sessionStorage.setItem(`quiz_session_${sessionId}`, JSON.stringify(data.data))
      sessionStorage.setItem(`quiz_orderNo_${sessionId}`, '1')
      sessionStorage.setItem(`quiz_active_learning_${category}`, sessionId)
      navigate(`/quiz/session/${sessionId}`, { state: { session: data.data } })
    } catch {
      setError('세션 생성에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const startPoint = async () => {
    setError('')
    // 진행 중인 포인트 세션이 있으면 이어서 풀기
    const activeId = sessionStorage.getItem('quiz_active_point')
    if (activeId && sessionStorage.getItem(`quiz_session_${activeId}`)) {
      const session = JSON.parse(sessionStorage.getItem(`quiz_session_${activeId}`)!)
      navigate(`/quiz/session/${activeId}`, { state: { session } })
      return
    }
    setLoading(true)
    try {
      const { data } = await quizApi.createPointSession()
      const { sessionId } = data.data
      sessionStorage.setItem(`quiz_session_${sessionId}`, JSON.stringify(data.data))
      sessionStorage.setItem(`quiz_orderNo_${sessionId}`, '1')
      sessionStorage.setItem('quiz_active_point', sessionId)
      navigate(`/quiz/session/${sessionId}`, { state: { session: data.data } })
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status
      if (status === 409 || status === 400) {
        setError('이번 달 포인트 퀴즈는 이미 응시했습니다. 다음 달에 다시 도전해보세요! 🗓️')
      } else {
        setError('세션 생성에 실패했습니다. 잠시 후 다시 시도해주세요.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-7">
        {/* 웰컴 배너 */}
        <div className="rounded-2xl bg-brand-gradient p-6 text-white shadow-md">
          <p className="text-sm font-medium text-brand-100">안녕하세요 👋</p>
          <h2 className="mt-0.5 text-2xl font-black">{user?.nickname} 님, 오늘도 함께해요!</h2>
          <p className="mt-1 text-sm text-brand-100">배우고, 퀴즈로 확인하고, 투자로 성장하세요</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-fin-red-light px-4 py-3 text-sm text-fin-red">
            {error}
          </div>
        )}

        {/* 서비스 바로가기 */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '모의투자', icon: '📊', to: '/simulation', desc: '실전 시뮬레이션' },
            { label: '랭킹',    icon: '🏆', to: '/rankings',   desc: '시즌 순위'       },
            { label: '업적',    icon: '🏅', to: '/achievements', desc: '달성 현황'     },
          ].map(({ label, icon, to, desc }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-2 py-4 text-center shadow-sm transition hover:border-brand-300 hover:shadow-md"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-bold text-slate-700">{label}</span>
              <span className="text-[10px] text-slate-400">{desc}</span>
            </Link>
          ))}
        </div>

        {/* ─── 학습 ─────────────────────────────────────── */}
        <div>
          {/* 포인트 퀴즈 */}
          <h3 className="mb-3 text-base font-bold text-slate-700">🏆 포인트 퀴즈</h3>
          <button
            onClick={!loading ? startPoint : undefined}
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-2xl border-2 border-brand-200 bg-white p-5 text-left shadow-sm transition hover:border-brand-400 hover:shadow-md disabled:opacity-60"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-slate-800">포인트 도전!</p>
                <p className="mt-1 text-sm text-slate-500">
                  모든 카테고리 랜덤 문제 · 70점↑ 통과 시 시드머니 지급
                </p>
                <p className="mt-0.5 text-xs text-slate-400">🗓️ 월 1회 응시 가능</p>
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                  시작하기 →
                </span>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-2xl shadow">
                🏆
              </div>
            </div>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              </div>
            )}
          </button>

          {/* 학습 퀴즈 */}
          <h3 className="mb-3 mt-6 text-base font-bold text-slate-700">📚 학습 퀴즈</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {TOPICS.map(({ key, emoji, desc }) => (
              <button
                key={key}
                onClick={!loading ? () => startLearning(key) : undefined}
                disabled={loading}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-brand-300 hover:shadow-md disabled:opacity-60"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-brand-gradient" />
                <div className="flex items-start gap-4 pt-1">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-xl">
                    {emoji}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{MAIN_TOPIC_LABELS[key]}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{desc}</p>
                    <span className="mt-2 inline-flex items-center text-xs font-semibold text-brand-600">
                      시작하기 →
                    </span>
                  </div>
                </div>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
