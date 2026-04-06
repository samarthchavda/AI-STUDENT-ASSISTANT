import { User, Mail, Shield, CreditCard, LogOut, Edit, X, Phone, CheckCircle, GraduationCap, Linkedin, Github, Award, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { userAPI } from '../../api/client'
import { useState, useEffect } from 'react'
import Header from '../../components/Header'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, setUser } = useAppStore()
  const [stats, setStats] = useState({
    chatSessions: 0,
    totalMessages: 0,
    questionsAsked: 0,
    lastActive: null as string | null
  })
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    college: user?.college || '',
    branch: user?.branch || '',
    cgpa: user?.cgpa || '',
    graduationYear: user?.graduationYear || '',
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl: user?.githubUrl || ''
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userStats = await userAPI.getUserStats()
        setStats(userStats)
      } catch (error) {
        console.error('Error fetching user stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchStats()
      setFormData({
        phone: user.phone || '',
        college: user.college || '',
        branch: user.branch || '',
        cgpa: user.cgpa || '',
        graduationYear: user.graduationYear || '',
        linkedinUrl: user.linkedinUrl || '',
        githubUrl: user.githubUrl || ''
      })
    }
  }, [user])

  const calculateProfileStrength = () => {
    if (!user) return 0
    const fields = [
      user.phone,
      user.college,
      user.branch,
      user.cgpa,
      user.graduationYear,
      user.linkedinUrl,
      user.githubUrl
    ]
    const filledFields = fields.filter(field => field && field.trim() !== '').length
    return Math.round((filledFields / fields.length) * 100)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const response = await userAPI.updateProfile(formData)
      
      console.log('✅ Profile update response:', response.data)
      
      // Update local user state with the returned user data
      if (user && response.data.user) {
        setUser({
          ...user,
          phone: response.data.user.phone,
          college: response.data.user.college,
          branch: response.data.user.branch,
          cgpa: response.data.user.cgpa,
          graduationYear: response.data.user.graduationYear,
          linkedinUrl: response.data.user.linkedinUrl,
          githubUrl: response.data.user.githubUrl
        })
      }
      
      setShowEditModal(false)
      
      // Show success message with profile completion
      const completionMsg = response.data.profile_completion 
        ? ` Your profile is now ${response.data.profile_completion}% complete!`
        : ''
      alert(`✅ ${response.data.message}${completionMsg}`)
      
    } catch (error: any) {
      console.error('❌ Error updating profile:', error)
      const errorMsg = error?.response?.data?.detail || 'Failed to update profile. Please try again.'
      alert(`Error: ${errorMsg}`)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) {
    navigate('/auth')
    return null
  }

  const profileStrength = calculateProfileStrength()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-24 sm:h-32"></div>
          <div className="px-4 sm:px-8 pb-6 sm:pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                  <User className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600" />
                </div>
                <div className="pb-0 sm:pb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-sm sm:text-base text-gray-600 break-all">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditModal(true)}
                className="btn-secondary flex items-center gap-2 mb-0 sm:mb-2 w-full sm:w-auto justify-center"
              >
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

        {/* Profile Strength */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Profile Strength
            </h2>
            <span className="text-3xl font-bold gradient-text">{profileStrength}%</span>
          </div>
          
          <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
              style={{ width: `${profileStrength}%` }}
            ></div>
          </div>
          
          <p className="text-gray-600 text-sm">
            {profileStrength < 50 && "Complete your profile to unlock better AI resume generation and personalized recommendations."}
            {profileStrength >= 50 && profileStrength < 100 && "You're doing great! Add a few more details to maximize your profile."}
            {profileStrength === 100 && "🎉 Perfect! Your profile is complete and ready for AI Resume generation."}
          </p>
          
          {profileStrength < 100 && (
            <button 
              onClick={() => setShowEditModal(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Complete Your Profile
            </button>
          )}
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
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
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
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
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Your Activity</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading your activity...</div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">{stats.chatSessions}</div>
                <div className="text-sm text-gray-600">Chat Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">{stats.totalMessages}</div>
                <div className="text-sm text-gray-600">Total Messages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">{stats.questionsAsked}</div>
                <div className="text-sm text-gray-600">Questions Asked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">
                  {stats.lastActive ? 'Active' : 'New'}
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-3xl flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Edit className="w-6 h-6" />
                Complete Your Profile
              </h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Award className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-900 font-semibold">Sync with AI Resume</p>
                  <p className="text-xs text-blue-700 mt-1">
                    These details will be automatically used in your AI Resume Builder for a seamless experience.
                  </p>
                </div>
              </div>

              {/* Contact Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  Contact Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-500 cursor-not-allowed"
                      />
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Verified via Google Auth</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {user?.phoneVerified && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Education Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                  Education Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      College/University Name
                    </label>
                    <input
                      type="text"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      placeholder="e.g., Indian Institute of Technology, Delhi"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Branch/Major
                      </label>
                      <input
                        type="text"
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        placeholder="e.g., Computer Science"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CGPA/Percentage
                      </label>
                      <input
                        type="text"
                        value={formData.cgpa}
                        onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                        placeholder="e.g., 8.5/10 or 85%"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Graduation Year
                    </label>
                    <input
                      type="text"
                      value={formData.graduationYear}
                      onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                      placeholder="e.g., 2024"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Links Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Linkedin className="w-5 h-5 text-blue-600" />
                  Professional Links
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-blue-600" />
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Github className="w-4 h-4 text-gray-900" />
                      GitHub Profile URL
                    </label>
                    <input
                      type="url"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      placeholder="https://github.com/yourusername"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
