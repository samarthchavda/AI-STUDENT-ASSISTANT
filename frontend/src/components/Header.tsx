import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, User, Shield, Brain, Menu, X } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useState } from 'react'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAppStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActiveRoute = (route: string) => location.pathname === route

  const navItemClass = (route: string) =>
    `relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
      isActiveRoute(route)
        ? 'bg-teal-50 text-teal-800 shadow-[inset_0_0_0_1px_rgba(13,148,136,0.18)]'
        : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
    }`

  return (
    <header className="sticky top-0 left-0 right-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-md shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition-all duration-300">
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
              className="rounded-xl border border-stone-200 p-2 text-stone-700 shadow-sm transition-colors duration-200 hover:bg-stone-100 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-1.5 rounded-full border border-stone-200 bg-white/80 p-1.5 shadow-[0_12px_26px_rgba(33,24,9,0.06)] md:flex">
              {isAuthenticated && user && (
                <>
                  <Link to="/dashboard" className={navItemClass('/dashboard')}>
                    Dashboard
                  </Link>
                  <Link to="/chat" className={navItemClass('/chat')}>
                    Copilot
                  </Link>
                </>
              )}
              <Link to="/services" className={navItemClass('/services')}>
                Services
              </Link>
              <Link to="/about" className={navItemClass('/about')}>
                About
              </Link>
              <Link to="/contact" className={navItemClass('/contact')}>
                Contact
              </Link>
              <Link to="/pricing" className={navItemClass('/pricing')}>
                Pricing
              </Link>
            </nav>

            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-2.5 sm:gap-3">
                <Link 
                  to="/profile"
                  className="flex items-center gap-2.5 rounded-full border border-stone-200 bg-white px-3.5 py-2 shadow-[0_10px_25px_rgba(33,24,9,0.06)] transition-all duration-200 hover:border-stone-300 hover:shadow-[0_14px_30px_rgba(33,24,9,0.08)]"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-teal-700">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden text-sm font-medium text-stone-700 sm:block">{user.name}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (user.plan.toLowerCase() !== 'pro') {
                        navigate('/pricing')
                      }
                    }}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] shadow-sm transition-all duration-200 ${
                      user.plan.toLowerCase() === 'pro'
                        ? 'bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-[0_6px_16px_rgba(99,102,241,0.35)] cursor-default'
                        : user.plan.toLowerCase() === 'basic'
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                    }`}
                  >
                    {user.plan.toUpperCase()}
                  </button>
                </Link>
                
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 rounded-xl border border-violet-200/80 bg-violet-50/50 px-3.5 py-2 text-sm font-medium text-violet-700 transition-colors duration-200 hover:bg-violet-100/70"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:block">Admin</span>
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-medium text-rose-700 transition-colors duration-200 hover:bg-rose-100"
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
          <div className="fixed top-20 left-3 right-3 rounded-2xl border border-stone-200 bg-white shadow-xl">
            <nav className="space-y-2 p-4">
              {isAuthenticated && user && (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`block rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActiveRoute('/dashboard')
                        ? 'bg-teal-50 text-teal-800 shadow-[inset_0_0_0_1px_rgba(13,148,136,0.18)]'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/chat" 
                    className={`block rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActiveRoute('/chat')
                        ? 'bg-teal-50 text-teal-800 shadow-[inset_0_0_0_1px_rgba(13,148,136,0.18)]'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Copilot
                  </Link>
                </>
              )}
              <Link 
                to="/services" 
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActiveRoute('/services')
                    ? 'bg-teal-50 text-teal-800 shadow-[inset_0_0_0_1px_rgba(13,148,136,0.18)]'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/about" 
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActiveRoute('/about')
                    ? 'bg-teal-50 text-teal-800 shadow-[inset_0_0_0_1px_rgba(13,148,136,0.18)]'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActiveRoute('/contact')
                    ? 'bg-teal-50 text-teal-800 shadow-[inset_0_0_0_1px_rgba(13,148,136,0.18)]'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                to="/pricing" 
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActiveRoute('/pricing')
                    ? 'bg-teal-50 text-teal-800 shadow-[inset_0_0_0_1px_rgba(13,148,136,0.18)]'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              
              {isAuthenticated && user ? (
                <>
                  <div className="border-t border-gray-200 my-2" />
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-stone-700 transition-colors duration-200 hover:bg-stone-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 text-teal-700" />
                    <span>{user.name}</span>
                    <span className={`ml-auto rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                      user.plan.toLowerCase() === 'pro'
                        ? 'bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-[0_6px_16px_rgba(99,102,241,0.35)]'
                        : user.plan.toLowerCase() === 'basic'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-orange-50 text-orange-700'
                    }`}>
                      {user.plan}
                    </span>
                  </Link>
                  
                  {user.isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-violet-700 transition-colors duration-200 hover:bg-violet-50"
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
                    className="flex w-full items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition-colors duration-200 hover:bg-rose-100"
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
