import { useState, useEffect } from 'react'
import { Upload, Download, FileText, AlertCircle, CheckCircle, Code2 } from 'lucide-react'
import Header from '../../components/Header'

interface DSAQuestion {
  id: number
  slug: string
  title: string
  difficulty: string
  topic: string
  companies: string[]
  acceptance: number
}

export default function DSAQuestionsAdminPage() {
  const [questions, setQuestions] = useState<DSAQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    topics: [] as { topic: string; count: number }[]
  })

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/dsa-questions`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (res.ok) {
        const data = await res.json()
        setQuestions(data.questions || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('Failed to load questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0])
      setMessage(null)
    }
  }

  const handleUpload = async () => {
    if (!uploadFile) {
      setMessage({ type: 'error', text: 'Please select a file first' })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', uploadFile)

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/dsa-questions/bulk-upload`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        }
      )

      if (res.ok) {
        const result = await res.json()
        setMessage({ 
          type: 'success', 
          text: `Successfully uploaded ${result.added || 0} questions!` 
        })
        setUploadFile(null)
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        // Reload questions
        setTimeout(() => loadQuestions(), 1000)
      } else {
        const error = await res.json()
        setMessage({ type: 'error', text: error.detail || 'Upload failed' })
      }
    } catch (error) {
      console.error('Upload error:', error)
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' })
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    const template = `slug,title,difficulty,topic,companies,description,examples,constraints,acceptance
two-sum,Two Sum,Easy,Arrays,"Amazon,Google,Microsoft","Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.","[{""input"":""nums = [2,7,11,15], target = 9"",""output"":""[0,1]""}]","[""2 <= nums.length <= 10^4""]",49.2
reverse-string,Reverse String,Easy,Strings,"TCS,Infosys","Write a function that reverses a string.","[{""input"":""s = ['h','e','l','l','o']"",""output"":""['o','l','l','e','h']""}]","[""1 <= s.length <= 10^5""]",78.5`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dsa_questions_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DSA Questions Management</h1>
          <p className="text-gray-600">Manage coding questions for DSA practice section</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <div className="text-2xl font-bold text-green-700">{stats.easy}</div>
            <div className="text-sm text-green-600">Easy</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{stats.medium}</div>
            <div className="text-sm text-yellow-600">Medium</div>
          </div>
          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <div className="text-2xl font-bold text-red-700">{stats.hard}</div>
            <div className="text-sm text-red-600">Hard</div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-6 h-6 text-blue-600" />
            Bulk Upload Questions
          </h2>

          {message && (
            <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : message.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Form */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload CSV File
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
              />
              {uploadFile && (
                <div className="text-sm text-gray-600 mb-4">
                  Selected: {uploadFile.name}
                </div>
              )}
              <button
                onClick={handleUpload}
                disabled={!uploadFile || uploading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Questions
                  </>
                )}
              </button>
            </div>

            {/* Template Download */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                CSV Format
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Download the template to see the required format
              </p>
              <button
                onClick={downloadTemplate}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
            </div>
          </div>
        </div>

        {/* Format Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            CSV Format Requirements
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Required columns:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code className="bg-blue-100 px-2 py-0.5 rounded">slug</code> - Unique identifier (e.g., "two-sum")</li>
              <li><code className="bg-blue-100 px-2 py-0.5 rounded">title</code> - Question title (e.g., "Two Sum")</li>
              <li><code className="bg-blue-100 px-2 py-0.5 rounded">difficulty</code> - Easy, Medium, or Hard</li>
              <li><code className="bg-blue-100 px-2 py-0.5 rounded">topic</code> - Arrays, Strings, Trees, etc.</li>
              <li><code className="bg-blue-100 px-2 py-0.5 rounded">companies</code> - Comma-separated in quotes (e.g., "Amazon,Google")</li>
              <li><code className="bg-blue-100 px-2 py-0.5 rounded">description</code> - Problem description</li>
              <li><code className="bg-blue-100 px-2 py-0.5 rounded">examples</code> - JSON array of examples</li>
              <li><code className="bg-blue-100 px-2 py-0.5 rounded">constraints</code> - JSON array of constraints</li>
              <li><code className="bg-blue-100 px-2 py-0.5 rounded">acceptance</code> - Acceptance rate (e.g., 49.2)</li>
            </ul>
            <p className="mt-3"><strong>Note:</strong> Download the template for the exact format with examples</p>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Code2 className="w-6 h-6 text-purple-600" />
              Questions Database ({stats.total})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading questions...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Title</th>
                    <th className="text-center py-3 px-6 font-semibold text-gray-700">Difficulty</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Topic</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Companies</th>
                    <th className="text-center py-3 px-6 font-semibold text-gray-700">Acceptance</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-500">
                        No questions found. Upload a CSV file to add questions.
                      </td>
                    </tr>
                  ) : (
                    questions.slice(0, 50).map((q) => (
                      <tr key={q.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-6">
                          <div className="font-semibold text-gray-900">{q.title}</div>
                          <div className="text-xs text-gray-500">{q.slug}</div>
                        </td>
                        <td className="py-3 px-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            q.difficulty === 'Easy' 
                              ? 'bg-green-100 text-green-700'
                              : q.difficulty === 'Medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-gray-700">{q.topic}</td>
                        <td className="py-3 px-6">
                          <div className="flex flex-wrap gap-1">
                            {q.companies.slice(0, 3).map((company, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                {company}
                              </span>
                            ))}
                            {q.companies.length > 3 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                +{q.companies.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-6 text-center text-gray-700">{q.acceptance}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {questions.length > 50 && (
                <div className="p-4 text-center text-sm text-gray-500 border-t border-gray-200">
                  Showing first 50 of {questions.length} questions
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
