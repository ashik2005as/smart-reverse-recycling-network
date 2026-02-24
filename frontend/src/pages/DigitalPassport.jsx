import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ChartWidget from '../components/ChartWidget'

const RECENT_MOCK = [
  { passport_id: 'DP-A8B2C3D4', asset_type: 'battery', manufacturer: 'Tata Motors',     current_status: 'Second-Life Deployment', location: 'Mumbai' },
  { passport_id: 'SP-D4E5F6G7', asset_type: 'solar',   manufacturer: 'Waaree Energies',  current_status: 'Recycling Scheduled',    location: 'Ahmedabad' },
  { passport_id: 'DP-F1A2B3C4', asset_type: 'battery', manufacturer: 'Ola Electric',     current_status: 'Active',                 location: 'Bangalore' },
  { passport_id: 'SP-G5H6I7J8', asset_type: 'solar',   manufacturer: 'Adani Solar',      current_status: 'Repair In Progress',     location: 'Rajasthan' },
  { passport_id: 'DP-K9L0M1N2', asset_type: 'battery', manufacturer: 'Mahindra',         current_status: 'Disposed',               location: 'Chennai' },
]

function DigitalPassport() {
  const [query, setQuery] = useState('')
  const [passport, setPassport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recent, setRecent] = useState(RECENT_MOCK)

  useEffect(() => {
    axios.get('/api/passport/search').then(r => setRecent(r.data)).catch(() => {})
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setPassport(null)
    try {
      const res = await axios.get(`/api/passport/track/${query.trim()}`)
      setPassport(res.data)
    } catch {
      setError('Passport not found or backend unavailable — showing demo data.')
      setPassport({
        passport_id: query.toUpperCase(),
        asset_type: 'battery',
        manufacturer: 'Demo Manufacturer',
        manufacture_date: '2022-01-01',
        current_status: 'Active',
        current_location: 'Delhi, India',
        soh_history: [
          { date: '2022-01-01', soh: 100 }, { date: '2023-01-01', soh: 92 },
          { date: '2024-01-01', soh: 84 }, { date: '2026-02-23', soh: 76 },
        ],
        lifecycle_events: [
          { date: '2022-01-01', event: 'Manufactured', location: 'Factory', details: 'New asset registered' },
          { date: '2022-03-01', event: 'First Deployment', location: 'Delhi', details: 'Asset deployed' },
          { date: '2026-02-23', event: 'Health Check', location: 'Service Centre', details: 'Routine inspection' },
        ],
        compliance: { e_waste_rules_2023: true, epr_registered: true, certified_recycler: true },
        carbon_credits_earned: 21.0,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${query.toUpperCase()}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const sohChartData = passport ? {
    labels: passport.soh_history.map(h => h.date),
    datasets: [{
      label: passport.asset_type === 'battery' ? 'SOH (%)' : 'Efficiency (%)',
      data: passport.soh_history.map(h => h.soh),
      borderColor: '#00897b',
      backgroundColor: 'rgba(0,137,123,0.12)',
      fill: true,
      tension: 0.4,
    }],
  } : null

  return (
    <div>
      <div className="page-header">
        <h1>📜 Digital Passport — Asset Lifecycle Tracking</h1>
        <p>Track the complete lifecycle of any battery or solar panel using its unique Digital Passport ID</p>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">🔍 Search by Passport ID</div>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Passport ID (e.g. DP-A8B2C3D4 or SP-D4E5F6G7)</label>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter passport ID…"
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Searching…' : '🔍 Track'}
          </button>
        </form>
        {error && <div className="alert alert-warning" style={{ marginTop: 12 }}>{error}</div>}
      </div>

      {/* Passport Details */}
      {passport && (
        <div>
          {/* Asset Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
            <div className="card">
              <div className="card-title">🪪 Asset Information</div>
              <div className="result-grid">
                <div className="result-item">
                  <div className="value" style={{ fontSize: '1.1rem' }}>{passport.passport_id}</div>
                  <div className="label">Passport ID</div>
                </div>
                <div className="result-item">
                  <div className="value" style={{ fontSize: '1.1rem' }}>{passport.asset_type === 'battery' ? '🔋 Battery' : '☀️ Solar Panel'}</div>
                  <div className="label">Asset Type</div>
                </div>
                <div className="result-item">
                  <div className="value" style={{ fontSize: '1rem' }}>{passport.manufacturer}</div>
                  <div className="label">Manufacturer</div>
                </div>
                <div className="result-item">
                  <div className="value" style={{ fontSize: '1rem' }}>{passport.manufacture_date}</div>
                  <div className="label">Manufacture Date</div>
                </div>
                <div className="result-item">
                  <div className="value" style={{ fontSize: '1rem', color: '#1565c0' }}>{passport.current_status}</div>
                  <div className="label">Current Status</div>
                </div>
                <div className="result-item">
                  <div className="value" style={{ fontSize: '1rem' }}>{passport.current_location}</div>
                  <div className="label">Location</div>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <strong>📋 Compliance Status:</strong>
                <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                  {Object.entries(passport.compliance).map(([key, val]) => (
                    <span key={key} className={`badge ${val ? 'badge-success' : 'badge-danger'}`}>
                      {val ? '✅' : '❌'} {key.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="alert alert-success" style={{ marginTop: 16 }}>
                🌱 Carbon Credits Earned: <strong>{passport.carbon_credits_earned}</strong>
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div className="card-title">📱 QR Code</div>
              <img src={passport.qr_code_url} alt="QR Code" style={{ maxWidth: 150, borderRadius: 8 }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>Scan to verify asset</p>
            </div>
          </div>

          {/* SOH Chart */}
          {sohChartData && (
            <div style={{ marginBottom: 24 }}>
              <ChartWidget
                title={`📈 ${passport.asset_type === 'battery' ? 'SOH' : 'Efficiency'} History Over Time`}
                type="line"
                data={sohChartData}
                height={200}
              />
            </div>
          )}

          {/* Lifecycle Events */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-title">📅 Lifecycle Events</div>
            <div style={{ position: 'relative', paddingLeft: 24 }}>
              <div style={{ position: 'absolute', left: 10, top: 0, bottom: 0, width: 2, background: '#e0e0e0' }} />
              {passport.lifecycle_events.map((ev, i) => (
                <div key={i} style={{ position: 'relative', marginBottom: 20 }}>
                  <div style={{ position: 'absolute', left: -18, top: 4, width: 12, height: 12, borderRadius: '50%', background: '#00897b', border: '2px solid #fff', boxShadow: '0 0 0 2px #00897b' }} />
                  <div style={{ background: '#f9f9f9', borderRadius: 8, padding: '10px 14px', marginLeft: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ev.event}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      📅 {ev.date} &nbsp;|&nbsp; 📍 {ev.location}
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: 4 }}>{ev.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Passports */}
      <div className="card">
        <div className="card-title">🕐 Recent Passports</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Passport ID</th>
                <th style={{ padding: '8px 12px' }}>Type</th>
                <th style={{ padding: '8px 12px' }}>Manufacturer</th>
                <th style={{ padding: '8px 12px' }}>Status</th>
                <th style={{ padding: '8px 12px' }}>Location</th>
                <th style={{ padding: '8px 12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((p) => (
                <tr key={p.passport_id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 12px' }}><code>{p.passport_id}</code></td>
                  <td style={{ padding: '8px 12px' }}>{p.asset_type === 'battery' ? '🔋' : '☀️'} {p.asset_type}</td>
                  <td style={{ padding: '8px 12px' }}>{p.manufacturer}</td>
                  <td style={{ padding: '8px 12px' }}><span className="badge badge-info">{p.current_status}</span></td>
                  <td style={{ padding: '8px 12px' }}>📍 {p.location}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                      onClick={() => { setQuery(p.passport_id); setError(''); }}>
                      Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DigitalPassport
