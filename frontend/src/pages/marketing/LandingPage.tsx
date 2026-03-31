import { Link, useNavigate } from 'react-router-dom'
import { 
  Brain, ArrowRight, MessageSquare, FileText, BarChart3, 
  Zap, Trophy, ShieldCheck, Globe2, Sparkles, 
  Rocket, Bot, Clock, Target, CheckCircle, Code2, Briefcase, GraduationCap
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import Footer from '../../components/Footer'

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

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 font-sans">
      
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="rounded-lg bg-slate-900 p-1.5 text-white shadow-sm transition-transform group-hover:scale-105">
              <Brain className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CodeCampus AI</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Login</Link>
            <Link to="/signup" className="rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-blue-600 transition-all shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-5xl px-6 pt-24 pb-20 text-center lg:pt-32">
          <div className="mx-auto mb-8 flex max-w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 shadow-sm">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">The New Standard for Campus Prep</p>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
            Ace Your Placements <br />
            <span className="text-blue-600 italic">Powered by AI.</span>
          </h1>

          <p className="mt-8 mx-auto max-w-2xl text-xl text-slate-500 leading-relaxed">
            Personalized roadmaps, resume analysis, mock interviews, and DSA help. 
            The only workspace you need for placement success.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/signup')}
              className="flex h-14 items-center gap-2 rounded-xl bg-blue-600 px-10 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all hover:scale-[1.02]"
            >
              Get Started for Free <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => navigate('/career/resume-templates')}
              className="h-14 rounded-xl border border-slate-200 bg-white px-10 font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              Browse Templates
            </button>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12 border-y border-slate-100 bg-slate-50/30">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Trusted by students targeting top firms</p>
          <div className="flex flex-wrap justify-center items-center gap-10 opacity-40 grayscale">
            {['TCS', 'Infosys', 'Amazon', 'Google', 'Wipro'].map(brand => (
                <span key={brand} className="text-lg font-bold italic tracking-tighter text-slate-600">{brand}</span>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                <Stat val="500+" lab="Placement Tests"/>
                <Stat val="2.5k" lab="Engineers Hired"/>
                <Stat val="99%" lab="AI Accuracy"/>
                <Stat val="24/7" lab="AI Availability"/>
            </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-32 bg-[#F8FAFC]/50 border-y border-slate-100">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900">Complete Placement Platform</h2>
            <p className="text-slate-500 mt-4">Everything an engineering student needs to get hired.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group relative rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:shadow-2xl hover:border-blue-200">
                {f.tag && <span className="absolute top-4 right-4 text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full uppercase">{f.tag}</span>}
                <div className={`mb-6 inline-flex rounded-2xl ${f.bg} p-3.5 ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-32 bg-white">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-black mb-20 text-slate-900">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-16">
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
            <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-4xl font-black mb-20 text-slate-900">Why Students Love CodeCampus</h2>
                <div className="grid md:grid-cols-4 gap-12 text-center">
                    <Benefit icon={ShieldCheck} text="Reliable & Accurate AI Feedback"/>
                    <Benefit icon={Zap} text="Instant Answers to Coding Doubts"/>
                    <Benefit icon={Globe2} text="Practice Anywhere, Anytime"/>
                    <Benefit icon={Clock} text="Save Months of Preparation Time"/>
                </div>
            </div>
        </section>

        <section className="py-32 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-center text-4xl font-black mb-16 text-slate-900">Frequently Asked Questions</h2>
            <FAQ q="Is CodeCampus AI free?" a="Yes, you can start with the free plan to explore our AI features." />
            <FAQ q="Which AI model powers the assistant?" a="We use Google's Gemini AI to provide real-time, accurate feedback." />
            <FAQ q="Can I practice for specific companies?" a="Absolutely. We have patterns for TCS, Infosys, Wipro, and many more." />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-32 text-center">
          <div className="bg-slate-900 text-white rounded-[3rem] p-16 md:p-24 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20" />
            <Brain className="mx-auto h-12 w-12 mb-8 text-blue-400" />
            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight leading-tight">Ready to secure your future?</h2>
            <p className="mb-10 text-xl text-slate-400 max-w-xl mx-auto">
              Join thousands of students who are already using AI to secure high-package roles.
            </p>
            <Link to="/signup" className="inline-block bg-white text-slate-900 px-12 py-5 rounded-2xl font-black text-xl hover:bg-blue-600 hover:text-white transition-all shadow-xl">
              Start Free Trial
            </Link>
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
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black text-slate-900 mb-4">How It Works</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Three simple steps to placement success
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
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
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black text-slate-900 mb-4">Built with Modern Tech</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Powered by industry-leading technologies for speed, reliability, and intelligence
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black text-slate-900 mb-4">Perfect For Everyone</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Whether you're a student, coder, or job seeker - we've got you covered
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
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