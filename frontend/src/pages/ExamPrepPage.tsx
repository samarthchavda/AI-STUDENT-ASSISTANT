import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, BookOpen, FileText, Calendar, Award } from 'lucide-react'
import { examAPI } from '../api/client'
import Header from '../components/Header'

export default function ExamPrepPage() {
  const [selectedTab, setSelectedTab] = useState<'mock' | 'pyq' | 'plan'>('mock')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  // Mock Test Form
  const [mockForm, setMockForm] = useState({
    subject: '',
    topic: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    numQuestions: 10
  })

  // PYQ Form
  const [pyqForm, setPyqForm] = useState({
    question: '',
    subject: ''
  })

  // Study Plan Form
  const [planForm, setPlanForm] = useState({
    examDate: '',
    subjects: [] as string[]
  })

  const handleMockTest = async () => {
    setLoading(true)
    try {
      const response = await examAPI.generateMockTest(mockForm)
      setResult(response.data)
    } catch (error) {
      console.error('Error generating mock test:', error)
      alert('Error generating mock test. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePYQ = async () => {
    setLoading(true)
    try {
      const response = await examAPI.solvePreviousYear(pyqForm.question, pyqForm.subject)
      setResult(response.data)
    } catch (error) {
      console.error('Error solving PYQ:', error)
      alert('Error solving question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStudyPlan = async () => {
    setLoading(true)
    try {
      const response = await examAPI.generateStudyPlan(planForm.examDate, planForm.subjects)
      setResult(response.data)
    } catch (error) {
      console.error('Error generating study plan:', error)
      alert('Error generating study plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header title="Exam Preparation" subtitle="Ace your exams with AI" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedTab('mock')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              selectedTab === 'mock'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Mock Tests
          </button>
          <button
            onClick={() => setSelectedTab('pyq')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              selectedTab === 'pyq'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            Previous Year Questions
          </button>
          <button
            onClick={() => setSelectedTab('plan')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              selectedTab === 'plan'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Study Plan
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">
              {selectedTab === 'mock' && 'Generate Mock Test'}
              {selectedTab === 'pyq' && 'Solve Previous Year Question'}
              {selectedTab === 'plan' && 'Create Study Plan'}
            </h2>

            {selectedTab === 'mock' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    value={mockForm.subject}
                    onChange={(e) => setMockForm({ ...mockForm, subject: e.target.value })}
                    placeholder="e.g., Physics, Mathematics"
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Topic</label>
                  <input
                    type="text"
                    value={mockForm.topic}
                    onChange={(e) => setMockForm({ ...mockForm, topic: e.target.value })}
                    placeholder="e.g., Thermodynamics, Calculus"
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={mockForm.difficulty}
                    onChange={(e) => setMockForm({ ...mockForm, difficulty: e.target.value as any })}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Questions</label>
                  <input
                    type="number"
                    value={mockForm.numQuestions}
                    onChange={(e) => setMockForm({ ...mockForm, numQuestions: parseInt(e.target.value) })}
                    min="5"
                    max="50"
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <button
                  onClick={handleMockTest}
                  disabled={loading || !mockForm.subject || !mockForm.topic}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Mock Test'}
                </button>
              </div>
            )}

            {selectedTab === 'pyq' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    value={pyqForm.subject}
                    onChange={(e) => setPyqForm({ ...pyqForm, subject: e.target.value })}
                    placeholder="e.g., Chemistry, Biology"
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Question</label>
                  <textarea
                    value={pyqForm.question}
                    onChange={(e) => setPyqForm({ ...pyqForm, question: e.target.value })}
                    placeholder="Paste your question here..."
                    rows={6}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <button
                  onClick={handlePYQ}
                  disabled={loading || !pyqForm.question}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Solving...' : 'Solve Question'}
                </button>
              </div>
            )}

            {selectedTab === 'plan' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Exam Date</label>
                  <input
                    type="date"
                    value={planForm.examDate}
                    onChange={(e) => setPlanForm({ ...planForm, examDate: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subjects (comma-separated)</label>
                  <input
                    type="text"
                    onChange={(e) => setPlanForm({ ...planForm, subjects: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="Physics, Chemistry, Mathematics"
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <button
                  onClick={handleStudyPlan}
                  disabled={loading || !planForm.examDate || planForm.subjects.length === 0}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Study Plan'}
                </button>
              </div>
            )}
          </div>

          {/* Result Display */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Result</h2>
            {result ? (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Fill out the form and click the button to see results here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
