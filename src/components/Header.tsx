import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient shadow-sm">
            <span className="text-xs font-black text-white">FL</span>
          </div>
          <span className="text-lg font-black tracking-tight text-slate-800">
            FIN<span className="text-brand-500">LEARN</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-slate-500 sm:block">
              <span className="font-semibold text-slate-700">{user.nickname}</span> 님
            </span>
          )}
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-500 transition hover:border-brand-300 hover:text-brand-600"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  )
}
