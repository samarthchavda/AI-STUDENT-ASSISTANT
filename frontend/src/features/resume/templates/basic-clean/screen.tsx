import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

// BASIC CLEAN: Single-column ATS-safe layout
// Simple top header, thin dividers, no sidebar, maximum readability
export const BasicCleanScreen: React.FC<TemplateProps> = ({ data }) => (
  <div className="bg-white min-h-[1056px] p-16 font-sans text-gray-900 max-w-[816px] mx-auto">
    {/* Simple Top Header - Centered */}
    <header className="text-center mb-8 pb-6 border-b border-gray-300">
      <h1 className="text-2xl font-bold mb-1 text-gray-900">
        {data.identity.fullName}
      </h1>
      <p className="text-base text-gray-700 mb-3">
        {data.identity.jobTitle}
      </p>
      <div className="text-sm text-gray-600">
        {data.identity.email} | {data.identity.phone} | {data.identity.location}
      </div>
      {(data.identity.linkedin || data.identity.github) && (
        <div className="text-sm text-gray-600 mt-1">
          {data.identity.linkedin && <span>{data.identity.linkedin}</span>}
          {data.identity.linkedin && data.identity.github && <span> | </span>}
          {data.identity.github && <span>{data.identity.github}</span>}
        </div>
      )}
    </header>

    {/* Summary */}
    <section className="mb-6">
      <h2 className="text-xs font-bold uppercase tracking-wide mb-2 text-gray-900 border-b border-gray-300 pb-1">
        SUMMARY
      </h2>
      <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>
    </section>

    {/* Experience */}
    {data.experience.length > 0 && (
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-900 border-b border-gray-300 pb-1">
          EXPERIENCE
        </h2>
        <div className="space-y-4">
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="font-bold text-sm">{exp.position}</h3>
                  <p className="text-sm text-gray-600">{exp.company}, {exp.location}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mt-1">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Projects */}
    {data.projects.length > 0 && (
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-900 border-b border-gray-300 pb-1">
          PROJECTS
        </h2>
        <div className="space-y-3">
          {data.projects.map((proj) => (
            <div key={proj.id}>
              <h3 className="font-bold text-sm">{proj.name}</h3>
              <p className="text-sm text-gray-700 mt-1 leading-relaxed">{proj.description}</p>
              {proj.technologies && (
                <p className="text-xs text-gray-500 mt-1">
                  {proj.technologies.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Education */}
    {data.education.length > 0 && (
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-900 border-b border-gray-300 pb-1">
          EDUCATION
        </h2>
        {data.education.map((edu) => (
          <div key={edu.id} className="mb-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm">{edu.degree}{edu.field && ` in ${edu.field}`}</h3>
                <p className="text-sm text-gray-600">{edu.school}, {edu.location}</p>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                {edu.startDate} - {edu.endDate}
              </span>
            </div>
            {edu.gpa && <p className="text-sm text-gray-500 mt-1">GPA: {edu.gpa}</p>}
          </div>
        ))}
      </section>
    )}

    {/* Skills */}
    {data.skills.length > 0 && (
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-900 border-b border-gray-300 pb-1">
          SKILLS
        </h2>
        <div className="space-y-2">
          {data.skills.map((skillGroup, idx) => (
            <p key={idx} className="text-sm">
              <span className="font-semibold text-gray-900">{skillGroup.category}:</span>{' '}
              <span className="text-gray-700">{skillGroup.items.join(', ')}</span>
            </p>
          ))}
        </div>
      </section>
    )}
  </div>
);
