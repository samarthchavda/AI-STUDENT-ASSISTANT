#!/usr/bin/env python3
"""
Check user data isolation in database
"""
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from tabulate import tabulate

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in .env file")
    exit(1)

engine = create_engine(DATABASE_URL)

def check_users():
    """Show all users in the system"""
    print("=" * 80)
    print("👥 Users in System")
    print("=" * 80)
    print()
    
    query = """
        SELECT id, email, name, plan, is_admin, auth_provider, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 20
    """
    
    with engine.connect() as conn:
        result = conn.execute(text(query))
        rows = result.fetchall()
        
        if not rows:
            print("No users found")
            return
        
        headers = ['ID', 'Email', 'Name', 'Plan', 'Admin', 'Auth', 'Created']
        data = [
            [
                row.id,
                row.email[:30],
                row.name[:20],
                row.plan,
                '✅' if row.is_admin else '❌',
                row.auth_provider,
                str(row.created_at)[:19]
            ]
            for row in rows
        ]
        
        print(tabulate(data, headers=headers, tablefmt='grid'))
        print()

def check_exam_history():
    """Show exam history grouped by user"""
    print("=" * 80)
    print("📊 Exam History by User")
    print("=" * 80)
    print()
    
    query = """
        SELECT 
            u.id as user_id,
            u.email,
            u.name,
            COUNT(e.id) as exam_count,
            AVG(e.score_percent) as avg_score,
            MAX(e.exam_date) as last_exam
        FROM users u
        LEFT JOIN aptitude_exam_history e ON u.id = e.user_id
        GROUP BY u.id, u.email, u.name
        HAVING COUNT(e.id) > 0
        ORDER BY exam_count DESC
    """
    
    with engine.connect() as conn:
        result = conn.execute(text(query))
        rows = result.fetchall()
        
        if not rows:
            print("No exam history found")
            return
        
        headers = ['User ID', 'Email', 'Name', 'Exams', 'Avg Score', 'Last Exam']
        data = [
            [
                row.user_id,
                row.email[:30],
                row.name[:20],
                row.exam_count,
                f"{float(row.avg_score):.1f}%" if row.avg_score else "N/A",
                str(row.last_exam)[:19] if row.last_exam else "N/A"
            ]
            for row in rows
        ]
        
        print(tabulate(data, headers=headers, tablefmt='grid'))
        print()

def check_specific_user_data(user_id: int):
    """Show detailed data for a specific user"""
    print("=" * 80)
    print(f"🔍 Detailed Data for User ID: {user_id}")
    print("=" * 80)
    print()
    
    # User info
    user_query = "SELECT id, email, name, plan FROM users WHERE id = :user_id"
    
    with engine.connect() as conn:
        result = conn.execute(text(user_query), {"user_id": user_id})
        user = result.fetchone()
        
        if not user:
            print(f"❌ User {user_id} not found")
            return
        
        print(f"User: {user.name} ({user.email})")
        print(f"Plan: {user.plan}")
        print()
        
        # Exam history
        exam_query = """
            SELECT company, category, score, total_questions, score_percent, exam_date
            FROM aptitude_exam_history
            WHERE user_id = :user_id
            ORDER BY exam_date DESC
            LIMIT 10
        """
        
        result = conn.execute(text(exam_query), {"user_id": user_id})
        exams = result.fetchall()
        
        if exams:
            print(f"📝 Recent Exams ({len(exams)}):")
            headers = ['Company', 'Category', 'Score', 'Total', 'Percent', 'Date']
            data = [
                [
                    exam.company,
                    exam.category,
                    exam.score,
                    exam.total_questions,
                    f"{float(exam.score_percent):.1f}%",
                    str(exam.exam_date)[:19]
                ]
                for exam in exams
            ]
            print(tabulate(data, headers=headers, tablefmt='grid'))
        else:
            print("No exam history")
        print()

def verify_isolation():
    """Verify that no queries are missing user_id filter"""
    print("=" * 80)
    print("🔒 Verifying Data Isolation")
    print("=" * 80)
    print()
    
    # Check if any exam history has NULL user_id
    query = """
        SELECT COUNT(*) as count
        FROM aptitude_exam_history
        WHERE user_id IS NULL
    """
    
    with engine.connect() as conn:
        result = conn.execute(text(query))
        null_count = result.scalar()
        
        if null_count > 0:
            print(f"⚠️  WARNING: {null_count} exam records have NULL user_id")
            print("   These records are orphaned and should be cleaned up")
        else:
            print("✅ All exam records have valid user_id")
        print()
        
        # Check for duplicate data across users
        dup_query = """
            SELECT 
                e1.user_id as user1,
                e2.user_id as user2,
                COUNT(*) as shared_exams
            FROM aptitude_exam_history e1
            JOIN aptitude_exam_history e2 
                ON e1.company = e2.company 
                AND e1.exam_date = e2.exam_date
                AND e1.score = e2.score
                AND e1.user_id < e2.user_id
            GROUP BY e1.user_id, e2.user_id
            HAVING COUNT(*) > 3
        """
        
        result = conn.execute(text(dup_query))
        dups = result.fetchall()
        
        if dups:
            print(f"⚠️  WARNING: Found {len(dups)} pairs of users with suspiciously similar data")
            for dup in dups:
                print(f"   Users {dup.user1} and {dup.user2}: {dup.shared_exams} identical exams")
        else:
            print("✅ No suspicious data sharing detected")
        print()

def main():
    print()
    check_users()
    check_exam_history()
    verify_isolation()
    
    print("=" * 80)
    print("💡 Tips")
    print("=" * 80)
    print()
    print("To check specific user data:")
    print("  python3 check_user_data.py --user-id 123")
    print()
    print("To verify a user's isolation:")
    print("  1. Note their user_id from the users table")
    print("  2. Check their exam history only shows their user_id")
    print("  3. Verify other users don't see this data")
    print()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 2 and sys.argv[1] == "--user-id":
        try:
            user_id = int(sys.argv[2])
            check_specific_user_data(user_id)
        except ValueError:
            print("❌ Invalid user_id. Must be a number.")
    else:
        main()
