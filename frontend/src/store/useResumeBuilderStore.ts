import { create } from 'zustand'

export type ResumeStep = 1 | 2 | 3 | 4 | 5 | 6 | 7

interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  desiredRole: string
  summary: string
}

interface EducationInfo {
  degree: string
  institution: string
  graduationYear: string
  details: string
}

interface ExperienceInfo {
  title: string
  company: string
  duration: string
  description: string
}

interface ProjectInfo {
  title: string
  techStack: string
  description: string
}

interface CredentialInfo {
  title: string
  organization: string
  year: string
}

interface SkillsInfo {
  technical: string
  tools: string
  soft: string
}

interface ResumeBuilderState {
  step: ResumeStep
  personal: PersonalInfo
  education: EducationInfo[]
  experience: ExperienceInfo[]
  projects: ProjectInfo[]
  certificates: CredentialInfo[]
  achievements: CredentialInfo[]
  hobbies: string
  languages: string
  skills: SkillsInfo

  setStep: (step: ResumeStep) => void
  nextStep: () => void
  prevStep: () => void

  updatePersonal: (patch: Partial<PersonalInfo>) => void

  addEducation: () => void
  removeEducation: (index: number) => void
  updateEducation: (index: number, patch: Partial<EducationInfo>) => void

  addExperience: () => void
  removeExperience: (index: number) => void
  updateExperience: (index: number, patch: Partial<ExperienceInfo>) => void

  addProject: () => void
  removeProject: (index: number) => void
  updateProject: (index: number, patch: Partial<ProjectInfo>) => void

  addCertificate: () => void
  removeCertificate: (index: number) => void
  updateCertificate: (index: number, patch: Partial<CredentialInfo>) => void

  addAchievement: () => void
  removeAchievement: (index: number) => void
  updateAchievement: (index: number, patch: Partial<CredentialInfo>) => void

  setHobbies: (value: string) => void
  setLanguages: (value: string) => void
  updateSkills: (patch: Partial<SkillsInfo>) => void

  resetBuilder: () => void
}

const emptyEducation = (): EducationInfo => ({
  degree: '',
  institution: '',
  graduationYear: '',
  details: '',
})

const emptyExperience = (): ExperienceInfo => ({
  title: '',
  company: '',
  duration: '',
  description: '',
})

const emptyProject = (): ProjectInfo => ({
  title: '',
  techStack: '',
  description: '',
})

const emptyCredential = (): CredentialInfo => ({
  title: '',
  organization: '',
  year: '',
})

const initialState = {
  step: 1 as ResumeStep,
  personal: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    desiredRole: '',
    summary: '',
  },
  education: [emptyEducation()],
  experience: [emptyExperience()],
  projects: [emptyProject()],
  certificates: [emptyCredential()],
  achievements: [emptyCredential()],
  hobbies: '',
  languages: '',
  skills: {
    technical: '',
    tools: '',
    soft: '',
  },
}

export const useResumeBuilderStore = create<ResumeBuilderState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  nextStep: () => {
    const current = get().step
    if (current < 7) set({ step: (current + 1) as ResumeStep })
  },

  prevStep: () => {
    const current = get().step
    if (current > 1) set({ step: (current - 1) as ResumeStep })
  },

  updatePersonal: (patch) => set((state) => ({ personal: { ...state.personal, ...patch } })),

  addEducation: () => set((state) => ({ education: [...state.education, emptyEducation()] })),
  removeEducation: (index) =>
    set((state) => ({
      education: state.education.length > 1
        ? state.education.filter((_, idx) => idx !== index)
        : state.education,
    })),
  updateEducation: (index, patch) =>
    set((state) => ({
      education: state.education.map((item, idx) => (idx === index ? { ...item, ...patch } : item)),
    })),

  addExperience: () => set((state) => ({ experience: [...state.experience, emptyExperience()] })),
  removeExperience: (index) =>
    set((state) => ({
      experience: state.experience.length > 1
        ? state.experience.filter((_, idx) => idx !== index)
        : state.experience,
    })),
  updateExperience: (index, patch) =>
    set((state) => ({
      experience: state.experience.map((item, idx) => (idx === index ? { ...item, ...patch } : item)),
    })),

  addProject: () => set((state) => ({ projects: [...state.projects, emptyProject()] })),
  removeProject: (index) =>
    set((state) => ({
      projects: state.projects.length > 1
        ? state.projects.filter((_, idx) => idx !== index)
        : state.projects,
    })),
  updateProject: (index, patch) =>
    set((state) => ({
      projects: state.projects.map((item, idx) => (idx === index ? { ...item, ...patch } : item)),
    })),

  addCertificate: () => set((state) => ({ certificates: [...state.certificates, emptyCredential()] })),
  removeCertificate: (index) =>
    set((state) => ({
      certificates: state.certificates.length > 1
        ? state.certificates.filter((_, idx) => idx !== index)
        : state.certificates,
    })),
  updateCertificate: (index, patch) =>
    set((state) => ({
      certificates: state.certificates.map((item, idx) => (idx === index ? { ...item, ...patch } : item)),
    })),

  addAchievement: () => set((state) => ({ achievements: [...state.achievements, emptyCredential()] })),
  removeAchievement: (index) =>
    set((state) => ({
      achievements: state.achievements.length > 1
        ? state.achievements.filter((_, idx) => idx !== index)
        : state.achievements,
    })),
  updateAchievement: (index, patch) =>
    set((state) => ({
      achievements: state.achievements.map((item, idx) => (idx === index ? { ...item, ...patch } : item)),
    })),

  setHobbies: (value) => set({ hobbies: value }),
  setLanguages: (value) => set({ languages: value }),

  updateSkills: (patch) => set((state) => ({ skills: { ...state.skills, ...patch } })),

  resetBuilder: () => set({ ...initialState }),
}))
