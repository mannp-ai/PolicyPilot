import os
import chromadb
from dotenv import load_dotenv

load_dotenv()
from chromadb.utils import embedding_functions
import google.generativeai as genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(f"RAG: GEMINI_API_KEY found: {bool(GEMINI_API_KEY)}")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    embedding_fn = embedding_functions.GoogleGenerativeAiEmbeddingFunction(
        api_key=GEMINI_API_KEY,
        task_type="RETRIEVAL_QUERY"
    )
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
else:
    print("WARNING: RAG falling back to DefaultEmbeddingFunction - Queries will likely fail!")
    embedding_fn = embedding_functions.DefaultEmbeddingFunction()
    model = None

current_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(current_dir, "chroma_db")
client = chromadb.PersistentClient(path=db_path)
collection = client.get_or_create_collection(
    name="schemes",
    embedding_function=embedding_fn
)
print(f"RAG: Collection 'schemes' loaded. Count: {collection.count()}")

def retrieve_schemes(query: str, n_results: int = 20):
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    return results

async def evaluate_eligibility(query: str, profile: dict, context: str, language: str = "English"):
    if not model:
        return {"eligible": False, "reason": "AI model not configured."}
    
    import asyncio
    await asyncio.sleep(0.5) # Reduced sleep for faster parallel processing
    
    prompt = f"""
    You are an expert government scheme advisor. 
    Evaluate if the user qualifies for the scheme based ONLY on the provided text.
    
    User Profile:
    {profile}
    
    Scheme text:
    {context}
    
    INSTRUCTIONS:
    - Be rigorous. Look for DISQUALIFIERS (e.g. income caps, exclusion criteria, age limits).
    - If the text doesn't mention a specific limit (like age), assume it's general unless the user profile is extreme.
    - Analyze the user profile against requirements to find any 'red_flags' (e.g. "Income is missing but scheme requires < 2 LPA", or "User from Gujarat but scheme is for Maharashtra").
    - Deduce 'missing_docs' the user will likely need based on the requirements (e.g. "Income Certificate", "Domicile Certificate").
    - Respond strictly in {language}.
    
    Return a JSON object with:
    1. 'eligible': boolean (true/false)
    2. 'confidence': number (0-100)
    3. 'reason': string (concise explanation citing specific rules in {language})
    4. 'benefit': string (short description of the benefit amount/type in {language})
    5. 'deadline': string (if mentioned, otherwise "Check portal")
    6. 'category': string (e.g. Agriculture, Housing, Health)
    7. 'red_flags': array of strings (list any discrepancies, missing vital info, or disqualifying risks. Empty array if none)
    8. 'missing_docs': array of strings (list documents implied by the rules that the user must acquire. Empty array if none)
    
    Only return valid JSON. No other text.
    """
    # Use async generation to avoid blocking
    response = await model.generate_content_async(prompt)
    try:
        import json
        clean_res = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_res)
    except Exception as e:
        return {
            "eligible": True, 
            "reason": "Detailed reasoning unavailable. Semantic match found.", 
            "benefit": "Details in portal.", 
            "category": "General", 
            "deadline": "Check portal",
            "red_flags": [],
            "missing_docs": []
        }

async def get_ai_response(query: str, context: list, language: str = "English"):
    if not model:
        return "Gemini API key not configured."
    
    prompt = f"""
    You are PolicyPilot, a helpful assistant for Indian citizens looking for government schemes.
    Use the following scheme excerpts to answer the user question. 
    Always cite the source scheme and page number if possible.
    
    RESPOND ONLY IN {language}.
    
    Context:
    {chr(10).join(context)}
    
    User Question: {query}
    """
    response = await model.generate_content_async(prompt)
    return response.text

if __name__ == "__main__":
    # Test
    res = retrieve_schemes("Who is eligible for PM-KISAN?")
    print(res)
