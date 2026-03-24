from fastapi import FastAPI, HTTPException, UploadFile, File, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator, Field
from typing import List, Optional, Any
import os
import asyncio
import base64
from rag import retrieve_schemes, get_ai_response, evaluate_eligibility
import json
import hashlib
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fpdf import FPDF
import io

# In-memory caches for free-tier protection
MATCH_CACHE = {}
CHAT_CACHE = {}

app = FastAPI(title="PolicyPilot API")

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173"), "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

class UserProfile(BaseModel):
    state: Optional[str] = Field(None, max_length=50)
    district: Optional[str] = Field(None, max_length=50)
    age: Optional[int] = Field(None, ge=1, le=120)
    income: Optional[int] = Field(None, ge=0)
    occupation: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=50)
    situation: Optional[str] = Field(None, min_length=15, max_length=500)
    language: Optional[str] = Field("English", max_length=20)

    @field_validator('age', 'income', mode='before')
    @classmethod
    def empty_string_to_none(cls, v: Any) -> Any:
        if v == "":
            return None
        return v

class Scheme(BaseModel):
    id: str
    name: str
    match_score: int
    benefit: str
    category: str
    deadline: str
    verified: bool
    reason: Optional[str] = None
    red_flags: Optional[List[str]] = []
    missing_docs: Optional[List[str]] = []

class ChatRequest(BaseModel):
    query: str
    profile: Optional[UserProfile] = None

class GeneratePdfRequest(BaseModel):
    profile: UserProfile
    scheme: Scheme
    name: str
    match_score: int
    benefit: str
    category: str
    deadline: str
    verified: bool
    reason: Optional[str] = None
    red_flags: Optional[List[str]] = []
    missing_docs: Optional[List[str]] = []

class ChatRequest(BaseModel):
    query: str
    profile: Optional[UserProfile] = None

@app.get("/")
def read_root():
    return {"message": "PolicyPilot API is running with Local RAG"}

async def process_candidate(query, profile_dict, doc, meta, i, language="English"):
    try:
        verdict = await evaluate_eligibility(query, profile_dict, doc, language)
        return Scheme(
            id=meta.get('scheme_id', f'scheme_{i}'),
            name=meta.get('scheme_id', 'Unknown Scheme').upper().replace("_", " "),
            match_score=verdict.get('confidence', 70),
            benefit=verdict.get('benefit', "Benefit details in portal."),
            category=verdict.get('category', "General"),
            deadline=verdict.get('deadline', "Check portal"),
            verified=verdict.get('eligible', True),
            reason=verdict.get('reason', "Qualified based on semantic match."),
            red_flags=verdict.get('red_flags', []),
            missing_docs=verdict.get('missing_docs', [])
        )
    except Exception as e:
        print(f"Error processing candidate {i}: {e}")
        return None

@app.post("/extract-doc", response_model=UserProfile)
@limiter.limit("5/minute")
async def extract_doc(request: Request, file: UploadFile = File(...)):
    """Use Gemini Vision to extract profile info from an uploaded document image."""
    from rag import model
    if not model:
        raise HTTPException(status_code=503, detail="AI model not configured.")
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Max 5MB allowed.")
    b64 = base64.b64encode(contents).decode("utf-8")
    mime = file.content_type or "image/jpeg"
    prompt = """
    You are an expert document reader for Indian government documents.
    Look at this document image and extract the following information if present:
    - Full Name
    - Age / Date of Birth
    - State
    - District / City
    - Annual Income
    - Occupation (Farmer / Labourer / Business / Student / etc.)
    - Category (SC / ST / OBC / General / EWS)
    - Any other relevant details
    
    Return ONLY a valid JSON object with keys:
    "state", "district", "age" (integer or null), "income" (integer or null), 
    "occupation", "category", "situation" (a 1-2 sentence summary of the person's situation based on the document).
    Do not include any other text.
    """
    response = await model.generate_content_async([
        {"mime_type": mime, "data": b64},
        prompt
    ])
    try:
        clean = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean)
        return UserProfile(**data)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse document: {e}")

@app.post("/match", response_model=List[Scheme])
@limiter.limit("10/minute")
async def match_schemes(request: Request, profile: UserProfile):
    # Validation
    if not profile.situation or len(profile.situation) < 15:
        raise HTTPException(status_code=400, detail="Please provide a more detailed situation (min 15 chars).")

    # Cache Key Generation
    cache_key = hashlib.md5(json.dumps(profile.dict(), sort_keys=True).encode()).hexdigest()
    if cache_key in MATCH_CACHE:
        print(f"API: Serving MATCH from cache for key {cache_key}")
        return MATCH_CACHE[cache_key]

    # Prioritize free-text situation for matching
    query = f"User situation: {profile.situation}. Profile: {profile.occupation}, {profile.age} years old, {profile.income} income, {profile.state} state."
    
    print(f"API: Matching query: {query}")
    results = retrieve_schemes(query, n_results=5)
    print(f"API: Retrieval results found: {len(results['documents'][0]) if results['documents'] else 0}")
    
    match_tasks = []
    if results['documents']:
        # Only process top 3 candidates to stay within Gemini free-tier rate limits
        for i, doc in enumerate(results['documents'][0][:3]):
            meta = results['metadatas'][0][i]
            match_tasks.append(process_candidate(query, profile.dict(), doc, meta, i, profile.language))
            
    schemes = await asyncio.gather(*match_tasks)
    
    # Filter out None results if any error occurred
    schemes = [s for s in schemes if s]
    
    # Sort by match score (highest first)
    schemes.sort(key=lambda x: x.match_score, reverse=True)
    
    # Simple Conflict Detection (e.g. mutual exclusivity between housing schemes)
    housing_schemes = [s for s in schemes if "housing" in s.category.lower()]
    if len(housing_schemes) > 1:
        for s in housing_schemes:
            s.reason = f"⚠️ CONFLICT: {s.reason} Note: You may only claim one housing grant at a time."
            
    # Save to cache only if we actually got results back (prevents caching API failure Empty Lists)
    if len(schemes) > 0:
        MATCH_CACHE[cache_key] = schemes
    else:
        print("API: No schemes matched or API rate limit hit. Not caching empty result.")
        
    return schemes

@app.post("/generate-pdf")
@limiter.limit("5/minute")
async def generate_pdf(request: Request, req: GeneratePdfRequest):
    pdf = FPDF()
    pdf.add_page()
    
    # Title
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, f"Application Form: {req.scheme.name}", ln=True, align="C")
    
    # Subtitle
    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 10, "Common Service Centre (CSC) Official Document", ln=True, align="C")
    pdf.ln(10)
    
    # Applicant Details Section
    pdf.set_fill_color(240, 240, 240)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "1. Applicant Details", ln=True, fill=True)
    pdf.ln(2)
    
    pdf.set_font("Helvetica", "", 11)
    data = req.profile.dict()
    for key, val in data.items():
        if key not in ['situation', 'language'] and val is not None:
             pdf.cell(50, 8, f"{key.capitalize()}:", border=1)
             pdf.cell(0, 8, f" {val}", border=1, ln=True)
             
    pdf.ln(10)
    
    # Scheme Details Section
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "2. Scheme Details", ln=True, fill=True)
    pdf.ln(2)
    
    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(0, 6, f"Category: {req.scheme.category}")
    pdf.multi_cell(0, 6, f"Benefit: {req.scheme.benefit}")
    pdf.ln(2)
    pdf.set_font("Helvetica", "B", 11)
    pdf.multi_cell(0, 6, "Eligibility Reasoning:")
    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(0, 6, f"{req.scheme.reason}")
    pdf.ln(20)
    
    # Signatures
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 10, "Applicant Signature: _______________________", ln=True)
    pdf.cell(0, 10, "CSC Operator Signature: _______________________", ln=True)
    pdf.cell(0, 10, "Date: ____/____/2026", ln=True)
    
    # Generate bytes
    pdf_bytes = pdf.output()
    return Response(
        content=bytes(pdf_bytes), 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename={req.scheme.id}_application.pdf"}
    )

@app.post("/chat")
async def chat(request: ChatRequest):
    # Cache Check
    cache_key = hashlib.md5(f"{request.query}-{request.profile.dict() if request.profile else ''}".encode()).hexdigest()
    if cache_key in CHAT_CACHE:
        print(f"API: Serving CHAT from cache")
        return CHAT_CACHE[cache_key]

    # Retrieve context
    results = retrieve_schemes(request.query)
    context = results['documents'][0] if results['documents'] else ["No relevant scheme data found."]
    
    # Get AI response in relevant language
    lang = request.profile.language if request.profile else "English"
    response = await get_ai_response(request.query, context, lang)
    res_obj = {"response": response}
    CHAT_CACHE[cache_key] = res_obj
    return res_obj

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
