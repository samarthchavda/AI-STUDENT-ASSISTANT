import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Crown, Check, Sparkles, ArrowRight } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

interface Template {
  id: string
  name: string
  description: string
  thumbnail: string
  isPro: boolean
  category: 'modern' | 'classic' | 'creative' | 'minimal'
  features: string[]
}

const templates: Template[] = [
  {
    id: 'modern',
    name: 'Modern Sidebar',
    description: 'Bold sidebar with accent colors, perfect for tech roles',
    thumbnail: '/templates/modern.png',
    isPro: false,
    category: 'modern',
    features: ['ATS-Friendly', 'Color Sidebar', 'Clean Layout']
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Ultra-clean ATS-friendly layout for maximum readability',
    thumbnail: '/templates/minimal.png',
    isPro: false,
    category: 'minimal',
    features: ['ATS-Optimized', 'Simple Design', 'High Readability']
  },
  {
    id: 'professional',
    name: 'Professional Classic',
    description: 'Traditional serif structure for corporate roles',
    thumbnail: '/templates/professional.png',
    isPro: false,
    category: 'classic',
    features: ['Corporate Style', 'Serif Font', 'Traditional']
  },
  {
    id: 'academic',
    name: 'Academic Research',
    description: 'Research-focused layout for academic positions',
    thumbnail: '/templates/academic.png',
    isPro: true,
    category: 'classic',
    features: ['Research Style', 'Publication Ready', 'Academic Format']
  },
  {
    id: 'executive',
    name: 'Executive Premium',
    description: 'Premium corporate heading for senior positions',
    thumbnail: '/templates/executive.png',
    isPro: true,
    category: 'modern',
    features: ['Premium Look', 'Executive Style', 'Leadership Focus']
  },
  {
    id: 'creative',
    name: 'Creative Gradient',
    description: 'Colorful gradient header for creative industries',
    thumbnail: '/templates/creative.png',
    isPro: true,
    category: 'creative',
    features: ['Gradient Header', 'Creative Design', 'Eye-Catching']
  },
  {
    id: 'tech-blue',
    name: 'Tech Blue',
    description: 'Modern blue theme perfect for software engineers',
    thumbnail: '/templates/tech-blue.png',
    isPro: true,
    category: 'modern',
    features: ['Tech-Focused', 'Blue Theme', 'Developer Friendly']
  },
  {
    id: 'elegant-serif',
    name: 'Elegant Serif',
    description: 'Sophisticated serif design for consulting roles',
    thumbnail: '/templates/elegant-serif.png',
    isPro: true,
    category: 'classic',
    features: ['Elegant', 'Consulting Style', 'Professional']
  },
]

export default function ResumeTemplateGalleryPage() {
  const navigate = useNavigate()
  const user = useAppStore((state) => state.user)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'modern' | 'classic' | 'creative' | 'minimal'>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const isPro = user?.plan === 'pro' || user?.plan === 'basic'

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory)

  const handleSelectTemplate = (templateId: string, isPro: boolean) => {
    if (isPro && !isPro) {
      // Show upgrade modal
      alert('This template requires a Pro subscription. Upgrade to unlock all premium templates!')
      return
    }
    
    setSelectedTemplate(templateId)
    // Navigate to resume builder with selected template
    setTimeout(() => {
      navigate('/career/resume-builder', { state: { selectedTemplate: templateId } })
    }, 300)
  }

  const renderTemplateThumbnail = (template: Template) => {
    // Generate preview based on template ID
    if (template.id === 'modern') {
      return (
        <div className="h-48 rounded-lg border-2 border-gray-200 overflow-hidden bg-white grid grid-cols-[35%_65%]">
          <div className="bg-teal-700" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-2/3 rounded bg-gray-300" />
            <div className="h-2 w-full rounded bg-gray-200" />
            <div className="h-2 w-5/6 rounded bg-gray-200" />
            <div className="h-2 w-4/5 rounded bg-gray-200" />
          </div>
        </div>
      )
    }

    if (template.id === 'minimal') {
      return (
        <div className="h-48 rounded-lg border-2 border-gray-200 bg-white p-3">
          <div className="h-3 w-1/2 rounded bg-gray-400 mx-auto mb-2" />
          <div className="h-2 w-full rounded bg-gray-200 mb-2" />
          <div className="h-2 w-11/12 rounded bg-gray-200 mb-2" />
          <div className="h-2 w-3/4 rounded bg-gray-200 mb-3" />
          <div className="h-2 w-full rounded bg-gray-200 mb-1" />
          <div className="h-2 w-5/6 rounded bg-gray-200" />
        </div>
      )
    }

    if (template.id === 'professional') {
      return (
        <div className="h-48 rounded-lg border-2 border-gray-200 bg-white p-3">
          <div className="h-3 w-2/3 rounded bg-gray-500 mb-2" />
          <div className="h-px w-full bg-gray-500 mb-2" />
          <div className="h-2 w-full rounded bg-gray-200 mb-2" />
          <div className="h-2 w-5/6 rounded bg-gray-200 mb-3" />
          <div className="h-2 w-full rounded bg-gray-200 mb-1" />
          <div className="h-2 w-4/5 rounded bg-gray-200" />
        </div>
      )
    }

    if (template.id === 'academic') {
      return (
        <div className="h-48 rounded-lg border-2 border-blue-200 bg-blue-50/30 p-3">
          <div className="h-3 w-2/3 rounded bg-blue-400 mb-2" />
          <div className="h-2 w-full rounded bg-blue-100 mb-2" />
          <div className="h-2 w-10/12 rounded bg-blue-100 mb-2" />
          <div className="h-2 w-8/12 rounded bg-blue-100 mb-3" />
          <div className="h-2 w-full rounded bg-blue-100 mb-1" />
          <div className="h-2 w-9/12 rounded bg-blue-100" />
        </div>
      )
    }

    if (template.id === 'executive') {
      return (
        <div className="h-48 rounded-lg border-2 border-slate-300 bg-slate-50 overflow-hidden">
          <div className="h-8 bg-slate-800" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-2/3 rounded bg-slate-500" />
            <div className="h-2 w-full rounded bg-slate-200" />
            <div className="h-2 w-5/6 rounded bg-slate-200" />
            <div className="h-2 w-4/5 rounded bg-slate-200" />
          </div>
        </div>
      )
    }

    if (template.id === 'creative') {
      return (
        <div className="h-48 rounded-lg border-2 border-violet-200 bg-violet-50 overflow-hidden">
          <div className="h-8 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-2/3 rounded bg-violet-300" />
            <div className="h-2 w-full rounded bg-violet-100" />
            <div className="h-2 w-4/5 rounded bg-violet-100" />
            <div className="h-2 w-5/6 rounded bg-violet-100" />
          </div>
        </div>
      )
    }

    // Default thumbnail for other templates
    return (
        <div className="h-48 rounded-lg border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 p-3">
          <div className="h-3 w-2/3 rounded bg-gradient-to-r from-blue-400 to-purple-400 mb-2" />
          <div className="h-2 w-full rounded bg-gray-200 mb-2" />
          <div className="h-2 w-5/6 rounded bg-gray-200 mb-3" />
          <div className="h-2 w-full rounded bg-gray-200 mb-1" />
          <div className="h-2 w-4/5 rounded bg-gray-200" />
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Choose Your Resume Template
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select from our professionally designed templates. Start with a free template or unlock premium designs with Pro.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {['all', 'modern', 'classic', 'creative', 'minimal'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as any)}
              className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`group relative rounded-2xl border-2 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                selectedTemplate === template.id
                  ? 'border-blue-500 ring-4 ring-blue-100'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {/* Pro Badge */}
              {template.isPro && (
                <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  <Crown className="w-3 h-3" />
                  PRO
                </div>
              )}

              {/* Selected Badge */}
              {selectedTemplate === template.id && (
                <div className="absolute top-3 left-3 z-10 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  <Check className="w-3 h-3" />
                  Selected
                </div>
              )}

              {/* Template Preview */}
              <div className="p-4">
                {renderTemplateThumbnail(template)}
              </div>

              {/* Template Info */}
              <div className="p-4 pt-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {template.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Select Button */}
                <button
                  onClick={() => handleSelectTemplate(template.id, template.isPro)}
                  disabled={template.isPro && !isPro}
                  className={`w-full py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    template.isPro && !isPro
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : selectedTemplate === template.id
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md'
                  }`}
                >
                  {template.isPro && !isPro ? (
                    <>
                      <Crown className="w-4 h-4" />
                      Upgrade to Use
                    </>
                  ) : selectedTemplate === template.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      Selected
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Use Template
                    </>
                  )}
                </button>
              </div>

              {/* Hover Overlay */}
              {!template.isPro || isPro ? (
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                  <button
                    onClick={() => handleSelectTemplate(template.id, template.isPro)}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform"
                  >
                    Start Building
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {/* Upgrade CTA for Free Users */}
        {!isPro && (
          <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 rounded-2xl p-8 text-center text-white shadow-2xl">
            <Crown className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-3">Unlock All Premium Templates</h2>
            <p className="text-lg mb-6 opacity-95">
              Get access to {templates.filter(t => t.isPro).length} premium templates, AI-powered enhancements, and unlimited downloads
            </p>
            <button
              onClick={() => navigate('/pricing')}
              className="bg-white text-orange-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg inline-flex items-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Pro
            </button>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <FileText className="w-10 h-10 text-blue-600 mb-3" />
            <h3 className="text-lg font-bold mb-2">ATS-Friendly</h3>
            <p className="text-gray-600 text-sm">
              All templates are optimized for Applicant Tracking Systems to ensure your resume gets seen
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <Sparkles className="w-10 h-10 text-purple-600 mb-3" />
            <h3 className="text-lg font-bold mb-2">AI-Powered</h3>
            <p className="text-gray-600 text-sm">
              Use AI to generate content, enhance descriptions, and optimize your resume for any role
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <Check className="w-10 h-10 text-green-600 mb-3" />
            <h3 className="text-lg font-bold mb-2">One-Click Download</h3>
            <p className="text-gray-600 text-sm">
              Download your resume as a professional PDF with a single click, ready to send to employers
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
