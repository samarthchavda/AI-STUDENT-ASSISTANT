// Resume Template System - Core Types

// ============================================
// Resume Data Model (Shared by all templates)
// ============================================

export interface ResumeIdentity {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights?: string[];
}

export interface ResumeEducation {
  id: string;
  school: string;
  degree: string;
  field?: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
}

export interface ResumeProject {
  id: string;
  name: string;
  description: string;
  technologies?: string[];
  link?: string;
  github?: string;
  startDate?: string;
  endDate?: string;
}

export interface ResumeSkill {
  category: string;
  items: string[];
}

export interface ResumeLanguage {
  id: string;
  name: string;
  proficiency: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic';
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface ResumeAward {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface ResumePublication {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url?: string;
  description?: string;
}

export interface ResumeVolunteer {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

// Complete Resume Data Structure
export interface ResumeData {
  identity: ResumeIdentity;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  skills: ResumeSkill[];
  languages: ResumeLanguage[];
  certifications: ResumeCertification[];
  awards: ResumeAward[];
  publications: ResumePublication[];
  volunteer: ResumeVolunteer[];
}

// ============================================
// Template Metadata Types
// ============================================

export type TemplateCategory = 
  | 'modern' 
  | 'classic' 
  | 'creative' 
  | 'minimal' 
  | 'technical'
  | 'academic'
  | 'executive';

export type TemplateLayout = 
  | 'single-column'
  | 'two-column-left-sidebar'
  | 'two-column-right-sidebar'
  | 'header-content'
  | 'compact-grid';

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  layout: TemplateLayout;
  isPremium: boolean;
  atsFriendly: boolean;
  tags: string[];
  accentColor: string;
  features: string[];
  bestFor: string[];
  version: string;
}

// ============================================
// Template Component Props
// ============================================

export interface TemplateProps {
  data: ResumeData;
  themeColor?: string;
}

// ============================================
// Template Component Types
// ============================================

export type PreviewComponent = React.FC<TemplateProps>;
export type ScreenComponent = React.FC<TemplateProps>;
export type PrintComponent = React.FC<TemplateProps>;

// ============================================
// Complete Template Definition
// ============================================

export interface ResumeTemplate {
  metadata: TemplateMetadata;
  Preview: PreviewComponent;
  Screen: ScreenComponent;
  Print: PrintComponent;
}

// ============================================
// Template Registry Types
// ============================================

export interface TemplateRegistry {
  [templateId: string]: ResumeTemplate;
}

export interface TemplateFilter {
  category?: TemplateCategory;
  isPremium?: boolean;
  atsFriendly?: boolean;
  search?: string;
}

// ============================================
// Sample/Default Data
// ============================================

export const DEFAULT_RESUME_DATA: ResumeData = {
  identity: {
    fullName: "Alex Rivera",
    jobTitle: "Senior Software Engineer",
    email: "alex.rivera@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "alexrivera.dev",
    github: "github.com/alexrivera",
    linkedin: "linkedin.com/in/alexrivera",
    portfolio: "alexrivera.dev/portfolio"
  },
  summary: "Results-driven software engineer with 8+ years of experience building scalable web applications and leading cross-functional teams. Expert in React, Node.js, and cloud infrastructure. Passionate about clean code, system design, and mentoring junior developers.",
  experience: [
    {
      id: "exp1",
      company: "TechCorp Inc",
      position: "Senior Software Engineer",
      location: "San Francisco, CA",
      startDate: "2020-03",
      endDate: "Present",
      description: "Lead development of microservices architecture serving 2M+ users. Improved API response times by 60% through caching strategies and database optimization.",
      highlights: [
        "Architected scalable microservices handling 10K+ requests/second",
        "Reduced deployment time by 75% through CI/CD automation",
        "Mentored team of 5 junior engineers"
      ]
    },
    {
      id: "exp2",
      company: "StartupXYZ",
      position: "Full Stack Developer",
      location: "Remote",
      startDate: "2017-06",
      endDate: "2020-02",
      description: "Built real-time collaboration features using WebSockets and React. Implemented authentication system supporting OAuth and JWT.",
      highlights: [
        "Developed real-time chat system with 99.9% uptime",
        "Implemented A/B testing framework increasing conversions by 25%"
      ]
    }
  ],
  education: [
    {
      id: "edu1",
      school: "University of California, Berkeley",
      degree: "Master of Science",
      field: "Computer Science",
      location: "Berkeley, CA",
      startDate: "2015",
      endDate: "2017",
      gpa: "3.8",
      honors: "Dean's List"
    },
    {
      id: "edu2",
      school: "State University",
      degree: "Bachelor of Science",
      field: "Software Engineering",
      location: "Los Angeles, CA",
      startDate: "2011",
      endDate: "2015",
      gpa: "3.6"
    }
  ],
  projects: [
    {
      id: "proj1",
      name: "OpenSource Auth Library",
      description: "Lightweight authentication library for React applications with 2K+ GitHub stars",
      technologies: ["React", "TypeScript", "OAuth", "JWT"],
      link: "auth-lib.dev",
      github: "github.com/alexrivera/auth-lib",
      startDate: "2021",
      endDate: "Present"
    },
    {
      id: "proj2",
      name: "DevTools Dashboard",
      description: "Developer productivity dashboard with real-time metrics and analytics",
      technologies: ["Next.js", "PostgreSQL", "Redis", "Docker"],
      github: "github.com/alexrivera/devtools"
    }
  ],
  skills: [
    {
      category: "Languages",
      items: ["JavaScript", "TypeScript", "Python", "Go", "SQL"]
    },
    {
      category: "Frontend",
      items: ["React", "Next.js", "Vue.js", "Tailwind CSS", "Redux"]
    },
    {
      category: "Backend",
      items: ["Node.js", "Express", "Django", "PostgreSQL", "MongoDB"]
    },
    {
      category: "DevOps",
      items: ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform"]
    }
  ],
  languages: [
    { id: "lang1", name: "English", proficiency: "Native" },
    { id: "lang2", name: "Spanish", proficiency: "Professional" }
  ],
  certifications: [
    {
      id: "cert1",
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2022-06",
      credentialId: "AWS-12345",
      url: "aws.amazon.com/verification"
    }
  ],
  awards: [
    {
      id: "award1",
      title: "Employee of the Year",
      issuer: "TechCorp Inc",
      date: "2022",
      description: "Recognized for outstanding contributions to platform architecture"
    }
  ],
  publications: [],
  volunteer: []
};
