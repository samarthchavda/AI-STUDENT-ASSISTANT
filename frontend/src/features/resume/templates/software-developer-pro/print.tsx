import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

export const SoftwareDeveloperProPrint: React.FC<TemplateProps> = ({ data, themeColor = '#10b981' }) => (
  <div className="bg-white w-full font-sans" style={{ display: 'table', minHeight: '297mm' }}>
    <div style={{ display: 'table-row' }}>
      {/* Left Sidebar */}
      <div style={{ display: 'table-cell', width: '33%', backgroundColor: '#111827', color: '#ffffff', padding: '48px 32px', verticalAlign: 'top' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: themeColor }}>
            {data.identity.fullName}
          </h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {data.identity.jobTitle}
          </p>
        </div>

        {/* Contact */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', color: themeColor }}>
            CONTACT
          </h2>
          <div style={{ fontSize: '11px', color: '#d1d5db', lineHeight: '1.8' }}>
            <div>{data.identity.email}</div>
            <div>{data.identity.phone}</div>
            <div>{data.identity.location}</div>
            {data.identity.linkedin && <div style={{ wordBreak: 'break-all' }}>{data.identity.linkedin}</div>}
            {data.identity.github && <div style={{ wordBreak: 'break-all' }}>{data.identity.github}</div>}
          </div>
        </section>

        {/* Skills */}
        {data.skills.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', color: themeColor }}>
              SKILLS
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data.skills.map((skillGroup, idx) => (
                <div key={idx}>
                  <h3 style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px', color: '#e5e7eb' }}>
                    {skillGroup.category}
                  </h3>
                  <div style={{ fontSize: '10px', color: '#d1d5db', lineHeight: '1.6' }}>
                    {skillGroup.items.join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <section>
            <h2 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', color: themeColor }}>
              LANGUAGES
            </h2>
            <div style={{ fontSize: '11px', color: '#d1d5db', lineHeight: '1.8' }}>
              {data.languages.map((lang) => (
                <div key={lang.id}>{lang.name} - {lang.proficiency}</div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Right Content */}
      <div style={{ display: 'table-cell', padding: '48px', verticalAlign: 'top', color: '#111827' }}>
        {/* Summary */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', color: themeColor }}>
            PROFESSIONAL SUMMARY
          </h2>
          <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#374151' }}>{data.summary}</p>
        </section>

        {/* Experience */}
        {data.experience.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', color: themeColor }}>
              EXPERIENCE
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h3 style={{ fontWeight: '700', fontSize: '15px' }}>{exp.position}</h3>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>
                    {exp.company} | {exp.location}
                  </p>
                  <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', color: themeColor }}>
              PROJECTS
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data.projects.map((proj) => (
                <div key={proj.id}>
                  <h3 style={{ fontWeight: '700', fontSize: '15px' }}>{proj.name}</h3>
                  {proj.link && <p style={{ fontSize: '11px', color: '#6b7280' }}>{proj.link}</p>}
                  <p style={{ fontSize: '13px', color: '#374151', marginTop: '4px' }}>{proj.description}</p>
                  {proj.technologies && (
                    <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
                      {proj.technologies.join(' • ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <section>
            <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', color: themeColor }}>
              EDUCATION
            </h2>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ fontWeight: '700', fontSize: '14px' }}>
                    {edu.degree}{edu.field && ` in ${edu.field}`}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>{edu.startDate} - {edu.endDate}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#4b5563' }}>{edu.school} | {edu.location}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  </div>
);
