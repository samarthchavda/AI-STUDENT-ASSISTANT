import { useEffect, useState } from 'react'
import { Code, Bug, Lightbulb, Rocket, Terminal, Loader2, Clock3, ShieldAlert } from 'lucide-react'
import { codingAPI } from '../api/client'
import Header from '../components/Header'

const CODE_EXAMPLES = [
  {
    label: 'Two Sum (Python)',
    language: 'python',
    code: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Example usage
print(two_sum([2, 7, 11, 15], 9))  # Output: [0, 1]`,
  },
  {
    label: 'Binary Search (Java)',
    language: 'java',
    code: `public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11};
        System.out.println(binarySearch(arr, 7)); // Output: 3
    }
}`,
  },
]

export default function CodingHelpPage() {
  const [selectedTab, setSelectedTab] = useState<'explain' | 'debug' | 'dsa' | 'project' | 'challenge'>('explain')
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

  const [challengeProblem, setChallengeProblem] = useState<any>(null)
  const [challengeCode, setChallengeCode] = useState('')
  const [challengeLoading, setChallengeLoading] = useState(false)
  const [challengeSubmitting, setChallengeSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30 * 60)
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0)
  const [warningMessage, setWarningMessage] = useState('')
  const [isLocked, setIsLocked] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isDisqualified, setIsDisqualified] = useState(false)
  const [challengeResult, setChallengeResult] = useState<any>(null)
  const [rewardStatus, setRewardStatus] = useState('')
  const [solvedWithinTime, setSolvedWithinTime] = useState<number>(() => Number(localStorage.getItem('dsa_solved_within_time') || 0))

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const fetchChallengeProblem = async () => {
    setChallengeLoading(true)
    setWarningMessage('')
    try {
      const response = await codingAPI.getChallengeProblem()
      const problem = response.data
      setChallengeProblem(problem)
      setChallengeCode(problem?.starter_code || '')
      setTimeLeft(problem?.time_limit_seconds || 30 * 60)
      setTabSwitchWarnings(0)
      setIsLocked(false)
      setIsSubmitted(false)
      setIsDisqualified(false)
      setChallengeResult(null)
      setRewardStatus('')
    } catch (error) {
      console.error('Error fetching challenge problem:', error)
      setWarningMessage('Could not load challenge problem. Please try again.')
    } finally {
      setChallengeLoading(false)
    }
  }

  const handleChallengeSubmit = async (reason: 'manual' | 'timeout' | 'disqualified' = 'manual') => {
    if (!challengeProblem || isSubmitted) return

    setChallengeSubmitting(true)
    setIsSubmitted(true)
    setIsLocked(true)

    try {
      const response = await codingAPI.submitChallengeSolution({
        problem_id: challengeProblem.id,
        code: challengeCode,
        language: codeForm.language,
        submission_reason: reason,
        time_left_seconds: timeLeft,
        disqualified: reason === 'disqualified'
      })

      const data = response.data
      setChallengeResult(data)

      const solved = Boolean(data?.passed || data?.success)
      if (solved && reason !== 'timeout' && reason !== 'disqualified' && timeLeft > 0) {
        const updated = solvedWithinTime + 1
        setSolvedWithinTime(updated)
        localStorage.setItem('dsa_solved_within_time', String(updated))

        if (updated >= 5) {
          try {
            await codingAPI.grantFifteenDayReward({ solved_count: updated })
            setRewardStatus('🎉 Reward unlocked! Your plan expiry has been extended by 15 days.')
            localStorage.setItem('dsa_solved_within_time', '0')
            setSolvedWithinTime(0)
          } catch (rewardError) {
            console.error('Reward API error:', rewardError)
            setRewardStatus('Solved 5 challenges! Reward update is pending due to API error.')
          }
        }
      }
    } catch (error) {
      console.error('Error submitting challenge:', error)
      setWarningMessage('Auto-submit failed. Please try submitting again.')
      setIsSubmitted(false)
      setIsLocked(false)
    } finally {
      setChallengeSubmitting(false)
    }
  }

  useEffect(() => {
    if (selectedTab === 'challenge' && !challengeProblem && !challengeLoading) {
      fetchChallengeProblem()
    }
  }, [selectedTab])

  useEffect(() => {
    if (selectedTab !== 'challenge' || isLocked || isSubmitted) return

    if (timeLeft <= 0) {
      setIsLocked(true)
      setWarningMessage('⏰ Time is up! Your solution was auto-submitted.')
      handleChallengeSubmit('timeout')
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [selectedTab, timeLeft, isLocked, isSubmitted])

  useEffect(() => {
    if (selectedTab !== 'challenge' || isSubmitted || isDisqualified) return

    const handleTabSwitch = () => {
      const nextCount = tabSwitchWarnings + 1
      setTabSwitchWarnings(nextCount)

      if (nextCount >= 3) {
        setIsDisqualified(true)
        setIsLocked(true)
        setWarningMessage('❌ Disqualified due to 3 tab switches. Auto-failed.')
        handleChallengeSubmit('disqualified')
        return
      }

      setWarningMessage(`⚠️ Tab switch warning ${nextCount}/3. One more violation and you may be disqualified.`)
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        handleTabSwitch()
      }
    }

    const onWindowBlur = () => {
      handleTabSwitch()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('blur', onWindowBlur)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('blur', onWindowBlur)
    }
  }, [selectedTab, tabSwitchWarnings, isSubmitted, isDisqualified])

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
        {/* Senior Mentor Banner */}
        <div className="mb-8 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-white text-2xl shadow">
              👨‍💻
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-1">AI Coding Mentor</div>
              <h2 className="text-lg font-bold text-stone-900 mb-1">Senior Software Engineer Mode</h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                Act as a senior software engineer and coding mentor — explains problems step-by-step, provides optimized solutions, and breaks down time &amp; space complexity in simple terms.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white border border-green-200 px-3 py-1 text-xs font-medium text-green-700">✅ Code Explanation</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700">⚡ Optimization</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white border border-purple-200 px-3 py-1 text-xs font-medium text-purple-700">🎯 DSA Concepts</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white border border-orange-200 px-3 py-1 text-xs font-medium text-orange-700">🏢 Amazon &amp; Microsoft Ready</span>
              </div>
            </div>
          </div>
        </div>

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
          <button
            onClick={() => setSelectedTab('challenge')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
              selectedTab === 'challenge' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            <Clock3 className="w-5 h-5" />
            DSA Challenge
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">
              {selectedTab === 'explain' && 'Code Explanation & Debug'}
              {selectedTab === 'debug' && 'Debug Your Code'}
              {selectedTab === 'dsa' && 'DSA Problem Help'}
              {selectedTab === 'project' && 'Project Guidance'}
              {selectedTab === 'challenge' && '⏱️ Timed DSA Coding Challenge'}
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium">Code</label>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Or try an example:{' '}
                    {CODE_EXAMPLES.map((ex) => (
                      <button
                        key={ex.label}
                        type="button"
                        onClick={() => setCodeForm({ ...codeForm, code: ex.code, language: ex.language })}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 hover:bg-green-100 hover:text-green-800 transition-colors cursor-pointer mr-1"
                      >
                        {ex.label}
                      </button>
                    ))}
                  </p>
                  <textarea
                    value={codeForm.code}
                    onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value })}
                    placeholder="// Paste your code here..."
                    rows={14}
                    spellCheck={false}
                    className="w-full rounded-lg px-4 py-3 font-mono text-sm bg-gray-900 text-gray-100 placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y leading-relaxed"
                  />
                </div>
                <button
                  onClick={handleCodeHelp}
                  disabled={loading || !codeForm.code}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Code 🚀'
                  )}
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

            {selectedTab === 'challenge' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold">
                    <Clock3 className="w-4 h-4" />
                    Time Left: {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm text-amber-700">Warnings: {tabSwitchWarnings}/3</div>
                </div>

                {warningMessage && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    {warningMessage}
                  </div>
                )}

                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  ✅ Security: Copy, Paste, and Cut are disabled in the challenge editor.
                </div>

                {challengeLoading ? (
                  <div className="py-10 text-center text-gray-500">Loading challenge problem...</div>
                ) : challengeProblem ? (
                  <>
                    <div className="rounded-lg border bg-white p-4">
                      <p className="font-bold text-lg mb-2">{challengeProblem.title}</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">{challengeProblem.description}</p>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded border p-3 bg-gray-50">
                          <p className="font-semibold text-sm mb-2">Test Cases</p>
                          <pre className="text-xs whitespace-pre-wrap">{challengeProblem.test_cases || 'No test cases provided.'}</pre>
                        </div>
                        <div className="rounded border p-3 bg-gray-50">
                          <p className="font-semibold text-sm mb-2">Constraints</p>
                          <pre className="text-xs whitespace-pre-wrap">{challengeProblem.constraints || 'No constraints provided.'}</pre>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Your Solution</label>
                      <textarea
                        value={challengeCode}
                        onChange={(e) => setChallengeCode(e.target.value)}
                        rows={16}
                        placeholder="Write your solution here..."
                        className="w-full rounded-lg px-4 py-3 font-mono text-sm bg-gray-900 text-gray-100 placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y leading-relaxed"
                        onPaste={(e) => e.preventDefault()}
                        onCopy={(e) => e.preventDefault()}
                        onCut={(e) => e.preventDefault()}
                        disabled={isLocked || isDisqualified || isSubmitted}
                      />
                    </div>

                    <button
                      onClick={() => handleChallengeSubmit('manual')}
                      disabled={challengeSubmitting || isLocked || isDisqualified || isSubmitted || !challengeCode.trim()}
                      className="w-full btn-primary disabled:opacity-50"
                    >
                      {challengeSubmitting ? 'Submitting...' : 'Submit Challenge'}
                    </button>

                    {rewardStatus && (
                      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {rewardStatus}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-10 text-center text-gray-500">No challenge problem available.</div>
                )}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Output</h2>
            {result ? (
              <div className="prose prose-sm max-w-none">
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

                {selectedTab === 'challenge' && challengeResult && (
                  <div className="space-y-4">
                    <div className={`border-l-4 p-4 rounded ${
                      challengeResult.passed
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                    }`}>
                      <p className={`font-semibold ${challengeResult.passed ? 'text-green-900' : 'text-red-900'}`}>
                        {challengeResult.passed ? '✅ Challenge Passed' : '❌ Challenge Failed'}
                      </p>
                    </div>
                    <div className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-sm leading-relaxed">
                      {challengeResult.feedback || challengeResult.message || 'Submission recorded.'}
                    </div>
                    <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                      Solved within time streak: <strong>{solvedWithinTime}/5</strong>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
                <Terminal className="h-12 w-12 opacity-25" />
                <p className="text-lg font-semibold text-gray-500">Awaiting your code...</p>
                <p className="text-sm text-gray-400 text-center max-w-xs leading-relaxed">
                  Paste your code on the left and click &ldquo;Analyze Code 🚀&rdquo; to get instant AI-powered feedback.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
