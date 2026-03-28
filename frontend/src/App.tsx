import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'
import ExamPrepPage from './pages/ExamPrepPage'
import ExamSimulationPage from './pages/ExamSimulationPage'
import ExamResultPage from './pages/ExamResultPage'
import AptitudeHistoryPage from './pages/AptitudeHistoryPage'
import AptitudePracticePage from './pages/AptitudePracticePage'
import DSAPracticeDashboardPage from './pages/DSAPracticeDashboardPage'
import DSAEditorDemoPage from './pages/DSAEditorDemoPage'
import DSADashboardPage from './pages/DSADashboardPage'
import DSAProblemPage from './pages/DSAProblemPage'
import CareerPage from './pages/CareerPage'
import ResumeTemplateGalleryPage from './pages/ResumeTemplateGalleryPage'
import ResumeBuilderFormPage from './pages/ResumeBuilderFormPage'
import CompanyPrepPage from './pages/CompanyPrepPage'
import PricingPage from './pages/PricingPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import ServicesPage from './pages/ServicesPage'
import AboutPage from './pages/AboutPage'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import { useAutoLogout } from './hooks/useAutoLogout'

function AppRoutes() {
  useAutoLogout()

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
      <Route path="/career/resume-templates" element={<ResumeTemplateGalleryPage />} />
      
      {/* Protected Routes - Require Login */}
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/exam-prep" element={<ProtectedRoute><ExamPrepPage /></ProtectedRoute>} />
      <Route path="/exam-live" element={<ProtectedRoute><ExamSimulationPage /></ProtectedRoute>} />
      <Route path="/exam-result" element={<ProtectedRoute><ExamResultPage /></ProtectedRoute>} />
      <Route path="/exam-simulation" element={<ProtectedRoute><ExamSimulationPage /></ProtectedRoute>} />
      <Route path="/aptitude-history" element={<ProtectedRoute><AptitudeHistoryPage /></ProtectedRoute>} />
      <Route path="/practice-aptitude" element={<ProtectedRoute><AptitudePracticePage /></ProtectedRoute>} />
      <Route path="/dsa" element={<ProtectedRoute><DSAPracticeDashboardPage /></ProtectedRoute>} />
      <Route path="/dsa/dashboard" element={<ProtectedRoute><DSADashboardPage /></ProtectedRoute>} />
      <Route path="/dsa/problem/:id" element={<ProtectedRoute><DSAProblemPage /></ProtectedRoute>} />
      <Route path="/dsa/editor/:id" element={<ProtectedRoute><DSAEditorDemoPage /></ProtectedRoute>} />
      <Route path="/roadmap" element={<ProtectedRoute><DSAPracticeDashboardPage /></ProtectedRoute>} />
      <Route path="/career" element={<ProtectedRoute><CareerPage /></ProtectedRoute>} />
      <Route path="/career/resume-analysis" element={<ProtectedRoute><CareerPage /></ProtectedRoute>} />
      <Route path="/career/resume-builder" element={<ProtectedRoute><ResumeTemplateGalleryPage /></ProtectedRoute>} />
      <Route path="/career/resume-form" element={<ProtectedRoute><ResumeBuilderFormPage /></ProtectedRoute>} />
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
      <ScrollToTop />
      <AppRoutes />
    </Router>
  )
}

export default App
