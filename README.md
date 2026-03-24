# 🧠 RAG Document Intelligence System

A production-ready AI-powered document Q&A system built with Retrieval-Augmented Generation (RAG). Upload any document, image, or Word file and ask questions about its content in natural language.

![RAG Document Intelligence](https://img.shields.io/badge/AI-RAG%20System-6366f1?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-412991?style=for-the-badge&logo=openai)

---

## ✨ Features

- 📄 **PDF Support** — Extract and query text from any PDF
- 📝 **Word Document Support** — Full .docx file parsing
- 🖼️ **Image OCR** — Extract and query text from images using Tesseract
- 🔍 **Semantic Search** — FAISS vector index with cosine similarity
- ⚡ **Keyword Boost Re-ranking** — Improves retrieval accuracy for specific facts
- 🤖 **GPT-3.5 Answers** — Precise, context-grounded responses
- 🎨 **Professional Dark UI** — Built with React + inline styles

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Backend | Python, Flask |
| Vector Search | FAISS |
| Embeddings | Sentence Transformers (all-MiniLM-L6-v2) |
| LLM | OpenAI GPT-3.5 Turbo |
| OCR | Tesseract, Pytesseract, Pillow |
| PDF Parsing | PyPDF |
| Word Parsing | python-docx |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Tesseract OCR installed → [Download here](https://github.com/UB-Mannheim/tesseract/wiki)
- OpenAI API key

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/rag-document-intelligence.git
cd rag-document-intelligence
```

### 2. Backend Setup
```bash
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create a `.env` file in the root:
```
OPENAI_API_KEY=your_openai_api_key_here
```

Run the backend:
```bash
python backend/app.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app
Visit `http://localhost:5173`

---

## 📁 Project Structure
```
rag-document-intelligence/
├── backend/
│   └── app.py              # Flask API with RAG pipeline
├── frontend/
│   ├── src/
│   │   └── App.jsx         # React UI
│   └── index.html
├── .env                    # API keys (not committed)
├── requirements.txt
└── README.md
```

---

## 💡 How It Works

1. **Upload** a file (PDF, Word, or Image)
2. **Text Extraction** — PyPDF / python-docx / Tesseract OCR
3. **Chunking** — Sentence-aware overlapping chunks (800 chars)
4. **Embedding** — Sentence Transformers encode each chunk
5. **FAISS Index** — Chunks stored as normalized vectors for cosine similarity search
6. **Query** — User question is embedded and matched against chunks
7. **Re-ranking** — Keyword boost improves retrieval for specific facts
8. **Answer** — Top chunks sent to GPT-3.5 with a precision prompt

---

## 👤 Author

**Jam Ehtisham Qadir** Python Developer & AI/ ML Engineer  
[LinkedIn](https://www.linkedin.com/in/jam-ehtisham-qadir-aaa691243)

---

## 📄 License

MIT License
