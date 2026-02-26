import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Shield, Brain } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export default function Header() {
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
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text hidden sm:block">
              CodeCampus AI
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/chat" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                Chat
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                Services
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </nav>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                <Link 
                  to="/profile"
                  className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl hover:shadow-md transition-shadow"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700 hidden sm:block">{user.name}</span>
                  <span className="badge badge-primary text-xs">
                    {user.plan.toUpperCase()}
                  </span>
                </Link>
                
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
