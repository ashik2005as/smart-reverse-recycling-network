import React from 'react'

/**
 * Reusable metric display card.
 * Props: title, value, unit, icon, trend, trendLabel, color
 */
function MetricCard({ title, value, unit = '', icon, trend, trendLabel, color = '#00897b' }) {
  const isPositive = trend > 0
  const trendColor = isPositive ? '#2e7d32' : '#c62828'
  const trendArrow = isPositive ? '▲' : '▼'

  return (
    <div
      className="card"
      style={{
        borderTop: `4px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        {icon && (
          <span style={{ fontSize: '1.6rem' }}>{icon}</span>
        )}
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: '2rem', fontWeight: 700, color }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{unit}</span>
        )}
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div style={{ fontSize: '0.8rem', color: trendColor }}>
          {trendArrow} {Math.abs(trend)}% {trendLabel || 'vs last month'}
        </div>
      )}
    </div>
  )
}

export default MetricCard
