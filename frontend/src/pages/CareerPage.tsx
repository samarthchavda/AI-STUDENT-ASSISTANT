import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, Briefcase, FileText, Users, Upload, X } from 'lucide-react'
import { careerAPI } from '../api/client'
import Header from '../components/Header'

export default function CareerPage() {
  const [selectedTab, setSelectedTab] = useState<'resume' | 'interview' | 'builder'>('resume')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const [resumeText, setResumeText] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadMethod, setUploadMethod] = useState<'text' | 'pdf'>('pdf')
  const [interviewForm, setInterviewForm] = useState({
    company: '',
    role: ''
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      setUploadedFile(file)
    }
  }

  const handleResumeAnalysis = async () => {
    setLoading(true)
    try {
      let response
      if (uploadMethod === 'pdf' && uploadedFile) {
        // Upload PDF
        const formData = new FormData()
        formData.append('file', uploadedFile)
        response = await careerAPI.uploadResume(formData)
      } else {
        // Analyze text
        response = await careerAPI.analyzeResume(resumeText)
      }
      setResult(response.data)
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.response?.data?.detail || 'Error analyzing resume. Please try again.')
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
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setSelectedTab('resume')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              selectedTab === 'resume' 
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:shadow-md'
            }`}
          >
            <FileText className="w-5 h-5" />
            Resume Analysis
          </button>
          <button
            onClick={() => setSelectedTab('interview')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              selectedTab === 'interview' 
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:shadow-md'
            }`}
          >
            <Users className="w-5 h-5" />
            Interview Prep
          </button>
          <button
            onClick={() => setSelectedTab('builder')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              selectedTab === 'builder' 
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:shadow-md'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            Resume Builder
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="feature-card">
            <h2 className="text-2xl font-bold mb-6 gradient-text">
              {selectedTab === 'resume' && '📄 Resume & ATS Analysis'}
              {selectedTab === 'interview' && '🎤 Interview Preparation'}
              {selectedTab === 'builder' && '✨ Build Professional Resume'}
            </h2>

            {selectedTab === 'resume' && (
              <div className="space-y-4">
                {/* Upload Method Toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setUploadMethod('pdf')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                      uploadMethod === 'pdf'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    📄 Upload PDF
                  </button>
                  <button
                    onClick={() => setUploadMethod('text')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                      uploadMethod === 'text'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    📝 Paste Text
                  </button>
                </div>

                {uploadMethod === 'pdf' ? (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Upload Resume PDF
                    </label>
                    <div className="border-2 border-dashed border-orange-300 rounded-2xl p-8 text-center hover:border-orange-500 hover:bg-orange-50/50 transition-all duration-300 cursor-pointer">
                      {uploadedFile ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center gap-3 text-green-600">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                              <FileText className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-lg">{uploadedFile.name}</p>
                              <p className="text-sm text-gray-500">
                                {(uploadedFile.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setUploadedFile(null)}
                            className="text-red-600 hover:text-red-700 flex items-center gap-2 mx-auto font-medium"
                          >
                            <X className="w-4 h-4" />
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float shadow-xl">
                            <Upload className="w-10 h-10 text-white" />
                          </div>
                          <p className="text-gray-700 mb-2 font-semibold text-lg">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            PDF only (Max 5MB)
                          </p>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="resume-upload"
                          />
                          <label
                            htmlFor="resume-upload"
                            className="inline-block btn-primary cursor-pointer"
                          >
                            Choose File
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Paste Your Resume Text
                    </label>
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume content here for ATS analysis..."
                      rows={12}
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                )}

                <button
                  onClick={handleResumeAnalysis}
                  disabled={loading || (uploadMethod === 'pdf' ? !uploadedFile : !resumeText)}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Analyze Resume'}
                </button>
                
                <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                  <strong>We check for:</strong>
                  <ul className="list-disc ml-5 mt-2">
                    <li>ATS compatibility score</li>
                    <li>Keywords optimization</li>
                    <li>Format & structure</li>
                    <li>Content quality</li>
                    <li>Missing sections</li>
                    <li>Company fit analysis</li>
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
                {/* Resume Analysis Result */}
                {selectedTab === 'resume' && result.analysis && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <p className="text-sm text-blue-700 mb-1">ATS Score</p>
                        <p className="text-3xl font-bold text-blue-900">{result.atsScore}/100</p>
                      </div>
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <p className="text-sm text-green-700 mb-1">Overall Score</p>
                        <p className="text-3xl font-bold text-green-900">{result.overallScore}/100</p>
                      </div>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                      <p className="font-semibold text-purple-900">📊 Placement Readiness: {result.placementReadiness}</p>
                    </div>
                    <div className="whitespace-pre-wrap bg-white p-6 rounded-lg border text-sm leading-relaxed">
                      {result.analysis}
                    </div>
                    {result.companyFit && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-semibold text-gray-900 mb-3">🏢 Company Fit Analysis:</p>
                        <div className="space-y-2">
                          {Object.entries(result.companyFit).map(([company, fit]: [string, any]) => (
                            <div key={company} className="flex justify-between items-center p-2 bg-white rounded">
                              <span className="font-medium">{company}</span>
                              <span className="text-sm text-gray-600">{fit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Interview Prep Result */}
                {selectedTab === 'interview' && result.preparation && (
                  <div className="space-y-4">
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                      <p className="font-semibold text-orange-900">🎤 Interview Prep: {result.company} - {result.role}</p>
                    </div>
                    <div className="whitespace-pre-wrap bg-white p-6 rounded-lg border text-sm leading-relaxed">
                      {result.preparation}
                    </div>
                    {result.commonQuestions && result.commonQuestions.length > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="font-semibold text-blue-900 mb-3">❓ Common Questions:</p>
                        <ol className="list-decimal list-inside space-y-2 text-blue-800">
                          {result.commonQuestions.map((q: string, idx: number) => (
                            <li key={idx} className="ml-2">{q}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Resume Builder (Coming Soon) */}
                {selectedTab === 'builder' && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Resume builder feature coming soon!</p>
                  </div>
                )}
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
