import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, FileText, Upload, X, Sparkles, FileSearch, Loader2, CheckCircle2 } from 'lucide-react';
import { careerAPI } from '../api/client';
import Header from '../components/Header';
import MultiStepResumeBuilder from '../components/MultiStepResumeBuilder';

export default function CareerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState<'resume' | 'builder'>(
    location.pathname.includes('/resume-builder') ? 'builder' : 'resume'
  );
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [resumeTemplate, setResumeTemplate] = useState<'classic' | 'modern' | 'minimal'>('modern');
  const [resumeText, setResumeText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'text' | 'pdf'>('pdf');
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  useEffect(() => {
    if (location.pathname.includes('/resume-builder')) {
      setSelectedTab('builder');
    } else {
      setSelectedTab('resume');
    }
  }, [location.pathname])

  const handleTabChange = (tab: 'resume' | 'builder') => {
    setSelectedTab(tab);
    navigate(tab === 'builder' ? '/career/resume-builder' : '/career/resume-analysis');
  }

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
        response = await careerAPI.uploadResume(formData, targetRole, jobDescription)
      } else {
        // Analyze text
        response = await careerAPI.analyzeResume(resumeText, targetRole, jobDescription)
      }
      setResult(response.data)

      const atsScore = Number(response.data?.atsScore || 0)
      if (atsScore > 0) {
        localStorage.setItem('latest_resume_ats_score', String(atsScore))
      }
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.response?.data?.detail || 'Error analyzing resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadUpdatedResume = async () => {
    setPdfLoading(true)
    try {
      let response

      if (uploadMethod === 'pdf' && result?.extractedText) {
        response = await careerAPI.generateResumePDF(result.extractedText, resumeTemplate)
      } else if (uploadMethod === 'pdf' && uploadedFile) {
        const formData = new FormData()
        formData.append('file', uploadedFile)
        response = await careerAPI.generateResumePDFFromUpload(formData, resumeTemplate)
      } else if (resumeText.trim()) {
        response = await careerAPI.generateResumePDF(resumeText, resumeTemplate)
      } else {
        alert('Please analyze your resume first, then download updated PDF.')
        return
      }

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'updated_resume.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error('Error generating updated resume PDF:', error)
      alert(error.response?.data?.detail || 'Could not generate updated resume PDF. Please try again.')
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Header />

      <div className={`${selectedTab === 'builder' ? 'w-full px-4 md:px-6 py-4' : 'max-w-6xl mx-auto px-4 py-8'}`}>
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => handleTabChange('resume')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${selectedTab === 'resume'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-md'
              }`}
          >
            <FileText className="w-5 h-5" />
            Resume Analysis
          </button>
          <button
            onClick={() => handleTabChange('builder')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${selectedTab === 'builder'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-md'
              }`}
          >
            <Briefcase className="w-5 h-5" />
            Resume Builder
          </button>
        </div>

        {selectedTab === 'resume' ? (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="feature-card">
              <h2 className="text-2xl font-bold mb-6 gradient-text">
                {selectedTab === 'resume' ? '📄 Resume & ATS Analysis' : '✨ Build Professional Resume'}
              </h2>

              {selectedTab === 'resume' && (
                <div className="space-y-4">
                  {/* Target Role & JD */}
                  <div className="space-y-3 rounded-xl border border-teal-200 bg-teal-50/60 p-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Target Job Role</label>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g., Frontend Developer, Data Analyst"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Paste Job Description (JD){' '}
                        <span className="font-normal text-gray-400">— optional</span>
                      </label>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description here to get a more accurate ATS match score..."
                        rows={3}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
                      />
                    </div>
                    <p className="text-xs text-teal-700 flex items-start gap-1">
                      <span>💡</span>
                      <span>ATS scoring works best when matched against a specific job description.</span>
                    </p>
                  </div>

                  {/* Upload Method Toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setUploadMethod('pdf')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${uploadMethod === 'pdf'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      📄 Upload PDF
                    </button>
                    <button
                      onClick={() => setUploadMethod('text')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${uploadMethod === 'text'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                      <div className="border-2 border-dashed border-teal-300 rounded-2xl p-8 text-center hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-300 cursor-pointer">
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
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float shadow-xl">
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
                              className="inline-block cursor-pointer rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-emerald-600 hover:to-teal-700 transition-all"
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
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${(uploadMethod === 'pdf' ? !uploadedFile : !resumeText)
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:from-emerald-600 hover:to-teal-700'
                      }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Analyze Resume
                      </>
                    )}
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

              {selectedTab === 'builder' && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      Resume builder coming soon! For now, use our analysis tool to improve your existing resume.
                    </p>
                    <button
                      onClick={() => handleTabChange('resume')}
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
                  {selectedTab === 'resume' && (result.atsScore !== undefined || result.overallScore !== undefined) ? (
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

                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                        <p className="font-semibold text-emerald-900 mb-3">✅ Your Resume Strengths</p>
                        {result.strengths?.length > 0 ? (
                          <ul className="space-y-2">
                            {result.strengths.map((item: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-emerald-800">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-emerald-800">No strengths listed yet.</p>
                        )}
                      </div>

                      <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
                        <p className="font-semibold text-rose-900 mb-3">🔎 Missing Keywords</p>
                        {result.missingKeywords?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {result.missingKeywords.map((keyword: string, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-full bg-white border border-rose-200 px-3 py-1 text-xs font-medium text-rose-700"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-rose-800">No missing keywords identified.</p>
                        )}
                      </div>

                      <div className="bg-gray-50 border rounded-lg p-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Resume Design Template</label>
                        <select
                          value={resumeTemplate}
                          onChange={(e) => setResumeTemplate(e.target.value as 'classic' | 'modern' | 'minimal')}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="classic">Classic</option>
                          <option value="modern">Modern</option>
                          <option value="minimal">Minimal</option>
                        </select>
                      </div>

                      <button
                        onClick={handleDownloadUpdatedResume}
                        disabled={pdfLoading || (uploadMethod === 'pdf' ? !uploadedFile : !resumeText.trim())}
                        className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all disabled:opacity-50"
                      >
                        {pdfLoading ? 'Generating Updated PDF...' : 'Download Updated Resume PDF'}
                      </button>

                      {(result.missingInResume?.length > 0 || result.suggestedChanges?.length > 0) && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                            <p className="font-semibold text-amber-900 mb-3">🧩 What is missing in your resume</p>
                            {result.missingInResume?.length > 0 ? (
                              <ul className="list-disc list-inside space-y-2 text-amber-800 text-sm">
                                {result.missingInResume.map((item: string, idx: number) => (
                                  <li key={idx} className="ml-1">{item}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-amber-800">No major structural section is missing. Focus on improving quality and impact.</p>
                            )}
                          </div>

                          <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4 rounded">
                            <p className="font-semibold text-cyan-900 mb-3">🛠️ Changes to make now</p>
                            {result.suggestedChanges?.length > 0 ? (
                              <ul className="list-disc list-inside space-y-2 text-cyan-800 text-sm">
                                {result.suggestedChanges.map((item: string, idx: number) => (
                                  <li key={idx} className="ml-1">{item}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-cyan-800">Add quantified achievements, stronger action verbs, and role-specific keywords.</p>
                            )}
                          </div>
                        </div>
                      )}

                      {result.companyFit && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="font-semibold text-gray-900 mb-3">🏢 Company Fit Analysis:</p>
                          <div className="space-y-2">
                            {Object.entries(result.companyFit).map(([company, fit]) => (
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

                  {/* Resume Builder (Coming Soon) */}
                  {selectedTab === 'builder' ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Resume builder feature coming soon!</p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <FileSearch className="h-16 w-16 text-gray-200" />
                  <div>
                    <p className="text-lg font-bold text-gray-600">Awaiting Your Resume</p>
                    <p className="mt-1 max-w-xs text-sm text-gray-400 leading-relaxed">
                      Upload your resume and enter a target role to get your ATS match score and actionable AI feedback.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <MultiStepResumeBuilder />
        )}

        {selectedTab === 'resume' && (
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
        )}
      </div>
    </div>
  )
}
