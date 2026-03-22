import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Lightbulb,
  FileText,
  Download,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { careerAPI } from '../api/client'
import { useResumeBuilderStore } from '../store/useResumeBuilderStore'

type TemplateType = 'modern' | 'minimal' | 'professional' | 'academic' | 'executive' | 'creative'

const PAGE_HEIGHT = 1122

const steps = [
  { id: 1, label: 'Personal' },
  { id: 2, label: 'Education' },
  { id: 3, label: 'Experience' },
  { id: 4, label: 'Projects' },
  { id: 5, label: 'Certs & Achievements' },
  { id: 6, label: 'Skills' },
  { id: 7, label: 'Hobbies & Languages' },
] as const

const fieldClass =
  'w-full rounded-xl border border-gray-200/90 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'

const textareaClass =
  'w-full rounded-xl border border-gray-200/90 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'

const cardClass =
  'rounded-2xl border border-emerald-100/80 bg-white/95 p-4 space-y-3 shadow-sm transition hover:shadow-md'

const sectionBlockStyle: CSSProperties = {
  marginBottom: '14px',
}

const templateMeta: Array<{ id: TemplateType; name: string; caption: string }> = [
  { id: 'modern', name: 'Modern', caption: 'Sidebar + bold accents' },
  { id: 'minimal', name: 'Minimal', caption: 'Clean ATS-friendly layout' },
  { id: 'professional', name: 'Professional', caption: 'Classic serif structure' },
  { id: 'academic', name: 'Academic', caption: 'Research style sections' },
  { id: 'executive', name: 'Executive', caption: 'Premium corporate heading' },
  { id: 'creative', name: 'Creative', caption: 'Highlight blocks and color bands' },
]

export default function MultiStepResumeBuilder() {
  const location = useLocation()
  
  const {
    step,
    setStep,
    nextStep,
    prevStep,
    personal,
    education,
    experience,
    projects,
    certificates,
    achievements,
    hobbies,
    languages,
    skills,
    updatePersonal,
    addEducation,
    removeEducation,
    updateEducation,
    addExperience,
    removeExperience,
    updateExperience,
    addProject,
    removeProject,
    updateProject,
    addCertificate,
    removeCertificate,
    updateCertificate,
    addAchievement,
    removeAchievement,
    updateAchievement,
    setHobbies,
    setLanguages,
    updateSkills,
    resetBuilder,
  } = useResumeBuilderStore()

  // Get template from location state or default to 'modern'
  const initialTemplate = (location.state as any)?.selectedTemplate || 'modern'
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(initialTemplate)
  const [enhancingSection, setEnhancingSection] = useState<'experience' | 'projects' | 'skills' | null>(null)
  const [smartAction, setSmartAction] = useState<'summary' | 'skills' | null>(null)
  const [demoLoading, setDemoLoading] = useState(false)
  const [onePageWarning, setOnePageWarning] = useState(false)

  const pageRef = useRef<HTMLDivElement>(null)
  const pageContentRef = useRef<HTMLDivElement>(null)

  const printableRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    contentRef: printableRef,
    documentTitle: `${personal.fullName || 'Resume'}_Resume`,
    pageStyle: `
      @page { size: A4 portrait; margin: 10mm; }
      @media print {
        html, body { margin: 0 !important; padding: 0 !important; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        * { box-sizing: border-box; }
      }
    `,
  })

  const progress = useMemo(() => Math.round((step / 7) * 100), [step])

  const contentLength = useMemo(() => {
    const core = [
      personal.fullName,
      personal.desiredRole,
      personal.summary,
      ...education.map((item) => `${item.degree} ${item.institution} ${item.details}`),
      ...experience.map((item) => `${item.title} ${item.company} ${item.description}`),
      ...projects.map((item) => `${item.title} ${item.techStack} ${item.description}`),
      ...certificates.map((item) => `${item.title} ${item.organization} ${item.year}`),
      ...achievements.map((item) => `${item.title} ${item.organization} ${item.year}`),
      skills.technical,
      skills.tools,
      skills.soft,
      hobbies,
      languages,
    ]
    return core.join(' ').length
  }, [
    achievements,
    certificates,
    education,
    experience,
    hobbies,
    languages,
    personal.desiredRole,
    personal.fullName,
    personal.summary,
    projects,
    skills.soft,
    skills.technical,
    skills.tools,
  ])

  const compactLevel = useMemo(() => {
    if (contentLength > 5400) return 'tight'
    if (contentLength > 3800) return 'compact'
    return 'normal'
  }, [contentLength])

  const paperStyle = useMemo<CSSProperties>(() => {
    const basePadding = compactLevel === 'tight' ? '34px 38px' : compactLevel === 'compact' ? '40px 46px' : '48px 56px'
    const baseFont = compactLevel === 'tight' ? '10.5px' : compactLevel === 'compact' ? '11px' : '12px'
    const baseLine = compactLevel === 'tight' ? '1.42' : compactLevel === 'compact' ? '1.48' : '1.55'

    if (selectedTemplate === 'professional') {
      return {
        width: '100%',
        height: `${PAGE_HEIGHT}px`,
        backgroundColor: '#ffffff',
        margin: '0 auto',
        padding: basePadding,
        fontFamily: 'Times New Roman, Times, serif',
        fontSize: baseFont,
        lineHeight: baseLine,
        color: '#1a1a1a',
        borderRadius: '6px',
        boxShadow: '0 12px 35px rgba(15, 23, 42, 0.15)',
        overflow: 'hidden',
      }
    }

    if (selectedTemplate === 'minimal') {
      return {
        width: '100%',
        height: `${PAGE_HEIGHT}px`,
        backgroundColor: '#ffffff',
        margin: '0 auto',
        padding: compactLevel === 'tight' ? '28px 34px' : compactLevel === 'compact' ? '34px 40px' : '40px 48px',
        fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        fontSize: baseFont,
        lineHeight: baseLine,
        color: '#111827',
        borderRadius: '6px',
        boxShadow: '0 12px 35px rgba(15, 23, 42, 0.15)',
        overflow: 'hidden',
      }
    }

    if (selectedTemplate === 'academic') {
      return {
        width: '100%',
        height: `${PAGE_HEIGHT}px`,
        backgroundColor: '#ffffff',
        margin: '0 auto',
        padding: compactLevel === 'tight' ? '30px 36px' : compactLevel === 'compact' ? '36px 44px' : '44px 52px',
        fontFamily: 'Georgia, Cambria, Times New Roman, Times, serif',
        fontSize: baseFont,
        lineHeight: baseLine,
        color: '#1f2937',
        borderRadius: '6px',
        boxShadow: '0 12px 35px rgba(15, 23, 42, 0.15)',
        overflow: 'hidden',
      }
    }

    if (selectedTemplate === 'executive') {
      return {
        width: '100%',
        height: `${PAGE_HEIGHT}px`,
        backgroundColor: '#fcfcfd',
        margin: '0 auto',
        padding: compactLevel === 'tight' ? '30px 34px' : compactLevel === 'compact' ? '36px 42px' : '42px 50px',
        fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        fontSize: baseFont,
        lineHeight: baseLine,
        color: '#0f172a',
        borderRadius: '6px',
        boxShadow: '0 12px 35px rgba(15, 23, 42, 0.15)',
        overflow: 'hidden',
      }
    }

    if (selectedTemplate === 'creative') {
      return {
        width: '100%',
        height: `${PAGE_HEIGHT}px`,
        backgroundColor: '#ffffff',
        margin: '0 auto',
        padding: compactLevel === 'tight' ? '20px 24px' : compactLevel === 'compact' ? '24px 28px' : '28px 34px',
        fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        fontSize: baseFont,
        lineHeight: baseLine,
        color: '#111827',
        borderRadius: '6px',
        boxShadow: '0 12px 35px rgba(15, 23, 42, 0.15)',
        overflow: 'hidden',
      }
    }

    return {
      width: '100%',
      height: `${PAGE_HEIGHT}px`,
      backgroundColor: '#ffffff',
      margin: '0 auto',
      padding: basePadding,
      fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      fontSize: baseFont,
      lineHeight: baseLine,
      color: '#1a1a1a',
      borderRadius: '6px',
      boxShadow: '0 12px 35px rgba(15, 23, 42, 0.15)',
      overflow: 'hidden',
    }
  }, [compactLevel, selectedTemplate])

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (!pageRef.current || !pageContentRef.current) return
      const isOver = pageContentRef.current.scrollHeight > pageRef.current.clientHeight - 8
      setOnePageWarning(isOver)
    })

    return () => cancelAnimationFrame(raf)
  }, [
    contentLength,
    compactLevel,
    selectedTemplate,
    personal,
    education,
    experience,
    projects,
    certificates,
    achievements,
    hobbies,
    languages,
    skills,
  ])

  const handleGenerateSummary = async () => {
    try {
      setSmartAction('summary')

      const educationText = education
        .map((item) => `${item.degree} from ${item.institution} (${item.graduationYear}). ${item.details}`)
        .join('\n')

      const experienceText = experience
        .map((item) => `${item.title} at ${item.company} (${item.duration}) - ${item.description}`)
        .join('\n')

      const response = await careerAPI.resumeAIAction({
        action: 'generate_summary',
        context: {
          name: personal.fullName,
          role: personal.desiredRole,
          education: educationText,
          experience: experienceText,
          skills: `Technical: ${skills.technical}. Tools: ${skills.tools}. Soft: ${skills.soft}`,
        },
      })

      updatePersonal({ summary: response.data?.result || personal.summary })
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to generate summary. Please try again.')
    } finally {
      setSmartAction(null)
    }
  }

  const handleSuggestSkills = async () => {
    try {
      setSmartAction('skills')

      const educationText = education
        .map((item) => `${item.degree} from ${item.institution}. ${item.details}`)
        .join('\n')

      const experienceText = experience
        .map((item) => `${item.title} at ${item.company}. ${item.description}`)
        .join('\n')

      const response = await careerAPI.resumeAIAction({
        action: 'suggest_skills',
        context: {
          education: educationText,
          experience: experienceText,
        },
      })

      const suggested = response.data?.result || ''
      if (suggested) {
        const existing = skills.technical.trim()
        updateSkills({ technical: existing ? `${existing}, ${suggested}` : suggested })
      }
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to suggest skills. Please try again.')
    } finally {
      setSmartAction(null)
    }
  }

  const fillWithAIDemoData = async () => {
    try {
      setDemoLoading(true)
      const response = await careerAPI.resumeAIAction({
        action: 'generate_demo_resume',
        context: { role: 'Full Stack Developer' },
      })

      const data = response.data?.result || {}
      resetBuilder()

      if (data.personal) {
        updatePersonal({
          fullName: data.personal.fullName || '',
          email: data.personal.email || '',
          phone: data.personal.phone || '',
          location: data.personal.location || '',
          desiredRole: data.personal.desiredRole || 'Full Stack Developer',
          summary: data.personal.summary || '',
        })
      }

      if (Array.isArray(data.education) && data.education.length > 0) {
        for (let i = 1; i < data.education.length; i += 1) addEducation()
        data.education.forEach((item: any, index: number) => {
          updateEducation(index, {
            degree: item.degree || '',
            institution: item.institution || '',
            graduationYear: item.graduationYear || '',
            details: item.details || '',
          })
        })
      }

      if (Array.isArray(data.experience) && data.experience.length > 0) {
        for (let i = 1; i < data.experience.length; i += 1) addExperience()
        data.experience.forEach((item: any, index: number) => {
          updateExperience(index, {
            title: item.title || '',
            company: item.company || '',
            duration: item.duration || '',
            description: item.description || '',
          })
        })
      }

      if (Array.isArray(data.projects) && data.projects.length > 0) {
        for (let i = 1; i < data.projects.length; i += 1) addProject()
        data.projects.forEach((item: any, index: number) => {
          updateProject(index, {
            title: item.title || '',
            techStack: item.techStack || '',
            description: item.description || '',
          })
        })
      }

      if (Array.isArray(data.certificates) && data.certificates.length > 0) {
        for (let i = 1; i < data.certificates.length; i += 1) addCertificate()
        data.certificates.forEach((item: any, index: number) => {
          updateCertificate(index, {
            title: item.title || '',
            organization: item.organization || '',
            year: item.year || '',
          })
        })
      }

      if (Array.isArray(data.achievements) && data.achievements.length > 0) {
        for (let i = 1; i < data.achievements.length; i += 1) addAchievement()
        data.achievements.forEach((item: any, index: number) => {
          updateAchievement(index, {
            title: item.title || '',
            organization: item.organization || '',
            year: item.year || '',
          })
        })
      }

      if (data.skills) {
        updateSkills({
          technical: data.skills.technical || '',
          tools: data.skills.tools || '',
          soft: data.skills.soft || '',
        })
      }

      if (Array.isArray(data.hobbies)) {
        setHobbies(data.hobbies.join(', '))
      }

      if (Array.isArray(data.languages)) {
        setLanguages(data.languages.join(', '))
      }

      setStep(1)
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Could not generate demo data right now.')
    } finally {
      setDemoLoading(false)
    }
  }

  const handleEnhanceExperience = async (index: number) => {
    try {
      setEnhancingSection('experience')
      const item = experience[index]
      const content = `Title: ${item.title}\nCompany: ${item.company}\nDuration: ${item.duration}\nDetails: ${item.description}`
      const response = await careerAPI.enhanceResumeSection({ section: 'experience', content })
      updateExperience(index, { description: response.data?.enhanced_content || item.description })
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to enhance experience. Please try again.')
    } finally {
      setEnhancingSection(null)
    }
  }

  const handleEnhanceProject = async (index: number) => {
    try {
      setEnhancingSection('projects')
      const item = projects[index]
      const content = `Title: ${item.title}\nTech Stack: ${item.techStack}\nDescription: ${item.description}`
      const response = await careerAPI.enhanceResumeSection({ section: 'projects', content })
      updateProject(index, { description: response.data?.enhanced_content || item.description })
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to enhance project. Please try again.')
    } finally {
      setEnhancingSection(null)
    }
  }

  const hobbyList = hobbies
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  const languageList = languages
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  const renderSectionTitle = (title: string): ReactNode => {
    if (selectedTemplate === 'minimal') {
      return <p style={{ fontSize: '10px', letterSpacing: '1.4px', textTransform: 'uppercase', color: '#111', textAlign: 'center', marginBottom: '7px' }}>{title}</p>
    }

    if (selectedTemplate === 'professional') {
      return (
        <div style={{ marginBottom: '8px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>{title}</p>
          <div style={{ height: '1px', backgroundColor: '#555' }} />
        </div>
      )
    }

    if (selectedTemplate === 'academic') {
      return <p style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#1d4ed8', marginBottom: '7px' }}>{title}</p>
    }

    if (selectedTemplate === 'executive') {
      return (
        <div style={{ marginBottom: '8px' }}>
          <p style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#0f172a', marginBottom: '4px' }}>{title}</p>
          <div style={{ height: '2px', width: '48px', backgroundColor: '#0f172a' }} />
        </div>
      )
    }

    if (selectedTemplate === 'creative') {
      return <p style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '1.3px', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '7px' }}>{title}</p>
    }

    return <p style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#115e59', marginBottom: '7px' }}>{title}</p>
  }

  const renderTemplateThumbnail = (templateId: TemplateType): ReactNode => {
    if (templateId === 'modern') {
      return (
        <div className="h-10 rounded-md border border-gray-200 overflow-hidden bg-white mb-1.5 grid grid-cols-[34%_66%]">
          <div className="bg-teal-700" />
          <div className="p-1.5 space-y-1">
            <div className="h-1.5 w-2/3 rounded bg-gray-300" />
            <div className="h-1 w-full rounded bg-gray-200" />
            <div className="h-1 w-5/6 rounded bg-gray-200" />
          </div>
        </div>
      )
    }

    if (templateId === 'minimal') {
      return (
        <div className="h-10 rounded-md border border-gray-200 bg-white mb-1.5 p-1.5">
          <div className="h-1.5 w-1/2 rounded bg-gray-400 mx-auto mb-1" />
          <div className="h-1 w-full rounded bg-gray-200 mb-1" />
          <div className="h-1 w-11/12 rounded bg-gray-200 mb-1" />
          <div className="h-1 w-3/4 rounded bg-gray-200" />
        </div>
      )
    }

    if (templateId === 'professional') {
      return (
        <div className="h-10 rounded-md border border-gray-200 bg-white mb-1.5 p-1.5">
          <div className="h-1.5 w-2/3 rounded bg-gray-500 mb-1" />
          <div className="h-px w-full bg-gray-500 mb-1" />
          <div className="h-1 w-full rounded bg-gray-200 mb-1" />
          <div className="h-1 w-5/6 rounded bg-gray-200" />
        </div>
      )
    }

    if (templateId === 'academic') {
      return (
        <div className="h-10 rounded-md border border-blue-200 bg-blue-50/30 mb-1.5 p-1.5">
          <div className="h-1.5 w-2/3 rounded bg-blue-400 mb-1" />
          <div className="h-1 w-full rounded bg-blue-100 mb-1" />
          <div className="h-1 w-10/12 rounded bg-blue-100 mb-1" />
          <div className="h-1 w-8/12 rounded bg-blue-100" />
        </div>
      )
    }

    if (templateId === 'executive') {
      return (
        <div className="h-10 rounded-md border border-slate-300 bg-slate-50 mb-1.5 overflow-hidden">
          <div className="h-2 bg-slate-800" />
          <div className="p-1.5 space-y-1">
            <div className="h-1.5 w-2/3 rounded bg-slate-500" />
            <div className="h-1 w-full rounded bg-slate-200" />
            <div className="h-1 w-5/6 rounded bg-slate-200" />
          </div>
        </div>
      )
    }

    return (
      <div className="h-10 rounded-md border border-violet-200 bg-violet-50 mb-1.5 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500" />
        <div className="p-1.5 space-y-1">
          <div className="h-1.5 w-2/3 rounded bg-violet-300" />
          <div className="h-1 w-full rounded bg-violet-100" />
          <div className="h-1 w-4/5 rounded bg-violet-100" />
        </div>
      </div>
    )
  }

  const renderStandardSections = () => (
    <>
      <div style={sectionBlockStyle}>
        {renderSectionTitle('Professional Summary')}
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{personal.summary || 'Professional summary will appear here...'}</p>
      </div>

      <div style={sectionBlockStyle}>
        {renderSectionTitle('Education')}
        {education.some((item) => item.degree || item.institution || item.graduationYear || item.details) ? (
          <div style={{ display: 'grid', rowGap: '8px' }}>
            {education.map((item, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <strong>{item.degree || '—'}</strong>
                    {item.institution && <span style={{ color: '#555' }}> — {item.institution}</span>}
                  </div>
                  {item.graduationYear && <span style={{ color: '#666' }}>{item.graduationYear}</span>}
                </div>
                {item.details && <p style={{ margin: '4px 0 0 0', color: '#444', whiteSpace: 'pre-wrap' }}>{item.details}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#9ca3af', fontStyle: 'italic' }}>Education details will appear here...</p>
        )}
      </div>

      <div style={sectionBlockStyle}>
        {renderSectionTitle('Work Experience')}
        {experience.some((item) => item.title || item.company || item.duration || item.description) ? (
          <div style={{ display: 'grid', rowGap: '8px' }}>
            {experience.map((item, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <strong>{item.title || '—'}</strong>
                    {item.company && <span style={{ color: '#555' }}> — {item.company}</span>}
                  </div>
                  {item.duration && <span style={{ color: '#666' }}>{item.duration}</span>}
                </div>
                {item.description && <p style={{ margin: '4px 0 0 0', color: '#444', whiteSpace: 'pre-wrap' }}>{item.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#9ca3af', fontStyle: 'italic' }}>Experience details will appear here...</p>
        )}
      </div>

      <div style={sectionBlockStyle}>
        {renderSectionTitle('Projects')}
        {projects.some((item) => item.title || item.techStack || item.description) ? (
          <div style={{ display: 'grid', rowGap: '8px' }}>
            {projects.map((item, index) => {
              const bullets = item.description.split('\n').map((line) => line.trim()).filter(Boolean)
              return (
                <div key={index}>
                  <strong>{item.title || 'Untitled Project'}</strong>
                  {item.techStack && <div style={{ color: '#555', marginTop: '2px' }}><strong>Stack:</strong> {item.techStack}</div>}
                  {bullets.length > 0 && (
                    <ul style={{ marginTop: '4px', paddingLeft: '16px', marginBottom: 0 }}>
                      {bullets.map((bullet, idx) => (
                        <li key={idx} style={{ lineHeight: 1.45 }}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#9ca3af', fontStyle: 'italic' }}>Project details will appear here...</p>
        )}
      </div>

      <div style={sectionBlockStyle}>
        {renderSectionTitle('Certificates')}
        {certificates.some((item) => item.title || item.organization || item.year) ? (
          <div style={{ display: 'grid', rowGap: '6px' }}>
            {certificates.map((item, index) => (
              <div key={index}>
                <strong>{item.title || '—'}</strong>
                <span style={{ color: '#555' }}>{item.organization ? ` — ${item.organization}` : ''}</span>
                <span style={{ color: '#666' }}>{item.year ? ` (${item.year})` : ''}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#9ca3af', fontStyle: 'italic' }}>Certificates will appear here...</p>
        )}
      </div>

      <div style={sectionBlockStyle}>
        {renderSectionTitle('Skills')}
        {(skills.technical || skills.tools || skills.soft) ? (
          <div style={{ lineHeight: 1.6 }}>
            {skills.technical && <div><strong>Technical: </strong>{skills.technical}</div>}
            {skills.tools && <div><strong>Tools: </strong>{skills.tools}</div>}
            {skills.soft && <div><strong>Soft: </strong>{skills.soft}</div>}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#9ca3af', fontStyle: 'italic' }}>Skills will appear here...</p>
        )}
      </div>

      <div style={sectionBlockStyle}>
        {renderSectionTitle('Achievements')}
        {achievements.some((item) => item.title || item.organization || item.year) ? (
          <div style={{ display: 'grid', rowGap: '6px' }}>
            {achievements.map((item, index) => (
              <div key={index}>
                <strong>{item.title || '—'}</strong>
                <span style={{ color: '#555' }}>{item.organization ? ` — ${item.organization}` : ''}</span>
                <span style={{ color: '#666' }}>{item.year ? ` (${item.year})` : ''}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#9ca3af', fontStyle: 'italic' }}>Achievements will appear here...</p>
        )}
      </div>

      <div style={sectionBlockStyle}>
        {renderSectionTitle('Hobbies')}
        {hobbyList.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {hobbyList.map((hobby, index) => (
              <span key={index} style={{ border: '1px solid #d1d5db', padding: '2px 8px', borderRadius: 999 }}>{hobby}</span>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#9ca3af', fontStyle: 'italic' }}>Hobbies will appear here...</p>
        )}
      </div>

      <div>
        {renderSectionTitle('Languages')}
        {languageList.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {languageList.map((language, index) => (
              <span key={index} style={{ border: '1px solid #d1d5db', padding: '2px 8px', borderRadius: 999 }}>{language}</span>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#9ca3af', fontStyle: 'italic' }}>Languages will appear here...</p>
        )}
      </div>
    </>
  )

  const renderPreviewBody = () => {
    if (selectedTemplate === 'modern') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '34% 66%', height: '100%' }}>
          <aside style={{ backgroundColor: '#0f766e', color: '#f0fdfa', padding: '18px 16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.3px', textTransform: 'uppercase', marginBottom: '10px' }}>Contact</p>
            <p style={{ margin: 0 }}>{personal.email || 'email@example.com'}</p>
            <p style={{ margin: '4px 0 0 0' }}>{personal.phone || '+91 99999 99999'}</p>
            <p style={{ margin: '4px 0 0 0' }}>{personal.location || 'City, Country'}</p>

            <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.3px', textTransform: 'uppercase', margin: '14px 0 8px 0' }}>Skills</p>
            <p style={{ margin: 0, lineHeight: 1.45 }}>{skills.technical || 'Technical skills'}</p>
            {skills.tools && <p style={{ margin: '6px 0 0 0', lineHeight: 1.45 }}>{skills.tools}</p>}

            <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.3px', textTransform: 'uppercase', margin: '14px 0 8px 0' }}>Languages</p>
            <p style={{ margin: 0, lineHeight: 1.45 }}>{languageList.join(', ') || 'Languages'}</p>

            <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.3px', textTransform: 'uppercase', margin: '14px 0 8px 0' }}>Hobbies</p>
            <p style={{ margin: 0, lineHeight: 1.45 }}>{hobbyList.join(', ') || 'Hobbies'}</p>
          </aside>

          <main style={{ padding: '18px 18px 8px 18px', overflow: 'hidden' }}>
            <div style={{ borderBottom: '2px solid #0f766e', paddingBottom: '8px', marginBottom: '10px' }}>
              <div style={{ fontSize: '23px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {personal.fullName || 'Your Full Name'}
              </div>
              {personal.desiredRole && <div style={{ marginTop: '3px', color: '#0f766e', fontWeight: 700 }}>{personal.desiredRole}</div>}
            </div>
            {renderStandardSections()}
          </main>
        </div>
      )
    }

    if (selectedTemplate === 'minimal') {
      return (
        <div style={{ height: '100%', overflow: 'hidden' }}>
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{personal.fullName || 'Your Full Name'}</div>
            <div style={{ marginTop: '4px', color: '#4b5563' }}>
              {[personal.email, personal.phone, personal.location].filter(Boolean).join(' • ') || 'email@example.com • +91 99999 99999 • City'}
            </div>
            {personal.desiredRole && <div style={{ marginTop: '5px', color: '#111827', fontWeight: 600 }}>{personal.desiredRole}</div>}
          </div>
          {renderStandardSections()}
        </div>
      )
    }

    if (selectedTemplate === 'professional') {
      return (
        <div style={{ height: '100%', overflow: 'hidden' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '0.8px' }}>{personal.fullName || 'Your Full Name'}</div>
            <div style={{ marginTop: '4px', color: '#374151' }}>
              {[personal.email, personal.phone, personal.location].filter(Boolean).join(' | ') || 'email@example.com | +91 99999 99999 | City'}
            </div>
            {personal.desiredRole && <div style={{ marginTop: '4px', color: '#111827', fontWeight: 700 }}>{personal.desiredRole}</div>}
          </div>
          {renderStandardSections()}
        </div>
      )
    }

    if (selectedTemplate === 'academic') {
      return (
        <div style={{ height: '100%', overflow: 'hidden' }}>
          <div style={{ borderBottom: '1px solid #93c5fd', paddingBottom: '8px', marginBottom: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{personal.fullName || 'Your Full Name'}</div>
            <div style={{ marginTop: '4px', color: '#334155' }}>
              {[personal.email, personal.phone, personal.location].filter(Boolean).join(' • ') || 'email@example.com • +91 99999 99999 • City'}
            </div>
            {personal.desiredRole && <div style={{ marginTop: '4px', color: '#1d4ed8', fontWeight: 700 }}>{personal.desiredRole}</div>}
          </div>
          {renderStandardSections()}
        </div>
      )
    }

    if (selectedTemplate === 'executive') {
      return (
        <div style={{ height: '100%', overflow: 'hidden' }}>
          <div style={{ border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', padding: '12px 14px', marginBottom: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '0.5px', color: '#0f172a' }}>{personal.fullName || 'Your Full Name'}</div>
            {personal.desiredRole && <div style={{ marginTop: '4px', color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{personal.desiredRole}</div>}
            <div style={{ marginTop: '6px', color: '#475569' }}>
              {[personal.email, personal.phone, personal.location].filter(Boolean).join(' | ') || 'email@example.com | +91 99999 99999 | City'}
            </div>
          </div>
          {renderStandardSections()}
        </div>
      )
    }

    if (selectedTemplate === 'creative') {
      return (
        <div style={{ height: '100%', overflow: 'hidden' }}>
          <div style={{
            background: 'linear-gradient(90deg, #7c3aed 0%, #4f46e5 60%, #06b6d4 100%)',
            color: '#fff',
            borderRadius: '8px',
            padding: '14px 16px',
            marginBottom: '12px',
          }}>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>{personal.fullName || 'Your Full Name'}</div>
            {personal.desiredRole && <div style={{ marginTop: '3px', fontWeight: 600 }}>{personal.desiredRole}</div>}
            <div style={{ marginTop: '6px', fontSize: '11px', opacity: 0.95 }}>
              {[personal.email, personal.phone, personal.location].filter(Boolean).join(' • ') || 'email@example.com • +91 99999 99999 • City'}
            </div>
          </div>
          {renderStandardSections()}
        </div>
      )
    }

    return (
      <div style={{ height: '100%', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{personal.fullName || 'Your Full Name'}</div>
        </div>
        {renderStandardSections()}
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-165px)] min-h-[560px] overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/70 p-3">
      <div className="grid h-full min-h-0 lg:grid-cols-[42%_58%] gap-5">
        <div className="h-full min-h-0 overflow-hidden flex flex-col rounded-2xl border border-white/80 bg-white/90 shadow-lg backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold gradient-text">✨ Resume Builder</h2>
              <p className="text-xs text-gray-500 mt-1">Build a clean, ATS-ready resume in minutes</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fillWithAIDemoData}
                disabled={demoLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs md:text-sm font-semibold text-violet-700 shadow-sm hover:bg-violet-100 disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {demoLoading ? 'Generating Demo...' : 'Fill with AI Demo Data'}
              </button>
              <button
                onClick={resetBuilder}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
            <div className="h-2.5 w-full rounded-full bg-white border border-emerald-100">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs font-semibold text-emerald-700 mt-2">Step {step} of 7</p>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 mb-4">
            {steps.map((item) => (
              <button
                key={item.id}
                onClick={() => setStep(item.id)}
                className={`rounded-xl px-2 py-2 text-xs font-semibold transition-all ${
                  step === item.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md scale-[1.01]'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-emerald-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input value={personal.fullName} onChange={(e) => updatePersonal({ fullName: e.target.value })} placeholder="Full Name" className={fieldClass} />
                  <input value={personal.desiredRole} onChange={(e) => updatePersonal({ desiredRole: e.target.value })} placeholder="Target Role (e.g. Frontend Developer)" className={fieldClass} />
                  <input value={personal.email} onChange={(e) => updatePersonal({ email: e.target.value })} placeholder="Email" className={fieldClass} />
                  <input value={personal.phone} onChange={(e) => updatePersonal({ phone: e.target.value })} placeholder="Phone" className={fieldClass} />
                  <input value={personal.location} onChange={(e) => updatePersonal({ location: e.target.value })} placeholder="Location" className={`${fieldClass} md:col-span-2`} />
                </div>
                <textarea value={personal.summary} onChange={(e) => updatePersonal({ summary: e.target.value })} placeholder="Professional Summary" rows={5} className={textareaClass} />
                <button onClick={handleGenerateSummary} disabled={smartAction === 'summary'} className="inline-flex items-center gap-2 rounded-lg border-2 border-violet-500 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-60">
                  <FileText className="h-4 w-4" />
                  {smartAction === 'summary' ? 'Generating...' : '✨ Generate Summary'}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {education.map((item, index) => (
                  <div key={index} className={cardClass}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-500">Education #{index + 1}</p>
                      <button onClick={() => removeEducation(index)} disabled={education.length === 1} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" />Delete</button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <input value={item.degree} onChange={(e) => updateEducation(index, { degree: e.target.value })} placeholder="Degree" className={fieldClass} />
                      <input value={item.institution} onChange={(e) => updateEducation(index, { institution: e.target.value })} placeholder="Institution" className={fieldClass} />
                      <input value={item.graduationYear} onChange={(e) => updateEducation(index, { graduationYear: e.target.value })} placeholder="Year" className={fieldClass} />
                    </div>
                    <textarea value={item.details} onChange={(e) => updateEducation(index, { details: e.target.value })} placeholder="Relevant coursework, GPA, key points" rows={4} className={textareaClass} />
                  </div>
                ))}
                <button onClick={addEducation} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"><Plus className="h-4 w-4" />+ Add More</button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                {experience.map((item, index) => (
                  <div key={index} className={cardClass}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-500">Experience #{index + 1}</p>
                      <button onClick={() => removeExperience(index)} disabled={experience.length === 1} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" />Delete</button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <input value={item.title} onChange={(e) => updateExperience(index, { title: e.target.value })} placeholder="Role" className={fieldClass} />
                      <input value={item.company} onChange={(e) => updateExperience(index, { company: e.target.value })} placeholder="Company" className={fieldClass} />
                      <input value={item.duration} onChange={(e) => updateExperience(index, { duration: e.target.value })} placeholder="Duration" className={fieldClass} />
                    </div>
                    <textarea value={item.description} onChange={(e) => updateExperience(index, { description: e.target.value })} placeholder="Responsibilities and impact (bullet lines supported)" rows={5} className={textareaClass} />
                    <button onClick={() => handleEnhanceExperience(index)} disabled={enhancingSection === 'experience'} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"><Sparkles className="h-4 w-4" />{enhancingSection === 'experience' ? 'Enhancing...' : 'AI Enhance'}</button>
                  </div>
                ))}
                <button onClick={addExperience} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"><Plus className="h-4 w-4" />+ Add More</button>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                {projects.map((item, index) => (
                  <div key={index} className={cardClass}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-500">Project #{index + 1}</p>
                      <button onClick={() => removeProject(index)} disabled={projects.length === 1} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" />Delete</button>
                    </div>
                    <input value={item.title} onChange={(e) => updateProject(index, { title: e.target.value })} placeholder="Project Title" className={fieldClass} />
                    <input value={item.techStack} onChange={(e) => updateProject(index, { techStack: e.target.value })} placeholder="Tech Stack" className={fieldClass} />
                    <textarea value={item.description} onChange={(e) => updateProject(index, { description: e.target.value })} placeholder="Description / Bullet points (one per line)" rows={5} className={textareaClass} />
                    <button onClick={() => handleEnhanceProject(index)} disabled={enhancingSection === 'projects'} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"><Sparkles className="h-4 w-4" />{enhancingSection === 'projects' ? 'Enhancing...' : 'AI Enhance'}</button>
                  </div>
                ))}
                <button onClick={addProject} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"><Plus className="h-4 w-4" />+ Add More</button>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-700">Certificates</p>
                    <button onClick={addCertificate} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700"><Plus className="h-3.5 w-3.5" />Add</button>
                  </div>
                  {certificates.map((item, index) => (
                    <div key={index} className="rounded-2xl border border-emerald-100/80 p-3.5 bg-white/95 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-500">Certificate #{index + 1}</p>
                        <button onClick={() => removeCertificate(index)} disabled={certificates.length === 1} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" />Delete</button>
                      </div>
                      <div className="grid md:grid-cols-3 gap-2">
                        <input value={item.title} onChange={(e) => updateCertificate(index, { title: e.target.value })} placeholder="Title" className={fieldClass} />
                        <input value={item.organization} onChange={(e) => updateCertificate(index, { organization: e.target.value })} placeholder="Organization" className={fieldClass} />
                        <input value={item.year} onChange={(e) => updateCertificate(index, { year: e.target.value })} placeholder="Year" className={fieldClass} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-700">Achievements</p>
                    <button onClick={addAchievement} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700"><Plus className="h-3.5 w-3.5" />Add</button>
                  </div>
                  {achievements.map((item, index) => (
                    <div key={index} className="rounded-2xl border border-emerald-100/80 p-3.5 bg-white/95 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-500">Achievement #{index + 1}</p>
                        <button onClick={() => removeAchievement(index)} disabled={achievements.length === 1} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" />Delete</button>
                      </div>
                      <div className="grid md:grid-cols-3 gap-2">
                        <input value={item.title} onChange={(e) => updateAchievement(index, { title: e.target.value })} placeholder="Title" className={fieldClass} />
                        <input value={item.organization} onChange={(e) => updateAchievement(index, { organization: e.target.value })} placeholder="Organization" className={fieldClass} />
                        <input value={item.year} onChange={(e) => updateAchievement(index, { year: e.target.value })} placeholder="Year" className={fieldClass} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <textarea value={skills.technical} onChange={(e) => updateSkills({ technical: e.target.value })} placeholder="Technical Skills" rows={4} className={textareaClass} />
                <textarea value={skills.tools} onChange={(e) => updateSkills({ tools: e.target.value })} placeholder="Tools & Platforms" rows={3} className={textareaClass} />
                <textarea value={skills.soft} onChange={(e) => updateSkills({ soft: e.target.value })} placeholder="Soft Skills" rows={3} className={textareaClass} />
                <button onClick={handleSuggestSkills} disabled={smartAction === 'skills'} className="inline-flex items-center gap-2 rounded-lg border-2 border-blue-500 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60"><Lightbulb className="h-4 w-4" />{smartAction === 'skills' ? 'Analysing...' : '💡 Suggest Missing Skills'}</button>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-4">
                <textarea value={hobbies} onChange={(e) => setHobbies(e.target.value)} placeholder="Hobbies (comma-separated)" rows={4} className={textareaClass} />
                <textarea value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="Languages (comma-separated)" rows={4} className={textareaClass} />
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-emerald-100 flex items-center justify-between">
            <button onClick={prevStep} disabled={step === 1} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"><ArrowLeft className="h-4 w-4" />Previous</button>
            <button onClick={nextStep} disabled={step === 7} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Next<ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="h-full min-h-0 overflow-hidden flex flex-col rounded-2xl border border-white/80 bg-white/90 shadow-lg p-4 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-lg md:text-xl font-bold gradient-text">📄 Live Preview</h3>
            <button onClick={handlePrint} className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-3 md:px-4 py-2.5 text-xs md:text-sm font-semibold text-white shadow-md hover:from-emerald-600 hover:to-teal-700 transition-all"><Download className="h-4 w-4" />Download PDF</button>
          </div>

          <div className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
            <p className="text-xs font-semibold text-emerald-800 mb-2">Choose Template</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {templateMeta.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`rounded-xl border p-2 text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'border-emerald-400 bg-white shadow-sm ring-2 ring-emerald-100'
                      : 'border-emerald-100 bg-white/80 hover:bg-white hover:border-emerald-200'
                  }`}
                >
                  {renderTemplateThumbnail(template.id)}
                  <p className="text-xs font-semibold text-gray-800">{template.name}</p>
                  <p className="text-[10px] text-gray-500">{template.caption}</p>
                </button>
              ))}
            </div>
          </div>

          {onePageWarning && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              Content exceeds one page, consider shortening.
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-emerald-100 bg-gradient-to-b from-gray-100 to-gray-200/80 p-3">
            <div ref={printableRef} style={{ width: '100%', maxWidth: '860px', margin: '0 auto' }}>
              <div ref={pageRef} style={paperStyle}>
                <div ref={pageContentRef} style={{ height: '100%', overflow: 'hidden' }}>
                  {renderPreviewBody()}
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-2">Template preview is live and print-ready</p>
        </div>
      </div>
    </div>
  )
}
