import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

// CREATIVE EDGE PRO: Bold branding strip with colored sidebar
// Left: identity + skills, Right: about, experience, projects, education
export const CreativeEdgeProScreen: React.FC<TemplateProps> = ({ data, themeColor = '#ec4899' }) => (
  <div className="bg-white min-h-[1056px] flex font-sans">
    {/* LEFT: Bold Colored Sidebar (38%) */}
    <aside className="w-[38%] text-white p-10" style={{ background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)` }}>
      {/* Identity with Bold Branding */}
      <div className="mb-10">
        <div className="w-16 h-1 bg-white mb-4" />
        <h1 className="text-3xl font-black mb-3 leading-tight">
          {data.identity.fullName}
        </h1>
        <p className="text-lg font-medium opacity-90">
          {data.identity.jobTitle}
        </p>
      </div>

      {/* Contact */}
      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-80">
          CONTACT
        </h2>
        <div className="space-y-2 text-sm opacity-90">
          <div>📧 {data.identity.email}</div>
          <div>📱 {data.identity.phone}</div>
          <div>📍 {data.identity.location}</div>
        </div>
      </section>

      {/* Links */}
      {(data.identity.linkedin || data.identity.github || data.identity.website) && (
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-80">
            ONLINE
          </h2>
          <div className="space-y-2 text-sm opacity-90 break-all">
            {data.identity.linkedin && <div>🔗 LinkedIn</div>}
            {data.identity.github && <div>💻 GitHub</div>}
            {data.identity.website && <div>🌐 Portfolio</div>}
          </div>
        </section>
      )}

      {/* Skills with Visual Bars */}
      {data.skills.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-4 opacity-80">
            SKILLS
          </h2>
          <div className="space-y-5">
            {data.skills.map((skillGroup, idx) => (
              <div key={idx}>
                <h3 className="text-sm font-bold mb-3 opacity-90">{skillGroup.category}</h3>
                <div className="space-y-2">
                  {skillGroup.items.map((skill, i) => (
                    <div key={i}>
                      <div className="text-xs mb-1 opacity-80">{skill}</div>
                      <div className="h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </aside>

    {/* RIGHT: White Content Area (62%) */}
    <main className="w-[62%] p-12 text-gray-900">
      {/* About */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4" style={{ color: themeColor }}>
          About Me
        </h2>
        <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>
      </section>

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6" style={{ color: themeColor }}>
            Experience
          </h2>
          <div className="space-y-6">
            {data.experience.map((exp) => (
              <div key={exp.id} className="relative pl-6 border-l-4" style={{ borderColor: themeColor }}>
                <div className="absolute -left-2 top-0 w-3 h-3 rounded-full" style={{ backgroundColor: themeColor }} />
                <div className="mb-2">
                  <h3 className="font-bold text-lg">{exp.position}</h3>
                  <p className="text-sm font-semibold text-gray-600">{exp.company} • {exp.location}</p>
                  <p className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6" style={{ color: themeColor }}>
            Projects
          </h2>
          <div className="space-y-5">
            {data.projects.map((proj) => (
              <div key={proj.id} className="border-l-4 pl-4" style={{ borderColor: `${themeColor}40` }}>
                <h3 className="font-bold text-base">{proj.name}</h3>
                {proj.link && <p className="text-xs text-gray-500">{proj.link}</p>}
                <p className="text-sm text-gray-700 mt-2">{proj.description}</p>
                {proj.technologies && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {proj.technologies.map((tech, i) => (
                      <span key={i} className="text-xs px-3 py-1 rounded-full text-white" style={{ backgroundColor: themeColor }}>
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

      {/* Education */}
      {data.education.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6" style={{ color: themeColor }}>
            Education
          </h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <h3 className="font-bold text-base">{edu.degree}{edu.field && ` in ${edu.field}`}</h3>
              <p className="text-sm text-gray-600">{edu.school} • {edu.location}</p>
              <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>
              {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </section>
      )}
    </main>
  </div>
);
