import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

// MINIMAL ATS: Compact single-column, black/gray only, dense sections
// No decorative blocks, maximum ATS compatibility
export const MinimalAtsScreen: React.FC<TemplateProps> = ({ data }) => (
  <div className="bg-white min-h-[1056px] p-12 font-sans text-gray-900 max-w-[816px] mx-auto">
    {/* Short Compact Header */}
    <header className="mb-6">
      <h1 className="text-xl font-normal text-gray-900 mb-0.5">
        {data.identity.fullName}
      </h1>
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
        {data.identity.jobTitle}
      </p>
      <div className="text-xs text-gray-600">
        {data.identity.email} • {data.identity.phone} • {data.identity.location}
      </div>
    </header>

    {/* Dense Sections - No Decorations */}
    
    {/* Profile */}
    <section className="mb-5">
      <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
        PROFILE
      </h2>
      <p className="text-xs leading-relaxed text-gray-700">{data.summary}</p>
    </section>

    {/* Experience */}
    {data.experience.length > 0 && (
      <section className="mb-5">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
          EXPERIENCE
        </h2>
        <div className="space-y-3">
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-start mb-0.5">
                <div>
                  <h3 className="font-bold text-xs">{exp.position}</h3>
                  <p className="text-xs text-gray-600">{exp.company} | {exp.location}</p>
                </div>
                <span className="text-[10px] text-gray-500 whitespace-nowrap ml-4">
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Education */}
    {data.education.length > 0 && (
      <section className="mb-5">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
          EDUCATION
        </h2>
        {data.education.map((edu) => (
          <div key={edu.id} className="mb-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-xs">{edu.degree}{edu.field && ` in ${edu.field}`}</h3>
                <p className="text-xs text-gray-600">{edu.school} | {edu.location}</p>
              </div>
              <span className="text-[10px] text-gray-500 whitespace-nowrap ml-4">
                {edu.startDate} - {edu.endDate}
              </span>
            </div>
            {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
          </div>
        ))}
      </section>
    )}

    {/* Skills */}
    {data.skills.length > 0 && (
      <section className="mb-5">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
          SKILLS
        </h2>
        <div className="space-y-1">
          {data.skills.map((skillGroup, idx) => (
            <p key={idx} className="text-xs">
              <span className="font-semibold text-gray-900">{skillGroup.category}:</span>{' '}
              <span className="text-gray-700">{skillGroup.items.join(', ')}</span>
            </p>
          ))}
        </div>
      </section>
    )}

    {/* Projects */}
    {data.projects.length > 0 && (
      <section className="mb-5">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
          PROJECTS
        </h2>
        <div className="space-y-2">
          {data.projects.map((proj) => (
            <div key={proj.id}>
              <h3 className="font-bold text-xs">{proj.name}</h3>
              <p className="text-xs text-gray-700 leading-relaxed">{proj.description}</p>
              {proj.technologies && (
                <p className="text-[10px] text-gray-500">
                  {proj.technologies.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Certifications */}
    {data.certifications.length > 0 && (
      <section>
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
          CERTIFICATIONS
        </h2>
        <div className="space-y-1">
          {data.certifications.map((cert) => (
            <p key={cert.id} className="text-xs">
              <span className="font-semibold">{cert.name}</span>
              <span className="text-gray-600"> - {cert.issuer} ({cert.date})</span>
            </p>
          ))}
        </div>
      </section>
    )}
  </div>
);
