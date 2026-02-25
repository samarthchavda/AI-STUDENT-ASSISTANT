"""
AI Service - Handles all AI-related functionality
Uses OpenAI/Anthropic APIs for generating responses

NOTE: This uses demo/placeholder AI responses since API keys are demo keys.
In production, replace with real API keys and uncomment the actual API calls.
"""

from typing import List, Dict
import json

class AIService:
    def __init__(self):
        # In production, initialize with real API clients
        # self.openai_client = OpenAI(api_key=settings.openai_api_key)
        # self.anthropic_client = Anthropic(api_key=settings.anthropic_api_key)
        pass
    
    def chat_completion(self, messages: List[Dict]) -> str:
        """
        Generate chat completion response
        In production, use: openai.chat.completions.create() or anthropic.messages.create()
        """
        
        # Demo response - replace with actual API call
        user_message = messages[-1]['content'].lower()
        
        # Engineering-specific responses
        if 'dsa' in user_message or 'data structure' in user_message:
            return """**Data Structures & Algorithms for Placements**

Essential DSA topics for campus placements:

**Must-Know Data Structures:**
1. Arrays & Strings
2. Linked Lists (Single, Double, Circular)
3. Stacks & Queues
4. Trees (Binary, BST, AVL)
5. Graphs (BFS, DFS, Dijkstra)
6. Hash Tables
7. Heaps

**Key Algorithms:**
- Sorting: Quick, Merge, Heap Sort
- Searching: Binary Search, DFS, BFS
- Dynamic Programming
- Greedy Algorithms
- Backtracking

**Practice Plan:**
- Week 1-2: Arrays, Strings, Linked Lists
- Week 3-4: Trees, Graphs
- Week 5-6: DP, Greedy
- Week 7-8: Mock interviews

Companies like TCS, Infosys focus on basic DSA. Product companies (Google, Amazon) need advanced DSA.

Need help with a specific topic?"""
        
        elif 'resume' in user_message or 'cv' in user_message:
            return """**Resume Tips for Engineering Students**

**Essential Sections:**
1. **Contact Info**: Email, Phone, LinkedIn, GitHub
2. **Education**: College, Branch, CGPA, Year
3. **Technical Skills**: Languages, Frameworks, Tools, Databases
4. **Projects**: 2-3 strong projects with tech stack
5. **Internships/Experience**: If any
6. **Achievements**: Hackathons, Certifications, Competitions

**ATS Optimization:**
- Use keywords from job description
- Avoid tables, images, graphics
- Use standard fonts (Arial, Calibri)
- Save as PDF
- File name: FirstName_LastName_Resume.pdf

**For Freshers:**
- Focus on projects and skills
- Include academic projects
- Mention relevant coursework
- Add GitHub profile link

**Common Mistakes:**
❌ Spelling/grammar errors
❌ Too long (keep it 1 page)
❌ Irrelevant information
❌ No quantifiable achievements

Want me to review your resume?"""
        
        elif 'interview' in user_message or 'placement' in user_message:
            return """**Campus Placement Interview Preparation**

**Interview Rounds:**

**1. Aptitude Test**
- Quantitative Aptitude
- Logical Reasoning
- Verbal Ability
- Technical MCQs

**2. Technical Round**
- DSA coding questions (2-3 problems)
- Core CS subjects (OS, DBMS, Networks, OOP)
- Project discussion
- Puzzle solving

**3. HR Round**
- Tell me about yourself
- Why this company?
- Strengths & weaknesses
- Career goals
- Salary expectations

**Preparation Timeline (3 months):**
- Month 1: DSA basics + Core subjects
- Month 2: Advanced DSA + Projects
- Month 3: Mock interviews + Company prep

**Top Companies & Their Focus:**
- **TCS/Infosys/Wipro**: Aptitude + Basic coding
- **Amazon/Microsoft**: Advanced DSA + System design
- **Google/Meta**: Hard DSA + Problem solving
- **Startups**: Full-stack projects + Practical skills

Which round do you want to prepare for?"""
        
        elif 'project' in user_message:
            return """**Placement-Worthy Projects for Engineering Students**

**For CSE/IT Students:**

**1. Full-Stack Web App** (Recommended)
- E-commerce platform
- Social media clone
- Task management system
- Tech: React + Node.js + MongoDB

**2. Mobile App**
- Expense tracker
- Food delivery app
- Chat application
- Tech: React Native / Flutter

**3. Machine Learning Project**
- Recommendation system
- Image classification
- Sentiment analysis
- Tech: Python + TensorFlow/PyTorch

**4. DevOps Project**
- CI/CD pipeline
- Container orchestration
- Monitoring dashboard
- Tech: Docker + Kubernetes + Jenkins

**Project Checklist:**
✅ Deployed and live (Heroku, Vercel, AWS)
✅ GitHub repo with good README
✅ Clean, documented code
✅ Solves a real problem
✅ Scalable architecture

**For ECE/EE Students:**
- IoT projects (Smart home, Weather station)
- Embedded systems
- Signal processing applications
- Arduino/Raspberry Pi projects

Need help choosing a project?"""
        
        elif 'company' in user_message or 'tcs' in user_message or 'infosys' in user_message:
            return """**Top Companies for Engineering Placements**

**Service-Based (Mass Recruiters):**
- **TCS**: 3.5-7 LPA, Easy aptitude + Basic coding
- **Infosys**: 3.5-6 LPA, Aptitude + Coding + Puzzle
- **Wipro**: 3.5-6 LPA, Technical MCQ + Coding
- **Cognizant**: 4-6 LPA, Aptitude + Technical
- **Accenture**: 4.5-7 LPA, Aptitude + Communication

**Product-Based:**
- **Amazon**: 28-44 LPA, Hard DSA + System design
- **Microsoft**: 30-42 LPA, DSA + Problem solving
- **Google**: 35-50 LPA, Very hard DSA + Algorithms
- **Adobe**: 25-35 LPA, DSA + Core CS
- **Flipkart**: 20-30 LPA, DSA + LLD/HLD

**Indian Startups:**
- **Zomato/Swiggy**: 12-20 LPA
- **Paytm/PhonePe**: 15-25 LPA
- **CRED/Razorpay**: 18-30 LPA

**Preparation Strategy:**
- Service-based: Focus on aptitude + basic coding
- Product-based: Master DSA + system design
- Startups: Build strong projects + full-stack skills

Which company are you targeting?"""
        
        else:
            return f"""**CodeCampus AI - Your Placement Preparation Assistant**

I'm here to help engineering students with:

🎯 **Placement Roadmap**
- Personalized 3-month preparation plan
- Daily study schedule
- Skills to focus on

📄 **Resume Building**
- ATS-friendly resume tips
- Project suggestions
- Keyword optimization

💻 **DSA & Coding**
- Data structures practice
- Algorithm explanations
- Coding interview prep

🎤 **Mock Interviews**
- Company-specific questions
- HR round preparation
- Technical interview tips

📚 **Core Subjects**
- OS, DBMS, Networks, OOP
- Important topics for interviews
- Quick revision notes

**Your Question:** {messages[-1]['content']}

I'm in demo mode. For AI-powered personalized responses, configure OpenAI/Anthropic API keys.

What would you like help with today?"""
    
    def explain_topic(self, topic: str, subject: str, level: str) -> Dict:
        """Generate topic explanation"""
        return {
            "explanation": f"""**{topic}** - {subject} (For Placement Interviews)

📚 **Concept Overview**
{topic} is frequently asked in {subject} interviews for campus placements.

🎯 **Why It's Important for Placements:**
- Asked by: TCS, Infosys, Wipro, Amazon, Microsoft
- Difficulty: {level}
- Interview frequency: High

🔑 **Key Points to Remember:**
1. Core concept and definition
2. Real-world applications in software
3. Time/space complexity (if applicable)
4. Common interview questions

💡 **Interview Questions on {topic}:**
- Explain {topic} with an example
- Difference between {topic} and related concepts
- Implement {topic} in your preferred language
- Where would you use {topic} in a project?

✍️ **Practice Problems:**
- LeetCode/GeeksforGeeks problems on {topic}
- Company-specific questions

**Companies that ask this:**
Service-based: ⭐⭐⭐
Product-based: ⭐⭐⭐⭐⭐

*Configure AI API keys for detailed explanations with code examples!*""",
            "difficulty": level,
            "estimatedTime": "15-20 minutes"
        }
    
    def generate_notes(self, topic: str, format: str) -> Dict:
        """Generate study notes"""
        return {
            "notes": f"""# {topic} - Study Notes

## Summary
[Demo Mode] Comprehensive notes on {topic} would be generated here.

## Key Concepts
1. Concept 1
2. Concept 2
3. Concept 3

## Important Points
- Point 1
- Point 2
- Point 3

*Configure AI API keys for full note generation capability*""",
            "format": format,
            "wordCount": 250
        }
    
    def solve_doubt(self, question: str, subject: str = None) -> Dict:
        """Solve student doubt"""
        return {
            "answer": f"""**Question:** {question}

**Answer:** [Demo Mode]

In production, I would provide:
- Step-by-step solution
- Multiple approaches
- Visual explanations
- Related concepts
- Practice problems

Please add your OpenAI API key to get full AI-powered doubt solving!""",
            "subject": subject,
            "confidence": 0.95
        }
    
    def generate_mock_test(self, subject: str, topic: str, difficulty: str, num_questions: int) -> Dict:
        """Generate mock test"""
        questions = []
        
        # Engineering placement-focused questions
        sample_questions = [
            {
                "id": 1,
                "question": f"[Demo] Which data structure is best for implementing LRU Cache?",
                "options": ["Array", "Linked List", "Hash Map + Doubly Linked List", "Stack"],
                "correctAnswer": 2,
                "explanation": "Hash Map + Doubly Linked List provides O(1) for both get and put operations."
            },
            {
                "id": 2,
                "question": f"[Demo] What is the time complexity of Binary Search?",
                "options": ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
                "correctAnswer": 1,
                "explanation": "Binary Search divides the search space in half each time, resulting in O(log n)."
            },
            {
                "id": 3,
                "question": f"[Demo] Which company asks maximum DSA questions in placements?",
                "options": ["TCS", "Infosys", "Amazon", "Wipro"],
                "correctAnswer": 2,
                "explanation": "Amazon is known for asking hard DSA questions in campus placements."
            },
            {
                "id": 4,
                "question": f"[Demo] What is the best way to prepare for service-based company interviews?",
                "options": ["Only DSA", "Aptitude + Basic Coding", "System Design", "Projects only"],
                "correctAnswer": 1,
                "explanation": "Service-based companies focus on aptitude and basic coding skills."
            },
            {
                "id": 5,
                "question": f"[Demo] Which sorting algorithm is most efficient for large datasets?",
                "options": ["Bubble Sort", "Merge Sort", "Selection Sort", "Insertion Sort"],
                "correctAnswer": 1,
                "explanation": "Merge Sort has O(n log n) time complexity and is stable."
            }
        ]
        
        for i in range(min(num_questions, 5)):
            questions.append(sample_questions[i])
        
        return {
            "subject": subject,
            "topic": topic,
            "difficulty": difficulty,
            "questions": questions,
            "totalQuestions": len(questions),
            "timeLimit": num_questions * 2,
            "note": "Demo placement-focused questions. Configure AI API for company-specific mock tests.",
            "companies": ["TCS", "Infosys", "Amazon", "Microsoft", "Wipro"]
        }
    
    def solve_previous_year(self, question: str, subject: str) -> Dict:
        """Solve previous year question"""
        return {
            "question": question,
            "solution": f"""**Detailed Solution:**

[Demo Mode] A comprehensive solution would be provided here with:
- Step-by-step breakdown
- Key formulas used
- Common mistakes to avoid
- Exam tips

**Subject:** {subject}

*Enable AI APIs for complete solutions*""",
            "difficulty": "medium",
            "timeToSolve": "5-10 minutes"
        }
    
    def generate_study_plan(self, exam_date: str, subjects: List[str]) -> Dict:
        """Generate personalized placement preparation plan"""
        return {
            "examDate": exam_date,
            "subjects": subjects,
            "plan": f"""📅 **3-Month Placement Preparation Roadmap**

**Target Date:** {exam_date}
**Focus Areas:** {', '.join(subjects)}

**Month 1: Foundation Building**
- **Week 1-2**: DSA Basics
  - Arrays, Strings, Linked Lists
  - Basic sorting and searching
  - Practice: 2-3 problems daily on LeetCode
  
- **Week 3-4**: Core CS Subjects
  - Operating Systems (Process, Threads, Memory)
  - DBMS (SQL queries, Normalization, Transactions)
  - 1 hour theory + 1 hour coding daily

**Month 2: Advanced Topics & Projects**
- **Week 5-6**: Advanced DSA
  - Trees, Graphs, Dynamic Programming
  - Practice: 3-4 medium problems daily
  
- **Week 7-8**: Projects & Resume
  - Build 1-2 placement-worthy projects
  - Update resume with ATS optimization
  - Create GitHub portfolio

**Month 3: Company Prep & Mock Interviews**
- **Week 9-10**: Company-Specific Preparation
  - TCS/Infosys: Aptitude + Basic coding
  - Amazon/Microsoft: Hard DSA problems
  - Practice previous year questions
  
- **Week 11-12**: Mock Interviews & Revision
  - Daily mock interviews
  - Revise weak areas
  - HR round preparation
  - Final resume polish

**Daily Schedule:**
- 6:00 AM - 8:00 AM: DSA Practice
- 9:00 AM - 12:00 PM: Core subjects
- 2:00 PM - 5:00 PM: Projects/Coding
- 6:00 PM - 8:00 PM: Aptitude/Mock tests
- 9:00 PM - 10:00 PM: Revision

**Target Companies:**
- Service: TCS, Infosys, Wipro, Cognizant
- Product: Amazon, Microsoft, Adobe
- Startups: Zomato, Paytm, Razorpay

*Configure AI API keys for personalized day-by-day plans based on your branch and target role!*""",
            "totalWeeks": 12,
            "dailyHours": 8,
            "targetCompanies": ["TCS", "Infosys", "Amazon", "Microsoft"]
        }
    
    def explain_code(self, code: str, language: str, task: str) -> Dict:
        """Explain, debug, or optimize code"""
        return {
            "original": code,
            "language": language,
            "task": task,
            "result": f"""**Code Analysis ({task})**

[Demo Mode] With real AI APIs, I would provide:

**For 'explain':**
- Line-by-line explanation
- Time/space complexity
- Best practices analysis

**For 'debug':**
- Error identification
- Fix suggestions
- Corrected code

**For 'optimize':**
- Performance improvements
- Memory optimization
- Cleaner code structure

*Enable AI APIs for full code analysis*""",
            "suggestions": ["Add error handling", "Consider edge cases", "Use meaningful variable names"]
        }
    
    def dsa_hint(self, problem: str) -> Dict:
        """Provide DSA problem hints"""
        return {
            "problem": problem,
            "hints": [
                "[Demo] Think about the data structure that best fits this problem",
                "[Demo] Consider the time complexity requirements",
                "[Demo] Break down the problem into smaller subproblems"
            ],
            "approach": "Demo approach - Real hints would guide without giving away the solution",
            "complexity": {
                "time": "O(n)",
                "space": "O(1)"
            },
            "note": "Configure AI APIs for intelligent DSA hints"
        }
    
    def project_guidance(self, project_type: str, tech_stack: List[str]) -> Dict:
        """Provide placement-worthy project guidance for engineering students"""
        return {
            "projectType": project_type,
            "techStack": tech_stack,
            "guidance": f"""🚀 **Placement-Worthy Project Guide: {project_type}**

**Tech Stack:** {', '.join(tech_stack)}

**Why This Project for Placements:**
- Demonstrates full-stack skills
- Shows problem-solving ability
- Impressive for resume
- Good talking point in interviews

**Project Structure:**

**1. Frontend** (if applicable)
```
/src
  /components  - Reusable UI components
  /pages       - Main pages
  /services    - API calls
  /utils       - Helper functions
```

**2. Backend**
```
/routes      - API endpoints
/models      - Database schemas
/controllers - Business logic
/middleware  - Auth, validation
```

**3. Database**
- Schema design
- Relationships
- Indexing for performance

**Core Features to Implement:**

**Phase 1: MVP (Week 1-2)**
- User authentication (JWT)
- Basic CRUD operations
- Database setup
- API endpoints

**Phase 2: Core Features (Week 3-4)**
- Main functionality
- Data validation
- Error handling
- Basic UI/UX

**Phase 3: Advanced Features (Week 5-6)**
- Search/Filter functionality
- Pagination
- File upload (if needed)
- Real-time updates (Socket.io)

**Phase 4: Polish (Week 7-8)**
- Responsive design
- Loading states
- Error messages
- Testing
- Deployment

**Deployment Checklist:**
✅ Deploy backend (Heroku/Railway/Render)
✅ Deploy frontend (Vercel/Netlify)
✅ Set up database (MongoDB Atlas/PostgreSQL)
✅ Configure environment variables
✅ Add custom domain (optional)
✅ SSL certificate (HTTPS)

**GitHub Best Practices:**
- Clear README with screenshots
- Setup instructions
- Tech stack mentioned
- Live demo link
- API documentation
- Clean commit history

**Resume Points:**
- "Developed {project_type} using {', '.join(tech_stack[:3])}"
- "Implemented authentication with JWT and bcrypt"
- "Deployed on cloud with 99.9% uptime"
- "Optimized database queries, reduced load time by 40%"

**Interview Talking Points:**
1. Why you chose this project
2. Challenges faced and solutions
3. Architecture decisions
4. Scalability considerations
5. Future improvements

**Companies That Value This:**
- Service-based: ⭐⭐⭐⭐
- Product-based: ⭐⭐⭐⭐⭐
- Startups: ⭐⭐⭐⭐⭐

**Similar Projects to Explore:**
- E-commerce platform
- Social media clone
- Task management system
- Chat application
- Blog platform with CMS

*Enable AI for step-by-step implementation guide with code examples!*""",
            "estimatedTime": "6-8 weeks",
            "difficulty": "intermediate",
            "placementValue": "High",
            "companiesThatAsk": ["Amazon", "Microsoft", "Flipkart", "Startups"]
        }
    
    def analyze_resume(self, resume_text: str) -> Dict:
        """Analyze resume for ATS and placement readiness"""
        return {
            "atsScore": 72,
            "overallScore": 78,
            "placementReadiness": "Good - Needs minor improvements",
            "strengths": [
                "✅ Technical skills section present",
                "✅ Projects with tech stack mentioned",
                "✅ GitHub profile linked",
                "✅ Clean formatting, ATS-friendly"
            ],
            "improvements": [
                "❌ Add more action verbs (Developed, Implemented, Optimized)",
                "❌ Quantify achievements (Improved performance by 40%)",
                "❌ Add relevant coursework for freshers",
                "❌ Include certifications (if any)",
                "❌ Optimize keywords for target role"
            ],
            "keywords": ["Python", "JavaScript", "React", "Node.js", "MongoDB", "Git"],
            "missingKeywords": ["DSA", "System Design", "AWS", "Docker", "REST API"],
            "sections": {
                "contact": "✅ Present",
                "education": "✅ Present",
                "skills": "✅ Present",
                "projects": "✅ Present (2 projects)",
                "experience": "⚠️ Missing (Add internships if any)",
                "achievements": "⚠️ Missing (Add hackathons, certifications)"
            },
            "companyFit": {
                "TCS/Infosys": "85% - Good fit",
                "Amazon/Microsoft": "65% - Needs more DSA projects",
                "Startups": "75% - Good projects, add more tech stack"
            },
            "recommendations": [
                "Add a project on DSA (Sorting Visualizer, Graph Algorithms)",
                "Include LeetCode/GeeksforGeeks profile",
                "Add any online certifications (Coursera, Udemy)",
                "Mention CGPA if above 7.5",
                "Add LinkedIn profile link"
            ],
            "note": "Demo analysis for engineering placement. Configure AI for detailed ATS optimization!"
        }
    
    def interview_prep(self, company: str, role: str) -> Dict:
        """Generate company-specific interview preparation for placements"""
        
        # Company-specific data
        company_data = {
            "TCS": {
                "package": "3.5-7 LPA",
                "difficulty": "Easy to Medium",
                "rounds": ["Aptitude Test", "Technical Interview", "HR Round"],
                "focus": "Aptitude, Basic Coding, Communication"
            },
            "Infosys": {
                "package": "3.5-6 LPA",
                "difficulty": "Easy to Medium",
                "rounds": ["Aptitude + Coding", "Technical Interview", "HR Round"],
                "focus": "Aptitude, Puzzles, Basic DSA"
            },
            "Amazon": {
                "package": "28-44 LPA",
                "difficulty": "Hard",
                "rounds": ["Online Assessment", "Technical Round 1", "Technical Round 2", "Bar Raiser", "HR"],
                "focus": "Hard DSA, System Design, Leadership Principles"
            },
            "Microsoft": {
                "package": "30-42 LPA",
                "difficulty": "Hard",
                "rounds": ["Online Coding", "Technical Round 1", "Technical Round 2", "AA/AS Round"],
                "focus": "DSA, Problem Solving, System Design"
            }
        }
        
        company_info = company_data.get(company, {
            "package": "Varies",
            "difficulty": "Medium",
            "rounds": ["Aptitude", "Technical", "HR"],
            "focus": "DSA, Core CS, Projects"
        })
        
        return {
            "company": company,
            "role": role,
            "package": company_info.get("package", "Varies"),
            "difficulty": company_info.get("difficulty", "Medium"),
            "preparation": f"""🎯 **{company} Placement Interview Prep - {role}**

**Company Overview:**
- Package: {company_info.get('package')}
- Difficulty: {company_info.get('difficulty')}
- Focus Areas: {company_info.get('focus')}

**Interview Process:**
{chr(10).join(f"{i+1}. {round}" for i, round in enumerate(company_info.get('rounds', [])))}

**Preparation Strategy:**

**For Service-Based (TCS/Infosys/Wipro):**
1. **Aptitude (60% weightage)**
   - Quantitative: Time & Work, Profit & Loss, Percentages
   - Logical: Puzzles, Series, Blood Relations
   - Verbal: Reading Comprehension, Grammar

2. **Coding (30% weightage)**
   - Basic DSA: Arrays, Strings, Loops
   - Pattern printing
   - Simple algorithms

3. **HR Round (10% weightage)**
   - Tell me about yourself
   - Why {company}?
   - Strengths and weaknesses

**For Product-Based (Amazon/Microsoft/Google):**
1. **DSA (70% weightage)**
   - Arrays, Strings, Trees, Graphs
   - Dynamic Programming
   - System Design (for experienced)

2. **Problem Solving (20% weightage)**
   - LeetCode Medium/Hard
   - Optimal solutions
   - Time/Space complexity

3. **Behavioral (10% weightage)**
   - STAR method
   - Leadership principles
   - Past projects

**Timeline:**
- 1 month before: Focus on weak areas
- 2 weeks before: Company-specific practice
- 1 week before: Mock interviews
- 1 day before: Revision + Rest

*Enable AI APIs for detailed company-specific question banks!*""",
            "commonQuestions": [
                f"Why do you want to join {company}?",
                f"Tell me about a challenging project you worked on",
                f"Explain {role} and your interest in it",
                "What are your strengths and weaknesses?",
                "Where do you see yourself in 5 years?",
                "Why should we hire you?",
                "Do you have any questions for us?"
            ],
            "technicalTopics": [
                "Data Structures & Algorithms",
                "Operating Systems (Process, Threads, Memory Management)",
                "Database Management (SQL, Normalization, Transactions)",
                "Computer Networks (OSI Model, TCP/IP, HTTP)",
                "Object-Oriented Programming",
                "System Design (for senior roles)"
            ],
            "codingQuestions": [
                "[Demo] Reverse a linked list",
                "[Demo] Find the longest substring without repeating characters",
                "[Demo] Implement LRU Cache",
                "[Demo] Binary tree level order traversal",
                "[Demo] Detect cycle in a graph"
            ],
            "tips": [
                f"Research {company}'s recent projects and news",
                "Prepare 2-3 projects to discuss in detail",
                "Practice coding on whiteboard/paper",
                "Dress formally for interviews",
                "Prepare questions to ask the interviewer",
                "Be honest about what you don't know"
            ]
        }

# Singleton instance
ai_service = AIService()
