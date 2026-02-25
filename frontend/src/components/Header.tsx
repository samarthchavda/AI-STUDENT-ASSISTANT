import { Link, useNavigate } from 'react-router-dom'
import { Home, LogOut, User, Shield, Brain } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAppStore()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <header className="glass-effect sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text hidden sm:block">
                CodeCampus AI
              </span>
            </Link>
            
            {title && (
              <div className="border-l-2 border-gray-300 pl-4 hidden md:block">
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/chat" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                Chat
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/exam-prep" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                Exam Prep
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/coding-help" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                Coding
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/career" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                Career
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </nav>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700 hidden sm:block">{user.name}</span>
                  <span className="badge badge-primary text-xs">
                    {user.plan.toUpperCase()}
                  </span>
                </div>
                
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:block">Admin</span>
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/auth" className="btn-primary">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
