#!/usr/bin/env python3
"""
Fix mathematical fractions in day3.json using Gemini AI (Batch Processing)
More efficient - processes multiple questions per API call
"""
import json
import os
import re
from dotenv import load_dotenv
import google.generativeai as genai
from typing import Dict, Any, List
import time

load_dotenv()

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("❌ GEMINI_API_KEY not found in .env file")
    exit(1)

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def has_malformed_fraction(text: str) -> bool:
    """Check if text contains malformed fractions"""
    patterns = [
        r'\d+1days2',  # 221days2, 101days2
        r'\d+1hours2',  # 331hours2
        r'\d+1minutes2',  # 451minutes2
        r'\d+2days3',  # 332days3
        r'\d+1years2',  # 51years2
        r'\d{2,}days\d',  # Any 2+ digit number followed by days and digit
        r'\d{2,}hours\d',  # Any 2+ digit number followed by hours and digit
        r'\d+1months2',  # 61months2
    ]
    
    for pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False


def extract_issues(question: Dict[str, Any]) -> List[str]:
    """Extract all text snippets that need fixing"""
    issues = []
    
    # Check question
    if has_malformed_fraction(question['question']):
        issues.append(f"QUESTION: {question['question']}")
    
    # Check options
    for opt in question['options']:
        if has_malformed_fraction(opt['text']):
            issues.append(f"OPTION_{opt['key']}: {opt['text']}")
    
    # Check explanation
    if has_malformed_fraction(question['explanation']):
        # Split long explanations
        explanation = question['explanation']
        if len(explanation) > 500:
            issues.append(f"EXPLANATION: {explanation[:500]}...")
        else:
            issues.append(f"EXPLANATION: {explanation}")
    
    return issues


def batch_fix_with_ai(issues_batch: List[tuple[int, str]]) -> Dict[int, str]:
    """
    Fix a batch of issues using single AI call
    Returns dict mapping question_index -> fixed_text
    """
    if not issues_batch:
        return {}
    
    # Build batch prompt
    batch_text = "\n\n---\n\n".join([f"[{idx}] {text}" for idx, text in issues_batch])
    
    prompt = f"""You are a mathematical text formatter. Fix malformed fractions in these text snippets.

COMMON PATTERNS TO FIX:
- "221days2" → "22.5 days" or "22 1/2 days"
- "101days2" → "10.5 days" or "10 1/2 days"  
- "331hours3" → "33.33 hours" or "33 1/3 hours"
- "51years2" → "5.5 years" or "5 1/2 years"

RULES:
1. Fix ONLY the malformed fractions
2. Keep all other text exactly the same
3. Preserve mathematical formulas and calculations
4. Make fractions human-readable
5. Return each fixed text with its [index] number

INPUT:
{batch_text}

OUTPUT FORMAT:
[0] fixed text here
[1] fixed text here
[2] fixed text here

Fixed texts:"""

    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Parse results
        results = {}
        for line in result_text.split('\n'):
            match = re.match(r'\[(\d+)\]\s*(.+)', line)
            if match:
                idx = int(match.group(1))
                fixed = match.group(2).strip()
                results[idx] = fixed
        
        return results
        
    except Exception as e:
        print(f"⚠️  Batch AI cleaning failed: {e}")
        return {}


def apply_fixes(question: Dict[str, Any], fixes: Dict[str, str]) -> Dict[str, Any]:
    """Apply AI fixes to a question"""
    fixed = question.copy()
    
    # Fix question
    if f"QUESTION: {question['question']}" in fixes:
        fixed['question'] = fixes[f"QUESTION: {question['question']}"]
    
    # Fix options
    fixed['options'] = []
    for opt in question['options']:
        key = f"OPTION_{opt['key']}: {opt['text']}"
        if key in fixes:
            fixed['options'].append({
                'key': opt['key'],
                'text': fixes[key]
            })
        else:
            fixed['options'].append(opt.copy())
    
    # Fix explanation
    exp_key = f"EXPLANATION: {question['explanation']}"
    if exp_key in fixes:
        fixed['explanation'] = fixes[exp_key]
    elif f"EXPLANATION: {question['explanation'][:500]}..." in fixes:
        fixed['explanation'] = fixes[f"EXPLANATION: {question['explanation'][:500]}..."]
    
    return fixed


def clean_text_with_ai(text: str, context: str = "option") -> str:
    """
    Use Gemini AI to clean up malformed mathematical expressions
    """
    if not has_malformed_fraction(text):
        return text
    
    prompt = f"""You are a mathematical text formatter. Fix malformed fractions and mathematical expressions in this {context}.

RULES:
1. Convert malformed fractions like "221days2" to "22.5 days" or "22 1/2 days"
2. Convert "101days2" to "10.5 days" or "10 1/2 days"
3. Convert "331hours3" to "33.33 hours" or "33 1/3 hours"
4. Keep all other text exactly the same
5. Preserve mathematical calculations and formulas
6. Make fractions human-readable
7. Return ONLY the corrected text, no explanations

Text to fix:
{text}

Corrected text:"""

    try:
        response = model.generate_content(prompt)
        cleaned = response.text.strip()
        
        # Remove any markdown formatting
        cleaned = cleaned.replace('```', '').strip()
        
        return cleaned
    except Exception as e:
        print(f"⚠️  AI cleaning failed: {e}")
        # Fallback to regex
        return simple_regex_fix(text)


def simple_regex_fix(text: str) -> str:
    """
    Fallback: Simple regex-based fixes for common patterns
    """
    replacements = {
        r'221days2': '22.5 days',
        r'101days2': '10.5 days',
        r'331hours3': '33.33 hours',
        r'51years2': '5.5 years',
        r'151days2': '15.5 days',
        r'71days2': '7.5 days',
        r'(\d+)1days2': r'\1.5 days',
        r'(\d+)1hours2': r'\1.5 hours',
        r'(\d+)1minutes2': r'\1.5 minutes',
        r'(\d+)2days3': r'\1.67 days',
        r'(\d+)1months2': r'\1.5 months',
    }
    
    result = text
    for pattern, replacement in replacements.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result


def main():
    print("=" * 80)
    print("🔧 Fixing Mathematical Fractions in day3.json (AI-Powered)")
    print("=" * 80)
    print()
    
    # Load day3.json - check both current dir and parent dir
    json_path = None
    if os.path.exists('day3.json'):
        json_path = 'day3.json'
    elif os.path.exists('../day3.json'):
        json_path = '../day3.json'
    else:
        print("❌ day3.json not found")
        print("   Checked: ./day3.json and ../day3.json")
        exit(1)
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            questions = json.load(f)
    except Exception as e:
        print(f"❌ Failed to load day3.json: {e}")
        exit(1)
    
    print(f"📊 Loaded {len(questions)} questions from {json_path}")
    print()
    
    # Scan for issues
    print("🔍 Scanning for malformed fractions...")
    questions_with_issues = []
    
    for i, q in enumerate(questions):
        issues = extract_issues(q)
        if issues:
            questions_with_issues.append((i, q, issues))
    
    print(f"Found {len(questions_with_issues)} questions with formatting issues")
    print()
    
    if len(questions_with_issues) == 0:
        print("✅ No issues found! File is already clean.")
        return
    
    # Show samples
    print("📋 Sample Issues:")
    for i, (idx, q, issues) in enumerate(questions_with_issues[:3]):
        print(f"\nQuestion {idx+1}:")
        for issue in issues[:2]:
            print(f"  • {issue[:80]}...")
    print()
    
    # Choose method
    print("Choose fixing method:")
    print("1. AI-powered (Gemini) - Most accurate, uses API calls")
    print("2. Regex-based - Fast, free, but less accurate")
    print()
    method = input("Enter choice (1 or 2): ").strip()
    
    if method not in ['1', '2']:
        print("❌ Invalid choice")
        return
    
    use_ai = method == '1'
    
    if use_ai:
        print()
        print(f"⚠️  This will use ~{len(questions_with_issues)} Gemini API calls")
        confirm = input("Continue? (y/n): ")
        if confirm.lower() != 'y':
            print("❌ Cancelled")
            return
    
    print()
    print("🔧 Processing...")
    print()
    
    # Fix questions
    fixed_questions = questions.copy()
    fixed_count = 0
    
    for idx, question, issues in questions_with_issues:
        print(f"Fixing question {idx+1}/{len(questions)}...")
        
        if use_ai:
            # Use AI for each problematic field
            fixed = question.copy()
            
            # Fix question text
            if has_malformed_fraction(question['question']):
                fixed['question'] = clean_text_with_ai(question['question'], "question")
            
            # Fix options
            fixed['options'] = []
            for opt in question['options']:
                if has_malformed_fraction(opt['text']):
                    fixed['options'].append({
                        'key': opt['key'],
                        'text': clean_text_with_ai(opt['text'], "option")
                    })
                else:
                    fixed['options'].append(opt.copy())
            
            # Fix explanation
            if has_malformed_fraction(question['explanation']):
                fixed['explanation'] = clean_text_with_ai(question['explanation'], "explanation")
            
            fixed_questions[idx] = fixed
            time.sleep(0.3)  # Rate limiting
        else:
            # Use regex
            fixed = question.copy()
            fixed['question'] = simple_regex_fix(question['question'])
            fixed['options'] = [
                {'key': opt['key'], 'text': simple_regex_fix(opt['text'])}
                for opt in question['options']
            ]
            fixed['explanation'] = simple_regex_fix(question['explanation'])
            fixed_questions[idx] = fixed
        
        fixed_count += 1
    
    print()
    print("=" * 80)
    print(f"✅ Fixed {fixed_count} questions")
    print("=" * 80)
    print()
    
    # Save to new file
    output_dir = os.path.dirname(json_path) or '.'
    output_file = os.path.join(output_dir, 'day3_fixed.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(fixed_questions, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Saved to: {output_file}")
    print()
    
    # Show before/after examples
    print("=" * 80)
    print("📋 Before/After Examples")
    print("=" * 80)
    print()
    
    for idx, _, _ in questions_with_issues[:2]:
        original = questions[idx]
        fixed = fixed_questions[idx]
        
        print(f"Question {idx+1}:")
        
        # Show option changes
        for orig_opt, fixed_opt in zip(original['options'], fixed['options']):
            if orig_opt['text'] != fixed_opt['text']:
                print(f"  Option {orig_opt['key']}:")
                print(f"    ❌ Before: {orig_opt['text']}")
                print(f"    ✅ After:  {fixed_opt['text']}")
        
        print()
    
    print("🎉 Done! Review day3_fixed.json and upload to admin panel.")


if __name__ == "__main__":
    main()
