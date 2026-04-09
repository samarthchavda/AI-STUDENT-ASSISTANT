/**
 * Aptitude Practice Categories and Subcategories Configuration
 * Updated from database - Total: 5830 questions
 */

export interface SubcategoryConfig {
  value: string
  label: string
  count?: number
}

export interface CategoryConfig {
  value: string
  label: string
  subcategories: SubcategoryConfig[]
  icon?: string
  color?: string
}

export const aptitudeCategories: CategoryConfig[] = [
  {
    value: 'Aptitude',
    label: 'Aptitude',
    icon: '🧮',
    color: 'blue',
    subcategories: [
      { value: 'percentage', label: 'Percentage', count: 524 },
      { value: 'profit-and-loss', label: 'Profit and Loss', count: 482 },
      { value: 'time-speed-distance', label: 'Time, Speed & Distance', count: 479 },
      { value: 'time-and-work', label: 'Time and Work', count: 265 },
      { value: 'average', label: 'Average', count: 52 },
      { value: 'ratio-and-proportion', label: 'Ratio and Proportion', count: 30 },
    ]
  },
  {
    value: 'Database',
    label: 'Database',
    icon: '🗄️',
    color: 'green',
    subcategories: [
      { value: 'sql', label: 'SQL', count: 1046 },
    ]
  },
  {
    value: 'Digital Electronics',
    label: 'Digital Electronics',
    icon: '⚡',
    color: 'yellow',
    subcategories: [
      { value: 'digital-electronics', label: 'Digital Electronics', count: 673 },
    ]
  },
  {
    value: 'C Programming',
    label: 'C Programming',
    icon: '💻',
    color: 'purple',
    subcategories: [
      { value: 'c-programming', label: 'C Programming', count: 570 },
      { value: 'c-basics', label: 'C Basics', count: 50 },
      { value: 'arrays-and-strings', label: 'Arrays and Strings', count: 49 },
    ]
  },
  {
    value: 'General Knowledge',
    label: 'General Knowledge',
    icon: '🌍',
    color: 'indigo',
    subcategories: [
      { value: 'general-knowledge', label: 'General Knowledge', count: 515 },
      { value: 'world-geography', label: 'World Geography', count: 149 },
    ]
  },
  {
    value: 'Logical Reasoning',
    label: 'Logical Reasoning',
    icon: '🧩',
    color: 'pink',
    subcategories: [
      { value: 'logical-reasoning', label: 'Logical Reasoning', count: 289 },
      { value: 'verbal-reasoning', label: 'Verbal Reasoning', count: 177 },
      { value: 'puzzles', label: 'Puzzles', count: 51 },
      { value: 'logical-problems', label: 'Logical Problems', count: 16 },
    ]
  },
  {
    value: 'Networking',
    label: 'Networking',
    icon: '🌐',
    color: 'cyan',
    subcategories: [
      { value: 'networking', label: 'Networking', count: 137 },
      { value: 'networking-basics', label: 'Networking Basics', count: 99 },
    ]
  },
  {
    value: 'Java Programming',
    label: 'Java Programming',
    icon: '☕',
    color: 'orange',
    subcategories: [
      { value: 'java-basics', label: 'Java Basics', count: 97 },
      { value: 'java-programming', label: 'Java Programming', count: 79 },
    ]
  },
  {
    value: 'Verbal Ability',
    label: 'Verbal Ability',
    icon: '📝',
    color: 'red',
    subcategories: [
      { value: 'synonyms', label: 'Synonyms', count: 1 },
    ]
  },
]

// Helper function to get all subcategories for a category
export function getSubcategoriesForCategory(category: string): SubcategoryConfig[] {
  const cat = aptitudeCategories.find(c => c.value === category)
  return cat?.subcategories || []
}

// Helper function to get category label
export function getCategoryLabel(category: string): string {
  const cat = aptitudeCategories.find(c => c.value === category)
  return cat?.label || category
}

// Helper function to get subcategory label
export function getSubcategoryLabel(category: string, subcategory: string): string {
  const cat = aptitudeCategories.find(c => c.value === category)
  const subcat = cat?.subcategories.find(s => s.value === subcategory)
  return subcat?.label || subcategory
}

// Get all categories as simple array
export function getAllCategories(): string[] {
  return aptitudeCategories.map(c => c.value)
}

// Get total question count
export function getTotalQuestionCount(): number {
  return aptitudeCategories.reduce((total, cat) => {
    return total + cat.subcategories.reduce((sum, sub) => sum + (sub.count || 0), 0)
  }, 0)
}
