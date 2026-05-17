import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'

export default function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }
    if (nickname.length < 2 || nickname.length > 30) {
      setError('닉네임은 2~30자 사이여야 합니다.')
      return
    }
    setLoading(true)
    try {
      await authApi.signUp(email, password, nickname)
      navigate('/login', { state: { message: '회원가입이 완료되었습니다. 로그인해주세요.' } })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message ?? '회원가입에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-brand-50">
      {/* Left panel */}
      <div className="hidden flex-col items-center justify-center bg-brand-gradient p-12 lg:flex lg:w-1/2">
        <div className="max-w-sm text-center text-white">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur">
            <span className="text-3xl font-black text-white">FL</span>
          </div>
          <h1 className="mb-3 text-4xl font-black tracking-tight">FINLEARN</h1>
          <p className="text-lg font-medium text-brand-100">배우고, 퀴즈로 확인하고,</p>
          <p className="text-lg font-medium text-brand-100">투자로 성장하세요.</p>

          <div className="mt-10 space-y-3 text-left">
            {[
              { icon: '🧩', text: '금융 퀴즈로 실력을 점검하세요' },
              { icon: '🏆', text: '포인트를 모아 시드머니를 획득하세요' },
              { icon: '📖', text: 'AI가 개념을 정리해드립니다' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 backdrop-blur">
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-medium text-white">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow">
              <span className="text-sm font-black text-white">FL</span>
            </div>
            <span className="text-xl font-black text-slate-800">
              FIN<span className="text-brand-500">LEARN</span>
            </span>
          </div>

          <h2 className="mb-1 text-2xl font-bold text-slate-800">회원가입</h2>
          <p className="mb-7 text-sm text-slate-500">무료로 시작하세요</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">이메일</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-3 focus:ring-brand-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">비밀번호</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상 입력하세요"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-3 focus:ring-brand-100"
              />
              <p className="mt-1.5 text-xs text-slate-400">최소 8자 이상</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">닉네임</label>
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="2~30자 (영문·한글·숫자·_)"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-3 focus:ring-brand-100"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-fin-red-light border border-red-200 px-4 py-3 text-sm text-fin-red">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-gradient py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? '처리 중...' : '시작하기'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
