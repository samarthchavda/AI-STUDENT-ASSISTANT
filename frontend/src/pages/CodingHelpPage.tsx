import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, Code, Bug, Lightbulb, Rocket } from 'lucide-react'
import { codingAPI } from '../api/client'
import Header from '../components/Header'

export default function CodingHelpPage() {
  const [selectedTab, setSelectedTab] = useState<'explain' | 'debug' | 'dsa' | 'project'>('explain')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const [codeForm, setCodeForm] = useState({
    code: '',
    language: 'python',
    task: 'explain' as 'explain' | 'debug' | 'optimize'
  })

  const [dsaProblem, setDsaProblem] = useState('')
  const [projectForm, setProjectForm] = useState({
    projectType: '',
    techStack: ''
  })

  const handleCodeHelp = async () => {
    setLoading(true)
    try {
      const response = await codingAPI.explainCode(codeForm)
      setResult(response.data)
    } catch (error) {
      console.error('Error:', error)
      alert('Error processing code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDSA = async () => {
    setLoading(true)
    try {
      const response = await codingAPI.dsaHint(dsaProblem)
      setResult(response.data)
    } catch (error) {
      console.error('Error:', error)
      alert('Error getting DSA hint. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleProject = async () => {
    setLoading(true)
    try {
      const techStack = projectForm.techStack.split(',').map(s => s.trim())
      const response = await codingAPI.projectGuidance(projectForm.projectType, techStack)
      setResult(response.data)
    } catch (error) {
      console.error('Error:', error)
      alert('Error getting project guidance. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Header title="Coding Helper" subtitle="Your AI coding companion" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setSelectedTab('explain')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
              selectedTab === 'explain' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            <Code className="w-5 h-5" />
            Code Explanation
          </button>
          <button
            onClick={() => setSelectedTab('debug')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
              selectedTab === 'debug' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            <Bug className="w-5 h-5" />
            Debug Help
          </button>
          <button
            onClick={() => setSelectedTab('dsa')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
              selectedTab === 'dsa' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            <Lightbulb className="w-5 h-5" />
            DSA Practice
          </button>
          <button
            onClick={() => setSelectedTab('project')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
              selectedTab === 'project' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            <Rocket className="w-5 h-5" />
            Project Guide
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">
              {selectedTab === 'explain' && 'Code Explanation & Debug'}
              {selectedTab === 'debug' && 'Debug Your Code'}
              {selectedTab === 'dsa' && 'DSA Problem Help'}
              {selectedTab === 'project' && 'Project Guidance'}
            </h2>

            {(selectedTab === 'explain' || selectedTab === 'debug') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    value={codeForm.language}
                    onChange={(e) => setCodeForm({ ...codeForm, language: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Task</label>
                  <select
                    value={codeForm.task}
                    onChange={(e) => setCodeForm({ ...codeForm, task: e.target.value as any })}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    <option value="explain">Explain Code</option>
                    <option value="debug">Debug Code</option>
                    <option value="optimize">Optimize Code</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Code</label>
                  <textarea
                    value={codeForm.code}
                    onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value })}
                    placeholder="Paste your code here..."
                    rows={12}
                    className="w-full border rounded-lg px-4 py-2 font-mono text-sm"
                  />
                </div>
                <button
                  onClick={handleCodeHelp}
                  disabled={loading || !codeForm.code}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Analyze Code'}
                </button>
              </div>
            )}

            {selectedTab === 'dsa' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">DSA Problem</label>
                  <textarea
                    value={dsaProblem}
                    onChange={(e) => setDsaProblem(e.target.value)}
                    placeholder="Describe your DSA problem or paste the problem statement..."
                    rows={12}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <button
                  onClick={handleDSA}
                  disabled={loading || !dsaProblem}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Getting Hint...' : 'Get Hint & Approach'}
                </button>
              </div>
            )}

            {selectedTab === 'project' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Type</label>
                  <input
                    type="text"
                    value={projectForm.projectType}
                    onChange={(e) => setProjectForm({ ...projectForm, projectType: e.target.value })}
                    placeholder="e.g., E-commerce Website, Chat App"
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    value={projectForm.techStack}
                    onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
                    placeholder="React, Node.js, MongoDB"
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <button
                  onClick={handleProject}
                  disabled={loading || !projectForm.projectType}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Get Project Guidance'}
                </button>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Output</h2>
            {result ? (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Submit your code or problem to see AI-generated help here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
