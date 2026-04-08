import { Link } from 'react-router-dom'
import { Brain, Code2, FileText, Target, Users, Award, Zap, TrendingUp, MessageSquare } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function AboutPage() {
  const features = [
    {
      icon: MessageSquare,
      title: 'AI Career Copilot',
      description: 'Get instant answers to coding questions, placement theory, and career guidance 24/7 with our advanced AI assistant.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Code2,
      title: 'DSA Practice',
      description: 'Master Data Structures & Algorithms with curated problems, real-time code execution, and AI-powered hints.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Aptitude Preparation',
      description: 'Practice with company-specific aptitude tests from TCS, Infosys, Amazon, and more with detailed analytics.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: FileText,
      title: 'Resume Builder & ATS Analysis',
      description: 'Create ATS-optimized resumes with 8+ professional templates and get real-time scoring to beat applicant tracking systems.',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const stats = [
    { value: '2,500+', label: 'Students Placed' },
    { value: '95%', label: 'Success Rate' },
    { value: '8.5 LPA', label: 'Avg Package' },
    { value: '24/7', label: 'AI Support' }
  ]

  const values = [
    {
      icon: Users,
      title: 'Student-First Approach',
      description: 'Every feature is designed with student success in mind, making placement preparation accessible and effective.'
    },
    {
      icon: Zap,
      title: 'AI-Powered Learning',
      description: 'Leverage cutting-edge AI technology to get personalized guidance and instant feedback on your preparation.'
    },
    {
      icon: TrendingUp,
      title: 'Continuous Improvement',
      description: 'We constantly update our platform with new features, questions, and resources based on latest placement trends.'
    },
    {
      icon: Award,
      title: 'Quality Content',
      description: 'All our content is curated by industry experts and verified to match real interview patterns.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
            <Brain className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">About CodeCampus AI</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Your AI-Powered Partner for
            <span className="block text-blue-600 mt-2">Placement Success</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            CodeCampus AI is a comprehensive placement preparation platform that combines artificial intelligence 
            with proven learning methodologies to help engineering students land their dream jobs.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-xl text-gray-600">
              To democratize placement preparation by making high-quality, AI-powered learning resources 
              accessible to every engineering student, regardless of their background or location.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-white">
            <h3 className="text-2xl font-bold mb-4">Why We Built CodeCampus AI</h3>
            <p className="text-lg text-blue-100 mb-6">
              We noticed that many talented students struggle with placement preparation due to lack of 
              personalized guidance, expensive coaching, and scattered resources. CodeCampus AI was born 
              from the vision to solve these problems using artificial intelligence.
            </p>
            <p className="text-lg text-blue-100">
              Our platform brings together everything a student needs - from AI-powered doubt solving to 
              company-specific preparation - all in one place, making the journey from college to career 
              smoother and more successful.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <p className="text-xl text-gray-600">
              Comprehensive tools and resources for every aspect of placement preparation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Start Your Placement Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who are already using CodeCampus AI to prepare for their dream jobs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-xl font-bold hover:bg-white/20 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
