import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Plus, Edit, Trash2, Users, BarChart3, Clock, Target } from 'lucide-react'
import Header from '../../components/Header'

interface ExamAttempt {
  user_id: number
  user_name: string
  user_email: string
  company: string
  attempts_count: number
  best_score: number
  last_attempt: string
}

export default function AptitudeExamAdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'attempts' | 'stats'>('attempts')
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_users: 0,
    total_attempts: 0,
    avg_score: 0,
    companies: [] as { company: string; count: number }[]
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // Load exam attempts
      const attemptsRes = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/aptitude-exam-attempts`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (attemptsRes.ok) {
        const data = await attemptsRes.json()
        setExamAttempts(data.attempts || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResetAttempts = async (userId: number, company: string) => {
    if (!confirm(`Reset attempts for this user's ${company} exam?`)) return
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/reset-exam-attempts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: userId, company })
        }
      )
      
      if (res.ok) {
        alert('Attempts reset successfully')
        loadData()
      } else {
        alert('Failed to reset attempts')
      }
    } catch (error) {
      console.error('Error resetting attempts:', error)
      alert('Error resetting attempts')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Aptitude Exam Management</h1>
          <p className="text-gray-600">Manage exams, track user attempts, and view analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_users}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_attempts}</div>
            <div className="text-sm text-gray-600">Total Attempts</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.avg_score.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.companies.length}</div>
            <div className="text-sm text-gray-600">Active Exams</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('attempts')}
                className={`px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'attempts'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                User Attempts
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'stats'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Statistics
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading...</p>
              </div>
            ) : activeTab === 'attempts' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Exam</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Attempts</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Best Score</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Attempt</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examAttempts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-500">
                          No exam attempts yet
                        </td>
                      </tr>
                    ) : (
                      examAttempts.map((attempt, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">{attempt.user_name}</td>
                          <td className="py-3 px-4 text-gray-600 text-sm">{attempt.user_email}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                              {attempt.company}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-semibold ${attempt.attempts_count >= 2 ? 'text-red-600' : 'text-gray-900'}`}>
                              {attempt.attempts_count}/2
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-gray-900">
                            {attempt.best_score}%
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {new Date(attempt.last_attempt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleResetAttempts(attempt.user_id, attempt.company)}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              Reset
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Statistics by Company</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.companies.map((company, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="font-semibold text-gray-900 mb-2">{company.company}</div>
                      <div className="text-2xl font-bold text-blue-600">{company.count}</div>
                      <div className="text-sm text-gray-600">Total Attempts</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
