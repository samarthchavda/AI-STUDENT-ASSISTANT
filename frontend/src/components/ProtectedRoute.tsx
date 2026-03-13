import { Navigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAppStore()
  const location = useLocation()

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    // Redirect to auth page, save the attempted location
    return <Navigate to="/auth" state={{ from: location, message: 'Please log in to continue' }} replace />
  }

  // Check admin requirement
  if (requireAdmin && !user.isAdmin) {
    // Redirect to dashboard if not admin
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
