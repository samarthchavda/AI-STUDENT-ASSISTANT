import { Link, useNavigate } from 'react-router-dom'
import { Home, LogOut, User, Shield } from 'lucide-react'
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
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Home className="w-6 h-6 text-gray-600 hover:text-primary-600 transition-colors" />
          </Link>
          {title && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          )}
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700 font-medium">{user.name}</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {user.plan.toUpperCase()}
              </span>
            </div>
            {user.isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
