import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, FileText, Upload, X, Sparkles, FileSearch, Loader2, CheckCircle2 } from 'lucide-react';
import { careerAPI } from '../api/client';
import Header from '../components/Header';
import MultiStepResumeBuilder from '../components/MultiStepResumeBuilder';

export default function CareerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // FIXED: Explicitly defined types to avoid 'overlap' error
  const [selectedTab, setSelectedTab] = useState<'resume' | 'builder'>(
    location.pathname.includes('/resume-builder') ? 'builder' : 'resume'
  );

  const [resumeText, setResumeText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'text' | 'pdf'>('pdf');
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [resumeTemplate, setResumeTemplate] = useState<'classic' | 'modern' | 'minimal'>('classic');

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
    setPdfLoading(true);
    try {
      let response;
      if (uploadMethod === 'pdf' && result?.extractedText) {
        response = await careerAPI.generateResumePDF(result.extractedText, resumeTemplate);
      } else if (uploadMethod === 'pdf' && uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        response = await careerAPI.generateResumePDFFromUpload(formData, resumeTemplate);
      } else if (resumeText.trim()) {
        response = await careerAPI.generateResumePDF(resumeText, resumeTemplate);
      } else {
        alert('Analyze resume first.');
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
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Header />
      <div className={`${selectedTab === 'builder' ? 'w-full px-4 md:px-6 py-4' : 'max-w-6xl mx-auto px-4 py-8'}`}>
        {/* Tab Buttons */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => handleTabChange('resume')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              selectedTab === 'resume' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' : 'bg-white text-gray-700'
            }`}
          >
            <FileText className="w-5 h-5" /> Resume Analysis
          </button>
          <button
            onClick={() => handleTabChange('builder')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              selectedTab === 'builder' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' : 'bg-white text-gray-700'
            }`}
          >
            <Briefcase className="w-5 h-5" /> Resume Builder
          </button>
        </div>

        {selectedTab === 'resume' ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="feature-card bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
              <h2 className="text-2xl font-bold mb-6 gradient-text">📄 Resume & ATS Analysis</h2>
              <div className="space-y-4">
                <div className="space-y-3 rounded-xl border border-teal-200 bg-teal-50/60 p-4">
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="Target Job Role"
                    className="w-full rounded-lg border p-2 text-sm"
                  />
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste Job Description (Optional)"
                    rows={3}
                    className="w-full rounded-lg border p-2 text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setUploadMethod('pdf')} className={`flex-1 py-2 rounded-lg ${uploadMethod === 'pdf' ? 'bg-teal-600 text-white' : 'bg-gray-100'}`}>PDF</button>
                  <button onClick={() => setUploadMethod('text')} className={`flex-1 py-2 rounded-lg ${uploadMethod === 'text' ? 'bg-teal-600 text-white' : 'bg-gray-100'}`}>Text</button>
                </div>

                {uploadMethod === 'pdf' ? (
                  <div className="border-2 border-dashed border-teal-300 rounded-2xl p-8 text-center">
                    <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" id="resume-upload" />
                    <label htmlFor="resume-upload" className="cursor-pointer bg-teal-600 text-white px-4 py-2 rounded-lg">Choose PDF</label>
                    {uploadedFile && <p className="mt-2 text-sm text-gray-600">{uploadedFile.name}</p>}
                  </div>
                ) : (
                  <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={10} className="w-full border p-2 rounded-lg" />
                )}

                <button onClick={handleResumeAnalysis} disabled={loading} className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold">
                  {loading ? 'Analyzing...' : 'Analyze Resume'}
                </button>
              </div>
            </div>

            {/* Result Section */}
            <div className="card bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
              <h2 className="text-2xl font-bold mb-6">Results</h2>
              {result ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded text-center">
                      <p className="text-sm text-blue-700">ATS Score</p>
                      <p className="text-3xl font-bold text-blue-900">{result.atsScore}/100</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded text-center">
                      <p className="text-sm text-green-700">Overall</p>
                      <p className="text-3xl font-bold text-green-900">{result.overallScore}/100</p>
                    </div>
                  </div>
                  <button onClick={handleDownloadUpdatedResume} className="w-full bg-emerald-600 text-white py-2 rounded-lg">Download PDF</button>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <FileSearch className="mx-auto w-12 h-12 mb-2" />
                  <p>Awaiting Resume Upload</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <MultiStepResumeBuilder />
        )}
      </div>
    </div>
  );
}