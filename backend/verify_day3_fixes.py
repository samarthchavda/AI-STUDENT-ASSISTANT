#!/usr/bin/env python3
"""
Verify fixes made to day3.json
Shows before/after comparison for all fixed questions
"""
import json
import os

def main():
    print("=" * 80)
    print("🔍 Verifying day3.json Fixes")
    print("=" * 80)
    print()
    
    # Load both files
    try:
        with open('../day3.json', 'r', encoding='utf-8') as f:
            original = json.load(f)
        with open('../day3_fixed.json', 'r', encoding='utf-8') as f:
            fixed = json.load(f)
    except FileNotFoundError as e:
        print(f"❌ File not found: {e}")
        exit(1)
    
    print(f"📊 Original: {len(original)} questions")
    print(f"📊 Fixed: {len(fixed)} questions")
    print()
    
    # Find differences
    differences = []
    
    for i, (orig, fix) in enumerate(zip(original, fixed)):
        changes = []
        
        # Check question
        if orig['question'] != fix['question']:
            changes.append({
                'type': 'question',
                'before': orig['question'],
                'after': fix['question']
            })
        
        # Check options
        for orig_opt, fix_opt in zip(orig['options'], fix['options']):
            if orig_opt['text'] != fix_opt['text']:
                changes.append({
                    'type': f"option_{orig_opt['key']}",
                    'before': orig_opt['text'],
                    'after': fix_opt['text']
                })
        
        # Check explanation
        if orig['explanation'] != fix['explanation']:
            changes.append({
                'type': 'explanation',
                'before': orig['explanation'][:100] + '...',
                'after': fix['explanation'][:100] + '...'
            })
        
        if changes:
            differences.append({
                'index': i,
                'id': orig['id'],
                'question_preview': orig['question'][:80] + '...',
                'changes': changes
            })
    
    print(f"✅ Found {len(differences)} questions with fixes")
    print()
    
    # Show all fixes
    print("=" * 80)
    print("📋 All Fixes Applied")
    print("=" * 80)
    print()
    
    for diff in differences:
        print(f"Question {diff['index'] + 1}:")
        print(f"  Preview: {diff['question_preview']}")
        print()
        
        for change in diff['changes']:
            print(f"  {change['type'].upper()}:")
            print(f"    ❌ Before: {change['before']}")
            print(f"    ✅ After:  {change['after']}")
            print()
        
        print("-" * 80)
        print()
    
    # Summary
    print("=" * 80)
    print("📊 Summary")
    print("=" * 80)
    print()
    print(f"Total questions: {len(original)}")
    print(f"Questions fixed: {len(differences)}")
    print(f"Questions unchanged: {len(original) - len(differences)}")
    print()
    
    # Count fix types
    option_fixes = sum(1 for d in differences for c in d['changes'] if 'option' in c['type'])
    question_fixes = sum(1 for d in differences for c in d['changes'] if c['type'] == 'question')
    explanation_fixes = sum(1 for d in differences for c in d['changes'] if c['type'] == 'explanation')
    
    print(f"Fixes by type:")
    print(f"  • Options: {option_fixes}")
    print(f"  • Questions: {question_fixes}")
    print(f"  • Explanations: {explanation_fixes}")
    print()
    
    print("✅ Verification complete!")
    print()
    print("Next steps:")
    print("1. Review the fixes above")
    print("2. If satisfied, upload day3_fixed.json via admin panel")
    print("3. Delete day3.json and day3_fixed.json after upload")


if __name__ == "__main__":
    main()
