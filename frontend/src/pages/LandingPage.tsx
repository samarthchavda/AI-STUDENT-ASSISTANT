import { Link } from 'react-router-dom'
import { Brain, ArrowRight, MessageSquare, FileText, BarChart3, Star } from 'lucide-react'
import Footer from '../components/Footer'

const features = [
  {
    title: 'AI Interviewer',
    description: 'Real-time HR & Tech mock interviews',
    icon: MessageSquare,
  },
  {
    title: 'Official Pattern Tests',
    description: 'TCS, Amazon, Infosys simulators',
    icon: BarChart3,
  },
  {
    title: 'Resume Analyzer',
    description: 'Instant ATS scoring and rewriting',
    icon: FileText,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_45%),radial-gradient(circle_at_80%_10%,_rgba(168,85,247,0.12),_transparent_40%)]" />

      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <div className="rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 p-2 text-white shadow-lg">
              <Brain className="h-5 w-5" />
            </div>
            <span className="text-base sm:text-lg">CodeCampus AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto flex max-w-5xl flex-col items-center px-4 pb-16 pt-20 text-center sm:px-6 lg:px-8 lg:pt-28">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-4 py-1 text-xs font-semibold tracking-wide text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
            ✨ Powered by Advanced AI
          </span>

          <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your Ultimate AI Co-Pilot for Campus Placements.
          </h1>

          <p className="mt-6 max-w-3xl text-pretty text-base text-slate-600 sm:text-lg dark:text-slate-300">
            Master DSA, practice company-specific mock tests, and get your resume ATS-ready in seconds.
            Join thousands of engineers getting placed.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:scale-[1.01]"
            >
              Start Preparing for Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/services"
              className="rounded-2xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              View Company Questions
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
                >
                  <div className="mb-4 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800">
                    <Icon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-16 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Trusted by students from top engineering colleges.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
            <span className="ml-2 text-sm font-semibold text-slate-700 dark:text-slate-200">4.9/5 from 2,500+ learners</span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
