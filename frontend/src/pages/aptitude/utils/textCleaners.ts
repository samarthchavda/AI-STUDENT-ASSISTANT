/**
 * Utility functions for cleaning and formatting text content
 */

/**
 * Format mathematical symbols and expressions for proper display
 * Handles unicode symbols, HTML entities, and common math notation
 * 
 * @param text - The text containing math symbols
 * @returns Text with properly formatted math symbols
 */
export function formatMathSymbols(text: string): string {
  if (!text) return text

  // Decode HTML entities first
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  text = textarea.value

  // Square root symbols
  text = text.replace(/sqrt\(([^)]+)\)/gi, '√($1)')
  text = text.replace(/√\s*\(?\s*(\d+)\s*\)?/g, '√$1')
  
  // Powers and superscripts
  text = text.replace(/\^2/g, '²')
  text = text.replace(/\^3/g, '³')
  text = text.replace(/\*\*2/g, '²')
  text = text.replace(/\*\*3/g, '³')
  text = text.replace(/(\d+)\s*squared/gi, '$1²')
  text = text.replace(/(\d+)\s*cubed/gi, '$1³')
  
  // Fractions - common patterns
  text = text.replace(/\b1\/2\b/g, '½')
  text = text.replace(/\b1\/3\b/g, '⅓')
  text = text.replace(/\b2\/3\b/g, '⅔')
  text = text.replace(/\b1\/4\b/g, '¼')
  text = text.replace(/\b3\/4\b/g, '¾')
  text = text.replace(/\b1\/5\b/g, '⅕')
  text = text.replace(/\b2\/5\b/g, '⅖')
  text = text.replace(/\b3\/5\b/g, '⅗')
  text = text.replace(/\b4\/5\b/g, '⅘')
  text = text.replace(/\b1\/6\b/g, '⅙')
  text = text.replace(/\b5\/6\b/g, '⅚')
  text = text.replace(/\b1\/8\b/g, '⅛')
  text = text.replace(/\b3\/8\b/g, '⅜')
  text = text.replace(/\b5\/8\b/g, '⅝')
  text = text.replace(/\b7\/8\b/g, '⅞')
  
  // Multiplication symbols
  text = text.replace(/\s*[xX]\s+/g, ' × ')
  text = text.replace(/\s*\*\s*/g, ' × ')
  
  // Division symbols
  text = text.replace(/\s+\/\s+/g, ' ÷ ')
  text = text.replace(/\s+div\s+/gi, ' ÷ ')
  
  // Inequality symbols
  text = text.replace(/<=/g, '≤')
  text = text.replace(/>=/g, '≥')
  text = text.replace(/!=/g, '≠')
  
  // Plus-minus
  text = text.replace(/\+\/-/g, '±')
  text = text.replace(/\+-/g, '±')
  
  // Percentage - ensure proper spacing
  text = text.replace(/(\d)\s*%/g, '$1%')
  
  // Degree symbol
  text = text.replace(/(\d+)\s*degrees?/gi, '$1°')
  
  // Pi symbol
  text = text.replace(/\bpi\b/gi, 'π')
  
  // Infinity
  text = text.replace(/\binfinity\b/gi, '∞')
  
  // Approximately equal
  text = text.replace(/~=/g, '≈')
  text = text.replace(/approximately equal to/gi, '≈')
  
  // Sum symbol
  text = text.replace(/\bsum\b/gi, '∑')
  
  // Product symbol
  text = text.replace(/\bproduct\b/gi, '∏')
  
  // Delta (change)
  text = text.replace(/\bdelta\b/gi, 'Δ')
  
  return text
}

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
 * Normalize encoding issues and broken characters
 * Fixes common encoding problems in question text
 * 
 * @param text - The text to normalize
 * @returns Text with fixed encoding
 */
export function normalizeEncoding(text: string): string {
  if (!text) return text

  // Fix common encoding issues
  text = text.replace(/â€™/g, "'")  // Smart apostrophe
  text = text.replace(/â€œ/g, '"')  // Smart quote open
  text = text.replace(/â€/g, '"')   // Smart quote close
  text = text.replace(/â€"/g, '—')  // Em dash
  text = text.replace(/â€"/g, '–')  // En dash
  text = text.replace(/Â/g, '')     // Non-breaking space artifact
  text = text.replace(/â‚¬/g, '€')  // Euro symbol
  text = text.replace(/Â£/g, '£')   // Pound symbol
  text = text.replace(/Â°/g, '°')   // Degree symbol
  
  // Fix broken unicode
  text = text.replace(/\uFFFD/g, '') // Replacement character
  
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ')
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
  
  // Normalize encoding issues
  text = normalizeEncoding(text)
  
  // Apply fraction cleaning
  text = cleanFractions(text)
  
  // Format mathematical symbols
  text = formatMathSymbols(text)
  
  return text
}
