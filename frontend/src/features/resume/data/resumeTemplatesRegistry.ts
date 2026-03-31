// Resume Templates Registry - Central Template Management

import { ResumeTemplate, TemplateRegistry, TemplateFilter, TemplateCategory } from './resumeTemplateTypes';

// Import completed templates only
import { basicCleanTemplate } from '../templates/basic-clean';
import { modernProfessionalTemplate } from '../templates/modern-professional';
import { minimalAtsTemplate } from '../templates/minimal-ats';
import { softwareDeveloperProTemplate } from '../templates/software-developer-pro';
import { fresherPlacementProTemplate } from '../templates/fresher-placement-pro';
import { executiveAtsProTemplate } from '../templates/executive-ats-pro';
import { creativeEdgeProTemplate } from '../templates/creative-edge-pro';
import { darkTechSidebarProTemplate } from '../templates/dark-tech-sidebar-pro';

// ============================================
// Template Registry
// ============================================

export const RESUME_TEMPLATES_REGISTRY: TemplateRegistry = {
  'basic-clean': basicCleanTemplate,
  'modern-professional': modernProfessionalTemplate,
  'minimal-ats': minimalAtsTemplate,
  'software-developer-pro': softwareDeveloperProTemplate,
  'fresher-placement-pro': fresherPlacementProTemplate,
  'executive-ats-pro': executiveAtsProTemplate,
  'creative-edge-pro': creativeEdgeProTemplate,
  'dark-tech-sidebar-pro': darkTechSidebarProTemplate
};

// ============================================
// Registry Helper Functions
// ============================================

/**
 * Get all templates
 */
export const getAllTemplates = (): ResumeTemplate[] => {
  return Object.values(RESUME_TEMPLATES_REGISTRY);
};

/**
 * Get template by ID
 */
export const getTemplateById = (id: string): ResumeTemplate | undefined => {
  return RESUME_TEMPLATES_REGISTRY[id];
};

/**
 * Get all template IDs
 */
export const getAllTemplateIds = (): string[] => {
  return Object.keys(RESUME_TEMPLATES_REGISTRY);
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: TemplateCategory | 'all'): ResumeTemplate[] => {
  if (category === 'all') {
    return getAllTemplates();
  }
  return getAllTemplates().filter(template => template.metadata.category === category);
};

/**
 * Get free templates
 */
export const getFreeTemplates = (): ResumeTemplate[] => {
  return getAllTemplates().filter(template => !template.metadata.isPremium);
};

/**
 * Get premium templates
 */
export const getPremiumTemplates = (): ResumeTemplate[] => {
  return getAllTemplates().filter(template => template.metadata.isPremium);
};

/**
 * Get ATS-friendly templates
 */
export const getAtsFriendlyTemplates = (): ResumeTemplate[] => {
  return getAllTemplates().filter(template => template.metadata.atsFriendly);
};

/**
 * Filter templates
 */
export const filterTemplates = (filter: TemplateFilter): ResumeTemplate[] => {
  let templates = getAllTemplates();

  if (filter.category) {
    templates = templates.filter(t => t.metadata.category === filter.category);
  }

  if (filter.isPremium !== undefined) {
    templates = templates.filter(t => t.metadata.isPremium === filter.isPremium);
  }

  if (filter.atsFriendly !== undefined) {
    templates = templates.filter(t => t.metadata.atsFriendly === filter.atsFriendly);
  }

  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    templates = templates.filter(t => 
      t.metadata.name.toLowerCase().includes(searchLower) ||
      t.metadata.description.toLowerCase().includes(searchLower) ||
      t.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  return templates;
};

/**
 * Search templates by name or tags
 */
export const searchTemplates = (query: string): ResumeTemplate[] => {
  const queryLower = query.toLowerCase();
  return getAllTemplates().filter(template => 
    template.metadata.name.toLowerCase().includes(queryLower) ||
    template.metadata.description.toLowerCase().includes(queryLower) ||
    template.metadata.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
    template.metadata.bestFor.some(use => use.toLowerCase().includes(queryLower))
  );
};

/**
 * Get template count
 */
export const getTemplateCount = (): number => {
  return getAllTemplates().length;
};

/**
 * Get template count by category
 */
export const getTemplateCountByCategory = (category: TemplateCategory): number => {
  return getTemplatesByCategory(category).length;
};

/**
 * Check if template exists
 */
export const templateExists = (id: string): boolean => {
  return id in RESUME_TEMPLATES_REGISTRY;
};

/**
 * Get template metadata only
 */
export const getTemplateMetadata = (id: string) => {
  const template = getTemplateById(id);
  return template?.metadata;
};

/**
 * Get all categories with template counts
 */
export const getCategoriesWithCounts = () => {
  const categories: TemplateCategory[] = ['modern', 'classic', 'creative', 'minimal', 'technical', 'academic', 'executive'];
  return categories.map(category => ({
    category,
    count: getTemplateCountByCategory(category),
    templates: getTemplatesByCategory(category).map(t => t.metadata)
  }));
};

/**
 * Get template recommendations based on user profile
 */
export const getRecommendedTemplates = (userProfile: {
  isStudent?: boolean;
  isFresher?: boolean;
  yearsOfExperience?: number;
  industry?: string;
}): ResumeTemplate[] => {
  const templates = getAllTemplates();
  
  if (userProfile.isStudent) {
    return templates.filter(t => 
      t.metadata.tags.includes('Student') || 
      t.metadata.tags.includes('Academic')
    );
  }
  
  if (userProfile.isFresher || (userProfile.yearsOfExperience && userProfile.yearsOfExperience < 2)) {
    return templates.filter(t => 
      t.metadata.tags.includes('Fresher') || 
      t.metadata.tags.includes('Entry-Level')
    );
  }
  
  if (userProfile.yearsOfExperience && userProfile.yearsOfExperience > 10) {
    return templates.filter(t => 
      t.metadata.tags.includes('Executive') || 
      t.metadata.tags.includes('Leadership')
    );
  }
  
  return templates;
};

// ============================================
// Template Statistics
// ============================================

export const getTemplateStats = () => {
  const all = getAllTemplates();
  return {
    total: all.length,
    free: getFreeTemplates().length,
    premium: getPremiumTemplates().length,
    atsFriendly: getAtsFriendlyTemplates().length,
    byCategory: getCategoriesWithCounts()
  };
};
