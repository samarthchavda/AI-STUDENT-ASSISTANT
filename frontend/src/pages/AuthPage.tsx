import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Brain, Mail, Lock, User, AlertCircle, Sparkles, KeyRound, CheckCircle } from 'lucide-react'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { userAPI } from '../api/client'
import { useAppStore } from '../store/useAppStore'

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setUser = useAppStore((state) => state.setUser)
  const currentOrigin = window.location.origin
  const configuredGoogleOrigins = (import.meta.env.VITE_GOOGLE_AUTHORIZED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  // Google Sign-In is shown when a client ID is configured and the current
  // origin is allowed by VITE_GOOGLE_AUTHORIZED_ORIGINS (if provided).
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || ''
  const isCurrentOriginAuthorized = configuredGoogleOrigins.length === 0 || configuredGoogleOrigins.includes(currentOrigin)
  const canShowGoogleLogin = Boolean(googleClientId) && isCurrentOriginAuthorized
  
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotOtp, setForgotOtp] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loginProgress, setLoginProgress] = useState(0)
  const [successMessage, setSuccessMessage] = useState('')

  // Check for session expiration message
  useEffect(() => {
    const state = location.state as { message?: string }
    if (state?.message) {
      setInfoMessage(state.message)
      // Clear the message after 5 seconds
      setTimeout(() => setInfoMessage(''), 5000)
    }
  }, [location])

  // Progress indicator for slow logins
  useEffect(() => {
    if (loading) {
      setLoginProgress(0)
      const interval = setInterval(() => {
        setLoginProgress(prev => {
          if (prev >= 90) return prev // Cap at 90% until actual completion
          return prev + 10
        })
      }, 1000)
      
      return () => clearInterval(interval)
    } else {
      setLoginProgress(0)
    }
  }, [loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields')
      return
    }
    
    if (authMode === 'register') {
      if (!formData.name) {
        setError('Please enter your name')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }
      // Updated password validation for new requirements
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }
      if (!/[A-Za-z]/.test(formData.password)) {
        setError('Password must contain at least one letter')
        return
      }
      if (!/\d/.test(formData.password)) {
        setError('Password must contain at least one number')
        return
      }
      if (!/[@$!%*#?&]/.test(formData.password)) {
        setError('Password must contain at least one special character (@$!%*#?&)')
        return
      }
    }

    setLoading(true)

    try {
      const destination = (location.state as any)?.from?.pathname

      if (authMode === 'login') {
        // Login
        const response = await userAPI.login(formData.email, formData.password)
        const { access_token, refresh_token, user } = response.data
        
        // Show success immediately
        setSuccessMessage('Login successful! Redirecting...')
        setLoginProgress(100)
        
        // Store tokens
        localStorage.setItem('token', access_token)
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token)
        }
        
        // Update user state
        setUser({
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan_type,
          isAdmin: user.is_admin
        })
        
        // Small delay to show success message
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Redirect based on admin status
        if (user.is_admin) {
          navigate('/admin', { replace: true })
        } else {
          navigate(destination || '/dashboard', { replace: true })
        }
        
      } else {
        // Register
        const response = await userAPI.register(
          formData.email,
          formData.password,
          formData.name
        )
        const { access_token, refresh_token, user } = response.data
        
        // Show success immediately
        setSuccessMessage('Account created! Redirecting...')
        setLoginProgress(100)
        
        // Store tokens
        localStorage.setItem('token', access_token)
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token)
        }
        
        // Update user state
        setUser({
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan_type,
          isAdmin: user.is_admin
        })
        
        // Small delay to show success message
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Redirect based on admin status
        if (user.is_admin) {
          navigate('/admin', { replace: true })
        } else {
          navigate(destination || '/dashboard', { replace: true })
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      
      // Handle timeout specifically
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Login is taking longer than expected. The server might be starting up. Please try again in a moment.')
      } else {
        setError(
          err.response?.data?.detail || 
          'An error occurred. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError('')
    if (!forgotEmail) {
      setForgotError('Please enter your email address.')
      return
    }
    setForgotLoading(true)
    try {
      await userAPI.forgotPassword(forgotEmail)
      setAuthMode('reset')
    } catch (err: any) {
      setForgotError(err.response?.data?.detail || 'Failed to send OTP. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError('')
    if (!forgotOtp || forgotOtp.length !== 6) {
      setForgotError('Please enter the 6-digit OTP.')
      return
    }
    if (forgotNewPassword.length < 8) {
      setForgotError('Password must be at least 8 characters.')
      return
    }
    if (!/[A-Za-z]/.test(forgotNewPassword) || !/\d/.test(forgotNewPassword) || !/[@$!%*#?&]/.test(forgotNewPassword)) {
      setForgotError('Password must contain a letter, a number, and a special character (@$!%*#?&).')
      return
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match.')
      return
    }
    setForgotLoading(true)
    try {
      await userAPI.resetPassword(forgotEmail, forgotOtp, forgotNewPassword)
      setForgotSuccess('Password reset successfully! You can now sign in.')
      setTimeout(() => {
        setAuthMode('login')
        setForgotEmail('')
        setForgotOtp('')
        setForgotNewPassword('')
        setForgotConfirmPassword('')
        setForgotSuccess('')
        setForgotError('')
      }, 2500)
    } catch (err: any) {
      setForgotError(err.response?.data?.detail || 'Invalid OTP or it has expired. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  const toggleMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login')
    setError('')
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
  }

  const handleGoogleSuccess = useCallback(async (credentialResponse: CredentialResponse) => {
    setError('')
    setLoading(true)

    try {
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google')
      }

      const response = await userAPI.googleAuth(credentialResponse.credential)
      const { access_token, refresh_token, user } = response.data

      localStorage.setItem('token', access_token)
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token)
      }

      setUser({
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan_type,
        isAdmin: user.is_admin
      })

      // Immediate navigation without delays
      const from = (location.state as any)?.from?.pathname || (user.is_admin ? '/admin' : '/dashboard')
      navigate(from, { replace: true })
    } catch (err: any) {
      console.error('Google auth error:', err)
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        'Google authentication failed. Please try again.'
      )
      setLoading(false)
    }
  }, [location.state, navigate, setUser])

  const handleGoogleError = useCallback(() => {
    try {
      // Suppress console errors for better UX
      console.warn('Google Sign-In initialization failed - this is expected if origins are not yet configured')
      
      if (!googleClientId) {
        setError('Google Sign-In is not configured. Please set VITE_GOOGLE_CLIENT_ID in frontend/.env')
        return
      }

      if (!isCurrentOriginAuthorized) {
        setError(`Google Sign-In is disabled for this origin (${currentOrigin}). Add this origin to VITE_GOOGLE_AUTHORIZED_ORIGINS and in Google Cloud Console > Authorized JavaScript origins.`)
        return
      }

      // Don't show error to user - just log it
      console.warn('Google authentication failed. If console shows "origin is not allowed", the configuration may still be propagating (wait 5-10 minutes) or check Google Cloud Console Authorized JavaScript origins.')
    } catch (err) {
      console.error('Google error handler failed:', err)
      // Don't show error to user for OAuth issues
    }
  }, [currentOrigin, googleClientId, isCurrentOriginAuthorized])

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
            {authMode === 'login' && 'Welcome Back! 👋'}
            {authMode === 'register' && 'Start Your Journey 🚀'}
            {authMode === 'forgot' && 'Reset Password 🔑'}
            {authMode === 'reset' && 'Verify OTP 🔐'}
          </h1>
          <p className="text-gray-600 text-lg">
            {authMode === 'login' && 'Continue your placement preparation'}
            {authMode === 'register' && 'Join thousands of engineering students getting placed'}
            {authMode === 'forgot' && "We'll send a 6-digit OTP to your email"}
            {authMode === 'reset' && `OTP sent to ${forgotEmail}`}
          </p>
        </div>

        {/* Card */}
        <div className="glass-effect rounded-3xl shadow-2xl p-8 border border-white/20">

          {/* ── Panel: Login / Register ── */}
          {(authMode === 'login' || authMode === 'register') && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {infoMessage && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{infoMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-pulse">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-semibold">{successMessage}</span>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password{authMode === 'register' && <span className="text-xs text-gray-500 ml-1">(8+ chars, 1 number, 1 special char)</span>}
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
              {authMode === 'login' && (
                <div className="text-right -mt-2">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setForgotError(''); setForgotEmail(''); }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
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
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner w-5 h-5"></div>
                    {authMode === 'login' ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </button>
              
              {loading && (
                <div className="text-center space-y-3">
                  <div className="text-sm text-gray-600 animate-pulse">
                    {authMode === 'login' ? 'Authenticating...' : 'Creating your account...'}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-1000 ease-out"
                      style={{ width: `${loginProgress}%` }}
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {loginProgress < 30 && 'Connecting to server...'}
                    {loginProgress >= 30 && loginProgress < 60 && 'Verifying credentials...'}
                    {loginProgress >= 60 && loginProgress < 90 && 'Setting up your session...'}
                    {loginProgress >= 90 && 'Almost there...'}
                  </div>
                </div>
              )}
            </form>
          )}

          {/* ── Panel: Forgot Password (Step 1 — Email) ── */}
          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPasswordRequest} className="space-y-5">
              {forgotError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{forgotError}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="input-modern pl-12"
                    placeholder="you@example.com"
                    autoFocus
                    disabled={forgotLoading}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {forgotLoading
                  ? <div className="loading-spinner w-5 h-5" />
                  : <><KeyRound className="w-5 h-5" /> Send OTP</>}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setForgotError(''); }}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* ── Panel: Reset Password (Step 2 — OTP + New Password) ── */}
          {authMode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {forgotError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{forgotError}</span>
                </div>
              )}
              {forgotSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{forgotSuccess}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">6-Digit OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                  className="input-modern tracking-[0.5em] text-center text-xl font-bold"
                  placeholder="000000"
                  autoFocus
                  disabled={forgotLoading || !!forgotSuccess}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password <span className="text-xs text-gray-500">(8+ chars, 1 number, 1 special)</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="input-modern pl-12"
                    placeholder="••••••••"
                    disabled={forgotLoading || !!forgotSuccess}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className={`input-modern pl-12 ${
                      forgotConfirmPassword && forgotNewPassword !== forgotConfirmPassword
                        ? 'border-red-400 focus:ring-red-300'
                        : ''
                    }`}
                    placeholder="••••••••"
                    disabled={forgotLoading || !!forgotSuccess}
                  />
                </div>
                {forgotConfirmPassword && forgotNewPassword !== forgotConfirmPassword && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={forgotLoading || !!forgotSuccess || (!!forgotConfirmPassword && forgotNewPassword !== forgotConfirmPassword)}
                className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {forgotLoading
                  ? <div className="loading-spinner w-5 h-5" />
                  : <><Sparkles className="w-5 h-5" /> Reset Password</>}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setForgotError(''); setForgotOtp(''); setForgotNewPassword(''); setForgotConfirmPassword(''); setForgotSuccess(''); }}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* Divider + Google OAuth (login/register only) */}
          {(authMode === 'login' || authMode === 'register') && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  {canShowGoogleLogin ? (
                    <div>
                      <GoogleLogin
                        key="google-login"
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="outline"
                        size="large"
                        text="continue_with"
                        width="320"
                        logo_alignment="left"
                      />
                      <p className="mt-2 text-xs text-center text-gray-500">
                        Note: If Google Sign-In shows errors, wait 5-10 minutes for configuration to propagate or use email/password login.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {!googleClientId
                          ? 'Google Sign-In is not configured for this app.'
                          : `Google Sign-In is disabled for this origin: ${currentOrigin}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Toggle Mode (login/register only) */}
          {(authMode === 'login' || authMode === 'register') && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={toggleMode}
                  className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                  disabled={loading}
                >
                  {authMode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
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
