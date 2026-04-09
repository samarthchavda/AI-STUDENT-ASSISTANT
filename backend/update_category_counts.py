"""
Update frontend category counts from database
"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def main():
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cur = conn.cursor()
    
    # Get counts by subcategory
    cur.execute('''
        SELECT subcategory, COUNT(*) 
        FROM aptitude_practice_questions 
        GROUP BY subcategory 
        ORDER BY subcategory
    ''')
    
    counts = {}
    for subcat, cnt in cur.fetchall():
        counts[subcat] = cnt
    
    print("Subcategory counts from database:")
    for subcat, cnt in sorted(counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {subcat}: {cnt}")
    
    print(f"\nTotal: {sum(counts.values())}")
    
    # Generate TypeScript config
    print("\n" + "="*60)
    print("Updated aptitudeCategories.ts content:")
    print("="*60)
    
    config = """/**
 * Aptitude Practice Categories and Subcategories Configuration
 * Updated from database - Total: """ + str(sum(counts.values())) + """ questions
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
      { value: 'percentage', label: 'Percentage', count: """ + str(counts.get('percentage', 0)) + """ },
      { value: 'profit-and-loss', label: 'Profit and Loss', count: """ + str(counts.get('profit-and-loss', 0)) + """ },
      { value: 'time-speed-distance', label: 'Time, Speed & Distance', count: """ + str(counts.get('time-speed-distance', 0)) + """ },
      { value: 'time-and-work', label: 'Time and Work', count: """ + str(counts.get('time-and-work', 0)) + """ },
      { value: 'average', label: 'Average', count: """ + str(counts.get('average', 0)) + """ },
      { value: 'ratio-and-proportion', label: 'Ratio and Proportion', count: """ + str(counts.get('ratio-and-proportion', 0)) + """ },
    ]
  },
  {
    value: 'Database',
    label: 'Database',
    icon: '🗄️',
    color: 'green',
    subcategories: [
      { value: 'sql', label: 'SQL', count: """ + str(counts.get('sql', 0)) + """ },
    ]
  },
  {
    value: 'Digital Electronics',
    label: 'Digital Electronics',
    icon: '⚡',
    color: 'yellow',
    subcategories: [
      { value: 'digital-electronics', label: 'Digital Electronics', count: """ + str(counts.get('digital-electronics', 0)) + """ },
    ]
  },
  {
    value: 'C Programming',
    label: 'C Programming',
    icon: '💻',
    color: 'purple',
    subcategories: [
      { value: 'c-programming', label: 'C Programming', count: """ + str(counts.get('c-programming', 0)) + """ },
      { value: 'c-basics', label: 'C Basics', count: """ + str(counts.get('c-basics', 0)) + """ },
      { value: 'arrays-and-strings', label: 'Arrays and Strings', count: """ + str(counts.get('arrays-and-strings', 0)) + """ },
    ]
  },
  {
    value: 'General Knowledge',
    label: 'General Knowledge',
    icon: '🌍',
    color: 'indigo',
    subcategories: [
      { value: 'general-knowledge', label: 'General Knowledge', count: """ + str(counts.get('general-knowledge', 0)) + """ },
      { value: 'world-geography', label: 'World Geography', count: """ + str(counts.get('world-geography', 0)) + """ },
    ]
  },
  {
    value: 'Logical Reasoning',
    label: 'Logical Reasoning',
    icon: '🧩',
    color: 'pink',
    subcategories: [
      { value: 'logical-reasoning', label: 'Logical Reasoning', count: """ + str(counts.get('logical-reasoning', 0)) + """ },
      { value: 'verbal-reasoning', label: 'Verbal Reasoning', count: """ + str(counts.get('verbal-reasoning', 0)) + """ },
      { value: 'puzzles', label: 'Puzzles', count: """ + str(counts.get('puzzles', 0)) + """ },
      { value: 'logical-problems', label: 'Logical Problems', count: """ + str(counts.get('logical-problems', 0)) + """ },
    ]
  },
  {
    value: 'Networking',
    label: 'Networking',
    icon: '🌐',
    color: 'cyan',
    subcategories: [
      { value: 'networking', label: 'Networking', count: """ + str(counts.get('networking', 0)) + """ },
      { value: 'networking-basics', label: 'Networking Basics', count: """ + str(counts.get('networking-basics', 0)) + """ },
    ]
  },
  {
    value: 'Java Programming',
    label: 'Java Programming',
    icon: '☕',
    color: 'orange',
    subcategories: [
      { value: 'java-basics', label: 'Java Basics', count: """ + str(counts.get('java-basics', 0)) + """ },
      { value: 'java-programming', label: 'Java Programming', count: """ + str(counts.get('java-programming', 0)) + """ },
    ]
  },
  {
    value: 'Verbal Ability',
    label: 'Verbal Ability',
    icon: '📝',
    color: 'red',
    subcategories: [
      { value: 'synonyms', label: 'Synonyms', count: """ + str(counts.get('synonyms', 0)) + """ },
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
"""
    
    print(config)
    
    # Write to file
    with open('frontend/src/config/aptitudeCategories.ts', 'w', encoding='utf-8') as f:
        f.write(config)
    
    print("\n✓ Updated frontend/src/config/aptitudeCategories.ts")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
