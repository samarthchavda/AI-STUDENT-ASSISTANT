import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'
import ExamPrepPage from './pages/ExamPrepPage'
import CodingHelpPage from './pages/CodingHelpPage'
import CareerPage from './pages/CareerPage'
import PricingPage from './pages/PricingPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import { useAutoLogout } from './hooks/useAutoLogout'

function AppRoutes() {
  useAutoLogout()

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/exam-prep" element={<ExamPrepPage />} />
      <Route path="/coding-help" element={<CodingHelpPage />} />
      <Route path="/career" element={<CareerPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

export default App
