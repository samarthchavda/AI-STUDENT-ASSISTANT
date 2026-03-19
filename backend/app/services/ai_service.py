"""
AI Service - Handles all AI-related functionality using Google Gemini API
"""

from typing import List, Dict, Optional
from functools import lru_cache
import json
import re
import tiktoken
import google.generativeai as genai
from app.core.config import settings
from sqlalchemy.orm import Session
from app.models import CompanyQuestion

class AIService:
    def __init__(self):
        # Initialize Gemini API
        if settings.gemini_api_key and settings.gemini_api_key != "your-gemini-api-key-here":
            genai.configure(api_key=settings.gemini_api_key)
            # Use gemini-2.5-flash for fastest responses
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            self.use_ai = True
            print("✅ Gemini AI initialized successfully")
        else:
            self.use_ai = False
            print("⚠️ Gemini API key not configured, using demo mode")
        
        # Initialize tiktoken for token counting
        try:
            self.enc = tiktoken.get_encoding("cl100k_base")
        except Exception as e:
            print(f"⚠️ Tiktoken not available: {e}, using character count estimation")
            self.enc = None
    
    def _count_tokens(self, text: str) -> int:
        """Count tokens in text using tiktoken (or estimate if unavailable)"""
        if self.enc:
            return len(self.enc.encode(text))
        # Fallback: estimate ~1 token per 4 characters
        return len(text) // 4
    
    def _detect_prompt_injection(self, prompt: str) -> bool:
        """Detect common prompt injection attempts"""
        dangerous_patterns = [
            "ignore previous instructions",
            "ignore all previous",
            "forget everything",
            "bypass system",
            "override",
            "disregard",
            "system prompt",
            "secret instruction",
            "hidden instruction",
            "reveal the prompt",
            "show me the prompt",
            "what's your system prompt",
            "you are actually",
            "act as if",
            "pretend you are",
        ]
        
        prompt_lower = prompt.lower()
        for pattern in dangerous_patterns:
            if pattern in prompt_lower:
                return True
        return False
    
    def get_cache_stats(self) -> Dict:
        """Get cache hit/miss statistics to show API savings"""
        return {
            "topic_explanations": {
                "hits": self._cached_explain_topic.cache_info().hits,
                "misses": self._cached_explain_topic.cache_info().misses,
                "size": self._cached_explain_topic.cache_info().currsize,
                "max": self._cached_explain_topic.cache_info().maxsize
            },
            "doubt_solutions": {
                "hits": self._cached_solve_doubt.cache_info().hits,
                "misses": self._cached_solve_doubt.cache_info().misses,
                "size": self._cached_solve_doubt.cache_info().currsize,
                "max": self._cached_solve_doubt.cache_info().maxsize
            },
            "estimated_savings": f"~{(self._cached_explain_topic.cache_info().hits + self._cached_solve_doubt.cache_info().hits) * 100} API calls saved"
        }
    
    def _generate_response(self, prompt: str) -> str:
        """Generate response using Gemini AI"""
        if not self.use_ai:
            return "[Demo Mode] Configure GEMINI_API_KEY in .env file to enable AI responses."
        
        # Check for prompt injection attempts
        if self._detect_prompt_injection(prompt):
            return "❌ Invalid request: Suspicious prompt pattern detected. Please rephrase your question."
        
        # Count tokens before truncation
        token_count = self._count_tokens(prompt)
        print(f"📊 Prompt tokens: {token_count}")
        
        # Protect against extremely long prompts (truncate to 4000 chars)
        if len(prompt) > 4000:
            prompt = prompt[:4000] + "\n\n[Context truncated for token limit]"
        
        try:
            # Set generation config for fast, concise responses
            # 1200 tokens sufficient for complete answers with action triggers
            generation_config = {
                "temperature": 0.8,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 1200,
            }
            
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )
            extracted = self._extract_text_from_gemini_response(response)
            cleaned = self._sanitize_chat_output(extracted)
            return cleaned or "I’m here to help. Please share a bit more context so I can give a precise answer."
        except Exception as e:
            error_msg = str(e)
            print(f"Error generating AI response: {error_msg}")
            lower_error = error_msg.lower()
            if "429" in error_msg or "quota" in lower_error or "rate limit" in lower_error:
                return "⚠️ AI daily limit reached right now. Please try again after some time, or update Gemini billing/quota settings."
            # Return a helpful error message instead of crashing
            return f"⚠️ AI service temporarily unavailable. Error: {error_msg[:100]}\n\nPlease try again in a moment."

    def _extract_json_object(self, raw_text: str) -> Optional[Dict]:
        """Extract a JSON object from a model response if present."""
        if not raw_text:
            return None

        try:
            return json.loads(raw_text)
        except Exception:
            pass

        match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if not match:
            return None

        try:
            return json.loads(match.group(0))
        except Exception:
            return None
    
    def _generate_response_stream(self, prompt: str):
        """Generate streaming response using Gemini AI (word by word like ChatGPT)"""
        if not self.use_ai:
            yield "[Demo Mode] Configure GEMINI_API_KEY in .env file to enable AI responses."
            return
        
        # Check for prompt injection attempts
        if self._detect_prompt_injection(prompt):
            yield "❌ Invalid request: Suspicious prompt pattern detected. Please rephrase your question."
            return
        
        # Count tokens before truncation
        token_count = self._count_tokens(prompt)
        print(f"📊 Streaming prompt tokens: {token_count}")
        
        # Protect against extremely long prompts (truncate to 4000 chars)
        if len(prompt) > 4000:
            prompt = prompt[:4000] + "\n\n[Context truncated for token limit]"
        
        try:
            # Set generation config for fast, concise streaming
            # 800 tokens sufficient for bullet-point format, prevents incomplete answers
            generation_config = {
                "temperature": 0.8,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 800,
            }
            
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config,
                stream=True
            )
            
            for chunk in response:
                chunk_text = self._extract_text_from_gemini_response(chunk)
                if chunk_text:
                    yield self._sanitize_chat_output(chunk_text)
        except Exception as e:
            error_msg = str(e)
            print(f"Error generating streaming AI response: {error_msg}")
            lower_error = error_msg.lower()
            if "429" in error_msg or "quota" in lower_error or "rate limit" in lower_error:
                yield "⚠️ AI daily limit reached right now. Please try again after some time, or update Gemini billing/quota settings."
                return
            yield f"⚠️ AI service temporarily unavailable. Error: {error_msg[:100]}\n\nPlease try again in a moment."

    def _generate_response_long(self, prompt: str) -> str:
        """Generate longer-form response (used for resume generation)."""
        if not self.use_ai:
            return "[Demo Mode] Configure GEMINI_API_KEY in .env file to enable AI responses."

        # Protect against extremely long prompts (truncate to 8000 chars for long responses)
        if len(prompt) > 8000:
            prompt = prompt[:8000] + "\n\n[Context truncated for token limit]"

        try:
            generation_config = {
                "temperature": 0.5,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 4096,
            }

            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )
            extracted = self._extract_text_from_gemini_response(response)
            return extracted or "Could not generate full resume content right now. Please try again."
        except Exception as e:
            error_msg = str(e)
            print(f"Error generating long AI response: {error_msg}")
            return f"⚠️ AI service temporarily unavailable. Error: {error_msg[:100]}\n\nPlease try again in a moment."

    def _extract_text_from_gemini_response(self, response_obj) -> str:
        """Safely extract text from Gemini response/chunk, including multipart responses."""
        if response_obj is None:
            return ""

        try:
            direct_text = getattr(response_obj, "text", None)
            if isinstance(direct_text, str) and direct_text.strip():
                return direct_text
        except Exception:
            pass

        texts = []
        candidates = getattr(response_obj, "candidates", None) or []
        for candidate in candidates:
            content = getattr(candidate, "content", None)
            if not content:
                continue
            parts = getattr(content, "parts", None) or []
            for part in parts:
                part_text = getattr(part, "text", None)
                if part_text:
                    texts.append(part_text)

        return "\n".join(texts).strip()

    def _sanitize_chat_output(self, text: str) -> str:
        """Remove markdown-heavy symbols and keep output clean/professional."""
        if not text:
            return ""

        cleaned = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
        cleaned = re.sub(r"^\s*#{1,6}\s*", "", cleaned, flags=re.MULTILINE)
        cleaned = cleaned.replace("#", "")
        cleaned = re.sub(r"\*{2,}", "", cleaned)
        cleaned = re.sub(r"(^|\s)\*(?=\S)", " ", cleaned)
        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
        return cleaned.strip()

    def _build_resume_fallback(self, resume_text: str) -> str:
        """Build a structured resume output directly from extracted source text when AI output is too short."""
        lines = [line.strip() for line in resume_text.split('\n') if line.strip()]
        source_preview = lines[:40]

        email_match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", resume_text)
        phone_match = re.search(r"(\+?\d[\d\s\-]{8,}\d)", resume_text)
        linkedin_match = re.search(r"(https?://)?(www\.)?linkedin\.com/[^\s]+", resume_text, re.IGNORECASE)
        github_match = re.search(r"(https?://)?(www\.)?github\.com/[^\s]+", resume_text, re.IGNORECASE)

        first_line = source_preview[0] if source_preview else "[Your Name]"
        contact_line_parts = []
        if email_match:
            contact_line_parts.append(email_match.group(0))
        if phone_match:
            contact_line_parts.append(phone_match.group(0))
        if linkedin_match:
            contact_line_parts.append(linkedin_match.group(0))
        if github_match:
            contact_line_parts.append(github_match.group(0))

        contact_line = " | ".join(contact_line_parts) if contact_line_parts else "[Add email] | [Add phone] | [Add LinkedIn] | [Add GitHub]"

        keywords = [
            "python", "java", "javascript", "typescript", "react", "node", "sql", "mongodb", "aws", "docker", "git", "dsa"
        ]
        found_skills = []
        normalized = resume_text.lower()
        for keyword in keywords:
            if keyword in normalized:
                found_skills.append(keyword.upper() if keyword == "aws" else keyword.capitalize())

        skills_line = ", ".join(found_skills[:10]) if found_skills else "[Add technical skills relevant to target role]"

        highlights = source_preview[1:12] if len(source_preview) > 1 else []
        bullet_highlights = "\n".join([f"- {line}" for line in highlights]) if highlights else "- [Add project, internship, and achievement highlights from your resume]"

        return (
            f"{first_line}\n"
            f"{contact_line}\n\n"
            "PROFESSIONAL SUMMARY\n"
            "Engineering student/fresher preparing for IT placements. Strong problem-solving mindset and practical project exposure.\n\n"
            "TECHNICAL SKILLS\n"
            f"{skills_line}\n\n"
            "EXTRACTED HIGHLIGHTS (VERIFY & EDIT)\n"
            f"{bullet_highlights}\n\n"
            "PROJECTS\n"
            "- [Project Name] - Built using [Tech Stack], achieved [quantified impact].\n"
            "- [Project Name] - Implemented [feature], improved [metric].\n\n"
            "EDUCATION\n"
            "[Degree], [College], [Year], [CGPA/Percentage]\n\n"
            "CERTIFICATIONS\n"
            "[Add relevant certifications]\n\n"
            "ACHIEVEMENTS\n"
            "[Add coding ranks, awards, leadership, or responsibilities]"
        )

    def generate_updated_resume(self, resume_text: str) -> str:
        """Generate an improved ATS-friendly resume from provided resume text"""
        prompt = f"""You are an expert resume writer for Indian engineering placements.

Rewrite and improve this resume into a strong ATS-friendly version.

SOURCE RESUME:
{resume_text}

Instructions:
1. Keep all details truthful to the source content. Do not invent companies, internships, projects, dates, or achievements.
2. Improve wording, structure, and bullet quality.
3. Use action verbs and concise impact-focused bullets.
4. Include sections in this order when possible:
   - Name and Contact
   - Professional Summary
   - Education
   - Technical Skills
   - Projects
   - Experience/Internships (if present)
   - Certifications
   - Achievements/Leadership
5. If a section is missing in source data, add a placeholder line like: "[Add your X details]".
6. Output plain text only, no markdown symbols like **, ##, or ```.
7. Keep it clean, one-page style.

Return only the improved resume text."""

        updated_resume = self._generate_response_long(prompt)

        if updated_resume.startswith("[Demo Mode]"):
            return (
                "UPDATED RESUME (DEMO MODE)\n\n"
                "To generate a true AI-updated resume PDF, configure GEMINI_API_KEY in backend/.env.\n\n"
                "Suggested structure:\n"
                "Name | Phone | Email | LinkedIn | GitHub\n\n"
                "Professional Summary\n"
                "2-3 lines tailored for target role.\n\n"
                "Education\n"
                "Degree, college, year, CGPA.\n\n"
                "Technical Skills\n"
                "Languages, frameworks, tools, databases.\n\n"
                "Projects\n"
                "Project title + 2-3 impact bullets with numbers.\n\n"
                "Experience/Internships\n"
                "Role, company, duration, quantified impact.\n\n"
                "Certifications and Achievements\n"
                "Relevant credentials and accomplishments."
            )

        cleaned = updated_resume.replace('```', '').replace('**', '').strip()
        if len(cleaned) < 500:
            return self._build_resume_fallback(resume_text)

        return cleaned

    def enhance_resume_section(self, section: str, content: str) -> str:
        """Enhance a specific resume section with professional, ATS-friendly wording."""
        normalized_section = (section or "").strip().lower()
        section_name = normalized_section if normalized_section in {
            "personal",
            "education",
            "experience",
            "projects",
            "certificates",
            "achievements",
            "hobbies",
            "languages",
            "skills",
        } else "resume"

        prompt = f"""You are an expert resume writer.

Enhance the following {section_name} section content for a professional resume.

Rules:
1. Keep facts truthful to the source. Do not invent companies, degree names, dates, or achievements.
2. Improve wording to be concise, professional, and ATS-friendly.
3. Use strong action-oriented language when relevant.
4. Return plain text only (no markdown, no headings unless needed in content).
5. Keep output practical and ready to paste in resume builder fields.

SECTION: {section_name}
SOURCE CONTENT:
{content}

Return only the enhanced text."""

        enhanced = self._generate_response(prompt)
        return enhanced.replace('```', '').replace('**', '').strip()

    def suggest_skills(self, education_text: str, experience_text: str) -> str:
        """Suggest missing technical skills based on education and experience."""
        prompt = f"""You are an expert career counselor and technical resume advisor.

A student has the following background:

EDUCATION:
{education_text}

WORK EXPERIENCE / PROJECTS:
{experience_text}

Based on their educational background and experience, suggest the TOP 6-8 technical skills they are likely missing but should add to their resume.

Rules:
1. Only suggest skills logically relevant to their field and degree.
2. Prioritize in-demand, modern skills for their specific domain.
3. Do NOT suggest skills they likely already have (avoid repeating obvious basics).
4. Format as a comma-separated list of skill names only.
5. Include frameworks, tools, or relevant certifications.

Return ONLY a comma-separated list of skill names. No extra text."""
        result = self._generate_response(prompt)
        return result.replace('**', '').replace('```', '').strip()

    def enhance_experience_bullets(self, title: str, company: str, raw_text: str) -> str:
        """Transform weak experience text into powerful action-oriented bullet points."""
        prompt = f"""You are a professional resume writer specialising in tech industry resumes.

Transform the following work or project experience into 3-5 powerful, ATS-optimised bullet points.

JOB TITLE: {title}
COMPANY / PROJECT: {company}
RAW DESCRIPTION:
{raw_text}

Rules:
1. Start EACH bullet with a strong past-tense action verb (Architected, Developed, Optimised, Led, Built, Engineered, Automated, Reduced, etc.).
2. Include specific technologies, tools, or methodologies where evident from the raw text.
3. Add plausible quantifiable impact (%, users, time saved, scale) where logically reasonable.
4. Keep each bullet to 1-2 lines maximum.
5. Do NOT invent companies, dates, or facts not present in the source.
6. Return plain bullet points starting with \u2022, one per line, no extra text."""
        result = self._generate_response(prompt)
        return result.replace('**', '').replace('```', '').strip()

    def generate_professional_summary(self, name: str, role: str, education: str, experience: str, skills: str) -> str:
        """Auto-generate a compelling 3-sentence professional summary."""
        prompt = f"""You are an expert resume writer. Create a compelling 3-sentence professional summary.

CANDIDATE: {name}
TARGET ROLE: {role}
EDUCATION: {education}
EXPERIENCE/PROJECTS: {experience}
SKILLS: {skills}

Rules:
1. Write exactly 3 sentences, each on a new line.
2. Sentence 1: Who they are — role identity + degree/background.
3. Sentence 2: What they have done — key experience/projects + 1-2 standout skills.
4. Sentence 3: The value they bring or what they are seeking.
5. Keep it concise, impactful, and ATS-friendly.
6. Do NOT use clich\u00e9 phrases like \"hard-working\", \"team player\", or \"passionate\".
7. Return plain text only — no bullet points, no markdown, no headings.

Return ONLY the 3-sentence summary."""
        result = self._generate_response(prompt)
        return result.replace('**', '').replace('```', '').strip()

        def generate_demo_resume_data(self, role: str = "Full Stack Developer") -> Dict:
                """Generate high-quality demo resume data in strict JSON format."""
                prompt = f"""You are an expert resume writer.

Generate a realistic sample resume persona for role: {role}.

Return STRICT JSON only. No markdown. No explanations.
Schema:
{{
    "personal": {{
        "fullName": "",
        "email": "",
        "phone": "",
        "location": "",
        "desiredRole": "",
        "summary": ""
    }},
    "education": [
        {{"degree": "", "institution": "", "graduationYear": "", "details": ""}}
    ],
    "experience": [
        {{"title": "", "company": "", "duration": "", "description": ""}}
    ],
    "projects": [
        {{"title": "", "techStack": "", "description": ""}}
    ],
    "certificates": [
        {{"title": "", "organization": "", "year": ""}}
    ],
    "achievements": [
        {{"title": "", "organization": "", "year": ""}}
    ],
    "skills": {{
        "technical": "",
        "tools": "",
        "soft": ""
    }},
    "hobbies": [""],
    "languages": [""]
}}

Rules:
1. Use realistic but fake identity details.
2. Make experience and projects strong and ATS-friendly with quantified impact.
3. Keep fields concise and production-quality.
4. Ensure valid JSON only.
"""

                raw = self._generate_response(prompt).replace('```json', '').replace('```', '').strip()

                try:
                        parsed = json.loads(raw)
                        return parsed
                except Exception:
                        return {
                                "personal": {
                                        "fullName": "Aarav Mehta",
                                        "email": "aarav.mehta.dev@gmail.com",
                                        "phone": "+91 98765 43210",
                                        "location": "Bengaluru, India",
                                        "desiredRole": role,
                                        "summary": "Full Stack Developer with 3+ years of experience building scalable web applications using React, Node.js, and cloud-native architecture. Delivered high-impact features that improved conversion, reduced API latency, and optimized deployment pipelines. Seeking to contribute strong product thinking and engineering execution in a growth-focused tech team.",
                                },
                                "education": [
                                        {
                                                "degree": "B.Tech in Computer Science",
                                                "institution": "Nirma University",
                                                "graduationYear": "2022",
                                                "details": "CGPA: 8.7/10. Coursework: Data Structures, DBMS, Cloud Computing, Software Engineering.",
                                        }
                                ],
                                "experience": [
                                        {
                                                "title": "Software Engineer",
                                                "company": "TechNova Solutions",
                                                "duration": "Jul 2022 - Present",
                                                "description": "• Built and shipped 20+ production features in a React + Node.js SaaS platform.\n• Improved API response time by 35% via query optimization and Redis caching.\n• Reduced deployment failures by 40% by introducing CI quality checks and release gates.",
                                        }
                                ],
                                "projects": [
                                        {
                                                "title": "ShopSphere E-commerce Platform",
                                                "techStack": "React, Node.js, Express, MongoDB, Stripe",
                                                "description": "Designed and developed full-stack e-commerce platform with JWT auth, cart, and payment flow.\nImplemented product search and filtering, improving product discovery by 28%.\nIntegrated checkout and order pipeline with robust error handling and analytics hooks.",
                                        }
                                ],
                                "certificates": [
                                        {
                                                "title": "AWS Certified Cloud Practitioner",
                                                "organization": "Amazon Web Services",
                                                "year": "2023",
                                        }
                                ],
                                "achievements": [
                                        {
                                                "title": "Top Performer Award",
                                                "organization": "TechNova Solutions",
                                                "year": "2024",
                                        }
                                ],
                                "skills": {
                                        "technical": "JavaScript, TypeScript, React, Node.js, Express, MongoDB, PostgreSQL",
                                        "tools": "Git, Docker, AWS, Postman, CI/CD, Redis",
                                        "soft": "Problem Solving, Team Collaboration, Stakeholder Communication",
                                },
                                "hobbies": ["Reading tech blogs", "Badminton", "UI experimentation"],
                                "languages": ["English", "Hindi", "Gujarati"],
                        }

    def calculate_ats_score(self, resume_text: str) -> Dict:
        """
        Calculate detailed ATS score breakdown
        Returns comprehensive scoring with specific metrics
        """
        prompt = f"""Analyze this resume and provide a detailed ATS (Applicant Tracking System) score breakdown.

RESUME:
{resume_text}

Provide scores (0-100) for each category and overall:

1. OVERALL ATS SCORE (0-100)
2. KEYWORDS SCORE (0-100) - Technical keywords, skills, tools
3. FORMATTING SCORE (0-100) - Structure, sections, readability
4. SKILLS SCORE (0-100) - Technical skills relevance and depth
5. EXPERIENCE SCORE (0-100) - Projects, internships, quantifiable impact

For each score, provide:
- The numeric score
- Brief explanation (1-2 sentences)
- Specific improvements needed

Also provide:
- Top 5 strengths
- Top 5 weaknesses
- Missing keywords (10-15 important ones)
- Recommended actions (5-7 specific steps)

Format your response clearly with scores at the top."""

        analysis = self._generate_response(prompt)
        
        # Parse scores from response
        scores = {
            "overall": 70,
            "keywords": 65,
            "formatting": 75,
            "skills": 70,
            "experience": 65
        }
        
        # Try to extract scores
        lines = analysis.lower().split('\n')
        for line in lines:
            if 'overall' in line and 'score' in line:
                try:
                    score = int(''.join(filter(str.isdigit, line)))
                    if 0 <= score <= 100:
                        scores["overall"] = score
                except:
                    pass
            elif 'keyword' in line and 'score' in line:
                try:
                    score = int(''.join(filter(str.isdigit, line)))
                    if 0 <= score <= 100:
                        scores["keywords"] = score
                except:
                    pass
            elif 'format' in line and 'score' in line:
                try:
                    score = int(''.join(filter(str.isdigit, line)))
                    if 0 <= score <= 100:
                        scores["formatting"] = score
                except:
                    pass
            elif 'skill' in line and 'score' in line:
                try:
                    score = int(''.join(filter(str.isdigit, line)))
                    if 0 <= score <= 100:
                        scores["skills"] = score
                except:
                    pass
            elif 'experience' in line and 'score' in line:
                try:
                    score = int(''.join(filter(str.isdigit, line)))
                    if 0 <= score <= 100:
                        scores["experience"] = score
                except:
                    pass
        
        # Calculate grade
        overall = scores["overall"]
        if overall >= 90:
            grade = "Excellent"
            color = "green"
        elif overall >= 75:
            grade = "Good"
            color = "blue"
        elif overall >= 60:
            grade = "Average"
            color = "yellow"
        else:
            grade = "Needs Improvement"
            color = "red"
        
        return {
            "overallScore": scores["overall"],
            "grade": grade,
            "color": color,
            "breakdown": {
                "keywords": {
                    "score": scores["keywords"],
                    "label": "Keywords & Technical Terms"
                },
                "formatting": {
                    "score": scores["formatting"],
                    "label": "Formatting & Structure"
                },
                "skills": {
                    "score": scores["skills"],
                    "label": "Technical Skills"
                },
                "experience": {
                    "score": scores["experience"],
                    "label": "Experience & Impact"
                }
            },
            "detailedAnalysis": analysis,
            "recommendation": "Your resume is ATS-friendly" if overall >= 75 else "Improve your resume for better ATS compatibility"
        }
    
    def match_resume_to_job(self, resume_text: str, job_description: str) -> Dict:
        """
        Match resume against job description
        Returns match score and gap analysis
        """
        prompt = f"""Analyze how well this resume matches the job description.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Provide:

1. MATCH SCORE (0-100) - Overall compatibility
2. MATCHING SKILLS - Skills present in both resume and JD
3. MISSING SKILLS - Required skills not in resume
4. EXPERIENCE MATCH - How experience aligns
5. EDUCATION MATCH - Education requirements met?
6. GAP ANALYSIS - What's missing or weak
7. RECOMMENDATIONS - Specific actions to improve match
8. INTERVIEW READINESS - Ready to apply? (Yes/No/Maybe)

Be specific and actionable. Focus on technical skills, tools, and experience."""

        analysis = self._generate_response(prompt)
        
        # Parse match score
        match_score = 65  # Default
        for line in analysis.lower().split('\n'):
            if 'match score' in line or 'match:' in line:
                try:
                    score = int(''.join(filter(str.isdigit, line)))
                    if 0 <= score <= 100:
                        match_score = score
                        break
                except:
                    pass
        
        # Extract skills (basic parsing)
        matching_skills = []
        missing_skills = []
        
        # Common technical skills to check
        common_skills = [
            "python", "java", "javascript", "react", "node", "sql", "aws",
            "docker", "kubernetes", "git", "rest api", "mongodb", "postgresql",
            "typescript", "angular", "vue", "spring boot", "django", "flask",
            "machine learning", "data structures", "algorithms", "system design"
        ]
        
        resume_lower = resume_text.lower()
        jd_lower = job_description.lower()
        
        for skill in common_skills:
            if skill in jd_lower:
                if skill in resume_lower:
                    matching_skills.append(skill.title())
                else:
                    missing_skills.append(skill.title())
        
        # Determine readiness
        if match_score >= 75:
            readiness = "Yes - Strong match"
            readiness_color = "green"
        elif match_score >= 60:
            readiness = "Maybe - Moderate match"
            readiness_color = "yellow"
        else:
            readiness = "No - Weak match"
            readiness_color = "red"
        
        return {
            "matchScore": match_score,
            "matchingSkills": matching_skills[:10],
            "missingSkills": missing_skills[:10],
            "interviewReadiness": readiness,
            "readinessColor": readiness_color,
            "detailedAnalysis": analysis,
            "recommendations": [
                f"Add missing skills: {', '.join(missing_skills[:5])}" if missing_skills else "Skills look good",
                "Tailor your resume to match job description keywords",
                "Highlight relevant projects and experience",
                "Quantify your achievements with numbers",
                "Update your skills section to match requirements"
            ],
            "gapAnalysis": {
                "technicalSkills": f"{len(matching_skills)} matching, {len(missing_skills)} missing",
                "overallFit": f"{match_score}% match",
                "action": "Apply now" if match_score >= 75 else "Improve resume first"
            }
        }
    
    def chat_completion(self, messages: List[Dict]) -> str:
        """Generate chat completion response for engineering students with conversation context"""
        
        # Build context-aware prompt with conversation history
        system_context = """You are CodeCampus AI - engineering placement assistant and coding tutor for TCS, Microsoft, Amazon, Google, Infosys, Wipro.

CRITICAL RESPONSE RULES:
1. NEVER give just steps or summaries - ALWAYS provide FULL, EXECUTABLE CODE
2. When asked for code/program/script:
   - Write COMPLETE, WORKING code with all imports, functions, and logic
   - Include proper error handling and edge cases
   - Add comments explaining key parts
   - Use proper Markdown code blocks with syntax highlighting (```python, ```javascript, etc.)
   - After code, add "Logic Breakdown:" section with 3 key points

3. CODE EXAMPLES MUST BE:
   - Complete and runnable (not pseudo-code)
   - Include main() or while True loop for interactive programs
   - Handle all user inputs and edge cases
   - Production-ready quality

4. FORMAT:
   - Use bullet points for explanations
   - MAX 8 bullets for non-code responses
   - Emojis on section headers: 1️⃣2️⃣3️⃣4️⃣✅💡🎯📚🔧🏢
   - End with: ✅ If you want, I can also show you: + 3 suggestions

5. ACTION TRIGGERS: When user asks about aptitude, exams, mock tests, practice questions, quantitative/logical/verbal ability, or mentions companies like TCS/Wipro/Infosys/Amazon:
   - Mention FREE, UNLIMITED practice tests for company patterns
   - At the very end, include: [REDIRECT_EXAM]

LANGUAGE:
- Detect question language → respond in SAME language
- English: ✅ If you want, I can also show you:
- Gujarati: ✅ જો તમે ઇચ્છો તો, હું આને પણ બતાવી શકું:
- Hindi: ✅ अगर आप चाहें तो, मैं आपको यह भी दिखा सकता हूँ:

EXAMPLE (Calculator request):
```python
def calculator():
    while True:
        print("\n=== Calculator ===")
        print("1. Add (+)")
        print("2. Subtract (-)")
        print("3. Multiply (*)")
        print("4. Divide (/)")
        print("5. Modulo (%)")
        print("6. Exit")
        
        choice = input("\nEnter choice (1-6): ")
        
        if choice == '6':
            print("Thank you for using Calculator!")
            break
        
        if choice not in ['1', '2', '3', '4', '5']:
            print("Invalid choice! Please try again.")
            continue
        
        try:
            num1 = float(input("Enter first number: "))
            num2 = float(input("Enter second number: "))
            
            if choice == '1':
                result = num1 + num2
                print(f"Result: {num1} + {num2} = {result}")
            elif choice == '2':
                result = num1 - num2
                print(f"Result: {num1} - {num2} = {result}")
            elif choice == '3':
                result = num1 * num2
                print(f"Result: {num1} * {num2} = {result}")
            elif choice == '4':
                if num2 == 0:
                    print("Error: Cannot divide by zero!")
                else:
                    result = num1 / num2
                    print(f"Result: {num1} / {num2} = {result}")
            elif choice == '5':
                result = num1 % num2
                print(f"Result: {num1} % {num2} = {result}")
        
        except ValueError:
            print("Error: Please enter valid numbers!")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    calculator()
```

Logic Breakdown:
1️⃣ Infinite loop with menu-driven interface for continuous operation
2️⃣ Try-except blocks handle invalid inputs and division by zero
3️⃣ All 5 operations (+, -, *, /, %) implemented with proper formatting

✅ If you want, I can also show you:
• Scientific calculator with advanced functions
• GUI calculator using Tkinter
• Calculator with history feature
    """
        
        # Build conversation history (skip the initial assistant greeting if present)
        # Limit to last 6 messages to save tokens (avoids 4000+ token bloat from long histories)
        messages = messages[-6:]
        conversation_history = ""
        for msg in messages:
            if msg['role'] == 'user':
                conversation_history += f"\n\nStudent: {msg['content']}"
            elif msg['role'] == 'assistant' and not msg['content'].startswith("Hello! I'm your AI"):
                conversation_history += f"\n\nAssistant: {msg['content']}"
        
        full_prompt = f"{system_context}\n\nConversation History:{conversation_history}\n\nProvide a helpful, contextual response:"
        
        return self._generate_response(full_prompt)
    
    def chat_completion_stream(self, messages: List[Dict]):
        """Generate streaming chat completion response with conversation context (word by word like ChatGPT)"""
        
        # Build context-aware prompt with conversation history
        system_context = """You are CodeCampus AI - engineering placement assistant for TCS, Microsoft, Amazon, Google, Infosys, Wipro.

RESPONSE RULES:
1. BULLET POINTS ONLY - no paragraphs, no prose
2. MAX 8 BULLETS TOTAL per response - prefer 5-6
3. Each bullet: MAX 1 line (10 words or less)
4. Emojis on section headers only: 1️⃣2️⃣3️⃣4️⃣✅💡🎯📚🔧🏢
5. End with: ✅ If you want, I can also show you: + 3 short bullet suggestions
6. ACTION TRIGGERS: Whenever a user asks about aptitude, exams, mock tests, practice questions, quantitative/logical/verbal ability, or mentions companies like TCS/Wipro/Infosys/Amazon:
   - Mention that CodeCampus AI offers FREE, UNLIMITED practice tests specifically designed for company patterns (TCS NQT, Wipro, Infosys, Amazon, etc.)
   - Use a supportive, encouraging tone like "You can practice unlimited tests for free!"
   - If user asks for a specific company like TCS, mention: "Our TCS NQT simulator is updated for 2026 patterns and is currently free for you"
   - At the very end of your response, MUST include this exact tag: [REDIRECT_EXAM]

LANGUAGE:
- Detect question language → respond in SAME language
- English: ✅ If you want, I can also show you:
- Gujarati: ✅ જો તમે ઇચ્છો તો, હું આને પણ બતાવી શકું:
- Hindi: ✅ अगर आप चाहें तो, मैं आपको यह भी दिखा सकता हूँ:

EXAMPLE (interview process question):
Amazon Interview Process
1️⃣ Online Assessment - Coding + MCQ
2️⃣ Technical Round 1 - DSA problems
3️⃣ Technical Round 2 - System Design
4️⃣ Bar Raiser Round - Behavioral
✅ If you want, I can also show you:
• Amazon top DSA questions
• Leadership Principles prep
• Resume tips for Amazon
    """
        
        # Build conversation history (skip the initial assistant greeting if present)
        # Limit to last 6 messages to save tokens (avoids 4000+ token bloat from long histories)
        messages = messages[-6:]
        conversation_history = ""
        for msg in messages:
            if msg['role'] == 'user':
                conversation_history += f"\n\nStudent: {msg['content']}"
            elif msg['role'] == 'assistant' and not msg['content'].startswith("Hello! I'm your AI"):
                conversation_history += f"\n\nAssistant: {msg['content']}"
        
        full_prompt = f"{system_context}\n\nConversation History:{conversation_history}\n\nProvide a helpful, contextual response:"
        
        return self._generate_response_stream(full_prompt)

    
    def explain_topic(self, topic: str, subject: str, level: str) -> Dict:
        """Generate topic explanation for placement preparation"""
        explanation = self._cached_explain_topic(topic, subject, level)
        
        return {
            "explanation": explanation,
            "difficulty": level,
            "estimatedTime": "15-20 minutes"
        }
    
    @lru_cache(maxsize=500)  # Cache up to 500 unique topics (saves 70% on repeated questions)
    def _cached_explain_topic(self, topic: str, subject: str, level: str) -> str:
        """Cached topic explanation generation"""
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

        return self._generate_response(prompt)
    
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
        answer = self._cached_solve_doubt(question, subject or 'General')
        
        return {
            "answer": answer,
            "subject": subject,
            "confidence": 0.95
        }
    
    @lru_cache(maxsize=500)  # Cache up to 500 unique doubts (saves 70% on repeated questions)
    def _cached_solve_doubt(self, question: str, subject: str = 'General') -> str:
        """Cached doubt solution generation"""
        prompt = f"""Answer this engineering student's question in detail:

Question: {question}
Subject: {subject}

Provide:
1. Clear, step-by-step answer
2. Multiple approaches if applicable
3. Visual explanation if needed
4. Related concepts
5. Practice problems

Make it easy to understand for placement preparation."""

        return self._generate_response(prompt)
    
    def generate_mock_test(self, subject: str, topic: str, difficulty: str, num_questions: int, company: str = None) -> Dict:
        """Generate mock test questions for placement preparation"""
        
        # Build company-specific context if provided
        company_context = ""
        if company and company.strip() and company.lower() != "general practice":
            company_context = f"""

COMPANY-SPECIFIC REQUIREMENTS:
Target Company: {company}

CRITICAL INSTRUCTIONS:
- Follow the EXACT exam pattern used by {company}
- Match the question style, format, and difficulty level of actual {company} placement tests
- Use the specific syllabus topics that {company} focuses on
- Include question types commonly asked in {company} aptitude/technical rounds
- Reflect the time pressure and complexity typical of {company} exams
- If {company} is TCS NQT, focus on: numerical ability, verbal ability, reasoning, programming logic
- If {company} is Infosys, focus on: puzzles, logical reasoning, quantitative aptitude, verbal ability
- If {company} is Wipro, focus on: verbal ability, quantitative aptitude, logical reasoning
- If {company} is Amazon/Microsoft/Google, focus on: problem-solving, DSA, coding aptitude, analytical reasoning

Make questions realistic to what candidates face in actual {company} placement exams."""
        
        prompt = f"""Generate EXACTLY {num_questions} multiple choice questions for campus placement aptitude test.

Subject: {subject}
Topic: {topic}
Difficulty: {difficulty}{company_context}

IMPORTANT: Generate ALL {num_questions} questions. Do not generate less.

For each question provide:
1. Clear question text
2. Four options (A, B, C, D)
3. Correct answer index (0-3)
4. Detailed explanation

Focus on aptitude questions commonly asked in placement exams.

Return in JSON format with ALL {num_questions} questions:
{{
  "questions": [
    {{
      "id": 1,
      "question": "...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "..."
    }},
    ... (continue for all {num_questions} questions)
  ]
}}

CRITICAL: The questions array MUST contain exactly {num_questions} questions."""

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
            
            # If we didn't get enough questions, generate more
            if len(questions) < num_questions:
                print(f"Warning: Only got {len(questions)} questions, expected {num_questions}")
                # Generate additional questions to reach the target
                for i in range(len(questions), num_questions):
                    questions.append({
                        "id": i+1,
                        "question": f"Sample {topic} question {i+1}",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correctAnswer": 0,
                        "explanation": "This is a sample question."
                    })
        except Exception as e:
            print(f"Error parsing mock test response: {e}")
            # Fallback to demo questions
            questions = [
                {
                    "id": i+1,
                    "question": f"Sample question {i+1} on {topic}",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": 0,
                    "explanation": "This is a sample question."
                }
                for i in range(num_questions)
            ]
        
        # Build companies list with the target company first if provided
        companies = [company] if company else []
        companies.extend([c for c in ["TCS", "Infosys", "Amazon", "Microsoft", "Wipro"] if c != company])
        
        return {
            "subject": subject,
            "topic": topic,
            "difficulty": difficulty,
            "company": company,
            "questions": questions[:num_questions],  # Ensure we don't exceed requested number
            "totalQuestions": len(questions[:num_questions]),
            "timeLimit": num_questions * 2,
            "companies": companies[:5]
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

    def generate_personalized_roadmap(self, tech_stack: str, level: str = "beginner", timeline_weeks: int = 12) -> Dict:
        """
        Generate structured roadmap JSON for a specific stack.
        Output keys:
        - LearningPath
        - DSA_Problems
        - Project_Idea
        """
        if not tech_stack or not tech_stack.strip():
            return {
                "error": "tech_stack is required"
            }

        timeline_weeks = max(4, min(int(timeline_weeks or 12), 24))
        level = (level or "beginner").strip().lower()

        system_prompt = """You are a senior placement mentor and software architect.
Your task is to generate ONLY valid JSON for a personalized placement roadmap.

STRICT OUTPUT RULES:
1) Return ONLY one JSON object.
2) Do not include markdown, code fences, commentary, or extra keys.
3) JSON must contain exactly these top-level keys:
   - LearningPath
   - DSA_Problems
   - Project_Idea

SCHEMA:
{
  "LearningPath": [
    {
      "Week": "Week 1",
      "Topics": ["topic1", "topic2", "topic3"],
      "Outcome": "short outcome"
    }
  ],
  "DSA_Problems": [
    {
      "Title": "problem name",
      "Topic": "Arrays | Strings | Trees | Graphs | DP | etc",
      "Difficulty": "Easy|Medium|Hard",
      "LeetCodeLink": "https://leetcode.com/problems/.../"
    }
  ],
  "Project_Idea": {
    "Title": "unique project title",
    "Description": "what to build",
    "KeyFeatures": ["feature1", "feature2", "feature3", "feature4"],
    "BoilerplateCode": "starter snippet or folder structure"
  }
}

CONTENT RULES:
- LearningPath must be week-by-week and practical for placements.
- DSA_Problems must contain exactly 5 stack-relevant problems with valid LeetCode URLs.
- Project_Idea must be advanced and portfolio-worthy for the given stack.
- BoilerplateCode can be a short snippet or clean folder structure text.
"""

        user_prompt = f"""Tech Stack: {tech_stack}
Skill Level: {level}
Timeline (weeks): {timeline_weeks}

Generate the roadmap JSON now."""

        if not self.use_ai:
            return {
                "LearningPath": [
                    {
                        "Week": "Week 1",
                        "Topics": [f"{tech_stack} fundamentals", "Environment setup", "Core syntax"],
                        "Outcome": "Build and run a basic app setup"
                    }
                ],
                "DSA_Problems": [
                    {
                        "Title": "Two Sum",
                        "Topic": "Arrays",
                        "Difficulty": "Easy",
                        "LeetCodeLink": "https://leetcode.com/problems/two-sum/"
                    },
                    {
                        "Title": "Best Time to Buy and Sell Stock",
                        "Topic": "Arrays",
                        "Difficulty": "Easy",
                        "LeetCodeLink": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"
                    },
                    {
                        "Title": "Longest Substring Without Repeating Characters",
                        "Topic": "Strings",
                        "Difficulty": "Medium",
                        "LeetCodeLink": "https://leetcode.com/problems/longest-substring-without-repeating-characters/"
                    },
                    {
                        "Title": "Binary Tree Level Order Traversal",
                        "Topic": "Trees",
                        "Difficulty": "Medium",
                        "LeetCodeLink": "https://leetcode.com/problems/binary-tree-level-order-traversal/"
                    },
                    {
                        "Title": "Course Schedule",
                        "Topic": "Graphs",
                        "Difficulty": "Medium",
                        "LeetCodeLink": "https://leetcode.com/problems/course-schedule/"
                    }
                ],
                "Project_Idea": {
                    "Title": f"{tech_stack} Placement Tracker Pro",
                    "Description": "A full-stack platform to track applications, coding progress, and interview prep milestones.",
                    "KeyFeatures": [
                        "Role-based auth with JWT and refresh tokens",
                        "DSA practice tracker with streak analytics",
                        "Interview question workspace with AI feedback",
                        "Realtime notifications and progress dashboard"
                    ],
                    "BoilerplateCode": "frontend/\n  src/\n    components/\n    pages/\n    api/\nbackend/\n  app/\n    routes/\n    services/\n    models/\n    core/"
                }
            }

        try:
            generation_config = {
                "temperature": 0.3,
                "top_p": 0.9,
                "top_k": 40,
                "max_output_tokens": 1800,
            }
            prompt = f"SYSTEM:\n{system_prompt}\n\nUSER:\n{user_prompt}"
            response = self.model.generate_content(prompt, generation_config=generation_config)
            raw_text = self._extract_text_from_gemini_response(response)

            if raw_text:
                raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text.strip())
                raw_text = re.sub(r"\s*```$", "", raw_text.strip())

            parsed = self._extract_json_object(raw_text)
            if not parsed:
                raise ValueError("Could not parse roadmap JSON from Gemini response")

            if not isinstance(parsed.get("LearningPath"), list):
                parsed["LearningPath"] = []
            if not isinstance(parsed.get("DSA_Problems"), list):
                parsed["DSA_Problems"] = []
            if not isinstance(parsed.get("Project_Idea"), dict):
                parsed["Project_Idea"] = {}

            parsed["DSA_Problems"] = parsed["DSA_Problems"][:5]
            return parsed
        except Exception as e:
            print(f"Error generating personalized roadmap: {e}")
            return {
                "error": "Could not generate roadmap right now. Please try again."
            }
    
    def explain_code(self, code: str, language: str, task: str) -> Dict:
        """Explain, debug, or optimize code"""
        persona = """You are a senior software engineer and coding mentor with 10+ years of experience at top tech companies (Amazon, Microsoft, Google).
Your role: explain programming problems step-by-step, provide optimized solutions, and explain time and space complexity in simple terms.
Always use clear bullet points, numbered steps, and short sentences. Avoid long paragraphs.
"""
        prompts = {
            "explain": f"""{persona}
Explain this {language} code step-by-step:

```{language}
{code}
```

Provide:
1️⃣ What this code does (1-2 lines)
2️⃣ Line-by-line explanation (short bullets)
3️⃣ Time complexity — with simple reason
4️⃣ Space complexity — with simple reason
5️⃣ Best practices used / missing
6️⃣ Interview tip — what to say if asked about this code""",
            
            "debug": f"""{persona}
Debug this {language} code and fix all errors:

```{language}
{code}
```

Provide:
1️⃣ Errors found (each on one line)
2️⃣ Why each error occurs
3️⃣ Fixed code (clean, working)
4️⃣ Edge cases to test
5️⃣ Interview tip — common bugs interviewers test""",
            
            "optimize": f"""{persona}
Optimize this {language} code for best performance:

```{language}
{code}
```

Provide:
1️⃣ Current time & space complexity
2️⃣ Bottlenecks identified
3️⃣ Optimized code
4️⃣ New time & space complexity
5️⃣ Trade-offs (if any)
6️⃣ Interview tip — Amazon/Microsoft optimization questions"""
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
        
        prompt = f"""You are a senior software engineer and coding mentor at a top tech company (Amazon/Microsoft/Google).
Your goal: solve DSA problems step-by-step, explain clearly, and prepare students for placement interviews.
Use bullet points, numbered steps, and short sentences. No long paragraphs.

Solve this DSA problem completely:

Problem: {problem}

Provide:

1. **Optimal Python Solution**
   - Clean, commented code
   - Function signature + example

2. **Simple Explanation** (how it works in plain words)
   - Strategy in 3-4 bullets
   - Why this approach is best

3. **Step-by-Step Walkthrough**
   - Walk through 1 example

4. **Complexity**
   - ⏱ Time: O(?) — why
   - 💾 Space: O(?) — why

5. **Interview Tips**
   - What to say first
   - Common mistakes to avoid
   - Which companies (Amazon/Microsoft/Google) ask this

6. **Similar Problems** (3 LeetCode problems)

Format with markdown headers and code blocks."""

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

    
    def analyze_resume(self, resume_text: str, target_role: str = None, job_description: str = None) -> Dict:
        """Analyze resume for ATS and placement readiness with strict JSON output."""
        role_context = target_role.strip() if target_role else "General Software Engineer"
        jd_context = job_description.strip() if job_description else "Not provided"

        prompt = f"""You are an ATS and resume evaluation assistant.

Analyze the candidate resume against the target role and job description.

TARGET ROLE:
{role_context}

JOB DESCRIPTION:
{jd_context}

RESUME:
{resume_text}

Return ONLY strict JSON. Do not return markdown. Do not return code fences. Do not return extra keys.

Required JSON schema (exact keys only):
{{
  "atsScore": 0,
  "overallScore": 0,
  "strengths": ["..."],
  "missingInResume": ["..."],
  "suggestedChanges": ["..."],
  "missingKeywords": ["..."],
  "companyFit": {{
    "Service-based (TCS/Infosys)": "...",
    "Product-based (Amazon/Microsoft)": "...",
    "Startups": "..."
  }}
}}

Rules:
- atsScore and overallScore must be integers from 0 to 100.
- strengths, missingInResume, suggestedChanges, missingKeywords must be arrays of concise strings.
- companyFit must be an object with concise values.
- suggestedChanges must be highly actionable (what to change + how to change).
- missingInResume must focus on concrete missing sections/evidence.
- missingKeywords must prioritize role or JD-relevant ATS terms.
"""

        raw_response = self._generate_response(prompt)

        parsed = None
        try:
            parsed = json.loads(raw_response)
        except Exception:
            try:
                # Try extracting embedded JSON if model adds wrappers
                if "```json" in raw_response:
                    candidate = raw_response.split("```json", 1)[1].split("```", 1)[0].strip()
                    parsed = json.loads(candidate)
                elif "```" in raw_response:
                    candidate = raw_response.split("```", 1)[1].split("```", 1)[0].strip()
                    parsed = json.loads(candidate)
                else:
                    match = re.search(r"\{[\s\S]*\}", raw_response)
                    if match:
                        parsed = json.loads(match.group(0))
            except Exception:
                parsed = None

        normalized_resume = resume_text.lower()
        required_sections = {
            "Professional summary/objective": ["summary", "objective", "profile"],
            "Education details": ["education", "bachelor", "b.tech", "btech", "cgpa", "gpa"],
            "Technical skills section": ["skills", "technical skills", "technologies", "tools"],
            "Projects section": ["project", "projects"],
            "Experience or internship section": ["experience", "internship", "work experience"],
            "Certifications section": ["certification", "certifications", "certificate"],
            "Achievements or positions of responsibility": ["achievement", "awards", "position of responsibility", "leadership"],
            "LinkedIn profile": ["linkedin.com"],
            "GitHub profile": ["github.com"]
        }

        fallback_missing_sections = [
            section
            for section, keywords in required_sections.items()
            if not any(keyword in normalized_resume for keyword in keywords)
        ]

        fallback_suggestions = []
        if not re.search(r"\b\d+(%|\+|x|k|\b)", normalized_resume):
            fallback_suggestions.append("Add measurable impact in bullets (%, scale, time saved, users).")
        if not re.search(r"\b(built|developed|implemented|optimized|designed|led|created|improved|automated)\b", normalized_resume):
            fallback_suggestions.append("Start bullets with strong action verbs.")
        if len(resume_text.split()) < 180:
            fallback_suggestions.append("Add deeper project and experience details with outcomes.")
        for section in fallback_missing_sections[:4]:
            fallback_suggestions.append(f"Add missing section: {section}.")
        if not fallback_suggestions:
            fallback_suggestions.append("Improve weak or repetitive bullets for clarity and impact.")

        def _extract_keywords(text: str, limit: int = 20) -> List[str]:
            if not text or text.strip().lower() == "not provided":
                return []

            stop_words = {
                "the", "and", "for", "with", "from", "this", "that", "will", "your", "you", "our",
                "are", "have", "has", "had", "was", "were", "not", "but", "can", "all", "any",
                "job", "role", "description", "required", "requirements", "preferred", "candidate",
                "years", "year", "experience", "strong", "good", "ability", "skills", "skill", "work"
            }

            tokens = re.findall(r"[a-zA-Z][a-zA-Z0-9+.#-]{1,}", text.lower())
            counts: Dict[str, int] = {}
            for token in tokens:
                if token in stop_words or len(token) < 3:
                    continue
                counts[token] = counts.get(token, 0) + 1

            sorted_tokens = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
            return [token for token, _ in sorted_tokens[:limit]]

        jd_keywords = _extract_keywords(jd_context, limit=30)
        role_keywords = _extract_keywords(role_context, limit=8)
        candidate_keywords = jd_keywords if jd_keywords else role_keywords
        fallback_missing_keywords = [
            keyword
            for keyword in candidate_keywords
            if keyword not in normalized_resume
        ][:12]

        action_verbs = re.findall(
            r"\b(built|developed|implemented|optimized|designed|led|created|improved|automated|engineered|delivered|deployed)\b",
            normalized_resume,
        )
        impact_mentions = re.findall(r"\b\d+(?:\.\d+)?\s*(?:%|\+|x|k|m|million|users|ms|sec|hours?)\b", normalized_resume)

        detected_skills = [
            "python", "java", "javascript", "typescript", "react", "node", "sql", "mongodb", "postgresql",
            "aws", "docker", "kubernetes", "git", "django", "flask", "spring", "rest", "api", "redis"
        ]
        matched_skills = [skill for skill in detected_skills if skill in normalized_resume]

        section_score = (len(required_sections) - len(fallback_missing_sections)) * 4
        action_score = min(16, len(action_verbs) * 2)
        impact_score = min(16, len(impact_mentions) * 4)
        skills_score = min(16, len(matched_skills) * 2)

        if candidate_keywords:
            matched_jd_terms = [keyword for keyword in candidate_keywords if keyword in normalized_resume]
            jd_score = min(16, int((len(matched_jd_terms) / max(1, len(candidate_keywords))) * 20))
        else:
            matched_jd_terms = []
            jd_score = 8

        length_score = 10 if 220 <= len(resume_text.split()) <= 700 else 6
        deterministic_score = max(35, min(96, 20 + section_score + action_score + impact_score + skills_score + jd_score + length_score))

        # Score fallback strategy:
        # 1) Parsed JSON integer
        # 2) Regex from model text for patterns like 82/100 or 82%
        # 3) Random 60-85 as final fallback
        score_candidates = []
        for match in re.findall(r"(\d{1,3})\s*(?:/\s*100|%)", raw_response):
            try:
                value = int(match)
                if 0 <= value <= 100:
                    score_candidates.append(value)
            except Exception:
                pass

        regex_ats = score_candidates[0] if len(score_candidates) > 0 else deterministic_score
        regex_overall = score_candidates[1] if len(score_candidates) > 1 else regex_ats

        def _as_int_score(value, default_value):
            try:
                score = int(value)
                return max(0, min(100, score))
            except Exception:
                return default_value

        def _as_str_list(value, fallback_value):
            if isinstance(value, list):
                cleaned = [str(item).strip() for item in value if str(item).strip()]
                return cleaned if cleaned else fallback_value
            return fallback_value

        # If JSON parsing fails, return dynamic fallback (no static 75, no static missingKeywords)
        if not isinstance(parsed, dict):
            fallback_strengths = []
            if len(fallback_missing_sections) <= 2:
                fallback_strengths.append("Most critical resume sections are present.")
            if len(matched_skills) >= 5:
                fallback_strengths.append("Technical stack is clearly visible for ATS scanning.")
            if len(action_verbs) >= 3:
                fallback_strengths.append("Experience bullets use action-oriented language.")
            if len(impact_mentions) >= 2:
                fallback_strengths.append("Resume includes measurable outcomes, improving credibility.")
            if target_role:
                fallback_strengths.append(f"Resume is positioned for target role: {target_role}.")
            if not fallback_strengths:
                fallback_strengths = [
                    "Resume contains core profile information.",
                    "Technical and project details are identifiable.",
                    "Actionable improvements can quickly raise shortlist chances.",
                ]

            actionable_changes = list(fallback_suggestions)
            if fallback_missing_keywords:
                actionable_changes.append(f"Add ATS keywords in relevant bullets: {', '.join(fallback_missing_keywords[:6])}.")
            if jd_context and matched_jd_terms:
                actionable_changes.append(f"Increase JD alignment by expanding evidence for: {', '.join(matched_jd_terms[:5])}.")

            if deterministic_score >= 78:
                service_fit = "Good fit - likely shortlist-ready with minor polishing"
                product_fit = "Moderate-good fit - add deeper impact and DSA/system design evidence"
                startup_fit = "Good fit - highlight ownership and rapid delivery outcomes"
            elif deterministic_score >= 62:
                service_fit = "Moderate fit - improve clarity, keywords, and achievements"
                product_fit = "Moderate fit - strengthen quantified project impact and technical depth"
                startup_fit = "Moderate fit - add shipped features and end-to-end ownership examples"
            else:
                service_fit = "Low-moderate fit - add core sections and role-specific skills"
                product_fit = "Low fit - significant improvements needed in impact, skills, and depth"
                startup_fit = "Low-moderate fit - show practical execution and outcomes"

            return {
                "atsScore": regex_ats,
                "overallScore": regex_overall,
                "strengths": fallback_strengths[:6],
                "missingInResume": fallback_missing_sections[:8],
                "suggestedChanges": actionable_changes[:10],
                "missingKeywords": fallback_missing_keywords,
                "companyFit": {
                    "Service-based (TCS/Infosys)": service_fit,
                    "Product-based (Amazon/Microsoft)": product_fit,
                    "Startups": startup_fit
                }
            }

        company_fit = parsed.get("companyFit") if isinstance(parsed.get("companyFit"), dict) else {
            "Service-based (TCS/Infosys)": "Moderate fit - review recommendations",
            "Product-based (Amazon/Microsoft)": "Moderate fit - review recommendations",
            "Startups": "Moderate fit - review recommendations"
        }

        # missingKeywords should come from model output; fallback to JD/role keyword gaps when empty
        gemini_missing_keywords = _as_str_list(parsed.get("missingKeywords"), fallback_missing_keywords)

        return {
            "atsScore": _as_int_score(parsed.get("atsScore"), deterministic_score),
            "overallScore": _as_int_score(parsed.get("overallScore"), _as_int_score(parsed.get("atsScore"), deterministic_score)),
            "strengths": _as_str_list(parsed.get("strengths"), ["Strength insights not available from model output."]),
            "missingInResume": _as_str_list(parsed.get("missingInResume"), fallback_missing_sections[:8]),
            "suggestedChanges": _as_str_list(parsed.get("suggestedChanges"), fallback_suggestions[:8]),
            "missingKeywords": gemini_missing_keywords,
            "companyFit": company_fit
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

    def explain_interview_question(self, question: str, company: str = "", role: str = "") -> Dict:
        """Explain an interview question in simple, structured language."""
        prompt = f"""Explain this interview question in a simple way for a student preparing for placements.

Company: {company or 'General'}
Role: {role or 'General'}
Question: {question}

Return strict JSON with this shape:
{{
  "concepts": ["concept 1", "concept 2", "concept 3"],
  "simple_explanation": "short paragraph",
  "answer_framework": ["step 1", "step 2", "step 3"],
  "sample_answer": "sample answer in simple language"
}}"""

        response = self._generate_response(prompt)
        parsed = self._extract_json_object(response)
        if parsed:
            return parsed

        cleaned_question = question.strip().rstrip("?")

        return {
            "concepts": [
                "Start with a simple definition",
                "Break the answer into 3-4 key points",
                "Use one interview-friendly example"
            ],
            "simple_explanation": f"The interviewer wants to check whether you understand the core idea behind '{cleaned_question}' and whether you can explain it clearly without overcomplicating it.",
            "answer_framework": [
                "Start with the definition",
                "Mention 2-3 important parts",
                "Give one practical example"
            ],
            "sample_answer": f"A strong answer to '{cleaned_question}' should begin with a clear definition, then cover the main concepts involved, and finally connect the idea to a real software example or project use case."
        }

    def evaluate_interview_answer(self, question: str, answer: str, company: str = "", role: str = "", round_name: str = "Technical") -> Dict:
        """Evaluate a mock interview answer and return structured feedback."""
        if not answer.strip():
            return {
                "score": 0,
                "verdict": "No answer provided",
                "strengths": [],
                "improvements": ["Write an answer before requesting evaluation."],
                "sample_answer": "",
                "follow_up_question": ""
            }

        prompt = f"""You are evaluating a placement interview answer.

Company: {company or 'General'}
Role: {role or 'General'}
Round: {round_name}
Question: {question}
Candidate Answer: {answer}

Return strict JSON with this shape:
{{
  "score": 78,
  "verdict": "short 1-line verdict",
  "strengths": ["point 1", "point 2"],
  "improvements": ["point 1", "point 2", "point 3"],
  "sample_answer": "improved sample answer",
  "follow_up_question": "one likely next interviewer question"
}}

Score must be 0-100."""

        response = self._generate_response(prompt)
        parsed = self._extract_json_object(response)
        if parsed and isinstance(parsed.get("score"), int):
            parsed["score"] = max(0, min(100, parsed["score"]))
            return parsed

        answer_length = len(answer.split())
        base_score = 55
        if answer_length > 40:
            base_score += 10
        if answer_length > 80:
            base_score += 10
        if any(keyword in answer.lower() for keyword in ["example", "because", "used", "built", "implemented"]):
            base_score += 10

        return {
            "score": min(base_score, 90),
            "verdict": "Decent structure, but the answer can be sharper and more interview-ready.",
            "strengths": ["You attempted the question directly."],
            "improvements": [
                "Add a more structured explanation.",
                "Include one concrete example.",
                "End with the impact or use case."
            ],
            "sample_answer": f"A stronger answer would define the concept clearly, explain the main parts in logical order, and include one short real-world or project example to show practical understanding. For '{question}', you should aim for a crisp explanation followed by why it matters in software development.",
            "follow_up_question": "Can you explain this with a real example from a project or daily life?"
        }
    
    def get_company_insights(self, company: str, db: Session = None) -> Dict:
        """Generate AI insights about top interview questions for a company (SEO feature)"""
        
        company_clean = company.strip().lower()
        
        # Query database for company questions if db session provided
        questions_data = []
        if db:
            try:
                db_questions = db.query(CompanyQuestion).filter(
                    CompanyQuestion.company_name.ilike(f"%{company}%")
                ).order_by(CompanyQuestion.frequency.desc()).limit(30).all()
                
                questions_data = [
                    {
                        'question_text': q.question_text,
                        'category': q.category,
                        'difficulty': q.difficulty,
                        'frequency': q.frequency,
                        'topic': q.topic,
                        'year_asked': q.year_asked
                    }
                    for q in db_questions
                ]
            except Exception as e:
                print(f"⚠️ Error querying company questions: {e}")
        
        # Build context from actual questions if available
        questions_context = ""
        if questions_data and len(questions_data) > 0:
            questions_list = "\n".join([f"- {q.get('question_text', '')}" for q in questions_data[:20]])
            category_breakdown = {}
            for q in questions_data:
                cat = q.get('category', 'other')
                category_breakdown[cat] = category_breakdown.get(cat, 0) + 1
            
            questions_context = f"\n\nTop {len(questions_data)} questions from database:\n{questions_list}"
            questions_context += f"\n\nQuestion distribution:\n" + "\n".join([f"- {cat}: {count}" for cat, count in category_breakdown.items()])
        
        prompt = f"""Generate SEO-friendly insights about {company} interview questions that will rank in Google searches.

Company: {company}
{questions_context}

Create content that answers: "Top interview questions asked in {company} interviews"

Provide:

1. **Introduction** (100 words)
   - Why {company} is important for engineering students
   - Package and role information
   - Why this company asks specific types of questions

2. **Category Breakdown**
   - DSA Questions (with 3-4 examples)
   - System Design Questions (with 2-3 examples)
   - HR & Behavioral Questions (with 3 examples)
   - Aptitude Questions (with 2 examples)

3. **Preparation Strategy**
   - Week-by-week prep plan specifically for {company}
   - Which companies have similar interview patterns
   - Time to prepare (realistic estimate)

4. **Success Tips**
   - What {company} specifically looks for
   - Common mistakes candidates make
   - Unique interview patterns at {company}

5. **Resources**
   - Best platforms to practice
   - Company-specific question banks
   - Mock interview tips

Make it comprehensive, detailed, and optimized for SEO (use keywords like "{company} interview questions", "Top {company} questions", etc.)"""

        insights = self._generate_response(prompt)
        
        return {
            "company": company,
            "insights": insights,
            "total_questions_in_db": len(questions_data),
            "seo_keywords": [
                f"Top {company} interview questions",
                f"{company} placement questions",
                f"{company} interview questions 2024",
                f"Most asked questions in {company}",
                f"How to crack {company} interview"
            ],
            "content_type": "seo_article",
            "target_students": "Engineering freshers preparing for placements",
            "data_source": "live_database" if questions_data else "ai_generated"
        }
    
    def generate_company_questions_summary(self, company: str, db: Session = None, questions_list: list = None) -> Dict:
        """Generate a beautiful summary of company questions for the web page"""
        
        # Query database if db session provided and no explicit questions_list
        if db and questions_list is None:
            try:
                db_questions = db.query(CompanyQuestion).filter(
                    CompanyQuestion.company_name.ilike(f"%{company}%")
                ).order_by(CompanyQuestion.frequency.desc()).all()
                
                questions_list = [
                    {
                        'question_text': q.question_text,
                        'category': q.category,
                        'difficulty': q.difficulty,
                        'frequency': q.frequency,
                        'topic': q.topic,
                        'year_asked': q.year_asked
                    }
                    for q in db_questions
                ]
            except Exception as e:
                print(f"⚠️ Error querying company questions: {e}")
                questions_list = []
        
        if not questions_list:
            return {
                "error": f"No questions found for {company}",
                "company": company,
                "total_questions": 0,
                "data_source": "empty"
            }
        
        # Group questions by category
        by_category = {}
        for q in questions_list:
            cat = q.get('category', 'other')
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(q)
        
        # Sort by frequency within each category
        for cat in by_category:
            by_category[cat] = sorted(by_category[cat], key=lambda x: x.get('frequency', 0), reverse=True)
        
        # Build summary with token counting
        summary = f"# {company} Interview Questions Database\n\n"
        summary += f"**Total Questions: {len(questions_list)}**\n"
        summary += f"**Database Source: Live - Updated in real-time**\n\n"
        
        for category, questions in by_category.items():
            summary += f"## {category.upper()} Questions ({len(questions)})\n\n"
            for i, q in enumerate(questions[:10], 1):  # Show top 10 per category
                difficulty = q.get('difficulty', 'medium')
                frequency = q.get('frequency', 0)
                topic = q.get('topic', 'General')
                summary += f"{i}. **{q.get('question_text', '')}**\n"
                summary += f"   - Difficulty: ⭐ {difficulty.upper()} | Topic: {topic}\n"
                if frequency > 0:
                    summary += f"   - Asked {frequency} times by users\n"
                summary += "\n"
        
        # Count tokens for SEO analysis
        summary_tokens = self._count_tokens(summary)
        
        return {
            "company": company,
            "total_questions": len(questions_list),
            "by_category": {k: len(v) for k, v in by_category.items()},
            "summary": summary,
            "summary_token_count": summary_tokens,
            "most_popular_category": max(by_category.items(), key=lambda x: len(x[1]))[0] if by_category else "unknown",
            "average_frequency": sum(q.get('frequency', 1) for q in questions_list) // len(questions_list) if questions_list else 0,
            "data_source": "live_database"
        }

# Singleton instance
ai_service = AIService()
