import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

export const CreativeEdgeProPrint: React.FC<TemplateProps> = ({ data, themeColor = '#ec4899' }) => (
  <div className="bg-white w-full font-sans" style={{ display: 'table', minHeight: '297mm' }}>
    <div style={{ display: 'table-row' }}>
      {/* Left Colored Sidebar */}
      <div style={{ display: 'table-cell', width: '38%', background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`, color: '#ffffff', padding: '40px 32px', verticalAlign: 'top' }}>
        <div style={{ width: '64px', height: '4px', backgroundColor: '#ffffff', marginBottom: '16px' }} />
        <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '12px', lineHeight: '1.2' }}>
          {data.identity.fullName}
        </h1>
        <p style={{ fontSize: '16px', fontWeight: '500', opacity: 0.9, marginBottom: '32px' }}>
          {data.identity.jobTitle}
        </p>

        {/* Contact */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', opacity: 0.8 }}>
            CONTACT
          </h2>
          <div style={{ fontSize: '12px', opacity: 0.9, lineHeight: '1.8' }}>
            <div>📧 {data.identity.email}</div>
            <div>📱 {data.identity.phone}</div>
            <div>📍 {data.identity.location}</div>
          </div>
        </section>

        {/* Skills */}
        {data.skills.length > 0 && (
          <section>
            <h2 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', opacity: 0.8 }}>
              SKILLS
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {data.skills.map((skillGroup, idx) => (
                <div key={idx}>
                  <h3 style={{ fontSize: '12px', fontWeight: '700', marginBottom: '12px', opacity: 0.9 }}>
                    {skillGroup.category}
                  </h3>
                  <div style={{ fontSize: '11px', opacity: 0.85, lineHeight: '1.8' }}>
                    {skillGroup.items.join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Right White Content */}
      <div style={{ display: 'table-cell', padding: '48px', verticalAlign: 'top', color: '#111827' }}>
        {/* About */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: themeColor }}>
            About Me
          </h2>
          <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#374151' }}>{data.summary}</p>
        </section>

        {/* Experience */}
        {data.experience.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: themeColor }}>
              Experience
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {data.experience.map((exp) => (
                <div key={exp.id} style={{ position: 'relative', paddingLeft: '24px', borderLeft: `4px solid ${themeColor}` }}>
                  <div style={{ marginBottom: '8px' }}>
                    <h3 style={{ fontWeight: '700', fontSize: '16px' }}>{exp.position}</h3>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563' }}>
                      {exp.company} • {exp.location}
                    </p>
                    <p style={{ fontSize: '11px', color: '#6b7280' }}>{exp.startDate} - {exp.endDate}</p>
                  </div>
                  <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: themeColor }}>
              Projects
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {data.projects.map((proj) => (
                <div key={proj.id} style={{ borderLeft: `4px solid ${themeColor}40`, paddingLeft: '16px' }}>
                  <h3 style={{ fontWeight: '700', fontSize: '15px' }}>{proj.name}</h3>
                  <p style={{ fontSize: '13px', color: '#374151', marginTop: '8px' }}>{proj.description}</p>
                  {proj.technologies && (
                    <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
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
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: themeColor }}>
              Education
            </h2>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '16px' }}>
                <h3 style={{ fontWeight: '700', fontSize: '15px' }}>
                  {edu.degree}{edu.field && ` in ${edu.field}`}
                </h3>
                <p style={{ fontSize: '13px', color: '#4b5563' }}>{edu.school} • {edu.location}</p>
                <p style={{ fontSize: '11px', color: '#6b7280' }}>{edu.startDate} - {edu.endDate}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  </div>
);
