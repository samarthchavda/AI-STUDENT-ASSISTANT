import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Crown, Check, Sparkles, ArrowRight, X, Eye } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { resumeDemoData } from '../data/resumeDemoData'

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
  // FREE TEMPLATES
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
    id: 'berlin',
    name: 'Berlin',
    description: 'Clean sidebar with blue accent, perfect for tech professionals',
    thumbnail: '/templates/berlin.png',
    isPro: false,
    category: 'modern',
    features: ['Blue Theme', 'Sidebar Layout', 'Tech-Focused']
  },
  {
    id: 'stockholm',
    name: 'Stockholm',
    description: 'Minimalist Scandinavian design with elegant typography',
    thumbnail: '/templates/stockholm.png',
    isPro: false,
    category: 'minimal',
    features: ['Scandinavian', 'Elegant', 'Minimalist']
  },
  {
    id: 'copenhagen',
    name: 'Copenhagen',
    description: 'Ultra-minimal with generous white space for clarity',
    thumbnail: '/templates/copenhagen.png',
    isPro: false,
    category: 'minimal',
    features: ['White Space', 'Ultra Clean', 'Modern']
  },
  
  // PRO TEMPLATES
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
  {
    id: 'tokyo',
    name: 'Tokyo',
    description: 'Tech-focused with skill bars and modern aesthetics',
    thumbnail: '/templates/tokyo.png',
    isPro: true,
    category: 'modern',
    features: ['Skill Bars', 'Tech Style', 'Modern']
  },
  {
    id: 'oxford',
    name: 'Oxford',
    description: 'Traditional academic style with prestigious look',
    thumbnail: '/templates/oxford.png',
    isPro: true,
    category: 'classic',
    features: ['Academic', 'Traditional', 'Prestigious']
  },
  {
    id: 'milan',
    name: 'Milan',
    description: 'Fashion-forward design with bold typography',
    thumbnail: '/templates/milan.png',
    isPro: true,
    category: 'creative',
    features: ['Fashion', 'Bold', 'Stylish']
  },
  {
    id: 'sydney',
    name: 'Sydney',
    description: 'Bold header with timeline-based experience section',
    thumbnail: '/templates/sydney.png',
    isPro: true,
    category: 'modern',
    features: ['Timeline', 'Bold Header', 'Modern']
  },
]

export default function ResumeTemplateGalleryPage() {
  const navigate = useNavigate()
  const user = useAppStore((state) => state.user)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'modern' | 'classic' | 'creative' | 'minimal'>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)

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

    if (template.id === 'berlin') {
      return (
        <div className="h-48 rounded-lg border-2 border-gray-200 overflow-hidden bg-white grid grid-cols-[30%_70%] text-[6px]">
          <div className="bg-blue-600 p-2 text-white space-y-1">
            <div className="w-8 h-8 bg-white rounded-full mx-auto mb-1"></div>
            <div className="font-bold text-center text-[7px]">CONTACT</div>
            <div className="opacity-90 text-[5px]">alex@email.com</div>
            <div className="opacity-90 text-[5px]">+1 555 1234</div>
            <div className="font-bold mt-2 text-[6px]">SKILLS</div>
            <div className="opacity-90 text-[5px]">JavaScript</div>
            <div className="opacity-90 text-[5px]">React</div>
            <div className="opacity-90 text-[5px]">Node.js</div>
          </div>
          <div className="p-2 space-y-1">
            <div className="font-bold text-[8px] text-blue-900">ALEX MARTINEZ</div>
            <div className="text-blue-700 text-[6px]">Software Engineer</div>
            <div className="mt-1 font-semibold text-blue-800">EXPERIENCE</div>
            <div className="font-medium">Senior Developer</div>
            <div className="text-gray-500 text-[5px]">Tech Corp • 2020-2024</div>
            <div className="text-gray-600 leading-tight text-[5px]">Led development of scalable applications...</div>
          </div>
        </div>
      )
    }

    if (template.id === 'stockholm') {
      return (
        <div className="h-48 rounded-lg border-2 border-gray-200 bg-white p-3 text-[6px]">
          <div className="text-center mb-2 pb-1 border-b border-gray-200">
            <div className="font-light text-[9px] tracking-wide text-gray-800">EMMA LARSSON</div>
            <div className="text-gray-500 text-[6px] mt-0.5">Product Designer</div>
            <div className="text-gray-400 text-[5px] mt-0.5">emma@design.com | Stockholm, Sweden</div>
          </div>
          <div className="space-y-1.5">
            <div className="font-light text-[6px] text-gray-700 tracking-wide">EXPERIENCE</div>
            <div className="font-normal text-gray-800">Lead Designer</div>
            <div className="text-gray-500 text-[5px]">Design Studio • 2021-Present</div>
            <div className="text-gray-600 leading-tight text-[5px]">Created user-centered designs for global brands...</div>
            <div className="font-light text-[6px] text-gray-700 tracking-wide mt-1">EDUCATION</div>
            <div className="font-normal text-gray-800">MA Design</div>
            <div className="text-gray-500 text-[5px]">Royal Institute • 2020</div>
          </div>
        </div>
      )
    }

    if (template.id === 'copenhagen') {
      return (
        <div className="h-48 rounded-lg border-2 border-gray-200 bg-white p-4 text-[6px]">
          <div className="mb-3">
            <div className="font-light text-[10px] text-gray-900">Lars Nielsen</div>
            <div className="text-gray-500 text-[6px]">UX Researcher</div>
          </div>
          <div className="space-y-2">
            <div>
              <div className="font-light text-[6px] text-gray-400 mb-0.5">EXPERIENCE</div>
              <div className="font-normal text-gray-800">Senior Researcher</div>
              <div className="text-gray-500 text-[5px]">Research Lab • 2022-Now</div>
            </div>
            <div>
              <div className="font-light text-[6px] text-gray-400 mb-0.5">EDUCATION</div>
              <div className="font-normal text-gray-800">PhD Human-Computer Interaction</div>
              <div className="text-gray-500 text-[5px]">Copenhagen University • 2021</div>
            </div>
          </div>
        </div>
      )
    }

    if (template.id === 'tokyo') {
      return (
        <div className="h-48 rounded-lg border-2 border-slate-300 bg-slate-50 p-2 text-[6px]">
          <div className="bg-slate-800 text-white p-1.5 rounded mb-1">
            <div className="font-bold text-[8px]">YUKI TANAKA</div>
            <div className="text-slate-300 text-[6px]">Full Stack Developer</div>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-slate-800">TECHNICAL SKILLS</div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="text-[5px] text-slate-600 w-8">React</span>
                <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full w-[90%] bg-slate-700"></div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[5px] text-slate-600 w-8">Node.js</span>
                <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-slate-700"></div>
                </div>
              </div>
            </div>
            <div className="font-semibold text-slate-800 mt-1">EXPERIENCE</div>
            <div className="font-medium text-slate-700">Senior Engineer</div>
            <div className="text-slate-500 text-[5px]">Tech Tokyo • 2020-2024</div>
          </div>
        </div>
      )
    }

    if (template.id === 'oxford') {
      return (
        <div className="h-48 rounded-lg border-2 border-amber-300 bg-amber-50/20 p-2 text-[6px]">
          <div className="text-center border-b-2 border-amber-400 pb-1 mb-1">
            <div className="font-serif font-bold text-[9px] text-amber-900">JAMES OXFORD</div>
            <div className="font-serif text-amber-700 text-[6px]">Research Fellow</div>
          </div>
          <div className="space-y-1">
            <div className="font-serif font-semibold text-amber-900">ACADEMIC POSITIONS</div>
            <div className="font-serif font-medium text-amber-800">Senior Research Fellow</div>
            <div className="text-amber-600 text-[5px]">Oxford University • 2020-Present</div>
            <div className="text-amber-700 leading-tight text-[5px]">Leading research in computational linguistics...</div>
            <div className="font-serif font-semibold text-amber-900 mt-1">PUBLICATIONS</div>
            <div className="text-amber-700 text-[5px] leading-tight">Oxford, J. et al. (2023). "Machine Learning Applications..."</div>
          </div>
        </div>
      )
    }

    if (template.id === 'milan') {
      return (
        <div className="h-48 rounded-lg border-2 border-rose-300 bg-gradient-to-br from-rose-50 to-pink-50 p-2 text-[6px]">
          <div className="mb-2">
            <div className="font-bold text-[10px] text-rose-900 tracking-tight">GIULIA ROSSI</div>
            <div className="font-semibold text-rose-700 text-[7px]">Fashion Designer</div>
            <div className="text-rose-600 text-[5px]">Milano, Italy | giulia@fashion.it</div>
          </div>
          <div className="space-y-1">
            <div className="font-bold text-rose-900 text-[6px]">EXPERIENCE</div>
            <div className="font-semibold text-rose-800">Creative Director</div>
            <div className="text-rose-600 text-[5px]">Luxury Brand • 2021-Now</div>
            <div className="text-rose-700 leading-tight text-[5px]">Designed collections for Milan Fashion Week...</div>
            <div className="font-bold text-rose-900 text-[6px] mt-1">AWARDS</div>
            <div className="text-rose-700 text-[5px]">🏆 Best New Designer 2023</div>
            <div className="text-rose-700 text-[5px]">🏆 Fashion Innovation Award 2022</div>
          </div>
        </div>
      )
    }

    if (template.id === 'sydney') {
      return (
        <div className="h-48 rounded-lg border-2 border-cyan-300 bg-white overflow-hidden text-[6px]">
          <div className="h-10 bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-1.5 flex items-center">
            <div>
              <div className="font-bold text-[9px]">OLIVIA SMITH</div>
              <div className="text-cyan-100 text-[6px]">Marketing Manager</div>
            </div>
          </div>
          <div className="p-2 space-y-1">
            <div className="font-semibold text-cyan-900">CAREER TIMELINE</div>
            <div className="flex gap-1">
              <div className="w-px bg-cyan-400"></div>
              <div className="flex-1">
                <div className="font-medium text-cyan-800">Marketing Lead</div>
                <div className="text-cyan-600 text-[5px]">Tech Startup • 2022-Now</div>
                <div className="text-gray-600 leading-tight text-[5px]">Grew brand awareness by 200%...</div>
              </div>
            </div>
            <div className="flex gap-1">
              <div className="w-px bg-cyan-300"></div>
              <div className="flex-1">
                <div className="font-medium text-cyan-800">Marketing Specialist</div>
                <div className="text-cyan-600 text-[5px]">Agency • 2020-2022</div>
              </div>
            </div>
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

  const renderFullPreview = (templateId: string) => {
    const data = resumeDemoData
    
    // Full-size preview with complete demo data
    const commonStyles = "bg-white shadow-2xl mx-auto"
    
    if (templateId === 'modern' || templateId === 'berlin') {
      const bgColor = templateId === 'berlin' ? 'bg-blue-600' : 'bg-teal-700'
      return (
        <div className={`${commonStyles} w-[210mm] min-h-[297mm] grid grid-cols-[35%_65%]`}>
          <div className={`${bgColor} p-8 text-white`}>
            <div className="w-32 h-32 bg-white rounded-full mx-auto mb-6"></div>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-3 border-b border-white/30 pb-2">CONTACT</h3>
                <div className="space-y-2 text-sm opacity-90">
                  <p>{data.personal.email}</p>
                  <p>{data.personal.phone}</p>
                  <p>{data.personal.location}</p>
                  <p>{data.personal.linkedin}</p>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-3 border-b border-white/30 pb-2">SKILLS</h3>
                <div className="space-y-1 text-sm opacity-90">
                  {data.skills.technical.split(', ').map((skill, idx) => (
                    <p key={idx}>• {skill}</p>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-3 border-b border-white/30 pb-2">LANGUAGES</h3>
                <p className="text-sm opacity-90">{data.languages}</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.personal.fullName.toUpperCase()}</h1>
            <h2 className="text-xl text-gray-700 mb-6">{data.personal.desiredRole}</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-3 border-b-2 border-gray-300 pb-1">PROFESSIONAL SUMMARY</h3>
                <p className="text-gray-700 leading-relaxed">{data.personal.summary}</p>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-3 border-b-2 border-gray-300 pb-1">EXPERIENCE</h3>
                <div className="space-y-4">
                  {data.experience.map((exp, idx) => (
                    <div key={idx}>
                      <h4 className="font-bold text-gray-900">{exp.title}</h4>
                      <p className="text-gray-600 text-sm">{exp.company} | {exp.duration}</p>
                      <p className="text-gray-700 mt-1 whitespace-pre-line text-sm">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-3 border-b-2 border-gray-300 pb-1">EDUCATION</h3>
                <div className="space-y-3">
                  {data.education.map((edu, idx) => (
                    <div key={idx}>
                      <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                      <p className="text-gray-600 text-sm">{edu.institution} | {edu.graduationYear}</p>
                      <p className="text-gray-700 text-sm">{edu.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (templateId === 'minimal' || templateId === 'stockholm' || templateId === 'copenhagen') {
      return (
        <div className={`${commonStyles} w-[210mm] min-h-[297mm] p-12`}>
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
            <h1 className="text-4xl font-light tracking-wide text-gray-900 mb-2">{data.personal.fullName.toUpperCase()}</h1>
            <h2 className="text-xl text-gray-600 mb-3">{data.personal.desiredRole}</h2>
            <p className="text-gray-500 text-sm">
              {data.personal.email} | {data.personal.phone} | {data.personal.location}
            </p>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="font-light text-xl text-gray-700 tracking-wide mb-4 border-b border-gray-200 pb-2">PROFESSIONAL SUMMARY</h3>
              <p className="text-gray-700 leading-relaxed">{data.personal.summary}</p>
            </div>
            
            <div>
              <h3 className="font-light text-xl text-gray-700 tracking-wide mb-4 border-b border-gray-200 pb-2">EXPERIENCE</h3>
              <div className="space-y-5">
                {data.experience.map((exp, idx) => (
                  <div key={idx}>
                    <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                    <p className="text-gray-600">{exp.company} | {exp.duration}</p>
                    <p className="text-gray-700 mt-2 whitespace-pre-line">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="font-light text-xl text-gray-700 tracking-wide mb-4 border-b border-gray-200 pb-2">EDUCATION</h3>
                <div className="space-y-4">
                  {data.education.map((edu, idx) => (
                    <div key={idx}>
                      <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                      <p className="text-gray-600 text-sm">{edu.institution}</p>
                      <p className="text-gray-500 text-sm">{edu.graduationYear}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-light text-xl text-gray-700 tracking-wide mb-4 border-b border-gray-200 pb-2">SKILLS</h3>
                <p className="text-gray-700 leading-relaxed">{data.skills.technical}</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (templateId === 'professional' || templateId === 'oxford') {
      const isOxford = templateId === 'oxford'
      return (
        <div className={`${commonStyles} w-[210mm] min-h-[297mm] p-12 ${isOxford ? 'bg-amber-50/20' : ''}`}>
          <div className={`mb-6 pb-4 ${isOxford ? 'border-b-4 border-amber-400 text-center' : 'border-b-4 border-gray-800'}`}>
            <h1 className={`text-4xl font-bold mb-2 ${isOxford ? 'font-serif text-amber-900' : 'text-gray-900'}`}>
              {data.personal.fullName.toUpperCase()}
            </h1>
            <h2 className={`text-xl ${isOxford ? 'font-serif text-amber-700' : 'text-gray-700'}`}>
              {data.personal.desiredRole}
            </h2>
            <p className={`text-sm mt-2 ${isOxford ? 'text-amber-600' : 'text-gray-600'}`}>
              {data.personal.email} | {data.personal.phone} | {data.personal.location}
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className={`font-bold text-lg mb-3 ${isOxford ? 'font-serif text-amber-900' : 'text-gray-900'}`}>
                PROFESSIONAL SUMMARY
              </h3>
              <p className={`leading-relaxed ${isOxford ? 'text-amber-800' : 'text-gray-700'}`}>
                {data.personal.summary}
              </p>
            </div>
            
            <div>
              <h3 className={`font-bold text-lg mb-3 ${isOxford ? 'font-serif text-amber-900' : 'text-gray-900'}`}>
                WORK EXPERIENCE
              </h3>
              <div className="space-y-4">
                {data.experience.map((exp, idx) => (
                  <div key={idx}>
                    <h4 className={`font-bold ${isOxford ? 'font-serif text-amber-900' : 'text-gray-900'}`}>
                      {exp.title}
                    </h4>
                    <p className={`text-sm ${isOxford ? 'text-amber-700' : 'text-gray-600'}`}>
                      {exp.company} | {exp.duration}
                    </p>
                    <p className={`mt-1 whitespace-pre-line ${isOxford ? 'text-amber-800' : 'text-gray-700'}`}>
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className={`font-bold text-lg mb-3 ${isOxford ? 'font-serif text-amber-900' : 'text-gray-900'}`}>
                  EDUCATION
                </h3>
                <div className="space-y-3">
                  {data.education.map((edu, idx) => (
                    <div key={idx}>
                      <h4 className={`font-bold ${isOxford ? 'font-serif text-amber-900' : 'text-gray-900'}`}>
                        {edu.degree}
                      </h4>
                      <p className={`text-sm ${isOxford ? 'text-amber-700' : 'text-gray-600'}`}>
                        {edu.institution} | {edu.graduationYear}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className={`font-bold text-lg mb-3 ${isOxford ? 'font-serif text-amber-900' : 'text-gray-900'}`}>
                  SKILLS
                </h3>
                <p className={`${isOxford ? 'text-amber-800' : 'text-gray-700'}`}>
                  {data.skills.technical}
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Default full preview for other templates
    return (
      <div className={`${commonStyles} w-[210mm] min-h-[297mm] p-12`}>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.personal.fullName}</h1>
        <h2 className="text-xl text-gray-700 mb-6">{data.personal.desiredRole}</h2>
        <div className="space-y-6">
          <p className="text-gray-700">{data.personal.summary}</p>
          <div>
            <h3 className="font-bold text-lg mb-3">EXPERIENCE</h3>
            {data.experience.map((exp, idx) => (
              <div key={idx} className="mb-4">
                <h4 className="font-bold">{exp.title}</h4>
                <p className="text-gray-600">{exp.company} | {exp.duration}</p>
                <p className="text-gray-700 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-5xl w-full">
            <button
              onClick={() => setPreviewTemplate(null)}
              className="absolute -top-12 right-0 bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100 transition-all shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="mt-4 overflow-y-auto max-h-[85vh]">
              {renderFullPreview(previewTemplate)}
            </div>
          </div>
        </div>
      )}

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
                <div className="space-y-2">
                  <button
                    onClick={() => setPreviewTemplate(template.id)}
                    className="w-full py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Full Resume
                  </button>
                  
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
