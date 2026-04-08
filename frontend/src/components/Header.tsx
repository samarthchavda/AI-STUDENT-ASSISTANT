import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Shield, Brain, Menu, X } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useState } from 'react'

export default function Header() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAppStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-3 transition-opacity hover:opacity-85 -ml-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#0f766e,_#115e59)] text-white shadow-[0_14px_28px_rgba(15,118,110,0.28)] transition-transform group-hover:-rotate-3 group-hover:scale-105">
              <Brain className="h-6 w-6" />
            </div>
            <div className="hidden sm:block">
              <div className="font-display text-2xl font-bold leading-none text-stone-900">CodeCampus AI</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Career and study copilot</div>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 hover:bg-stone-100 rounded-lg transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-2 rounded-full border border-stone-200 bg-white/75 p-1 shadow-[0_10px_25px_rgba(33,24,9,0.06)] md:flex">
              {isAuthenticated && user && (
                <>
                  <Link to="/dashboard" className="rounded-full px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 hover:text-stone-900">
                    Dashboard
                  </Link>
                  <Link to="/chat" className="rounded-full px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 hover:text-stone-900">
                    Copilot
                  </Link>
                </>
              )}
              <Link to="/services" className="rounded-full px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 hover:text-stone-900">
                Services
              </Link>
              <Link to="/about" className="rounded-full px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 hover:text-stone-900">
                About
              </Link>
              <Link to="/contact" className="rounded-full px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 hover:text-stone-900">
                Contact
              </Link>
              <Link to="/pricing" className="rounded-full px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 hover:text-stone-900">
                Pricing
              </Link>
            </nav>

            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-2 sm:gap-3">
                <Link 
                  to="/profile"
                  className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white/90 px-4 py-2.5 shadow-[0_10px_25px_rgba(33,24,9,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(33,24,9,0.08)]"
                >
                  <User className="h-4 w-4 text-teal-700" />
                  <span className="hidden text-sm font-semibold text-stone-700 sm:block">{user.name}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (user.plan.toLowerCase() !== 'pro') {
                        navigate('/pricing')
                      }
                    }}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                      user.plan.toLowerCase() === 'pro'
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : user.plan.toLowerCase() === 'basic'
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                  >
                    {user.plan.toUpperCase()}
                  </button>
                </Link>
                
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:block">Admin</span>
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/auth" className="btn-primary hidden md:block">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-20 left-0 right-0 bg-white border-b border-gray-200 shadow-xl">
            <nav className="p-4 space-y-2">
              {isAuthenticated && user && (
                <>
                  <Link 
                    to="/dashboard" 
                    className="block px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/chat" 
                    className="block px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Copilot
                  </Link>
                </>
              )}
              <Link 
                to="/services" 
                className="block px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/about" 
                className="block px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="block px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                to="/pricing" 
                className="block px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              
              {isAuthenticated && user ? (
                <>
                  <div className="border-t border-gray-200 my-2" />
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 text-teal-700" />
                    <span>{user.name}</span>
                    <span className={`ml-auto rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                      user.plan.toLowerCase() === 'pro'
                        ? 'bg-green-100 text-green-700'
                        : user.plan.toLowerCase() === 'basic'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {user.plan}
                    </span>
                  </Link>
                  
                  {user.isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-50 rounded-lg transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4" />
                      Admin
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/auth" 
                  className="block px-4 py-3 text-center bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
