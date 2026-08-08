import React, { useState, useRef, useEffect } from 'react'
import Groq from 'groq-sdk'

// ── Types ──────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant'
  content: string
}

// ── Groq client (browser-safe for dev; use a backend proxy in production) ──
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY as string,
  dangerouslyAllowBrowser: true,
})

const SYSTEM_PROMPT = `You are Raahi Bot 🚌 — a friendly, concise AI assistant for the Raahi Transit app.
You help users with:
- Bus routes and route numbers
- Bus stop locations and nearest stops
- Bus timings and schedules (generally 6 AM – 10 PM)
- Navigation using Raahi Path Finder
- General transit tips in Indian cities

Keep answers short and helpful (2-4 sentences max unless more detail is asked).
Use relevant emojis sparingly. If asked something unrelated to transit, politely redirect.`

// ── Styles (inline, no external CSS dependency) ────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  fab: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    borderRadius: '50%',
    width: 58,
    height: 58,
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: '#fff',
    border: 'none',
    fontSize: 24,
    cursor: 'pointer',
    zIndex: 1000,
    boxShadow: '0 4px 20px rgba(34,197,94,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  window: {
    position: 'fixed',
    bottom: 94,
    right: 24,
    width: 340,
    maxHeight: 520,
    background: '#0f172a',
    borderRadius: 20,
    boxShadow: '0 12px 48px rgba(0,0,0,0.45)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.08)',
    animation: 'slideUp 0.25s ease',
  },
  header: {
    background: 'linear-gradient(90deg, #16a34a 0%, #15803d 100%)',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    fontFamily: 'Inter, sans-serif',
    margin: 0,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontFamily: 'Inter, sans-serif',
    margin: 0,
  },
  closeBtn: {
    marginLeft: 'auto',
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    borderRadius: '50%',
    width: 28,
    height: 28,
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    scrollbarWidth: 'thin',
    scrollbarColor: '#334155 transparent',
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#fff',
    padding: '9px 13px',
    borderRadius: '16px 16px 4px 16px',
    fontSize: 13,
    fontFamily: 'Inter, sans-serif',
    maxWidth: '80%',
    lineHeight: 1.5,
    boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
  },
  bubbleBot: {
    alignSelf: 'flex-start',
    background: '#1e293b',
    color: '#e2e8f0',
    padding: '9px 13px',
    borderRadius: '16px 16px 16px 4px',
    fontSize: 13,
    fontFamily: 'Inter, sans-serif',
    maxWidth: '80%',
    lineHeight: 1.5,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  typingDot: {
    display: 'inline-block',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#94a3b8',
    margin: '0 2px',
    animation: 'bounce 1.2s infinite',
  },
  inputRow: {
    display: 'flex',
    padding: '10px 12px',
    gap: 8,
    borderTop: '1px solid rgba(255,255,255,0.07)',
    background: '#0f172a',
  },
  input: {
    flex: 1,
    background: '#1e293b',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '9px 12px',
    color: '#e2e8f0',
    fontSize: 13,
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
  },
  sendBtn: {
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    border: 'none',
    borderRadius: 10,
    width: 38,
    height: 38,
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0,
    transition: 'opacity 0.2s',
  },
}

// ── CSS keyframes injected once ────────────────────────────────────────────
const KEYFRAMES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}
@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
  40%           { transform: translateY(-5px); opacity: 1;   }
}
`

// ── Component ──────────────────────────────────────────────────────────────
export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 Hi! I am Raahi Bot. Ask me about bus routes, stops, or timings!' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Inject keyframes once
  useEffect(() => {
    if (document.getElementById('raahi-chatbot-styles')) return
    const style = document.createElement('style')
    style.id = 'raahi-chatbot-styles'
    style.textContent = KEYFRAMES
    document.head.appendChild(style)
  }, [])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.map(m => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 256,
        temperature: 0.7,
      })

      const reply = completion.choices[0]?.message?.content ?? 'Sorry, I could not get a response.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error'
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `⚠️ Error: ${errMsg}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        id="raahi-chatbot-fab"
        onClick={() => setOpen(o => !o)}
        style={styles.fab}
        title="Chat with Raahi Bot"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {open && (
        <div style={styles.window} role="dialog" aria-label="Raahi Bot chat">

          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerAvatar}>🚌</div>
            <div>
              <p style={styles.headerTitle}>Raahi Bot</p>
              <p style={styles.headerSub}>AI Transit Assistant · Groq</p>
            </div>
            <button
              style={styles.closeBtn}
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={styles.messages} id="raahi-chatbot-messages">
            {messages.map((m, i) => (
              <div
                key={i}
                style={m.role === 'user' ? styles.bubbleUser : styles.bubbleBot}
              >
                {m.content}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ ...styles.bubbleBot, padding: '10px 14px' }}>
                <span style={{ ...styles.typingDot, animationDelay: '0s' }} />
                <span style={{ ...styles.typingDot, animationDelay: '0.2s' }} />
                <span style={{ ...styles.typingDot, animationDelay: '0.4s' }} />
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input Row */}
          <div style={styles.inputRow}>
            <input
              id="raahi-chatbot-input"
              style={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about routes, stops…"
              disabled={loading}
              autoComplete="off"
            />
            <button
              id="raahi-chatbot-send"
              style={{ ...styles.sendBtn, opacity: loading ? 0.5 : 1 }}
              onClick={send}
              disabled={loading}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>

        </div>
      )}
    </>
  )
}
