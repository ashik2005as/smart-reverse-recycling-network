import React, { useState, useEffect } from 'react'
import axios from 'axios'
import MapView from '../components/MapView'

const MOCK_FACILITIES = [
  { id: 1,  name: 'GreenRecycle Ltd',        type: 'battery_recycler', city: 'Mumbai',     state: 'Maharashtra', lat: 19.076, lng: 72.877, capacity_mt: 500, utilisation_pct: 87, certifications: ['CPCB','ISO 14001','EPR'], contact: '+91 22 1234 5678', accepts: ['li-ion','nimh','lead-acid'], rating: 4.5 },
  { id: 2,  name: 'SolarWaste Co',            type: 'solar_recycler',   city: 'Ahmedabad',  state: 'Gujarat',     lat: 23.022, lng: 72.571, capacity_mt: 200, utilisation_pct: 45, certifications: ['CPCB','ISO 14001'],      contact: '+91 79 9876 5432', accepts: ['mono-si','poly-si','thin-film'], rating: 4.2 },
  { id: 3,  name: 'BattRecycle Pvt Ltd',      type: 'battery_recycler', city: 'Chennai',    state: 'Tamil Nadu',  lat: 13.082, lng: 80.270, capacity_mt: 350, utilisation_pct: 72, certifications: ['CPCB','EPR','ISO 9001'],  contact: '+91 44 5678 1234', accepts: ['li-ion','lead-acid'], rating: 4.3 },
  { id: 4,  name: 'EcoSolar Recyclers',       type: 'solar_recycler',   city: 'Jaipur',     state: 'Rajasthan',   lat: 26.912, lng: 75.787, capacity_mt: 150, utilisation_pct: 60, certifications: ['CPCB','ISO 14001'],      contact: '+91 141 234 5678', accepts: ['mono-si','poly-si'], rating: 3.9 },
  { id: 5,  name: 'Delhi E-Waste Hub',        type: 'battery_recycler', city: 'Delhi',      state: 'Delhi',       lat: 28.704, lng: 77.102, capacity_mt: 600, utilisation_pct: 91, certifications: ['CPCB','EPR','ISO 14001','ISO 9001'], contact: '+91 11 8765 4321', accepts: ['li-ion','nimh','lead-acid','nimcad'], rating: 4.7 },
  { id: 6,  name: 'Bangalore Green Tech',     type: 'battery_recycler', city: 'Bangalore',  state: 'Karnataka',   lat: 12.971, lng: 77.594, capacity_mt: 280, utilisation_pct: 65, certifications: ['CPCB','ISO 14001'],      contact: '+91 80 2345 6789', accepts: ['li-ion','nimh'], rating: 4.1 },
  { id: 7,  name: 'Kolkata Reclaim Centre',   type: 'battery_recycler', city: 'Kolkata',    state: 'West Bengal', lat: 22.572, lng: 88.363, capacity_mt: 180, utilisation_pct: 55, certifications: ['CPCB','EPR'],            contact: '+91 33 6543 2109', accepts: ['lead-acid','li-ion'], rating: 3.8 },
  { id: 8,  name: 'SolarReuse India',         type: 'solar_recycler',   city: 'Ahmedabad',  state: 'Gujarat',     lat: 23.033, lng: 72.585, capacity_mt: 120, utilisation_pct: 38, certifications: ['CPCB','ISO 14001','EPR'], contact: '+91 79 1122 3344', accepts: ['mono-si','poly-si','thin-film','perc'], rating: 4.4 },
  { id: 9,  name: 'Hyderabad Battery Works',  type: 'battery_recycler', city: 'Hyderabad',  state: 'Telangana',   lat: 17.385, lng: 78.486, capacity_mt: 240, utilisation_pct: 78, certifications: ['CPCB','ISO 9001'],       contact: '+91 40 9988 7766', accepts: ['li-ion','nimh','lead-acid'], rating: 4.0 },
  { id: 10, name: 'Pune Solar Recovery',      type: 'solar_recycler',   city: 'Pune',       state: 'Maharashtra', lat: 18.520, lng: 73.856, capacity_mt: 100, utilisation_pct: 50, certifications: ['CPCB'],                  contact: '+91 20 5544 3322', accepts: ['mono-si','poly-si'], rating: 3.7 },
  { id: 11, name: 'Chennai Solar Hub',        type: 'solar_recycler',   city: 'Chennai',    state: 'Tamil Nadu',  lat: 13.067, lng: 80.237, capacity_mt: 170, utilisation_pct: 43, certifications: ['CPCB','ISO 14001'],      contact: '+91 44 7788 9900', accepts: ['mono-si','poly-si','thin-film'], rating: 4.1 },
  { id: 12, name: 'Jamshedpur E-Cycle',       type: 'battery_recycler', city: 'Jamshedpur', state: 'Jharkhand',   lat: 22.802, lng: 86.202, capacity_mt: 200, utilisation_pct: 62, certifications: ['CPCB','EPR'],            contact: '+91 657 234 5678', accepts: ['lead-acid','li-ion'], rating: 3.9 },
]

const ALL_STATES = [...new Set(MOCK_FACILITIES.map(f => f.state))].sort()

function StarRating({ rating }) {
  const full = Math.floor(rating)
  return (
    <span style={{ color: '#f59e0b', fontSize: '0.9rem' }}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)} {rating.toFixed(1)}
    </span>
  )
}

function UtilBar({ pct }) {
  const color = pct > 80 ? '#c62828' : pct > 60 ? '#f57c00' : '#2e7d32'
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 2 }}>
        <span>Utilisation</span><span style={{ color }}>{pct}%</span>
      </div>
      <div style={{ background: '#e0e0e0', borderRadius: 4, height: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

function FacilityLocator() {
  const [facilities, setFacilities] = useState(MOCK_FACILITIES)
  const [typeFilter, setTypeFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (typeFilter) params.append('type', typeFilter)
    if (stateFilter) params.append('state', stateFilter)
    axios.get(`/api/facilities/?${params}`)
      .then(r => setFacilities(r.data))
      .catch(() => {
        let filtered = MOCK_FACILITIES
        if (typeFilter) filtered = filtered.filter(f => f.type === typeFilter)
        if (stateFilter) filtered = filtered.filter(f => f.state === stateFilter)
        setFacilities(filtered)
      })
  }, [typeFilter, stateFilter])

  const mapMarkers = facilities.map(f => ({
    lat: f.lat, lng: f.lng,
    popup: `<b>${f.name}</b><br/>${f.city}, ${f.state}<br/>Capacity: ${f.capacity_mt} MT<br/>Rating: ${f.rating}⭐`,
    color: f.type === 'battery_recycler' ? '#1565c0' : '#f57c00',
  }))

  return (
    <div>
      <div className="page-header">
        <h1>🏭 Certified Recycler &amp; Facility Locator</h1>
        <p>Find CPCB-certified recycling and collection facilities across India</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 200 }}>
            <label>Asset Type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="form-control">
              <option value="">All Types</option>
              <option value="battery_recycler">🔋 Battery Recycler</option>
              <option value="solar_recycler">☀️ Solar Recycler</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 200 }}>
            <label>State</label>
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="form-control">
              <option value="">All States</option>
              {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => { setTypeFilter(''); setStateFilter('') }}>
            🔄 Reset Filters
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">🗺️ Facility Map — India</div>
        <MapView center={[20.5937, 78.9629]} zoom={5} markers={mapMarkers} height={380} />
        <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          🔵 Battery Recycler &nbsp;|&nbsp; 🟠 Solar Recycler
        </div>
      </div>

      {/* Facility Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {facilities.map(f => (
          <div key={f.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{f.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>📍 {f.city}, {f.state}</div>
              </div>
              <span className={`badge ${f.type === 'battery_recycler' ? 'badge-info' : 'badge-warning'}`} style={{ flexShrink: 0 }}>
                {f.type === 'battery_recycler' ? '🔋 Battery' : '☀️ Solar'}
              </span>
            </div>

            <StarRating rating={f.rating} />
            <UtilBar pct={f.utilisation_pct} />

            <div style={{ marginTop: 10, fontSize: '0.83rem', lineHeight: 1.7 }}>
              <div>💾 Capacity: <strong>{f.capacity_mt} MT/year</strong></div>
              <div>📞 {f.contact}</div>
              <div style={{ marginTop: 4 }}>
                {f.certifications.map(c => (
                  <span key={c} className="badge badge-success" style={{ marginRight: 4, fontSize: '0.72rem' }}>{c}</span>
                ))}
              </div>
              <div style={{ marginTop: 6, color: 'var(--text-muted)' }}>
                Accepts: {f.accepts.join(', ')}
              </div>
            </div>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`}
              target="_blank" rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ marginTop: 12, width: '100%', textAlign: 'center', textDecoration: 'none' }}
            >
              🗺️ Get Directions
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FacilityLocator
