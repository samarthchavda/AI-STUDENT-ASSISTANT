import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Briefcase, GraduationCap, Settings, Plus, Trash2, Download, Layout, Mail, Phone, MapPin, ChevronRight, Eye, Type, ArrowLeft, Sparkles, Wand2 } from 'lucide-react';

// --- Types ---
interface Experience {
  id: number;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: number;
  school: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
}

interface ResumeData {
  personal: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    summary: string;
  };
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: { id: number; name: string; year: string }[];
}

interface TemplateProps {
  data: ResumeData;
  themeColor: string;
}

// --- Data Constants ---
const INITIAL_DATA: ResumeData = {
  personal: {
    fullName: "Alex Rivera",
    jobTitle: "Senior Product Designer",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 000-0000",
    address: "San Francisco, CA",
    website: "www.arivera.design",
    summary: "Strategic Product Designer with 8+ years of experience in building user-centric digital products. Proven track record of leading cross-functional teams to deliver high-impact solutions for FinTech and SaaS industries."
  },
  experience: [
    {
      id: 1,
      company: "TechNova Solutions",
      position: "Senior Designer",
      location: "San Francisco, CA",
      startDate: "2021-01",
      endDate: "Present",
      description: "Led the redesign of the core banking platform, resulting in a 40% increase in user engagement. Managed a team of 5 junior designers."
    },
    {
      id: 2,
      company: "Creative Pulse",
      position: "UI/UX Designer",
      location: "Austin, TX",
      startDate: "2018-06",
      endDate: "2020-12",
      description: "Collaborated with product managers to define roadmaps. Developed a design system that reduced production time by 25%."
    }
  ],
  education: [
    {
      id: 1,
      school: "Design Institute of Arts",
      degree: "BFA in Interaction Design",
      location: "New York, NY",
      startDate: "2014",
      endDate: "2018"
    }
  ],
  skills: ["Product Strategy", "UI/UX Design", "Figma", "React", "User Research", "Agile Methodologies", "Prototyping"],
  certifications: [{ id: 1, name: "Google UX Design Professional Certificate", year: "2020" }]
};

const TEMPLATES = [
  { id: 'modern', name: 'Modern Professional', color: '#2563eb' },
  { id: 'executive', name: 'Executive Suite', color: '#1e293b' },
  { id: 'creative', name: 'Creative Edge', color: '#db2777' },
  { id: 'minimal', name: 'Minimalist Clean', color: '#000000' }
];

// --- Template Components ---
const ModernTemplate = ({ data, themeColor }: TemplateProps) => (
  <div className="bg-white min-h-[1056px] p-12 font-sans text-gray-800 shadow-sm">
    <header className="border-b-4 pb-6" style={{ borderColor: themeColor }}>
      <h1 className="text-4xl font-bold tracking-tight uppercase text-gray-900">{data.personal.fullName || 'Your Name'}</h1>
      <p className="text-xl mt-1 font-medium" style={{ color: themeColor }}>{data.personal.jobTitle || 'Your Job Title'}</p>
      <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
        {data.personal.email && <span className="flex items-center gap-1"><Mail size={14} /> {data.personal.email}</span>}
        {data.personal.phone && <span className="flex items-center gap-1"><Phone size={14} /> {data.personal.phone}</span>}
        {data.personal.address && <span className="flex items-center gap-1"><MapPin size={14} /> {data.personal.address}</span>}
      </div>
    </header>
    <div className="grid grid-cols-12 gap-8 mt-8">
      <div className="col-span-8">
        {data.personal.summary && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase mb-3 border-b pb-1">Professional Summary</h2>
            <p className="text-sm leading-relaxed text-gray-700">{data.personal.summary}</p>
          </section>
        )}
        {data.experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase mb-4 border-b pb-1">Experience</h2>
            <div className="space-y-6">
              {data.experience.map((exp: Experience) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900">{exp.position}</h3>
                    <span className="text-xs font-semibold text-gray-500 uppercase">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  <p className="text-sm font-medium mb-2" style={{ color: themeColor }}>{exp.company} • {exp.location}</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      <div className="col-span-4 border-l pl-8">
        {data.education.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase mb-3 border-b pb-1">Education</h2>
            {data.education.map((edu: Education) => (
              <div key={edu.id} className="mb-4">
                <h3 className="font-bold text-sm">{edu.degree}</h3>
                <p className="text-xs text-gray-600">{edu.school}</p>
                <p className="text-xs text-gray-400">{edu.startDate} — {edu.endDate}</p>
              </div>
            ))}
          </section>
        )}
        {data.skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase mb-3 border-b pb-1">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-700 rounded">{skill}</span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  </div>
);

const ExecutiveTemplate = ({ data, themeColor }: TemplateProps) => (
  <div className="bg-white min-h-[1056px] font-serif text-slate-900 shadow-sm">
    <div className="h-4" style={{ backgroundColor: themeColor }}></div>
    <div className="p-12">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-light tracking-widest uppercase mb-2">{data.personal.fullName || 'Your Name'}</h1>
        <p className="text-lg tracking-[0.2em] uppercase mb-4" style={{ color: themeColor }}>{data.personal.jobTitle || 'Your Job Title'}</p>
        <div className="flex justify-center gap-6 text-sm text-slate-500 italic">
          {data.personal.email && <span>{data.personal.email}</span>}
          {data.personal.phone && <><span>•</span><span>{data.personal.phone}</span></>}
          {data.personal.address && <><span>•</span><span>{data.personal.address}</span></>}
        </div>
      </header>
      <div className="max-w-3xl mx-auto">
        {data.personal.summary && (
          <section className="mb-10 text-center">
            <p className="text-md leading-relaxed italic text-slate-700 font-medium">"{data.personal.summary}"</p>
          </section>
        )}
        {data.experience.length > 0 && (
          <div className="border-t border-slate-200 pt-8 mb-10">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] mb-6 text-center underline underline-offset-8">Professional Experience</h2>
            <div className="space-y-10">
              {data.experience.map((exp: Experience) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="text-xl font-semibold">{exp.company}</h3>
                    <span className="text-sm uppercase tracking-tighter text-slate-400 font-mono">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  <h4 className="text-md italic mb-3 opacity-80">{exp.position} | {exp.location}</h4>
                  <p className="text-sm leading-loose text-slate-700">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-12 border-t border-slate-200 pt-8">
          {data.education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] mb-4">Academic Background</h2>
              {data.education.map((edu: Education) => (
                <div key={edu.id} className="mb-4">
                  <h3 className="font-bold text-sm uppercase">{edu.degree}</h3>
                  <p className="text-sm italic">{edu.school}</p>
                  <p className="text-xs text-slate-400">{edu.startDate} — {edu.endDate}</p>
                </div>
              ))}
            </section>
          )}
          {data.skills.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] mb-4">Competencies</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {data.skills.map((skill: string, i: number) => (
                  <span key={i} className="text-sm border-b border-slate-100 pb-1 text-slate-600">{skill}</span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  </div>
);

const CreativeTemplate = ({ data, themeColor }: TemplateProps) => (
  <div className="bg-white min-h-[1056px] flex flex-row overflow-hidden shadow-sm">
    <aside className="w-1/3 p-10 text-white flex flex-col" style={{ backgroundColor: themeColor }}>
      <div className="mb-10">
        <h1 className="text-4xl font-black leading-tight mb-2">
          {data.personal.fullName.split(' ')[0] || 'First'}<br/>{data.personal.fullName.split(' ')[1] || 'Last'}
        </h1>
        <div className="h-1 w-12 bg-white mb-4"></div>
        <p className="text-lg font-medium opacity-90">{data.personal.jobTitle || 'Your Job Title'}</p>
      </div>
      <div className="space-y-8 flex-grow">
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-70">Contact</h3>
          <div className="space-y-3 text-sm">
            {data.personal.email && <p className="flex items-center gap-3"><Mail size={16} /> {data.personal.email}</p>}
            {data.personal.phone && <p className="flex items-center gap-3"><Phone size={16} /> {data.personal.phone}</p>}
            {data.personal.address && <p className="flex items-center gap-3"><MapPin size={16} /> {data.personal.address}</p>}
          </div>
        </section>
        {data.skills.length > 0 && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-70">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill: string, i: number) => (
                <span key={i} className="text-xs bg-white/20 px-2 py-1 rounded backdrop-blur-sm">{skill}</span>
              ))}
            </div>
          </section>
        )}
        {data.education.length > 0 && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-70">Education</h3>
            {data.education.map((edu: Education) => (
              <div key={edu.id} className="mb-4">
                <p className="font-bold text-sm leading-tight">{edu.degree}</p>
                <p className="text-xs opacity-80">{edu.school}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </aside>
    <main className="w-2/3 p-12 bg-stone-50">
      {data.personal.summary && (
        <section className="mb-12">
          <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter" style={{ color: themeColor }}>About Me</h2>
          <p className="text-sm leading-relaxed text-slate-600">{data.personal.summary}</p>
        </section>
      )}
      {data.experience.length > 0 && (
        <section>
          <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter" style={{ color: themeColor }}>Journey</h2>
          <div className="relative border-l-2 border-slate-200 ml-2 space-y-10 pl-8">
            {data.experience.map((exp: Experience) => (
              <div key={exp.id} className="relative">
                <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-white border-2" style={{ borderColor: themeColor }}></div>
                <div className="mb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{exp.startDate} — {exp.endDate}</span>
                  <h3 className="text-xl font-bold text-slate-800">{exp.position}</h3>
                  <p className="text-sm font-medium mb-3" style={{ color: themeColor }}>{exp.company}</p>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  </div>
);

const MinimalTemplate = ({ data }: TemplateProps) => (
  <div className="bg-white min-h-[1056px] p-16 font-sans text-neutral-900 shadow-sm flex flex-col">
    <header className="mb-12">
      <h1 className="text-3xl font-light tracking-tight mb-1">{data.personal.fullName || 'Your Name'}</h1>
      <p className="text-sm tracking-widest uppercase text-neutral-400 mb-6">{data.personal.jobTitle || 'Your Job Title'}</p>
      <div className="flex gap-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
        {data.personal.email && <span>{data.personal.email}</span>}
        {data.personal.phone && <><span>/</span><span>{data.personal.phone}</span></>}
        {data.personal.address && <><span>/</span><span>{data.personal.address}</span></>}
      </div>
    </header>
    <div className="space-y-12">
      {data.personal.summary && (
        <section className="grid grid-cols-4 gap-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300">Profile</h2>
          <div className="col-span-3">
            <p className="text-sm leading-relaxed">{data.personal.summary}</p>
          </div>
        </section>
      )}
      {data.experience.length > 0 && (
        <section className="grid grid-cols-4 gap-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300">Experience</h2>
          <div className="col-span-3 space-y-8">
            {data.experience.map((exp: Experience) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-sm font-bold">{exp.position} at {exp.company}</h3>
                  <span className="text-[10px] text-neutral-400">{exp.startDate} – {exp.endDate}</span>
                </div>
                <p className="text-xs text-neutral-500 mb-3 uppercase tracking-wide">{exp.location}</p>
                <p className="text-sm text-neutral-600 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {data.skills.length > 0 && (
        <section className="grid grid-cols-4 gap-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300">Skills</h2>
          <div className="col-span-3 flex flex-wrap gap-x-6 gap-y-2">
            {data.skills.map((skill: string, i: number) => (
              <span key={i} className="text-sm font-medium">{skill}</span>
            ))}
          </div>
        </section>
      )}
      {data.education.length > 0 && (
        <section className="grid grid-cols-4 gap-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300">Education</h2>
          <div className="col-span-3 space-y-4">
            {data.education.map((edu: Education) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-sm font-bold">{edu.school}</h3>
                  <span className="text-[10px] text-neutral-400">{edu.startDate} – {edu.endDate}</span>
                </div>
                <p className="text-xs text-neutral-500">{edu.degree}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  </div>
);

// --- Main Component ---
export default function ResumeBuilderFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get selected template from navigation state
  const initialTemplate = (location.state as any)?.selectedTemplate || 'modern';
  const initialColor = TEMPLATES.find(t => t.id === initialTemplate)?.color || '#2563eb';
  
  const [data, setData] = useState<ResumeData>(INITIAL_DATA);
  const [activeTemplate, setActiveTemplate] = useState(initialTemplate);
  const [activeTab, setActiveTab] = useState('personal');
  const [themeColor, setThemeColor] = useState(initialColor);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiField, setAiField] = useState<string | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (section: keyof ResumeData, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section: 'experience' | 'education', id: number, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      [section]: prev[section].map((item: any) => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addItem = (section: 'experience' | 'education') => {
    const newItem: any = section === 'experience' 
      ? { id: Date.now(), company: "", position: "", location: "", startDate: "", endDate: "", description: "" }
      : { id: Date.now(), school: "", degree: "", location: "", startDate: "", endDate: "" };
    setData(prev => ({ ...prev, [section]: [...prev[section], newItem] }));
  };

  const removeItem = (section: 'experience' | 'education', id: number) => {
    setData(prev => ({ ...prev, [section]: prev[section].filter((item: any) => item.id !== id) }));
  };

  const handleSkillChange = (value: string) => {
    setData(prev => ({ ...prev, skills: value.split(',').map((s: string) => s.trim()).filter(s => s) }));
  };

  // AI Enhancement Function
  const enhanceWithAI = async (field: string, currentValue: string) => {
    setAiLoading(true);
    setAiField(field);
    
    try {
      // Simulate AI enhancement - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let enhancedText = currentValue;
      
      if (field === 'summary') {
        enhancedText = `${currentValue || 'Results-driven professional'} with proven expertise in delivering high-impact solutions. Demonstrated ability to lead cross-functional teams and drive innovation in fast-paced environments. Committed to excellence and continuous improvement.`;
      } else if (field === 'description') {
        enhancedText = `${currentValue || 'Key responsibilities included'} • Led strategic initiatives resulting in measurable business impact\n• Collaborated with stakeholders to define and execute project roadmaps\n• Implemented best practices and process improvements\n• Mentored team members and fostered a culture of innovation`;
      } else if (field === 'skills') {
        const baseSkills = currentValue ? currentValue.split(',').map(s => s.trim()) : [];
        const suggestedSkills = ['Leadership', 'Project Management', 'Strategic Planning', 'Team Collaboration', 'Problem Solving'];
        enhancedText = [...new Set([...baseSkills, ...suggestedSkills])].join(', ');
      }
      
      return enhancedText;
    } catch (error) {
      console.error('AI enhancement error:', error);
      return currentValue;
    } finally {
      setAiLoading(false);
      setAiField(null);
    }
  };

  const handleAIEnhance = async (section: string, field: string, id?: number) => {
    if (section === 'personal') {
      const currentValue = (data.personal as any)[field] || '';
      const enhanced = await enhanceWithAI(field, currentValue);
      handleInputChange('personal', field, enhanced);
    } else if (section === 'experience' && id) {
      const exp = data.experience.find(e => e.id === id);
      if (exp) {
        const enhanced = await enhanceWithAI('description', exp.description);
        handleArrayChange('experience', id, 'description', enhanced);
      }
    } else if (section === 'skills') {
      const currentValue = data.skills.join(', ');
      const enhanced = await enhanceWithAI('skills', currentValue);
      handleSkillChange(enhanced);
    }
  };

  const printResume = () => {
    window.print();
  };

  const renderTemplate = () => {
    switch (activeTemplate) {
      case 'modern': return <ModernTemplate data={data} themeColor={themeColor} />;
      case 'executive': return <ExecutiveTemplate data={data} themeColor={themeColor} />;
      case 'creative': return <CreativeTemplate data={data} themeColor={themeColor} />;
      case 'minimal': return <MinimalTemplate data={data} themeColor={themeColor} />;
      default: return <ModernTemplate data={data} themeColor={themeColor} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/career/resume-templates')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Templates</span>
          </button>
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Layout size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Resume Builder</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border rounded-lg hover:bg-slate-50"
          >
            {isPreviewMode ? <Plus size={18} /> : <Eye size={18} />}
            {isPreviewMode ? 'Edit Mode' : 'Preview'}
          </button>
          <button 
            onClick={printResume}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200"
          >
            <Download size={18} />
            Download PDF
          </button>
        </div>
      </header>

      <main className={`flex-grow flex flex-col md:flex-row ${isPreviewMode ? 'justify-center p-8' : ''}`}>
        {/* Editor Sidebar */}
        {!isPreviewMode && (
          <aside className="w-full md:w-1/3 xl:w-1/4 bg-white border-r overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-thin">
            <div className="p-4 border-b flex overflow-x-auto gap-1 no-scrollbar sticky top-0 bg-white z-10">
              <button onClick={() => setActiveTab('personal')} className={`flex flex-col items-center p-2 rounded-lg flex-1 min-w-[70px] ${activeTab === 'personal' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}>
                <User size={20} />
                <span className="text-[10px] mt-1 font-bold">PROFILE</span>
              </button>
              <button onClick={() => setActiveTab('experience')} className={`flex flex-col items-center p-2 rounded-lg flex-1 min-w-[70px] ${activeTab === 'experience' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Briefcase size={20} />
                <span className="text-[10px] mt-1 font-bold">WORK</span>
              </button>
              <button onClick={() => setActiveTab('education')} className={`flex flex-col items-center p-2 rounded-lg flex-1 min-w-[70px] ${activeTab === 'education' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}>
                <GraduationCap size={20} />
                <span className="text-[10px] mt-1 font-bold">EDUCATION</span>
              </button>
              <button onClick={() => setActiveTab('skills')} className={`flex flex-col items-center p-2 rounded-lg flex-1 min-w-[70px] ${activeTab === 'skills' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Settings size={20} />
                <span className="text-[10px] mt-1 font-bold">SKILLS</span>
              </button>
              <button onClick={() => setActiveTab('style')} className={`flex flex-col items-center p-2 rounded-lg flex-1 min-w-[70px] ${activeTab === 'style' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Type size={20} />
                <span className="text-[10px] mt-1 font-bold">STYLE</span>
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'personal' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Personal Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={data.personal.fullName}
                        onChange={(e) => handleInputChange('personal', 'fullName', e.target.value)}
                        placeholder="John Doe"
                        className="w-full p-2 bg-slate-50 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Job Title</label>
                      <input 
                        type="text" 
                        value={data.personal.jobTitle}
                        onChange={(e) => handleInputChange('personal', 'jobTitle', e.target.value)}
                        placeholder="Senior Software Engineer"
                        className="w-full p-2 bg-slate-50 border rounded-md text-sm outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email</label>
                        <input type="email" value={data.personal.email} onChange={(e) => handleInputChange('personal', 'email', e.target.value)} placeholder="john@example.com" className="w-full p-2 bg-slate-50 border rounded-md text-sm outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone</label>
                        <input type="text" value={data.personal.phone} onChange={(e) => handleInputChange('personal', 'phone', e.target.value)} placeholder="+1 234 567 8900" className="w-full p-2 bg-slate-50 border rounded-md text-sm outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Address</label>
                      <input type="text" value={data.personal.address} onChange={(e) => handleInputChange('personal', 'address', e.target.value)} placeholder="San Francisco, CA" className="w-full p-2 bg-slate-50 border rounded-md text-sm outline-none" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Professional Summary</label>
                        <button
                          onClick={() => handleAIEnhance('personal', 'summary')}
                          disabled={aiLoading && aiField === 'summary'}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 transition-all disabled:opacity-50"
                        >
                          {aiLoading && aiField === 'summary' ? (
                            <>
                              <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                              <span>ENHANCING...</span>
                            </>
                          ) : (
                            <>
                              <Wand2 size={12} />
                              <span>AI ENHANCE</span>
                            </>
                          )}
                        </button>
                      </div>
                      <textarea 
                        rows={6}
                        value={data.personal.summary}
                        onChange={(e) => handleInputChange('personal', 'summary', e.target.value)}
                        placeholder="Write a brief summary about yourself..."
                        className="w-full p-2 bg-slate-50 border rounded-md text-sm outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Work Experience</h3>
                    <button onClick={() => addItem('experience')} className="text-blue-600 hover:bg-blue-50 p-1 rounded-full">
                      <Plus size={18} />
                    </button>
                  </div>
                  {data.experience.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase size={48} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No experience added yet</p>
                      <p className="text-xs mt-1">Click the + button to add your work experience</p>
                    </div>
                  )}
                  {data.experience.map((exp) => (
                    <div key={exp.id} className="p-4 border rounded-xl relative group bg-white shadow-sm hover:shadow-md transition-shadow">
                      <button 
                        onClick={() => removeItem('experience', exp.id)}
                        className="absolute -top-2 -right-2 bg-red-50 text-red-500 p-1.5 rounded-full border border-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="space-y-3">
                        <input placeholder="Company Name" value={exp.company} onChange={(e) => handleArrayChange('experience', exp.id, 'company', e.target.value)} className="w-full font-bold text-sm bg-transparent border-b border-transparent focus:border-blue-200 outline-none" />
                        <input placeholder="Job Title" value={exp.position} onChange={(e) => handleArrayChange('experience', exp.id, 'position', e.target.value)} className="w-full text-sm bg-transparent border-b border-transparent focus:border-blue-200 outline-none" />
                        <input placeholder="Location" value={exp.location} onChange={(e) => handleArrayChange('experience', exp.id, 'location', e.target.value)} className="w-full text-xs bg-slate-50 border rounded p-2 outline-none" />
                        <div className="flex gap-2">
                          <input placeholder="Start (e.g., 2020-01)" value={exp.startDate} onChange={(e) => handleArrayChange('experience', exp.id, 'startDate', e.target.value)} className="w-1/2 text-xs p-1 bg-slate-50 border rounded outline-none" />
                          <input placeholder="End (e.g., Present)" value={exp.endDate} onChange={(e) => handleArrayChange('experience', exp.id, 'endDate', e.target.value)} className="w-1/2 text-xs p-1 bg-slate-50 border rounded outline-none" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                            <button
                              onClick={() => handleAIEnhance('experience', 'description', exp.id)}
                              disabled={aiLoading && aiField === 'description'}
                              className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 transition-all disabled:opacity-50"
                            >
                              {aiLoading && aiField === 'description' ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                  <span>AI</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles size={12} />
                                  <span>AI</span>
                                </>
                              )}
                            </button>
                          </div>
                          <textarea placeholder="Describe your responsibilities and achievements..." rows={4} value={exp.description} onChange={(e) => handleArrayChange('experience', exp.id, 'description', e.target.value)} className="w-full text-xs p-2 bg-slate-50 border rounded outline-none resize-none" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Education</h3>
                    <button onClick={() => addItem('education')} className="text-blue-600 hover:bg-blue-50 p-1 rounded-full">
                      <Plus size={18} />
                    </button>
                  </div>
                  {data.education.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <GraduationCap size={48} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No education added yet</p>
                      <p className="text-xs mt-1">Click the + button to add your education</p>
                    </div>
                  )}
                  {data.education.map((edu) => (
                    <div key={edu.id} className="p-4 border rounded-xl relative group bg-white shadow-sm">
                      <button 
                        onClick={() => removeItem('education', edu.id)}
                        className="absolute -top-2 -right-2 bg-red-50 text-red-500 p-1.5 rounded-full border border-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="space-y-3">
                        <input placeholder="School/University" value={edu.school} onChange={(e) => handleArrayChange('education', edu.id, 'school', e.target.value)} className="w-full font-bold text-sm bg-transparent outline-none" />
                        <input placeholder="Degree (e.g., BS Computer Science)" value={edu.degree} onChange={(e) => handleArrayChange('education', edu.id, 'degree', e.target.value)} className="w-full text-sm bg-transparent outline-none" />
                        <input placeholder="Location" value={edu.location} onChange={(e) => handleArrayChange('education', edu.id, 'location', e.target.value)} className="w-full text-xs bg-slate-50 border rounded p-2 outline-none" />
                        <div className="flex gap-2">
                          <input placeholder="Start Year" value={edu.startDate} onChange={(e) => handleArrayChange('education', edu.id, 'startDate', e.target.value)} className="w-1/2 text-xs p-1 bg-slate-50 border rounded outline-none" />
                          <input placeholder="End Year" value={edu.endDate} onChange={(e) => handleArrayChange('education', edu.id, 'endDate', e.target.value)} className="w-1/2 text-xs p-1 bg-slate-50 border rounded outline-none" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Skills & Expertise</h3>
                    <button
                      onClick={() => handleAIEnhance('skills', 'skills')}
                      disabled={aiLoading && aiField === 'skills'}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all disabled:opacity-50"
                    >
                      {aiLoading && aiField === 'skills' ? (
                        <>
                          <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>SUGGESTING...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 size={14} />
                          <span>AI SUGGEST</span>
                        </>
                      )}
                    </button>
                  </div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Separate by comma</label>
                  <textarea 
                    rows={8}
                    value={data.skills.join(', ')}
                    onChange={(e) => handleSkillChange(e.target.value)}
                    className="w-full p-3 bg-slate-50 border rounded-md text-sm outline-none resize-none"
                    placeholder="e.g. JavaScript, React, Node.js, Python, AWS..."
                  />
                  <div className="flex flex-wrap gap-2 mt-4">
                    {data.skills.map((s, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'style' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Choose Template</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {TEMPLATES.map(t => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setActiveTemplate(t.id);
                            setThemeColor(t.color);
                          }}
                          className={`p-3 border rounded-xl flex items-center justify-between group transition-all ${
                            activeTemplate === t.id ? 'border-blue-600 bg-blue-50' : 'hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }}></div>
                            <span className={`text-sm font-medium ${activeTemplate === t.id ? 'text-blue-700' : 'text-slate-600'}`}>{t.name}</span>
                          </div>
                          <ChevronRight size={16} className={activeTemplate === t.id ? 'text-blue-500' : 'text-slate-300'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Accent Color</h3>
                    <div className="flex flex-wrap gap-3">
                      {['#2563eb', '#1e293b', '#db2777', '#16a34a', '#ea580c', '#7c3aed', '#000000'].map(color => (
                        <button 
                          key={color}
                          onClick={() => setThemeColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                            themeColor === color ? 'border-white ring-2 ring-slate-400 ring-offset-2' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Resume Preview Panel */}
        <section className={`flex-grow overflow-y-auto bg-slate-200/50 p-4 md:p-8 flex justify-center ${isPreviewMode ? 'w-full' : ''}`}>
          <div 
            ref={resumeRef}
            className="w-full max-w-[816px] transform transition-all duration-300"
            style={{ 
              boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
              margin: '0 auto'
            }}
          >
            {renderTemplate()}
          </div>
        </section>
      </main>

      {/* Global CSS for Printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          aside, header {
            display: none !important;
          }
          .min-h-screen {
            background-color: white !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }
          section.flex-grow {
            padding: 0 !important;
            display: block !important;
            background-color: transparent !important;
          }
          section.flex-grow * {
            visibility: visible !important;
          }
          .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl {
            box-shadow: none !important;
          }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
