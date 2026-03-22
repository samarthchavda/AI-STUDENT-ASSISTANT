import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, FileSearch } from 'lucide-react';
import { careerAPI } from '../api/client';
import Header from '../components/Header';

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

  useEffect(() => {
    if (location.pathname.includes('/resume-builder')) {
      setSelectedTab('builder');
    } else {
      setSelectedTab('resume');
    }
  }, [location.pathname]);

  const handleTabChange = (tab: 'resume' | 'builder') => {
    setSelectedTab(tab);
    navigate(tab === 'builder' ? '/career/resume-builder' : '/career/resume-analysis');
  };

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
          >
            <FileText className="w-5 h-5" /> Resume Analysis
          </button>
          <button
            onClick={() => navigate('/career/resume-templates')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all bg-white text-gray-700 shadow-sm hover:shadow-md"
          >
            <Briefcase className="w-5 h-5" /> Resume Builder
          </button>
        </div>

        {/* Resume Analysis Section */}
        <div className="grid md:grid-cols-2 gap-8">
            <div className="feature-card bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
              <h2 className="text-2xl font-bold mb-6 text-emerald-700">📄 Resume & ATS Analysis</h2>
              <div className="space-y-4">
                <div className="space-y-3 rounded-xl border border-teal-200 bg-teal-50/60 p-4">
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="Target Job Role"
                    className="w-full rounded-lg border p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste Job Description (Optional)"
                    rows={3}
                    className="w-full rounded-lg border p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setUploadMethod('pdf')} className={`flex-1 py-2 rounded-lg font-bold ${uploadMethod === 'pdf' ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>PDF</button>
                  <button onClick={() => setUploadMethod('text')} className={`flex-1 py-2 rounded-lg font-bold ${uploadMethod === 'text' ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>Text</button>
                </div>

                {uploadMethod === 'pdf' ? (
                  <div className="border-2 border-dashed border-teal-300 rounded-2xl p-8 text-center bg-slate-50 hover:bg-emerald-50/50 transition-colors">
                    <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" id="resume-upload" />
                    <label htmlFor="resume-upload" className="cursor-pointer bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold inline-block hover:bg-teal-700 transition-all">Choose PDF</label>
                    {uploadedFile && <p className="mt-3 text-sm font-semibold text-emerald-700">Selected: {uploadedFile.name}</p>}
                  </div>
                ) : (
                  <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={10} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Paste your resume content here..." />
                )}

                <button onClick={handleResumeAnalysis} disabled={loading} className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200/50 disabled:opacity-50">
                  {loading ? 'Analyzing...' : 'Analyze Resume'}
                </button>
              </div>
            </div>

            <div className="card bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 min-h-[400px]">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">Results</h2>
              {result ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-6 rounded-2xl text-center border border-blue-100">
                      <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">ATS Score</p>
                      <p className="text-4xl font-black text-blue-900">{result.atsScore}/100</p>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-2xl text-center border border-emerald-100">
                      <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Overall</p>
                      <p className="text-4xl font-black text-emerald-900">{result.overallScore}/100</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <p className="font-bold text-emerald-800 mb-2">✅ Strengths</p>
                      {result.strengths && result.strengths.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-sm text-emerald-900">
                          {result.strengths.map((item, index) => (
                            <li key={`strength-${index}`}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-emerald-900">No strengths returned from AI.</p>
                      )}
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <p className="font-bold text-amber-800 mb-2">⚠️ Missing In Resume</p>
                      {result.missingInResume && result.missingInResume.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-sm text-amber-900">
                          {result.missingInResume.map((item, index) => (
                            <li key={`missing-${index}`}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-amber-900">No major missing sections detected.</p>
                      )}
                    </div>

                    <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                      <p className="font-bold text-sky-800 mb-2">🛠️ Real Solutions (What to fix now)</p>
                      {result.suggestedChanges && result.suggestedChanges.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-sm text-sky-900">
                          {result.suggestedChanges.map((item, index) => (
                            <li key={`change-${index}`}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-sky-900">No suggestions returned from AI.</p>
                      )}
                    </div>

                    <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                      <p className="font-bold text-violet-800 mb-2">🔎 Missing Keywords (ATS)</p>
                      {result.missingKeywords && result.missingKeywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {result.missingKeywords.map((keyword, index) => (
                            <span key={`keyword-${index}`} className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-violet-900">No missing keywords identified.</p>
                      )}
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <p className="font-bold text-slate-800 mb-2">🏢 Company Fit Snapshot</p>
                      {result.companyFit && Object.keys(result.companyFit).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(result.companyFit).map(([companyType, fit]) => (
                            <div key={companyType} className="rounded-lg border border-slate-200 bg-white p-3">
                              <p className="text-sm font-semibold text-slate-700">{companyType}</p>
                              <p className="text-sm text-slate-600">{fit}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-600">Company fit analysis not available.</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadUpdatedResume}
                    disabled={downloading}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-60"
                  >
                    {downloading ? 'Preparing PDF...' : 'Download Updated Resume PDF'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-10 text-slate-400">
                  <FileSearch className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-medium">Awaiting Resume Upload</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}