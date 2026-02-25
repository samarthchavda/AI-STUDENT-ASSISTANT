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
              <span className="text-2xl font-bold text-gray-900">AI Student</span>
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
                <Link to="/auth" className="btn-primary">Get Started</Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Learn Smarter with AI
            <span className="text-primary-600"> Assistant</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your 24/7 AI-powered study companion. Get instant help with doubts, 
            exam prep, coding, and career guidance.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/auth" className="btn-primary text-lg px-8 py-3">
              Start Learning Free
            </Link>
            <Link to="/pricing" className="btn-secondary text-lg px-8 py-3">
              View Pricing
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">10K+</div>
            <div className="text-gray-600 mt-2">Students Helped</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">24/7</div>
            <div className="text-gray-600 mt-2">AI Availability</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">50+</div>
            <div className="text-gray-600 mt-2">Subjects Covered</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">99%</div>
            <div className="text-gray-600 mt-2">Accuracy Rate</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Everything You Need to Excel
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Link to="/chat" className="card hover:scale-105 transition-transform">
            <BookOpen className="w-12 h-12 text-primary-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Learning & Study</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Explain any topic</li>
              <li>• Generate notes</li>
              <li>• Solve doubts 24/7</li>
              <li>• Assignment help</li>
            </ul>
          </Link>

          <Link to="/exam-prep" className="card hover:scale-105 transition-transform">
            <Sparkles className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Exam Preparation</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Mock tests & quizzes</li>
              <li>• Previous year Q's</li>
              <li>• Study plan generator</li>
              <li>• Weak area detection</li>
            </ul>
          </Link>

          <Link to="/coding-help" className="card hover:scale-105 transition-transform">
            <Code className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Coding & Tech</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Code explanation</li>
              <li>• Bug fixing help</li>
              <li>• DSA practice</li>
              <li>• Project guidance</li>
            </ul>
          </Link>

          <Link to="/career" className="card hover:scale-105 transition-transform">
            <Briefcase className="w-12 h-12 text-orange-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Career & Placement</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Resume builder</li>
              <li>• Interview prep</li>
              <li>• ATS check</li>
              <li>• Company prep</li>
            </ul>
          </Link>
        </div>
      </section>

      {/* AI Features */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Powered by Advanced AI
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
