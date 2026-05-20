import { useState, useEffect, useRef, type FormEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { quizApi } from '../api/quiz'
import type {
  CreateSessionResponse,
  QuizResponse,
  SubmitAnswerResponse,
  ChatHistoryMessage,
} from '../types'

type Phase = 'quiz' | 'answered'

export default function QuizSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  // location.state 없으면 sessionStorage에서 복원
  const session = (location.state?.session ??
    (sessionId ? JSON.parse(sessionStorage.getItem(`quiz_session_${sessionId}`) ?? 'null') : null)
  ) as CreateSessionResponse | undefined

  const savedOrderNo = sessionId
    ? parseInt(sessionStorage.getItem(`quiz_orderNo_${sessionId}`) ?? '1', 10)
    : 1

  const [orderNo, setOrderNo] = useState(savedOrderNo)
  const [quiz, setQuiz] = useState<QuizResponse | null>(null)
  const [quizLoading, setQuizLoading] = useState(true)
  const [selected, setSelected] = useState<number | null>(null)
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null)
  const [phase, setPhase] = useState<Phase>('quiz')
  const [submitting, setSubmitting] = useState(false)

  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatHistoryMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [conceptSelected, setConceptSelected] = useState<Set<number>>(new Set())

  const totalCount = session?.totalCount ?? 0
  const isLearning = session?.sessionType === 'LEARNING'

  useEffect(() => {
    if (!sessionId) return
    sessionStorage.setItem(`quiz_orderNo_${sessionId}`, String(orderNo))
    setQuizLoading(true)
    setSelected(null)
    setResult(null)
    setPhase('quiz')
    setChatMessages([])
    quizApi
      .getQuiz(sessionId, orderNo)
      .then(({ data }) => setQuiz(data.data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setQuizLoading(false))
  }, [sessionId, orderNo, navigate])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSubmitAnswer = async () => {
    if (!sessionId || selected === null) return
    setSubmitting(true)
    try {
      const { data } = await quizApi.submitAnswer(sessionId, orderNo, selected)
      setResult(data.data)
      setPhase('answered')
      if (isLearning && data.data.correct) {
        setConceptSelected((prev) => new Set(prev).add(orderNo))
      }
      const chatRes = await quizApi.getChatHistory(sessionId, orderNo)
      setChatMessages(chatRes.data.data.messages)
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendChat = async (e: FormEvent) => {
    e.preventDefault()
    if (!sessionId || !chatInput.trim() || chatLoading) return
    const message = chatInput.trim()
    setChatInput('')
    setChatMessages((prev) => [...prev, { role: 'USER', content: message }])
    setChatLoading(true)
    try {
      const { data } = await quizApi.sendChatMessage(sessionId, orderNo, message)
      setChatMessages((prev) => [...prev, { role: 'ASSISTANT', content: data.data.answer }])
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'ASSISTANT', content: '응답을 가져오지 못했습니다.' },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const handleNext = async () => {
    if (orderNo < totalCount) {
      setOrderNo((n) => n + 1)
    } else {
      if (!sessionId) return
      try {
        if (isLearning && conceptSelected.size > 0) {
          await quizApi.selectConceptIncludes(sessionId, Array.from(conceptSelected))
        }
        const { data } = await quizApi.closeSession(sessionId)
        // 세션 종료 시 sessionStorage 정리
        sessionStorage.removeItem(`quiz_session_${sessionId}`)
        sessionStorage.removeItem(`quiz_orderNo_${sessionId}`)
        sessionStorage.removeItem('quiz_active_point')
        if (session?.category) {
          sessionStorage.removeItem(`quiz_active_learning_${session.category}`)
        }
        navigate(`/quiz/result/${sessionId}`, { state: { result: data.data } })
      } catch {
        navigate('/dashboard')
      }
    }
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-50">
        <p className="text-slate-500">세션 정보를 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-50">
      <Header />

      {/* Progress bar */}
      <div className="sticky top-14 z-40 border-b border-brand-100 bg-white px-4 py-2.5">
        <div className="mx-auto max-w-5xl">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">
              {isLearning ? '📚 학습 퀴즈' : '🏆 포인트 퀴즈'}
              {session.category && (
                <span className="ml-1 text-brand-600">· {session.category}</span>
              )}
            </span>
            <span className="font-bold text-brand-600">
              {orderNo} <span className="font-normal text-slate-400">/ {totalCount}</span>
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-brand-100">
            <div
              className="h-full rounded-full bg-brand-gradient transition-all duration-500"
              style={{ width: `${(orderNo / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-6 lg:flex-row">
        {/* ── 문제 패널 ───────────────────────────── */}
        <div className="flex-1">
          {quizLoading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl bg-white shadow-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : quiz ? (
            <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
              {/* 문제 번호 뱃지 */}
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                  Q{orderNo}
                </span>
                {result && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      result.correct
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-red-100 text-fin-red'
                    }`}
                  >
                    {result.correct ? '✅ 정답' : '❌ 오답'}
                  </span>
                )}
              </div>

              <h3 className="mb-1 text-sm font-semibold text-slate-500">{quiz.title}</h3>
              <p className="mb-6 whitespace-pre-line text-base font-medium text-slate-800">
                {quiz.question}
              </p>

              {/* 보기 */}
              <div className="space-y-3">
                {quiz.choices.map((c) => {
                  const isSelected = selected === c.no
                  const answered = phase !== 'quiz'
                  const isCorrect = result?.correctNo === c.no
                  const isWrong = answered && isSelected && !result?.correct

                  let cls =
                    'flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-medium transition select-none'

                  if (!answered) {
                    cls += isSelected
                      ? ' border-brand-500 bg-brand-50 text-brand-700'
                      : ' border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50'
                  } else if (isCorrect) {
                    cls += ' border-brand-500 bg-brand-50 text-brand-700 cursor-default'
                  } else if (isWrong) {
                    cls += ' border-red-400 bg-fin-red-light text-fin-red cursor-default'
                  } else {
                    cls += ' border-slate-100 bg-slate-50 text-slate-400 cursor-default'
                  }

                  return (
                    <label key={c.no} className={cls}>
                      <input
                        type="radio"
                        className="sr-only"
                        disabled={answered}
                        checked={isSelected}
                        onChange={() => setSelected(c.no)}
                      />
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold border-2 ${
                          !answered && isSelected
                            ? 'border-brand-500 bg-brand-500 text-white'
                            : answered && isCorrect
                            ? 'border-brand-500 bg-brand-500 text-white'
                            : answered && isWrong
                            ? 'border-red-400 bg-red-400 text-white'
                            : 'border-current bg-transparent'
                        }`}
                      >
                        {c.no}
                      </span>
                      <span>{c.content}</span>
                    </label>
                  )
                })}
              </div>

              {/* 결과 배너 */}
              {phase === 'answered' && result && (
                <div
                  className={`mt-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                    result.correct
                      ? 'bg-brand-50 border border-brand-200 text-brand-700'
                      : 'bg-fin-red-light border border-red-200 text-fin-red'
                  }`}
                >
                  <span>{result.correct ? '🎉 정답입니다!' : `정답은 ${result.correctNo}번이에요`}</span>
                  <span className="ml-auto text-xs font-normal text-slate-400">
                    AI 튜터에게 질문해보세요 →
                  </span>
                </div>
              )}

              {/* 버튼 */}
              <div className="mt-6 flex justify-end gap-2">
                {phase === 'quiz' && (
                  <button
                    disabled={selected === null || submitting}
                    onClick={handleSubmitAnswer}
                    className="rounded-xl bg-brand-gradient px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                  >
                    {submitting ? '채점 중...' : '제출하기'}
                  </button>
                )}
                {phase === 'answered' && (
                  <button
                    onClick={handleNext}
                    className="rounded-xl bg-brand-gradient px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
                  >
                    {orderNo < totalCount ? '다음 문제 →' : '결과 보기 →'}
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* ── 챗봇 패널 (항상 표시) ───────────────── */}
        <div className="flex w-full flex-col rounded-2xl border border-brand-100 bg-white shadow-sm lg:w-80">
          {/* 헤더 */}
          <div className="flex items-center gap-3 border-b border-brand-100 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient text-sm shadow-sm">
              🤖
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">AI 튜터</p>
              <p className="text-xs text-slate-400">
                {isLearning ? '자유롭게 질문하세요' : '힌트·개념만 제공'}
              </p>
            </div>
          </div>

          {/* 메시지 */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ maxHeight: '380px', minHeight: '180px' }}
          >
            {chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-3xl">💬</span>
                <p className="mt-2 text-xs text-slate-400">
                  문제를 풀면서<br />궁금한 점을 질문해보세요!
                </p>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'USER'
                      ? 'bg-brand-gradient text-white'
                      : 'bg-brand-50 border border-brand-100 text-slate-700'
                  }`}
                >
                  {msg.role === 'USER' ? (
                    msg.content
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                        ul: ({ children }) => <ul className="ml-4 list-disc space-y-0.5">{children}</ul>,
                        ol: ({ children }) => <ol className="ml-4 list-decimal space-y-0.5">{children}</ol>,
                        li: ({ children }) => <li>{children}</li>,
                        code: ({ children }) => <code className="rounded bg-brand-100 px-1 text-xs font-mono">{children}</code>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-brand-50 border border-brand-100 px-4 py-2.5 text-sm text-brand-500">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce">•</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>•</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>•</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* 입력창 */}
          <form
            onSubmit={handleSendChat}
            className="flex gap-2 border-t border-brand-100 p-3"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="질문을 입력하세요..."
              disabled={chatLoading}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="rounded-xl bg-brand-gradient px-3 py-2 text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              ↑
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
