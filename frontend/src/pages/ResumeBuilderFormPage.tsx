import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Header from '../components/Header'
import MultiStepResumeBuilder from '../components/MultiStepResumeBuilder'

export default function ResumeBuilderFormPage() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Get selected template from navigation state
  const selectedTemplate = (location.state as any)?.selectedTemplate || 'modern'

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Header />
      
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={() => navigate('/career/resume-templates')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Change Template
        </button>
      </div>

      {/* Resume Builder Form */}
      <div className="w-full px-4 md:px-6 pb-4">
        <MultiStepResumeBuilder />
      </div>
    </div>
  )
}
