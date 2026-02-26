import { User, Mail, Shield, CreditCard, LogOut, Edit } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import Header from '../components/Header'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAppStore()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  if (!user) {
    navigate('/auth')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-16 mb-6">
              <div className="flex items-end gap-6">
                <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                  <User className="w-16 h-16 text-blue-600" />
                </div>
                <div className="pb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              <button className="btn-secondary flex items-center gap-2 mb-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            {/* Plan Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">
                {user.plan.toUpperCase()} Plan
              </span>
              {user.isAdmin && (
                <>
                  <span className="text-gray-400">•</span>
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-600">Admin</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <User className="w-6 h-6 text-blue-600" />
              Personal Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 font-medium">Full Name</label>
                <p className="text-lg font-semibold text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium">Email Address</label>
                <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {user.email}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium">User ID</label>
                <p className="text-sm font-mono text-gray-600">{user.id}</p>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-purple-600" />
              Account Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 font-medium">Account Type</label>
                <p className="text-lg font-semibold text-gray-900">{user.isAdmin ? 'Administrator' : 'Student'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium">Subscription Plan</label>
                <p className="text-lg font-semibold text-gray-900 capitalize">{user.plan}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium">Account Status</label>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-lg font-semibold text-green-600">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Activity</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">0</div>
              <div className="text-sm text-gray-600">Chat Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">0</div>
              <div className="text-sm text-gray-600">Questions Solved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">0</div>
              <div className="text-sm text-gray-600">Code Problems</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">0</div>
              <div className="text-sm text-gray-600">Mock Interviews</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/pricing')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6 text-left hover:shadow-xl transition-shadow"
          >
            <CreditCard className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Upgrade Plan</h3>
            <p className="text-blue-100">Get access to premium features and unlimited usage</p>
          </button>

          <button
            onClick={handleLogout}
            className="bg-white border-2 border-red-200 text-red-600 rounded-2xl p-6 text-left hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Logout</h3>
            <p className="text-red-400">Sign out from your account</p>
          </button>
        </div>
      </div>
    </div>
  )
}
