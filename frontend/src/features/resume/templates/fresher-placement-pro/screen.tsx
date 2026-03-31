import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

export const FresherPlacementProScreen: React.FC<TemplateProps> = ({ data, themeColor = '#9333ea' }) => (
  <div className="bg-white min-h-[1056px] font-sans">
    {/* Header with Gradient */}
    <header className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-12 text-center">
      <h1 className="text-4xl font-bold mb-2">{data.identity.fullName}</h1>
      <p className="text-xl mb-4 opacity-90">{data.identity.jobTitle}</p>
      <div className="flex justify-center gap-4 text-sm opacity-80 flex-wrap">
        <span>{data.identity.email}</span>
        <span>•</span>
        <span>{data.identity.phone}</span>
        <span>•</span>
        <span>{data.identity.location}</span>
      </div>
      {(data.identity.linkedin || data.identity.github) && (
        <div className="flex justify-center gap-4 text-sm mt-2 opacity-80 flex-wrap">
          {data.identity.linkedin && <span>{data.identity.linkedin}</span>}
          {data.identity.github && <span>{data.identity.github}</span>}
        </div>
      )}
    </header>

    <div className="p-16">
      {/* Career Objective */}
      <section className="mb-10">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b-2" style={{ color: themeColor, borderColor: themeColor }}>
          Career Objective
        </h2>
        <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>
      </section>

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b-2" style={{ color: themeColor, borderColor: themeColor }}>
            Education
          </h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-6">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-base">{edu.degree}{edu.field && ` in ${edu.field}`}</h3>
                <span className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</span>
              </div>
              <p className="text-sm font-semibold text-gray-600">{edu.school} | {edu.location}</p>
              {edu.gpa && <p className="text-sm text-gray-500 mt-1">GPA: {edu.gpa}</p>}
              {edu.honors && <p className="text-sm text-gray-500">{edu.honors}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b-2" style={{ color: themeColor, borderColor: themeColor }}>
            Technical Skills
          </h2>
          <div className="space-y-3">
            {data.skills.map((skillGroup, idx) => (
              <div key={idx}>
                <span className="font-semibold text-sm" style={{ color: themeColor }}>{skillGroup.category}: </span>
                <span className="text-sm text-gray-700">{skillGroup.items.join(' • ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b-2" style={{ color: themeColor, borderColor: themeColor }}>
            Academic Projects
          </h2>
          <div className="space-y-6">
            {data.projects.map((proj) => (
              <div key={proj.id}>
                <h3 className="font-bold text-base">{proj.name}</h3>
                {proj.link && <p className="text-xs text-gray-500">{proj.link}</p>}
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{proj.description}</p>
                {proj.technologies && (
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="font-semibold">Technologies Used:</span> {proj.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience (if any) */}
      {data.experience.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b-2" style={{ color: themeColor, borderColor: themeColor }}>
            Internships & Experience
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

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b-2" style={{ color: themeColor, borderColor: themeColor }}>
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

      {/* Awards */}
      {data.awards.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b-2" style={{ color: themeColor, borderColor: themeColor }}>
            Achievements & Awards
          </h2>
          <div className="space-y-2">
            {data.awards.map((award) => (
              <div key={award.id}>
                <span className="font-semibold text-sm">{award.title}</span>
                <span className="text-sm text-gray-600"> - {award.issuer} ({award.date})</span>
                {award.description && <p className="text-sm text-gray-600 mt-1">{award.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  </div>
);
