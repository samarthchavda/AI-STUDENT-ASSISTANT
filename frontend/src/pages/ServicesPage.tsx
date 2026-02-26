import { Link } from 'react-router-dom'
import { BookOpen, Code, Briefcase, MessageSquare, FileText, Target, Sparkles, CheckCircle } from 'lucide-react'
import Header from '../components/Header'

export default function ServicesPage() {
  const services = [
    {
      icon: MessageSquare,
      title: 'AI Chat Assistant',
      description: 'Get instant answers to your questions on any topic - from academics to career guidance.',
      features: [
        'Multi-language support (English, Hindi, Gujarati)',
        'Voice recognition and text-to-speech',
        'Conversation memory',
        '24/7 availability'
      ],
      color: 'from-blue-500 to-blue-600',
      link: '/chat'
    },
    {
      icon: BookOpen,
      title: 'Exam Preparation',
      description: 'Practice with AI-generated questions tailored to your subjects and difficulty level.',
      features: [
        'Custom question generation',
        'Multiple subjects coverage',
        'Instant feedback and explanations',
        'Progress tracking'
      ],
      color: 'from-purple-500 to-purple-600',
      link: '/exam-prep'
    },
    {
      icon: Code,
      title: 'Coding Help',
      description: 'Debug code, learn algorithms, and master data structures with AI assistance.',
      features: [
        'Code debugging and optimization',
        'DSA problem solving',
        'Multiple programming languages',
        'Step-by-step explanations'
      ],
      color: 'from-green-500 to-green-600',
      link: '/coding-help'
    },
    {
      icon: Briefcase,
      title: 'Career Guidance',
      description: 'Get personalized career advice, resume tips, and interview preparation.',
      features: [
        'Resume analysis and improvement',
        'Mock interview practice',
        'Career path recommendations',
        'Company-specific preparation'
      ],
      color: 'from-orange-500 to-orange-600',
      link: '/career'
    },
    {
      icon: FileText,
      title: 'Document Upload',
      description: 'Upload PDFs, DOCs, or text files and get AI-powered analysis and summaries.',
      features: [
        'PDF and DOC support',
        'Automatic summarization',
        'Question answering from documents',
        'Key points extraction'
      ],
      color: 'from-pink-500 to-pink-600',
      link: '/chat',
      comingSoon: true
    },
    {
      icon: Target,
      title: 'Personalized Roadmap',
      description: 'Get a customized learning path based on your goals and current skill level.',
      features: [
        '3-month placement plan',
        'Daily study schedule',
        'Skills tracking',
        'Branch-specific preparation'
      ],
      color: 'from-indigo-500 to-indigo-600',
      link: '/chat'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="badge badge-primary text-sm px-4 py-2">
              <Sparkles className="w-4 h-4 inline mr-2" />
              Our Services
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Everything You Need to
            <span className="gradient-text block mt-2">Succeed in Your Career</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive AI-powered tools designed specifically for engineering students 
            to excel in placements and beyond.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              <div className="p-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
                  {service.comingSoon && (
                    <span className="badge badge-secondary text-xs">Soon</span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-6">{service.description}</p>
                
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  to={service.link}
                  className={`btn-primary w-full text-center ${service.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={(e) => service.comingSoon && e.preventDefault()}
                >
                  {service.comingSoon ? 'Coming Soon' : 'Try Now'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students who are already using our platform to achieve their career goals.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Get Started Free
            </Link>
            <Link to="/pricing" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
