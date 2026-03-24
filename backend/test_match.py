import asyncio
from main import process_candidate, MATCH_CACHE
from rag import retrieve_schemes
from pydantic import BaseModel

class UserProfileMock(BaseModel):
    state: str = "Gujarat"
    district: str = "Surat"
    age: int = 55
    income: int = 120000
    occupation: str = "Farmer"
    category: str = "General"
    situation: str = "farmer with kids and crop problems, very detailed string more than 15 chars"
    language: str = "Hindi"

async def test():
    profile = UserProfileMock()
    query = f"User situation: {profile.situation}. Profile: {profile.occupation}, {profile.age} years old, {profile.income} income, {profile.state} state."
    
    print(f"API: Matching query: {query}")
    results = retrieve_schemes(query, n_results=5)
    print(f"API: Retrieval results found: {len(results['documents'][0]) if results['documents'] else 0}")
    
    match_tasks = []
    if results['documents']:
        for i, doc in enumerate(results['documents'][0][:5]):
            meta = results['metadatas'][0][i]
            match_tasks.append(process_candidate(query, profile.dict(), doc, meta, i, profile.language))
            
    schemes = await asyncio.gather(*match_tasks)
    print("Gathered Schemes:", schemes)

if __name__ == "__main__":
    asyncio.run(test())
