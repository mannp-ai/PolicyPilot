import os
import asyncio
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash-latest')

async def enrich_scheme(name, desc):
    prompt = f"""
    Generate realistic, official-style government scheme eligibility criteria for the following Indian scheme.
    Scheme Name: {name}
    Base Description: {desc}
    
    Return a structured detail in English with:
    1. Scheme Overview
    2. Specific Eligibility Criteria (Include: Age limits, Income thresholds e.g. BPL/EWS, Occupation, Category requirements).
    3. Mandatory Documents (Aadhaar, Land records, etc.)
    4. Exclusion Criteria (Who CANNOT apply, e.g. Tax payers, Govt employees).
    5. Benefits (Specific amounts or services).
    6. Application Process Summary.
    
    Make it look like a gazette excerpt. Be realistic based on Indian policy context.
    """
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        print(f"Error enriching {name}: {e}")
        return f"Scheme: {name}\nDescription: {desc}\nEligibility: Regular criteria apply."

async def main():
    schemes_dir = r"c:\Users\Mann\Desktop\PolicyPilot\backend\schemes"
    files = [f for f in os.listdir(schemes_dir) if f.endswith(".txt")]
    
    print(f"Enriching {len(files)} schemes...")
    
    for filename in files:
        path = os.path.join(schemes_dir, filename)
        with open(path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            name = lines[0].replace("Scheme Name: ", "").strip()
            desc = lines[1].replace("Description: ", "").strip()
        
        print(f"Processing {name}...")
        enriched_content = await enrich_scheme(name, desc)
        
        with open(path, "w", encoding="utf-8") as f:
            f.write(enriched_content)
        
        await asyncio.sleep(1) # Safety for rate limits

if __name__ == "__main__":
    asyncio.run(main())
