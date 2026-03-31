import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

// SOFTWARE DEVELOPER PRO: Left dark sidebar + right white content
// Tech-focused design with skills as chips
export const SoftwareDeveloperProScreen: React.FC<TemplateProps> = ({ data, themeColor = '#10b981' }) => (
  <div className="bg-white min-h-[1056px] flex font-sans">
    {/* LEFT: Dark Sidebar (35%) */}
    <aside className="w-[35%] bg-gray-900 p-10 text-white">
      {/* Name & Role */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: themeColor }}>
          {data.identity.fullName}
        </h1>
        <p className="text-sm text-gray-400 uppercase tracking-wide">
          {data.identity.jobTitle}
        </p>
      </div>

      {/* Contacts */}
      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: themeColor }}>
          CONTACT
        </h2>
        <div className="space-y-2 text-xs text-gray-300">
          <div className="break-all">{data.identity.email}</div>
          <div>{data.identity.phone}</div>
          <div>{data.identity.location}</div>
        </div>
      </section>

      {/* Links */}
      {(data.identity.linkedin || data.identity.github || data.identity.website) && (
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: themeColor }}>
            LINKS
          </h2>
          <div className="space-y-2 text-xs text-gray-300 break-all">
            {data.identity.linkedin && <div>{data.identity.linkedin}</div>}
            {data.identity.github && <div>{data.identity.github}</div>}
            {data.identity.website && <div>{data.identity.website}</div>}
          </div>
        </section>
      )}

      {/* Skills as Chips */}
      {data.skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: themeColor }}>
            SKILLS
          </h2>
          <div className="space-y-4">
            {data.skills.map((skillGroup, idx) => (
              <div key={idx}>
                <h3 className="text-xs font-semibold mb-2 text-gray-200">{skillGroup.category}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skillGroup.items.map((skill, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 bg-gray-800 rounded text-gray-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: themeColor }}>
            EDUCATION
          </h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <h3 className="font-bold text-sm text-gray-200">{edu.degree}</h3>
              {edu.field && <p className="text-xs text-gray-400">{edu.field}</p>}
              <p className="text-xs text-gray-400 mt-1">{edu.school}</p>
              <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>
            </div>
          ))}
        </section>
      )}
    </aside>

    {/* RIGHT: White Content Area (65%) */}
    <main className="w-[65%] p-12 text-gray-900">
      {/* Summary */}
      <section className="mb-10">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: themeColor }}>
          ABOUT
        </h2>
        <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>
      </section>

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: themeColor }}>
            EXPERIENCE
          </h2>
          <div className="space-y-6">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-base">{exp.position}</h3>
                  <span className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</span>
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-2">{exp.company} • {exp.location}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: themeColor }}>
            PROJECTS
          </h2>
          <div className="space-y-5">
            {data.projects.map((proj) => (
              <div key={proj.id}>
                <h3 className="font-bold text-base">{proj.name}</h3>
                {proj.link && <p className="text-xs text-gray-500">{proj.link}</p>}
                <p className="text-sm text-gray-700 mt-1">{proj.description}</p>
                {proj.technologies && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {proj.technologies.map((tech, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-700">
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
  </div>
);
