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
        
        if 'photosynthesis' in user_message:
            return """Photosynthesis is the process by which plants convert light energy into chemical energy.

**Key Points:**
1. Takes place in chloroplasts
2. Requires sunlight, water, and CO2
3. Produces glucose and oxygen
4. Formula: 6CO2 + 6H2O + light → C6H12O6 + 6O2

**Two Stages:**
- Light-dependent reactions (in thylakoids)
- Light-independent reactions/Calvin cycle (in stroma)

Would you like me to explain any specific aspect in more detail?"""
        
        elif 'derivative' in user_message or 'calculus' in user_message:
            return """Derivatives measure the rate of change of a function.

**Basic Rules:**
- Power Rule: d/dx(x^n) = nx^(n-1)
- Product Rule: d/dx(uv) = u'v + uv'
- Chain Rule: d/dx(f(g(x))) = f'(g(x)) × g'(x)

**Example:**
If f(x) = x², then f'(x) = 2x

Need help with a specific derivative problem?"""
        
        else:
            return f"""I understand you're asking about: {messages[-1]['content']}

I'm here to help! While I'm running in demo mode, in production I would provide:
- Detailed explanations
- Step-by-step solutions
- Practice problems
- Visual aids when helpful

For a fully functional experience, please configure the OpenAI or Anthropic API keys in the backend .env file.

What else would you like to know?"""
    
    def explain_topic(self, topic: str, subject: str, level: str) -> Dict:
        """Generate topic explanation"""
        return {
            "explanation": f"""**{topic}** in {subject}

This is a demo response. In production with real API keys, I would provide:

📚 **Concept Overview**
A clear, {level}-level explanation of {topic}

🔑 **Key Points**
- Main concepts broken down
- Important formulas or principles
- Real-world applications

💡 **Examples**
Practical examples to illustrate the concept

✍️ **Practice**
Questions to test understanding

Configure OpenAI/Anthropic API keys for full AI-powered explanations!""",
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
        for i in range(min(num_questions, 5)):  # Demo: max 5 questions
            questions.append({
                "id": i + 1,
                "question": f"[Demo] Sample {difficulty} question {i+1} on {topic}",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": 0,
                "explanation": "This is a demo question. Real questions would be generated with AI."
            })
        
        return {
            "subject": subject,
            "topic": topic,
            "difficulty": difficulty,
            "questions": questions,
            "totalQuestions": len(questions),
            "timeLimit": num_questions * 2,  # 2 mins per question
            "note": "Demo mode - Configure AI API for real question generation"
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
        """Generate personalized study plan"""
        return {
            "examDate": exam_date,
            "subjects": subjects,
            "plan": f"""📅 **Personalized Study Plan**

**Target Exam Date:** {exam_date}
**Subjects:** {', '.join(subjects)}

[Demo] A detailed week-by-week study plan would be generated here covering:
- Daily study schedules
- Topic allocation
- Revision periods
- Mock test schedules
- Break times

**Week 1:** Foundation building
**Week 2:** Advanced concepts
**Week 3:** Practice & Mock tests
**Week 4:** Revision & final prep

*Configure AI API keys for personalized study plans*""",
            "totalWeeks": 4,
            "dailyHours": 6
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
        """Provide project guidance"""
        return {
            "projectType": project_type,
            "techStack": tech_stack,
            "guidance": f"""🚀 **Project Guide: {project_type}**

**Tech Stack:** {', '.join(tech_stack)}

[Demo] A comprehensive project guide would include:

**1. Project Structure**
- Folder organization
- File naming conventions

**2. Core Features**
- Must-have features
- Nice-to-have features

**3. Implementation Steps**
- Phase 1: Setup & Basic features
- Phase 2: Core functionality
- Phase 3: Advanced features
- Phase 4: Testing & deployment

**4. Best Practices**
- Code organization
- Security considerations
- Performance optimization

*Enable AI for detailed project roadmaps*""",
            "estimatedTime": "2-4 weeks",
            "difficulty": "intermediate"
        }
    
    def analyze_resume(self, resume_text: str) -> Dict:
        """Analyze resume for ATS and quality"""
        return {
            "atsScore": 75,
            "overallScore": 80,
            "strengths": [
                "[Demo] Clear work experience section",
                "[Demo] Good use of action verbs",
                "[Demo] Quantified achievements"
            ],
            "improvements": [
                "[Demo] Add more keywords related to target role",
                "[Demo] Include technical skills section",
                "[Demo] Optimize for ATS scanning"
            ],
            "keywords": ["Python", "JavaScript", "Project Management", "Team Leadership"],
            "missingKeywords": ["Cloud", "DevOps", "Agile"],
            "note": "Demo analysis - Configure AI for detailed resume feedback"
        }
    
    def interview_prep(self, company: str, role: str) -> Dict:
        """Generate interview preparation material"""
        return {
            "company": company,
            "role": role,
            "preparation": f"""🎯 **Interview Prep: {role} at {company}**

[Demo Mode] Complete prep material would include:

**1. Company Research**
- Company culture and values
- Recent news and projects
- Interview process specifics

**2. Common Questions**
- Technical questions
- Behavioral questions
- Role-specific questions

**3. Technical Topics**
- Core concepts to review
- Common algorithms
- System design (if applicable)

**4. Tips**
- Dress code
- Questions to ask
- Salary negotiation

*Enable AI APIs for company-specific interview prep*""",
            "commonQuestions": [
                f"[Demo] Tell me about yourself and why {company}?",
                "[Demo] Describe a challenging project you worked on",
                "[Demo] How do you handle tight deadlines?"
            ],
            "technicalTopics": ["Data Structures", "Algorithms", "System Design", "OOP Concepts"]
        }

# Singleton instance
ai_service = AIService()
