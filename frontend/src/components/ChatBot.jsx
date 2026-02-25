import React, { useState, useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// Mock fallback — same keyword logic as backend
// ---------------------------------------------------------------------------
const MOCK_RESPONSES = [
  {
    keywords: ['recycle battery', 'battery recycling', 'how to recycle', 'ev battery', 'recycle ev'],
    category: 'recycling_guide',
    confidence: 0.95,
    reply:
      'To recycle your EV battery, follow these steps:\n1. Check battery health on our Battery Health page\n2. If SOH < 60%, it\'s ready for recycling\n3. Use our Facility Locator to find the nearest CPCB-certified recycler\n4. Book a pickup through the Marketplace\n5. Track your battery\'s lifecycle via Digital Passport',
    suggestions: ['Check battery health', 'Find nearest recycler', 'Book a pickup'],
  },
  {
    keywords: ['recycle solar', 'solar panel recycling', 'panel disposal', 'solar disposal'],
    category: 'recycling_guide',
    confidence: 0.95,
    reply:
      'To recycle solar panels under India\'s E-Waste Rules 2023:\n1. Assess panel efficiency on our Solar Degradation page\n2. If degradation > 20%, panels are eligible for recycling\n3. Locate a certified facility via the Facility Locator\n4. Schedule a collection through Route Optimizer\n5. Recover silicon, silver, and aluminium — earn carbon credits',
    suggestions: ['Check solar health', 'Find recycling facility', 'Learn about material recovery'],
  },
  {
    keywords: ['battery health', 'soh', 'state of health', 'battery condition', 'battery status'],
    category: 'battery_health',
    confidence: 0.93,
    reply:
      'State of Health (SOH) measures your battery\'s current capacity vs original design capacity.\n• SOH ≥ 80%: Excellent — suitable for second-life reuse\n• SOH 60–80%: Good — consider repair or stationary storage\n• SOH < 60%: End-of-life — recycle to recover Lithium, Cobalt, Nickel',
    suggestions: ['Predict battery health', 'Understand SOH scores', 'View Decision Engine'],
  },
  {
    keywords: ['solar degradation', 'panel efficiency', 'solar health', 'panel condition'],
    category: 'solar_health',
    confidence: 0.93,
    reply:
      'Solar panel degradation is the gradual loss of power output — typically 0.5–0.8% per year.\n• < 10% degradation: High performance\n• 10–20% degradation: Moderate — monitor closely\n• > 20% degradation: Consider recycling; recover silicon and silver',
    suggestions: ['Check solar degradation', 'Find recycling facility', 'Calculate environmental impact'],
  },
  {
    keywords: ['nearest recycler', 'facility', 'where to recycle', 'recycling center', 'recycling centre', 'find recycler'],
    category: 'facility_info',
    confidence: 0.92,
    reply:
      'Our Facility Locator lists CPCB-certified recyclers across India including Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, and Pune. Each facility profile shows accepted materials, capacity, and EPR registration details.',
    suggestions: ['Open Facility Locator', 'Filter by battery recycling', 'Filter by solar panel recycling'],
  },
  {
    keywords: ['marketplace', 'buy', 'sell', 'second life', 'reuse', 'second-life'],
    category: 'marketplace_info',
    confidence: 0.91,
    reply:
      'The SmartRecycle Marketplace connects sellers of end-of-life batteries and solar panels with certified refurbishers and recyclers. List your assets, receive AI-generated valuations, and complete transactions with EPR-compliant documentation.',
    suggestions: ['Browse marketplace listings', 'List an asset for sale', 'Learn about second-life batteries'],
  },
  {
    keywords: ['pickup', 'collection', 'book pickup', 'schedule', 'route'],
    category: 'collection_info',
    confidence: 0.90,
    reply:
      'Book a pickup in three steps:\n1. Go to the Marketplace and select your asset\n2. Choose "Schedule Pickup" and enter your location\n3. Our Route Optimizer assigns the most efficient collection route',
    suggestions: ['Book a pickup', 'View Route Optimizer', 'Track collection status'],
  },
  {
    keywords: ['material recovery', 'lithium', 'cobalt', 'nickel', 'what materials', 'recover materials'],
    category: 'material_info',
    confidence: 0.94,
    reply:
      'EV batteries contain valuable critical minerals:\n• Lithium — ₹6,000–8,000/kg\n• Cobalt — ₹3,500–5,000/kg\n• Nickel — ₹1,200–1,800/kg\nSolar panels yield silicon, silver (~₹80,000/kg), and aluminium.',
    suggestions: ['View Material Recovery dashboard', 'Check recovery rates', 'See market prices'],
  },
  {
    keywords: ['carbon credits', 'esg', 'environmental impact', 'sustainability', 'green'],
    category: 'environmental_info',
    confidence: 0.91,
    reply:
      'Recycling through our platform generates verified carbon credits under India\'s Carbon Credit Trading Scheme (CCTS). Each kg of Lithium recovered avoids ~7 kg CO₂ equivalent. Track ESG metrics in real time on the Impact Calculator.',
    suggestions: ['Calculate carbon credits', 'View ESG metrics', 'Understand EPR obligations'],
  },
  {
    keywords: ['digital passport', 'track', 'lifecycle', 'traceability', 'passport'],
    category: 'passport_info',
    confidence: 0.92,
    reply:
      'The Digital Passport is a blockchain-anchored record for every asset on the platform. It logs manufacturing details, usage history, health assessments, repair events, and recycling outcomes — ensuring full CPCB compliance.',
    suggestions: ['View Digital Passport', 'Search by Passport ID', 'Understand traceability'],
  },
  {
    keywords: ['decision engine', 'reuse or recycle', 'what should i do', 'should i recycle', 'decision'],
    category: 'decision_info',
    confidence: 0.93,
    reply:
      'The AI Decision Engine recommends the optimal action:\n• Reuse — high SOH, strong second-life market\n• Repair — moderate SOH, cost-effective\n• Recycle — low SOH, material value exceeds reuse\n• Dispose — severely degraded, safety risk',
    suggestions: ['Run Decision Engine', 'Check battery eligibility', 'Explore second-life options'],
  },
  {
    keywords: ['compliance', 'epr', 'e-waste rules', 'regulation', 'cpcb', 'extended producer'],
    category: 'compliance_info',
    confidence: 0.94,
    reply:
      'India\'s E-Waste (Management) Rules 2023 mandate EPR collection targets for producers. CPCB issues EPR certificates upon verified recycling. Our platform automates EPR documentation and generates CPCB-format compliance reports.',
    suggestions: ['View compliance dashboard', 'Generate EPR report', 'Understand E-Waste Rules 2023'],
  },
  {
    keywords: ['hello', 'hi', 'hey', 'help', 'start', 'what can you do'],
    category: 'greeting',
    confidence: 0.99,
    reply:
      '👋 Hi! I\'m your SmartRecycle AI Assistant. I can help you with:\n• Battery & solar panel recycling guidance\n• Finding CPCB-certified facilities near you\n• Understanding SOH, degradation, and decision outcomes\n• Booking pickups and tracking assets\n• EPR compliance and carbon credits\nWhat would you like to know?',
    suggestions: ['How do I recycle my battery?', 'Find nearest recycler', 'What are carbon credits?'],
  },
]

const FALLBACK_RESPONSE = {
  reply: 'I can help with battery recycling, solar panel disposal, finding certified recyclers, marketplace listings, EPR compliance, and more. Try asking about any of these topics!',
  suggestions: ['Recycle my battery', 'Find nearest recycler', 'What is EPR?'],
  category: 'fallback',
  confidence: 0.40,
}

function mockMatch(message) {
  const text = message.toLowerCase()
  for (const entry of MOCK_RESPONSES) {
    if (entry.keywords.some((kw) => text.includes(kw))) return entry
  }
  return FALLBACK_RESPONSE
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const KEYFRAMES = `
@keyframes chatbotPulse {
  0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
  70%  { box-shadow: 0 0 0 14px rgba(34,197,94,0); }
  100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
}
@keyframes chatbotTypingDot {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40%            { transform: scale(1);   opacity: 1;   }
}
`

// ---------------------------------------------------------------------------
// ChatBot component
// ---------------------------------------------------------------------------
export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: '👋 Hi! I\'m your SmartRecycle AI Assistant. I can help you with battery recycling, solar panel disposal, finding facilities, and more. What would you like to know?',
      suggestions: [],
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [starterSuggestions, setStarterSuggestions] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Inject keyframes once
  useEffect(() => {
    if (!document.getElementById('chatbot-keyframes')) {
      const style = document.createElement('style')
      style.id = 'chatbot-keyframes'
      style.textContent = KEYFRAMES
      document.head.appendChild(style)
    }
  }, [])

  // Fetch starter suggestions
  useEffect(() => {
    fetch('/api/chatbot/suggestions')
      .then((r) => r.json())
      .then((data) => setStarterSuggestions(data.suggestions || []))
      .catch(() =>
        setStarterSuggestions([
          'How do I recycle my EV battery?',
          "Where's the nearest recycler?",
          'What materials can be recovered?',
          'Is my battery eligible for reuse?',
          'How does the decision engine work?',
          'What are carbon credits?',
          'How to book a pickup?',
          'Explain digital passport',
        ])
      )
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  async function sendMessage(text) {
    const trimmed = (text || input).trim()
    if (!trimmed) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setLoading(true)

    try {
      const res = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setTimeout(() => {
        setLoading(false)
        setMessages((prev) => [
          ...prev,
          { role: 'bot', text: data.reply, suggestions: data.suggestions || [] },
        ])
      }, 500)
    } catch {
      // Mock fallback
      const mock = mockMatch(trimmed)
      setTimeout(() => {
        setLoading(false)
        setMessages((prev) => [
          ...prev,
          { role: 'bot', text: mock.reply, suggestions: mock.suggestions || [] },
        ])
      }, 500)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function clearChat() {
    setMessages([
      {
        role: 'bot',
        text: '👋 Chat cleared! How can I help you with recycling today?',
        suggestions: [],
      },
    ])
  }

  // Decide which suggestions to show below the last bot message
  const showStarterChips = messages.length === 1 && messages[0].role === 'bot'

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open SmartRecycle AI Assistant"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #16a34a 0%, #0ea5e9 100%)',
          color: '#fff',
          fontSize: 26,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: open ? 'none' : 'chatbotPulse 2s infinite',
          boxShadow: '0 4px 18px rgba(0,0,0,0.25)',
          transition: 'transform 0.2s',
          transform: open ? 'rotate(90deg) scale(0.9)' : 'scale(1)',
        }}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat window */}
      <div
        style={{
          position: 'fixed',
          bottom: 96,
          right: 24,
          width: 'min(380px, calc(100vw - 32px))',
          height: 520,
          borderRadius: 16,
          background: '#fff',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9998,
          overflow: 'hidden',
          transformOrigin: 'bottom right',
          transform: open ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(20px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #16a34a 0%, #0ea5e9 100%)',
            color: '#fff',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 15 }}>🤖 SmartRecycle AI Assistant</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={clearChat}
              title="Clear chat"
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                borderRadius: 6,
                padding: '2px 8px',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Clear
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                borderRadius: 6,
                padding: '2px 8px',
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {messages.map((msg, i) => (
            <div key={i}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '9px 13px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, #16a34a 0%, #0ea5e9 100%)'
                        : '#f0fdf4',
                    color: msg.role === 'user' ? '#fff' : '#1e293b',
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    whiteSpace: 'pre-line',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  }}
                >
                  {msg.text}
                </div>
              </div>
              {/* Suggestion chips after bot messages */}
              {msg.role === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6, paddingLeft: 4 }}>
                  {msg.suggestions.map((s, si) => (
                    <button
                      key={si}
                      onClick={() => sendMessage(s)}
                      style={{
                        background: '#f0fdf4',
                        border: '1px solid #86efac',
                        color: '#16a34a',
                        borderRadius: 20,
                        padding: '4px 11px',
                        fontSize: 12,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Starter suggestion chips */}
          {showStarterChips && starterSuggestions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {starterSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #93c5fd',
                    color: '#1d4ed8',
                    borderRadius: 20,
                    padding: '4px 11px',
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div
                style={{
                  background: '#f0fdf4',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '10px 14px',
                  display: 'flex',
                  gap: 5,
                  alignItems: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}
              >
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: '#16a34a',
                      display: 'inline-block',
                      animation: `chatbotTypingDot 1.2s ease-in-out ${d * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            padding: '10px 12px',
            display: 'flex',
            gap: 8,
            flexShrink: 0,
            background: '#fafafa',
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about recycling, facilities, EPR…"
            disabled={loading}
            style={{
              flex: 1,
              border: '1px solid #d1d5db',
              borderRadius: 22,
              padding: '8px 14px',
              fontSize: 13.5,
              outline: 'none',
              background: '#fff',
              transition: 'border-color 0.15s',
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #0ea5e9 100%)',
              border: 'none',
              borderRadius: '50%',
              width: 38,
              height: 38,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              color: '#fff',
              fontSize: 17,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              opacity: loading || !input.trim() ? 0.5 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </>
  )
}
