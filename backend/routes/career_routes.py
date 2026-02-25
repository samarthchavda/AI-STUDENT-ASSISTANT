from fastapi import APIRouter, UploadFile, File, HTTPException
from schemas import ResumeAnalyzeRequest, InterviewPrepRequest
from ai_service import ai_service
import PyPDF2
import io

router = APIRouter(prefix="/api/career", tags=["Career & Placement"])

@router.post("/resume-upload")
async def upload_resume(file: UploadFile = File(...)):
    """Upload and analyze resume PDF"""
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Validate file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")
    
    try:
        # Extract text from PDF
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
        resume_text = ""
        
        for page in pdf_reader.pages:
            resume_text += page.extract_text()
        
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF. Please ensure it's not a scanned image.")
        
        # Analyze the extracted text
        result = ai_service.analyze_resume(resume_text)
        result["filename"] = file.filename
        result["pages"] = len(pdf_reader.pages)
        
        return result
        
    except PyPDF2.errors.PdfReadError:
        raise HTTPException(status_code=400, detail="Invalid or corrupted PDF file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@router.post("/resume-analyze")
def analyze_resume(request: ResumeAnalyzeRequest):
    """Analyze resume text for ATS compatibility and improvements"""
    result = ai_service.analyze_resume(request.resumeText)
    return result

@router.post("/interview-prep")
def interview_preparation(request: InterviewPrepRequest):
    """Get company-specific interview preparation"""
    result = ai_service.interview_prep(request.company, request.role)
    return result

@router.post("/resume-generate")
def generate_resume(details: dict):
    """Generate professional resume (placeholder)"""
    return {
        "status": "success",
        "message": "Resume generation feature coming soon!",
        "note": "Demo mode - Would generate ATS-friendly resume"
    }
