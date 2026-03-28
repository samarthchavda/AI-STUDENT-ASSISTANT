"""
Quick script to check DSA questions in database
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import func
from app.core.database import SessionLocal
from app.models import DSAProblem, DSATopic, DifficultyLevel

def check_questions():
    db = SessionLocal()
    
    try:
        total = db.query(DSAProblem).count()
        print(f"\n📊 Total DSA Questions: {total}\n")
        
        if total == 0:
            print("❌ No questions found in database!")
            return
        
        print("=" * 70)
        print("BREAKDOWN BY TOPIC")
        print("=" * 70)
        
        for topic in DSATopic:
            count = db.query(DSAProblem).filter(DSAProblem.topic == topic).count()
            if count > 0:
                print(f"\n📁 {topic.value.upper()}: {count} questions")
                
                # Show questions for this topic
                questions = db.query(DSAProblem).filter(DSAProblem.topic == topic).all()
                for q in questions:
                    difficulty_emoji = "🟢" if q.difficulty == DifficultyLevel.EASY else "🟡" if q.difficulty == DifficultyLevel.MEDIUM else "🔴"
                    print(f"   {difficulty_emoji} {q.title} ({q.difficulty.value}) - {q.company}")
        
        print("\n" + "=" * 70)
        print("BREAKDOWN BY DIFFICULTY")
        print("=" * 70)
        
        for difficulty in DifficultyLevel:
            count = db.query(DSAProblem).filter(DSAProblem.difficulty == difficulty).count()
            print(f"{difficulty.value.upper()}: {count} questions")
        
        print("\n" + "=" * 70)
        print("COMPANY TAGS")
        print("=" * 70)
        
        # Count questions by company
        companies = {}
        all_questions = db.query(DSAProblem).all()
        for q in all_questions:
            if q.company:
                for company in q.company.split(','):
                    company = company.strip()
                    companies[company] = companies.get(company, 0) + 1
        
        for company, count in sorted(companies.items(), key=lambda x: x[1], reverse=True):
            print(f"{company}: {count} questions")
        
    finally:
        db.close()


if __name__ == "__main__":
    check_questions()
