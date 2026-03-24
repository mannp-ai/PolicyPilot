import chromadb
from chromadb.utils import embedding_functions
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    embedding_fn = embedding_functions.GoogleGenerativeAiEmbeddingFunction(
        api_key=GEMINI_API_KEY,
        task_type="RETRIEVAL_QUERY"
    )
else:
    embedding_fn = embedding_functions.DefaultEmbeddingFunction()

client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(
    name="schemes",
    embedding_function=embedding_fn
)

print(f"Collection count: {collection.count()}")
if collection.count() > 0:
    res = collection.peek()
    print(f"First document: {res['documents'][0][:100]}...")
