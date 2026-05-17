import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const successMessage = (location.state as { message?: string })?.message

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.login(email, password)
      await login(data.data.accessToken, data.data.refreshToken)
      navigate('/dashboard')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message ?? '이메일 또는 비밀번호를 확인해주세요.')
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

          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: '📚', label: 'LEARN', desc: '금융 지식을\n배우고' },
              { icon: '🧩', label: 'QUIZ', desc: '퀴즈로\n점검하고' },
              { icon: '📈', label: 'INVEST', desc: '투자로\n성장해요' },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                <div className="text-2xl">{icon}</div>
                <div className="mt-1 text-xs font-bold text-white">{label}</div>
                <div className="mt-1 whitespace-pre-line text-xs text-brand-100">{desc}</div>
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

          <h2 className="mb-1 text-2xl font-bold text-slate-800">로그인</h2>
          <p className="mb-7 text-sm text-slate-500">계정에 로그인하세요</p>

          {successMessage && (
            <div className="mb-4 rounded-xl bg-brand-50 border border-brand-200 px-4 py-3 text-sm text-brand-700">
              ✅ {successMessage}
            </div>
          )}

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
                placeholder="비밀번호를 입력하세요"
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
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            아직 계정이 없으신가요?{' '}
            <Link to="/signup" className="font-semibold text-brand-600 hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
