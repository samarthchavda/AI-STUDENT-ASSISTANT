import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

export const ModernProfessionalPrint: React.FC<TemplateProps> = ({ data, themeColor = '#3b82f6' }) => (
  <div className="bg-white w-full font-sans text-slate-800" style={{ minHeight: '297mm' }}>
    <div style={{ height: '8px', width: '100%', backgroundColor: themeColor }}></div>
    <div style={{ padding: '48px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '40px', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '8px' }}>
            {data.identity.fullName}
          </h1>
          <p style={{ fontSize: '20px', fontWeight: '500', letterSpacing: '-0.01em', color: themeColor }}>
            {data.identity.jobTitle}
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px', color: '#64748b', fontWeight: '500' }}>
          <p>{data.identity.email}</p>
          <p>{data.identity.phone}</p>
          <p>{data.identity.location}</p>
        </div>
      </header>

      <div style={{ display: 'table', width: '100%' }}>
        <div style={{ display: 'table-row' }}>
          {/* Main Content */}
          <div style={{ display: 'table-cell', width: '66%', paddingRight: '48px', verticalAlign: 'top' }}>
            {/* Summary */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '2px', backgroundColor: themeColor }}></div> Summary
              </h2>
              <p style={{ fontSize: '15px', lineHeight: '1.6' }}>{data.summary}</p>
            </section>

            {/* Experience */}
            {data.experience.length > 0 && (
              <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '2px', backgroundColor: themeColor }}></div> Experience
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  {data.experience.map((exp) => (
                    <div key={exp.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{exp.position}</h3>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8' }}>
                          {exp.startDate} — {exp.endDate}
                        </span>
                      </div>
                      <p style={{ fontWeight: '700', fontSize: '16px', marginBottom: '12px', color: themeColor }}>
                        {exp.company}
                      </p>
                      <p style={{ color: '#64748b', lineHeight: '1.6' }}>{exp.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {data.projects.length > 0 && (
              <section>
                <h2 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '2px', backgroundColor: themeColor }}></div> Projects
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {data.projects.map((proj) => (
                    <div key={proj.id}>
                      <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{proj.name}</h3>
                      <p style={{ color: '#64748b', marginTop: '8px' }}>{proj.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'table-cell', width: '34%', verticalAlign: 'top' }}>
            {/* Skills */}
            {data.skills.length > 0 && (
              <section style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', marginBottom: '16px' }}>
                  Core Skills
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {data.skills.map((skillGroup, idx) => (
                    <div key={idx}>
                      <h3 style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>
                        {skillGroup.category}
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {skillGroup.items.map((skill, i) => (
                          <span key={i} style={{ padding: '6px 12px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px', fontWeight: '700', color: '#475569' }}>
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
              <section style={{ padding: '24px', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', marginBottom: '16px' }}>
                  Education
                </h2>
                {data.education.map((edu) => (
                  <div key={edu.id} style={{ marginBottom: '16px' }}>
                    <p style={{ fontWeight: '700', fontSize: '13px' }}>{edu.degree}</p>
                    <p style={{ fontSize: '11px', color: '#64748b' }}>{edu.school}</p>
                  </div>
                ))}
              </section>
            )}

            {/* Languages */}
            {data.languages.length > 0 && (
              <section style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', marginBottom: '16px' }}>
                  Languages
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.languages.map((lang) => (
                    <div key={lang.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ fontWeight: '500' }}>{lang.name}</span>
                      <span style={{ color: '#94a3b8' }}>{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
