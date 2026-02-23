import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

// Navigation sidebar with green/blue sustainability theme
const navItems = [
  { path: '/',                 icon: '📊', label: 'Dashboard' },
  { path: '/battery-health',   icon: '🔋', label: 'Battery Health' },
  { path: '/solar-degradation',icon: '☀️', label: 'Solar Degradation' },
  { path: '/route-optimizer',  icon: '🗺️', label: 'Route Optimizer' },
  { path: '/material-recovery',icon: '♻️', label: 'Material Recovery' },
  { path: '/marketplace',      icon: '🏪', label: 'Marketplace' },
  { path: '/gov-dashboard',    icon: '🏛️', label: 'Gov Dashboard' },
]

function Navbar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: collapsed ? '64px' : '240px',
        background: 'linear-gradient(180deg, #00695c 0%, #1565c0 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transition: 'width 0.25s ease',
        boxShadow: '2px 0 12px rgba(0,0,0,0.15)',
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: collapsed ? '20px 12px' : '20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <span style={{ fontSize: '1.5rem' }}>♻️</span>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>
              SmartRecycle
            </div>
            <div style={{ fontSize: '0.72rem', opacity: 0.75 }}>SIH 2024</div>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <ul style={{ listStyle: 'none', flex: 1, padding: '12px 0' }}>
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '12px 20px' : '12px 20px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
                background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                borderLeft: isActive ? '4px solid #a5d6a7' : '4px solid transparent',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              })}
            >
              <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer of sidebar */}
      {!collapsed && (
        <div
          style={{
            padding: '14px 20px',
            fontSize: '0.75rem',
            opacity: 0.6,
            borderTop: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          AI-Driven Recycling Network
        </div>
      )}
    </nav>
  )
}

export default Navbar
