import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

export const FresherPlacementProPrint: React.FC<TemplateProps> = ({ data, themeColor = '#9333ea' }) => (
  <div className="bg-white w-full font-sans" style={{ minHeight: '297mm' }}>
    {/* Header */}
    <header style={{ background: 'linear-gradient(to right, #9333ea, #ec4899)', color: '#ffffff', padding: '48px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>{data.identity.fullName}</h1>
      <p style={{ fontSize: '18px', marginBottom: '16px', opacity: 0.9 }}>{data.identity.jobTitle}</p>
      <div style={{ fontSize: '13px', opacity: 0.8 }}>
        {data.identity.email} • {data.identity.phone} • {data.identity.location}
      </div>
    </header>

    <div style={{ padding: '64px' }}>
      {/* Career Objective */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', paddingBottom: '8px', borderBottom: `2px solid ${themeColor}`, color: themeColor }}>
          CAREER OBJECTIVE
        </h2>
        <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#374151' }}>{data.summary}</p>
      </section>

      {/* Education */}
      {data.education.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', paddingBottom: '8px', borderBottom: `2px solid ${themeColor}`, color: themeColor }}>
            EDUCATION
          </h2>
          {data.education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h3 style={{ fontWeight: '700', fontSize: '15px' }}>
                  {edu.degree}{edu.field && ` in ${edu.field}`}
                </h3>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>{edu.startDate} - {edu.endDate}</span>
              </div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563' }}>{edu.school} | {edu.location}</p>
              {edu.gpa && <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>GPA: {edu.gpa}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', paddingBottom: '8px', borderBottom: `2px solid ${themeColor}`, color: themeColor }}>
            TECHNICAL SKILLS
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.skills.map((skillGroup, idx) => (
              <div key={idx}>
                <span style={{ fontWeight: '600', fontSize: '13px', color: themeColor }}>{skillGroup.category}: </span>
                <span style={{ fontSize: '13px', color: '#374151' }}>{skillGroup.items.join(' • ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', paddingBottom: '8px', borderBottom: `2px solid ${themeColor}`, color: themeColor }}>
            ACADEMIC PROJECTS
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {data.projects.map((proj) => (
              <div key={proj.id}>
                <h3 style={{ fontWeight: '700', fontSize: '15px' }}>{proj.name}</h3>
                <p style={{ fontSize: '13px', color: '#374151', marginTop: '8px', lineHeight: '1.6' }}>{proj.description}</p>
                {proj.technologies && (
                  <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
                    <span style={{ fontWeight: '600' }}>Technologies Used:</span> {proj.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', paddingBottom: '8px', borderBottom: `2px solid ${themeColor}`, color: themeColor }}>
            INTERNSHIPS & EXPERIENCE
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

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', paddingBottom: '8px', borderBottom: `2px solid ${themeColor}`, color: themeColor }}>
            CERTIFICATIONS
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.certifications.map((cert) => (
              <div key={cert.id} style={{ fontSize: '13px' }}>
                <span style={{ fontWeight: '600' }}>{cert.name}</span>
                <span style={{ color: '#4b5563' }}> - {cert.issuer} ({cert.date})</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Awards */}
      {data.awards.length > 0 && (
        <section>
          <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', paddingBottom: '8px', borderBottom: `2px solid ${themeColor}`, color: themeColor }}>
            ACHIEVEMENTS & AWARDS
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.awards.map((award) => (
              <div key={award.id}>
                <div style={{ fontSize: '13px' }}>
                  <span style={{ fontWeight: '600' }}>{award.title}</span>
                  <span style={{ color: '#4b5563' }}> - {award.issuer} ({award.date})</span>
                </div>
                {award.description && <p style={{ fontSize: '13px', color: '#4b5563', marginTop: '4px' }}>{award.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  </div>
);
