import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Briefcase, GraduationCap, Settings, Plus, Trash2, Download, Layout, Mail, Phone, MapPin, Globe, Code, Languages, Link as LinkIcon, CheckCircle2, Sparkles, Sidebar, Palette, Github, Linkedin, Eye } from 'lucide-react';

// --- Expanded Data Structure ---
const INITIAL_DATA = {
  personal: {
    fullName: "Jordan Smith",
    jobTitle: "Senior Full Stack Engineer",
    email: "jordan.smith@dev.io",
    phone: "+1 (555) 123-4567",
    address: "New York, NY",
    website: "jordansmith.dev",
    github: "github.com/jsmith",
    linkedin: "linkedin.com/in/jordansmith",
    portfolio: "jordansmith.dev",
    summary: "Dedicated software architect with 10+ years of experience in building scalable web applications. Expert in React, Node.js, and Cloud Infrastructure. Passionate about clean code and mentoring high-performing engineering teams."
  },
  experience: [
    {
      id: 1,
      company: "CloudScale Systems",
      position: "Lead Engineer",
      location: "Remote",
      startDate: "2020-03",
      endDate: "Present",
      description: "Architected a microservices-based dashboard serving 2M+ active users. Improved API response times by 60% through aggressive caching strategies."
    },
    {
      id: 2,
      company: "Innovate AI",
      position: "Software Developer",
      location: "San Francisco, CA",
      startDate: "2017-06",
      endDate: "2020-02",
      description: "Implemented real-time data visualization tools using D3.js and WebSockets. Collaborated with data scientists to deploy ML models into production."
    }
  ],
  projects: [
    {
      id: 1,
      name: "OpenSource Auth Library",
      link: "github.com/jsmith/auth-lib",
      description: "A lightweight authentication library for React Native with 2k+ stars on GitHub."
    }
  ],
  education: [
    {
      id: 1,
      school: "University of Technology",
      degree: "MS in Computer Science",
      location: "Boston, MA",
      startDate: "2015",
      endDate: "2017"
    }
  ],
  skills: ["React", "TypeScript", "Node.js", "AWS", "Docker", "PostgreSQL", "System Design", "GraphQL"],
  languages: [
    { id: 1, name: "English", level: "Native" },
    { id: 2, name: "Spanish", level: "Professional" }
  ]
};

const TEMPLATES = [
  { id: 'modern', name: 'Modern Pro', color: '#3b82f6' },
  { id: 'executive', name: 'Executive', color: '#0f172a' },
  { id: 'creative', name: 'Creative', color: '#ec4899' },
  { id: 'minimal', name: 'Minimalist', color: '#18181b' },
  { id: 'elegant', name: 'Elegant Serif', color: '#7c2d12' },
  { id: 'tech', name: 'Terminal / Tech', color: '#16a34a' }
];

// --- Specialized Templates ---
const ElegantTemplate = ({ data, themeColor }: any) => (
  <div className="bg-white min-h-[1056px] p-16 font-serif text-stone-900">
    <header className="text-center border-b-2 border-stone-200 pb-8 mb-10">
      <h1 className="text-5xl font-bold tracking-tight mb-3" style={{ color: themeColor }}>{data.personal.fullName}</h1>
      <p className="text-xl italic text-stone-500 mb-4">{data.personal.jobTitle}</p>
      <div className="flex justify-center gap-4 text-xs uppercase tracking-widest text-stone-400">
        <span>{data.personal.email}</span>
        <span>•</span>
        <span>{data.personal.phone}</span>
        <span>•</span>
        <span>{data.personal.address}</span>
      </div>
      {(data.personal.github || data.personal.linkedin || data.personal.portfolio) && (
        <div className="flex justify-center gap-4 text-xs mt-3">
          {data.personal.github && (
            <a href={`https://${data.personal.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-stone-500 hover:text-stone-700">
              <Github size={12} /> {data.personal.github}
            </a>
          )}
          {data.personal.linkedin && (
            <a href={`https://${data.personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-stone-500 hover:text-stone-700">
              <Linkedin size={12} /> LinkedIn
            </a>
          )}
          {data.personal.portfolio && (
            <a href={`https://${data.personal.portfolio}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-stone-500 hover:text-stone-700">
              <Globe size={12} /> {data.personal.portfolio}
            </a>
          )}
        </div>
      )}
    </header>
    <div className="grid grid-cols-3 gap-12">
      <div className="col-span-2 space-y-10">
        <section>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 border-b pb-1">Profile</h2>
          <p className="text-sm leading-relaxed text-stone-600 italic">"{data.personal.summary}"</p>
        </section>
        <section>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 border-b pb-1">Experience</h2>
          {data.experience.map((exp: any) => (
            <div key={exp.id} className="mb-6">
              <div className="flex justify-between font-bold text-stone-800">
                <h3>{exp.position}</h3>
                <span>{exp.startDate} – {exp.endDate}</span>
              </div>
              <p className="text-sm font-medium italic mb-2" style={{ color: themeColor }}>{exp.company}, {exp.location}</p>
              <p className="text-sm text-stone-600">{exp.description}</p>
            </div>
          ))}
        </section>
        {data.projects && data.projects.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 border-b pb-1">Projects</h2>
            {data.projects.map((proj: any) => (
              <div key={proj.id} className="mb-4">
                <h3 className="font-bold text-stone-800">{proj.name}</h3>
                {proj.link && (
                  <a href={`https://${proj.link}`} target="_blank" rel="noopener noreferrer" className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1">
                    <LinkIcon size={10} /> {proj.link}
                  </a>
                )}
                <p className="text-sm text-stone-600 mt-1">{proj.description}</p>
              </div>
            ))}
          </section>
        )}
      </div>
      <div className="space-y-10">
        <section>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 border-b pb-1">Education</h2>
          {data.education.map((edu: any) => (
            <div key={edu.id} className="text-sm mb-4">
              <p className="font-bold">{edu.degree}</p>
              <p>{edu.school}</p>
              <p className="text-stone-400 text-xs">{edu.startDate} – {edu.endDate}</p>
            </div>
          ))}
        </section>
        <section>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 border-b pb-1">Skills</h2>
          <div className="flex flex-col gap-2">
            {data.skills.map((s: string, i: number) => (
              <span key={i} className="text-sm text-stone-600">• {s}</span>
            ))}
          </div>
        </section>
        {data.languages && data.languages.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 border-b pb-1">Languages</h2>
            {data.languages.map((lang: any) => (
              <div key={lang.id} className="flex justify-between text-sm mb-2">
                <span>{lang.name}</span>
                <span className="text-stone-400">{lang.level}</span>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  </div>
);

const TechTemplate = ({ data, themeColor }: any) => (
  <div className="bg-zinc-950 min-h-[1056px] p-12 font-mono text-zinc-300">
    <header className="border-l-4 p-6 mb-10" style={{ borderColor: themeColor }}>
      <h1 className="text-4xl font-bold text-white mb-2">&gt; {data.personal.fullName}</h1>
      <p className="text-xl mb-4" style={{ color: themeColor }}>[{data.personal.jobTitle}]</p>
      <div className="text-xs opacity-60 space-y-1">
        <div>{data.personal.email} | {data.personal.phone} | {data.personal.address}</div>
        <div className="flex gap-4 mt-2">
          {data.personal.github && (
            <a href={`https://${data.personal.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">
              <Github size={12} /> GitHub
            </a>
          )}
          {data.personal.linkedin && (
            <a href={`https://${data.personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">
              <Linkedin size={12} /> LinkedIn
            </a>
          )}
          {data.personal.portfolio && (
            <a href={`https://${data.personal.portfolio}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">
              <Globe size={12} /> Portfolio
            </a>
          )}
        </div>
      </div>
    </header>
    <div className="space-y-12">
      <section>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span style={{ color: themeColor }}>#</span> root@summary: ~
        </h2>
        <p className="text-sm leading-relaxed border-l border-zinc-800 pl-4">{data.personal.summary}</p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <span style={{ color: themeColor }}>#</span> root@experience: ~
        </h2>
        <div className="space-y-8">
          {data.experience.map((exp: any) => (
            <div key={exp.id} className="border border-zinc-800 p-4 rounded bg-zinc-900/50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-bold">{exp.position} @ {exp.company}</h3>
                <span className="text-xs font-bold" style={{ color: themeColor }}>{exp.startDate} - {exp.endDate}</span>
              </div>
              <p className="text-sm opacity-80">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>
      {data.projects && data.projects.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span style={{ color: themeColor }}>#</span> root@projects: ~
          </h2>
          <div className="space-y-4">
            {data.projects.map((proj: any) => (
              <div key={proj.id} className="border border-zinc-800 p-4 rounded bg-zinc-900/50">
                <h3 className="text-white font-bold mb-1">{proj.name}</h3>
                {proj.link && (
                  <a href={`https://${proj.link}`} target="_blank" rel="noopener noreferrer" className="text-xs opacity-60 hover:opacity-100 flex items-center gap-1">
                    <LinkIcon size={10} /> {proj.link}
                  </a>
                )}
                <p className="text-sm opacity-80 mt-2">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span style={{ color: themeColor }}>#</span> root@skills: ~
        </h2>
        <div className="flex flex-wrap gap-3">
          {data.skills.map((s: string, i: number) => (
            <span key={i} className="text-xs px-2 py-1 border border-zinc-700 rounded hover:border-zinc-500 cursor-default">{s}</span>
          ))}
        </div>
      </section>
    </div>
  </div>
);

const ModernProTemplate = ({ data, themeColor }: any) => (
  <div className="bg-white min-h-[1056px] flex flex-col font-sans text-slate-800">
    <div className="h-2 w-full" style={{ backgroundColor: themeColor }}></div>
    <div className="p-12">
      <header className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">{data.personal.fullName}</h1>
          <p className="text-2xl font-medium tracking-tight" style={{ color: themeColor }}>{data.personal.jobTitle}</p>
          <div className="flex gap-4 mt-3">
            {data.personal.github && (
              <a href={`https://${data.personal.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
                <Github size={14} /> GitHub
              </a>
            )}
            {data.personal.linkedin && (
              <a href={`https://${data.personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
                <Linkedin size={14} /> LinkedIn
              </a>
            )}
            {data.personal.portfolio && (
              <a href={`https://${data.personal.portfolio}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
                <Globe size={14} /> Portfolio
              </a>
            )}
          </div>
        </div>
        <div className="text-right text-sm space-y-1 text-slate-500 font-medium">
          <p className="flex items-center justify-end gap-2">{data.personal.email} <Mail size={14} /></p>
          <p className="flex items-center justify-end gap-2">{data.personal.phone} <Phone size={14} /></p>
          <p className="flex items-center justify-end gap-2">{data.personal.address} <MapPin size={14} /></p>
        </div>
      </header>
      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-8 space-y-10">
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
              <div className="w-8 h-[2px]" style={{ backgroundColor: themeColor }}></div> Summary
            </h2>
            <p className="text-md leading-relaxed">{data.personal.summary}</p>
          </section>
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <div className="w-8 h-[2px]" style={{ backgroundColor: themeColor }}></div> Experience
            </h2>
            <div className="space-y-10">
              {data.experience.map((exp: any) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="text-xl font-bold">{exp.position}</h3>
                    <span className="text-sm font-bold text-slate-400">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  <p className="font-bold text-lg mb-3" style={{ color: themeColor }}>{exp.company}</p>
                  <p className="text-slate-600 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
          {data.projects && data.projects.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                <div className="w-8 h-[2px]" style={{ backgroundColor: themeColor }}></div> Projects
              </h2>
              <div className="space-y-6">
                {data.projects.map((proj: any) => (
                  <div key={proj.id}>
                    <h3 className="text-lg font-bold">{proj.name}</h3>
                    {proj.link && (
                      <a href={`https://${proj.link}`} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                        <LinkIcon size={12} /> {proj.link}
                      </a>
                    )}
                    <p className="text-slate-600 mt-2">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        <div className="col-span-4 space-y-10">
          <section className="bg-slate-50 p-6 rounded-2xl">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Core Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm">{s}</span>
              ))}
            </div>
          </section>
          <section className="p-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Education</h2>
            {data.education.map((edu: any) => (
              <div key={edu.id} className="mb-4">
                <p className="font-bold text-sm">{edu.degree}</p>
                <p className="text-xs text-slate-500">{edu.school}</p>
              </div>
            ))}
          </section>
          {data.languages && data.languages.length > 0 && (
            <section className="p-6">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Languages</h2>
              <div className="space-y-2">
                {data.languages.map((lang: any) => (
                  <div key={lang.id} className="flex justify-between text-sm">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-slate-400">{lang.level}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  </div>
);

// --- App Shell ---
export default function ResumeBuilderFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get selected template from navigation state
  const initialTemplate = (location.state as any)?.selectedTemplate || 'modern';
  const initialColor = TEMPLATES.find(t => t.id === initialTemplate)?.color || '#3b82f6';
  
  const [data, setData] = useState(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState('personal');
  const [activeTemplate, setActiveTemplate] = useState(initialTemplate);
  const [themeColor, setThemeColor] = useState(initialColor);
  const [isPreview, setIsPreview] = useState(false);

  const CATEGORIES = [
    { id: 'personal', label: 'Identity', icon: <User size={18} /> },
    { id: 'summary', label: 'Summary', icon: <Sparkles size={18} /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase size={18} /> },
    { id: 'education', label: 'Education', icon: <GraduationCap size={18} /> },
    { id: 'skills', label: 'Expertise', icon: <Settings size={18} /> },
    { id: 'projects', label: 'Projects', icon: <Code size={18} /> },
    { id: 'languages', label: 'Languages', icon: <Languages size={18} /> },
    { id: 'style', label: 'Branding', icon: <Palette size={18} /> }
  ];

  const handleUpdate = (path: string, value: any) => {
    const keys = path.split('.');
    setData(prev => {
      const newData: any = { ...prev };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addItem = (section: string) => {
    const templates: any = {
      experience: { id: Date.now(), company: '', position: '', location: '', startDate: '', endDate: '', description: '' },
      education: { id: Date.now(), school: '', degree: '', location: '', startDate: '', endDate: '' },
      projects: { id: Date.now(), name: '', link: '', description: '' },
      languages: { id: Date.now(), name: '', level: 'Fluent' }
    };
    setData(prev => ({ ...prev, [section]: [...(prev as any)[section], templates[section]] }));
  };

  const removeItem = (section: string, id: number) => {
    setData(prev => ({ ...prev, [section]: (prev as any)[section].filter((item: any) => item.id !== id) }));
  };

  const renderCurrentTemplate = () => {
    const props = { data, themeColor };
    switch (activeTemplate) {
      case 'modern': return <ModernProTemplate {...props} />;
      case 'elegant': return <ElegantTemplate {...props} />;
      case 'tech': return <TechTemplate {...props} />;
      default: return <ModernProTemplate {...props} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-900">
      {/* Dynamic Sidebar */}
      {!isPreview && (
        <aside className="w-80 bg-white border-r flex flex-col shadow-xl z-20">
          <div className="p-6 border-b flex items-center gap-3">
            <button
              onClick={() => navigate('/career/resume-templates')}
              className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
            >
              <Layout size={20} />
            </button>
            <div>
              <h1 className="font-black text-lg tracking-tight">RESUME<span className="text-indigo-600">PRO</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Builder v2.5</p>
            </div>
          </div>
          <nav className="flex-grow overflow-y-auto p-4 space-y-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  activeTab === cat.id ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`${activeTab === cat.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {cat.icon}
                </span>
                {cat.label}
                {activeTab === cat.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t">
            <button 
              onClick={() => window.print()}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            >
              <Download size={18} /> Export PDF
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col md:flex-row bg-slate-100 overflow-hidden relative">
        {/* Editor Form Panel */}
        {!isPreview && (
          <div className="w-full md:w-[450px] bg-white border-r overflow-y-auto p-8 animate-in slide-in-from-left duration-300">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 mb-2">{CATEGORIES.find(c => c.id === activeTab)?.label}</h2>
              <p className="text-sm text-slate-500">Update your professional details here.</p>
            </div>

            {activeTab === 'personal' && (
              <div className="space-y-5">
                {[
                  { label: 'Full Name', key: 'fullName' },
                  { label: 'Job Title', key: 'jobTitle' },
                  { label: 'Email Address', key: 'email' },
                  { label: 'Phone Number', key: 'phone' },
                  { label: 'Location', key: 'address' },
                  { label: 'Personal Website', key: 'website' },
                  { label: 'GitHub Profile', key: 'github', placeholder: 'github.com/username' },
                  { label: 'LinkedIn Profile', key: 'linkedin', placeholder: 'linkedin.com/in/username' },
                  { label: 'Portfolio URL', key: 'portfolio', placeholder: 'yourportfolio.com' }
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1 block">{field.label}</label>
                    <input 
                      type="text" 
                      value={(data.personal as any)[field.key] || ''} 
                      onChange={(e) => handleUpdate(`personal.${field.key}`, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'summary' && (
              <div>
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2 block">Professional Summary</label>
                <textarea 
                  rows={10}
                  value={data.personal.summary}
                  onChange={(e) => handleUpdate('personal.summary', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="Tell your professional story..."
                />
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-6">
                {data.experience.map((exp, idx) => (
                  <div key={exp.id} className="p-5 border-2 border-slate-100 rounded-2xl relative group hover:border-indigo-100 transition-colors">
                    <button 
                      onClick={() => removeItem('experience', exp.id)} 
                      className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="space-y-4">
                      <input 
                        placeholder="Company Name" 
                        className="font-bold w-full outline-none bg-transparent" 
                        value={exp.company} 
                        onChange={e => handleUpdate(`experience.${idx}.company`, e.target.value)} 
                      />
                      <input 
                        placeholder="Job Title" 
                        className="w-full outline-none text-sm text-slate-600 bg-transparent" 
                        value={exp.position} 
                        onChange={e => handleUpdate(`experience.${idx}.position`, e.target.value)} 
                      />
                      <input 
                        placeholder="Location" 
                        className="w-full outline-none text-sm text-slate-600 bg-slate-50 p-2 rounded" 
                        value={exp.location} 
                        onChange={e => handleUpdate(`experience.${idx}.location`, e.target.value)} 
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          placeholder="Start (2020-01)" 
                          className="text-xs bg-slate-50 p-2 rounded outline-none" 
                          value={exp.startDate} 
                          onChange={e => handleUpdate(`experience.${idx}.startDate`, e.target.value)} 
                        />
                        <input 
                          placeholder="End (Present)" 
                          className="text-xs bg-slate-50 p-2 rounded outline-none" 
                          value={exp.endDate} 
                          onChange={e => handleUpdate(`experience.${idx}.endDate`, e.target.value)} 
                        />
                      </div>
                      <textarea 
                        placeholder="Description" 
                        rows={4} 
                        className="w-full text-xs bg-slate-50 p-3 rounded-lg outline-none" 
                        value={exp.description} 
                        onChange={e => handleUpdate(`experience.${idx}.description`, e.target.value)} 
                      />
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => addItem('experience')} 
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Add Role
                </button>
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-6">
                {data.education.map((edu, idx) => (
                  <div key={edu.id} className="p-5 border-2 border-slate-100 rounded-2xl relative group hover:border-indigo-100 transition-colors">
                    <button 
                      onClick={() => removeItem('education', edu.id)} 
                      className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="space-y-4">
                      <input 
                        placeholder="School/University" 
                        className="font-bold w-full outline-none bg-transparent" 
                        value={edu.school} 
                        onChange={e => handleUpdate(`education.${idx}.school`, e.target.value)} 
                      />
                      <input 
                        placeholder="Degree" 
                        className="w-full outline-none text-sm text-slate-600 bg-transparent" 
                        value={edu.degree} 
                        onChange={e => handleUpdate(`education.${idx}.degree`, e.target.value)} 
                      />
                      <input 
                        placeholder="Location" 
                        className="w-full outline-none text-sm text-slate-600 bg-slate-50 p-2 rounded" 
                        value={edu.location} 
                        onChange={e => handleUpdate(`education.${idx}.location`, e.target.value)} 
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          placeholder="Start Year" 
                          className="text-xs bg-slate-50 p-2 rounded outline-none" 
                          value={edu.startDate} 
                          onChange={e => handleUpdate(`education.${idx}.startDate`, e.target.value)} 
                        />
                        <input 
                          placeholder="End Year" 
                          className="text-xs bg-slate-50 p-2 rounded outline-none" 
                          value={edu.endDate} 
                          onChange={e => handleUpdate(`education.${idx}.endDate`, e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => addItem('education')} 
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Add Education
                </button>
              </div>
            )}

            {activeTab === 'skills' && (
              <div>
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-4 block">Key Competencies (Comma separated)</label>
                <textarea 
                  rows={8}
                  value={data.skills.join(', ')}
                  onChange={e => setData(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                {data.projects.map((proj, idx) => (
                  <div key={proj.id} className="p-5 border-2 border-slate-100 rounded-2xl relative group hover:border-indigo-100 transition-colors">
                    <button 
                      onClick={() => removeItem('projects', proj.id)} 
                      className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="space-y-4">
                      <input 
                        placeholder="Project Name" 
                        className="font-bold w-full outline-none bg-transparent" 
                        value={proj.name} 
                        onChange={e => handleUpdate(`projects.${idx}.name`, e.target.value)} 
                      />
                      <input 
                        placeholder="Project Link (github.com/...)" 
                        className="w-full outline-none text-sm text-slate-600 bg-slate-50 p-2 rounded" 
                        value={proj.link} 
                        onChange={e => handleUpdate(`projects.${idx}.link`, e.target.value)} 
                      />
                      <textarea 
                        placeholder="Description" 
                        rows={3} 
                        className="w-full text-xs bg-slate-50 p-3 rounded-lg outline-none" 
                        value={proj.description} 
                        onChange={e => handleUpdate(`projects.${idx}.description`, e.target.value)} 
                      />
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => addItem('projects')} 
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Add Project
                </button>
              </div>
            )}

            {activeTab === 'languages' && (
              <div className="space-y-6">
                {data.languages.map((lang, idx) => (
                  <div key={lang.id} className="p-5 border-2 border-slate-100 rounded-2xl relative group hover:border-indigo-100 transition-colors">
                    <button 
                      onClick={() => removeItem('languages', lang.id)} 
                      className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="space-y-4">
                      <input 
                        placeholder="Language" 
                        className="font-bold w-full outline-none bg-transparent" 
                        value={lang.name} 
                        onChange={e => handleUpdate(`languages.${idx}.name`, e.target.value)} 
                      />
                      <select 
                        className="w-full outline-none text-sm text-slate-600 bg-slate-50 p-2 rounded" 
                        value={lang.level} 
                        onChange={e => handleUpdate(`languages.${idx}.level`, e.target.value)}
                      >
                        <option>Native</option>
                        <option>Fluent</option>
                        <option>Professional</option>
                        <option>Intermediate</option>
                        <option>Basic</option>
                      </select>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => addItem('languages')} 
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Add Language
                </button>
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 mb-4">Layout Selection</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {TEMPLATES.map(t => (
                      <button 
                        key={t.id} 
                        onClick={() => { setActiveTemplate(t.id); setThemeColor(t.color); }}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                          activeTemplate === t.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.color }}></div>
                          <span className="font-bold text-sm">{t.name}</span>
                        </div>
                        {activeTemplate === t.id && <CheckCircle2 size={18} className="text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 mb-4">Color Palette</h4>
                  <div className="flex flex-wrap gap-3">
                    {['#3b82f6', '#0f172a', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#000000'].map(c => (
                      <button 
                        key={c} 
                        onClick={() => setThemeColor(c)}
                        className={`w-10 h-10 rounded-full border-4 border-white shadow-md transition-transform hover:scale-110 ${
                          themeColor === c ? 'ring-2 ring-indigo-500' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Preview Panel */}
        <section className={`flex-grow h-full overflow-y-auto p-12 flex justify-center bg-slate-200/50 relative ${isPreview ? 'w-full' : ''}`}>
          <div className="sticky top-4 left-1/2 -translate-x-1/2 z-30 flex items-center bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white gap-4 mb-8 h-fit">
            <button 
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center gap-2 text-xs font-black uppercase text-slate-600 hover:text-indigo-600 transition-colors"
            >
              {isPreview ? <Sidebar size={14} /> : <Eye size={14} />}
              {isPreview ? 'Edit' : 'Preview'}
            </button>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
          </div>
          <div 
            className="w-full max-w-[816px] bg-white shadow-2xl origin-top transition-transform duration-500"
            style={{ 
              minHeight: '1056px',
              boxShadow: '0 40px 100px -20px rgba(0,0,0,0.2)'
            }}
          >
            {renderCurrentTemplate()}
          </div>
        </section>
      </main>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          main, main * { visibility: visible; }
          aside, nav, button, .z-30 { display: none !important; }
          section.flex-grow { padding: 0 !important; background: white !important; }
          .max-w-[816px] { 
            box-shadow: none !important; 
            margin: 0 !important; 
            width: 100% !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
          }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
