import React, { useState, useEffect, useRef } from 'react'
import MetricCard from '../components/MetricCard'
import ChartWidget from '../components/ChartWidget'
import MapView from '../components/MapView'

// ── Fallback mock data (used when backend is unreachable) ─────────────────────
const MOCK_STATS = {
  timestamp: '2026-02-23T15:30:00',
  batteries_tracked: 12547,
  solar_panels_monitored: 8234,
  active_collections: 342,
  material_recovered_tonnes: 2856.4,
  carbon_credits_earned: 15623,
  revenue_inr_crores: 4.23,
  batteries_change_pct: 12.5,
  solar_change_pct: 8.3,
  collections_change_pct: -2.1,
  material_change_pct: 15.7,
}

const MOCK_FORECAST = {
  labels: ['Jan 2026','Feb 2026','Mar 2026','Apr 2026','May 2026','Jun 2026',
           'Jul 2026','Aug 2026','Sep 2026','Oct 2026','Nov 2026','Dec 2026'],
  battery_waste_tonnes: [120,135,142,158,165,178,190,205,218,230,245,260],
  solar_waste_tonnes:   [80, 85, 92, 98,105,112,118,125,132,140,148,155],
}

const MOCK_ACTIVITIES = [
  { id:1, type:'collection', message:'Battery pickup completed in Mumbai',          timestamp:'2026-02-23T14:15:00', status:'completed' },
  { id:2, type:'prediction', message:'SOH alert: Battery #BT-4521 below 30%',       timestamp:'2026-02-23T14:00:00', status:'warning'   },
  { id:3, type:'collection', message:'Solar panel collection done in Pune',          timestamp:'2026-02-23T13:45:00', status:'completed' },
  { id:4, type:'alert',      message:'Illegal dumping detected in Gurgaon',          timestamp:'2026-02-23T13:30:00', status:'alert'     },
  { id:5, type:'recovery',   message:'450 kg Lithium recovered — Bangalore centre',  timestamp:'2026-02-23T13:00:00', status:'completed' },
  { id:6, type:'prediction', message:'Panel degradation >20% detected — Rajasthan', timestamp:'2026-02-23T12:30:00', status:'warning'   },
]

const MOCK_LIVE = {
  collections_today: 47, batteries_processed_today: 128,
  panels_processed_today: 85, alerts_active: 3,
  recyclers_online: 24, efficiency_score: 94.7,
}

const MOCK_REGIONS = [
  { state:'Maharashtra',   lat:19.7515, lng:75.7139, batteries:2340, panels:1560, collections:45 },
  { state:'Karnataka',     lat:15.3173, lng:75.7139, batteries:1890, panels:1230, collections:38 },
  { state:'Tamil Nadu',    lat:11.1271, lng:78.6569, batteries:2100, panels:1890, collections:52 },
  { state:'Gujarat',       lat:22.2587, lng:71.1924, batteries:1650, panels:2100, collections:41 },
  { state:'Delhi',         lat:28.7041, lng:77.1025, batteries:1780, panels:890,  collections:35 },
  { state:'Rajasthan',     lat:27.0238, lng:74.2179, batteries:980,  panels:2450, collections:30 },
  { state:'Uttar Pradesh', lat:26.8467, lng:80.9462, batteries:1450, panels:1120, collections:28 },
  { state:'West Bengal',   lat:22.9868, lng:87.855,  batteries:1120, panels:780,  collections:22 },
  { state:'Telangana',     lat:18.1124, lng:79.0193, batteries:1560, panels:1340, collections:33 },
  { state:'Kerala',        lat:10.8505, lng:76.2711, batteries:890,  panels:670,  collections:18 },
]

const MOCK_MATERIALS = [
  { name:'Lithium', recovered_kg:4520, value_usd:312000, color:'#4CAF50' },
  { name:'Cobalt',  recovered_kg:2890, value_usd:245000, color:'#2196F3' },
  { name:'Nickel',  recovered_kg:3670, value_usd:198000, color:'#FF9800' },
  { name:'Silver',  recovered_kg:890,  value_usd:425000, color:'#9C27B0' },
  { name:'Silicon', recovered_kg:8900, value_usd:156000, color:'#607D8B' },
  { name:'Copper',  recovered_kg:5670, value_usd:178000, color:'#F44336' },
]

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:8000'

async function apiFetch(path, fallback) {
  try {
    const res = await fetch(`${API_BASE}${path}`)
    if (!res.ok) throw new Error('non-2xx')
    return await res.json()
  } catch {
    return fallback
  }
}

// ── Live 2026 clock ───────────────────────────────────────────────────────────
function useLiveClock() {
  const [clock, setClock] = useState('')
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const d = new Date(2026, 1, 23, now.getHours(), now.getMinutes(), now.getSeconds())
      setClock(
        d.toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour12: false,
        })
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return clock
}

// ── Animated counter (counts from 0 → target on mount / target change) ────────
function useAnimatedNumber(target, duration = 1200) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef(null)
  const fromRef = useRef(0)

  useEffect(() => {
    if (!target) return
    cancelAnimationFrame(rafRef.current)
    const start = Date.now()
    const from = fromRef.current
    const step = () => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(from + (target - from) * ease)
      setDisplay(current)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        fromRef.current = target
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return display
}

// ── Helper sub-components ─────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    completed: { cls: 'badge-success', label: '✅ Done'    },
    warning:   { cls: 'badge-warning', label: '⚠️ Warning' },
    alert:     { cls: 'badge-danger',  label: '🚨 Alert'   },
  }
  const { cls, label } = map[status] || { cls: 'badge-info', label: status }
  return <span className={`badge ${cls}`}>{label}</span>
}

const TYPE_ICONS = { collection:'🚚', prediction:'🔮', alert:'🚨', recovery:'⚗️', marketplace:'🏪' }

function formatTime(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
  } catch { return '' }
}

// ── Main component ────────────────────────────────────────────────────────────
function Dashboard() {
  const clock = useLiveClock()
  const [stats,      setStats]      = useState(MOCK_STATS)
  const [forecast,   setForecast]   = useState(MOCK_FORECAST)
  const [activities, setActivities] = useState(MOCK_ACTIVITIES)
  const [live,       setLive]       = useState(MOCK_LIVE)
  const [regions,    setRegions]    = useState(MOCK_REGIONS)
  const [materials,  setMaterials]  = useState(MOCK_MATERIALS)

  const animBatteries   = useAnimatedNumber(stats.batteries_tracked)
  const animSolar       = useAnimatedNumber(stats.solar_panels_monitored)
  const animCollections = useAnimatedNumber(stats.active_collections)
  const animMaterial    = useAnimatedNumber(Math.round(stats.material_recovered_tonnes))
  const animCredits     = useAnimatedNumber(stats.carbon_credits_earned)

  useEffect(() => {
    const fetchAll = async () => {
      const [s, f, a, l, r, m] = await Promise.all([
        apiFetch('/api/dashboard/stats',                     MOCK_STATS),
        apiFetch('/api/dashboard/waste-forecast',            MOCK_FORECAST),
        apiFetch('/api/dashboard/recent-activity',           { activities: MOCK_ACTIVITIES }),
        apiFetch('/api/dashboard/live-metrics',              MOCK_LIVE),
        apiFetch('/api/dashboard/regional-data',             { regions: MOCK_REGIONS }),
        apiFetch('/api/dashboard/material-recovery-summary', { materials: MOCK_MATERIALS }),
      ])
      setStats(s)
      setForecast(f)
      setActivities(a.activities || MOCK_ACTIVITIES)
      setLive(l)
      setRegions(r.regions || MOCK_REGIONS)
      setMaterials(m.materials || MOCK_MATERIALS)
    }
    fetchAll()
    const id = setInterval(fetchAll, 5000)
    return () => clearInterval(id)
  }, [])

  // ── Chart data derived from state ──────────────────────────────────────────
  const forecastChartData = {
    labels: forecast.labels,
    datasets: [
      {
        label: 'Battery Waste (tonnes)',
        data: forecast.battery_waste_tonnes,
        borderColor: '#00897b',
        backgroundColor: 'rgba(0,137,123,0.12)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Solar Panel Waste (tonnes)',
        data: forecast.solar_waste_tonnes,
        borderColor: '#1565c0',
        backgroundColor: 'rgba(21,101,192,0.10)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const materialChartData = {
    labels: materials.map((m) => m.name),
    datasets: [{
      label: 'Recovered (kg)',
      data: materials.map((m) => m.recovered_kg),
      backgroundColor: materials.map((m) => m.color),
    }],
  }

  const regionalChartData = {
    labels: regions.map((r) => r.state),
    datasets: [
      {
        label: 'Batteries',
        data: regions.map((r) => r.batteries),
        backgroundColor: '#00897b',
      },
      {
        label: 'Solar Panels',
        data: regions.map((r) => r.panels),
        backgroundColor: '#1565c0',
      },
    ],
  }

  const mapMarkers = regions.map((r) => ({
    lat: r.lat,
    lng: r.lng,
    popup: `<b>${r.state}</b><br/>🔋 Batteries: ${r.batteries.toLocaleString()}<br/>☀️ Panels: ${r.panels.toLocaleString()}<br/>🚚 Collections: ${r.collections}`,
    color: r.collections > 40 ? '#c62828' : r.collections > 30 ? '#f57c00' : '#2e7d32',
  }))

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="page-header dash-header">
        <div>
          <h1>📊 Platform Dashboard</h1>
          <p>Real-time overview of the Smart Reverse Recycling Network — Feb 2026</p>
        </div>
        <div className="live-clock">
          <span className="live-dot" />
          LIVE &nbsp;{clock}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="metrics-grid">
        <MetricCard title="Batteries Tracked"       value={animBatteries.toLocaleString()}   icon="🔋" trend={stats.batteries_change_pct}   color="#00897b" />
        <MetricCard title="Solar Panels Monitored"  value={animSolar.toLocaleString()}        icon="☀️" trend={stats.solar_change_pct}       color="#1565c0" />
        <MetricCard title="Active Collections"      value={animCollections}                   icon="🚚" trend={stats.collections_change_pct} color="#f57c00" />
        <MetricCard title="Material Recovered"      value={animMaterial.toLocaleString()} unit="MT" icon="♻️" trend={stats.material_change_pct}   color="#2e7d32" />
        <MetricCard title="Revenue Generated"       value={`₹${stats.revenue_inr_crores} Cr`} icon="💰" trend={18.2}                         color="#7b1fa2" />
        <MetricCard title="Carbon Credits Earned"   value={animCredits.toLocaleString()}      icon="🌱" trend={22.4}                         color="#388e3c" />
      </div>

      {/* Charts row 1 */}
      <div className="charts-grid">
        <ChartWidget title="🔮 2026 Monthly Waste Forecast" type="line"     data={forecastChartData} />
        <ChartWidget title="⚗️ Material Recovery Breakdown" type="doughnut" data={materialChartData} />
      </div>

      {/* Charts row 2 */}
      <div className="charts-grid" style={{ marginBottom: 32 }}>
        <ChartWidget title="🗺️ State-wise Collection Distribution" type="bar" data={regionalChartData} />
      </div>

      {/* Map + Activity feed */}
      <div className="charts-grid" style={{ marginBottom: 32 }}>
        {/* India map */}
        <div className="card">
          <div className="card-title">🗺️ India — Regional Collection Map</div>
          <MapView
            center={[20.5937, 78.9629]}
            zoom={4}
            markers={mapMarkers}
            height={360}
          />
          <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            🔴 High (&gt;40) &nbsp;|&nbsp; 🟠 Medium (&gt;30) &nbsp;|&nbsp; 🟢 Lower — collections this month
          </div>
        </div>

        {/* Live activity feed */}
        <div className="card">
          <div className="card-title">🕐 Live Activity Feed</div>
          <div className="activity-feed">
            {activities.map((a) => (
              <div key={a.id} className="activity-item">
                <span className="activity-icon">{TYPE_ICONS[a.type] || '📋'}</span>
                <div className="activity-body">
                  <span className="activity-message">{a.message}</span>
                  <div className="activity-meta">
                    <span className="activity-time">{formatTime(a.timestamp)}</span>
                    <StatusBadge status={a.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live metrics bar */}
      <div className="live-metrics-bar">
        <div className="live-metrics-item">
          <span className="live-metrics-value">{live.collections_today}</span>
          <span className="live-metrics-label">Collections Today</span>
        </div>
        <div className="live-metrics-item">
          <span className="live-metrics-value">{live.batteries_processed_today}</span>
          <span className="live-metrics-label">Batteries Processed</span>
        </div>
        <div className="live-metrics-item">
          <span className="live-metrics-value">{live.panels_processed_today}</span>
          <span className="live-metrics-label">Panels Processed</span>
        </div>
        <div className="live-metrics-item">
          <span className="live-metrics-value" style={{ color: '#ef5350' }}>{live.alerts_active}</span>
          <span className="live-metrics-label">🚨 Active Alerts</span>
        </div>
        <div className="live-metrics-item">
          <span className="live-metrics-value">{live.recyclers_online}</span>
          <span className="live-metrics-label">Recyclers Online</span>
        </div>
        <div className="live-metrics-item">
          <span className="live-metrics-value" style={{ color: '#2e7d32' }}>{live.efficiency_score}%</span>
          <span className="live-metrics-label">Efficiency Score</span>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
