import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'
import ExamPrepPage from './pages/ExamPrepPage'
import ExamSimulationPage from './pages/ExamSimulationPage'
import CodingHelpPage from './pages/CodingHelpPage'
import CareerPage from './pages/CareerPage'
import CompanyPrepPage from './pages/CompanyPrepPage'
import PricingPage from './pages/PricingPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import ServicesPage from './pages/ServicesPage'
import AboutPage from './pages/AboutPage'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/ProtectedRoute'
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
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      
      {/* Protected Routes - Require Login */}
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/exam-prep" element={<ProtectedRoute><ExamPrepPage /></ProtectedRoute>} />
      <Route path="/exam-simulation" element={<ProtectedRoute><ExamSimulationPage /></ProtectedRoute>} />
      <Route path="/coding-help" element={<ProtectedRoute><CodingHelpPage /></ProtectedRoute>} />
      <Route path="/coding" element={<ProtectedRoute><CodingHelpPage /></ProtectedRoute>} />
      <Route path="/career" element={<ProtectedRoute><CareerPage /></ProtectedRoute>} />
      <Route path="/company-prep" element={<ProtectedRoute><CompanyPrepPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      
      {/* Admin Routes - Require Login + Admin */}
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />
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
