// Template Generator for Resume Builder
// This file contains all 15 template designs

function generateTemplateHTML(templateId, data) {
  // Helper functions
  const makeLink = (url, text) => {
    if (!url) return '';
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    return `<a href="${fullUrl}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${text || url}</a>`;
  };

  const hasValue = (val) => val && val.trim && val.trim().length > 0;
  const hasItems = (arr) => arr && arr.length > 0;

  // Default template used for all designs currently
  const defaultTemplate = `
    <div style="padding: 40px; font-family: 'Inter', 'Roboto', sans-serif; max-width: 800px; margin: 0 auto; background: white;">
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px;">
        <h1 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">${data.name || 'Your Name'}</h1>
        <div style="font-size: 14px; color: #64748b; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
          ${hasValue(data.email) ? `<span>📧 ${data.email}</span>` : ''}
          ${hasValue(data.phone) ? `<span>📱 ${data.phone}</span>` : ''}
          ${hasValue(data.location) ? `<span>📍 ${data.location}</span>` : ''}
        </div>
        ${hasValue(data.linkedin) || hasValue(data.github) || hasValue(data.portfolio) ? `
          <div style="font-size: 13px; margin-top: 8px; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            ${hasValue(data.linkedin) ? `<span>🔗 ${makeLink(data.linkedin, 'LinkedIn')}</span>` : ''}
            ${hasValue(data.github) ? `<span>💻 ${makeLink(data.github, 'GitHub')}</span>` : ''}
            ${hasValue(data.portfolio) ? `<span>🌐 ${makeLink(data.portfolio, 'Portfolio')}</span>` : ''}
          </div>
        ` : ''}
      </div>
      ${hasValue(data.summary) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">PROFESSIONAL SUMMARY</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">${data.summary}</p>
        </div>
      ` : ''}
      ${hasItems(data.skills) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">SKILLS</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${data.skills.map(s => `<span style="background: #eff6ff; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">${s}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      ${hasItems(data.experience) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">EXPERIENCE</h2>
          ${data.experience.map(exp => `
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <h3 style="font-size: 15px; font-weight: 700; color: #0f172a;">${exp.title || 'Job Title'}</h3>
                <span style="font-size: 13px; color: #64748b; font-weight: 600;">${exp.duration || 'Duration'}</span>
              </div>
              <div style="font-size: 14px; color: #2563eb; font-weight: 600; margin-bottom: 6px;">${exp.company || 'Company Name'}</div>
              <p style="font-size: 14px; color: #475569; line-height: 1.5;">${exp.description || 'Job description...'}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.education) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">EDUCATION</h2>
          ${data.education.map(edu => `
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <h3 style="font-size: 15px; font-weight: 700; color: #0f172a;">${edu.degree || 'Degree'}</h3>
                <span style="font-size: 13px; color: #64748b; font-weight: 600;">${edu.year || 'Year'}</span>
              </div>
              <div style="font-size: 14px; color: #2563eb; font-weight: 600;">${edu.school || 'School/University'}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.projects) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">PROJECTS</h2>
          ${data.projects.map(proj => `
            <div style="margin-bottom: 16px;">
              <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">${proj.name || 'Project Name'}</h3>
              <div style="font-size: 13px; color: #2563eb; font-weight: 600; margin-bottom: 6px;">${proj.tech || 'Technologies'}</div>
              <p style="font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 4px;">${proj.description || 'Project description...'}</p>
              ${hasValue(proj.github) || hasValue(proj.demo) ? `
                <div style="font-size: 13px; display: flex; gap: 12px; margin-top: 6px;">
                  ${hasValue(proj.github) ? `<span>💻 ${makeLink(proj.github, 'GitHub')}</span>` : ''}
                  ${hasValue(proj.demo) ? `<span>🚀 ${makeLink(proj.demo, 'Live Demo')}</span>` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.achievements) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">ACHIEVEMENTS</h2>
          ${data.achievements.map(ach => `
            <div style="margin-bottom: 12px;">
              <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">🏆 ${ach.title || 'Achievement'}</h3>
              ${hasValue(ach.description) ? `<p style="font-size: 14px; color: #475569; line-height: 1.5;">${ach.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.hobbies) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">HOBBIES & INTERESTS</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${data.hobbies.map(h => `<span style="background: #f1f5f9; color: #475569; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">${h}</span>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  // Template-specific designs
  const templates = {
    'ats-simple': generateATSSimple(data, hasValue, hasItems),
    'ats-clean': generateATSClean(data, hasValue, hasItems, makeLink),
    'ats-compact': generateATSCompact(data, hasValue, hasItems),
    'prof-classic': generateProfClassic(data, hasValue, hasItems),
    'prof-navy': generateProfNavy(data, hasValue, hasItems, makeLink),
    'prof-twocol': generateProfTwoCol(data, hasValue, hasItems),
    'mod-minimal': generateModMinimal(data, hasValue, hasItems),
    'mod-bold': generateModBold(data, hasValue, hasItems, makeLink),
    'creative-teal': generateCreativeTeal(data, hasValue, hasItems),
    'creative-purple': generateCreativePurple(data, hasValue, hasItems),
    'prem-glass': generatePremGlass(data, hasValue, hasItems, makeLink),
    'prem-exec': generatePremExec(data, hasValue, hasItems, makeLink),
    'prem-neon': generatePremNeon(data, hasValue, hasItems, makeLink),
    'prem-elegant': generatePremElegant(data, hasValue, hasItems, makeLink),
    'prem-gradient': generatePremGradient(data, hasValue, hasItems, makeLink)
  };

  return templates[templateId] || defaultTemplate;
}

// ATS Simple Template
function generateATSSimple(data, hasValue, hasItems) {
  return `
    <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: white; line-height: 1.6;">
      <div style="margin-bottom: 30px;">
        <h1 style="font-size: 36px; font-weight: 700; color: #000; margin-bottom: 8px;">${data.name || 'Your Name'}</h1>
        <div style="font-size: 14px; color: #333;">
          ${hasValue(data.email) ? `${data.email}` : ''}
          ${hasValue(data.phone) ? ` | ${data.phone}` : ''}
          ${hasValue(data.location) ? ` | ${data.location}` : ''}
        </div>
      </div>
      ${hasValue(data.summary) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; margin-bottom: 8px; color: #000; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 4px;">Professional Summary</h2>
          <p style="font-size: 14px; color: #333;">${data.summary}</p>
        </div>
      ` : ''}
      ${hasItems(data.skills) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; margin-bottom: 8px; color: #000; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 4px;">Skills</h2>
          <p style="font-size: 14px; color: #333;">${data.skills.join(' • ')}</p>
        </div>
      ` : ''}
      ${hasItems(data.experience) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; margin-bottom: 12px; color: #000; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 4px;">Experience</h2>
          ${data.experience.map(exp => `
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #000;">${exp.title || 'Job Title'}</h3>
                <span style="font-size: 14px; color: #333;">${exp.duration || 'Duration'}</span>
              </div>
              <div style="font-size: 14px; color: #333; margin-bottom: 6px;">${exp.company || 'Company Name'}</div>
              <p style="font-size: 14px; color: #333;">${exp.description || 'Job description...'}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.education) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; margin-bottom: 12px; color: #000; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 4px;">Education</h2>
          ${data.education.map(edu => `
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between;">
                <h3 style="font-size: 16px; font-weight: 700; color: #000;">${edu.degree || 'Degree'}</h3>
                <span style="font-size: 14px; color: #333;">${edu.year || 'Year'}</span>
              </div>
              <div style="font-size: 14px; color: #333;">${edu.school || 'School/University'}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.projects) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; margin-bottom: 12px; color: #000; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 4px;">Projects</h2>
          ${data.projects.map(proj => `
            <div style="margin-bottom: 16px;">
              <h3 style="font-size: 16px; font-weight: 700; color: #000; margin-bottom: 4px;">${proj.name || 'Project Name'}</h3>
              <div style="font-size: 14px; color: #333; margin-bottom: 6px;">${proj.tech || 'Technologies'}</div>
              <p style="font-size: 14px; color: #333;">${proj.description || 'Project description...'}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.achievements) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; margin-bottom: 12px; color: #000; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 4px;">Achievements</h2>
          ${data.achievements.map(ach => `
            <div style="margin-bottom: 12px;">
              <h3 style="font-size: 16px; font-weight: 700; color: #000;">• ${ach.title || 'Achievement'}</h3>
              ${hasValue(ach.description) ? `<p style="font-size: 14px; color: #333; margin-left: 16px;">${ach.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.hobbies) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; margin-bottom: 8px; color: #000; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 4px;">Hobbies & Interests</h2>
          <p style="font-size: 14px; color: #333;">${data.hobbies.join(', ')}</p>
        </div>
      ` : ''}
    </div>
  `;
}

// ATS Clean Template
function generateATSClean(data, hasValue, hasItems, makeLink) {
  return `
    <div style="padding: 40px; font-family: 'Calibri', Arial, sans-serif; max-width: 800px; margin: 0 auto; background: white; line-height: 1.7;">
      <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #e5e7eb;">
        <h1 style="font-size: 38px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">${data.name || 'Your Name'}</h1>
        <div style="font-size: 14px; color: #666;">
          ${hasValue(data.email) ? `${data.email}` : ''}
          ${hasValue(data.phone) ? ` • ${data.phone}` : ''}
          ${hasValue(data.location) ? ` • ${data.location}` : ''}
        </div>
        ${hasValue(data.linkedin) || hasValue(data.github) || hasValue(data.portfolio) ? `
          <div style="font-size: 13px; margin-top: 8px;">
            ${hasValue(data.linkedin) ? `${makeLink(data.linkedin, 'LinkedIn')}` : ''}
            ${hasValue(data.github) ? ` • ${makeLink(data.github, 'GitHub')}` : ''}
            ${hasValue(data.portfolio) ? ` • ${makeLink(data.portfolio, 'Portfolio')}` : ''}
          </div>
        ` : ''}
      </div>
      ${hasValue(data.summary) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 600; color: #2563eb; margin-bottom: 8px; border-bottom: 2px solid #2563eb; padding-bottom: 4px;">SUMMARY</h2>
          <p style="font-size: 14px; color: #444;">${data.summary}</p>
        </div>
      ` : ''}
      ${hasItems(data.skills) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 600; color: #2563eb; margin-bottom: 8px; border-bottom: 2px solid #2563eb; padding-bottom: 4px;">SKILLS</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${data.skills.map(s => `<span style="background: #eff6ff; color: #1e40af; padding: 6px 14px; border-radius: 12px; font-size: 13px; font-weight: 600;">${s}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      ${hasItems(data.experience) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 600; color: #2563eb; margin-bottom: 12px; border-bottom: 2px solid #2563eb; padding-bottom: 4px;">EXPERIENCE</h2>
          ${data.experience.map(exp => `
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #1a1a1a;">${exp.title || 'Job Title'}</h3>
                <span style="font-size: 14px; color: #666;">${exp.duration || 'Duration'}</span>
              </div>
              <div style="font-size: 14px; color: #2563eb; font-weight: 600; margin-bottom: 6px;">${exp.company || 'Company Name'}</div>
              <p style="font-size: 14px; color: #444;">${exp.description || 'Job description...'}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.education) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 600; color: #2563eb; margin-bottom: 12px; border-bottom: 2px solid #2563eb; padding-bottom: 4px;">EDUCATION</h2>
          ${data.education.map(edu => `
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between;">
                <h3 style="font-size: 16px; font-weight: 700; color: #1a1a1a;">${edu.degree || 'Degree'}</h3>
                <span style="font-size: 14px; color: #666;">${edu.year || 'Year'}</span>
              </div>
              <div style="font-size: 14px; color: #444;">${edu.school || 'School/University'}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.projects) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 600; color: #2563eb; margin-bottom: 12px; border-bottom: 2px solid #2563eb; padding-bottom: 4px;">PROJECTS</h2>
          ${data.projects.map(proj => `
            <div style="margin-bottom: 16px;">
              <h3 style="font-size: 16px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px;">${proj.name || 'Project Name'}</h3>
              <div style="font-size: 14px; color: #2563eb; font-weight: 600; margin-bottom: 6px;">${proj.tech || 'Technologies'}</div>
              <p style="font-size: 14px; color: #444; margin-bottom: 4px;">${proj.description || 'Project description...'}</p>
              ${hasValue(proj.github) || hasValue(proj.demo) ? `
                <div style="font-size: 13px; margin-top: 6px;">
                  ${hasValue(proj.github) ? `${makeLink(proj.github, 'GitHub')}` : ''}
                  ${hasValue(proj.demo) ? ` • ${makeLink(proj.demo, 'Live Demo')}` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.achievements) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 600; color: #2563eb; margin-bottom: 12px; border-bottom: 2px solid #2563eb; padding-bottom: 4px;">ACHIEVEMENTS</h2>
          ${data.achievements.map(ach => `
            <div style="margin-bottom: 12px;">
              <h3 style="font-size: 16px; font-weight: 700; color: #1a1a1a;">🏆 ${ach.title || 'Achievement'}</h3>
              ${hasValue(ach.description) ? `<p style="font-size: 14px; color: #444;">${ach.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.hobbies) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 600; color: #2563eb; margin-bottom: 8px; border-bottom: 2px solid #2563eb; padding-bottom: 4px;">HOBBIES & INTERESTS</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${data.hobbies.map(h => `<span style="background: #f1f5f9; color: #475569; padding: 6px 14px; border-radius: 12px; font-size: 13px; font-weight: 600;">${h}</span>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// ATS Compact Template
function generateATSCompact(data, hasValue, hasItems) {
  return `
    <div style="padding: 35px; font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; background: white; line-height: 1.5;">
      <div style="margin-bottom: 25px;">
        <h1 style="font-size: 32px; font-weight: 700; color: #000; margin-bottom: 6px;">${data.name || 'Your Name'}</h1>
        <div style="font-size: 13px; color: #333;">
          ${hasValue(data.email) ? `${data.email}` : ''}
          ${hasValue(data.phone) ? ` | ${data.phone}` : ''}
          ${hasValue(data.location) ? ` | ${data.location}` : ''}
        </div>
      </div>
      ${hasValue(data.summary) ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px; margin-bottom: 6px; color: #000; font-weight: 700;">SUMMARY</h2>
          <p style="font-size: 13px; color: #333;">${data.summary}</p>
        </div>
      ` : ''}
      ${hasItems(data.skills) ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px; margin-bottom: 6px; color: #000; font-weight: 700;">SKILLS</h2>
          <p style="font-size: 13px; color: #333;">${data.skills.join(', ')}</p>
        </div>
      ` : ''}
      ${hasItems(data.experience) ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px; margin-bottom: 10px; color: #000; font-weight: 700;">EXPERIENCE</h2>
          ${data.experience.map(exp => `
            <div style="margin-bottom: 14px;">
              <h3 style="font-size: 15px; font-weight: 700; color: #000; margin-bottom: 3px;">${exp.title || 'Job Title'} - ${exp.company || 'Company Name'}</h3>
              <div style="font-size: 13px; color: #333; margin-bottom: 4px;">${exp.duration || 'Duration'}</div>
              <p style="font-size: 13px; color: #333;">${exp.description || 'Job description...'}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.education) ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px; margin-bottom: 10px; color: #000; font-weight: 700;">EDUCATION</h2>
          ${data.education.map(edu => `
            <div style="margin-bottom: 10px;">
              <h3 style="font-size: 15px; font-weight: 700; color: #000;">${edu.degree || 'Degree'}</h3>
              <div style="font-size: 13px; color: #333;">${edu.school || 'School/University'} | ${edu.year || 'Year'}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.projects) ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px; margin-bottom: 10px; color: #000; font-weight: 700;">PROJECTS</h2>
          ${data.projects.map(proj => `
            <div style="margin-bottom: 14px;">
              <h3 style="font-size: 15px; font-weight: 700; color: #000; margin-bottom: 3px;">${proj.name || 'Project Name'}</h3>
              <div style="font-size: 13px; color: #333; margin-bottom: 4px;">${proj.tech || 'Technologies'}</div>
              <p style="font-size: 13px; color: #333;">${proj.description || 'Project description...'}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.achievements) ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px; margin-bottom: 10px; color: #000; font-weight: 700;">ACHIEVEMENTS</h2>
          ${data.achievements.map(ach => `
            <div style="margin-bottom: 10px;">
              <h3 style="font-size: 15px; font-weight: 700; color: #000;">• ${ach.title || 'Achievement'}</h3>
              ${hasValue(ach.description) ? `<p style="font-size: 13px; color: #333; margin-left: 14px;">${ach.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.hobbies) ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px; margin-bottom: 6px; color: #000; font-weight: 700;">HOBBIES & INTERESTS</h2>
          <p style="font-size: 13px; color: #333;">${data.hobbies.join(', ')}</p>
        </div>
      ` : ''}
    </div>
  `;
}

// Professional Classic Template
function generateProfClassic(data, hasValue, hasItems) {
  return `
    <div style="padding: 40px; font-family: Georgia, serif; max-width: 800px; margin: 0 auto; background: white; line-height: 1.7;">
      <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 4px double #1a1a1a;">
        <h1 style="font-size: 40px; font-weight: 400; color: #1a1a1a; margin-bottom: 8px;">${data.name || 'Your Name'}</h1>
        <div style="font-size: 14px; color: #444; margin-top: 8px;">
          ${hasValue(data.email) ? `${data.email}` : ''}
          ${hasValue(data.phone) ? ` | ${data.phone}` : ''}
        </div>
        ${hasValue(data.location) ? `<div style="font-size: 14px; color: #444;">${data.location}</div>` : ''}
      </div>
      ${hasValue(data.summary) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 22px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; border-bottom: 3px solid #1a1a1a; padding-bottom: 6px;">Professional Summary</h2>
          <p style="font-size: 14px; color: #333; text-align: justify;">${data.summary}</p>
        </div>
      ` : ''}
      ${hasItems(data.skills) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 22px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; border-bottom: 3px solid #1a1a1a; padding-bottom: 6px;">Core Competencies</h2>
          <p style="font-size: 14px; color: #333;">${data.skills.join(' • ')}</p>
        </div>
      ` : ''}
      ${hasItems(data.experience) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 22px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px; border-bottom: 3px solid #1a1a1a; padding-bottom: 6px;">Professional Experience</h2>
          ${data.experience.map(exp => `
            <div style="margin-bottom: 18px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <h3 style="font-size: 17px; font-weight: 600; color: #1a1a1a;">${exp.title || 'Job Title'}</h3>
                <span style="font-size: 14px; color: #666; font-style: italic;">${exp.duration || 'Duration'}</span>
              </div>
              <div style="font-size: 14px; color: #333; font-style: italic; margin-bottom: 8px;">${exp.company || 'Company Name'}</div>
              <p style="font-size: 14px; color: #333;">${exp.description || 'Job description...'}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.education) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 22px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px; border-bottom: 3px solid #1a1a1a; padding-bottom: 6px;">Education</h2>
          ${data.education.map(edu => `
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between;">
                <h3 style="font-size: 17px; font-weight: 600; color: #1a1a1a;">${edu.degree || 'Degree'}</h3>
                <span style="font-size: 14px; color: #666; font-style: italic;">${edu.year || 'Year'}</span>
              </div>
              <div style="font-size: 14px; color: #333; font-style: italic;">${edu.school || 'School/University'}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.projects) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 22px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px; border-bottom: 3px solid #1a1a1a; padding-bottom: 6px;">Projects</h2>
          ${data.projects.map(proj => `
            <div style="margin-bottom: 16px;">
              <h3 style="font-size: 17px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">${proj.name || 'Project Name'}</h3>
              <div style="font-size: 14px; color: #666; margin-bottom: 6px;">${proj.tech || 'Technologies'}</div>
              <p style="font-size: 14px; color: #333;">${proj.description || 'Project description...'}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.achievements) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 22px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px; border-bottom: 3px solid #1a1a1a; padding-bottom: 6px;">Achievements</h2>
          ${data.achievements.map(ach => `
            <div style="margin-bottom: 12px;">
              <h3 style="font-size: 17px; font-weight: 600; color: #1a1a1a;">• ${ach.title || 'Achievement'}</h3>
              ${hasValue(ach.description) ? `<p style="font-size: 14px; color: #333; margin-left: 16px;">${ach.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.hobbies) ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 22px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; border-bottom: 3px solid #1a1a1a; padding-bottom: 6px;">Hobbies & Interests</h2>
          <p style="font-size: 14px; color: #333;">${data.hobbies.join(', ')}</p>
        </div>
      ` : ''}
    </div>
  `;
}

// Professional Navy Template (Sidebar Layout)
function generateProfNavy(data, hasValue, hasItems, makeLink) {
  return `
    <div style="display: flex; font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; background: white;">
      <div style="width: 35%; background: #1e3a8a; color: white; padding: 40px 30px;">
        <h1 style="font-size: 32px; font-weight: 700; margin-bottom: 20px;">${data.name || 'Your Name'}</h1>
        <div style="margin-bottom: 30px;">
          ${hasValue(data.email) ? `<div style="font-size: 12px; margin: 8px 0;">📧 ${data.email}</div>` : ''}
          ${hasValue(data.phone) ? `<div style="font-size: 12px; margin: 8px 0;">📱 ${data.phone}</div>` : ''}
          ${hasValue(data.location) ? `<div style="font-size: 12px; margin: 8px 0;">📍 ${data.location}</div>` : ''}
          ${hasValue(data.linkedin) ? `<div style="font-size: 12px; margin: 8px 0;">🔗 ${makeLink(data.linkedin, 'LinkedIn')}</div>` : ''}
          ${hasValue(data.github) ? `<div style="font-size: 12px; margin: 8px 0;">💻 ${makeLink(data.github, 'GitHub')}</div>` : ''}
          ${hasValue(data.portfolio) ? `<div style="font-size: 12px; margin: 8px 0;">🌐 ${makeLink(data.portfolio, 'Portfolio')}</div>` : ''}
        </div>
        ${hasItems(data.skills) ? `
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 20px; font-weight: 600; color: #93c5fd; margin-bottom: 12px; border-bottom: 2px solid #93c5fd; padding-bottom: 6px;">SKILLS</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${data.skills.map(s => `<span style="background: #3b82f6; padding: 6px 12px; border-radius: 12px; font-size: 12px;">${s}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${hasItems(data.education) ? `
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 20px; font-weight: 600; color: #93c5fd; margin-bottom: 12px; border-bottom: 2px solid #93c5fd; padding-bottom: 6px;">EDUCATION</h2>
            ${data.education.map(edu => `
              <div style="margin-bottom: 16px;">
                <h3 style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">${edu.degree || 'Degree'}</h3>
                <div style="font-size: 13px; margin-bottom: 2px;">${edu.school || 'School/University'}</div>
                <div style="font-size: 12px; color: #93c5fd;">${edu.year || 'Year'}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${hasItems(data.hobbies) ? `
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 20px; font-weight: 600; color: #93c5fd; margin-bottom: 12px; border-bottom: 2px solid #93c5fd; padding-bottom: 6px;">HOBBIES</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${data.hobbies.map(h => `<span style="background: rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 12px; font-size: 12px;">${h}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
      <div style="width: 65%; padding: 40px 35px;">
        ${hasValue(data.summary) ? `
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 22px; font-weight: 600; color: #1e3a8a; margin-bottom: 12px; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px;">SUMMARY</h2>
            <p style="font-size: 14px; color: #333; line-height: 1.6;">${data.summary}</p>
          </div>
        ` : ''}
        ${hasItems(data.experience) ? `
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 22px; font-weight: 600; color: #1e3a8a; margin-bottom: 12px; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px;">EXPERIENCE</h2>
            ${data.experience.map(exp => `
              <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <h3 style="font-size: 16px; font-weight: 700; color: #0f172a;">${exp.title || 'Job Title'}</h3>
                  <span style="font-size: 13px; color: #666;">${exp.duration || 'Duration'}</span>
                </div>
                <div style="font-size: 14px; color: #1e3a8a; font-weight: 600; margin-bottom: 8px;">${exp.company || 'Company Name'}</div>
                <p style="font-size: 14px; color: #333; line-height: 1.6;">${exp.description || 'Job description...'}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${hasItems(data.projects) ? `
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 22px; font-weight: 600; color: #1e3a8a; margin-bottom: 12px; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px;">PROJECTS</h2>
            ${data.projects.map(proj => `
              <div style="margin-bottom: 18px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">${proj.name || 'Project Name'}</h3>
                <div style="font-size: 13px; color: #666; margin-bottom: 6px;">${proj.tech || 'Technologies'}</div>
                <p style="font-size: 14px; color: #333; line-height: 1.6; margin-bottom: 4px;">${proj.description || 'Project description...'}</p>
                ${hasValue(proj.github) || hasValue(proj.demo) ? `
                  <div style="font-size: 13px; margin-top: 6px;">
                    ${hasValue(proj.github) ? `💻 ${makeLink(proj.github, 'GitHub')}` : ''}
                    ${hasValue(proj.demo) ? ` • 🚀 ${makeLink(proj.demo, 'Live Demo')}` : ''}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${hasItems(data.achievements) ? `
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 22px; font-weight: 600; color: #1e3a8a; margin-bottom: 12px; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px;">ACHIEVEMENTS</h2>
            ${data.achievements.map(ach => `
              <div style="margin-bottom: 14px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #0f172a;">🏆 ${ach.title || 'Achievement'}</h3>
                ${hasValue(ach.description) ? `<p style="font-size: 14px; color: #333; line-height: 1.6;">${ach.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Professional Two Column Template
function generateProfTwoCol(data, hasValue, hasItems) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 900px; margin: 0 auto; background: white;">
      <div style="background: #2c3e50; color: white; padding: 35px 40px;">
        <h1 style="font-size: 36px; font-weight: 700; margin-bottom: 8px;">${data.name || 'Your Name'}</h1>
        <div style="font-size: 13px; color: #bdc3c7;">
          ${hasValue(data.email) ? `${data.email}` : ''}
          ${hasValue(data.phone) ? ` · ${data.phone}` : ''}
          ${hasValue(data.location) ? ` · ${data.location}` : ''}
        </div>
      </div>
      <div style="display: flex;">
        <div style="flex: 1; padding: 35px 40px; border-right: 2px solid #e0e0e0;">
          ${hasValue(data.summary) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 22px; font-weight: 700; color: #2c3e50; margin-bottom: 12px; border-bottom: 2px solid #2c3e50; padding-bottom: 6px;">SUMMARY</h2>
              <p style="font-size: 14px; color: #333; line-height: 1.6;">${data.summary}</p>
            </div>
          ` : ''}
          ${hasItems(data.experience) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 22px; font-weight: 700; color: #2c3e50; margin-bottom: 12px; border-bottom: 2px solid #2c3e50; padding-bottom: 6px;">EXPERIENCE</h2>
              ${data.experience.map(exp => `
                <div style="margin-bottom: 20px;">
                  <h3 style="font-size: 16px; font-weight: 700; color: #2c3e50; margin-bottom: 4px;">${exp.title || 'Job Title'}</h3>
                  <div style="font-size: 13px; color: #2c3e50; margin-bottom: 6px;">${exp.company || 'Company Name'} | ${exp.duration || 'Duration'}</div>
                  <p style="font-size: 14px; color: #333; line-height: 1.6;">${exp.description || 'Job description...'}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${hasItems(data.projects) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 22px; font-weight: 700; color: #2c3e50; margin-bottom: 12px; border-bottom: 2px solid #2c3e50; padding-bottom: 6px;">PROJECTS</h2>
              ${data.projects.map(proj => `
                <div style="margin-bottom: 18px;">
                  <h3 style="font-size: 16px; font-weight: 700; color: #2c3e50; margin-bottom: 4px;">${proj.name || 'Project Name'}</h3>
                  <div style="font-size: 13px; color: #666; margin-bottom: 6px;">${proj.tech || 'Technologies'}</div>
                  <p style="font-size: 14px; color: #333; line-height: 1.6;">${proj.description || 'Project description...'}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div style="width: 280px; padding: 35px 30px; background: #f9f9f9;">
          ${hasItems(data.skills) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 18px; font-weight: 700; color: #2c3e50; margin-bottom: 12px;">SKILLS</h2>
              ${data.skills.map(s => `<div style="margin: 10px 0; font-size: 14px; color: #333;">• ${s}</div>`).join('')}
            </div>
          ` : ''}
          ${hasItems(data.education) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 18px; font-weight: 700; color: #2c3e50; margin-bottom: 12px;">EDUCATION</h2>
              ${data.education.map(edu => `
                <div style="margin-bottom: 16px;">
                  <h3 style="font-size: 14px; font-weight: 700; color: #2c3e50; margin-bottom: 4px;">${edu.degree || 'Degree'}</h3>
                  <div style="font-size: 13px; color: #555; margin-bottom: 2px;">${edu.school || 'School/University'}</div>
                  <div style="font-size: 12px; color: #888;">${edu.year || 'Year'}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${hasItems(data.achievements) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 18px; font-weight: 700; color: #2c3e50; margin-bottom: 12px;">ACHIEVEMENTS</h2>
              ${data.achievements.map(ach => `
                <div style="margin-bottom: 14px;">
                  <div style="font-size: 13px; font-weight: 700; color: #2c3e50;">🏆 ${ach.title || 'Achievement'}</div>
                  ${hasValue(ach.description) ? `<div style="font-size: 12px; color: #555; margin-top: 4px;">${ach.description}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${hasItems(data.hobbies) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 18px; font-weight: 700; color: #2c3e50; margin-bottom: 12px;">HOBBIES</h2>
              ${data.hobbies.map(h => `<div style="margin: 8px 0; font-size: 13px; color: #555;">• ${h}</div>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// Modern Minimalist Template
function generateModMinimal(data, hasValue, hasItems) {
  return `
    <div style="padding: 50px; font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 850px; margin: 0 auto; background: white; line-height: 1.7; color: #111;">
      <div style="margin-bottom: 40px;">
        <h1 style="font-size: 42px; font-weight: 300; margin-bottom: 12px; letter-spacing: -0.5px;">${data.name || 'Your Name'}</h1>
        <div style="display: flex; gap: 20px; font-size: 13px; color: #777; flex-wrap: wrap;">
          ${hasValue(data.email) ? `<span>${data.email}</span>` : ''}
          ${hasValue(data.phone) ? `<span>${data.phone}</span>` : ''}
          ${hasValue(data.location) ? `<span>${data.location}</span>` : ''}
        </div>
      </div>
      ${hasValue(data.summary) ? `
        <div style="margin-bottom: 35px;">
          <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 12px;">About</h2>
          <p style="font-size: 14px; color: #444; line-height: 1.7;">${data.summary}</p>
        </div>
      ` : ''}
      ${hasItems(data.experience) ? `
        <div style="margin-bottom: 35px;">
          <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 16px;">Experience</h2>
          ${data.experience.map(exp => `
            <div style="display: grid; grid-template-columns: 150px 1fr; gap: 20px; margin-bottom: 24px;">
              <div style="font-size: 12px; color: #777;">${exp.duration || 'Duration'}</div>
              <div>
                <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">${exp.title || 'Job Title'}</h3>
                <div style="color: #555; font-size: 14px; margin-bottom: 8px;">${exp.company || 'Company Name'}</div>
                <p style="font-size: 13px; color: #333; line-height: 1.6;">${exp.description || 'Job description...'}</p>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.education) ? `
        <div style="margin-bottom: 35px;">
          <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 16px;">Education</h2>
          ${data.education.map(edu => `
            <div style="display: grid; grid-template-columns: 150px 1fr; gap: 20px; margin-bottom: 20px;">
              <div style="font-size: 12px; color: #777;">${edu.year || 'Year'}</div>
              <div>
                <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">${edu.degree || 'Degree'}</h3>
                <div style="color: #555; font-size: 14px;">${edu.school || 'School/University'}</div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.skills) ? `
        <div style="margin-bottom: 35px;">
          <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 12px;">Skills</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${data.skills.map(s => `<span style="border: 1px solid #ddd; padding: 8px 16px; border-radius: 20px; font-size: 13px; color: #333;">${s}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      ${hasItems(data.projects) ? `
        <div style="margin-bottom: 35px;">
          <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 16px;">Projects</h2>
          ${data.projects.map(proj => `
            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">${proj.name || 'Project Name'}</h3>
              <div style="font-size: 13px; color: #777; margin-bottom: 6px;">${proj.tech || 'Technologies'}</div>
              <p style="font-size: 13px; color: #333; line-height: 1.6;">${proj.description || 'Project description...'}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.achievements) ? `
        <div style="margin-bottom: 35px;">
          <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 12px;">Achievements</h2>
          ${data.achievements.map(ach => `
            <div style="margin-bottom: 14px;">
              <h3 style="font-size: 15px; font-weight: 600;">• ${ach.title || 'Achievement'}</h3>
              ${hasValue(ach.description) ? `<p style="font-size: 13px; color: #555; margin-left: 16px; margin-top: 4px;">${ach.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${hasItems(data.hobbies) ? `
        <div style="margin-bottom: 35px;">
          <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 12px;">Hobbies</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${data.hobbies.map(h => `<span style="border: 1px solid #ddd; padding: 8px 16px; border-radius: 20px; font-size: 13px; color: #555;">${h}</span>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// Modern Bold Template
function generateModBold(data, hasValue, hasItems, makeLink) {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 900px; margin: 0 auto; background: white;">
      <div style="background: #111; color: white; padding: 45px 50px;">
        <h1 style="font-size: 44px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px;">${data.name || 'Your Name'}</h1>
        <div style="font-size: 13px; color: #aaa; display: flex; gap: 16px;">
          ${hasValue(data.email) ? `<span>${data.email}</span>` : ''}
          ${hasValue(data.phone) ? `<span>${data.phone}</span>` : ''}
          ${hasValue(data.location) ? `<span>${data.location}</span>` : ''}
        </div>
        ${hasValue(data.linkedin) || hasValue(data.github) || hasValue(data.portfolio) ? `
          <div style="font-size: 13px; margin-top: 10px; display: flex; gap: 16px;">
            ${hasValue(data.linkedin) ? `<span>${makeLink(data.linkedin, 'LinkedIn')}</span>` : ''}
            ${hasValue(data.github) ? `<span>${makeLink(data.github, 'GitHub')}</span>` : ''}
            ${hasValue(data.portfolio) ? `<span>${makeLink(data.portfolio, 'Portfolio')}</span>` : ''}
          </div>
        ` : ''}
      </div>
      <div style="padding: 40px 50px;">
        ${hasValue(data.summary) ? `
          <div style="margin-bottom: 35px; padding-left: 16px; border-left: 4px solid #111;">
            <h2 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">Profile</h2>
            <p style="font-size: 14px; color: #444; line-height: 1.7;">${data.summary}</p>
          </div>
        ` : ''}
        ${hasItems(data.experience) ? `
          <div style="margin-bottom: 35px; padding-left: 16px; border-left: 4px solid #111;">
            <h2 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">Experience</h2>
            ${data.experience.map(exp => `
              <div style="margin-bottom: 24px;">
                <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 4px;">${exp.title || 'Job Title'}</h3>
                <div style="font-size: 13px; color: #666; margin-bottom: 8px;">${exp.company || 'Company Name'} · ${exp.duration || 'Duration'}</div>
                <p style="font-size: 14px; color: #333; line-height: 1.6;">${exp.description || 'Job description...'}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
          ${hasItems(data.education) ? `
            <div style="padding-left: 16px; border-left: 4px solid #111;">
              <h2 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">Education</h2>
              ${data.education.map(edu => `
                <div style="margin-bottom: 16px;">
                  <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">${edu.degree || 'Degree'}</h3>
                  <div style="font-size: 13px; color: #555; margin-bottom: 2px;">${edu.school || 'School/University'}</div>
                  <div style="font-size: 12px; color: #888;">${edu.year || 'Year'}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${hasItems(data.skills) ? `
            <div style="padding-left: 16px; border-left: 4px solid #111;">
              <h2 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">Skills</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${data.skills.map(s => `<span style="background: #111; color: white; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600;">${s}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        ${hasItems(data.projects) ? `
          <div style="margin-top: 35px; padding-left: 16px; border-left: 4px solid #111;">
            <h2 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">Projects</h2>
            ${data.projects.map(proj => `
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">${proj.name || 'Project Name'}</h3>
                <div style="font-size: 13px; color: #666; margin-bottom: 6px;">${proj.tech || 'Technologies'}</div>
                <p style="font-size: 14px; color: #333; line-height: 1.6; margin-bottom: 4px;">${proj.description || 'Project description...'}</p>
                ${hasValue(proj.github) || hasValue(proj.demo) ? `
                  <div style="font-size: 13px; margin-top: 6px;">
                    ${hasValue(proj.github) ? `${makeLink(proj.github, 'GitHub')}` : ''}
                    ${hasValue(proj.demo) ? ` • ${makeLink(proj.demo, 'Live Demo')}` : ''}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${hasItems(data.achievements) ? `
          <div style="margin-top: 35px; padding-left: 16px; border-left: 4px solid #111;">
            <h2 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">Achievements</h2>
            ${data.achievements.map(ach => `
              <div style="margin-bottom: 14px;">
                <h3 style="font-size: 15px; font-weight: 700;">🏆 ${ach.title || 'Achievement'}</h3>
                ${hasValue(ach.description) ? `<p style="font-size: 13px; color: #555; margin-top: 4px;">${ach.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${hasItems(data.hobbies) ? `
          <div style="margin-top: 35px; padding-left: 16px; border-left: 4px solid #111;">
            <h2 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">Hobbies</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${data.hobbies.map(h => `<span style="background: #f5f5f5; color: #333; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600;">${h}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Creative Teal Template
function generateCreativeTeal(data, hasValue, hasItems) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 900px; margin: 0 auto; background: white;">
      <div style="background: linear-gradient(135deg, #0d9488, #0f766e); padding: 45px 50px; color: white;">
        <h1 style="font-size: 40px; font-weight: 700; margin-bottom: 12px;">${data.name || 'Your Name'}</h1>
        <div style="font-size: 13px; opacity: 0.9;">
          ${hasValue(data.email) ? `${data.email}` : ''}
          ${hasValue(data.phone) ? ` · ${data.phone}` : ''}
          ${hasValue(data.location) ? ` · ${data.location}` : ''}
        </div>
      </div>
      <div style="padding: 40px 50px;">
        ${hasValue(data.summary) ? `
          <div style="background: #ccfbf1; border-left: 5px solid #0d9488; padding: 20px 25px; border-radius: 0 12px 12px 0; margin-bottom: 30px;">
            <p style="font-size: 14px; color: #374151; line-height: 1.7;">${data.summary}</p>
          </div>
        ` : ''}
        ${hasItems(data.experience) ? `
          <div style="margin-bottom: 35px;">
            <h2 style="font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 8px; margin-bottom: 16px;">Experience</h2>
            ${data.experience.map(exp => `
              <div style="margin-bottom: 24px;">
                <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 4px;">${exp.title || 'Job Title'}</h3>
                <div style="font-size: 13px; color: #0d9488; font-weight: 600; margin-bottom: 4px;">${exp.company || 'Company Name'}</div>
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${exp.duration || 'Duration'}</div>
                <p style="font-size: 14px; color: #374151; line-height: 1.6;">${exp.description || 'Job description...'}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        <div style="display: grid; grid-template-columns: 1fr 300px; gap: 30px;">
          ${hasItems(data.projects) ? `
            <div>
              <h2 style="font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 8px; margin-bottom: 16px;">Projects</h2>
              ${data.projects.map(proj => `
                <div style="margin-bottom: 20px;">
                  <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">${proj.name || 'Project Name'}</h3>
                  <div style="font-size: 13px; color: #6b7280; margin-bottom: 6px;">${proj.tech || 'Technologies'}</div>
                  <p style="font-size: 13px; color: #4b5563; line-height: 1.6;">${proj.description || 'Project description...'}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
          <div>
            ${hasItems(data.skills) ? `
              <div style="margin-bottom: 30px;">
                <h2 style="font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 8px; margin-bottom: 12px;">Skills</h2>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  ${data.skills.map(s => `<span style="background: #ccfbf1; color: #0d9488; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">${s}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            ${hasItems(data.education) ? `
              <div style="margin-bottom: 30px;">
                <h2 style="font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 8px; margin-bottom: 12px;">Education</h2>
                ${data.education.map(edu => `
                  <div style="margin-bottom: 16px;">
                    <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 4px;">${edu.degree || 'Degree'}</h3>
                    <div style="font-size: 12px; color: #555; margin-bottom: 2px;">${edu.school || 'School/University'}</div>
                    <div style="font-size: 11px; color: #0d9488;">${edu.year || 'Year'}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            ${hasItems(data.achievements) ? `
              <div style="margin-bottom: 30px;">
                <h2 style="font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 8px; margin-bottom: 12px;">Achievements</h2>
                ${data.achievements.map(ach => `
                  <div style="margin-bottom: 12px;">
                    <div style="font-size: 13px; font-weight: 700;">🏆 ${ach.title || 'Achievement'}</div>
                    ${hasValue(ach.description) ? `<div style="font-size: 11px; color: #555; margin-top: 4px;">${ach.description}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            ${hasItems(data.hobbies) ? `
              <div>
                <h2 style="font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 8px; margin-bottom: 12px;">Hobbies</h2>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  ${data.hobbies.map(h => `<span style="background: #f0fdfa; color: #0d9488; padding: 6px 12px; border-radius: 16px; font-size: 11px; font-weight: 600;">${h}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Creative Purple Template
function generateCreativePurple(data, hasValue, hasItems) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 900px; margin: 0 auto; background: white;">
      <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 45px 50px; color: white;">
        <h1 style="font-size: 42px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px;">${data.name || 'Your Name'}</h1>
        <div style="font-size: 13px; opacity: 0.95; display: flex; gap: 16px;">
          ${hasValue(data.email) ? `<span>${data.email}</span>` : ''}
          ${hasValue(data.phone) ? `<span>${data.phone}</span>` : ''}
          ${hasValue(data.location) ? `<span>${data.location}</span>` : ''}
        </div>
      </div>
      <div style="display: flex;">
        <div style="width: 280px; background: #f5f3ff; padding: 35px 30px;">
          ${hasItems(data.skills) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #7c3aed; border-bottom: 2px solid #ddd6fe; padding-bottom: 8px; margin-bottom: 12px;">Skills</h2>
              ${data.skills.map((s, i) => `
                <div style="margin-bottom: 14px;">
                  <div style="font-size: 12px; margin-bottom: 4px; font-weight: 600;">${s}</div>
                  <div style="height: 4px; background: #ddd; border-radius: 2px;">
                    <div style="height: 4px; background: linear-gradient(90deg, #7c3aed, #4f46e5); border-radius: 2px; width: ${70 + (i % 4) * 7}%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${hasItems(data.education) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #7c3aed; border-bottom: 2px solid #ddd6fe; padding-bottom: 8px; margin-bottom: 12px;">Education</h2>
              ${data.education.map(edu => `
                <div style="margin-bottom: 16px;">
                  <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 4px;">${edu.degree || 'Degree'}</h3>
                  <div style="font-size: 12px; color: #5b21b6; margin-bottom: 2px;">${edu.school || 'School/University'}</div>
                  <div style="font-size: 11px; color: #7c3aed;">${edu.year || 'Year'}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${hasItems(data.hobbies) ? `
            <div>
              <h2 style="font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #7c3aed; border-bottom: 2px solid #ddd6fe; padding-bottom: 8px; margin-bottom: 12px;">Hobbies</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${data.hobbies.map(h => `<span style="background: #ede9fe; color: #7c3aed; padding: 6px 12px; border-radius: 12px; font-size: 11px; font-weight: 600;">${h}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        <div style="flex: 1; padding: 35px 40px;">
          ${hasValue(data.summary) ? `
            <div style="border-left: 5px solid #7c3aed; padding-left: 20px; margin-bottom: 30px;">
              <p style="font-size: 14px; color: #374151; line-height: 1.7;">${data.summary}</p>
            </div>
          ` : ''}
          ${hasItems(data.experience) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #7c3aed; border-bottom: 2px solid #ddd6fe; padding-bottom: 8px; margin-bottom: 16px;">Experience</h2>
              ${data.experience.map(exp => `
                <div style="margin-bottom: 24px;">
                  <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 4px;">${exp.title || 'Job Title'}</h3>
                  <div style="font-size: 13px; color: #7c3aed; font-weight: 600; margin-bottom: 4px;">${exp.company || 'Company Name'}</div>
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${exp.duration || 'Duration'}</div>
                  <p style="font-size: 14px; color: #374151; line-height: 1.6;">${exp.description || 'Job description...'}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${hasItems(data.projects) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #7c3aed; border-bottom: 2px solid #ddd6fe; padding-bottom: 8px; margin-bottom: 16px;">Projects</h2>
              ${data.projects.map(proj => `
                <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                  <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">${proj.name || 'Project Name'}</h3>
                  <div style="font-size: 12px; color: #7c3aed; margin-bottom: 6px;">${proj.tech || 'Technologies'}</div>
                  <p style="font-size: 13px; color: #4b5563; line-height: 1.6;">${proj.description || 'Project description...'}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${hasItems(data.achievements) ? `
            <div>
              <h2 style="font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #7c3aed; border-bottom: 2px solid #ddd6fe; padding-bottom: 8px; margin-bottom: 16px;">Achievements</h2>
              ${data.achievements.map(ach => `
                <div style="margin-bottom: 14px;">
                  <h3 style="font-size: 15px; font-weight: 700;">🏆 ${ach.title || 'Achievement'}</h3>
                  ${hasValue(ach.description) ? `<p style="font-size: 13px; color: #555; margin-top: 4px;">${ach.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// Premium Glass Template
function generatePremGlass(data, hasValue, hasItems, makeLink) {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 900px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff;">
      <div style="padding: 45px 50px; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <h1 style="font-size: 42px; font-weight: 800; margin-bottom: 12px;">${data.name || 'Your Name'}</h1>
        <div style="font-size: 13px; color: #94a3b8; display: flex; gap: 14px;">
          ${hasValue(data.email) ? `<span>${data.email}</span>` : ''}
          ${hasValue(data.phone) ? `<span>${data.phone}</span>` : ''}
          ${hasValue(data.location) ? `<span>${data.location}</span>` : ''}
        </div>
        ${hasValue(data.linkedin) || hasValue(data.github) || hasValue(data.portfolio) ? `
          <div style="font-size: 13px; margin-top: 10px; display: flex; gap: 14px;">
            ${hasValue(data.linkedin) ? `<span>${makeLink(data.linkedin, 'LinkedIn')}</span>` : ''}
            ${hasValue(data.github) ? `<span>${makeLink(data.github, 'GitHub')}</span>` : ''}
            ${hasValue(data.portfolio) ? `<span>${makeLink(data.portfolio, 'Portfolio')}</span>` : ''}
          </div>
        ` : ''}
      </div>
      <div style="display: grid; grid-template-columns: 1fr 300px; gap: 0;">
        <div style="padding: 35px 40px; border-right: 1px solid rgba(255,255,255,0.08);">
          ${hasValue(data.summary) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #6366f1; margin-bottom: 12px;">About</h2>
              <p style="font-size: 14px; color: #94a3b8; line-height: 1.7;">${data.summary}</p>
            </div>
          ` : ''}
          ${hasItems(data.experience) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #6366f1; margin-bottom: 16px;">Experience</h2>
              ${data.experience.map(exp => `
                <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 18px; margin-bottom: 16px;">
                  <h3 style="font-size: 16px; font-weight: 700; color: #e2e8f0; margin-bottom: 4px;">${exp.title || 'Job Title'}</h3>
                  <div style="font-size: 13px; color: #6366f1; margin: 4px 0;">${exp.company || 'Company Name'}</div>
                  <div style="font-size: 12px; color: #475569; margin-bottom: 8px;">${exp.duration || 'Duration'}</div>
                  <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">${exp.description || 'Job description...'}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${hasItems(data.projects) ? `
            <div>
              <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #6366f1; margin-bottom: 16px;">Projects</h2>
              ${data.projects.map(proj => `
                <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 18px; margin-bottom: 16px;">
                  <h3 style="font-size: 16px; font-weight: 700; color: #e2e8f0; margin-bottom: 4px;">${proj.name || 'Project Name'}</h3>
                  <div style="font-size: 12px; color: #6366f1; margin-bottom: 6px;">${proj.tech || 'Technologies'}</div>
                  <p style="font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 4px;">${proj.description || 'Project description...'}</p>
                  ${hasValue(proj.github) || hasValue(proj.demo) ? `
                    <div style="font-size: 12px; margin-top: 8px;">
                      ${hasValue(proj.github) ? `${makeLink(proj.github, 'GitHub')}` : ''}
                      ${hasValue(proj.demo) ? ` • ${makeLink(proj.demo, 'Live Demo')}` : ''}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div style="padding: 35px 30px;">
          ${hasItems(data.skills) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #6366f1; margin-bottom: 12px;">Skills</h2>
              ${data.skills.map((s, i) => `
                <div style="margin-bottom: 14px;">
                  <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">${s}</div>
                  <div style="height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px;">
                    <div style="height: 4px; background: linear-gradient(90deg, #6366f1, #10b981); border-radius: 2px; width: ${65 + (i % 4) * 8}%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${hasItems(data.education) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #6366f1; margin-bottom: 12px;">Education</h2>
              ${data.education.map(edu => `
                <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 14px; margin-bottom: 12px;">
                  <h3 style="font-size: 13px; font-weight: 700; color: #e2e8f0; margin-bottom: 4px;">${edu.degree || 'Degree'}</h3>
                  <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">${edu.school || 'School/University'}</div>
                  <div style="font-size: 11px; color: #6366f1;">${edu.year || 'Year'}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${hasItems(data.achievements) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #6366f1; margin-bottom: 12px;">Achievements</h2>
              ${data.achievements.map(ach => `
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 12px; font-weight: 700; color: #e2e8f0;">🏆 ${ach.title || 'Achievement'}</div>
                  ${hasValue(ach.description) ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${ach.description}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${hasItems(data.hobbies) ? `
            <div>
              <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #6366f1; margin-bottom: 12px;">Hobbies</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${data.hobbies.map(h => `<span style="background: rgba(99,102,241,0.1); color: #6366f1; padding: 6px 12px; border-radius: 12px; font-size: 11px; font-weight: 600;">${h}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// Premium Executive Gold Template
function generatePremExec(data, hasValue, hasItems, makeLink) {
  return `
    <div style="font-family: 'Palatino Linotype', Georgia, serif; max-width: 900px; margin: 0 auto; background: #fdfbf7; color: #1a1a1a;">
      <div style="height: 4px; background: linear-gradient(90deg, #b8860b, #f0c040, #b8860b);"></div>
      <div style="background: #1a1a1a; color: #fff; padding: 40px 50px;">
        <h1 style="font-size: 36px; font-weight: 400; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px;">${data.name || 'Your Name'}</h1>
        <div style="font-size: 13px; color: #a0a0a0; display: flex; gap: 16px;">
          ${hasValue(data.email) ? `<span>${data.email}</span>` : ''}
          ${hasValue(data.phone) ? `<span>${data.phone}</span>` : ''}
          ${hasValue(data.location) ? `<span>${data.location}</span>` : ''}
        </div>
        ${hasValue(data.linkedin) || hasValue(data.github) || hasValue(data.portfolio) ? `
          <div style="font-size: 13px; margin-top: 10px; display: flex; gap: 16px;">
            ${hasValue(data.linkedin) ? `<span>${makeLink(data.linkedin, 'LinkedIn')}</span>` : ''}
            ${hasValue(data.github) ? `<span>${makeLink(data.github, 'GitHub')}</span>` : ''}
            ${hasValue(data.portfolio) ? `<span>${makeLink(data.portfolio, 'Portfolio')}</span>` : ''}
          </div>
        ` : ''}
      </div>
      <div style="padding: 35px 50px;">
        ${hasValue(data.summary) ? `
          <div style="border-left: 4px solid #b8860b; padding-left: 20px; margin-bottom: 30px;">
            <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #b8860b; margin-bottom: 8px;">Executive Summary</h2>
            <p style="font-size: 14px; color: #333; font-style: italic; line-height: 1.7;">${data.summary}</p>
          </div>
        ` : ''}
        ${hasItems(data.experience) ? `
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #b8860b; margin-bottom: 8px;">Career History</h2>
            <div style="height: 2px; background: linear-gradient(90deg, #b8860b, transparent); margin-bottom: 16px;"></div>
            ${data.experience.map(exp => `
              <div style="margin-bottom: 24px;">
                <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 4px;">${exp.title || 'Job Title'}</h3>
                <div style="font-size: 13px; color: #b8860b; font-weight: 600; margin-bottom: 4px;">${exp.company || 'Company Name'}</div>
                <div style="font-size: 12px; color: #666; margin-bottom: 8px;">${exp.duration || 'Duration'}</div>
                <p style="font-size: 13px; color: #333; line-height: 1.6;">${exp.description || 'Job description...'}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
          ${hasItems(data.education) ? `
            <div>
              <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #b8860b; margin-bottom: 8px;">Education</h2>
              <div style="height: 2px; background: linear-gradient(90deg, #b8860b, transparent); margin-bottom: 12px;"></div>
              ${data.education.map(edu => `
                <div style="margin-bottom: 16px;">
                  <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">${edu.degree || 'Degree'}</h3>
                  <div style="font-size: 13px; color: #555; margin-bottom: 2px;">${edu.school || 'School/University'}</div>
                  <div style="font-size: 12px; color: #b8860b;">${edu.year || 'Year'}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${hasItems(data.skills) ? `
            <div>
              <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #b8860b; margin-bottom: 8px;">Expertise</h2>
              <div style="height: 2px; background: linear-gradient(90deg, #b8860b, transparent); margin-bottom: 12px;"></div>
              ${data.skills.map(s => `<div style="margin: 8px 0; font-size: 13px;"><span style="color: #b8860b; font-size: 16px;">◆</span> ${s}</div>`).join('')}
            </div>
          ` : ''}
        </div>
        ${hasItems(data.projects) ? `
          <div style="margin-top: 30px;">
            <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #b8860b; margin-bottom: 8px;">Key Projects</h2>
            <div style="height: 2px; background: linear-gradient(90deg, #b8860b, transparent); margin-bottom: 16px;"></div>
            ${data.projects.map(proj => `
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">${proj.name || 'Project Name'}</h3>
                <div style="font-size: 12px; color: #b8860b; margin-bottom: 6px;">${proj.tech || 'Technologies'}</div>
                <p style="font-size: 13px; color: #333; line-height: 1.6; margin-bottom: 4px;">${proj.description || 'Project description...'}</p>
                ${hasValue(proj.github) || hasValue(proj.demo) ? `
                  <div style="font-size: 12px; margin-top: 6px;">
                    ${hasValue(proj.github) ? `${makeLink(proj.github, 'GitHub')}` : ''}
                    ${hasValue(proj.demo) ? ` • ${makeLink(proj.demo, 'Live Demo')}` : ''}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${hasItems(data.achievements) ? `
          <div style="margin-top: 30px;">
            <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #b8860b; margin-bottom: 8px;">Achievements</h2>
            <div style="height: 2px; background: linear-gradient(90deg, #b8860b, transparent); margin-bottom: 12px;"></div>
            ${data.achievements.map(ach => `
              <div style="margin-bottom: 14px;">
                <h3 style="font-size: 15px; font-weight: 700;">🏆 ${ach.title || 'Achievement'}</h3>
                ${hasValue(ach.description) ? `<p style="font-size: 13px; color: #555; margin-top: 4px;">${ach.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${hasItems(data.hobbies) ? `
          <div style="margin-top: 30px;">
            <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #b8860b; margin-bottom: 8px;">Interests</h2>
            <div style="height: 2px; background: linear-gradient(90deg, #b8860b, transparent); margin-bottom: 12px;"></div>
            <p style="font-size: 13px; color: #333;">${data.hobbies.join(' • ')}</p>
          </div>
        ` : ''}
      </div>
      <div style="height: 4px; background: linear-gradient(90deg, #b8860b, #f0c040, #b8860b);"></div>
    </div>
  `;
}

// Premium Neon Template
function generatePremNeon(data, hasValue, hasItems, makeLink) {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 900px; margin: 0 auto; background: #0a0a0f; color: #e2e8f0;">
      <div style="height: 2px; background: linear-gradient(90deg, transparent, #00d4ff, #bf00ff, transparent);"></div>
      <div style="padding: 45px 50px;">
        <h1 style="font-size: 44px; font-weight: 800; background: linear-gradient(90deg, #00d4ff, #bf00ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 12px;">${data.name || 'Your Name'}</h1>
        <div style="font-size: 13px; color: #64748b; display: flex; gap: 14px;">
          ${hasValue(data.email) ? `<span>${data.email}</span>` : ''}
          ${hasValue(data.phone) ? `<span>${data.phone}</span>` : ''}
          ${hasValue(data.location) ? `<span>${data.location}</span>` : ''}
        </div>
        ${hasValue(data.linkedin) || hasValue(data.github) || hasValue(data.portfolio) ? `
          <div style="font-size: 13px; margin-top: 10px; display: flex; gap: 14px;">
            ${hasValue(data.linkedin) ? `<span>${makeLink(data.linkedin, 'LinkedIn')}</span>` : ''}
            ${hasValue(data.github) ? `<span>${makeLink(data.github, 'GitHub')}</span>` : ''}
            ${hasValue(data.portfolio) ? `<span>${makeLink(data.portfolio, 'Portfolio')}</span>` : ''}
          </div>
        ` : ''}
      </div>
      <div style="display: grid; grid-template-columns: 1fr 280px; gap: 0; padding: 0 50px 45px;">
        <div style="padding-right: 35px; border-right: 1px solid rgba(0,212,255,0.15);">
          ${hasValue(data.summary) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #00d4ff; margin-bottom: 12px;">Profile</h2>
              <p style="font-size: 14px; color: #94a3b8; line-height: 1.7;">${data.summary}</p>
            </div>
          ` : ''}
          ${hasItems(data.experience) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #00d4ff; margin-bottom: 16px;">Experience</h2>
              ${data.experience.map(exp => `
                <div style="background: rgba(0,212,255,0.03); border: 1px solid rgba(0,212,255,0.1); border-radius: 12px; padding: 18px; margin-bottom: 16px;">
                  <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">${exp.title || 'Job Title'}</h3>
                  <div style="font-size: 13px; color: #00d4ff; margin: 4px 0;">${exp.company || 'Company Name'}</div>
                  <div style="font-size: 12px; color: #475569; margin-bottom: 8px;">${exp.duration || 'Duration'}</div>
                  <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">${exp.description || 'Job description...'}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${hasItems(data.projects) ? `
            <div>
              <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #00d4ff; margin-bottom: 16px;">Projects</h2>
              ${data.projects.map(proj => `
                <div style="background: rgba(0,212,255,0.03); border: 1px solid rgba(0,212,255,0.1); border-radius: 12px; padding: 18px; margin-bottom: 16px;">
                  <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">${proj.name || 'Project Name'}</h3>
                  <div style="font-size: 12px; color: #00d4ff; margin-bottom: 6px;">${proj.tech || 'Technologies'}</div>
                  <p style="font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 4px;">${proj.description || 'Project description...'}</p>
                  ${hasValue(proj.github) || hasValue(proj.demo) ? `
                    <div style="font-size: 12px; margin-top: 8px;">
                      ${hasValue(proj.github) ? `${makeLink(proj.github, 'GitHub')}` : ''}
                      ${hasValue(proj.demo) ? ` • ${makeLink(proj.demo, 'Live Demo')}` : ''}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div style="padding-left: 30px;">
          ${hasItems(data.skills) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #bf00ff; margin-bottom: 12px;">Skills</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${data.skills.map(s => `<span style="background: rgba(0,212,255,0.06); border: 1px solid rgba(0,212,255,0.2); color: #00d4ff; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 600;">${s}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          ${hasItems(data.education) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #bf00ff; margin-bottom: 12px;">Education</h2>
              ${data.education.map(edu => `
                <div style="background: rgba(191,0,255,0.04); border: 1px solid rgba(191,0,255,0.12); border-radius: 12px; padding: 14px; margin-bottom: 12px;">
                  <h3 style="font-size: 13px; font-weight: 700; margin-bottom: 4px;">${edu.degree || 'Degree'}</h3>
                  <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">${edu.school || 'School/University'}</div>
                  <div style="font-size: 11px; color: #bf00ff;">${edu.year || 'Year'}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${hasItems(data.achievements) ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #bf00ff; margin-bottom: 12px;">Achievements</h2>
              ${data.achievements.map(ach => `
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 12px; font-weight: 700;">🏆 ${ach.title || 'Achievement'}</div>
                  ${hasValue(ach.description) ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${ach.description}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${hasItems(data.hobbies) ? `
            <div>
              <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #bf00ff; margin-bottom: 12px;">Hobbies</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${data.hobbies.map(h => `<span style="background: rgba(191,0,255,0.06); border: 1px solid rgba(191,0,255,0.2); color: #bf00ff; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 600;">${h}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
      <div style="height: 2px; background: linear-gradient(90deg, transparent, #00d4ff, #bf00ff, transparent);"></div>
    </div>
  `;
}

// Premium Elegant Serif Template
function generatePremElegant(data, hasValue, hasItems, makeLink) {
  return `
    <div style="font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif; max-width: 900px; margin: 0 auto; background: #fffef9; color: #1c1c1c;">
      <div style="height: 5px; background: linear-gradient(90deg, #8b0000, #c41e3a, #8b0000);"></div>
      <div style="text-align: center; padding: 40px 50px; border-bottom: 3px double #c41e3a;">
        <h1 style="font-size: 38px; font-weight: 400; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px;">${data.name || 'Your Name'}</h1>
        <div style="width: 60px; height: 2px; background: #c41e3a; margin: 10px auto;"></div>
        <div style="font-size: 13px; color: #5a5a5a; letter-spacing: 0.5px; margin-top: 12px;">
          ${hasValue(data.email) ? `${data.email}` : ''}
          ${hasValue(data.phone) ? ` · ${data.phone}` : ''}
          ${hasValue(data.location) ? ` · ${data.location}` : ''}
        </div>
        ${hasValue(data.linkedin) || hasValue(data.github) || hasValue(data.portfolio) ? `
          <div style="font-size: 13px; margin-top: 8px;">
            ${hasValue(data.linkedin) ? `${makeLink(data.linkedin, 'LinkedIn')}` : ''}
            ${hasValue(data.github) ? ` · ${makeLink(data.github, 'GitHub')}` : ''}
            ${hasValue(data.portfolio) ? ` · ${makeLink(data.portfolio, 'Portfolio')}` : ''}
          </div>
        ` : ''}
      </div>
      <div style="padding: 35px 50px;">
        ${hasValue(data.summary) ? `
          <div style="border-left: 4px solid #8b0000; padding-left: 20px; margin-bottom: 30px;">
            <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #8b0000; margin-bottom: 8px;">Profile</h2>
            <p style="font-size: 14px; color: #3a3a3a; font-style: italic; text-align: justify; line-height: 1.7;">${data.summary}</p>
          </div>
        ` : ''}
        ${hasItems(data.experience) ? `
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #8b0000; margin-bottom: 8px;">Professional Experience</h2>
            <div style="height: 2px; background: linear-gradient(90deg, #c41e3a, transparent); margin-bottom: 16px;"></div>
            ${data.experience.map(exp => `
              <div style="margin-bottom: 24px;">
                <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 4px;">${exp.title || 'Job Title'}</h3>
                <div style="font-size: 13px; color: #8b0000; font-weight: 600; margin-bottom: 4px;">${exp.company || 'Company Name'}</div>
                <div style="font-size: 12px; color: #555; font-style: italic; margin-bottom: 8px;">${exp.duration || 'Duration'}</div>
                <p style="font-size: 13px; color: #333; line-height: 1.6;">${exp.description || 'Job description...'}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 30px;">
          ${hasItems(data.education) ? `
            <div>
              <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #8b0000; margin-bottom: 8px;">Education</h2>
              <div style="height: 2px; background: linear-gradient(90deg, #c41e3a, transparent); margin-bottom: 12px;"></div>
              ${data.education.map(edu => `
                <div style="margin-bottom: 16px;">
                  <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">${edu.degree || 'Degree'}</h3>
                  <div style="font-size: 13px; color: #555; margin-bottom: 2px;">${edu.school || 'School/University'}</div>
                  <div style="font-size: 12px; color: #8b0000; font-style: italic;">${edu.year || 'Year'}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${hasItems(data.skills) ? `
            <div>
              <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #8b0000; margin-bottom: 8px;">Competencies</h2>
              <div style="height: 2px; background: linear-gradient(90deg, #c41e3a, transparent); margin-bottom: 12px;"></div>
              ${data.skills.map(s => `<div style="margin: 8px 0; font-size: 13px;"><span style="color: #8b0000; font-size: 16px;">✦</span> ${s}</div>`).join('')}
            </div>
          ` : ''}
        </div>
        ${hasItems(data.projects) ? `
          <div style="margin-top: 30px;">
            <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #8b0000; margin-bottom: 8px;">Notable Projects</h2>
            <div style="height: 2px; background: linear-gradient(90deg, #c41e3a, transparent); margin-bottom: 16px;"></div>
            ${data.projects.map(proj => `
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">${proj.name || 'Project Name'}</h3>
                <div style="font-size: 12px; color: #8b0000; margin-bottom: 6px;">${proj.tech || 'Technologies'}</div>
                <p style="font-size: 13px; color: #333; line-height: 1.6; margin-bottom: 4px;">${proj.description || 'Project description...'}</p>
                ${hasValue(proj.github) || hasValue(proj.demo) ? `
                  <div style="font-size: 12px; margin-top: 6px;">
                    ${hasValue(proj.github) ? `${makeLink(proj.github, 'GitHub')}` : ''}
                    ${hasValue(proj.demo) ? ` · ${makeLink(proj.demo, 'Live Demo')}` : ''}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${hasItems(data.achievements) ? `
          <div style="margin-top: 30px;">
            <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #8b0000; margin-bottom: 8px;">Achievements</h2>
            <div style="height: 2px; background: linear-gradient(90deg, #c41e3a, transparent); margin-bottom: 12px;"></div>
            ${data.achievements.map(ach => `
              <div style="margin-bottom: 14px;">
                <h3 style="font-size: 15px; font-weight: 700;">🏆 ${ach.title || 'Achievement'}</h3>
                ${hasValue(ach.description) ? `<p style="font-size: 13px; color: #555; margin-top: 4px;">${ach.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${hasItems(data.hobbies) ? `
          <div style="margin-top: 30px;">
            <h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #8b0000; margin-bottom: 8px;">Personal Interests</h2>
            <div style="height: 2px; background: linear-gradient(90deg, #c41e3a, transparent); margin-bottom: 12px;"></div>
            <p style="font-size: 13px; color: #333;">${data.hobbies.join(' • ')}</p>
          </div>
        ` : ''}
      </div>
      <div style="height: 5px; background: linear-gradient(90deg, #8b0000, #c41e3a, #8b0000);"></div>
    </div>
  `;
}

// Premium Gradient Template
function generatePremGradient(data, hasValue, hasItems, makeLink) {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 900px; margin: 0 auto; background: #fff; color: #1f2937;">
      <div style="background: linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%); color: #fff; padding: 45px 50px 60px; position: relative;">
        <h1 style="font-size: 44px; font-weight: 800; margin-bottom: 12px; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">${data.name || 'Your Name'}</h1>
        <div style="font-size: 13px; display: flex; gap: 12px; flex-wrap: wrap;">
          ${hasValue(data.email) ? `<span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 16px;">${data.email}</span>` : ''}
          ${hasValue(data.phone) ? `<span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 16px;">${data.phone}</span>` : ''}
          ${hasValue(data.location) ? `<span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 16px;">${data.location}</span>` : ''}
        </div>
        ${hasValue(data.linkedin) || hasValue(data.github) || hasValue(data.portfolio) ? `
          <div style="font-size: 13px; margin-top: 10px; display: flex; gap: 12px; flex-wrap: wrap;">
            ${hasValue(data.linkedin) ? `<span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 16px;">${makeLink(data.linkedin, 'LinkedIn')}</span>` : ''}
            ${hasValue(data.github) ? `<span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 16px;">${makeLink(data.github, 'GitHub')}</span>` : ''}
            ${hasValue(data.portfolio) ? `<span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 16px;">${makeLink(data.portfolio, 'Portfolio')}</span>` : ''}
          </div>
        ` : ''}
        <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 30px; background: #fff; clip-path: ellipse(55% 100% at 50% 100%);"></div>
      </div>
      <div style="padding: 20px 50px 40px;">
        ${hasValue(data.summary) ? `
          <p style="text-align: center; color: #4b5563; font-style: italic; margin-bottom: 30px; font-size: 14px; line-height: 1.7;">${data.summary}</p>
        ` : ''}
        ${hasItems(data.skills) ? `
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 30px;">
            ${data.skills.map((s, i) => {
              const colors = [
                ['#fff7ed', '#f97316'],
                ['#fdf2f8', '#ec4899'],
                ['#f5f3ff', '#8b5cf6']
              ];
              const [bg, border] = colors[i % 3];
              return `<div style="border: 2px solid ${border}; border-radius: 12px; padding: 12px 16px; text-align: center; font-size: 13px; font-weight: 600; background: ${bg}; color: ${border};">${s}</div>`;
            }).join('')}
          </div>
        ` : ''}
        ${hasItems(data.experience) ? `
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; background: linear-gradient(90deg, #f97316, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 16px;">Experience</h2>
            ${data.experience.map(exp => `
              <div style="border-left: 4px solid #f97316; padding-left: 20px; margin-bottom: 24px;">
                <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 4px;">${exp.title || 'Job Title'}</h3>
                <div style="font-size: 13px; background: linear-gradient(90deg, #f97316, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 600; margin-bottom: 4px;">${exp.company || 'Company Name'}</div>
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${exp.duration || 'Duration'}</div>
                <p style="font-size: 13px; color: #374151; line-height: 1.6;">${exp.description || 'Job description...'}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
          ${hasItems(data.education) ? `
            <div>
              <h2 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; background: linear-gradient(90deg, #ec4899, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 12px;">Education</h2>
              ${data.education.map(edu => `
                <div style="border-left: 4px solid #ec4899; padding-left: 20px; margin-bottom: 16px;">
                  <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">${edu.degree || 'Degree'}</h3>
                  <div style="font-size: 13px; color: #555; margin-bottom: 2px;">${edu.school || 'School/University'}</div>
                  <div style="font-size: 12px; color: #ec4899; font-weight: 600;">${edu.year || 'Year'}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${hasItems(data.projects) ? `
            <div>
              <h2 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; background: linear-gradient(90deg, #8b5cf6, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 12px;">Projects</h2>
              ${data.projects.map(proj => `
                <div style="border-left: 4px solid #8b5cf6; padding-left: 20px; margin-bottom: 16px;">
                  <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">${proj.name || 'Project Name'}</h3>
                  <div style="font-size: 12px; color: #8b5cf6; margin-bottom: 6px;">${proj.tech || 'Technologies'}</div>
                  <p style="font-size: 13px; color: #4b5563; line-height: 1.6; margin-bottom: 4px;">${proj.description || 'Project description...'}</p>
                  ${hasValue(proj.github) || hasValue(proj.demo) ? `
                    <div style="font-size: 12px; margin-top: 6px;">
                      ${hasValue(proj.github) ? `${makeLink(proj.github, 'GitHub')}` : ''}
                      ${hasValue(proj.demo) ? ` · ${makeLink(proj.demo, 'Live Demo')}` : ''}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        ${hasItems(data.achievements) ? `
          <div style="margin-top: 30px;">
            <h2 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; background: linear-gradient(90deg, #f97316, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 12px;">Achievements</h2>
            ${data.achievements.map(ach => `
              <div style="margin-bottom: 14px;">
                <h3 style="font-size: 15px; font-weight: 700;">🏆 ${ach.title || 'Achievement'}</h3>
                ${hasValue(ach.description) ? `<p style="font-size: 13px; color: #555; margin-top: 4px;">${ach.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${hasItems(data.hobbies) ? `
          <div style="margin-top: 30px;">
            <h2 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; background: linear-gradient(90deg, #8b5cf6, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 12px;">Hobbies</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              ${data.hobbies.map((h, i) => {
                const colors = [
                  ['#fff7ed', '#f97316'],
                  ['#fdf2f8', '#ec4899'],
                  ['#f5f3ff', '#8b5cf6']
                ];
                const [bg, color] = colors[i % 3];
                return `<span style="background: ${bg}; color: ${color}; padding: 8px 16px; border-radius: 16px; font-size: 12px; font-weight: 600;">${h}</span>`;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
