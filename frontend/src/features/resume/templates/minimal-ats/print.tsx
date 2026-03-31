import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

export const MinimalAtsPrint: React.FC<TemplateProps> = ({ data }) => (
  <div className="bg-white w-full font-sans text-gray-900" style={{ padding: '48px', minHeight: '297mm' }}>
    {/* Header */}
    <header style={{ marginBottom: '32px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '300', marginBottom: '4px', color: '#111827' }}>
        {data.identity.fullName}
      </h1>
      <p style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>
        {data.identity.jobTitle}
      </p>
      <div style={{ fontSize: '11px', color: '#6b7280' }}>
        {data.identity.email} • {data.identity.phone} • {data.identity.location}
      </div>
    </header>

    {/* Summary */}
    <section style={{ marginBottom: '28px' }}>
      <div style={{ display: 'table', width: '100%' }}>
        <div style={{ display: 'table-cell', width: '80px', verticalAlign: 'top', paddingRight: '16px' }}>
          <h2 style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d1d5db' }}>
            PROFILE
          </h2>
        </div>
        <div style={{ display: 'table-cell', verticalAlign: 'top' }}>
          <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#374151' }}>{data.summary}</p>
        </div>
      </div>
    </section>

    {/* Experience */}
    {data.experience.length > 0 && (
      <section style={{ marginBottom: '28px' }}>
        <div style={{ display: 'table', width: '100%' }}>
          <div style={{ display: 'table-cell', width: '80px', verticalAlign: 'top', paddingRight: '16px' }}>
            <h2 style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d1d5db' }}>
              EXPERIENCE
            </h2>
          </div>
          <div style={{ display: 'table-cell', verticalAlign: 'top' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h3 style={{ fontWeight: '700', fontSize: '13px' }}>{exp.position}</h3>
                    <span style={{ fontSize: '10px', color: '#6b7280' }}>{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>
                    {exp.company} | {exp.location}
                  </p>
                  <p style={{ fontSize: '12px', color: '#374151', lineHeight: '1.5' }}>{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )}

    {/* Education */}
    {data.education.length > 0 && (
      <section style={{ marginBottom: '28px' }}>
        <div style={{ display: 'table', width: '100%' }}>
          <div style={{ display: 'table-cell', width: '80px', verticalAlign: 'top', paddingRight: '16px' }}>
            <h2 style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d1d5db' }}>
              EDUCATION
            </h2>
          </div>
          <div style={{ display: 'table-cell', verticalAlign: 'top' }}>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ fontWeight: '700', fontSize: '13px' }}>
                    {edu.degree}{edu.field && ` in ${edu.field}`}
                  </h3>
                  <span style={{ fontSize: '10px', color: '#6b7280' }}>{edu.startDate} - {edu.endDate}</span>
                </div>
                <p style={{ fontSize: '11px', color: '#6b7280' }}>{edu.school} | {edu.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )}

    {/* Skills */}
    {data.skills.length > 0 && (
      <section style={{ marginBottom: '28px' }}>
        <div style={{ display: 'table', width: '100%' }}>
          <div style={{ display: 'table-cell', width: '80px', verticalAlign: 'top', paddingRight: '16px' }}>
            <h2 style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d1d5db' }}>
              SKILLS
            </h2>
          </div>
          <div style={{ display: 'table-cell', verticalAlign: 'top' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.skills.map((skillGroup, idx) => (
                <div key={idx}>
                  <span style={{ fontWeight: '600', fontSize: '12px' }}>{skillGroup.category}: </span>
                  <span style={{ fontSize: '12px', color: '#374151' }}>{skillGroup.items.join(' • ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )}

    {/* Projects */}
    {data.projects.length > 0 && (
      <section>
        <div style={{ display: 'table', width: '100%' }}>
          <div style={{ display: 'table-cell', width: '80px', verticalAlign: 'top', paddingRight: '16px' }}>
            <h2 style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d1d5db' }}>
              PROJECTS
            </h2>
          </div>
          <div style={{ display: 'table-cell', verticalAlign: 'top' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.projects.map((proj) => (
                <div key={proj.id}>
                  <h3 style={{ fontWeight: '700', fontSize: '13px' }}>{proj.name}</h3>
                  <p style={{ fontSize: '12px', color: '#374151', marginTop: '4px' }}>{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )}
  </div>
);
