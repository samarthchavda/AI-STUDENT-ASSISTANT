import { useState } from "react";
import {
  Sparkles,
  MessageSquare,
  BookOpen,
  ClipboardCheck,
  CalendarCheck,
  Pencil,
  Lightbulb,
  ArrowRight,
  ArrowDown,
  Users,
  GraduationCap,
  Star,
  Github,
} from "lucide-react";

const screenshots = [
  {
    src: "/demo/chat.png",
    alt: "Chat Interface",
    title: "AI Chat Tutor",
  },
  {
    src: "/demo/summary.png",
    alt: "Summary Output",
    title: "Notes Summarizer",
  },
  {
    src: "/demo/quiz.png",
    alt: "Quiz Generator",
    title: "Quiz Generator",
  },
];

const features = [
  {
    icon: <MessageSquare className="w-8 h-8 text-blue-500" />,
    title: "AI Chat Tutor",
    desc: "Chat with AI to get instant answers and explanations.",
  },
  {
    icon: <BookOpen className="w-8 h-8 text-green-500" />,
    title: "Notes Summarizer",
    desc: "Summarize your study notes into easy-to-read points.",
  },
  {
    icon: <ClipboardCheck className="w-8 h-8 text-purple-500" />,
    title: "Quiz Generator",
    desc: "Generate quizzes from your notes for self-testing.",
  },
  {
    icon: <CalendarCheck className="w-8 h-8 text-pink-500" />,
    title: "Study Plan Generator",
    desc: "Create personalized study plans with AI guidance.",
  },
  {
    icon: <Pencil className="w-8 h-8 text-yellow-500" />,
    title: "Homework Helper",
    desc: "Get help with homework and assignments.",
  },
  {
    icon: <Lightbulb className="w-8 h-8 text-teal-500" />,
    title: "Concept Explainer",
    desc: "Understand difficult concepts with clear explanations.",
  },
];

const benefits = [
  {
    icon: <Sparkles className="w-7 h-7 text-blue-500" />,
    text: "Study faster with AI assistance",
  },
  {
    icon: <Lightbulb className="w-7 h-7 text-yellow-500" />,
    text: "Understand difficult concepts easily",
  },
  {
    icon: <CalendarCheck className="w-7 h-7 text-green-500" />,
    text: "Save hours of study time",
  },
  {
    icon: <ClipboardCheck className="w-7 h-7 text-purple-500" />,
    text: "Prepare better for exams",
  },
];

const audience = [
  {
    icon: <GraduationCap className="w-8 h-8 text-blue-500" />,
    title: "College Students",
  },
  {
    icon: <Users className="w-8 h-8 text-green-500" />,
    title: "School Students",
  },
  {
    icon: <ClipboardCheck className="w-8 h-8 text-purple-500" />,
    title: "Competitive Exam Prep",
  },
  {
    icon: <BookOpen className="w-8 h-8 text-pink-500" />,
    title: "Self Learners",
  },
];

const testimonials = [
  {
    name: "Amit Patel",
    quote: "AI Student Assistant helped me ace my exams! The quiz generator is amazing.",
    rating: 5,
  },
  {
    name: "Sara Lee",
    quote: "I love the notes summarizer. It saves me so much time every week.",
    rating: 4,
  },
  {
    name: "John Doe",
    quote: "The AI chat tutor explains concepts better than my textbooks.",
    rating: 5,
  },
];

const faqs = [
  {
    q: "Is AI Student Assistant free?",
    a: "Yes! You can get started for free. Premium features are available for advanced users.",
  },
  {
    q: "What AI model does it use?",
    a: "We use advanced LLMs similar to GPT-4 for accurate and helpful responses.",
  },
  {
    q: "Can I upload my notes?",
    a: "Absolutely! You can upload notes, PDFs, or paste text for analysis.",
  },
  {
    q: "Does it work for all subjects?",
    a: "Yes, AI Student Assistant supports all major subjects and exam types.",
  },
];

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="max-w-2xl mx-auto">
      {faqs.map((faq, idx) => (
        <div key={idx} className="mb-3 border rounded-lg bg-white shadow-sm">
          <button
            className="w-full flex justify-between items-center px-4 py-3 font-semibold text-left hover:bg-gray-50 transition"
            onClick={() => setOpen(open === idx ? null : idx)}
          >
            <span>{faq.q}</span>
            <ArrowDown className={`w-5 h-5 transition-transform ${open === idx ? "rotate-180" : ""}`} />
          </button>
          {open === idx && (
            <div className="px-4 pb-4 text-gray-600 animate-fadeIn">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen flex flex-col">
      {/* 1️⃣ Hero Section */}
      <section className="relative pt-16 pb-24 px-4 md:px-8 flex flex-col items-center text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fadeIn">
            Your Personal AI Study Assistant
          </h1>
          <p className="text-lg md:text-2xl text-gray-700 mb-8 animate-fadeIn delay-100">
            Chat with AI, summarize notes, generate quizzes, and create study plans. All in one place for students.
          </p>
          <div className="flex gap-4 justify-center mb-10 animate-fadeIn delay-200">
            <a
              href="/auth"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform"
            >
              Get Started
            </a>
            <a
              href="/demo"
              className="px-8 py-3 rounded-xl bg-white text-blue-600 font-semibold border border-blue-500 shadow hover:bg-blue-50 hover:scale-105 transition-transform"
            >
              Try Demo
            </a>
          </div>
        </div>
        {/* AI Illustration / Dashboard Preview */}
        <div className="mt-8 animate-fadeIn delay-300">
          <img
            src="/ai-illustration.svg"
            alt="AI Dashboard Preview"
            className="mx-auto w-full max-w-lg rounded-2xl shadow-xl border border-teal-100"
          />
        </div>
      </section>

      {/* 2️⃣ Features Section */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-white to-emerald-50 border border-teal-100 rounded-xl p-8 flex flex-col items-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className="mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3️⃣ How It Works Section */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-blue-50 to-teal-50">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">How It Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center">
            <BookOpen className="w-10 h-10 text-blue-500 mb-2" />
            <span className="font-semibold text-lg mb-1">Upload notes or ask a question</span>
          </div>
          <ArrowRight className="w-8 h-8 text-gray-400 hidden md:block" />
          <ArrowDown className="w-8 h-8 text-gray-400 md:hidden" />
          <div className="flex flex-col items-center">
            <Sparkles className="w-10 h-10 text-yellow-500 mb-2" />
            <span className="font-semibold text-lg mb-1">AI analyzes the content</span>
          </div>
          <ArrowRight className="w-8 h-8 text-gray-400 hidden md:block" />
          <ArrowDown className="w-8 h-8 text-gray-400 md:hidden" />
          <div className="flex flex-col items-center">
            <ClipboardCheck className="w-10 h-10 text-green-500 mb-2" />
            <span className="font-semibold text-lg mb-1">Get summaries, quizzes, and explanations</span>
          </div>
        </div>
      </section>

      {/* 4️⃣ Product Demo / Screenshots Section */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">See AI Student Assistant in Action</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {screenshots.map((shot, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col items-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <img
                src={shot.src}
                alt={shot.alt}
                className="w-full h-56 object-cover rounded-lg mb-4 border border-gray-200"
              />
              <h3 className="text-lg font-semibold mb-2">{shot.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* 5️⃣ Benefits Section */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-emerald-50 to-blue-50">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Why Use AI Student Assistant?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {benefits.map((b, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-white rounded-xl p-6 shadow hover:shadow-lg transition-all">
              {b.icon}
              <span className="text-lg font-medium">{b.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6️⃣ Target Audience Section */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Who Is It For?</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {audience.map((a, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-white to-teal-50 border border-teal-100 rounded-xl p-8 flex flex-col items-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              {a.icon}
              <h3 className="text-lg font-semibold mt-4">{a.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* 7️⃣ Testimonials Section */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-blue-50 to-emerald-50">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">What Students Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white border border-blue-100 rounded-xl p-8 flex flex-col items-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-4">"{t.quote}"</p>
              <span className="font-semibold text-blue-600">{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 8️⃣ FAQ Section */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">FAQ</h2>
        <FAQAccordion />
      </section>

      {/* 9️⃣ Final Call To Action Section */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-r from-blue-500 to-teal-500 text-white text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Start Studying Smarter with AI</h2>
        <a
          href="/auth"
          className="mt-4 inline-block px-10 py-4 rounded-xl bg-white text-blue-600 font-bold text-lg shadow-lg hover:bg-blue-50 hover:scale-105 transition-transform"
        >
          Get Started Free
        </a>
      </section>

      {/* 🔟 Footer Section */}
      <footer className="py-8 px-4 md:px-8 bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a href="https://github.com/samarthchavda/AI-STUDENT-ASSISTANT" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">
              <Github className="w-6 h-6" />
            </a>
            <a href="/contact" className="hover:text-blue-600 transition">Contact</a>
            <a href="/about" className="hover:text-blue-600 transition">About</a>
          </div>
          <div className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} AI Student Assistant. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
import { Link } from 'react-router-dom'
import { 
  BookOpen, Brain, Code, Briefcase, 
  Sparkles, Clock, Globe, Zap
} from 'lucide-react'
import Header from '../components/Header'
import { useAppStore } from '../store/useAppStore'

export default function HomePage() {
  const { isAuthenticated } = useAppStore()
  
  return (
    <div className="min-h-screen">
      <Header />

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
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Google Gemini AI Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Free to Start</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100">
            <div className="text-4xl font-bold text-gray-900 mb-2">Real-time</div>
            <div className="text-gray-600 font-medium">AI Responses</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100">
            <div className="text-4xl font-bold text-gray-900 mb-2">Multi</div>
            <div className="text-gray-600 font-medium">Language Support</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100">
            <div className="text-4xl font-bold text-gray-900 mb-2">Voice</div>
            <div className="text-gray-600 font-medium">Recognition</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100">
            <div className="text-4xl font-bold text-gray-900 mb-2">24/7</div>
            <div className="text-gray-600 font-medium">Available</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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

      {/* Footer */}
      <footer id="about" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6" />
                <span className="text-xl font-bold">CodeCampus AI</span>
              </div>
              <p className="text-gray-400">
                Your AI-powered placement preparation companion for engineering students.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/chat" className="hover:text-white transition-colors">Chat Assistant</Link></li>
                <li><Link to="/exam-prep" className="hover:text-white transition-colors">Aptitude Preparation</Link></li>
                <li><Link to="/coding-help" className="hover:text-white transition-colors">Coding Help</Link></li>
                <li><Link to="/career" className="hover:text-white transition-colors">Career Guidance</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 CodeCampus AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
