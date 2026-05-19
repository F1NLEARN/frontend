import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import QuizSessionPage from './pages/QuizSessionPage'
import QuizResultPage from './pages/QuizResultPage'
import SimulationPage from './pages/SimulationPage'
import StockListPage from './pages/StockListPage'
import RankingPage from './pages/RankingPage'
import AchievementsPage from './pages/AchievementsPage'
import TradeHistoryPage from './pages/TradeHistoryPage'

function Protected({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 인증 불필요 */}
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* 인증 필요 */}
          <Route path="/dashboard"              element={<Protected><DashboardPage /></Protected>} />
          <Route path="/quiz/session/:sessionId" element={<Protected><QuizSessionPage /></Protected>} />
          <Route path="/quiz/result/:sessionId"  element={<Protected><QuizResultPage /></Protected>} />
          <Route path="/simulation"              element={<Protected><SimulationPage /></Protected>} />
          <Route path="/simulation/stocks"       element={<Protected><StockListPage /></Protected>} />
          <Route path="/simulation/trades"       element={<Protected><TradeHistoryPage /></Protected>} />
          <Route path="/rankings"                element={<Protected><RankingPage /></Protected>} />
          <Route path="/achievements"            element={<Protected><AchievementsPage /></Protected>} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
