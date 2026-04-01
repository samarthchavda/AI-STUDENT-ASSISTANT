import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, FileSearch, CheckCircle2, AlertTriangle, Sparkles, Download } from 'lucide-react';
import { careerAPI } from '../../api/client';
import Header from '../../components/Header';

interface ResumeAnalysisResult {
  atsScore?: number
  overallScore?: number
  strengths?: string[]
  missingInResume?: string[]
  suggestedChanges?: string[]
  missingKeywords?: string[]
  companyFit?: Record<string, string>
  extractedText?: string
}

export default function CareerPage() {
  const navigate = useNavigate();
  
  // Only show Resume Analysis tab (remove builder tab)
  const [resumeText, setResumeText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'text' | 'pdf'>('pdf');
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [analysisSourceText, setAnalysisSourceText] = useState('');
  const [resumeTemplate] = useState<'classic' | 'modern' | 'minimal'>('classic');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleResumeAnalysis = async () => {
    setLoading(true);
    try {
      let response;
      if (uploadMethod === 'pdf' && uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        response = await careerAPI.uploadResume(formData, targetRole, jobDescription);
      } else {
        response = await careerAPI.analyzeResume(resumeText, targetRole, jobDescription);
      }
      setResult(response.data);
      const extracted = String(response.data?.extractedText || '').trim();
      const sourceForDownload = uploadMethod === 'pdf' ? extracted : resumeText.trim();
      setAnalysisSourceText(sourceForDownload);
      const atsScore = Number(response.data?.atsScore || 0);
      if (atsScore > 0) {
        localStorage.setItem('latest_resume_ats_score', String(atsScore));
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.response?.data?.detail || 'Error analyzing resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadUpdatedResume = async () => {
    try {
      setDownloading(true);
      let response;

      const sourceText = String(result?.extractedText || analysisSourceText || resumeText || '').trim();

      if (sourceText.length >= 40) {
        response = await careerAPI.generateResumePDF(sourceText, resumeTemplate);
      } else if (uploadMethod === 'pdf' && uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        response = await careerAPI.generateResumePDFFromUpload(formData, resumeTemplate);
      } else {
        alert('Analyze resume first, then download updated PDF.');
        return;
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'updated_resume.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error:', error);
      try {
        if (error?.response?.data instanceof Blob) {
          const blobText = await error.response.data.text();
          const parsed = JSON.parse(blobText);
          alert(parsed?.detail || 'Failed to download updated resume PDF.');
          return;
        }
      } catch {
      }
      alert(error?.response?.data?.detail || 'Failed to download updated resume PDF.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Build an ATS-Ready Resume</h1>
          <p className="text-gray-600 text-lg">Analyze your resume and get actionable insights to land your dream job</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8 border-b border-gray-200">
          <button
            className="flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-2 border-emerald-500 text-emerald-600"
          >
            <FileText className="w-5 h-5" /> Resume Analysis
          </button>
          <button
            onClick={() => navigate('/career/resume-templates')}
            className="flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
          >
            <Briefcase className="w-5 h-5" /> Resume Builder
          </button>
        </div>

        {/* 2-Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 h-fit">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Upload Your Resume</h2>
              <div className="space-y-5">
                {/* Target Role & Job Description */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Job Role</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g., Software Engineer, Product Manager"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description (Optional)</label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description to get tailored feedback..."
                      rows={4}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Upload Method Toggle */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Upload Method</label>
                  <div className="inline-flex rounded-xl border border-gray-300 p-1 bg-gray-50">
                    <button 
                      onClick={() => setUploadMethod('pdf')} 
                      className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${uploadMethod === 'pdf' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      PDF Upload
                    </button>
                    <button 
                      onClick={() => setUploadMethod('text')} 
                      className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${uploadMethod === 'text' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Text Input
                    </button>
                  </div>
                </div>

                {/* Upload Area */}
                {uploadMethod === 'pdf' ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group">
                    <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" id="resume-upload" />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                          <FileText className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-900 mb-1">Upload your resume PDF</p>
                          <p className="text-sm text-gray-500">PDF format, max 5MB</p>
                        </div>
                        <div className="mt-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
                          Choose File
                        </div>
                      </div>
                    </label>
                    {uploadedFile && (
                      <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-medium">
                        <FileText className="w-4 h-4" />
                        {uploadedFile.name}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Resume Content</label>
                    <textarea 
                      value={resumeText} 
                      onChange={(e) => setResumeText(e.target.value)} 
                      rows={12} 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none font-mono" 
                      placeholder="Paste your resume content here..."
                    />
                  </div>
                )}

                {/* Analyze Button */}
                <button 
                  onClick={handleResumeAnalysis} 
                  disabled={loading} 
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze Resume
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 lg:sticky lg:top-24 h-fit max-h-[calc(100vh-120px)] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Analysis Results</h2>
              {result ? (
                <div className="space-y-6">
                  {/* Score Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl text-center border border-blue-200">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">ATS Score</p>
                      <p className="text-5xl font-black text-blue-900">{result.atsScore}</p>
                      <p className="text-xs text-blue-700 mt-1">out of 100</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl text-center border border-emerald-200">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Overall</p>
                      <p className="text-5xl font-black text-emerald-900">{result.overallScore}</p>
                      <p className="text-xs text-emerald-700 mt-1">out of 100</p>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="font-bold text-emerald-900">Strengths</p>
                    </div>
                    {result.strengths && result.strengths.length > 0 ? (
                      <ul className="space-y-2">
                        {result.strengths.map((item, index) => (
                          <li key={`strength-${index}`} className="flex items-start gap-2 text-sm text-emerald-900">
                            <span className="text-emerald-500 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-emerald-700">No strengths identified</p>
                    )}
                  </div>

                  {/* Missing in Resume */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      </div>
                      <p className="font-bold text-amber-900">Missing in Resume</p>
                    </div>
                    {result.missingInResume && result.missingInResume.length > 0 ? (
                      <ul className="space-y-2">
                        {result.missingInResume.map((item, index) => (
                          <li key={`missing-${index}`} className="flex items-start gap-2 text-sm text-amber-900">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-amber-700">No major gaps detected</p>
                    )}
                  </div>

                  {/* Suggested Changes */}
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-sky-600" />
                      </div>
                      <p className="font-bold text-sky-900">Suggested Improvements</p>
                    </div>
                    {result.suggestedChanges && result.suggestedChanges.length > 0 ? (
                      <ul className="space-y-2">
                        {result.suggestedChanges.map((item, index) => (
                          <li key={`change-${index}`} className="flex items-start gap-2 text-sm text-sky-900">
                            <span className="text-sky-500 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-sky-700">No suggestions available</p>
                    )}
                  </div>

                  {/* Missing Keywords */}
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                        <FileSearch className="w-5 h-5 text-violet-600" />
                      </div>
                      <p className="font-bold text-violet-900">Missing Keywords (ATS)</p>
                    </div>
                    {result.missingKeywords && result.missingKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.missingKeywords.map((keyword, index) => (
                          <span key={`keyword-${index}`} className="px-3 py-1.5 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold border border-violet-200">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-violet-700">All key terms present</p>
                    )}
                  </div>

                  {/* Company Fit */}
                  {result.companyFit && Object.keys(result.companyFit).length > 0 && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-slate-600" />
                        </div>
                        <p className="font-bold text-slate-900">Company Fit Analysis</p>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(result.companyFit).map(([companyType, fit]) => (
                          <div key={companyType} className="rounded-lg border border-slate-200 bg-white p-3">
                            <p className="text-sm font-semibold text-slate-900 mb-1">{companyType}</p>
                            <p className="text-sm text-slate-600">{fit}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Download Button */}
                  <button
                    onClick={handleDownloadUpdatedResume}
                    disabled={downloading}
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {downloading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Preparing PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download Updated Resume
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <FileSearch className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">No Analysis Yet</p>
                  <p className="text-sm text-gray-500 max-w-xs">Upload your resume to see detailed insights and recommendations</p>
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}