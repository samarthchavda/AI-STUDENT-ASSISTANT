import { Link } from 'react-router-dom'
import { Brain, Twitter, Github, Linkedin, Youtube } from 'lucide-react'

const company = [
  { label: 'About', to: '/about' },
  { label: 'Blog', to: '/blog' },
  { label: 'Careers', to: '/careers' },
  { label: 'Affiliates', to: '/affiliates' },
]

const resources = [
  { label: 'Quick Start', to: '/quick-start' },
  { label: 'Documentation', to: '/docs' },
  { label: 'API Reference', to: '/api-reference' },
  { label: 'Sample Questions', to: '/samples' },
  { label: 'Code Challenges', to: '/challenges' },
  { label: 'Study Guides', to: '/guides' },
  { label: 'Workspaces', to: '/workspaces' },
]

const plans = [
  { label: 'Free Plan', to: '/pricing' },
  { label: 'Student Pro', to: '/pricing' },
  { label: 'Business Solutions', to: '/pricing' },
]

const community = [
  { label: 'Forums', to: '/forums' },
  { label: 'Discord', to: '/discord' },
  { label: 'Chapters', to: '/chapters' },
  { label: 'Events', to: '/events' },
]

const support = [
  { label: 'Help Center', to: '/help' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact Us', to: '/contact' },
]

const subjects = [
  'Data Structures',
  'Algorithms',
  'System Design',
  'Operating Systems',
  'DBMS',
  'Computer Networks',
  'Cloud Computing',
  'OOP Concepts',
  'Web Development',
  'Machine Learning',
  'Math & Quantitative',
  'Aptitude',
  'Verbal Reasoning',
  'Logical Reasoning',
]

const languages = [
  'C++',
  'Java',
  'Python',
  'JavaScript',
  'Go',
  'TypeScript',
  'Kotlin',
  'PHP',
  'Ruby',
  'C',
  'C#',
  'SQL',
  'Bash',
  'Swift',
]

const placementPrep = [
  { label: 'Mock Interviews', to: '/chat' },
  { label: 'Resume ATS Review', to: '/career' },
  { label: 'Company Questions', to: '/company-prep' },
  { label: 'Aptitude Tests', to: '/exam-prep' },
  { label: 'HR Preparation', to: '/chat' },
  { label: 'DSA & Coding', to: '/coding-help' },
  { label: 'Career Guidance', to: '/services' },
  { label: 'Full Practice Catalog', to: '/services' },
]

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
]

function FooterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</p>
      {children}
    </div>
  )
}

function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <li>
      <Link
        to={to}
        className="text-sm text-slate-400 transition-colors hover:text-white"
      >
        {label}
      </Link>
    </li>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      {/* Top grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">

          {/* Brand + Company + Socials */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 p-2 text-white shadow-lg">
                <Brain className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-white">CodeCampus AI</span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              AI-powered placement prep for ambitious engineers. Master DSA, ace interviews, and get placed.
            </p>

            <FooterSection title="Company">
              <ul className="mt-0 space-y-1.5">
                {company.map(({ label, to }) => (
                  <FooterLink key={label} to={to} label={label} />
                ))}
              </ul>
            </FooterSection>

            <div className="mt-4 flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <FooterSection title="Resources">
              <ul className="space-y-1.5">
                {resources.map(({ label, to }) => (
                  <FooterLink key={label} to={to} label={label} />
                ))}
              </ul>
            </FooterSection>
          </div>

          {/* Plans + Community + Support */}
          <div className="space-y-6">
            <FooterSection title="Plans">
              <ul className="space-y-1.5">
                {plans.map(({ label, to }) => (
                  <FooterLink key={label} to={to} label={label} />
                ))}
              </ul>
            </FooterSection>

            <FooterSection title="Community">
              <ul className="space-y-1.5">
                {community.map(({ label, to }) => (
                  <FooterLink key={label} to={to} label={label} />
                ))}
              </ul>
            </FooterSection>

            <FooterSection title="Support">
              <ul className="space-y-1.5">
                {support.map(({ label, to }) => (
                  <FooterLink key={label} to={to} label={label} />
                ))}
              </ul>
            </FooterSection>
          </div>

          {/* Subjects */}
          <div>
            <FooterSection title="Subjects">
              <ul className="space-y-1.5">
                {subjects.map((subject) => (
                  <li key={subject}>
                    <Link
                      to="/exam-prep"
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {subject}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterSection>
          </div>

          {/* Languages */}
          <div>
            <FooterSection title="Languages">
              <ul className="space-y-1.5">
                {languages.map((lang) => (
                  <li key={lang}>
                    <Link
                      to="/coding-help"
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {lang}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterSection>
          </div>

          {/* Placement Prep */}
          <div>
            <FooterSection title="Placement Prep">
              <ul className="space-y-1.5">
                {placementPrep.map(({ label, to }) => (
                  <FooterLink key={label} to={to} label={label} />
                ))}
              </ul>
            </FooterSection>
          </div>

        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800" />

      {/* Bottom bar */}
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500">
            <Link to="/privacy" className="transition-colors hover:text-slate-300">Privacy Policy</Link>
            <Link to="/cookies" className="transition-colors hover:text-slate-300">Cookie Policy</Link>
            <Link to="/terms" className="transition-colors hover:text-slate-300">Terms of Service</Link>
          </div>
          <p className="text-xs text-slate-500">
            Made with{' '}
            <span className="text-red-500">♥</span>
            {' '}by Team CodeCampus AI © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  )
}
