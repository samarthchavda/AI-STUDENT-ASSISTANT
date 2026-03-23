import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Briefcase, GraduationCap, Settings, Plus, Trash2, Download, Layout, Mail, Phone, MapPin, ChevronRight, Eye, Type, ArrowLeft } from 'lucide-react';

// --- Types ---
interface Experience {
  id: number;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: number;
  school: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
}

interface ResumeData {
  personal: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    summary: string;
  };
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: { id: number; name: string; year: string }[];
}

interface TemplateProps {
  data: ResumeData;
  themeColor: string;
}

// --- Data Constants ---
const INITIAL_DATA: ResumeData = {
  personal: {
    fullName: "Alex Rivera",
    jobTitle: "Senior Product Designer",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 000-0000",
    address: "San Francisco, CA",
    website: "www.arivera.design",
    summary: "Strategic Product Designer with 8+ years of experience in building user-centric digital products. Proven track record of leading cross-functional teams to deliver high-impact solutions for FinTech and SaaS industries."
  },
  experience: [
    {
      id: 1,
      company: "TechNova Solutions",
      position: "Senior Designer",
      location: "San Francisco, CA",
      startDate: "2021-01",
      endDate: "Present",
      description: "Led the redesign of the core banking platform, resulting in a 40% increase in user engagement. Managed a team of 5 junior designers."
    },
    {
      id: 2,
      company: "Creative Pulse",
      position: "UI/UX Designer",
      location: "Austin, TX",
      startDate: "2018-06",
      endDate: "2020-12",
      description: "Collaborated with product managers to define roadmaps. Developed a design system that reduced production time by 25%."
    }
  ],
  education: [
    {
      id: 1,
      school: "Design Institute of Arts",
      degree: "BFA in Interaction Design",
      location: "New York, NY",
      startDate: "2014",
      endDate: "2018"
    }
  ],
  skills: ["Product Strategy", "UI/UX Design", "Figma", "React", "User Research", "Agile Methodologies", "Prototyping"],
  certifications: [{ id: 1, name: "Google UX Design Professional Certificate", year: "2020" }]
};

const TEMPLATES = [
  { id: 'modern', name: 'Modern Professional', color: '#2563eb' },
  { id: 'executive', name: 'Executive Suite', color: '#1e293b' },
  { id: 'creative', name: 'Creative Edge', color: '#db2777' },
  { id: 'minimal', name: 'Minimalist Clean', color: '#000000' }
];
