import { Link } from 'react-router-dom'
import { Home, BarChart3, BookOpen, Award } from 'lucide-react'
import Header from '../components/Header'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header title="Dashboard" subtitle="Track your learning progress" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-gray-600 text-sm">Topics Learned</p>
                <p className="text-3xl font-bold">42</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-gray-600 text-sm">Tests Completed</p>
                <p className="text-3xl font-bold">18</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-gray-600 text-sm">Avg Score</p>
                <p className="text-3xl font-bold">85%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Coming Soon!</h2>
          <p className="text-gray-600">
            Your personalized dashboard with learning analytics, progress tracking, and recommendations.
          </p>
        </div>
      </div>
    </div>
  )
}
