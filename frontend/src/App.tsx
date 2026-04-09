import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/marketing/LandingPage'
import AuthPage from './pages/auth/AuthPage'
import ChatPage from './pages/chat/ChatPage'
import ExamPrepPage from './pages/aptitude/ExamPrepPage'
import ExamSimulationPage from './pages/aptitude/ExamSimulationPage'
import ExamResultPage from './pages/aptitude/ExamResultPage'
import AptitudeHistoryPage from './pages/aptitude/AptitudeHistoryPage'
import AptitudePracticePage from './pages/aptitude/AptitudePracticePage'
import SystemHealthPage from './pages/admin/SystemHealthPage'
import BroadcastSystemPage from './pages/admin/BroadcastSystemPage'
import AuditLogsPage from './pages/admin/AuditLogsPage'
import LeaderboardManagementPage from './pages/admin/LeaderboardManagementPage'
import TransactionLogsPage from './pages/admin/TransactionLogsPage'
import ReferralTrackingPage from './pages/admin/ReferralTrackingPage'
import ResumeAnalyticsPage from './pages/admin/ResumeAnalyticsPage'
import ResumeTemplatesPage from './pages/admin/ResumeTemplatesPage'
import UserResumesPage from './pages/admin/UserResumesPage'
import AIResumeMonitorPage from './pages/admin/AIResumeMonitorPage'
import AISettingsPage from './pages/admin/AISettingsPage'
import ContactMessagesPage from './pages/admin/ContactMessagesPage'
import TimeTrackingPage from './pages/admin/TimeTrackingPage'
import LearningBehaviorPage from './pages/admin/LearningBehaviorPage'
import PerformanceTrendsPage from './pages/admin/PerformanceTrendsPage'
import CareerPage from './pages/resume/CareerPage'
import ResumeTemplateGalleryPage from './pages/resume/ResumeTemplateGalleryPage'
import CompanyPrepPage from './pages/aptitude/CompanyPrepPage'
import PricingPage from './pages/marketing/PricingPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import AdminPage from './pages/admin/AdminPage'
import AptitudeExamAdminPage from './pages/admin/AptitudeExamAdminPage'
import CompanyExamControlPage from './pages/admin/CompanyExamControlPage'
import DSAQuestionsAdminPage from './pages/admin/DSAQuestionsAdminPage'
import ServicesPage from './pages/marketing/ServicesPage'
import AboutPage from './pages/marketing/AboutPage'
import ContactPage from './pages/marketing/ContactPage'
import ProfilePage from './pages/profile/ProfilePage'
import DSAQuestionListPage from './pages/dsa/DSAQuestionListPage'
import DSAProblemPage from './pages/dsa/DSAProblemPage'
import DSADashboardPage from './pages/dsa/DSADashboardPage'
import DSALeaderboardPage from './pages/dsa/DSALeaderboardPage'
import DSAAnalyticsPage from './pages/admin/DSAAnalyticsPage'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import { useAutoLogout } from './hooks/useAutoLogout'
import { useActivityTracking } from './hooks/useActivityTracking'

function AppRoutes() {
  useAutoLogout()
  useActivityTracking() // Add activity tracking

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/copilot" element={<ChatPage />} />
      <Route path="/career/resume-templates" element={<ResumeTemplateGalleryPage />} />
      
      {/* Protected Routes - Require Login */}
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/exam-prep" element={<ProtectedRoute><ExamPrepPage /></ProtectedRoute>} />
      <Route path="/exam-live" element={<ProtectedRoute><ExamSimulationPage /></ProtectedRoute>} />
      <Route path="/exam-result" element={<ProtectedRoute><ExamResultPage /></ProtectedRoute>} />
      <Route path="/exam-simulation" element={<ProtectedRoute><ExamSimulationPage /></ProtectedRoute>} />
      <Route path="/aptitude-history" element={<ProtectedRoute><AptitudeHistoryPage /></ProtectedRoute>} />
      <Route path="/practice-aptitude" element={<ProtectedRoute><AptitudePracticePage /></ProtectedRoute>} />
      <Route path="/career" element={<ProtectedRoute><CareerPage /></ProtectedRoute>} />
      <Route path="/career/resume-analysis" element={<ProtectedRoute><CareerPage /></ProtectedRoute>} />
      <Route path="/career/resume-templates" element={<ProtectedRoute><ResumeTemplateGalleryPage /></ProtectedRoute>} />
      <Route path="/career/resume-builder" element={<ProtectedRoute><ResumeTemplateGalleryPage /></ProtectedRoute>} />
      <Route path="/career/resume-editor" element={<ProtectedRoute><ResumeTemplateGalleryPage /></ProtectedRoute>} />
      <Route path="/career/resume-form" element={<ProtectedRoute><ResumeTemplateGalleryPage /></ProtectedRoute>} />
      <Route path="/company-prep" element={<ProtectedRoute><CompanyPrepPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      
      {/* DSA Routes */}
      <Route path="/dsa" element={<ProtectedRoute><DSAQuestionListPage /></ProtectedRoute>} />
      <Route path="/dsa/problem/:slug" element={<ProtectedRoute><DSAProblemPage /></ProtectedRoute>} />
      <Route path="/dsa/dashboard" element={<ProtectedRoute><DSADashboardPage /></ProtectedRoute>} />
      <Route path="/dsa/leaderboard" element={<ProtectedRoute><DSALeaderboardPage /></ProtectedRoute>} />
      
      {/* Admin Routes - Require Login + Admin */}
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />
      <Route path="/admin/aptitude-exams" element={<ProtectedRoute requireAdmin><AptitudeExamAdminPage /></ProtectedRoute>} />
      <Route path="/admin/company-exam-control" element={<ProtectedRoute requireAdmin><CompanyExamControlPage /></ProtectedRoute>} />
      <Route path="/admin/dsa-questions" element={<ProtectedRoute requireAdmin><DSAQuestionsAdminPage /></ProtectedRoute>} />
      <Route path="/admin/system-health" element={<ProtectedRoute requireAdmin><SystemHealthPage /></ProtectedRoute>} />
      <Route path="/admin/broadcast" element={<ProtectedRoute requireAdmin><BroadcastSystemPage /></ProtectedRoute>} />
      <Route path="/admin/audit-logs" element={<ProtectedRoute requireAdmin><AuditLogsPage /></ProtectedRoute>} />
      <Route path="/admin/leaderboard" element={<ProtectedRoute requireAdmin><LeaderboardManagementPage /></ProtectedRoute>} />
      <Route path="/admin/transactions" element={<ProtectedRoute requireAdmin><TransactionLogsPage /></ProtectedRoute>} />
      <Route path="/admin/referrals" element={<ProtectedRoute requireAdmin><ReferralTrackingPage /></ProtectedRoute>} />
      <Route path="/admin/resume-analytics" element={<ProtectedRoute requireAdmin><ResumeAnalyticsPage /></ProtectedRoute>} />
      <Route path="/admin/resume-templates" element={<ProtectedRoute requireAdmin><ResumeTemplatesPage /></ProtectedRoute>} />
      <Route path="/admin/user-resumes" element={<ProtectedRoute requireAdmin><UserResumesPage /></ProtectedRoute>} />
      <Route path="/admin/dsa-analytics" element={<ProtectedRoute requireAdmin><DSAAnalyticsPage /></ProtectedRoute>} />
      <Route path="/admin/ai-resume-monitor" element={<ProtectedRoute requireAdmin><AIResumeMonitorPage /></ProtectedRoute>} />
      <Route path="/admin/ai-settings" element={<ProtectedRoute requireAdmin><AISettingsPage /></ProtectedRoute>} />
      <Route path="/admin/contact-messages" element={<ProtectedRoute requireAdmin><ContactMessagesPage /></ProtectedRoute>} />
      <Route path="/admin/time-tracking" element={<ProtectedRoute requireAdmin><TimeTrackingPage /></ProtectedRoute>} />
      <Route path="/admin/learning-behavior" element={<ProtectedRoute requireAdmin><LearningBehaviorPage /></ProtectedRoute>} />
      <Route path="/admin/performance-trends" element={<ProtectedRoute requireAdmin><PerformanceTrendsPage /></ProtectedRoute>} />
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
