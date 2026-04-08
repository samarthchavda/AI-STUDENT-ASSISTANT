/**
 * Utility functions for cleaning and formatting text content
 */

/**
 * Clean malformed fractions in text
 * Converts patterns like "221days2" to "22.5 days"
 * 
 * @param text - The text to clean
 * @returns Cleaned text with proper fraction formatting
 */
export function cleanFractions(text: string): string {
  if (!text) return text

  // Pattern: 221days2 → 22.5 days
  text = text.replace(/(\d)21days2/g, '$1.5 days')
  
  // Pattern: 101days2 → 10.5 days
  text = text.replace(/(\d)01days2/g, '$1.5 days')
  
  // Pattern: 41hours2 → 4.5 hours
  text = text.replace(/(\d)1hours2/g, '$1.5 hours')
  
  // Pattern: 71hours2 → 7.5 hours
  text = text.replace(/(\d)1hours2/g, '$1.5 hours')
  
  // Pattern: 31days2 → 3.5 days
  text = text.replace(/(\d)1days2/g, '$1.5 days')
  
  // Pattern: 51days2 → 5.5 days
  text = text.replace(/(\d)1days2/g, '$1.5 days')
  
  // Pattern: 61days2 → 6.5 days
  text = text.replace(/(\d)1days2/g, '$1.5 days')
  
  // Pattern: 81days2 → 8.5 days
  text = text.replace(/(\d)1days2/g, '$1.5 days')
  
  // Pattern: 91days2 → 9.5 days
  text = text.replace(/(\d)1days2/g, '$1.5 days')
  
  // Pattern: 11days2 → 1.5 days
  text = text.replace(/11days2/g, '1.5 days')
  
  // Pattern: 21days2 → 2.5 days
  text = text.replace(/21days2/g, '2.5 days')
  
  // Pattern: 1hours2 → 0.5 hours
  text = text.replace(/1hours2/g, '0.5 hours')
  
  // Pattern: 1days2 → 0.5 days
  text = text.replace(/1days2/g, '0.5 days')

  return text
}

/**
 * Remove metadata from question text
 * Removes patterns like:
 * - [Company Year] at the start (e.g., [Infosys 2019])
 * - (Question #123) at the end
 * - Company names in brackets
 * 
 * @param text - The text to clean
 * @returns Text without metadata
 */
export function removeMetadata(text: string): string {
  if (!text) return text

  // Remove [Company Year] pattern at the start (e.g., [Infosys 2019], [TCS 2020])
  text = text.replace(/^\[[\w\s]+\d{4}\]\s*/i, '')
  
  // Remove [Company] pattern at the start (e.g., [Infosys], [TCS])
  text = text.replace(/^\[[\w\s]+\]\s*/i, '')
  
  // Remove (Question #123) pattern at the end
  text = text.replace(/\s*\(Question\s*#\d+\)\s*$/i, '')
  
  // Remove Question #123 pattern at the end (without parentheses)
  text = text.replace(/\s*Question\s*#\d+\s*$/i, '')
  
  // Remove any remaining [text] at the very start
  text = text.replace(/^\[[^\]]+\]\s*/, '')
  
  // Trim any extra whitespace
  text = text.trim()

  return text
}

/**
 * Clean and format question text for display
 * Applies all text cleaning operations
 * 
 * @param text - The question text to clean
 * @returns Cleaned and formatted text
 */
export function cleanQuestionText(text: string): string {
  if (!text) return text
  
  // Remove metadata first
  text = removeMetadata(text)
  
  // Apply fraction cleaning
  text = cleanFractions(text)
  
  // Add more cleaning operations here as needed
  
  return text
}
