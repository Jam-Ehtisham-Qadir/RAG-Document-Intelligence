import { useState } from 'react'

export default function App() {
  const [file, setFile] = useState(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleClearFile = () => {
  setFile(null)
  setUploadStatus('')
  setAnswer('')
  setSources([])
  }

  const handleFileUpload = async (uploadedFile) => {
    if (!uploadedFile) return
    setFile(uploadedFile)
    setLoading(true)
    setUploadStatus('')
    setAnswer('')
    setSources([])

    const formData = new FormData()
    formData.append('file', uploadedFile)

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (response.ok) {
        setUploadStatus(`success:${data.message} — ${data.chunks} chunks indexed`)
      } else {
        setUploadStatus(`error:${data.error}`)
      }
    } catch (error) {
      setUploadStatus(`error:${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileUpload(dropped)
  }

  const handleAskQuestion = async (e) => {
    e.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    setAnswer('')
    setSources([])

    try {
      const response = await fetch('http://127.0.0.1:5000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await response.json()
      if (response.ok) {
        setAnswer(data.answer)
        setSources(data.sources)
      } else {
        setAnswer(`Error: ${data.error}`)
      }
    } catch (error) {
      setAnswer(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const statusIsSuccess = uploadStatus.startsWith('success:')
  const statusMessage = uploadStatus.replace(/^(success:|error:)/, '')

  return (
    <div style={styles.root}>
      {/* Ambient background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      <div style={styles.container}>

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.badge}>Python Developer & AI/ ML Engineer</div>
          <h1 style={styles.title}>
            RAG Document<br />
            <span style={styles.titleAccent}>Intelligence</span>
          </h1>
          <p style={styles.subtitle}>
            Upload a document or image — then interrogate it with natural language.
          </p>
          <p style={styles.author}>Built by <a href="https://www.linkedin.com/in/jam-ehtisham-qadir-aaa691243" target="_blank" rel="noreferrer" style={styles.authorName}>Jam Ehtisham Qadir</a></p>
        </header>

        {/* Upload Zone */}
        <div
          style={{
            ...styles.uploadZone,
            ...(isDragging ? styles.uploadZoneDragging : {}),
            ...(statusIsSuccess ? styles.uploadZoneSuccess : {}),
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf,.docx,.png,.jpg,.jpeg,.webp,.mp4,.mov,.avi,.mkv"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            style={{ display: 'none' }}
            id="file-upload"
          />
          <label htmlFor="file-upload" style={styles.uploadLabel}>
            <div style={styles.uploadIcon}>
              {loading && !answer ? '⏳' : statusIsSuccess ? '✅' : '📂'}
            </div>
            <p style={styles.uploadMainText}>
              {file ? file.name : 'Drop file here or click to browse'}
            </p>
            <p style={styles.uploadSubText}>
              PDF · Word · Images
            </p>
          </label>

          {file && (
            <button onClick={(e) => { e.preventDefault(); handleClearFile() }} style={styles.clearBtn}>
              ✕
            </button>
          )}

          {uploadStatus && (
            <div style={{
              ...styles.statusBadge,
              background: statusIsSuccess
                ? 'rgba(34,197,94,0.12)'
                : 'rgba(239,68,68,0.12)',
              borderColor: statusIsSuccess ? '#22c55e' : '#ef4444',
              color: statusIsSuccess ? '#86efac' : '#fca5a5',
            }}>
              {statusMessage}
            </div>
          )}
        </div>

        {/* Question Input */}
        <div style={styles.card}>
          <label style={styles.cardLabel}>Ask a Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleAskQuestion(e)
              }
            }}
            placeholder="e.g. What is the phone number? Summarize the document. What are the key skills?"
            style={styles.textarea}
            rows={3}
          />
          <button
            onClick={handleAskQuestion}
            disabled={loading || !file}
            style={{
              ...styles.button,
              ...(loading || !file ? styles.buttonDisabled : {}),
            }}
          >
            {loading && answer === '' && uploadStatus !== ''
              ? <span style={styles.buttonLoading}>
                  <span style={styles.spinner} /> Thinking...
                </span>
              : '⚡ Ask Question'}
          </button>
        </div>

        {/* Answer */}
        {answer && (
          <div style={styles.answerCard}>
            <div style={styles.answerHeader}>
              <span style={styles.answerDot} />
              <span style={styles.answerLabel}>Answer</span>
            </div>
            <p style={styles.answerText}>{answer}</p>

            {sources.length > 0 && (
              <>
                <div style={styles.divider} />
                <p style={styles.sourcesLabel}>Source Chunks</p>
                <div style={styles.sourcesGrid}>
                  {sources.map((source, idx) => (
                    <div key={idx} style={styles.sourceChip}>
                      <span style={styles.sourceIdx}>#{idx + 1}</span>
                      <span style={styles.sourceText}>{source}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <footer style={styles.footer}>
          Powered by FAISS · Sentence Transformers · OpenAI GPT-3.5
        </footer>
      </div>
    </div>
  )
}

const styles = {
  root: {
    minHeight: '100vh',
    background: '#080b14',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    padding: '40px 16px 80px',
  },
  orb1: {
    position: 'fixed', top: '-120px', left: '-120px',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'fixed', bottom: '-100px', right: '-100px',
    width: '450px', height: '450px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb3: {
    position: 'fixed', top: '40%', left: '60%',
    width: '300px', height: '300px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    maxWidth: '720px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 14px',
    borderRadius: '999px',
    border: '1px solid rgba(99,102,241,0.4)',
    color: '#a5b4fc',
    fontSize: '11px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: '20px',
    background: 'rgba(99,102,241,0.08)',
  },
  title: {
    fontSize: 'clamp(36px, 6vw, 56px)',
    fontWeight: '800',
    color: '#f1f5f9',
    lineHeight: 1.1,
    margin: '0 0 16px',
    letterSpacing: '-0.02em',
  },
  titleAccent: {
    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '16px',
    lineHeight: 1.6,
    margin: '0 0 12px',
  },
  author: {
    color: '#475569',
    fontSize: '13px',
  },
  authorName: {
    color: '#818cf8',
    fontWeight: '600',
  },
  uploadZone: {
  border: '1.5px dashed rgba(99,102,241,0.3)',
  borderRadius: '16px',
  padding: '40px 24px',
  textAlign: 'center',
  background: 'rgba(15,20,40,0.6)',
  backdropFilter: 'blur(12px)',
  marginBottom: '20px',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  position: 'relative',
  },
  uploadZoneDragging: {
    border: '1.5px dashed #6366f1',
    background: 'rgba(99,102,241,0.08)',
    boxShadow: '0 0 30px rgba(99,102,241,0.15)',
  },
  uploadZoneSuccess: {
    border: '1.5px dashed rgba(34,197,94,0.4)',
  },
  uploadLabel: {
    cursor: 'pointer',
    display: 'block',
  },
  uploadIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  uploadMainText: {
    color: '#cbd5e1',
    fontSize: '15px',
    fontWeight: '500',
    margin: '0 0 6px',
  },
  uploadSubText: {
    color: '#475569',
    fontSize: '12px',
    letterSpacing: '0.08em',
    margin: 0,
  },
  statusBadge: {
    display: 'inline-block',
    marginTop: '16px',
    padding: '6px 16px',
    borderRadius: '999px',
    border: '1px solid',
    fontSize: '13px',
    fontWeight: '500',
  },
  card: {
    background: 'rgba(15,20,40,0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
  },
  cardLabel: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '12px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '12px',
    fontWeight: '600',
  },
  textarea: {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '15px',
    padding: '14px',
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.6,
    boxSizing: 'border-box',
  },
  button: {
    marginTop: '14px',
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: '0.02em',
    transition: 'opacity 0.2s',
  },
  buttonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  buttonLoading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  answerCard: {
    background: 'rgba(15,20,40,0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 0 40px rgba(99,102,241,0.08)',
  },
  answerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
  },
  answerDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
    boxShadow: '0 0 8px rgba(99,102,241,0.6)',
    display: 'inline-block',
  },
  answerLabel: {
    color: '#94a3b8',
    fontSize: '12px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  answerText: {
    color: '#e2e8f0',
    fontSize: '15px',
    lineHeight: 1.8,
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.06)',
    margin: '20px 0',
  },
  sourcesLabel: {
    color: '#475569',
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '10px',
    fontWeight: '600',
  },
  sourcesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sourceChip: {
    display: 'flex',
    gap: '10px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    padding: '10px 14px',
  },
  sourceIdx: {
    color: '#6366f1',
    fontSize: '12px',
    fontWeight: '700',
    flexShrink: 0,
    marginTop: '1px',
  },
  sourceText: {
    color: '#475569',
    fontSize: '12px',
    lineHeight: 1.6,
  },

  clearBtn: {
  position: 'absolute',
  top: '12px',
  right: '12px',
  background: 'rgba(239,68,68,0.1)',
  border: '1px solid rgba(239,68,68,0.3)',
  color: '#fca5a5',
  borderRadius: '50%',
  width: '28px',
  height: '28px',
  fontSize: '12px',
  cursor: 'pointer',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
  },

  footer: {
  textAlign: 'center',
  color: '#64748b',
  fontSize: '12px',
  letterSpacing: '0.06em',
  marginTop: '20px',
  },
}