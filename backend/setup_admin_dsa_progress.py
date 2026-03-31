"""
Setup DSA progress for admin user - Show 90% completion on leaderboard
"""
import psycopg2
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import random

load_dotenv()

def setup_admin_progress():
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ DATABASE_URL not found")
        return
    
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        print("🔄 Setting up admin DSA progress...")
        
        # Get admin user
        cursor.execute("SELECT id FROM users WHERE email = 'chavdasamarth007@gmail.com'")
        admin = cursor.fetchone()
        
        if not admin:
            print("❌ Admin user not found")
            return
        
        admin_id = admin[0]
        print(f"✅ Found admin user (ID: {admin_id})")
        
        # Get all DSA problems
        cursor.execute("SELECT id, topic, difficulty FROM dsa_problems ORDER BY id")
        all_problems = cursor.fetchall()
        total_problems = len(all_problems)
        
        print(f"📊 Total DSA problems: {total_problems}")
        
        # Calculate 90% (320 problems)
        problems_to_solve = int(total_problems * 0.9)
        print(f"🎯 Target: {problems_to_solve} problems (90%)")
        
        # Select random 320 problems
        problems_to_add = random.sample(all_problems, problems_to_solve)
        
        # Count by difficulty
        easy_count = sum(1 for p in problems_to_add if p[2] == 'EASY')
        medium_count = sum(1 for p in problems_to_add if p[2] == 'MEDIUM')
        hard_count = sum(1 for p in problems_to_add if p[2] == 'HARD')
        
        print(f"\n📈 Distribution:")
        print(f"   Easy: {easy_count}")
        print(f"   Medium: {medium_count}")
        print(f"   Hard: {hard_count}")
        
        # Clear existing progress
        cursor.execute("DELETE FROM dsa_progress WHERE user_id = %s", (admin_id,))
        cursor.execute("DELETE FROM dsa_submissions WHERE user_id = %s", (admin_id,))
        print(f"\n🧹 Cleared existing progress")
        
        # Add progress records
        print(f"\n⏳ Adding {problems_to_solve} solved problems...")
        
        base_date = datetime.now() - timedelta(days=90)
        
        for idx, (problem_id, topic, difficulty) in enumerate(problems_to_add):
            # Random date within last 90 days
            days_offset = random.randint(0, 90)
            solved_date = base_date + timedelta(days=days_offset)
            
            # Add progress
            cursor.execute("""
                INSERT INTO dsa_progress (
                    user_id, problem_id, topic, difficulty, status,
                    attempts, best_score, hints_used, time_spent,
                    first_attempted_at, last_attempted_at, solved_at
                ) VALUES (%s, %s, %s, %s, 'solved', %s, %s, 0, %s, %s, %s, %s)
            """, (
                admin_id, problem_id, topic, difficulty,
                random.randint(1, 3),  # attempts
                random.randint(85, 100),  # best_score
                random.randint(300, 1800),  # time_spent (5-30 mins)
                solved_date, solved_date, solved_date
            ))
            
            # Add successful submission
            cursor.execute("""
                INSERT INTO dsa_submissions (
                    user_id, problem_id, code, language, status,
                    execution_time, memory_used, test_cases_passed,
                    total_test_cases, score, created_at
                ) VALUES (%s, %s, %s, 'PYTHON', 'ACCEPTED', %s, %s, 10, 10, %s, %s)
            """, (
                admin_id, problem_id,
                '# Solution code',
                random.randint(50, 500),  # execution_time
                random.randint(1000, 5000),  # memory_used
                random.randint(85, 100),  # score
                solved_date
            ))
            
            if (idx + 1) % 50 == 0:
                print(f"   ✅ Added {idx + 1}/{problems_to_solve} problems")
        
        print(f"   ✅ Added all {problems_to_solve} problems")
        
        # Update or create user stats
        cursor.execute("DELETE FROM dsa_user_stats WHERE user_id = %s", (admin_id,))
        
        total_score = problems_to_solve * 90  # Average 90 score per problem
        accuracy = 95  # 95% accuracy
        
        cursor.execute("""
            INSERT INTO dsa_user_stats (
                user_id, total_solved, easy_solved, medium_solved, hard_solved,
                total_attempts, accuracy, total_score, streak_days,
                last_solved_date, rank
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1)
        """, (
            admin_id, problems_to_solve, easy_count, medium_count, hard_count,
            problems_to_solve + 50,  # total_attempts (some failed)
            accuracy, total_score, 45,  # 45 day streak
            datetime.now().date()
        ))
        
        conn.commit()
        
        print("\n" + "="*60)
        print("✅ Admin DSA progress setup completed!")
        print("="*60)
        print(f"\n📊 Stats:")
        print(f"   Total Solved: {problems_to_solve}/{total_problems} (90%)")
        print(f"   Easy: {easy_count}")
        print(f"   Medium: {medium_count}")
        print(f"   Hard: {hard_count}")
        print(f"   Accuracy: {accuracy}%")
        print(f"   Rank: #1")
        print(f"\n🏆 Chavda Samarth will now appear at the top of the leaderboard!")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        if conn:
            conn.rollback()

if __name__ == "__main__":
    setup_admin_progress()
