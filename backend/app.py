from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
from openai import OpenAI
import re
import numpy as np
import faiss
import tempfile
import shutil
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
import docx
import pytesseract
from PIL import Image
import whisper
import platform

load_dotenv()

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# Tesseract path
if platform.system() == 'Windows':
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_text_from_pdf(file_path):
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text


def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    text = ""
    for paragraph in doc.paragraphs:
        if paragraph.text.strip():
            text += paragraph.text + "\n"
    return text


def extract_text_from_image(file_path):
    image = Image.open(file_path)
    text = pytesseract.image_to_string(image)
    return text


def extract_text_from_video(file_path):
    whisper_model = whisper.load_model("base")
    result = whisper_model.transcribe(file_path)
    return result["text"]


def extract_text(file_path, filename):
    ext = filename.lower().split('.')[-1]
    if ext == 'pdf':
        return extract_text_from_pdf(file_path)
    elif ext == 'docx':
        return extract_text_from_docx(file_path)
    elif ext in ['png', 'jpg', 'jpeg', 'webp']:
        return extract_text_from_image(file_path)
    elif ext in ['mp4', 'mov', 'avi', 'mkv']:
        return extract_text_from_video(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

document_chunks = []
index = None


def chunk_text(text, chunk_size=800, overlap=100):
    """Sentence-aware chunking with overlap"""
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    sentences = re.split(r'(?<=[.!?])\s+', text)

    chunks = []
    current_chunk = ""

    for sentence in sentences:
        if len(current_chunk) + len(sentence) > chunk_size and current_chunk:
            chunks.append(current_chunk.strip())
            words = current_chunk.split()
            overlap_text = ' '.join(words[-overlap:]) if len(words) > overlap else current_chunk
            current_chunk = overlap_text + " " + sentence
        else:
            current_chunk += " " + sentence

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks


def keyword_boost(question, chunks, indices, distances):
    """Re-rank chunks by boosting those containing question keywords"""
    # Extract meaningful keywords from question (ignore common words)
    stopwords = {'what', 'is', 'the', 'in', 'of', 'a', 'an', 'are', 'was',
                 'were', 'to', 'for', 'and', 'or', 'how', 'who', 'which',
                 'this', 'that', 'it', 'be', 'do', 'does', 'did', 'has',
                 'have', 'had', 'my', 'your', 'their', 'his', 'her', 'its'}

    keywords = [w.lower() for w in re.findall(r'\b\w+\b', question)
                if w.lower() not in stopwords and len(w) > 2]

    scored = []
    for idx, dist in zip(indices, distances):
        chunk_lower = chunks[idx].lower()
        keyword_hits = sum(1 for kw in keywords if kw in chunk_lower)
        # Lower distance = more similar; subtract bonus for keyword hits
        adjusted_score = dist - (keyword_hits * 0.15)
        scored.append((adjusted_score, idx))

    scored.sort(key=lambda x: x[0])
    return [idx for _, idx in scored]


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "message": "RAG API is running"})


@app.route('/upload', methods=['POST'])
def upload_document():
    global document_chunks, index

    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    allowed_extensions = ['pdf', 'docx', 'png', 'jpg', 'jpeg', 'webp', 'mp4', 'mov', 'avi', 'mkv']
    ext = file.filename.lower().split('.')[-1]
    if ext not in allowed_extensions:
        return jsonify({"error": f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"}), 400

    try:
        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, file.filename)
        file.save(temp_path)

        text = extract_text(temp_path, file.filename)

        if not text.strip():
            return jsonify({"error": "Could not extract text from file"}), 400

        document_chunks = chunk_text(text)

        embeddings = embedding_model.encode(document_chunks)
        embeddings = np.array(embeddings).astype('float32')
        faiss.normalize_L2(embeddings)

        dimension = embeddings.shape[1]
        index = faiss.IndexFlatIP(dimension)
        index.add(embeddings)

        shutil.rmtree(temp_dir)

        return jsonify({
            "message": "Document processed successfully",
            "filename": file.filename,
            "chunks": len(document_chunks)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/ask', methods=['POST'])
def ask_question():
    global document_chunks, index

    if index is None or len(document_chunks) == 0:
        return jsonify({"error": "Please upload a document first"}), 400

    data = request.get_json()
    question = data.get('question', '')

    if not question:
        return jsonify({"error": "No question provided"}), 400

    try:
        question_embedding = embedding_model.encode([question])
        question_embedding = np.array(question_embedding).astype('float32')
        faiss.normalize_L2(question_embedding)

        # If only 1 chunk, use it directly without retrieval
        if len(document_chunks) == 1:
            relevant_chunks = document_chunks
        else:
            k = min(8, len(document_chunks))
            distances, indices = index.search(question_embedding, k)
            reranked_indices = keyword_boost(question, document_chunks, indices[0], distances[0])
            top_indices = reranked_indices[:6]
            all_indices = list(dict.fromkeys([0] + top_indices))
            relevant_chunks = [document_chunks[i] for i in all_indices if i < len(document_chunks)]

        context = "\n\n---\n\n".join(relevant_chunks)

        prompt = f"""You are an assistant that analyzes uploaded files (documents, images, videos).
        The context below contains ALL the text extracted from the uploaded file.

Rules:
- Answer based on the context provided.
- If asked about text in an image, list all the text you can find in the context.
- If asked to summarize, summarize everything in the context.
- For specific facts (phone numbers, emails, names, dates) — copy them exactly as written.
- Preserve original formatting (bullet points, lists, paragraphs).
- Include ALL relevant information — never truncate.
- Only say "This information is not found in the uploaded file." if the context is completely empty or truly unrelated.

Context:
{context}

Question: {question}

Answer:"""

        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise assistant that answers questions about uploaded files including documents, images, and videos. Extract answers exactly from the provided context. Never fabricate information."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0,
            max_tokens=2000
        )

        answer = response.choices[0].message.content

        return jsonify({
            "answer": answer,
            "sources": [chunk[:250] + "..." for chunk in relevant_chunks]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)