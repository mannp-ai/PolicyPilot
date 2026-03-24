import os
import pypdf
import chromadb
from dotenv import load_dotenv

load_dotenv()
from chromadb.utils import embedding_functions
import google.generativeai as genai

# Setup Gemini for Embeddings
# Note: User needs to set GEMINI_API_KEY in environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    embedding_fn = embedding_functions.GoogleGenerativeAiEmbeddingFunction(
        api_key=GEMINI_API_KEY,
        task_type="RETRIEVAL_DOCUMENT"
    )
else:
    # Fallback to default if no key (though it will fail at runtime)
    embedding_fn = embedding_functions.DefaultEmbeddingFunction()

client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(
    name="schemes",
    embedding_function=embedding_fn
)

def ingest_pdf(file_path):
    print(f"Ingesting {file_path}...")
    reader = pypdf.PdfReader(file_path)
    scheme_id = os.path.basename(file_path).split(".")[0]
    
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text.strip():
            # Chunking by page for simplicity in this MVP
            collection.add(
                documents=[text],
                metadatas=[{"scheme_id": scheme_id, "page": i + 1}],
                ids=[f"{scheme_id}_page_{i+1}"]
            )
    print(f"Finished ingesting {scheme_id}.")

def ingest_txt(file_path):
    print(f"Ingesting {file_path}...")
    try:
        with open(file_path, "r", encoding="utf-8-sig") as f:
            text = f.read()
    except UnicodeDecodeError:
        with open(file_path, "r", encoding="latin-1") as f:
            text = f.read()
    scheme_id = os.path.basename(file_path).split(".")[0]
    collection.add(
        documents=[text],
        metadatas=[{"scheme_id": scheme_id, "page": 1}],
        ids=[f"{scheme_id}_page_1"]
    )
    print(f"Finished ingesting {scheme_id}.")

def run_ingestion():
    schemes_dir = "./schemes"
    if not os.path.exists(schemes_dir):
        os.makedirs(schemes_dir)
        
    for filename in os.listdir(schemes_dir):
        if filename.endswith(".pdf"):
            ingest_pdf(os.path.join(schemes_dir, filename))
        elif filename.endswith(".txt"):
            ingest_txt(os.path.join(schemes_dir, filename))

if __name__ == "__main__":
    run_ingestion()
