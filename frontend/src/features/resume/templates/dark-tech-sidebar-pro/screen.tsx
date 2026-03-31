import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

export const DarkTechSidebarProScreen: React.FC<TemplateProps> = ({ data, themeColor = '#06b6d4' }) => (
  <div className="bg-white min-h-[1056px] flex font-sans">
    {/* Left Sidebar - Black */}
    <aside className="w-2/5 bg-black p-12 text-white">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ color: themeColor }}>
          {data.identity.fullName}
        </h1>
        <p className="text-sm text-gray-400 uppercase tracking-widest">
          {data.identity.jobTitle}
        </p>
      </div>

      {/* Contact */}
      <section className="mb-10">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b" style={{ color: themeColor, borderColor: themeColor }}>
          Contact
        </h2>
        <div className="space-y-2 text-xs text-gray-300">
          <div className="break-all">{data.identity.email}</div>
          <div>{data.identity.phone}</div>
          <div>{data.identity.location}</div>
          {data.identity.linkedin && <div className="break-all">{data.identity.linkedin}</div>}
          {data.identity.github && <div className="break-all">{data.identity.github}</div>}
          {data.identity.website && <div className="break-all">{data.identity.website}</div>}
        </div>
      </section>

      {/* Skills */}
      {data.skills.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b" style={{ color: themeColor, borderColor: themeColor }}>
            Technical Skills
          </h2>
          <div className="space-y-4">
            {data.skills.map((skillGroup, idx) => (
              <div key={idx}>
                <h3 className="text-xs font-semibold mb-2" style={{ color: themeColor }}>{skillGroup.category}</h3>
                <div className="text-xs text-gray-300 leading-relaxed">
                  {skillGroup.items.join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b" style={{ color: themeColor, borderColor: themeColor }}>
            Education
          </h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <h3 className="font-bold text-sm text-gray-200">{edu.degree}</h3>
              {edu.field && <p className="text-xs text-gray-400">{edu.field}</p>}
              <p className="text-xs text-gray-400 mt-1">{edu.school}</p>
              <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>
              {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Languages */}
      {data.languages.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b" style={{ color: themeColor, borderColor: themeColor }}>
            Languages
          </h2>
          <div className="space-y-2 text-xs text-gray-300">
            {data.languages.map((lang) => (
              <div key={lang.id}>
                {lang.name} - {lang.proficiency}
              </div>
            ))}
          </div>
        </section>
      )}
    </aside>

    {/* Right Content */}
    <main className="flex-1 p-12 text-gray-900">
      {/* Summary */}
      <section className="mb-10">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-4 pb-2 border-b-2" style={{ color: themeColor, borderColor: themeColor }}>
          Professional Summary
        </h2>
        <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>
      </section>

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4 pb-2 border-b-2" style={{ color: themeColor, borderColor: themeColor }}>
            Professional Experience
          </h2>
          <div className="space-y-6">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-base">{exp.position}</h3>
                  <span className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</span>
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-2">{exp.company} | {exp.location}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4 pb-2 border-b-2" style={{ color: themeColor, borderColor: themeColor }}>
            Key Projects
          </h2>
          <div className="space-y-4">
            {data.projects.map((proj) => (
              <div key={proj.id}>
                <h3 className="font-bold text-base">{proj.name}</h3>
                {proj.link && <p className="text-xs text-gray-500">{proj.link}</p>}
                <p className="text-sm text-gray-700 mt-1">{proj.description}</p>
                {proj.technologies && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {proj.technologies.map((tech, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-700 border border-gray-200">
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

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4 pb-2 border-b-2" style={{ color: themeColor, borderColor: themeColor }}>
            Certifications
          </h2>
          <div className="space-y-2">
            {data.certifications.map((cert) => (
              <div key={cert.id}>
                <span className="font-semibold text-sm">{cert.name}</span>
                <span className="text-sm text-gray-600"> - {cert.issuer} ({cert.date})</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  </div>
);
