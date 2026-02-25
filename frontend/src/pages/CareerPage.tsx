import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, Briefcase, FileText, Users } from 'lucide-react'
import { careerAPI } from '../api/client'

export default function CareerPage() {
  const [selectedTab, setSelectedTab] = useState<'resume' | 'interview' | 'builder'>('resume')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const [resumeText, setResumeText] = useState('')
  const [interviewForm, setInterviewForm] = useState({
    company: '',
    role: ''
  })

  const handleResumeAnalysis = async () => {
    setLoading(true)
    try {
      const response = await careerAPI.analyzeResume(resumeText)
      setResult(response.data)
    } catch (error) {
      console.error('Error:', error)
      alert('Error analyzing resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInterviewPrep = async () => {
    setLoading(true)
    try {
      const response = await careerAPI.interviewPrep(interviewForm.company, interviewForm.role)
      setResult(response.data)
    } catch (error) {
      console.error('Error:', error)
      alert('Error generating interview prep. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Home className="w-6 h-6 text-gray-600 hover:text-primary-600" />
            </Link>
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <Briefcase className="w-8 h-8 text-orange-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Career Assistant</h1>
              <p className="text-sm text-gray-500">Land your dream job</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setSelectedTab('resume')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
              selectedTab === 'resume' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            Resume Analysis
          </button>
          <button
            onClick={() => setSelectedTab('interview')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
              selectedTab === 'interview' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            <Users className="w-5 h-5" />
            Interview Prep
          </button>
          <button
            onClick={() => setSelectedTab('builder')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
              selectedTab === 'builder' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            Resume Builder
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">
              {selectedTab === 'resume' && 'Resume & ATS Analysis'}
              {selectedTab === 'interview' && 'Interview Preparation'}
              {selectedTab === 'builder' && 'Build Professional Resume'}
            </h2>

            {selectedTab === 'resume' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Paste Your Resume Text
                  </label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume content here for ATS analysis..."
                    rows={16}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <button
                  onClick={handleResumeAnalysis}
                  disabled={loading || !resumeText}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Analyze Resume'}
                </button>
                <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                  <strong>We check for:</strong>
                  <ul className="list-disc ml-5 mt-2">
                    <li>ATS compatibility</li>
                    <li>Keywords optimization</li>
                    <li>Format & structure</li>
                    <li>Content quality</li>
                    <li>Missing sections</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedTab === 'interview' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name</label>
                  <input
                    type="text"
                    value={interviewForm.company}
                    onChange={(e) => setInterviewForm({ ...interviewForm, company: e.target.value })}
                    placeholder="e.g., Google, TCS, Infosys"
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <input
                    type="text"
                    value={interviewForm.role}
                    onChange={(e) => setInterviewForm({ ...interviewForm, role: e.target.value })}
                    placeholder="e.g., Software Engineer, Data Analyst"
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <button
                  onClick={handleInterviewPrep}
                  disabled={loading || !interviewForm.company || !interviewForm.role}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Get Interview Prep'}
                </button>
                <div className="text-sm text-gray-600 bg-purple-50 p-4 rounded-lg">
                  <strong>You'll get:</strong>
                  <ul className="list-disc ml-5 mt-2">
                    <li>Common interview questions</li>
                    <li>Company-specific tips</li>
                    <li>Technical topics to prepare</li>
                    <li>Behavioral questions</li>
                    <li>Salary negotiation tips</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedTab === 'builder' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Resume builder coming soon! For now, use our analysis tool to improve your existing resume.
                  </p>
                  <button
                    onClick={() => setSelectedTab('resume')}
                    className="btn-primary"
                  >
                    Go to Resume Analysis
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Results</h2>
            {result ? (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Submit your information to see AI-powered career guidance
              </div>
            )}
          </div>
        </div>

        {/* Popular Companies */}
        <div className="mt-12 card">
          <h3 className="text-xl font-bold mb-6">Popular Companies We Help You Prepare For</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant'].map((company) => (
              <div key={company} className="border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <strong>{company}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
