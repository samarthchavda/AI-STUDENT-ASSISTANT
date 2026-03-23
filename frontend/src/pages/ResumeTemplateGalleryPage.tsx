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
    id: 'two-column',
    name: 'Two Column Pro',
    description: 'Balanced two-column layout for comprehensive resumes',
    thumbnail: '/templates/two-column.png',
    isPro: false,
    category: 'modern',
    features: ['Two Columns', 'Space Efficient', 'Modern']
  },
  {
    id: 'compact',
    name: 'Compact Essential',
    description: 'Maximizes content in minimal space, ideal for experienced professionals',
    thumbnail: '/templates/compact.png',
    isPro: false,
    category: 'minimal',
    features: ['Space Saving', 'Content Rich', 'Professional']
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
  {
    id: 'startup',
    name: 'Startup Dynamic',
    description: 'Bold and energetic design for startup environments',
    thumbnail: '/templates/startup.png',
    isPro: true,
    category: 'creative',
    features: ['Bold Design', 'Startup Culture', 'Energetic']
  },
  {
    id: 'designer',
    name: 'Designer Portfolio',
    description: 'Visual-first layout showcasing design skills',
    thumbnail: '/templates/designer.png',
    isPro: true,
    category: 'creative',
    features: ['Visual Focus', 'Portfolio Style', 'Creative']
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

  const handleSelectTemplate = (templateId: string, isTemplatePro: boolean) => {
    if (isTemplatePro && !isPro) {
      // Show upgrade modal
      alert('This template requires a Pro subscription. Upgrade to unlock all premium templates!')
      return
    }
    
    setSelectedTemplate(templateId)
    // Navigate to resume form with selected template
    setTimeout(() => {
      navigate('/career/resume-form', { state: { selectedTemplate: templateId } })
    }, 300)
  }

  const renderTemplateThumbnail = (template: Template) => {
    // Generate realistic preview with demo data based on template ID
    
    if (template.id === 'modern') {
      return (
        <div className="h-48 rounded-lg border-2 border-gray-200 overflow-hidden bg-white grid grid-cols-[35%_65%] text-[6px]">
          <div className="bg-teal-700 p-2 text-white space-y-1">
            <div className="font-bold">CONTACT</div>
            <div className="opacity-80">john@email.com</div>
            <div className="opacity-80">+1 234 567</div>
            <div className="mt-2 font-bold">SKILLS</div>
            <div className="opacity-80">React • Node.js</div>
            <div className="opacity-80">Python • AWS</div>
          </div>
          <div className="p-2 space-y-1.5">
            <div className="font-bold text-[8px]">JOHN DOE</div>
            <div className="text-gray-600">Software Engineer</div>
            <div className="mt-1 font-semibold">EXPERIENCE</div>
            <div className="font-medium">Senior Developer</div>
            <div className="text-gray-500">Tech Corp • 2020-2023</div>
            <div className="text-gray-600 leading-tight">Built scalable web applications...</div>
          </div>
        </div>
      )
    }

    if (template.id === 'minimal') {
      return (
        <div className="h-48 rounded-lg border-2 border-gray-200 bg-white p-2 text-[6px]">
          <div className="text-center mb-2">
            <div className="font-bold text-[8px]">SARAH JOHNSON</div>
            <div className="text-gray-600">Data Scientist</div>
            <div className="text-gray-500">sarah@email.com | +1 234 567 890</div>
          </div>
          <div className="space-y-1.5">
            <div className="font-semibold border-b border-gray-300 pb-0.5">EDUCATION</div>
            <div className="font-medium">MS Computer Science</div>
            <div className="text-gray-500">Stanford University • 2022</div>
            <div className="font-semibold border-b border-gray-300 pb-0.5 mt-1">EXPERIENCE</div>
            <div className="font-medium">ML Engineer</div>
            <div className="text-gray-500">AI Labs • 2022-Present</div>
          </div>
        </div>
      )
    }

    if (template.id === 'professional') {
      return (
        <div className="h-48 rounded-lg border-2 border-gray-200 bg-white p-2 text-[6px]">
          <div className="font-bold text-[8px] mb-1">MICHAEL CHEN</div>
          <div className="h-px bg-gray-800 mb-1" />
          <div className="text-gray-600 mb-2">Business Analyst | michael@email.com</div>
          <div className="space-y-1.5">
            <div className="font-semibold">PROFESSIONAL SUMMARY</div>
            <div className="text-gray-600 leading-tight">Results-driven analyst with 5+ years...</div>
            <div className="font-semibold mt-1">WORK EXPERIENCE</div>
            <div className="font-medium">Senior Analyst</div>
            <div className="text-gray-500">Consulting Firm • 2019-2024</div>
          </div>
        </div>
      )
    }

    if (template.id === 'two-column') {
      return (
        <div className="h-48 rounded-lg border-2 border-gray-200 bg-white grid grid-cols-2 gap-1 p-2 text-[6px]">
          <div className="space-y-1">
            <div className="font-bold text-[7px]">EMILY DAVIS</div>
            <div className="text-gray-600">Product Manager</div>
            <div className="font-semibold mt-1">EXPERIENCE</div>
            <div className="font-medium">PM Lead</div>
            <div className="text-gray-500">Tech Inc • 2021-Now</div>
            <div className="text-gray-600 leading-tight text-[5px]">Led product strategy...</div>
          </div>
          <div className="space-y-1">
            <div className="font-semibold">EDUCATION</div>
            <div className="font-medium">MBA</div>
            <div className="text-gray-500">Harvard • 2020</div>
            <div className="font-semibold mt-1">SKILLS</div>
            <div className="text-gray-600">Agile • Scrum</div>
            <div className="text-gray-600">Product Strategy</div>
          </div>
        </div>
      )
    }

    if (template.id === 'compact') {
      return (
        <div className="h-48 rounded-lg border-2 border-gray-200 bg-white p-1.5 text-[5px] leading-tight">
          <div className="font-bold text-[7px]">ALEX KUMAR</div>
          <div className="text-gray-600">Full Stack Developer | alex@email.com | +1 234 567</div>
          <div className="grid grid-cols-2 gap-1 mt-1">
            <div>
              <div className="font-semibold text-[6px]">EXPERIENCE</div>
              <div className="font-medium">Sr. Developer</div>
              <div className="text-gray-500">StartupCo • 2020-24</div>
              <div className="text-gray-600">Built microservices...</div>
              <div className="font-medium mt-0.5">Developer</div>
              <div className="text-gray-500">TechCorp • 2018-20</div>
            </div>
            <div>
              <div className="font-semibold text-[6px]">SKILLS</div>
              <div className="text-gray-600">React, Node, Python</div>
              <div className="text-gray-600">AWS, Docker, K8s</div>
              <div className="font-semibold text-[6px] mt-0.5">EDUCATION</div>
              <div className="font-medium">BS CS</div>
              <div className="text-gray-500">MIT • 2018</div>
            </div>
          </div>
        </div>
      )
    }

    if (template.id === 'academic') {
      return (
        <div className="h-48 rounded-lg border-2 border-blue-200 bg-blue-50/30 p-2 text-[6px]">
          <div className="font-bold text-[8px] text-blue-900">DR. LISA MARTINEZ</div>
          <div className="text-blue-700 mb-2">Research Scientist | lisa@university.edu</div>
          <div className="space-y-1">
            <div className="font-semibold text-blue-800">RESEARCH INTERESTS</div>
            <div className="text-blue-700 leading-tight">Machine Learning, Computer Vision...</div>
            <div className="font-semibold text-blue-800 mt-1">PUBLICATIONS</div>
            <div className="text-blue-700 leading-tight">Martinez, L. et al. (2023). "Deep Learning..."</div>
            <div className="font-semibold text-blue-800 mt-1">EDUCATION</div>
            <div className="font-medium text-blue-800">PhD Computer Science</div>
            <div className="text-blue-600">Stanford University • 2023</div>
          </div>
        </div>
      )
    }

    if (template.id === 'executive') {
      return (
        <div className="h-48 rounded-lg border-2 border-slate-300 bg-slate-50 overflow-hidden text-[6px]">
          <div className="h-8 bg-slate-800 text-white p-1.5 flex items-center">
            <div>
              <div className="font-bold text-[8px]">ROBERT WILLIAMS</div>
              <div className="text-slate-300">Chief Technology Officer</div>
            </div>
          </div>
          <div className="p-2 space-y-1">
            <div className="font-semibold">EXECUTIVE SUMMARY</div>
            <div className="text-gray-600 leading-tight">Visionary technology leader with 15+ years...</div>
            <div className="font-semibold mt-1">LEADERSHIP EXPERIENCE</div>
            <div className="font-medium">CTO</div>
            <div className="text-gray-500">Fortune 500 Company • 2018-Present</div>
          </div>
        </div>
      )
    }

    if (template.id === 'creative') {
      return (
        <div className="h-48 rounded-lg border-2 border-violet-200 bg-violet-50 overflow-hidden text-[6px]">
          <div className="h-8 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 text-white p-1.5 flex items-center">
            <div>
              <div className="font-bold text-[8px]">MAYA PATEL</div>
              <div>UX/UI Designer</div>
            </div>
          </div>
          <div className="p-2 space-y-1">
            <div className="font-semibold text-violet-900">ABOUT ME</div>
            <div className="text-violet-700 leading-tight">Creative designer passionate about user experience...</div>
            <div className="font-semibold text-violet-900 mt-1">PORTFOLIO</div>
            <div className="font-medium text-violet-800">Mobile App Redesign</div>
            <div className="text-violet-600">Increased engagement by 40%</div>
          </div>
        </div>
      )
    }

    if (template.id === 'tech-blue') {
      return (
        <div className="h-48 rounded-lg border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 p-2 text-[6px]">
          <div className="font-bold text-[8px] text-blue-900">DAVID LEE</div>
          <div className="text-blue-700 mb-2">Software Engineer | david@tech.com</div>
          <div className="space-y-1">
            <div className="font-semibold text-blue-800">TECHNICAL SKILLS</div>
            <div className="flex flex-wrap gap-0.5">
              <span className="bg-blue-200 text-blue-800 px-1 rounded text-[5px]">React</span>
              <span className="bg-blue-200 text-blue-800 px-1 rounded text-[5px]">Node.js</span>
              <span className="bg-blue-200 text-blue-800 px-1 rounded text-[5px]">Python</span>
            </div>
            <div className="font-semibold text-blue-800 mt-1">PROJECTS</div>
            <div className="font-medium text-blue-800">E-commerce Platform</div>
            <div className="text-blue-600 leading-tight">Built scalable microservices...</div>
          </div>
        </div>
      )
    }

    if (template.id === 'elegant-serif') {
      return (
        <div className="h-48 rounded-lg border-2 border-amber-200 bg-amber-50/30 p-2 text-[6px]">
          <div className="text-center mb-2 border-b-2 border-amber-300 pb-1">
            <div className="font-serif font-bold text-[9px] text-amber-900">SOPHIA ANDERSON</div>
            <div className="text-amber-700">Management Consultant</div>
          </div>
          <div className="space-y-1">
            <div className="font-serif font-semibold text-amber-900">PROFESSIONAL EXPERIENCE</div>
            <div className="font-medium text-amber-800">Senior Consultant</div>
            <div className="text-amber-600">McKinsey & Company • 2020-Present</div>
            <div className="text-amber-700 leading-tight">Led strategic initiatives for Fortune 100 clients...</div>
            <div className="font-serif font-semibold text-amber-900 mt-1">EDUCATION</div>
            <div className="font-medium text-amber-800">MBA, Strategy</div>
            <div className="text-amber-600">Wharton School • 2020</div>
          </div>
        </div>
      )
    }

    if (template.id === 'startup') {
      return (
        <div className="h-48 rounded-lg border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 p-2 text-[6px]">
          <div className="font-bold text-[9px] text-orange-900">JAKE THOMPSON</div>
          <div className="text-orange-700 font-semibold">Growth Hacker | Startup Enthusiast</div>
          <div className="flex gap-1 text-orange-600 mb-1">
            <span>jake@startup.io</span>
            <span>•</span>
            <span>linkedin.com/in/jake</span>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-orange-900">IMPACT</div>
            <div className="font-medium text-orange-800">Growth Lead</div>
            <div className="text-orange-600">TechStartup • 2022-Now</div>
            <div className="text-orange-700 leading-tight">🚀 Grew user base from 10K to 1M in 18 months</div>
            <div className="text-orange-700 leading-tight">💰 Increased MRR by 300%</div>
          </div>
        </div>
      )
    }

    if (template.id === 'designer') {
      return (
        <div className="h-48 rounded-lg border-2 border-pink-300 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-2 text-[6px]">
          <div className="text-center mb-1">
            <div className="font-bold text-[9px] bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">OLIVIA CHEN</div>
            <div className="text-purple-700">Creative Designer</div>
          </div>
          <div className="grid grid-cols-3 gap-0.5 mb-1">
            <div className="h-6 bg-gradient-to-br from-pink-400 to-purple-400 rounded"></div>
            <div className="h-6 bg-gradient-to-br from-purple-400 to-blue-400 rounded"></div>
            <div className="h-6 bg-gradient-to-br from-blue-400 to-cyan-400 rounded"></div>
          </div>
          <div className="space-y-0.5">
            <div className="font-semibold text-purple-900">FEATURED WORK</div>
            <div className="text-purple-700 leading-tight">Brand Identity • Web Design • Illustration</div>
            <div className="font-semibold text-purple-900">CLIENTS</div>
            <div className="text-purple-600">Nike • Apple • Spotify</div>
          </div>
        </div>
      )
    }

    // Default thumbnail for any other templates
    return (
        <div className="h-48 rounded-lg border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 p-2 text-[6px]">
          <div className="font-bold text-[8px] bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">YOUR NAME</div>
          <div className="text-gray-600 mb-2">Your Title</div>
          <div className="space-y-1">
            <div className="font-semibold">EXPERIENCE</div>
            <div className="font-medium">Job Title</div>
            <div className="text-gray-500">Company • 2020-2024</div>
            <div className="text-gray-600 leading-tight">Your achievements and responsibilities...</div>
            <div className="font-semibold mt-1">EDUCATION</div>
            <div className="font-medium">Degree</div>
            <div className="text-gray-500">University • Year</div>
          </div>
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
              {(!template.isPro || isPro) && (
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                  <button
                    onClick={() => handleSelectTemplate(template.id, template.isPro)}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform"
                  >
                    Start Building
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
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
