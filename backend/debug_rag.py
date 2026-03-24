from rag import retrieve_schemes
import json

query = "Farmer from Gujarat"
results = retrieve_schemes(query, n_results=5)

print(f"Results keys: {results.keys()}")
print(f"Documents found: {len(results['documents'][0])}")
if results['documents'][0]:
    print(f"First Metadata: {results['metadatas'][0][0]}")
    print(f"First Document Snippet: {results['documents'][0][0][:100]}...")
