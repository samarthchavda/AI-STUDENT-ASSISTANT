import { Target, Users, Award, Zap, Heart, TrendingUp } from 'lucide-react'
import Header from '../components/Header'

export default function AboutPage() {
  const stats = [
    { number: '5000+', label: 'Students Placed', icon: Users },
    { number: '200+', label: 'Partner Companies', icon: Award },
    { number: '90%', label: 'Success Rate', icon: TrendingUp },
    { number: '24/7', label: 'AI Support', icon: Zap }
  ]

  const values = [
    {
      icon: Target,
      title: 'Mission-Driven',
      description: 'Our mission is to make quality placement preparation accessible to every engineering student, regardless of their background or location.'
    },
    {
      icon: Heart,
      title: 'Student-First',
      description: 'We put students at the center of everything we do. Every feature is designed with your success in mind.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We leverage cutting-edge AI technology to provide personalized, effective learning experiences.'
    }
  ]

  const team = [
    {
      name: 'AI-Powered Platform',
      role: 'Technology',
      description: 'Built with OpenAI GPT-4 and Google Gemini for intelligent responses'
    },
    {
      name: 'Expert Content',
      role: 'Curriculum',
      description: 'Curated by industry professionals and placement experts'
    },
    {
      name: 'Student Community',
      role: 'Support',
      description: '5000+ students helping each other succeed'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About
            <span className="gradient-text"> CodeCampus AI</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to revolutionize placement preparation for engineering students 
            through AI-powered personalized learning.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <div className="text-4xl font-bold gradient-text mb-2">{stat.number}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
              <p>
                CodeCampus AI was born from a simple observation: engineering students 
                needed better, more personalized tools to prepare for campus placements.
              </p>
              <p>
                Traditional coaching institutes were expensive and one-size-fits-all. 
                Online resources were scattered and overwhelming. Students needed something 
                that understood their unique needs and adapted to their learning pace.
              </p>
              <p>
                That's why we built CodeCampus AI - an intelligent platform that combines 
                the power of artificial intelligence with proven placement preparation 
                strategies to help every student achieve their career goals.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-6">Why Choose Us?</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <span>Personalized AI-powered learning paths</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <span>24/7 availability - learn at your own pace</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <span>Multi-language support for Indian students</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <span>Affordable pricing - accessible to all</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <span>Proven track record with 5000+ placements</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Our Values</h2>
          <p className="text-xl text-gray-600">The principles that guide everything we do</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <value.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powered By</h2>
          <p className="text-xl text-gray-600">The technology and community behind CodeCampus AI</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl font-bold gradient-text">
                  {member.name.charAt(0)}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{member.name}</h3>
              <p className="text-blue-600 font-medium mb-3">{member.role}</p>
              <p className="text-gray-600">{member.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Have Questions?</h2>
          <p className="text-xl mb-8 opacity-90">
            We're here to help you succeed. Reach out to us anytime!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="mailto:support@codecampus.ai" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Contact Support
            </a>
            <a href="/chat" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              Chat with AI
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
