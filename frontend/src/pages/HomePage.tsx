import { Link, useNavigate } from 'react-router-dom'
import { 
  BookOpen, Brain, Code, Briefcase, 
  Sparkles, Clock, Globe, Zap, LogOut, User 
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAppStore()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Brain className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">CodeCampus AI</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/chat" className="text-gray-600 hover:text-primary-600">Chat</Link>
              <Link to="/exam-prep" className="text-gray-600 hover:text-primary-600">Exam Prep</Link>
              <Link to="/coding-help" className="text-gray-600 hover:text-primary-600">Coding</Link>
              <Link to="/career" className="text-gray-600 hover:text-primary-600">Career</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-primary-600">Dashboard</Link>
                  <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {user?.plan.toUpperCase()}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link to="/auth" className="btn-primary">
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="text-center relative z-10">
          <div className="inline-block mb-4">
            <span className="badge badge-primary text-sm px-4 py-2 animate-pulse-slow">
              🎓 #1 Placement Prep Platform for Engineers
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Ace Your Placements with
            <span className="gradient-text block mt-2"> AI-Powered Prep</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Personalized roadmaps, resume analysis, mock interviews, and DSA practice 
            - everything engineering students need for campus placements.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              to={isAuthenticated ? "/chat" : "/auth"} 
              className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {isAuthenticated ? "Go to Dashboard" : "Get Your Roadmap Free"}
            </Link>
            <Link to="/pricing" className="btn-secondary text-lg px-10 py-4 inline-flex items-center gap-2">
              <Zap className="w-5 h-5" />
              View Plans
            </Link>
          </div>
          
          {/* Trust Badges */}
          <div className="mt-12 flex items-center justify-center gap-8 flex-wrap text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>5000+ Students Placed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>200+ Companies</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>90% Success Rate</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          <div className="stat-card text-center">
            <div className="text-5xl font-bold mb-2">5K+</div>
            <div className="text-blue-100 font-medium">Students Placed</div>
          </div>
          <div className="stat-card text-center" style={{background: 'linear-gradient(to bottom right, #8b5cf6, #ec4899)'}}>
            <div className="text-5xl font-bold mb-2">200+</div>
            <div className="text-purple-100 font-medium">Companies</div>
          </div>
          <div className="stat-card text-center" style={{background: 'linear-gradient(to bottom right, #10b981, #3b82f6)'}}>
            <div className="text-5xl font-bold mb-2">90%</div>
            <div className="text-green-100 font-medium">Placement Rate</div>
          </div>
          <div className="stat-card text-center" style={{background: 'linear-gradient(to bottom right, #f59e0b, #ef4444)'}}>
            <div className="text-5xl font-bold mb-2">24/7</div>
            <div className="text-orange-100 font-medium">AI Support</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Complete <span className="gradient-text">Placement Preparation</span> Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to land your dream job in one place
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Link to="/chat" className="feature-card group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">Personalized Roadmap</h3>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span>3-month placement plan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span>Daily study schedule</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span>Skills tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span>Branch-specific prep</span>
              </li>
            </ul>
          </Link>

          <Link to="/exam-prep" className="feature-card group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-600 transition-colors">Resume Analyzer</h3>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span>ATS score (0-100)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span>Weak point detection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span>Improvement tips</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span>Keyword optimization</span>
              </li>
            </ul>
          </Link>

          <Link to="/coding-help" className="feature-card group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-green-600 transition-colors">DSA & Coding</h3>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>DSA problem hints</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Code debugging</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Project ideas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Tech stack guide</span>
              </li>
            </ul>
          </Link>

          <Link to="/career" className="feature-card group">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-orange-600 transition-colors">Mock Interviews</h3>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">✓</span>
                <span>Company-specific prep</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">✓</span>
                <span>HR round practice</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">✓</span>
                <span>Technical questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">✓</span>
                <span>Feedback & tips</span>
              </li>
            </ul>
          </Link>
        </div>
      </section>

      {/* AI Features */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Engineering Students Choose Us
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <Zap className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Personalized Learning</h3>
              <p className="text-gray-600">
                AI adapts to your learning style and tracks your progress
              </p>
            </div>
            
            <div className="text-center p-6">
              <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Instant Responses</h3>
              <p className="text-gray-600">
                Get answers to your questions in seconds, not hours
              </p>
            </div>
            
            <div className="text-center p-6">
              <Globe className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Multi-Language</h3>
              <p className="text-gray-600">
                Support for English, Hindi, Gujarati, and more
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students already learning smarter with AI
          </p>
          <Link to="/chat" className="bg-white text-primary-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 inline-block">
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6" />
                <span className="text-xl font-bold">AI Student</span>
              </div>
              <p className="text-gray-400">
                Your AI-powered learning companion for academic excellence.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Study Assistant</li>
                <li>Exam Preparation</li>
                <li>Coding Help</li>
                <li>Career Guidance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Pricing</li>
                <li>Contact</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 AI Student Assistant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
