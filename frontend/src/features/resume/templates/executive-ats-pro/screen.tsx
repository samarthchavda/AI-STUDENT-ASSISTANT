import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

// EXECUTIVE ATS PRO: Formal single-column, executive style
// Classic dividers, experience-focused, dark navy/slate formal look
export const ExecutiveAtsProScreen: React.FC<TemplateProps> = ({ data, themeColor = '#1e293b' }) => (
  <div className="bg-white min-h-[1056px] p-16 font-serif text-gray-900 max-w-[816px] mx-auto">
    {/* Executive Style Header */}
    <header className="mb-10">
      <div className="p-8 text-white" style={{ backgroundColor: themeColor }}>
        <h1 className="text-3xl font-bold mb-2">{data.identity.fullName}</h1>
        <p className="text-lg opacity-90">{data.identity.jobTitle}</p>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-600 mt-6 px-2 pb-4 border-b-2 border-gray-300">
        <div className="flex gap-4 flex-wrap">
          <span>{data.identity.email}</span>
          <span>•</span>
          <span>{data.identity.phone}</span>
          <span>•</span>
          <span>{data.identity.location}</span>
        </div>
        {data.identity.linkedin && (
          <span className="text-xs">{data.identity.linkedin}</span>
        )}
      </div>
    </header>

    {/* Executive Summary */}
    <section className="mb-8">
      <h2 className="text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b border-gray-400" style={{ color: themeColor }}>
        EXECUTIVE SUMMARY
      </h2>
      <p className="text-sm leading-relaxed text-gray-700 font-sans">{data.summary}</p>
    </section>

    {/* Professional Experience - Experience-Focused */}
    {data.experience.length > 0 && (
      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b border-gray-400" style={{ color: themeColor }}>
          PROFESSIONAL EXPERIENCE
        </h2>
        <div className="space-y-6">
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-base">{exp.position}</h3>
                <span className="text-xs text-gray-500 font-sans">{exp.startDate} - {exp.endDate}</span>
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-2">{exp.company} | {exp.location}</p>
              <p className="text-sm text-gray-700 leading-relaxed font-sans">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Education */}
    {data.education.length > 0 && (
      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b border-gray-400" style={{ color: themeColor }}>
          EDUCATION
        </h2>
        {data.education.map((edu) => (
          <div key={edu.id} className="mb-4">
            <div className="flex justify-between items-baseline">
              <h3 className="font-bold">{edu.degree}{edu.field && ` in ${edu.field}`}</h3>
              <span className="text-xs text-gray-500 font-sans">{edu.startDate} - {edu.endDate}</span>
            </div>
            <p className="text-sm text-gray-600">{edu.school} | {edu.location}</p>
            {edu.honors && <p className="text-sm text-gray-500 font-sans">{edu.honors}</p>}
          </div>
        ))}
      </section>
    )}

    {/* Core Competencies */}
    {data.skills.length > 0 && (
      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b border-gray-400" style={{ color: themeColor }}>
          CORE COMPETENCIES
        </h2>
        <div className="space-y-2">
          {data.skills.map((skillGroup, idx) => (
            <div key={idx} className="font-sans">
              <span className="font-semibold text-sm">{skillGroup.category}: </span>
              <span className="text-sm text-gray-700">{skillGroup.items.join(' • ')}</span>
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Professional Certifications */}
    {data.certifications.length > 0 && (
      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b border-gray-400" style={{ color: themeColor }}>
          PROFESSIONAL CERTIFICATIONS
        </h2>
        <div className="space-y-2">
          {data.certifications.map((cert) => (
            <div key={cert.id} className="font-sans">
              <span className="font-semibold text-sm">{cert.name}</span>
              <span className="text-sm text-gray-600"> - {cert.issuer} ({cert.date})</span>
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Awards & Recognition */}
    {data.awards.length > 0 && (
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b border-gray-400" style={{ color: themeColor }}>
          AWARDS & RECOGNITION
        </h2>
        <div className="space-y-3">
          {data.awards.map((award) => (
            <div key={award.id}>
              <div className="font-sans">
                <span className="font-semibold text-sm">{award.title}</span>
                <span className="text-sm text-gray-600"> - {award.issuer} ({award.date})</span>
              </div>
              {award.description && <p className="text-sm text-gray-600 mt-1 font-sans">{award.description}</p>}
            </div>
          ))}
        </div>
      </section>
    )}
  </div>
);
