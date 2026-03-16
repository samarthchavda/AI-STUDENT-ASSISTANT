from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.models.schemas import ResumeAnalyzeRequest, InterviewPrepRequest, ResumeGenerateRequest, PersonalizedRoadmapRequest, ResumeSectionEnhanceRequest, ResumeAIActionRequest
from app.services.ai_service import ai_service
from app.core.middleware import rate_limit
from app.core.database import get_db
import PyPDF2
import io
import os

# Try to import magic, but make it optional
try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    MAGIC_AVAILABLE = False
    print("⚠️  python-magic not available. File type detection will use basic checks only.")


def _create_resume_pdf_bytes(resume_content: str, template_type: str = "classic") -> io.BytesIO:
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="PDF generator not available. Install reportlab in backend environment."
        )

    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    page_width, page_height = A4

    template = (template_type or "classic").lower()

    left_margin = 48
    right_margin = 48
    top_margin = 48
    bottom_margin = 48
    max_width = page_width - left_margin - right_margin

    y = page_height - top_margin
    pdf.setFont("Helvetica", 11)

    if template == "modern":
        pdf.setFillColorRGB(0.11, 0.36, 0.55)
        pdf.rect(0, page_height - 72, page_width, 72, fill=1, stroke=0)
        pdf.setFillColorRGB(1, 1, 1)
        pdf.setFont("Helvetica-Bold", 16)
        first_line = resume_content.split('\n')[0].strip() if resume_content.strip() else "Updated Resume"
        pdf.drawString(left_margin, page_height - 42, first_line[:70])
        pdf.setFont("Helvetica", 10)
        second_line = resume_content.split('\n')[1].strip() if len(resume_content.split('\n')) > 1 else ""
        pdf.drawString(left_margin, page_height - 58, second_line[:100])
        pdf.setFillColorRGB(0, 0, 0)
        y = page_height - 90
    elif template == "minimal":
        left_margin = 40
        right_margin = 40
        top_margin = 36
        bottom_margin = 36
        y = page_height - top_margin
        pdf.setFont("Helvetica", 10)

    def wrap_line(text: str, max_chars: int = 105):
        words = text.split()
        if not words:
            return [""]
        lines = []
        current = words[0]
        for word in words[1:]:
            candidate = f"{current} {word}"
            if len(candidate) <= max_chars:
                current = candidate
            else:
                lines.append(current)
                current = word
        lines.append(current)
        return lines

    for raw_line in resume_content.split('\n'):
        cleaned_line = raw_line.strip().replace('**', '').replace('##', '')
        output_lines = [""] if cleaned_line == "" else wrap_line(cleaned_line)

        for line in output_lines:
            if y <= bottom_margin:
                pdf.showPage()
                if template == "minimal":
                    pdf.setFont("Helvetica", 10)
                else:
                    pdf.setFont("Helvetica", 11)
                y = page_height - top_margin

            if len(line) > 0 and len(line) < 42 and line.upper() == line:
                if template == "modern":
                    pdf.setFillColorRGB(0.11, 0.36, 0.55)
                    pdf.setFont("Helvetica-Bold", 11)
                elif template == "minimal":
                    pdf.setFont("Helvetica-Bold", 10)
                else:
                    pdf.setFont("Helvetica-Bold", 11)
            else:
                pdf.setFillColorRGB(0, 0, 0)
                if template == "minimal":
                    pdf.setFont("Helvetica", 10)
                else:
                    pdf.setFont("Helvetica", 11)

            pdf.drawString(left_margin, y, line)
            y -= 14 if template == "minimal" else 16

    pdf.save()
    buffer.seek(0)
    return buffer


def validate_pdf_file(file: UploadFile, contents: bytes) -> tuple[bool, str]:
    """
    Secure file validation
    1. Check file extension
    2. Check MIME type
    3. Verify it's actually a PDF
    """
    # 1. Filename validation (secure)
    if not file.filename:
        return False, "Filename is required"
    
    # Extract extension securely
    _, ext = os.path.splitext(file.filename)
    ext = ext.lower()
    
    if ext != '.pdf':
        return False, "Only PDF files are allowed"
    
    # 2. Check MIME type from content
    if MAGIC_AVAILABLE:
        try:
            mime = magic.from_buffer(contents, mime=True)
            if mime != 'application/pdf':
                return False, f"File is not a valid PDF (detected: {mime})"
        except Exception:
            # Fallback: Check PDF magic bytes
            if not contents.startswith(b'%PDF'):
                return False, "File is not a valid PDF"
    else:
        # Basic check: PDF magic bytes
        if not contents.startswith(b'%PDF'):
            return False, "File is not a valid PDF"
    
    # 3. Validate file size (max 5MB)
    if len(contents) > 5 * 1024 * 1024:
        return False, "File size must be less than 5MB"
    
    return True, "Valid PDF"


def extract_text_from_pdf(contents: bytes) -> tuple[str, int]:
    """
    Extract text from PDF with OCR fallback for scanned PDFs
    Returns: (text, page_count)
    """
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
        page_count = len(pdf_reader.pages)
        resume_text = ""
        
        for page in pdf_reader.pages:
            resume_text += page.extract_text() or ""
        
        # If no text extracted, it might be a scanned PDF
        if not resume_text.strip():
            # Try OCR (if available)
            try:
                import pytesseract
                from pdf2image import convert_from_bytes
                from PIL import Image
                
                print("📄 Scanned PDF detected, using OCR...")
                
                # Convert PDF to images
                images = convert_from_bytes(contents)
                
                # Extract text from each image
                ocr_text = ""
                for i, image in enumerate(images):
                    print(f"  Processing page {i+1}/{len(images)}...")
                    page_text = pytesseract.image_to_string(image)
                    ocr_text += page_text + "\n"
                
                if ocr_text.strip():
                    print("✓ OCR extraction successful")
                    return ocr_text, page_count
                else:
                    return "", page_count
                    
            except ImportError:
                # OCR libraries not installed
                return "", page_count
            except Exception as e:
                print(f"OCR error: {e}")
                return "", page_count
        
        return resume_text, page_count
        
    except PyPDF2.errors.PdfReadError:
        raise HTTPException(status_code=400, detail="Invalid or corrupted PDF file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")


router = APIRouter(prefix="/api/career", tags=["Career & Placement"])


@router.post("/resume-upload")
@rate_limit("10/minute")  # Rate limit for heavy AI endpoint
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    target_role: str = Form(None),
    job_description: str = Form(None)
):
    """
    Upload and analyze resume PDF with security improvements
    - Secure file validation (extension + MIME type)
    - OCR support for scanned PDFs
    - Prompt length limiting
    """
    
    # Read file contents
    contents = await file.read()
    
    # Secure validation
    is_valid, message = validate_pdf_file(file, contents)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)
    
    # Extract text (with OCR fallback)
    resume_text, page_count = extract_text_from_pdf(contents)
    
    if not resume_text.strip():
        raise HTTPException(
            status_code=400, 
            detail="Could not extract text from PDF. This might be a scanned image without OCR support. Please install pytesseract and pdf2image for OCR support."
        )
    
    # Limit prompt length to prevent AI crashes
    original_length = len(resume_text)
    if len(resume_text) > 4000:
        resume_text = resume_text[:4000]
        print(f"⚠️ Resume text truncated from {original_length} to 4000 chars")
    
    # Analyze the extracted text
    result = ai_service.analyze_resume(
        resume_text,
        target_role=target_role,
        job_description=job_description
    )
    result["filename"] = file.filename
    result["pages"] = page_count
    result["extractedText"] = resume_text
    result["truncated"] = original_length > 4000
    
    return result


@router.post("/resume-analyze")
@rate_limit("10/minute")  # Rate limit for heavy AI endpoint
async def analyze_resume(request: Request, req: ResumeAnalyzeRequest):
    """
    Analyze resume text for ATS compatibility and improvements
    - Prompt length limiting
    - Security validation
    """
    
    if not req.resumeText or len(req.resumeText.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume text is too short")
    
    # Limit prompt length
    resume_text = req.resumeText
    original_length = len(resume_text)
    if len(resume_text) > 4000:
        resume_text = resume_text[:4000]
    
    result = ai_service.analyze_resume(
        resume_text,
        target_role=req.target_role,
        job_description=req.job_description
    )
    result["truncated"] = original_length > 4000
    
    return result


@router.post("/resume-enhance-section")
@rate_limit("20/minute")
async def enhance_resume_section(request: Request, req: ResumeSectionEnhanceRequest):
    """Enhance a specific resume section text with AI."""
    if not req.content or len(req.content.strip()) < 5:
        raise HTTPException(status_code=400, detail="Please provide section content to enhance")

    content = req.content[:4000]
    enhanced = ai_service.enhance_resume_section(req.section, content)

    return {
        "section": req.section,
        "enhanced_content": enhanced,
    }


@router.post("/resume-ai-action")
@rate_limit("20/minute")
async def resume_ai_action(request: Request, req: ResumeAIActionRequest):
    """Perform a specialised AI action: suggest_skills, enhance_bullets, generate_summary, generate_demo_resume."""
    ctx = req.context

    if req.action == "suggest_skills":
        education_text = str(ctx.get("education", ""))[:2000]
        experience_text = str(ctx.get("experience", ""))[:2000]
        if not education_text and not experience_text:
            raise HTTPException(status_code=400, detail="Provide education and experience context")
        result = ai_service.suggest_skills(education_text, experience_text)
        return {"action": req.action, "result": result}

    elif req.action == "enhance_bullets":
        title = str(ctx.get("title", ""))[:200]
        company = str(ctx.get("company", ""))[:200]
        raw_text = str(ctx.get("raw_text", ""))[:3000]
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="Provide experience description to enhance")
        result = ai_service.enhance_experience_bullets(title, company, raw_text)
        return {"action": req.action, "result": result}

    elif req.action == "generate_summary":
        name = str(ctx.get("name", ""))[:200]
        role = str(ctx.get("role", ""))[:200]
        education = str(ctx.get("education", ""))[:1000]
        experience = str(ctx.get("experience", ""))[:1000]
        skills = str(ctx.get("skills", ""))[:500]
        result = ai_service.generate_professional_summary(name, role, education, experience, skills)
        return {"action": req.action, "result": result}

    elif req.action == "generate_demo_resume":
        role = str(ctx.get("role", "Full Stack Developer"))[:200]
        result = ai_service.generate_demo_resume_data(role)
        return {"action": req.action, "result": result}

    else:
        raise HTTPException(status_code=400, detail=f"Unknown action: {req.action}")


@router.post("/resume-ats-score")
@rate_limit("10/minute")
async def get_ats_score(request: Request, req: ResumeAnalyzeRequest, db: Session = Depends(get_db)):
    """
    Get detailed ATS score breakdown
    
    Returns:
    - Overall ATS Score (0-100)
    - Keywords Score (0-100)
    - Formatting Score (0-100)
    - Skills Score (0-100)
    - Experience Score (0-100)
    - Detailed recommendations
    """
    
    if not req.resumeText or len(req.resumeText.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume text is too short")
    
    # Limit prompt length
    resume_text = req.resumeText[:4000]
    
    result = ai_service.calculate_ats_score(resume_text)
    return result


@router.post("/job-match")
@rate_limit("10/minute")
async def match_job_description(
    request: Request,
    resume_text: str = Form(...),
    job_description: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Match resume against job description
    
    Returns:
    - Match Score (0-100)
    - Missing Skills
    - Matching Skills
    - Recommendations
    - Gap Analysis
    """
    
    if not resume_text or len(resume_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume text is too short")
    
    if not job_description or len(job_description.strip()) < 50:
        raise HTTPException(status_code=400, detail="Job description is too short")
    
    # Limit prompt lengths
    resume_text = resume_text[:4000]
    job_description = job_description[:2000]
    
    result = ai_service.match_resume_to_job(resume_text, job_description)
    return result


@router.post("/interview-prep")
@rate_limit("10/minute")
async def interview_preparation(request: Request, req: InterviewPrepRequest):
    """Get company-specific interview preparation"""
    result = ai_service.interview_prep(req.company, req.role)
    return result


@router.post("/roadmap")
@rate_limit("10/minute")
async def generate_personalized_roadmap(request: Request, req: PersonalizedRoadmapRequest):
    """
    Generate structured personalized roadmap JSON for a given tech stack.

    Returns JSON with keys:
    - LearningPath
    - DSA_Problems
    - Project_Idea
    """
    result = ai_service.generate_personalized_roadmap(
        tech_stack=req.tech_stack,
        level=req.level or "beginner",
        timeline_weeks=req.timeline_weeks or 12,
    )
    return result


@router.post("/resume-generate")
@rate_limit("10/minute")  # Rate limit for heavy AI endpoint
async def generate_resume(request: Request, req: ResumeGenerateRequest):
    """
    Generate improved resume PDF from resume text
    - Prompt length limiting
    """
    
    if not req.resumeText or len(req.resumeText.strip()) < 40:
        raise HTTPException(status_code=400, detail="Resume text is too short to generate updated PDF")
    
    # Limit prompt length
    resume_text = req.resumeText[:4000]
    
    updated_resume = ai_service.generate_updated_resume(resume_text)
    pdf_buffer = _create_resume_pdf_bytes(updated_resume, req.templateType)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=updated_resume.pdf"}
    )


@router.post("/resume-generate-upload")
@rate_limit("10/minute")  # Rate limit for heavy AI endpoint
async def generate_resume_from_upload(
    request: Request,
    file: UploadFile = File(...),
    template_type: str = Form("classic")
):
    """
    Generate improved resume PDF directly from uploaded source resume PDF
    - Secure file validation
    - OCR support for scanned PDFs
    - Prompt length limiting
    """
    
    # Read file contents
    contents = await file.read()
    
    # Secure validation
    is_valid, message = validate_pdf_file(file, contents)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)
    
    # Extract text (with OCR fallback)
    resume_text, page_count = extract_text_from_pdf(contents)
    
    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from PDF. This might be a scanned image without OCR support."
        )
    
    # Limit prompt length
    if len(resume_text) > 4000:
        resume_text = resume_text[:4000]
    
    updated_resume = ai_service.generate_updated_resume(resume_text)
    pdf_buffer = _create_resume_pdf_bytes(updated_resume, template_type)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=updated_resume.pdf"}
    )
