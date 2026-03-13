import { useState } from 'react'
import { Paperclip, ArrowUp } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

interface QuickAction {
  id: string
  title: string
  subtext: string
}

const quickActions: QuickAction[] = [
  {
    id: 'tcs-mock',
    title: '📝 Generate TCS mock test',
    subtext: '20 questions, medium difficulty',
  },
  {
    id: 'resume-review',
    title: '📄 Review my Resume',
    subtext: 'Check ATS score and get feedback',
  },
  {
    id: 'dsa-concept',
    title: '💻 Explain a DSA concept',
    subtext: 'e.g., Binary Search Trees',
  },
  {
    id: 'hr-prep',
    title: '👔 HR Interview Prep',
    subtext: 'Top behavioral questions',
  },
]

export default function ChatHome() {
  const user = useAppStore((state) => state.user)
  const [prompt, setPrompt] = useState('')

  const userName = user?.name?.split(' ')[0] || 'Student'

  const handleQuickActionClick = (action: QuickAction) => {
    setPrompt(action.title.replace(/^\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '').trim())
  }

  const handleSubmit = () => {
    if (!prompt.trim()) return
  }

  return (
    <div className="h-screen bg-gray-50">
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-between px-4 py-8 sm:px-6">
        <div />

        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How can I help you prepare today, {userName}?
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => handleQuickActionClick(action)}
                className="rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50"
              >
                <p className="text-sm font-semibold text-gray-900">{action.title}</p>
                <p className="mt-1 text-xs text-gray-500">{action.subtext}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-8">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-md">
            <div className="flex items-end gap-3 p-3">
              <button
                type="button"
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Attach file"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask anything about placements, coding, or resumes..."
                rows={1}
                className="max-h-36 min-h-[44px] flex-1 resize-none bg-transparent px-1 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />

              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-xl bg-gray-900 p-2.5 text-white transition-opacity hover:opacity-90"
                aria-label="Send prompt"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
