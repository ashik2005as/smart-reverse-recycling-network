import React, { useState, useEffect } from 'react'
import MapView from '../components/MapView'
import MetricCard from '../components/MetricCard'

// Sample collection points across India
const SAMPLE_POINTS = [
  { id: 1, name: 'Delhi North Hub',   lat: 28.7041, lng: 77.1025, load: 82, capacity: 100 },
  { id: 2, name: 'Gurgaon Center',    lat: 28.4595, lng: 77.0266, load: 65, capacity: 80 },
  { id: 3, name: 'Mumbai Central',    lat: 19.0760, lng: 72.8777, load: 90, capacity: 120 },
  { id: 4, name: 'Pune Industrial',   lat: 18.5204, lng: 73.8567, load: 45, capacity: 60 },
  { id: 5, name: 'Bangalore Tech',    lat: 12.9716, lng: 77.5946, load: 78, capacity: 100 },
  { id: 6, name: 'Chennai Port',      lat: 13.0827, lng: 80.2707, load: 55, capacity: 80 },
  { id: 7, name: 'Hyderabad Indl',    lat: 17.3850, lng: 78.4867, load: 40, capacity: 60 },
  { id: 8, name: 'Ahmedabad Solar',   lat: 23.0225, lng: 72.5714, load: 70, capacity: 90 },
  { id: 9, name: 'Jaipur Recycler',   lat: 26.9124, lng: 75.7873, load: 35, capacity: 50 },
  { id: 10, name: 'Kolkata East',     lat: 22.5726, lng: 88.3639, load: 60, capacity: 80 },
]

function RouteOptimizer() {
  const [optimized, setOptimized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [routes, setRoutes] = useState([])
  const [savings, setSavings] = useState(null)

  const markerColor = (load, capacity) => {
    const pct = (load / capacity) * 100
    if (pct >= 80) return '#c62828'
    if (pct >= 60) return '#f57c00'
    return '#2e7d32'
  }

  const markers = SAMPLE_POINTS.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    popup: `<b>${p.name}</b><br>Load: ${p.load}/${p.capacity}<br>Utilisation: ${Math.round((p.load/p.capacity)*100)}%`,
    color: markerColor(p.load, p.capacity),
  }))

  const handleOptimize = () => {
    setLoading(true)
    // Simulate route optimization (VRP solver would run here)
    setTimeout(() => {
      // Two optimised routes connecting nearby clusters
      const route1 = SAMPLE_POINTS.slice(0, 5).map((p) => [p.lat, p.lng])
      const route2 = SAMPLE_POINTS.slice(5).map((p) => [p.lat, p.lng])
      setRoutes([route1, route2])
      setSavings({
        fuel_saved_litres: 340,
        cost_saved_inr: 28900,
        co2_reduced_kg: 890,
        vehicles_optimized: 12,
        distance_saved_km: 1240,
      })
      setOptimized(true)
      setLoading(false)
    }, 1800)
  }

  return (
    <div>
      <div className="page-header">
        <h1>🗺️ Route Optimizer</h1>
        <p>AI-powered Vehicle Routing Problem (VRP) solver for optimised collection logistics</p>
      </div>

      {/* Controls */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <strong>{SAMPLE_POINTS.length} collection points</strong> loaded across India.
            {' '}{SAMPLE_POINTS.filter((p) => p.load / p.capacity >= 0.8).length} points at high capacity (≥80%).
          </div>
          <button className="btn btn-primary" onClick={handleOptimize} disabled={loading || optimized}>
            {loading ? '⏳ Optimising routes…' : optimized ? '✅ Routes Optimised' : '🚀 Run VRP Optimization'}
          </button>
          {optimized && (
            <button className="btn btn-outline" onClick={() => { setOptimized(false); setRoutes([]); setSavings(null) }}>
              🔄 Reset
            </button>
          )}
        </div>
      </div>

      {/* Savings metrics */}
      {savings && (
        <div className="metrics-grid" style={{ marginBottom: 24 }}>
          <MetricCard title="Fuel Saved" value={savings.fuel_saved_litres} unit="L" icon="⛽" color="#2e7d32" />
          <MetricCard title="Cost Savings" value={`₹${(savings.cost_saved_inr/1000).toFixed(1)}k`} icon="💰" color="#00897b" />
          <MetricCard title="CO₂ Reduced" value={savings.co2_reduced_kg} unit="kg" icon="🌿" color="#1565c0" />
          <MetricCard title="Distance Saved" value={savings.distance_saved_km} unit="km" icon="📍" color="#7b1fa2" />
        </div>
      )}

      {/* Map */}
      <div className="card">
        <div className="card-title">
          🗺️ Collection Points &amp; Optimised Routes
          <span style={{ marginLeft: 16, fontSize: '0.78rem', fontWeight: 400 }}>
            🔴 High load &nbsp; 🟠 Medium load &nbsp; 🟢 Normal load
          </span>
        </div>
        <MapView center={[20.5937, 78.9629]} zoom={5} markers={markers} routes={routes} height={480} />
      </div>

      {/* Collection Points Table */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-title">📋 Collection Point Status</div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Coordinates</th>
                <th>Load / Capacity</th>
                <th>Utilisation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_POINTS.map((p) => {
                const pct = Math.round((p.load / p.capacity) * 100)
                return (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                    </td>
                    <td>{p.load} / {p.capacity}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#e0e0e0', borderRadius: 3 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: markerColor(p.load, p.capacity), borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: '0.82rem', minWidth: 36 }}>{pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${pct >= 80 ? 'badge-danger' : pct >= 60 ? 'badge-warning' : 'badge-success'}`}>
                        {pct >= 80 ? 'Critical' : pct >= 60 ? 'High' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default RouteOptimizer
