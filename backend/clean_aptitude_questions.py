"""
Clean and normalize aptitude practice questions
Removes low-quality questions, fixes formatting, normalizes categories
"""
import json
import re
from typing import Dict, List, Tuple

class QuestionCleaner:
    def __init__(self):
        self.stats = {
            'total_input': 0,
            'total_kept': 0,
            'total_removed': 0,
            'answers_corrected': 0,
            'subcategories_normalized': 0,
            'explanations_cleaned': 0,
            'questions_text_cleaned': 0
        }
        
        # Category/subcategory normalization mappings
        self.subcategory_map = {
            # Aptitude topics
            'percentage': 'percentage',
            'percentages': 'percentage',
            'profit-and-loss': 'profit-and-loss',
            'profit-loss': 'profit-and-loss',
            'time-speed-distance': 'time-speed-distance',
            'time-and-distance': 'time-speed-distance',
            'boats-and-streams': 'time-speed-distance',
            'trains': 'time-speed-distance',
            'time-and-work': 'time-and-work',
            'work-efficiency': 'time-and-work',
            'ratio-and-proportion': 'ratio-and-proportion',
            'ratio': 'ratio-and-proportion',
            'proportion': 'ratio-and-proportion',
            'probability': 'probability',
            'average': 'average',
            'averages': 'average',
            'simple-interest': 'simple-interest',
            'compound-interest': 'compound-interest',
            'ages': 'ages',
            'mixtures-and-alligations': 'mixtures-and-alligations',
            'pipes-and-cisterns': 'pipes-and-cisterns',
            'area': 'area',
            'volume-and-surface-area': 'volume-and-surface-area',
            
            # Programming
            'sql': 'sql',
            'c-programming': 'c-programming',
            'java-programming': 'java-programming',
            'python': 'python',
            
            # Technical
            'digital-electronics': 'digital-electronics',
            'networking': 'networking',
            'database': 'database',
            
            # Reasoning
            'logical-reasoning': 'logical-reasoning',
            'verbal-ability': 'verbal-ability',
            'general-knowledge': 'general-knowledge'
        }
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ""
        
        # Decode HTML entities
        text = text.replace('&nbsp;', ' ')
        text = text.replace('&lt;', '<')
        text = text.replace('&gt;', '>')
        text = text.replace('&amp;', '&')
        text = text.replace('&quot;', '"')
        
        # Fix broken spacing
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        # Fix common formatting issues
        text = re.sub(r'What isnot', 'What is not', text)
        text = re.sub(r'(\w)not(\w)', r'\1 not \2', text)
        text = re.sub(r'(\w)and(\w)', r'\1 and \2', text)
        text = re.sub(r'(\w)or(\w)', r'\1 or \2', text)
        text = re.sub(r'(\w)is(\w)', r'\1 is \2', text)
        
        # Fix punctuation spacing
        text = re.sub(r'\s+([.,;:!?])', r'\1', text)
        text = re.sub(r'([.,;:!?])(\w)', r'\1 \2', text)
        
        # Remove metadata patterns
        text = re.sub(r'\[.*?\d{4}\]', '', text)  # [Company 2019]
        text = re.sub(r'\(Question\s*#\d+\)', '', text)  # (Question #123)
        
        return text.strip()
    
    def clean_explanation(self, explanation: str) -> str:
        """Clean explanation text"""
        if not explanation:
            return ""
        
        # Remove placeholder explanations
        placeholders = [
            "No answer description is available. Let's discuss.",
            "No answer description available.",
            "Let's discuss.",
            "No explanation available",
            "Answer not available"
        ]
        
        for placeholder in placeholders:
            if placeholder.lower() in explanation.lower():
                return ""
        
        # Remove speculative text
        speculation_patterns = [
            r"Let me recheck.*",
            r"assume typo.*",
            r"possible intended.*",
            r"might be.*typo",
            r"probably.*mistake"
        ]
        
        for pattern in speculation_patterns:
            explanation = re.sub(pattern, '', explanation, flags=re.IGNORECASE)
        
        # Remove video/YouTube links
        explanation = re.sub(r'https?://(?:www\.)?youtube\.com/\S+', '', explanation)
        explanation = re.sub(r'Watch video.*', '', explanation, flags=re.IGNORECASE)
        
        # Clean text
        explanation = self.clean_text(explanation)
        
        return explanation
    
    def normalize_subcategory(self, category: str, subcategory: str) -> str:
        """Normalize subcategory based on category"""
        if not subcategory:
            return category.lower().replace(' ', '-')
        
        subcategory_lower = subcategory.lower().strip()
        
        # Use mapping if available
        if subcategory_lower in self.subcategory_map:
            return self.subcategory_map[subcategory_lower]
        
        # Default: clean slug
        return re.sub(r'[^a-z0-9-]', '', subcategory_lower.replace(' ', '-'))
    
    def clean_tags(self, tags: List[str]) -> List[str]:
        """Clean and deduplicate tags"""
        if not tags:
            return []
        
        # Normalize tags
        cleaned = []
        seen = set()
        
        for tag in tags:
            if not tag:
                continue
            
            tag_clean = tag.lower().strip().replace(' ', '-')
            tag_clean = re.sub(r'[^a-z0-9-]', '', tag_clean)
            
            if tag_clean and tag_clean not in seen and len(tag_clean) > 2:
                cleaned.append(tag_clean)
                seen.add(tag_clean)
        
        # Limit to 5 tags
        return cleaned[:5]
    
    def validate_question(self, question: Dict) -> Tuple[bool, str]:
        """Validate if question should be kept"""
        
        # Check required fields
        if not question.get('question') or not question.get('options'):
            return False, "Missing question or options"
        
        # Check if question text is too short or broken
        q_text = question['question'].strip()
        if len(q_text) < 10:
            return False, "Question text too short"
        
        # Check if question is mostly garbage characters
        if len(re.findall(r'[a-zA-Z0-9\s]', q_text)) < len(q_text) * 0.5:
            return False, "Question text contains too many special characters"
        
        # Validate options
        options = question.get('options', [])
        if not isinstance(options, list) or len(options) < 2:
            return False, "Invalid or insufficient options"
        
        # Check for empty options
        valid_options = [opt for opt in options if opt.get('text', '').strip()]
        if len(valid_options) < 2:
            return False, "Too many empty options"
        
        # Check if image question with no valid options
        if question.get('has_image') and len(valid_options) < 3:
            return False, "Image question with insufficient text options"
        
        # Check answer validity
        answer = question.get('answer', '').strip().upper()
        if not answer or answer not in ['A', 'B', 'C', 'D']:
            return False, "Invalid answer key"
        
        # Check if answer index is valid
        answer_index = ord(answer) - ord('A')
        if answer_index >= len(options):
            return False, "Answer key out of range"
        
        return True, ""
    
    def clean_question(self, question: Dict) -> Dict:
        """Clean a single question"""
        cleaned = {
            'id': question.get('id', ''),
            'question': self.clean_text(question.get('question', '')),
            'image': question.get('image'),
            'has_image': question.get('has_image', False),
            'options': [],
            'answer': question.get('answer', '').strip().upper(),
            'explanation': self.clean_explanation(question.get('explanation', '')),
            'category': question.get('category', '').strip(),
            'subcategory': '',
            'difficulty': question.get('difficulty', 'medium').lower(),
            'tags': []
        }
        
        # Clean options
        for opt in question.get('options', []):
            if isinstance(opt, dict):
                text = self.clean_text(opt.get('text', ''))
                if text:  # Only keep non-empty options
                    cleaned['options'].append({
                        'key': opt.get('key', '').upper(),
                        'text': text
                    })
        
        # Normalize subcategory
        original_subcat = question.get('subcategory', '')
        cleaned['subcategory'] = self.normalize_subcategory(
            cleaned['category'], 
            original_subcat
        )
        
        if original_subcat != cleaned['subcategory']:
            self.stats['subcategories_normalized'] += 1
        
        # Clean tags
        cleaned['tags'] = self.clean_tags(question.get('tags', []))
        
        # Track cleaning
        if cleaned['question'] != question.get('question', ''):
            self.stats['questions_text_cleaned'] += 1
        
        if cleaned['explanation'] != question.get('explanation', ''):
            self.stats['explanations_cleaned'] += 1
        
        return cleaned
    
    def process_questions(self, input_file: str) -> Tuple[List[Dict], List[Dict]]:
        """Process all questions and return kept and removed lists"""
        print(f"Loading questions from {input_file}...")
        
        with open(input_file, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        
        self.stats['total_input'] = len(questions)
        print(f"Loaded {len(questions)} questions")
        
        kept = []
        removed = []
        
        for i, question in enumerate(questions):
            if (i + 1) % 500 == 0:
                print(f"Processing question {i + 1}/{len(questions)}...")
            
            # Validate question
            is_valid, reason = self.validate_question(question)
            
            if not is_valid:
                removed.append({
                    'original': question,
                    'removal_reason': reason
                })
                self.stats['total_removed'] += 1
                continue
            
            # Clean question
            cleaned = self.clean_question(question)
            
            # Re-validate after cleaning
            is_valid, reason = self.validate_question(cleaned)
            
            if is_valid:
                kept.append(cleaned)
                self.stats['total_kept'] += 1
            else:
                removed.append({
                    'original': question,
                    'removal_reason': f"Failed validation after cleaning: {reason}"
                })
                self.stats['total_removed'] += 1
        
        return kept, removed
    
    def save_results(self, kept: List[Dict], removed: List[Dict]):
        """Save cleaned and removed questions to files"""
        
        # Save cleaned questions
        cleaned_file = 'aptitude_practice_questions_cleaned.json'
        print(f"\nSaving {len(kept)} cleaned questions to {cleaned_file}...")
        with open(cleaned_file, 'w', encoding='utf-8') as f:
            json.dump(kept, f, indent=2, ensure_ascii=False)
        
        # Save removed questions
        removed_file = 'aptitude_practice_questions_removed.json'
        print(f"Saving {len(removed)} removed questions to {removed_file}...")
        with open(removed_file, 'w', encoding='utf-8') as f:
            json.dump(removed, f, indent=2, ensure_ascii=False)
        
        print(f"\n✓ Files saved successfully!")
    
    def print_summary(self):
        """Print cleaning summary"""
        print("\n" + "="*60)
        print("CLEANING SUMMARY")
        print("="*60)
        print(f"Total input questions:        {self.stats['total_input']:,}")
        print(f"Total cleaned questions kept: {self.stats['total_kept']:,}")
        print(f"Total removed questions:      {self.stats['total_removed']:,}")
        print(f"Questions text cleaned:       {self.stats['questions_text_cleaned']:,}")
        print(f"Explanations cleaned:         {self.stats['explanations_cleaned']:,}")
        print(f"Subcategories normalized:     {self.stats['subcategories_normalized']:,}")
        print(f"Answers corrected:            {self.stats['answers_corrected']:,}")
        
        retention_rate = (self.stats['total_kept'] / self.stats['total_input'] * 100) if self.stats['total_input'] > 0 else 0
        print(f"\nRetention rate: {retention_rate:.1f}%")
        print("="*60)

def main():
    """Main execution"""
    cleaner = QuestionCleaner()
    
    input_file = 'aptitude_practice_questions_export.json'
    
    # Process questions
    kept, removed = cleaner.process_questions(input_file)
    
    # Save results
    cleaner.save_results(kept, removed)
    
    # Print summary
    cleaner.print_summary()
    
    print("\n✓ Cleaning complete!")

if __name__ == "__main__":
    main()
