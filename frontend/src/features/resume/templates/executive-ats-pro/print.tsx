import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

export const ExecutiveAtsPrint: React.FC<TemplateProps> = ({ data, themeColor = '#1e293b' }) => (
  <div className="bg-white w-full text-gray-900" style={{ padding: '64px', minHeight: '297mm', fontFamily: 'Georgia, serif' }}>
    {/* Header */}
    <header style={{ marginBottom: '48px' }}>
      <div style={{ backgroundColor: themeColor, color: '#ffffff', padding: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>{data.identity.fullName}</h1>
        <p style={{ fontSize: '18px', opacity: 0.9 }}>{data.identity.jobTitle}</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4b5563', marginTop: '24px', paddingBottom: '16px', borderBottom: '2px solid #e5e7eb' }}>
        <div>
          {data.identity.email} • {data.identity.phone} • {data.identity.location}
        </div>
        {data.identity.linkedin && <div style={{ fontSize: '11px' }}>{data.identity.linkedin}</div>}
      </div>
    </header>

    {/* Executive Summary */}
    <section style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', color: themeColor }}>
        EXECUTIVE SUMMARY
      </h2>
      <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#374151', fontFamily: 'sans-serif' }}>{data.summary}</p>
    </section>

    {/* Professional Experience */}
    {data.experience.length > 0 && (
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', color: themeColor }}>
          PROFESSIONAL EXPERIENCE
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h3 style={{ fontWeight: '700', fontSize: '15px' }}>{exp.position}</h3>
                <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'sans-serif' }}>{exp.startDate} - {exp.endDate}</span>
              </div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>
                {exp.company} | {exp.location}
              </p>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6', fontFamily: 'sans-serif' }}>{exp.description}</p>
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Education */}
    {data.education.length > 0 && (
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', color: themeColor }}>
          EDUCATION
        </h2>
        {data.education.map((edu) => (
          <div key={edu.id} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontWeight: '700', fontSize: '14px' }}>
                {edu.degree}{edu.field && ` in ${edu.field}`}
              </h3>
              <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'sans-serif' }}>{edu.startDate} - {edu.endDate}</span>
            </div>
            <p style={{ fontSize: '13px', color: '#4b5563' }}>{edu.school} | {edu.location}</p>
          </div>
        ))}
      </section>
    )}

    {/* Core Competencies */}
    {data.skills.length > 0 && (
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', color: themeColor }}>
          CORE COMPETENCIES
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'sans-serif' }}>
          {data.skills.map((skillGroup, idx) => (
            <div key={idx}>
              <span style={{ fontWeight: '600', fontSize: '13px' }}>{skillGroup.category}: </span>
              <span style={{ fontSize: '13px', color: '#374151' }}>{skillGroup.items.join(' • ')}</span>
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Certifications */}
    {data.certifications.length > 0 && (
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', color: themeColor }}>
          PROFESSIONAL CERTIFICATIONS
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'sans-serif' }}>
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
        <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', color: themeColor }}>
          AWARDS & RECOGNITION
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'sans-serif' }}>
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
);
