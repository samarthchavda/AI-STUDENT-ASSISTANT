import { Link, useNavigate } from 'react-router-dom'
import { 
  Brain, ArrowRight, MessageSquare, FileText, BarChart3, 
  Zap, Trophy, ShieldCheck, Globe2, Sparkles, 
  Rocket, Bot, Clock, Target, CheckCircle, Code2, Briefcase, GraduationCap,
  Star, Users, Award, LogOut, LayoutDashboard
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import Footer from '../../components/Footer'
import { useAppStore } from '../../store/useAppStore'
import { PRICING_PLANS, YEARLY_SAVINGS_PERCENT } from '../../config/pricing'

const features = [
  {
    title: 'AI Career Co-pilot',
    description: 'Instant technical support and roadmap guidance 24/7. Ask coding questions or placement theory.',
    icon: MessageSquare,
    tag: 'Popular',
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    title: 'Resume Intelligence',
    description: 'Bypass ATS filters with AI-powered keyword optimization and real-time scoring.',
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    title: 'Aptitude Mastery',
    description: 'TCS, Infosys & Amazon pattern simulators with deep performance analytics and scoring.',
    icon: BarChart3,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    title: 'Mock Interview Bot',
    description: 'Simulated HR & Technical rounds with AI-driven behavioral feedback and suggestions.',
    icon: Bot,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  }
]

const techStack = [
  {
    name: 'React',
    description: 'Lightning-fast UI with modern component architecture',
    logo: '⚛️',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    name: 'FastAPI',
    description: 'High-performance Python backend for AI processing',
    logo: '⚡',
    color: 'from-green-500 to-emerald-500'
  },
  {
    name: 'Supabase',
    description: 'Scalable PostgreSQL database with real-time features',
    logo: '🗄️',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    name: 'Gemini AI',
    description: 'Google\'s most advanced AI for intelligent responses',
    logo: '🤖',
    color: 'from-purple-500 to-pink-500'
  }
]

const useCases = [
  {
    title: 'The Student',
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-500',
    benefits: [
      'Get personalized study roadmaps',
      'Practice with company-specific tests',
      'Track your preparation progress',
      'Access 24/7 AI doubt solving'
    ]
  },
  {
    title: 'The Coder',
    icon: Code2,
    color: 'from-purple-500 to-pink-500',
    benefits: [
      'Master DSA with AI explanations',
      'Debug code with instant feedback',
      'Learn optimal solutions',
      'Practice coding interview patterns'
    ]
  },
  {
    title: 'The Job Seeker',
    icon: Briefcase,
    color: 'from-orange-500 to-red-500',
    benefits: [
      'Optimize resume for ATS systems',
      'Practice mock interviews',
      'Get company-specific prep',
      'Build confidence before D-day'
    ]
  }
]

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 font-sans">
      
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 p-1.5 text-white shadow-sm transition-transform group-hover:scale-105">
              <Brain className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CodeCampus AI</span>
          </Link>
          
          {/* Public Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/copilot" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Copilot
            </Link>
            <Link to="/about" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              About
            </Link>
            <Link to="/contact" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Contact
            </Link>
            <Link to="/pricing" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Pricing
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Logged In State */}
                <Link to="/dashboard" className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Logged Out State */}
                <Link to="/login" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-bold text-white hover:shadow-lg transition-all">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/70 px-4 py-1.5 shadow-sm">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">Built for engineering campus prep</p>
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-blue-700 to-violet-600 bg-clip-text text-transparent">Placement</span>{' '}
                Preparation Platform for Engineering Students 🚀
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Practice company-wise aptitude questions, take mock tests, use{' '}
                <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text font-semibold text-transparent">AI</span>{' '}
                copilot, and build ATS-friendly resumes — all in one place.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={handleGetStarted}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-7 text-sm font-bold text-white shadow-lg shadow-blue-300/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Start Free Practice
                </button>
                <button
                  onClick={() => navigate('/services')}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-7 text-sm font-bold text-slate-800 transition-all duration-300 hover:border-blue-300 hover:bg-blue-50"
                >
                  Explore Mock Tests
                </button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 text-sm font-semibold text-slate-700 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center">10+ Companies</div>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center">10K+ Questions</div>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center">AI Powered</div>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center">Mock Tests + Resume + DSA</div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-tr from-blue-100 via-violet-100 to-cyan-100 blur-2xl" />
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Dashboard Preview</p>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Live Progress</span>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                    <p className="text-xs font-semibold text-slate-500">Aptitude Practice</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">72% mastery in TCS pattern set</p>
                  </div>
                  <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-3">
                    <p className="text-xs font-semibold text-slate-500">AI Copilot</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">14 doubts solved this week</p>
                  </div>
                  <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
                    <p className="text-xs font-semibold text-slate-500">Resume ATS Score</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">86/100 - ready for top recruiters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Modal - REMOVED, now redirects to /copilot */}

        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 border-y border-slate-200/60 bg-slate-50/50">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Trusted by students targeting top firms</p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 opacity-40 grayscale">
            {['TCS', 'Infosys', 'Amazon', 'Google', 'Wipro'].map(brand => (
                <span key={brand} className="text-lg font-bold italic tracking-tighter text-slate-600">{brand}</span>
            ))}
          </div>
        </section>

        {/* Demo Sections */}
        <DemoSectionsComponent navigate={navigate} />

        {/* Pricing Section */}
        <PricingSection navigate={navigate} />

        {/* Testimonials Section */}
        <TestimonialsSection />

        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 text-center">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
                <Stat val="500+" lab="Placement Tests"/>
                <Stat val="2.5k" lab="Engineers Hired"/>
                <Stat val="99%" lab="AI Accuracy"/>
                <Stat val="24/7" lab="AI Availability"/>
            </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-32 bg-gradient-to-b from-white to-blue-50/30 border-y border-slate-200/60">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Complete Placement Platform</h2>
            <p className="text-slate-600 mt-4">Everything an engineering student needs to get hired.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group relative rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:shadow-xl hover:border-blue-300 hover:-translate-y-1">
                {f.tag && <span className="absolute top-4 right-4 text-[10px] font-black bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full uppercase">{f.tag}</span>}
                <div className={`mb-6 inline-flex rounded-2xl ${f.bg} p-3.5 ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm font-medium">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-32 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-black mb-20 text-slate-900">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16">
              <Step number="01" icon={Rocket} title="Create Account" text="Sign up and set your branch and target companies." />
              <Step number="02" icon={Brain} title="AI Generates Plan" text="AI builds your personalized 3-month preparation roadmap." />
              <Step number="03" icon={Trophy} title="Crack Interviews" text="Practice with AI tools and land your dream offer." />
            </div>
          </div>
        </section>

        {/* NEW: How It Works - Detailed */}
        <HowItWorksSection />

        {/* NEW: Tech Stack Section */}
        <TechStackSection />

        {/* NEW: Use Cases Section */}
        <UseCasesSection />

        <section className="py-32 bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                <h2 className="text-3xl sm:text-4xl font-black mb-20 text-slate-900">Why Students Love CodeCampus</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-center">
                    <Benefit icon={ShieldCheck} text="Reliable & Accurate AI Feedback"/>
                    <Benefit icon={Zap} text="Instant Answers to Coding Doubts"/>
                    <Benefit icon={Globe2} text="Practice Anywhere, Anytime"/>
                    <Benefit icon={Clock} text="Save Months of Preparation Time"/>
                </div>
            </div>
        </section>

        <section className="py-32 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-center text-3xl sm:text-4xl font-black mb-16 text-slate-900">Frequently Asked Questions</h2>
            <FAQ q="Is CodeCampus AI free?" a="Yes, you can start with the free plan to explore our AI features." />
            <FAQ q="Which AI model powers the assistant?" a="We use Google's Gemini AI to provide real-time, accurate feedback." />
            <FAQ q="Can I practice for specific companies?" a="Absolutely. We have patterns for TCS, Infosys, Wipro, and many more." />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-32 text-center">
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white rounded-[3rem] p-8 sm:p-12 md:p-16 lg:p-24 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
            <Brain className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-8 text-white/90" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 tracking-tight leading-tight">
              {isAuthenticated ? 'Continue Your Journey' : 'Ready to secure your future?'}
            </h2>
            <p className="mb-10 text-lg sm:text-xl text-white/90 max-w-xl mx-auto">
              {isAuthenticated 
                ? 'Keep learning and practicing to achieve your placement goals.'
                : 'Join thousands of students who are already using AI to secure high-package roles.'
              }
            </p>
            <button
              onClick={handleGetStarted}
              className="inline-block bg-white text-blue-700 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl hover:bg-blue-50 transition-all shadow-xl hover:scale-105"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function Stat({val, lab}: {val: string, lab: string}) {
  return (
    <div>
      <p className="text-5xl font-black text-slate-900 tracking-tighter">{val}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">{lab}</p>
    </div>
  )
}

function Step({number, icon:Icon, title, text}: {number: string, icon: any, title: string, text: string}) {
  return (
    <div className="relative group">
      <div className="text-8xl font-black text-slate-50 absolute -top-12 left-1/2 -translate-x-1/2 z-0 select-none group-hover:text-blue-50 transition-colors">{number}</div>
      <div className="relative z-10">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 border border-blue-100 group-hover:scale-110 transition-transform shadow-sm">
          <Icon size={32} />
        </div>
        <h3 className="font-bold text-2xl mb-3 text-slate-900">{title}</h3>
        <p className="text-slate-500 leading-relaxed text-sm font-medium">{text}</p>
      </div>
    </div>
  )
}

function Benefit({icon:Icon, text}: {icon: any, text: string}) {
    return (
      <div className="flex flex-col items-center">
        <Icon className="h-10 w-10 text-blue-600 mb-4" />
        <p className="font-bold text-slate-700 text-sm leading-relaxed">{text}</p>
      </div>
    )
}

function FAQ({q, a}: {q: string, a: string}) {
  return (
    <div className="bg-white border border-slate-100 p-7 rounded-2xl mb-4 hover:border-blue-200 transition-all cursor-default shadow-sm text-left">
      <h3 className="font-bold text-slate-900 text-lg">{q}</h3>
      <p className="text-slate-500 mt-3 text-sm leading-relaxed">{a}</p>
    </div>
  )
}

// NEW SECTIONS

function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const steps = [
    {
      icon: Target,
      title: 'Pick a Company',
      description: 'Choose from TCS, Infosys, Amazon, Microsoft, Google, and more. We have patterns for all top recruiters.'
    },
    {
      icon: Brain,
      title: 'Take AI Test',
      description: 'Practice with company-specific mock tests. Get instant feedback and detailed explanations for every question.'
    },
    {
      icon: Trophy,
      title: 'Get Interview Ready',
      description: 'Master aptitude, coding, and HR rounds. Track your progress and identify weak areas with AI analytics.'
    }
  ]

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">How It Works</h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Three simple steps to placement success
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group"
            >
              <div className="bg-white rounded-3xl p-8 border border-slate-200 hover:border-blue-300 transition-all hover:shadow-xl h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-6xl font-black text-slate-100 absolute top-4 right-4">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TechStackSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-20 bg-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Built with Modern Tech</h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Powered by industry-leading technologies for speed, reliability, and intelligence
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {techStack.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 transition-all hover:shadow-lg group"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${tech.color} rounded-xl flex items-center justify-center mb-4 text-4xl group-hover:scale-110 transition-transform`}>
                {tech.logo}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{tech.name}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{tech.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function UseCasesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Perfect For Everyone</h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Whether you're a student, coder, or job seeker - we've got you covered
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group"
            >
              <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-transparent hover:shadow-2xl transition-all h-full relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${useCase.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="relative">
                  <div className={`w-16 h-16 bg-gradient-to-br ${useCase.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <useCase.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">{useCase.title}</h3>
                  <ul className="space-y-3">
                    {useCase.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


// Demo Sections Component
function DemoSectionsComponent({ navigate }: { navigate: any }) {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
            Experience Before You Sign Up
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Try our features with no login required. See the value instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* AI Copilot Demo */}
          <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">AI Copilot</h3>
            <p className="text-sm text-slate-600 mb-4">Ask 3 questions free, no login needed</p>
            <button
              onClick={() => navigate('/chat')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Try Now →
            </button>
          </div>

          {/* Resume Builder Demo */}
          <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Resume Builder</h3>
            <p className="text-sm text-slate-600 mb-4">Browse 8+ ATS-ready templates</p>
            <button
              onClick={() => navigate('/career/resume-templates')}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all"
            >
              Browse Templates →
            </button>
          </div>

          {/* DSA Practice Demo */}
          <div className="bg-white rounded-2xl p-6 border-2 border-green-200 hover:border-green-400 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">DSA Practice</h3>
            <p className="text-sm text-slate-600 mb-4">Try 1 problem, Run code free</p>
            <button
              onClick={() => navigate('/dsa')}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all"
            >
              Practice DSA →
            </button>
          </div>

          {/* Aptitude Demo */}
          <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Aptitude Test</h3>
            <p className="text-sm text-slate-600 mb-4">Try 3 questions from any company</p>
            <button
              onClick={() => navigate('/aptitude')}
              className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-all"
            >
              Take Test →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// Pricing Section
function PricingSection({ navigate }: { navigate: any }) {
  const plans = PRICING_PLANS.map(plan => ({
    name: plan.name,
    price: `₹${plan.price.monthly}`,
    period: plan.price.monthly === 0 ? 'forever' : 'per month',
    description: plan.id === 'free' 
      ? 'Perfect for getting started' 
      : plan.id === 'basic'
      ? 'Great for regular practice'
      : 'Everything you need to succeed',
    features: plan.features,
    limitations: plan.limitations,
    cta: plan.id === 'free' ? 'Start Free' : `Get ${plan.name}`,
    popular: plan.popular || false
  }))

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Start free, upgrade when you're ready. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 border-2 ${
                plan.popular
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-blue-400 shadow-2xl scale-105'
                  : 'bg-white border-slate-200 shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">
                  ⭐ Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-5xl font-black ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                  <span className={plan.popular ? 'text-blue-100' : 'text-slate-500'}>/{plan.period}</span>
                </div>
                <p className={plan.popular ? 'text-blue-100' : 'text-slate-600'}>{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-green-300' : 'text-green-500'}`} />
                    <span className={plan.popular ? 'text-white' : 'text-slate-700'}>{feature}</span>
                  </li>
                ))}
                {plan.limitations.length > 0 && (
                  <>
                    {plan.limitations.map((limitation, idx) => (
                      <li key={`limit-${idx}`} className="flex items-start gap-3">
                        <span className={`text-sm ${plan.popular ? 'text-blue-200' : 'text-slate-400'}`}>✗ {limitation}</span>
                      </li>
                    ))}
                  </>
                )}
              </ul>

              <button
                onClick={() => navigate('/signup')}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  plan.popular
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-600 mt-8">
          💳 All plans include 7-day money-back guarantee • Save {YEARLY_SAVINGS_PERCENT}% with yearly billing
        </p>
      </div>
    </section>
  )
}

// Testimonials Section
function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Rahul Sharma',
      role: 'Placed at TCS',
      image: '👨‍💻',
      rating: 5,
      text: 'CodeCampus AI helped me crack TCS with 7 LPA package. The aptitude tests were exactly like the real exam!'
    },
    {
      name: 'Priya Patel',
      role: 'Placed at Infosys',
      image: '👩‍💻',
      rating: 5,
      text: 'The AI copilot explained DSA concepts better than my college professors. Highly recommended!'
    },
    {
      name: 'Amit Kumar',
      role: 'Placed at Amazon',
      image: '👨‍🎓',
      rating: 5,
      text: 'Resume builder and mock interviews were game-changers. Got selected in Amazon with 12 LPA!'
    },
    {
      name: 'Sneha Reddy',
      role: 'Placed at Wipro',
      image: '👩‍🎓',
      rating: 5,
      text: 'Best investment for placement prep. The company-specific tests helped me prepare strategically.'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
            Loved by 2,500+ Students
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Join thousands of students who landed their dream jobs with CodeCampus AI
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-black text-blue-600 mb-2">2,500+</div>
            <div className="text-sm text-slate-600 font-semibold">Students Placed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-green-600 mb-2">95%</div>
            <div className="text-sm text-slate-600 font-semibold">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-purple-600 mb-2">4.9/5</div>
            <div className="text-sm text-slate-600 font-semibold">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-orange-600 mb-2">8.5 LPA</div>
            <div className="text-sm text-slate-600 font-semibold">Avg Package</div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">{testimonial.image}</div>
                <div>
                  <div className="font-bold text-slate-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-600">{testimonial.role}</div>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{testimonial.text}</p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-6 h-6 text-green-600" />
            <span className="font-semibold">Secure & Private</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="w-6 h-6 text-blue-600" />
            <span className="font-semibold">2,500+ Active Users</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Award className="w-6 h-6 text-purple-600" />
            <span className="font-semibold">Top Rated Platform</span>
          </div>
        </div>
      </div>
    </section>
  )
}
