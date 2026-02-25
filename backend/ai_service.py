"""
AI Service - Handles all AI-related functionality using Google Gemini API
"""

from typing import List, Dict
import json
import google.generativeai as genai
from config import settings

class AIService:
    def __init__(self):
        # Initialize Gemini API
        if settings.gemini_api_key and settings.gemini_api_key != "your-gemini-api-key-here":
            genai.configure(api_key=settings.gemini_api_key)
            # Use gemini-flash-latest for fast responses
            self.model = genai.GenerativeModel('gemini-flash-latest')
            self.use_ai = True
            print("✅ Gemini AI initialized successfully")
        else:
            self.use_ai = False
            print("⚠️ Gemini API key not configured, using demo mode")
    
    def _generate_response(self, prompt: str) -> str:
        """Generate response using Gemini AI"""
        if not self.use_ai:
            return "[Demo Mode] Configure GEMINI_API_KEY in .env file to enable AI responses."
        
        try:
            # Set generation config
            generation_config = {
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 2048,
            }
            
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )
            return response.text
        except Exception as e:
            error_msg = str(e)
            print(f"Error generating AI response: {error_msg}")
            # Return a helpful error message instead of crashing
            return f"⚠️ AI service temporarily unavailable. Error: {error_msg[:100]}\n\nPlease try again in a moment."
    
    def chat_completion(self, messages: List[Dict]) -> str:
        """Generate chat completion response for engineering students"""
        user_message = messages[-1]['content']
        
        # Build context-aware prompt
        system_context = """You are CodeCampus AI, an expert placement preparation assistant for engineering students in India.

Your expertise:
- Campus placement preparation (TCS, Infosys, Wipro, Amazon, Microsoft, Google)
- Data Structures & Algorithms (DSA) for coding interviews
- Resume building with ATS optimization
- Mock interview preparation
- Company-specific interview tips
- Technical skills roadmap
- Core CS subjects (OS, DBMS, Networks, OOP)

Guidelines:
- Focus on placement preparation and career guidance
- Provide actionable, practical advice
- Include company names and package ranges when relevant
- Use Indian context (LPA, campus placements, service vs product companies)
- Be encouraging and supportive
- Format responses with emojis, bullet points, and clear sections
"""
        
        full_prompt = f"{system_context}\n\nStudent Question: {user_message}\n\nProvide a helpful, detailed response:"
        
        return self._generate_response(full_prompt)

    
    def explain_topic(self, topic: str, subject: str, level: str) -> Dict:
        """Generate topic explanation for placement preparation"""
        prompt = f"""Explain the topic "{topic}" from {subject} for engineering students preparing for campus placements.

Difficulty Level: {level}
Target Audience: Engineering students preparing for interviews

Include:
1. Clear concept explanation
2. Why it's important for placements
3. Which companies ask about this
4. Common interview questions
5. Key points to remember

Format the response for easy understanding."""

        explanation = self._generate_response(prompt)
        
        return {
            "explanation": explanation,
            "difficulty": level,
            "estimatedTime": "15-20 minutes"
        }
    
    def generate_notes(self, topic: str, format: str) -> Dict:
        """Generate study notes"""
        prompt = f"""Create comprehensive study notes on "{topic}" for engineering students.

Format: {format}
Include:
- Summary
- Key concepts
- Important formulas/algorithms
- Examples
- Practice questions
- Interview tips

Make it placement-focused and easy to revise."""

        notes = self._generate_response(prompt)
        
        return {
            "notes": notes,
            "format": format,
            "wordCount": len(notes.split())
        }
    
    def solve_doubt(self, question: str, subject: str = None) -> Dict:
        """Solve student doubt with detailed explanation"""
        prompt = f"""Answer this engineering student's question in detail:

Question: {question}
Subject: {subject or 'General'}

Provide:
1. Clear, step-by-step answer
2. Multiple approaches if applicable
3. Visual explanation if needed
4. Related concepts
5. Practice problems

Make it easy to understand for placement preparation."""

        answer = self._generate_response(prompt)
        
        return {
            "answer": answer,
            "subject": subject,
            "confidence": 0.95
        }
    
    def generate_mock_test(self, subject: str, topic: str, difficulty: str, num_questions: int) -> Dict:
        """Generate mock test questions for placement preparation"""
        prompt = f"""Generate {num_questions} multiple choice questions for campus placement preparation.

Subject: {subject}
Topic: {topic}
Difficulty: {difficulty}

For each question provide:
1. Question text
2. Four options (A, B, C, D)
3. Correct answer
4. Brief explanation

Focus on questions commonly asked by companies like TCS, Infosys, Amazon, Microsoft.

Return in JSON format:
{{
  "questions": [
    {{
      "id": 1,
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "..."
    }}
  ]
}}"""

        response = self._generate_response(prompt)
        
        # Try to parse JSON response
        try:
            # Extract JSON from response if it's wrapped in markdown
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
            else:
                json_str = response
            
            data = json.loads(json_str)
            questions = data.get("questions", [])
        except:
            # Fallback to demo questions if parsing fails
            questions = [
                {
                    "id": i+1,
                    "question": f"Sample question {i+1} on {topic}",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": 0,
                    "explanation": "This is a sample question."
                }
                for i in range(min(num_questions, 5))
            ]
        
        return {
            "subject": subject,
            "topic": topic,
            "difficulty": difficulty,
            "questions": questions,
            "totalQuestions": len(questions),
            "timeLimit": num_questions * 2,
            "companies": ["TCS", "Infosys", "Amazon", "Microsoft", "Wipro"]
        }
    
    def solve_previous_year(self, question: str, subject: str) -> Dict:
        """Solve previous year placement question"""
        prompt = f"""Solve this previous year placement question:

Subject: {subject}
Question: {question}

Provide:
1. Step-by-step solution
2. Key formulas/concepts used
3. Common mistakes to avoid
4. Time-saving tips
5. Similar questions for practice

Make it detailed and easy to understand."""

        solution = self._generate_response(prompt)
        
        return {
            "question": question,
            "solution": solution,
            "difficulty": "medium",
            "timeToSolve": "5-10 minutes"
        }

    
    def generate_study_plan(self, exam_date: str, subjects: List[str]) -> Dict:
        """Generate personalized placement preparation roadmap"""
        prompt = f"""Create a detailed 3-month placement preparation roadmap for an engineering student.

Target Date: {exam_date}
Subjects to Cover: {', '.join(subjects)}

Create a comprehensive plan including:
1. Month-wise breakdown
2. Week-wise topics
3. Daily schedule (hours per topic)
4. DSA practice plan
5. Project recommendations
6. Mock interview schedule
7. Company-specific preparation
8. Resume building timeline

Focus on:
- Service-based companies (TCS, Infosys, Wipro)
- Product-based companies (Amazon, Microsoft, Google)
- Core CS subjects
- Coding practice

Make it realistic and achievable for engineering students."""

        plan = self._generate_response(prompt)
        
        return {
            "examDate": exam_date,
            "subjects": subjects,
            "plan": plan,
            "totalWeeks": 12,
            "dailyHours": 8,
            "targetCompanies": ["TCS", "Infosys", "Amazon", "Microsoft"]
        }
    
    def explain_code(self, code: str, language: str, task: str) -> Dict:
        """Explain, debug, or optimize code"""
        prompts = {
            "explain": f"""Explain this {language} code line by line:

```{language}
{code}
```

Provide:
1. Line-by-line explanation
2. Time complexity analysis
3. Space complexity analysis
4. Best practices used/missing
5. Interview talking points""",
            
            "debug": f"""Debug this {language} code and fix errors:

```{language}
{code}
```

Provide:
1. Identified errors
2. Why they occur
3. Fixed code
4. Testing suggestions
5. Edge cases to consider""",
            
            "optimize": f"""Optimize this {language} code for better performance:

```{language}
{code}
```

Provide:
1. Current complexity analysis
2. Optimization opportunities
3. Optimized code
4. Complexity improvement
5. Trade-offs if any"""
        }
        
        prompt = prompts.get(task, prompts["explain"])
        result = self._generate_response(prompt)
        
        return {
            "original": code,
            "language": language,
            "task": task,
            "result": result,
            "suggestions": ["Review the analysis above for detailed suggestions"]
        }
    
    def dsa_hint(self, problem: str) -> Dict:
        """Provide complete DSA problem solution with code and explanation"""
        
        # Check if AI is available
        if not self.use_ai:
            return self._get_demo_dsa_solution(problem)
        
        prompt = f"""Solve this DSA problem completely for an engineering student preparing for placements:

Problem: {problem}

Provide a COMPLETE solution with:

1. **Python Code Solution** (Optimal approach)
   - Write clean, well-commented code
   - Include function signature
   - Add example test case

2. **Why This Code Works - Simple Explanation**
   - Explain the strategy in simple terms
   - Break down each part of the code
   - Use emojis and bullet points

3. **Step-by-Step Walkthrough**
   - Explain the algorithm logic
   - Why each part is needed

4. **Complexity Analysis**
   - Time complexity with explanation
   - Space complexity with explanation

5. **Interview Tips**
   - What to say in interview
   - Common mistakes to avoid
   - Which companies ask this

6. **Similar Problems**
   - 3-4 related LeetCode problems

Format it clearly with markdown headers and code blocks. Make it easy to understand for placement preparation."""

        response = self._generate_response(prompt)
        
        # If API quota exceeded, return demo solution
        if "exceeded your current quota" in response.lower() or "429" in response:
            return self._get_demo_dsa_solution(problem)
        
        return {
            "problem": problem,
            "solution": response,
            "type": "complete_solution"
        }
    
    def _get_demo_dsa_solution(self, problem: str) -> Dict:
        """Return demo DSA solution when API is unavailable"""
        
        problem_lower = problem.lower()
        
        # Pascal's Triangle
        if "pascal" in problem_lower:
            solution = """# 🔺 Pascal's Triangle - Complete Solution

## 1. Python Code Solution

```python
def generate_pascals_triangle(numRows):
    \"\"\"
    Generate Pascal's Triangle with numRows rows
    Time: O(numRows²), Space: O(numRows²)
    \"\"\"
    if numRows == 0:
        return []
    
    triangle = [[1]]  # First row is always [1]
    
    for i in range(1, numRows):
        row = [1]  # Every row starts with 1
        
        # Calculate middle elements
        for j in range(1, i):
            # Sum of two elements from previous row
            row.append(triangle[i-1][j-1] + triangle[i-1][j])
        
        row.append(1)  # Every row ends with 1
        triangle.append(row)
    
    return triangle


# Test Examples
print(generate_pascals_triangle(5))
# Output:
# [
#   [1],
#   [1, 1],
#   [1, 2, 1],
#   [1, 3, 3, 1],
#   [1, 4, 6, 4, 1]
# ]
```

## 2. Why This Code Works - Simple Explanation

### The Pattern 🔺
```
Row 0:           1
Row 1:         1   1
Row 2:       1   2   1
Row 3:     1   3   3   1
Row 4:   1   4   6   4   1
```

### Key Observations:
1. **First and last elements** are always `1`
2. **Middle elements** = sum of two numbers above it
3. **Row i** has `i+1` elements

### The Algorithm:
**Step 1:** Start with first row `[1]`

**Step 2:** For each new row:
- Start with `1`
- Calculate middle: `previous[j-1] + previous[j]`
- End with `1`

**Step 3:** Add row to triangle

## 3. Step-by-Step Example

Building 4 rows:

```
Row 0: [1]
       ↓
Row 1: [1, 1]
       ↓  ↓
Row 2: [1, 2, 1]
          ↓ ↓
       (1+1=2)

Row 3: [1, 3, 3, 1]
          ↓ ↓ ↓
       (1+2=3)(2+1=3)
```

## 4. Code Breakdown

```python
triangle = [[1]]  # Base case
```
- Start with first row

```python
for i in range(1, numRows):
    row = [1]  # Every row starts with 1
```
- Build each row starting with 1

```python
for j in range(1, i):
    row.append(triangle[i-1][j-1] + triangle[i-1][j])
```
- Calculate middle elements
- `triangle[i-1]` = previous row
- Sum adjacent elements

```python
row.append(1)  # Every row ends with 1
triangle.append(row)
```
- End row with 1
- Add to triangle

## 5. Complexity Analysis

| Metric | Value | Explanation |
|--------|-------|-------------|
| **Time** | O(numRows²) | Generate numRows rows, each row has i elements |
| **Space** | O(numRows²) | Store entire triangle |

**Why O(numRows²)?**
- Row 0: 1 element
- Row 1: 2 elements
- Row 2: 3 elements
- ...
- Row n: n+1 elements
- Total: 1+2+3+...+n = n(n+1)/2 = O(n²)

## 6. Interview Tips 💡

### What to Say:
✅ "Each element is the sum of two elements from the previous row"
✅ "I handle edge cases: first and last elements are always 1"
✅ "Time complexity is O(n²) because we generate n² elements"

### Common Mistakes to Avoid:
❌ Forgetting to add 1 at start and end of each row
❌ Wrong indexing when accessing previous row
❌ Not handling numRows = 0 or 1

### Companies That Ask This:
- **Amazon** ⭐⭐⭐⭐
- **Microsoft** ⭐⭐⭐
- **Google** ⭐⭐⭐
- **Apple** ⭐⭐⭐
- **TCS/Infosys** ⭐⭐⭐⭐⭐ (Very Common)

## 7. Variations & Follow-ups

### Variation 1: Get Specific Row
```python
def getRow(rowIndex):
    \"\"\"Get only the rowIndex-th row\"\"\"
    row = [1]
    for i in range(1, rowIndex + 1):
        # Build from right to left to use O(1) space
        row.append(1)
        for j in range(i - 1, 0, -1):
            row[j] = row[j] + row[j - 1]
    return row
```

### Variation 2: Print Triangle Format
```python
def print_triangle(numRows):
    triangle = generate_pascals_triangle(numRows)
    for i, row in enumerate(triangle):
        spaces = ' ' * (numRows - i - 1)
        print(spaces + ' '.join(map(str, row)))
```

## 8. Similar Problems

1. **Pascal's Triangle II** (LeetCode 119)
   - Get specific row with O(k) space
   - Difficulty: Easy

2. **Triangle** (LeetCode 120)
   - Minimum path sum in triangle
   - Difficulty: Medium

3. **Combination Sum** (LeetCode 39)
   - Uses combinatorics like Pascal's
   - Difficulty: Medium

4. **Unique Paths** (LeetCode 62)
   - Related to Pascal's triangle values
   - Difficulty: Medium

---

**🎯 This is a common interview question for service-based companies!**

*Note: This is a demo solution. Get Gemini API key for AI-generated solutions.*
"""
        
        # Matrix Zeroes
        elif "matrix" in problem_lower and "0" in problem:
            solution = """# 🚀 Set Matrix Zeroes - Complete Solution

## 1. Python Code Solution (Optimal O(1) Space)

```python
def setZeroes(matrix):
    \"\"\"
    Set entire row and column to 0 if element is 0
    Time: O(M×N), Space: O(1)
    \"\"\"
    if not matrix:
        return
    
    rows = len(matrix)
    cols = len(matrix[0])
    
    # Step 1: Check if first row and column need zeroing
    first_row_has_zero = False
    first_col_has_zero = False
    
    for j in range(cols):
        if matrix[0][j] == 0:
            first_row_has_zero = True
            break
    
    for i in range(rows):
        if matrix[i][0] == 0:
            first_col_has_zero = True
            break
    
    # Step 2: Use first row/column as markers
    for i in range(1, rows):
        for j in range(1, cols):
            if matrix[i][j] == 0:
                matrix[i][0] = 0
                matrix[0][j] = 0
    
    # Step 3: Zero out based on markers
    for i in range(1, rows):
        for j in range(1, cols):
            if matrix[i][0] == 0 or matrix[0][j] == 0:
                matrix[i][j] = 0
    
    # Step 4: Handle first row and column
    if first_row_has_zero:
        for j in range(cols):
            matrix[0][j] = 0
    
    if first_col_has_zero:
        for i in range(rows):
            matrix[i][0] = 0
```

[Full solution continues...]

**Companies:** Amazon ⭐⭐⭐⭐⭐, Microsoft ⭐⭐⭐⭐, Google ⭐⭐⭐⭐

*Get Gemini API key for complete solution with detailed explanation.*
"""
        
        # Two Sum
        elif "two sum" in problem_lower:
            solution = """# 🎯 Two Sum - Complete Solution

## 1. Python Code Solution (Optimal O(n) Time)

```python
def twoSum(nums, target):
    \"\"\"
    Find two numbers that add up to target
    Time: O(n), Space: O(n)
    \"\"\"
    seen = {}  # Dictionary to store {value: index}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in seen:
            return [seen[complement], i]
        
        seen[num] = i
    
    return []  # No solution found


# Test
print(twoSum([2, 7, 11, 15], 9))  # Output: [0, 1]
print(twoSum([3, 2, 4], 6))       # Output: [1, 2]
```

## 2. Why This Works

**The Insight:** For each number, check if its complement exists

```
Target = 9
nums = [2, 7, 11, 15]

i=0: num=2, complement=7, seen={} → Add 2
i=1: num=7, complement=2, seen={2:0} → Found! Return [0,1]
```

## 3. Complexity

- **Time:** O(n) - Single pass
- **Space:** O(n) - Hash map storage

## 4. Interview Tips

✅ "I use a hash map for O(1) lookups"
✅ "One pass solution is optimal"

**Companies:** Amazon ⭐⭐⭐⭐⭐, Google ⭐⭐⭐⭐⭐, Microsoft ⭐⭐⭐⭐⭐

*Get Gemini API key for complete solution.*
"""
        
        # Valid Parentheses
        elif "parenthes" in problem_lower or "bracket" in problem_lower:
            solution = """# 🔤 Valid Parentheses - Complete Solution

## 1. Python Code Solution

```python
def isValid(s):
    \"\"\"
    Check if parentheses are valid
    Time: O(n), Space: O(n)
    \"\"\"
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in mapping:
            # Closing bracket
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            # Opening bracket
            stack.append(char)
    
    return len(stack) == 0


# Test
print(isValid("()"))      # True
print(isValid("()[]{}"))  # True
print(isValid("(]"))      # False
```

## 2. Why Stack?

**Opening brackets** → Push to stack
**Closing brackets** → Must match top of stack

```
Input: "({[]})"

Step 1: '(' → stack = ['(']
Step 2: '{' → stack = ['(', '{']
Step 3: '[' → stack = ['(', '{', '[']
Step 4: ']' → matches '[' → stack = ['(', '{']
Step 5: '}' → matches '{' → stack = ['(']
Step 6: ')' → matches '(' → stack = []
Result: Valid ✓
```

**Companies:** Amazon ⭐⭐⭐⭐, Microsoft ⭐⭐⭐⭐, TCS ⭐⭐⭐⭐⭐

*Get Gemini API key for complete solution.*
"""
        
        # Generic fallback
        else:
            solution = f"""# 💡 DSA Problem Solution

**Problem:** {problem}

## Demo Mode Active

⚠️ **Gemini API quota exceeded.** 

### To Get AI-Powered Solutions:

1. **Get New API Key:**
   - Visit: https://aistudio.google.com/app/apikey
   - Click "Create API Key"
   - Copy the key

2. **Update Backend:**
   ```bash
   # Edit backend/.env
   GEMINI_API_KEY=your-new-api-key-here
   ```

3. **Restart Backend:**
   ```bash
   cd backend
   npm run dev
   ```

### Popular Demo Solutions Available:

Try these problems to see complete solutions:
- ✅ **Pascal's Triangle** - Full solution with code
- ✅ **Set Matrix Zeroes** - O(1) space solution
- ✅ **Two Sum** - Hash map approach
- ✅ **Valid Parentheses** - Stack solution

### General DSA Approach:

1. **Understand the Problem**
   - Read carefully
   - Identify inputs/outputs
   - Check constraints

2. **Think of Approaches**
   - Brute force first
   - Optimize with data structures
   - Consider time/space tradeoffs

3. **Write Clean Code**
   - Meaningful variable names
   - Add comments
   - Handle edge cases

4. **Analyze Complexity**
   - Time: O(?)
   - Space: O(?)

5. **Test Thoroughly**
   - Normal cases
   - Edge cases (empty, single element)
   - Large inputs

### Interview Tips 💡

- **Think out loud** - Explain your thought process
- **Start simple** - Brute force first, then optimize
- **Ask questions** - Clarify requirements
- **Test your code** - Walk through examples
- **Discuss tradeoffs** - Time vs space

### Common Data Structures:

| Problem Type | Data Structure |
|--------------|----------------|
| Fast lookup | Hash Map/Set |
| LIFO order | Stack |
| FIFO order | Queue |
| Sorted data | Heap/BST |
| Graph problems | DFS/BFS |

---

**Configure Gemini API for AI-generated solutions for ANY problem!**
"""
        
        return {
            "problem": problem,
            "solution": solution,
            "type": "demo_solution"
        }
    
    def project_guidance(self, project_type: str, tech_stack: List[str]) -> Dict:
        """Provide placement-worthy project guidance"""
        prompt = f"""Create a detailed project guide for engineering students preparing for placements.

Project Type: {project_type}
Tech Stack: {', '.join(tech_stack)}

Provide:
1. Why this project is good for placements
2. Project structure and architecture
3. Core features to implement (phase-wise)
4. Database schema design
5. API endpoints needed
6. Deployment checklist
7. GitHub best practices
8. Resume bullet points
9. Interview talking points
10. Companies that value this project

Make it actionable with clear steps and timeline (6-8 weeks)."""

        guidance = self._generate_response(prompt)
        
        return {
            "projectType": project_type,
            "techStack": tech_stack,
            "guidance": guidance,
            "estimatedTime": "6-8 weeks",
            "difficulty": "intermediate",
            "placementValue": "High",
            "companiesThatAsk": ["Amazon", "Microsoft", "Flipkart", "Startups"]
        }

    
    def analyze_resume(self, resume_text: str) -> Dict:
        """Analyze resume for ATS and placement readiness"""
        prompt = f"""Analyze this engineering student's resume for campus placements:

RESUME:
{resume_text}

Provide detailed analysis:

1. ATS Score (0-100)
2. Overall Placement Readiness Score (0-100)
3. Strengths (what's good)
4. Areas for Improvement (what's missing/weak)
5. Keywords found
6. Missing important keywords
7. Section-wise analysis (Contact, Education, Skills, Projects, Experience, Achievements)
8. Company fit analysis (Service-based vs Product-based)
9. Specific recommendations

Focus on:
- ATS compatibility
- Keyword optimization
- Format and structure
- Content quality
- Quantifiable achievements
- Technical skills relevance
- Project descriptions

Return analysis in a structured format."""

        analysis = self._generate_response(prompt)
        
        # Parse the analysis to extract scores (basic parsing)
        ats_score = 75  # Default
        overall_score = 75  # Default
        
        # Try to extract scores from response
        for line in analysis.split('\n'):
            if 'ats score' in line.lower() or 'ats:' in line.lower():
                try:
                    score = int(''.join(filter(str.isdigit, line)))
                    if 0 <= score <= 100:
                        ats_score = score
                except:
                    pass
            if 'overall' in line.lower() and 'score' in line.lower():
                try:
                    score = int(''.join(filter(str.isdigit, line)))
                    if 0 <= score <= 100:
                        overall_score = score
                except:
                    pass
        
        return {
            "atsScore": ats_score,
            "overallScore": overall_score,
            "analysis": analysis,
            "placementReadiness": "Good" if overall_score >= 70 else "Needs Improvement",
            "companyFit": {
                "Service-based (TCS/Infosys)": f"{min(overall_score + 10, 95)}% - Analyze from report",
                "Product-based (Amazon/Microsoft)": f"{max(overall_score - 15, 50)}% - Analyze from report",
                "Startups": f"{overall_score}% - Analyze from report"
            }
        }
    
    def interview_prep(self, company: str, role: str) -> Dict:
        """Generate company-specific interview preparation"""
        prompt = f"""Create a comprehensive interview preparation guide for:

Company: {company}
Role: {role}

Provide:

1. Company Overview
   - Package range
   - Interview difficulty
   - Selection process

2. Interview Rounds
   - Detailed breakdown of each round
   - What to expect
   - Preparation strategy

3. Common Questions
   - Technical questions (10-15)
   - HR questions (5-7)
   - Behavioral questions (5)

4. Technical Topics to Prepare
   - DSA topics
   - Core CS subjects
   - System design (if applicable)

5. Coding Questions Pattern
   - Easy/Medium/Hard distribution
   - Common problem types

6. Company-Specific Tips
   - What they value
   - Red flags to avoid
   - Unique aspects of their process

7. Preparation Timeline
   - 1 month before
   - 1 week before
   - 1 day before

8. Resources
   - Practice platforms
   - Company-specific prep

Make it specific to Indian campus placements and engineering students."""

        preparation = self._generate_response(prompt)
        
        # Extract common questions from the response
        common_questions = []
        in_questions_section = False
        for line in preparation.split('\n'):
            if 'question' in line.lower() and ':' not in line:
                in_questions_section = True
            if in_questions_section and line.strip() and (line.strip()[0].isdigit() or line.startswith('-') or line.startswith('•')):
                question = line.strip().lstrip('0123456789.-•) ').strip()
                if question and len(question) > 10:
                    common_questions.append(question)
                if len(common_questions) >= 10:
                    break
        
        if not common_questions:
            common_questions = [
                f"Why do you want to join {company}?",
                f"Tell me about yourself",
                f"Explain your most challenging project",
                f"What interests you about {role}?",
                "What are your strengths and weaknesses?",
                "Where do you see yourself in 5 years?",
                "Why should we hire you?",
                "Tell me about a time you faced a challenge",
                "How do you handle pressure and deadlines?",
                "Do you have any questions for us?"
            ]
        
        return {
            "company": company,
            "role": role,
            "preparation": preparation,
            "commonQuestions": common_questions[:10],
            "technicalTopics": [
                "Data Structures & Algorithms",
                "Operating Systems",
                "Database Management Systems",
                "Computer Networks",
                "Object-Oriented Programming",
                "System Design (for senior roles)"
            ]
        }

# Singleton instance
ai_service = AIService()
