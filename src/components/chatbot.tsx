import React, { useState } from 'react'

const BOT_RESPONSES: Record<string, string> = {
  hi: 'Hi 👋 How can I help you with buses today?',
  hello: 'Hello! Ask me about routes, stops or timings.',
  route: 'You can check city-wise routes under "Routes" section.',
  stop: 'Use search to find nearest bus stops in your city.',
  timing: 'Buses generally run between 6 AM – 10 PM.',
  path: 'Use Raahi Path Finder to find best route between stops.',
  help: 'You can ask about routes, stops, timings or navigation.',
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<string[]>([
    '👋 Hi! I am Raahi Bot. Ask me anything.',
  ])
  const [input, setInput] = useState('')

  function send() {
    if (!input.trim()) return

    const userMsg = input
    const key = Object.keys(BOT_RESPONSES).find(k =>
      userMsg.toLowerCase().includes(k)
    )

    const botReply =
      BOT_RESPONSES[key || 'help'] ||
      'Sorry, I did not understand that.'

    setMessages(prev => [...prev, `You: ${userMsg}`, `Bot: ${botReply}`])
    setInput('')
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          borderRadius: '50%',
          width: 56,
          height: 56,
          background: '#22c55e',
          color: '#fff',
          border: 'none',
          fontSize: 22,
          cursor: 'pointer',
          zIndex: 999,
        }}
      >
        💬
      </button>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: 300,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            zIndex: 999,
            padding: 12,
          }}
        >
          <strong>Raahi Bot</strong>

          <div
            style={{
              height: 180,
              overflowY: 'auto',
              margin: '8px 0',
              fontSize: 13,
            }}
          >
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                {m}
              </div>
            ))}
          </div>

          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask something..."
            style={{
              width: '100%',
              padding: 8,
              borderRadius: 8,
              border: '1px solid #ddd',
            }}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
        </div>
      )}
    </>
  )
}
