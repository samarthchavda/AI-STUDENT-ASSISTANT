import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Play, Zap } from 'lucide-react'
import Header from '../components/Header'
import { EXAM_CONFIG, calculateDuration } from '../config/examConfig'

type Difficulty = 'Easy' | 'Medium' | 'Hard'

type ExamConfig = {
  company: string
  category: string
  difficulty: Difficulty
  questionCount: number
  durationMinutes: number
}

// All companies now use the same question count from config
const companies: Array<{ id: string; description: string }> = [
  {
    id: 'TCS',
    description: 'TCS placement aptitude questions',
  },
  {
    id: 'Infosys',
    description: 'Infosys aptitude and reasoning set',
  },
  {
    id: 'Wipro',
    description: 'Wipro placement questions',
  },
  {
    id: 'Cognizant',
    description: 'Cognizant aptitude questions',
  },
  {
    id: 'Accenture',
    description: 'Accenture placement pattern',
  },
  {
    id: 'HCL',
    description: 'HCL aptitude questions',
  },
]

const categories: Array<{ id: string; label: string; description: string }> = [
  {
    id: 'Aptitude',
    label: 'Aptitude',
    description: 'General aptitude and reasoning questions',
  },
]

export default function ExamPrepPage() {
  const navigate = useNavigate()

  const [selectedCompany, setSelectedCompany] = useState(companies[0].id)
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id)
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium' as Difficulty)

  const activeCompany = companies.find((item) => item.id === selectedCompany) || companies[0]
  const questionCount = EXAM_CONFIG.QUESTION_LIMIT
  const durationMinutes = calculateDuration(questionCount)

  const handleStart = () => {
    const config: ExamConfig = {
      company: selectedCompany,
      category: selectedCategory,
      difficulty,
      questionCount: questionCount,
      durationMinutes: durationMinutes,
    }

    navigate('/exam-live', {
      state: {
        config,
      },
    })
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Step 1 · Setup</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Configure Your Aptitude Assessment</h1>
          <p className="mt-3 text-slate-600">Pick exam pattern, category, and difficulty before starting your live timed test.</p>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="text-lg font-bold text-slate-900">Choose Company Pattern</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {companies.map((company) => {
              const selected = company.id === selectedCompany
              return (
                <button
                  key={company.id}
                  onClick={() => setSelectedCompany(company.id)}
                  className={`relative rounded-2xl border p-5 text-left transition ${
                    selected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <p className="text-sm font-bold text-slate-900">{company.id}</p>
                  <p className="mt-1 text-sm text-slate-600">{company.description}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {questionCount} questions · {durationMinutes} mins
                  </p>
                  {selected && (
                    <span className="absolute right-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="text-lg font-bold text-slate-900">Choose Category</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {categories.map((category) => {
              const selected = category.id === selectedCategory
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`relative rounded-2xl border p-5 text-left transition ${
                    selected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <p className="text-sm font-bold text-slate-900">{category.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{category.description}</p>
                  {selected && (
                    <span className="absolute right-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="text-lg font-bold text-slate-900">Difficulty Picker</h2>
          <div className="mt-4 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {(['Easy', 'Medium', 'Hard'] as const).map((level) => {
              const selected = difficulty === level
              return (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`rounded-lg px-6 py-2.5 text-sm font-semibold capitalize transition ${
                    selected ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {level}
                </button>
              )
            })}
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Ready Configuration</p>
            <p className="mt-1">
              {selectedCompany} · {categories.find((item) => item.id === selectedCategory)?.label} · {difficulty} ·{' '}
              {questionCount} questions in {durationMinutes} mins
            </p>
          </div>
        </section>

        <div className="mt-10 flex justify-center">
          <button
            onClick={handleStart}
            className="inline-flex min-w-[320px] items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Play className="h-5 w-5" />
            Start Quiz
            <Zap className="h-5 w-5" />
          </button>
        </div>
      </main>
    </div>
  )
}
