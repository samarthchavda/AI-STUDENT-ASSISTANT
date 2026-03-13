import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'
import ExamPrepPage from './pages/ExamPrepPage'
import CodingHelpPage from './pages/CodingHelpPage'
import CareerPage from './pages/CareerPage'
import CompanyPrepPage from './pages/CompanyPrepPage'
import PricingPage from './pages/PricingPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import ServicesPage from './pages/ServicesPage'
import AboutPage from './pages/AboutPage'
import ProfilePage from './pages/ProfilePage'
import { useAutoLogout } from './hooks/useAutoLogout'

function AppRoutes() {
  useAutoLogout()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== '/chat') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [location.pathname])

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
      <Route path="/company-prep" element={<CompanyPrepPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  )
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
    </Router>
  )
}

export default App
