import React, { useState, useEffect } from 'react'
import MetricCard from '../components/MetricCard'
import ChartWidget from '../components/ChartWidget'

// Mock recent activity feed
const RECENT_ACTIVITY = [
  { id: 1, time: '2 min ago',  event: 'Battery batch B-2041 flagged for recycling in Chennai' },
  { id: 2, time: '15 min ago', event: 'Solar panel array SP-0887 shows 18% degradation — Rajasthan' },
  { id: 3, time: '1 hr ago',   event: 'Collection route CR-14 optimised, saving ₹12,400 in fuel' },
  { id: 4, time: '3 hr ago',   event: '340 kg Lithium recovered from Bangalore recycling centre' },
  { id: 5, time: '5 hr ago',   event: 'New marketplace listing: 50× second-life batteries (Mumbai)' },
  { id: 6, time: '8 hr ago',   event: 'Illegal dumping alert cleared in Gurgaon — site remediated' },
]

// Waste forecast data (monthly, metric tonnes)
const forecastData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'EV Batteries (MT)',
      data: [120, 135, 150, 168, 185, 210, 230, 255, 280, 305, 335, 370],
      borderColor: '#00897b',
      backgroundColor: 'rgba(0,137,123,0.12)',
      fill: true,
      tension: 0.4,
    },
    {
      label: 'Solar Panels (MT)',
      data: [80, 88, 95, 105, 118, 130, 145, 160, 178, 195, 215, 238],
      borderColor: '#1565c0',
      backgroundColor: 'rgba(21,101,192,0.10)',
      fill: true,
      tension: 0.4,
    },
  ],
}

// Material recovery breakdown
const materialData = {
  labels: ['Lithium', 'Nickel', 'Cobalt', 'Silver', 'Silicon', 'Copper'],
  datasets: [
    {
      label: 'Recovery (kg)',
      data: [3400, 2100, 890, 560, 1780, 2250],
      backgroundColor: [
        '#00897b', '#1565c0', '#7b1fa2', '#f57c00', '#2e7d32', '#0277bd',
      ],
    },
  ],
}

function Dashboard() {
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    // Simulate API fetch — replace with real API call in production
    setTimeout(() => {
      setMetrics({
        totalBatteries: 14826,
        solarPanels: 9342,
        activeCollections: 87,
        materialRecovered: 11.4,  // metric tonnes
      })
    }, 400)
  }, [])

  if (!metrics) {
    return (
      <div>
        <div className="page-header">
          <h1>📊 Dashboard</h1>
          <p>Loading platform metrics…</p>
        </div>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>📊 Platform Dashboard</h1>
        <p>Real-time overview of the Smart Reverse Recycling Network</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title="Batteries Tracked"
          value={metrics.totalBatteries.toLocaleString()}
          icon="🔋"
          trend={8.4}
          color="#00897b"
        />
        <MetricCard
          title="Solar Panels Monitored"
          value={metrics.solarPanels.toLocaleString()}
          icon="☀️"
          trend={12.1}
          color="#1565c0"
        />
        <MetricCard
          title="Active Collections"
          value={metrics.activeCollections}
          icon="🚛"
          trend={-3.2}
          trendLabel="vs last week"
          color="#f57c00"
        />
        <MetricCard
          title="Material Recovered"
          value={metrics.materialRecovered}
          unit="MT"
          icon="♻️"
          trend={15.7}
          color="#2e7d32"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <ChartWidget
          title="🔮 Waste Forecast (2024 — Monthly)"
          type="line"
          data={forecastData}
        />
        <ChartWidget
          title="⚗️ Material Recovery Breakdown (YTD)"
          type="bar"
          data={materialData}
        />
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-title">🕐 Recent Activity</div>
        <ul style={{ listStyle: 'none' }}>
          {RECENT_ACTIVITY.map((a) => (
            <li
              key={a.id}
              style={{
                display: 'flex',
                gap: 16,
                padding: '10px 0',
                borderBottom: '1px solid var(--border)',
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  minWidth: 80,
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  paddingTop: 2,
                }}
              >
                {a.time}
              </span>
              <span style={{ fontSize: '0.9rem' }}>{a.event}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Dashboard
