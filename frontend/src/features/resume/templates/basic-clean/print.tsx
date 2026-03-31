import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

export const BasicCleanPrint: React.FC<TemplateProps> = ({ data, themeColor = '#2563eb' }) => (
  <div className="bg-white w-full font-sans text-gray-900" style={{ padding: '64px', minHeight: '297mm' }}>
    {/* Header */}
    <header style={{ textAlign: 'center', marginBottom: '48px', paddingBottom: '32px', borderBottom: '2px solid #e5e7eb' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: themeColor }}>
        {data.identity.fullName}
      </h1>
      <p style={{ fontSize: '18px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
        {data.identity.jobTitle}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '13px', color: '#6b7280', flexWrap: 'wrap' }}>
        <span>{data.identity.email}</span>
        <span>•</span>
        <span>{data.identity.phone}</span>
        <span>•</span>
        <span>{data.identity.location}</span>
      </div>
    </header>

    {/* Summary */}
    <section style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb', color: themeColor }}>
        Professional Summary
      </h2>
      <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#374151' }}>{data.summary}</p>
    </section>

    {/* Experience */}
    {data.experience.length > 0 && (
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb', color: themeColor }}>
          Experience
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
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

    {/* Education */}
    {data.education.length > 0 && (
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb', color: themeColor }}>
          Education
        </h2>
        {data.education.map((edu) => (
          <div key={edu.id} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
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

    {/* Skills */}
    {data.skills.length > 0 && (
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb', color: themeColor }}>
          Skills
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.skills.map((skillGroup, idx) => (
            <div key={idx}>
              <span style={{ fontWeight: '600', fontSize: '13px' }}>{skillGroup.category}: </span>
              <span style={{ fontSize: '13px', color: '#374151' }}>{skillGroup.items.join(' • ')}</span>
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Projects */}
    {data.projects.length > 0 && (
      <section>
        <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb', color: themeColor }}>
          Projects
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {data.projects.map((proj) => (
            <div key={proj.id}>
              <h3 style={{ fontWeight: '700', fontSize: '14px' }}>{proj.name}</h3>
              {proj.link && <p style={{ fontSize: '11px', color: '#6b7280' }}>{proj.link}</p>}
              <p style={{ fontSize: '13px', color: '#374151', marginTop: '4px' }}>{proj.description}</p>
            </div>
          ))}
        </div>
      </section>
    )}
  </div>
);
