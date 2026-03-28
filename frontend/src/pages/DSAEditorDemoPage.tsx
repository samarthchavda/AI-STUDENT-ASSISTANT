import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { Clock3 } from 'lucide-react'
import Header from '../components/Header'
import { codingAPI } from '../api/client'

type ChallengeProblem = {
  id: number
  title: string
  description: string
  constraints?: string
  test_cases?: string
  starter_code?: string
  language?: string
  time_limit_seconds: number
}

const formatTime = (seconds: number) => {
  const safe = Math.max(0, seconds)
  const mm = Math.floor(safe / 60)
  const ss = safe % 60
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

export default function DSAEditorDemoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [problem, setProblem] = useState<ChallengeProblem | null>(null)
  const [code, setCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(30 * 60)
  const [isLocked, setIsLocked] = useState(false)

  const editorLanguage = useMemo(() => {
    const normalized = (problem?.language || 'python').toLowerCase()
    if (normalized === 'javascript' || normalized === 'js') return 'javascript'
    return 'python'
  }, [problem?.language])

  useEffect(() => {
    const loadProblem = async () => {
      setLoading(true)
      setError('')
      try {
        if (!id) {
          setError('Invalid problem id.')
          return
        }
        const response = await codingAPI.getChallengeProblemById(id)
        const data = response.data as ChallengeProblem
        setProblem(data)
        setCode(data?.starter_code || '')
        setTimeLeft(data?.time_limit_seconds || 30 * 60)
        setIsLocked(false)
      } catch (err: any) {
        console.error('Failed to load challenge problem:', err)
        setError(err?.response?.data?.detail || 'Could not load challenge problem.')
      } finally {
        setLoading(false)
      }
    }

    loadProblem()
  }, [id])

  useEffect(() => {
    if (loading || isLocked) return

    if (timeLeft <= 0) {
      setIsLocked(true)
      console.log('Test Submitted Automatically')
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, loading, isLocked])

  const handleSubmit = () => {
    console.log('Test Submitted Manually')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-slate-700 font-semibold">
              <Clock3 className="w-4 h-4 text-orange-600" />
              Time Remaining: <span className="text-orange-600">{formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || isLocked}
              className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading challenge...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700 shadow-sm">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 h-[calc(100vh-220px)] min-h-[620px]">
            <section className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-y-auto">
              <h1 className="text-xl font-bold text-slate-900 mb-3">{problem?.title || 'DSA Challenge'}</h1>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-6 mb-4">{problem?.description}</p>

              <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Example Test Cases</h3>
                <pre className="text-xs text-slate-700 whitespace-pre-wrap leading-5">{problem?.test_cases || 'No test cases added yet.'}</pre>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Constraints</h3>
                <pre className="text-xs text-slate-700 whitespace-pre-wrap leading-5">{problem?.constraints || 'No constraints added yet.'}</pre>
              </div>
            </section>

            <section className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
              <div className="border-b border-slate-200 px-4 py-2 text-xs text-slate-500 bg-slate-50">
                Editor ({editorLanguage.toUpperCase()}) · Ctrl/Cmd+C and Ctrl/Cmd+V are blocked in challenge mode
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={editorLanguage}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    automaticLayout: true,
                    readOnly: isLocked,
                    contextmenu: false,
                  }}
                  onMount={(editor) => {
                    editor.onKeyDown((event) => {
                      const keyCode = event.keyCode
                      const isCtrlOrCmd = event.ctrlKey || event.metaKey
                      const isCopy = keyCode === 33
                      const isPaste = keyCode === 52

                      if (isCtrlOrCmd && (isCopy || isPaste)) {
                        event.preventDefault()
                        event.stopPropagation()
                      }
                    })
                  }}
                />
              </div>
            </section>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={() => navigate('/dsa/dashboard')}
            className="text-sm text-slate-600 hover:text-slate-900 underline"
          >
            Back to DSA Dashboard
          </button>
        </div>
      </main>
    </div>
  )
}
