import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

// MODERN PROFESSIONAL: Two-column layout with right sidebar
// Blue accent top line, left main content, right sidebar
export const ModernProfessionalScreen: React.FC<TemplateProps> = ({ data, themeColor = '#3b82f6' }) => (
  <div className="bg-white min-h-[1056px] font-sans">
    {/* Blue Accent Top Line */}
    <div className="h-2" style={{ backgroundColor: themeColor }} />
    
    {/* Header */}
    <header className="bg-gray-50 px-12 py-8">
      <h1 className="text-3xl font-bold mb-1" style={{ color: themeColor }}>
        {data.identity.fullName}
      </h1>
      <p className="text-lg text-gray-700 mb-3">{data.identity.jobTitle}</p>
      <div className="flex gap-4 text-sm text-gray-600 flex-wrap">
        <span>📧 {data.identity.email}</span>
        <span>📱 {data.identity.phone}</span>
        <span>📍 {data.identity.location}</span>
      </div>
    </header>

    {/* Two-Column Layout: Left Main (65%) + Right Sidebar (35%) */}
    <div className="flex">
      {/* LEFT: Main Content */}
      <main className="w-[65%] p-12 pr-6">
        {/* Summary */}
        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="w-1 h-4 inline-block" style={{ backgroundColor: themeColor }} />
            <span style={{ color: themeColor }}>SUMMARY</span>
          </h2>
          <p className="text-sm leading-relaxed text-gray-700 pl-3">{data.summary}</p>
        </section>

        {/* Experience with Timeline */}
        {data.experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wide mb-4 flex items-center gap-2">
              <span className="w-1 h-4 inline-block" style={{ backgroundColor: themeColor }} />
              <span style={{ color: themeColor }}>EXPERIENCE</span>
            </h2>
            <div className="space-y-6 pl-3">
              {data.experience.map((exp) => (
                <div key={exp.id} className="relative pl-6 border-l-2 border-gray-200">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
                  <div className="mb-1">
                    <h3 className="font-bold text-base">{exp.position}</h3>
                    <p className="text-sm font-medium text-gray-600">{exp.company} • {exp.location}</p>
                    <p className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mt-2">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide mb-4 flex items-center gap-2">
              <span className="w-1 h-4 inline-block" style={{ backgroundColor: themeColor }} />
              <span style={{ color: themeColor }}>PROJECTS</span>
            </h2>
            <div className="space-y-4 pl-3">
              {data.projects.map((proj) => (
                <div key={proj.id}>
                  <h3 className="font-bold text-sm">{proj.name}</h3>
                  <p className="text-sm text-gray-700 mt-1">{proj.description}</p>
                  {proj.technologies && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {proj.technologies.map((tech, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* RIGHT: Sidebar */}
      <aside className="w-[35%] bg-gray-50 p-12 pl-6">
        {/* Skills */}
        {data.skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: themeColor }}>
              SKILLS
            </h2>
            <div className="space-y-4">
              {data.skills.map((skillGroup, idx) => (
                <div key={idx}>
                  <h3 className="text-xs font-semibold mb-2 text-gray-700">{skillGroup.category}</h3>
                  <div className="space-y-1.5">
                    {skillGroup.items.map((skill, i) => (
                      <div key={i} className="text-xs text-gray-600">• {skill}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: themeColor }}>
              EDUCATION
            </h2>
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-4">
                <h3 className="font-bold text-sm">{edu.degree}</h3>
                {edu.field && <p className="text-xs text-gray-600">{edu.field}</p>}
                <p className="text-xs text-gray-600 mt-1">{edu.school}</p>
                <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>
                {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: themeColor }}>
              LANGUAGES
            </h2>
            <div className="space-y-2">
              {data.languages.map((lang) => (
                <div key={lang.id} className="text-xs">
                  <span className="font-semibold text-gray-700">{lang.name}</span>
                  <span className="text-gray-500"> - {lang.proficiency}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Links */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: themeColor }}>
            LINKS
          </h2>
          <div className="space-y-2 text-xs text-gray-600">
            {data.identity.linkedin && <div>🔗 {data.identity.linkedin}</div>}
            {data.identity.github && <div>💻 {data.identity.github}</div>}
            {data.identity.website && <div>🌐 {data.identity.website}</div>}
          </div>
        </section>
      </aside>
    </div>
  </div>
);
