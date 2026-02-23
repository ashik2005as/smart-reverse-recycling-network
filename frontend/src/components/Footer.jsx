import React from 'react'

function Footer() {
  return (
    <footer
      style={{
        marginLeft: 'var(--sidebar-width)',
        background: '#1a2e2b',
        color: 'rgba(255,255,255,0.65)',
        padding: '16px 36px',
        fontSize: '0.82rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      <span>
        ♻️ <strong style={{ color: '#a5d6a7' }}>Smart Reverse Recycling Network</strong> — Smart India Hackathon 2024
      </span>
      <span>
        Powered by AI + IoT + Optimization | MIT License
      </span>
    </footer>
  )
}

export default Footer
