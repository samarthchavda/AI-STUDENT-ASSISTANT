import { useNavigate } from "react-router-dom";
import {
  Bot,
  FileText,
  GraduationCap,
  Sparkles,
  Shield,
  BarChart2,
  Brain,
  Users,
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-teal-900 flex flex-col">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto w-full px-4 py-20 flex flex-col md:flex-row items-center gap-12">
        {/* Left: Headline & Buttons */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Crack Your Campus Placements <br />
            <span className="bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
              with AI
            </span>
          </h1>
          <p className="text-xl text-emerald-100 mb-8 max-w-xl">
            Your all-in-one AI co-pilot for Resume Building, Aptitude Prep, and 24/7 Career Guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:from-emerald-500 hover:to-teal-600 transition text-lg"
            >
              Start Prep
            </button>
            <button
              onClick={() => navigate("/career/resume-templates")}
              className="bg-white/10 border border-emerald-200 text-emerald-100 font-bold px-8 py-4 rounded-xl shadow hover:bg-white/20 transition text-lg backdrop-blur"
            >
              Try Resume Builder
            </button>
          </div>
        </div>
        {/* Right: Glassmorphism Dashboard Card */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-[340px] h-[420px] bg-white/10 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-lg flex flex-col items-center justify-center p-8 glass-card">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full px-6 py-2 text-white font-bold shadow-lg text-lg">
              Dashboard Preview
            </div>
            <div className="flex flex-col gap-6 mt-10 w-full">
              <div className="flex items-center gap-3 bg-white/20 rounded-xl p-4">
                <Bot className="w-7 h-7 text-emerald-400" />
                <div>
                  <div className="font-semibold text-white">AI Career Copilot</div>
                  <div className="text-emerald-100 text-sm">24/7 Chat for coding & placement</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/20 rounded-xl p-4">
                <FileText className="w-7 h-7 text-teal-300" />
                <div>
                  <div className="font-semibold text-white">Smart Resume Builder</div>
                  <div className="text-emerald-100 text-sm">ATS-friendly, live preview</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/20 rounded-xl p-4">
                <GraduationCap className="w-7 h-7 text-emerald-300" />
                <div>
                  <div className="font-semibold text-white">Aptitude Mastery</div>
                  <div className="text-emerald-100 text-sm">Quant, logical, verbal practice</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
              <span className="w-3 h-3 bg-teal-400 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="max-w-7xl mx-auto w-full px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-white mb-14">Everything You Need</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Bot className="w-8 h-8 text-emerald-400" />}
            title="AI Mock Interviews"
            desc="Practice with real company questions and get instant, actionable feedback from AI."
          />
          <FeatureCard
            icon={<FileText className="w-8 h-8 text-teal-300" />}
            title="ATS Optimization"
            desc="Build resumes that pass ATS checks and get personalized keyword suggestions."
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8 text-yellow-300" />}
            title="24/7 Career Copilot"
            desc="Ask any career, coding, or placement question and get answers instantly."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-pink-300" />}
            title="Secure & Private"
            desc="Your data is encrypted and never shared. 100% privacy for your career journey."
          />
        </div>
      </section>

      {/* The AI Difference */}
      <section className="w-full py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h3 className="text-3xl font-bold text-white mb-4">The AI Difference</h3>
            <p className="text-lg text-gray-200 mb-6">
              CodeCampus AI uses <span className="text-emerald-400 font-bold">Google Gemini AI</span> to provide real-time, personalized feedback on your resume, interview answers, and aptitude performance.
            </p>
            <ul className="space-y-3 text-gray-300">
              <li>• Real-time scoring and suggestions</li>
              <li>• Context-aware interview feedback</li>
              <li>• Adaptive learning for every student</li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-gradient-to-br from-emerald-700/60 to-teal-800/60 rounded-2xl p-8 shadow-2xl border border-emerald-900/30 w-full max-w-md">
              <Brain className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
              <div className="text-center text-emerald-100 text-xl font-semibold">
                Powered by <span className="text-emerald-400">Gemini AI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="w-full py-8 bg-gradient-to-r from-emerald-700 to-teal-800">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
          <Stat label="500+ Practice Questions" />
          <Stat label="10+ Resume Templates" />
          <Stat label="24/7 AI Availability" />
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="w-full py-4 bg-white border-t border-emerald-100">
        <div className="flex items-center justify-center gap-3 text-emerald-700 font-semibold text-lg">
          <Users className="w-6 h-6" />
          Join <span className="font-bold text-emerald-600">100+ Students</span> already using CodeCampus AI!
        </div>
      </section>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white/10 border border-emerald-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all flex flex-col items-center text-center backdrop-blur-lg">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-emerald-100 text-base">{desc}</p>
    </div>
  );
}

// Stat Bar Item
function Stat({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-xl border border-emerald-300 text-white font-semibold text-lg shadow">
      <BarChart2 className="w-6 h-6 text-emerald-300" />
      {label}
    </div>
  );
}