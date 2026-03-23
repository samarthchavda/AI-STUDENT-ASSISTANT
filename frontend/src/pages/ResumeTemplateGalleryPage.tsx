import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Crown, Check, Sparkles, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface Template {
  id: string;
  name: string;
  description: string;
  isPro: boolean;
  category: 'modern' | 'classic' | 'creative' | 'minimal';
  features: string[];
  color: string;
}

const templates: Template[] = [
  {
    id: 'modern',
    name: 'Modern Professional',
    description: 'Bold design with clean layout, perfect for tech roles',
    isPro: false,
    category: 'modern',
    features: ['ATS-Friendly', 'Two Column', 'Clean Layout'],
    color: '#2563eb'
  },
  {
    id: 'software',
    name: 'Software Developer',
    description: 'Dark sidebar with tech-focused design for developers',
    isPro: false,
    category: 'modern',
    features: ['Tech Style', 'Dark Sidebar', 'Code-Friendly'],
    color: '#10b981'
  },
  {
    id: 'business',
    name: 'Business Executive',
    description: 'Formal serif design for C-level executives',
    isPro: false,
    category: 'classic',
    features: ['Executive Style', 'Serif Font', 'Leadership Focus'],
    color: '#1e293b'
  },
  {
    id: 'executive',
    name: 'Executive Suite',
    description: 'Elegant serif design for senior positions',
    isPro: false,
    category: 'classic',
    features: ['Professional', 'Serif Font', 'Traditional'],
    color: '#0f172a'
  },
  {
    id: 'creative',
    name: 'Creative Edge',
    description: 'Colorful sidebar design for creative industries',
    isPro: true,
    category: 'creative',
    features: ['Sidebar Layout', 'Bold Colors', 'Eye-Catching'],
    color: '#db2777'
  },
  {
    id: 'minimal',
    name: 'Minimalist Clean',
    description: 'Ultra-clean layout with maximum readability',
    isPro: false,
    category: 'minimal',
    features: ['ATS-Optimized', 'Simple Design', 'High Readability'],
    color: '#000000'
  }
];

export default function ResumeTemplateGalleryPage() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'modern' | 'classic' | 'creative' | 'minimal'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const isPro = user?.plan === 'pro' || user?.plan === 'basic';

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (templateId: string, isTemplatePro: boolean) => {
    if (isTemplatePro && !isPro) {
      alert('This template requires a Pro subscription. Upgrade to unlock all premium templates!');
      return;
    }
    
    setSelectedTemplate(templateId);
    setTimeout(() => {
      navigate('/career/resume-form', { state: { selectedTemplate: templateId } });
    }, 300);
  };

  const renderTemplateThumbnail = (template: Template) => {
    if (template.id === 'modern') {
      return (
        <div className="h-64 rounded-lg border-2 border-gray-200 overflow-hidden bg-white grid grid-cols-[35%_65%] text-[7px]">
          <div className="bg-blue-600 p-3 text-white space-y-2">
            <div className="font-bold text-[8px]">CONTACT</div>
            <div className="opacity-90 text-[6px]">alex@email.com</div>
            <div className="opacity-90 text-[6px]">+1 555 1234</div>
            <div className="font-bold mt-3 text-[8px]">SKILLS</div>
            <div className="opacity-90 text-[6px]">JavaScript</div>
            <div className="opacity-90 text-[6px]">React</div>
            <div className="opacity-90 text-[6px]">Node.js</div>
          </div>
          <div className="p-3 space-y-2">
            <div className="font-bold text-[10px] text-blue-900">ALEX RIVERA</div>
            <div className="text-blue-700 text-[7px]">Senior Product Designer</div>
            <div className="mt-2 font-semibold text-[8px]">EXPERIENCE</div>
            <div className="font-medium text-[7px]">Senior Designer</div>
            <div className="text-gray-500 text-[6px]">TechNova • 2021-Present</div>
            <div className="text-gray-600 leading-tight text-[6px]">Led redesign of core platform...</div>
          </div>
        </div>
      );
    }

    if (template.id === 'software') {
      return (
        <div className="h-64 rounded-lg border-2 border-gray-200 overflow-hidden bg-white flex text-[7px] font-mono">
          <div className="w-2/5 bg-zinc-900 p-3 text-zinc-100 space-y-2">
            <div className="font-black text-[9px] mb-1">JORDAN SMITH</div>
            <div className="text-emerald-400 text-[6px] font-bold">Lead Engineer</div>
            <div className="border-t border-zinc-800 pt-2 mt-2">
              <div className="text-[6px] font-bold text-zinc-500 mb-1">NETWORK</div>
              <div className="text-[5px] opacity-80">jordan@dev.io</div>
              <div className="text-[5px] opacity-80">github.com/jsmith</div>
            </div>
            <div className="border-t border-zinc-800 pt-2">
              <div className="text-[6px] font-bold text-zinc-500 mb-1">STACK</div>
              <div className="flex flex-wrap gap-1">
                <span className="text-[5px] bg-zinc-800 px-1 py-0.5 rounded border border-zinc-700">React</span>
                <span className="text-[5px] bg-zinc-800 px-1 py-0.5 rounded border border-zinc-700">Go</span>
              </div>
            </div>
          </div>
          <div className="w-3/5 p-3 bg-white">
            <div className="text-[6px] font-bold text-zinc-400 mb-2 flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-emerald-500"></div> PROFILE
            </div>
            <div className="text-[6px] text-zinc-600 leading-tight mb-3">Software architect with 10+ years...</div>
            <div className="text-[6px] font-bold text-zinc-400 mb-2 flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-emerald-500"></div> EXPERIENCE
            </div>
            <div className="border-l-2 border-zinc-100 pl-2">
              <div className="font-bold text-[6px]">Lead Engineer</div>
              <div className="text-emerald-600 text-[5px]">CloudScale Systems</div>
            </div>
          </div>
        </div>
      );
    }

    if (template.id === 'business') {
      return (
        <div className="h-64 rounded-lg border-2 border-slate-300 bg-white overflow-hidden text-[7px] font-serif">
          <div className="h-2 bg-slate-800"></div>
          <div className="p-3">
            <div className="border-b-2 border-slate-800 pb-2 mb-3 flex justify-between items-end">
              <div>
                <div className="font-black text-[10px] tracking-tight uppercase">ELEANOR VANCE</div>
                <div className="text-slate-500 text-[6px] tracking-widest uppercase">CHIEF OPERATIONS OFFICER</div>
              </div>
              <div className="text-right text-[5px] uppercase font-bold">
                <div>e.vance@corp.com</div>
                <div>+1 212 555 9000</div>
              </div>
            </div>
            <div className="mb-3">
              <div className="text-[6px] font-black uppercase tracking-wider text-slate-400 mb-1">Executive Profile</div>
              <div className="text-[6px] italic text-slate-700 leading-tight">"Visionary executive leader with 15+ years..."</div>
            </div>
            <div>
              <div className="text-[6px] font-black uppercase tracking-wider text-slate-400 mb-1">Experience</div>
              <div className="font-bold text-[7px] uppercase">GLOBAL NEXUS CORP</div>
              <div className="text-slate-600 text-[5px] italic">COO | 2019-Present</div>
            </div>
          </div>
        </div>
      );
    }

    if (template.id === 'executive') {
      return (
        <div className="h-64 rounded-lg border-2 border-slate-300 bg-white overflow-hidden text-[7px]">
          <div className="h-2 bg-slate-800"></div>
          <div className="p-3 text-center">
            <div className="font-light text-[11px] tracking-widest text-slate-900 mb-1">ALEX RIVERA</div>
            <div className="text-slate-600 text-[7px] tracking-wider mb-2">SENIOR PRODUCT DESIGNER</div>
            <div className="text-slate-500 text-[6px] italic mb-3">alex@email.com • +1 555 1234</div>
            <div className="text-left space-y-2">
              <div className="font-semibold text-[8px] text-center underline">Professional Experience</div>
              <div>
                <div className="font-semibold text-[7px]">TechNova Solutions</div>
                <div className="text-slate-600 text-[6px] italic">Senior Designer | 2021-Present</div>
                <div className="text-slate-700 text-[6px] leading-tight mt-1">Led the redesign of core banking platform...</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (template.id === 'creative') {
      return (
        <div className="h-64 rounded-lg border-2 border-pink-300 bg-white overflow-hidden flex text-[7px]">
          <div className="w-2/5 bg-pink-600 p-3 text-white">
            <div className="font-black text-[10px] leading-tight mb-2">ALEX<br/>RIVERA</div>
            <div className="h-px w-6 bg-white mb-2"></div>
            <div className="text-[7px] opacity-90 mb-3">Senior Designer</div>
            <div className="space-y-2">
              <div>
                <div className="text-[6px] font-bold uppercase opacity-70 mb-1">Contact</div>
                <div className="text-[6px] opacity-90">alex@email.com</div>
                <div className="text-[6px] opacity-90">+1 555 1234</div>
              </div>
              <div>
                <div className="text-[6px] font-bold uppercase opacity-70 mb-1">Skills</div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-[5px] bg-white/20 px-1 py-0.5 rounded">Design</span>
                  <span className="text-[5px] bg-white/20 px-1 py-0.5 rounded">Figma</span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-3/5 p-3 bg-stone-50">
            <div className="font-black text-[9px] text-pink-600 mb-2">ABOUT ME</div>
            <div className="text-[6px] text-slate-600 leading-tight mb-3">Strategic designer with 8+ years experience...</div>
            <div className="font-black text-[9px] text-pink-600 mb-2">JOURNEY</div>
            <div className="border-l-2 border-slate-200 pl-2 space-y-2">
              <div>
                <div className="text-[5px] text-slate-400 uppercase">2021-Present</div>
                <div className="font-bold text-[7px]">Senior Designer</div>
                <div className="text-[6px] text-pink-600">TechNova</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (template.id === 'minimal') {
      return (
        <div className="h-64 rounded-lg border-2 border-gray-200 bg-white p-4 text-[7px]">
          <div className="mb-3">
            <div className="font-light text-[10px] text-gray-900 mb-0.5">Alex Rivera</div>
            <div className="text-[6px] tracking-widest uppercase text-gray-400 mb-2">SENIOR PRODUCT DESIGNER</div>
            <div className="text-[5px] text-gray-500 uppercase tracking-wide">alex@email.com / +1 555 1234</div>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <div className="text-[5px] font-bold uppercase tracking-wider text-gray-300">Profile</div>
              <div className="col-span-3 text-[6px] leading-relaxed text-gray-700">Strategic designer with proven track record...</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-[5px] font-bold uppercase tracking-wider text-gray-300">Experience</div>
              <div className="col-span-3">
                <div className="font-bold text-[6px]">Senior Designer at TechNova</div>
                <div className="text-[5px] text-gray-500">2021 – Present</div>
                <div className="text-[6px] text-gray-600 leading-tight mt-1">Led redesign initiatives...</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Choose Your Resume Template
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select from our professionally designed templates. Click on any template to start building your resume.
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
            <h3 className="text-lg font-bold mb-2">Easy to Edit</h3>
            <p className="text-gray-600 text-sm">
              Live preview as you type. Add, remove, and customize sections with simple clicks
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
  );
}
