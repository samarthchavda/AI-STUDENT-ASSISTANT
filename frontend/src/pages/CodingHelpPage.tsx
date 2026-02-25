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
      <Header />

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
                {/* Code Explanation/Debug/Optimize Result */}
                {(selectedTab === 'explain' || selectedTab === 'debug') && result.result && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <p className="font-semibold text-blue-900">
                        Task: {result.task?.charAt(0).toUpperCase() + result.task?.slice(1)}
                      </p>
                      <p className="text-sm text-blue-700">Language: {result.language}</p>
                    </div>
                    <div className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-sm leading-relaxed">
                      {result.result}
                    </div>
                    {result.suggestions && result.suggestions.length > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="font-semibold text-green-900 mb-2">💡 Suggestions:</p>
                        <ul className="list-disc list-inside text-green-800 space-y-1">
                          {result.suggestions.map((suggestion: string, idx: number) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {/* DSA Solution Result */}
                {selectedTab === 'dsa' && result.solution && (
                  <div className="space-y-4">
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                      <p className="font-semibold text-purple-900">💡 Complete DSA Solution</p>
                      <p className="text-sm text-purple-700">Problem: {result.problem}</p>
                    </div>
                    <div className="prose prose-sm max-w-none bg-white p-6 rounded-lg border">
                      <div 
                        className="whitespace-pre-wrap leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: result.solution
                            .replace(/```python\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto"><code>$1</code></pre>')
                            .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto"><code>$1</code></pre>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
                            .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h3>')
                            .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h2>')
                            .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
                            .replace(/^\- (.*$)/gm, '<li class="ml-4">$1</li>')
                            .replace(/^\* (.*$)/gm, '<li class="ml-4">$1</li>')
                            .replace(/\n\n/g, '<br/><br/>')
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Project Guidance Result */}
                {selectedTab === 'project' && result.guidance && (
                  <div className="space-y-4">
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                      <p className="font-semibold text-orange-900">🚀 Project: {result.projectType}</p>
                      <p className="text-sm text-orange-700">Tech Stack: {result.techStack?.join(', ')}</p>
                      <p className="text-sm text-orange-700">Estimated Time: {result.estimatedTime}</p>
                    </div>
                    <div className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-sm leading-relaxed">
                      {result.guidance}
                    </div>
                  </div>
                )}
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
