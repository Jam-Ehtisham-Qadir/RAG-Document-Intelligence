---
title: RAG Document Intelligence
emoji: 📄
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
---

# 📄 RAG-Powered Document Intelligence System

> Upload documents and ask questions — AI finds the answers instantly using Retrieval-Augmented Generation.

![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-Backend-black?style=flat-square&logo=flask)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-412991?style=flat-square&logo=openai)
![FAISS](https://img.shields.io/badge/FAISS-Vector%20Search-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## 🌐 Live Demo

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Try%20it%20Now-brightgreen?style=for-the-badge&logo=googlechrome)](https://jamehtisham-rag-document-intelligence.hf.space/)

> No login required — just upload a document and start asking questions.

---

## 📌 Overview

**RAG Document Intelligence** is a production-ready question-answering system that lets users upload documents and get accurate, context-aware answers powered by AI. It uses **Retrieval-Augmented Generation (RAG)** — combining semantic vector search with OpenAI's GPT-3.5 to find and synthesize answers directly from your documents.

Built as a portfolio project to demonstrate real-world AI/ML engineering with RAG pipelines.

---

## ✨ Features

- 📁 **Multi-Format Upload** — supports PDF, DOCX, TXT documents
- 🔍 **Semantic Search** — FAISS vector index finds the most relevant chunks
- 🤖 **AI Answer Generation** — GPT-3.5 synthesizes answers from retrieved context
- 📚 **Source Citations** — every answer shows which document sections were used
- ⚡ **Fast Retrieval** — FAISS enables millisecond similarity search
- 🎨 **Clean UI** — React frontend with intuitive chat-style interface

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Backend | Python, Flask |
| Vector Store | FAISS |
| Embeddings | Sentence Transformers |
| AI Model | OpenAI GPT-3.5 |
| Document Parsing | PyPDF2, python-docx |
| Deployment | Docker, Hugging Face Spaces |

---

## 💡 How It Works

1. **Upload** — User uploads a PDF, DOCX, or TXT file
2. **Chunking** — Document is split into overlapping text chunks
3. **Embedding** — Sentence Transformers convert chunks into vectors
4. **Indexing** — FAISS stores vectors for fast similarity search
5. **Query** — User asks a question
6. **Retrieval** — FAISS finds the most relevant chunks
7. **Generation** — GPT-3.5 generates an answer using retrieved context
8. **Response** — Answer is returned with source citations

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API Key

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/Jam-Ehtisham-Qadir/RAG-Powered-Document-Intelligence.git
cd RAG-Powered-Document-Intelligence

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the root:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Run the backend:

```bash
python app.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## 📁 Project Structure

```
RAG-Document-Intelligence/
├── app.py                  # Flask API
├── rag_pipeline.py         # FAISS + Sentence Transformers logic
├── frontend/
│   ├── src/
│   │   └── App.jsx         # React UI
│   └── index.html
├── Dockerfile              # HF Spaces deployment
├── .env                    # API keys (not committed)
└── README.md
```

---

## 👨‍💻 Author

**Jam Ehtisham Qadir**  
Python Developer & AI/ML Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat-square&logo=linkedin)](https://linkedin.com/in/jam-ehtisham-qadir-aaa691243)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=flat-square&logo=github)](https://github.com/Jam-Ehtisham-Qadir)

---

## 📄 License

MIT License
