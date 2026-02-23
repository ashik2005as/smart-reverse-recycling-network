import React, { useState } from 'react'
import MapView from '../components/MapView'
import MetricCard from '../components/MetricCard'
import ChartWidget from '../components/ChartWidget'

// Simulated illegal dumping alerts
const ALERTS = [
  { id: 1, location: 'Gurgaon Industrial Area', lat: 28.4595, lng: 77.0266, severity: 'high',   status: 'active',   type: 'EV Battery Dump' },
  { id: 2, location: 'Dharavi, Mumbai',         lat: 19.0407, lng: 72.8490, severity: 'medium', status: 'resolved', type: 'Solar Panel Waste' },
  { id: 3, location: 'Mundka, Delhi',           lat: 28.6804, lng: 76.9984, severity: 'high',   status: 'active',   type: 'Mixed e-Waste' },
  { id: 4, location: 'Howrah, Kolkata',         lat: 22.5958, lng: 88.2636, severity: 'low',    status: 'resolved', type: 'Battery Cells' },
  { id: 5, location: 'Ambattur, Chennai',       lat: 13.1143, lng: 80.1548, severity: 'medium', status: 'active',   type: 'Solar Panels' },
]

// Waste heatmap points across India (2026 projections)
const HEATMAP_POINTS = [
  { lat: 28.7041, lng: 77.1025, popup: '<b>Delhi NCR</b><br>2026 actual: 3,200 MT batteries', color: '#c62828' },
  { lat: 19.0760, lng: 72.8777, popup: '<b>Mumbai Metro</b><br>2026 actual: 2,450 MT',        color: '#c62828' },
  { lat: 12.9716, lng: 77.5946, popup: '<b>Bangalore</b><br>2026 actual: 2,100 MT',           color: '#e53935' },
  { lat: 22.5726, lng: 88.3639, popup: '<b>Kolkata</b><br>2026 actual: 1,380 MT',             color: '#f57c00' },
  { lat: 13.0827, lng: 80.2707, popup: '<b>Chennai</b><br>2026 actual: 1,150 MT',             color: '#f57c00' },
  { lat: 17.3850, lng: 78.4867, popup: '<b>Hyderabad</b><br>2026 actual: 1,020 MT',           color: '#ffa726' },
  { lat: 23.0225, lng: 72.5714, popup: '<b>Ahmedabad</b><br>2026 actual: 880 MT',             color: '#ffa726' },
  { lat: 26.9124, lng: 75.7873, popup: '<b>Jaipur (Solar Hub)</b><br>2026 actual: 720 MT panels', color: '#66bb6a' },
  { lat: 21.1458, lng: 79.0882, popup: '<b>Nagpur</b><br>2026 actual: 620 MT',                color: '#66bb6a' },
  { lat: 11.0168, lng: 76.9558, popup: '<b>Coimbatore</b><br>2026 actual: 490 MT',            color: '#a5d6a7' },
]

// Battery waste forecast by state (2026)
const wasteForecastData = {
  labels: ['Delhi', 'MH', 'KA', 'WB', 'TN', 'TS', 'GJ', 'RJ', 'UP', 'MP'],
  datasets: [
    {
      label: 'Batteries (MT) 2026',
      data: [3200, 2450, 2100, 1380, 1150, 1020, 880, 720, 620, 490],
      backgroundColor: '#00897b',
    },
    {
      label: 'Solar Panels (MT) 2026',
      data: [1380, 2050, 1020, 520, 780, 600, 1580, 2400, 410, 890],
      backgroundColor: '#1565c0',
    },
  ],
}

// Recycler capacity
const capacityData = {
  labels: ['GreenRecycle Ltd', 'EcoMetal India', 'SolarWaste Co', 'NationalBattery', 'CleanCycle'],
  datasets: [{
    label: 'Utilisation %',
    data: [91, 78, 52, 95, 69],
    backgroundColor: ['#c62828', '#f57c00', '#66bb6a', '#c62828', '#ffa726'],
  }],
}

// ESG Metrics — 2026
const ESG = {
  carbon_credits_issued: 15623,
  trees_equivalent: 109800,
  water_saved_kl: 5840,
  informal_jobs_formalised: 4920,
  compliance_score: 96,
  waste_diverted_mt: 28.6,
}

function GovDashboard() {
  const alertMarkers = ALERTS.map((a) => ({
    lat: a.lat, lng: a.lng,
    popup: `<b>${a.location}</b><br>Type: ${a.type}<br>Severity: ${a.severity}<br>Status: ${a.status}`,
    color: a.status === 'active' ? (a.severity === 'high' ? '#c62828' : '#f57c00') : '#2e7d32',
  }))

  return (
    <div>
      <div className="page-header">
        <h1>🏛️ Government Dashboard</h1>
        <p>National-level oversight, forecasting, and compliance monitoring — Feb 2026</p>
      </div>

      {/* ESG Metrics */}
      <div className="metrics-grid" style={{ marginBottom: 28 }}>
        <MetricCard title="Carbon Credits Issued" value={ESG.carbon_credits_issued.toLocaleString()} icon="🌿" trend={18.2} color="#2e7d32" />
        <MetricCard title="Trees Equivalent" value={(ESG.trees_equivalent/1000).toFixed(1)+'k'} icon="🌳" trend={22.1} color="#388e3c" />
        <MetricCard title="Waste Diverted" value={ESG.waste_diverted_mt} unit="MT" icon="♻️" trend={15.7} color="#00897b" />
        <MetricCard title="Compliance Score" value={ESG.compliance_score} unit="%" icon="✅" color="#1565c0" />
      </div>

      {/* Waste Heatmap */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-title">🗺️ National Waste Concentration Heatmap</div>
        <MapView
          center={[20.5937, 78.9629]}
          zoom={5}
          markers={[...HEATMAP_POINTS, ...alertMarkers]}
          height={400}
        />
        <div style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          🔴 High concentration &nbsp;|&nbsp; 🟠 Medium &nbsp;|&nbsp; 🟢 Low &nbsp;|&nbsp;
          ⚠️ Red markers = active dumping alerts
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid" style={{ marginBottom: 28 }}>
        <ChartWidget
          title="📊 Projected Waste by State (2026)"
          type="bar"
          data={wasteForecastData}
        />
        <ChartWidget
          title="🏭 Recycler Capacity Utilisation (%)"
          type="bar"
          data={capacityData}
          options={{ scales: { y: { max: 100 } } }}
        />
      </div>

      {/* Illegal Dumping Alerts */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-title">🚨 Illegal Dumping Alerts</div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Waste Type</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ALERTS.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.location}</strong></td>
                  <td>{a.type}</td>
                  <td>
                    <span className={`badge ${a.severity === 'high' ? 'badge-danger' : a.severity === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                      {a.severity.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${a.status === 'active' ? 'badge-danger' : 'badge-success'}`}>
                      {a.status === 'active' ? '⚠️ Active' : '✅ Resolved'}
                    </span>
                  </td>
                  <td>
                    {a.status === 'active' && (
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        Dispatch Team
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ESG Impact Summary */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #e8f5e9, #e3f2fd)' }}>
        <div className="card-title">🌍 ESG Impact Metrics</div>
        <div className="result-grid">
          <div className="result-item">
            <div className="value" style={{ color: '#2e7d32' }}>{ESG.carbon_credits_issued.toLocaleString()}</div>
            <div className="label">Carbon Credits Issued</div>
          </div>
          <div className="result-item">
            <div className="value" style={{ color: '#1565c0' }}>{ESG.water_saved_kl.toLocaleString()} kL</div>
            <div className="label">Water Saved</div>
          </div>
          <div className="result-item">
            <div className="value" style={{ color: '#7b1fa2' }}>{ESG.informal_jobs_formalised.toLocaleString()}</div>
            <div className="label">Informal Jobs Formalised</div>
          </div>
          <div className="result-item">
            <div className="value" style={{ color: '#00897b' }}>{ESG.trees_equivalent.toLocaleString()}</div>
            <div className="label">Trees-Equivalent CO₂</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GovDashboard
