import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Brain, Mail, Lock, User, AlertCircle, Sparkles } from 'lucide-react'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { userAPI } from '../api/client'
import { useAppStore } from '../store/useAppStore'

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setUser = useAppStore((state) => state.setUser)
  
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Check for session expiration message
  useEffect(() => {
    const state = location.state as { message?: string }
    if (state?.message) {
      setInfoMessage(state.message)
      // Clear the message after 5 seconds
      setTimeout(() => setInfoMessage(''), 5000)
    }
  }, [location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields')
      return
    }
    
    if (!isLogin) {
      if (!formData.name) {
        setError('Please enter your name')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
    }

    setLoading(true)

    try {
      if (isLogin) {
        // Login
        const response = await userAPI.login(formData.email, formData.password)
        const { access_token, user } = response.data
        
        // Store token
        localStorage.setItem('token', access_token)
        
        // Update user state
        setUser({
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan_type,
          isAdmin: user.is_admin
        })
        
        // Redirect based on admin status
        if (user.is_admin) {
          navigate('/admin')
        } else {
          navigate('/pricing')
        }
        
      } else {
        // Register
        const response = await userAPI.register(
          formData.email,
          formData.password,
          formData.name
        )
        const { access_token, user } = response.data
        
        // Store token
        localStorage.setItem('token', access_token)
        
        // Update user state
        setUser({
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan_type,
          isAdmin: user.is_admin
        })
        
        // Redirect based on admin status
        if (user.is_admin) {
          navigate('/admin')
        } else {
          navigate('/pricing')
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(
        err.response?.data?.detail || 
        'An error occurred. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError('')
    setLoading(true)

    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google')
      }

      // Send the credential to backend for verification
      const response = await userAPI.googleAuth(credentialResponse.credential)
      const { access_token, user } = response.data
      
      // Store token
      localStorage.setItem('token', access_token)
      
      // Update user state
      setUser({
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan_type,
        isAdmin: user.is_admin
      })
      
      // Redirect based on admin status
      if (user.is_admin) {
        navigate('/admin')
      } else {
        navigate('/pricing')
      }
      
    } catch (err: any) {
      console.error('Google auth error:', err)
      setError(
        err.response?.data?.detail || 
        'Google authentication failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google authentication was cancelled or failed.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <Brain className="w-9 h-9 text-white" />
            </div>
            <span className="text-4xl font-bold gradient-text">CodeCampus AI</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {isLogin ? 'Welcome Back! 👋' : 'Start Your Journey 🚀'}
          </h1>
          <p className="text-gray-600 text-lg">
            {isLogin 
              ? 'Continue your placement preparation' 
              : 'Join thousands of engineering students getting placed'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="glass-effect rounded-3xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Info Message (Session expiration, etc.) */}
            {infoMessage && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{infoMessage}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Name Field (Register Only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-modern pl-12"
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-modern pl-12"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-modern pl-12"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Confirm Password (Register Only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="input-modern pl-12"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="loading-spinner w-5 h-5"></div>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text={isLogin ? "signin_with" : "signup_with"}
              width="100%"
              logo_alignment="left"
            />
          </div>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={toggleMode}
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                disabled={loading}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Demo Credentials (for testing) */}
          {isLogin && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-semibold mb-1">Demo Mode:</p>
              <p className="text-xs text-blue-700">
                You can create a new account or use any email/password combination to test the app.
              </p>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
