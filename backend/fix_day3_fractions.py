#!/usr/bin/env python3
"""
Fix mathematical fractions in day3.json using Gemini AI
Converts malformed fractions like '221days2' to '22.5 days' or '22 1/2 days'
"""
import json
import os
import re
from dotenv import load_dotenv
import google.generativeai as genai
from typing import Dict, Any
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
    """
    Check if text contains malformed fractions like:
    - 221days2 (should be 22.5 days or 22 1/2 days)
    - 101days2 (should be 10.5 days or 10 1/2 days)
    - 331hours3 (should be 33.33 hours or 33 1/3 hours)
    """
    patterns = [
        r'\d+1days2',  # 221days2, 101days2
        r'\d+1hours2',  # 331hours2
        r'\d+1minutes2',  # 451minutes2
        r'\d+2days3',  # 332days3
        r'\d+1years2',  # 51years2
        r'\d{3,}days\d',  # Any 3+ digit number followed by days and digit
        r'\d{3,}hours\d',  # Any 3+ digit number followed by hours and digit
    ]
    
    for pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False


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
        # Fallback: Simple regex replacement
        cleaned = text
        cleaned = re.sub(r'221days2', '22.5 days', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'101days2', '10.5 days', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'331hours3', '33.33 hours', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'(\d+)1days2', r'\1.5 days', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'(\d+)1hours2', r'\1.5 hours', cleaned, flags=re.IGNORECASE)
        return cleaned


def fix_question(question: Dict[str, Any], index: int) -> Dict[str, Any]:
    """
    Fix a single question's formatting issues
    """
    fixed = question.copy()
    needs_fixing = False
    
    # Check question text
    if has_malformed_fraction(question['question']):
        print(f"  📝 Fixing question text...")
        fixed['question'] = clean_text_with_ai(question['question'], "question")
        needs_fixing = True
    
    # Check options
    for i, option in enumerate(question['options']):
        if has_malformed_fraction(option['text']):
            print(f"  🔧 Fixing option {option['key']}: {option['text']}")
            fixed['options'][i]['text'] = clean_text_with_ai(option['text'], "option")
            needs_fixing = True
    
    # Check explanation
    if has_malformed_fraction(question['explanation']):
        print(f"  📖 Fixing explanation...")
        fixed['explanation'] = clean_text_with_ai(question['explanation'], "explanation")
        needs_fixing = True
    
    return fixed, needs_fixing


def main():
    print("=" * 80)
    print("🔧 Fixing Mathematical Fractions in day3.json")
    print("=" * 80)
    print()
    
    # Load day3.json
    try:
        with open('day3.json', 'r', encoding='utf-8') as f:
            questions = json.load(f)
    except FileNotFoundError:
        print("❌ day3.json not found")
        print("   Make sure you're running this from the project root")
        exit(1)
    
    print(f"📊 Loaded {len(questions)} questions")
    print()
    
    # Scan for issues
    print("🔍 Scanning for malformed fractions...")
    issues_found = 0
    questions_with_issues = []
    
    for i, q in enumerate(questions):
        has_issue = False
        
        if has_malformed_fraction(q['question']):
            has_issue = True
        
        for opt in q['options']:
            if has_malformed_fraction(opt['text']):
                has_issue = True
        
        if has_malformed_fraction(q['explanation']):
            has_issue = True
        
        if has_issue:
            issues_found += 1
            questions_with_issues.append(i)
    
    print(f"Found {issues_found} questions with formatting issues")
    print()
    
    if issues_found == 0:
        print("✅ No issues found! File is already clean.")
        return
    
    # Ask for confirmation
    print(f"⚠️  This will use Gemini AI to fix {issues_found} questions")
    print("   Estimated API calls: ~" + str(issues_found * 2))
    print()
    response = input("Continue? (y/n): ")
    
    if response.lower() != 'y':
        print("❌ Cancelled")
        return
    
    print()
    print("🤖 Starting AI-powered cleanup...")
    print()
    
    # Fix questions
    fixed_questions = []
    fixed_count = 0
    
    for i, question in enumerate(questions):
        if i in questions_with_issues:
            print(f"Question {i+1}/{len(questions)} (ID: {question['id'][:8]}...)")
            fixed_question, was_fixed = fix_question(question, i)
            
            if was_fixed:
                fixed_count += 1
                fixed_questions.append(fixed_question)
            else:
                fixed_questions.append(question)
            
            # Rate limiting - avoid hitting API limits
            time.sleep(0.5)
        else:
            fixed_questions.append(question)
    
    print()
    print("=" * 80)
    print(f"✅ Fixed {fixed_count} questions")
    print("=" * 80)
    print()
    
    # Save to new file
    output_file = 'day3_fixed.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(fixed_questions, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Saved cleaned data to: {output_file}")
    print()
    print("Next steps:")
    print("1. Review day3_fixed.json to verify changes")
    print("2. Upload via admin panel: /admin → Aptitude Practice Questions")
    print("3. Delete day3.json and day3_fixed.json after upload")
    print()
    
    # Show sample fixes
    print("=" * 80)
    print("📋 Sample Fixes")
    print("=" * 80)
    print()
    
    for i in questions_with_issues[:3]:
        original = questions[i]
        fixed = fixed_questions[i]
        
        print(f"Question {i+1}:")
        
        # Show option fixes
        for j, (orig_opt, fixed_opt) in enumerate(zip(original['options'], fixed['options'])):
            if orig_opt['text'] != fixed_opt['text']:
                print(f"  Option {orig_opt['key']}:")
                print(f"    Before: {orig_opt['text']}")
                print(f"    After:  {fixed_opt['text']}")
        
        print()


if __name__ == "__main__":
    main()
