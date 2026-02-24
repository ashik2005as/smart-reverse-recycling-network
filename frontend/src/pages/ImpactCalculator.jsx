import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ChartWidget from '../components/ChartWidget'

const initialForm = {
  batteries_recycled: '',
  solar_panels_recycled: '',
  batteries_reused: '',
  solar_panels_reused: '',
}

const PLATFORM_MOCK = {
  co2_saved_kg: 4500000,
  co2_equivalent_trees: 225000,
  water_saved_litres: 18000000,
  energy_saved_kwh: 12500000,
  landfill_diverted_kg: 3200000,
  batteries_recycled: 24500,
  batteries_reused: 8200,
  solar_panels_recycled: 31000,
  solar_panels_reused: 12500,
  economic_value_inr: 1250000000,
  carbon_credits_earned: 4500,
  materials_recovered: {
    lithium_kg: 45000, cobalt_kg: 32000, nickel_kg: 89000, copper_kg: 120000,
    silicon_kg: 240000, silver_g: 18000000, glass_kg: 1500000, aluminium_kg: 320000,
  },
}

function fmtNum(n) {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + ' Cr'
  if (n >= 100000) return (n / 100000).toFixed(1) + ' L'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n?.toLocaleString?.() ?? n
}

function ImpactCalculator() {
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [platform, setPlatform] = useState(PLATFORM_MOCK)

  useEffect(() => {
    axios.get('/api/impact/platform-total').then(r => setPlatform(r.data)).catch(() => {})
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const payload = {
        batteries_recycled:   parseInt(form.batteries_recycled)   || 0,
        solar_panels_recycled: parseInt(form.solar_panels_recycled) || 0,
        batteries_reused:     parseInt(form.batteries_reused)     || 0,
        solar_panels_reused:  parseInt(form.solar_panels_reused)  || 0,
      }
      const res = await axios.post('/api/impact/calculate', payload)
      setResult(res.data)
    } catch {
      // Mock calculation
      const br = parseInt(form.batteries_recycled) || 0
      const sr = parseInt(form.solar_panels_recycled) || 0
      const bu = parseInt(form.batteries_reused) || 0
      const su = parseInt(form.solar_panels_reused) || 0
      setResult({
        co2_saved_kg: br * 120 + bu * 200 + sr * 80 + su * 150,
        co2_equivalent_trees: Math.round((br * 120 + bu * 200 + sr * 80 + su * 150) / 20),
        water_saved_litres: br * 450 + bu * 800 + sr * 300 + su * 600,
        energy_saved_kwh: (br + bu) * 350 + (sr + su) * 200,
        landfill_diverted_kg: (br + bu) * 75 + (sr + su) * 20,
        toxic_chemicals_prevented_kg: br * 22.5 + sr * 0.3,
        materials_recovered: {
          lithium_kg: (br + bu) * 1.2, cobalt_kg: br * 0.85, nickel_kg: br * 2.4,
          copper_kg: (br + bu + sr) * 3.2, silicon_kg: (sr + su) * 6.4,
          silver_g: (sr + su) * 470, glass_kg: (sr + su) * 10.5, aluminium_kg: (sr + su) * 8.4 + br * 1.1,
        },
        economic_value_inr: br * 18000 + bu * 35000 + sr * 8000 + su * 15000,
        carbon_credits_earned: ((br * 120 + bu * 200 + sr * 80 + su * 150) / 1000).toFixed(1),
        esg_score_improvement: Math.min(25, ((br * 120 + bu * 200) / 5000) * 5).toFixed(1),
      })
    } finally {
      setLoading(false)
    }
  }

  const materialsChartData = result ? {
    labels: ['Lithium', 'Cobalt', 'Nickel', 'Copper', 'Silicon', 'Glass', 'Aluminium'],
    datasets: [{
      label: 'Recovered (kg)',
      data: [
        result.materials_recovered.lithium_kg,
        result.materials_recovered.cobalt_kg,
        result.materials_recovered.nickel_kg,
        result.materials_recovered.copper_kg,
        result.materials_recovered.silicon_kg,
        result.materials_recovered.glass_kg,
        result.materials_recovered.aluminium_kg,
      ],
      backgroundColor: ['#4CAF50','#2196F3','#FF9800','#F44336','#607D8B','#9E9E9E','#795548'],
    }],
  } : null

  return (
    <div>
      <div className="page-header">
        <h1>🌍 Environmental Impact Calculator</h1>
        <p>Calculate the environmental and economic impact of recycling and reusing batteries and solar panels</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 28 }}>
        {/* Form */}
        <div className="card">
          <div className="card-title">📥 Enter Volumes</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>🔋 Batteries Recycled</label>
                <input type="number" name="batteries_recycled" value={form.batteries_recycled} onChange={handleChange} placeholder="e.g. 100" min="0" />
              </div>
              <div className="form-group">
                <label>🔋 Batteries Reused</label>
                <input type="number" name="batteries_reused" value={form.batteries_reused} onChange={handleChange} placeholder="e.g. 50" min="0" />
              </div>
              <div className="form-group">
                <label>☀️ Solar Panels Recycled</label>
                <input type="number" name="solar_panels_recycled" value={form.solar_panels_recycled} onChange={handleChange} placeholder="e.g. 200" min="0" />
              </div>
              <div className="form-group">
                <label>☀️ Solar Panels Reused</label>
                <input type="number" name="solar_panels_reused" value={form.solar_panels_reused} onChange={handleChange} placeholder="e.g. 80" min="0" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}>
              {loading ? '⏳ Calculating…' : '🌍 Calculate Impact'}
            </button>
          </form>
        </div>

        {/* Result or Info */}
        {result ? (
          <div className="result-panel">
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>🌱 Impact Summary</h3>
            <div className="result-grid">
              <div className="result-item">
                <div className="value" style={{ color: '#2e7d32' }}>{fmtNum(result.co2_saved_kg)}</div>
                <div className="label">CO₂ Saved (kg)</div>
              </div>
              <div className="result-item">
                <div className="value" style={{ color: '#388e3c' }}>{fmtNum(result.co2_equivalent_trees)}</div>
                <div className="label">🌳 Trees Equivalent</div>
              </div>
              <div className="result-item">
                <div className="value" style={{ color: '#1565c0' }}>{fmtNum(result.water_saved_litres)}</div>
                <div className="label">💧 Water Saved (L)</div>
              </div>
              <div className="result-item">
                <div className="value" style={{ color: '#f57c00' }}>{fmtNum(result.energy_saved_kwh)}</div>
                <div className="label">⚡ Energy Saved (kWh)</div>
              </div>
              <div className="result-item">
                <div className="value">{fmtNum(result.landfill_diverted_kg)}</div>
                <div className="label">🗑️ Landfill Diverted (kg)</div>
              </div>
              <div className="result-item">
                <div className="value" style={{ color: '#c62828' }}>{fmtNum(result.toxic_chemicals_prevented_kg)}</div>
                <div className="label">☣️ Toxics Prevented (kg)</div>
              </div>
            </div>
            <div className="alert alert-success" style={{ marginTop: 12 }}>
              💰 Economic Value: <strong>₹{fmtNum(result.economic_value_inr)}</strong> &nbsp;|&nbsp;
              🌱 Carbon Credits: <strong>{result.carbon_credits_earned}</strong> &nbsp;|&nbsp;
              📊 ESG Score +<strong>{result.esg_score_improvement}%</strong>
            </div>
          </div>
        ) : (
          <div className="card" style={{ background: 'linear-gradient(135deg, #e8f5e9, #e0f2f1)' }}>
            <div className="card-title">ℹ️ Why It Matters</div>
            <div style={{ fontSize: '0.88rem', lineHeight: 1.8 }}>
              <p>Every recycled or reused battery and solar panel:</p>
              <ul style={{ paddingLeft: 20 }}>
                <li>Saves ~120–200 kg of CO₂ per battery</li>
                <li>Recovers valuable metals: Li, Co, Ni, Cu</li>
                <li>Prevents toxic chemical leaching into soil</li>
                <li>Generates carbon credits for ESG reporting</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Materials Chart */}
      {result && materialsChartData && (
        <div style={{ marginBottom: 28 }}>
          <ChartWidget title="⚗️ Materials Recovered Breakdown" type="doughnut" data={materialsChartData} height={260} />
        </div>
      )}

      {/* Platform Total */}
      <div className="card">
        <div className="card-title">🌐 Platform-Wide Cumulative Impact</div>
        <div className="metrics-grid" style={{ marginTop: 0 }}>
          {[
            { label: 'CO₂ Saved', value: fmtNum(platform.co2_saved_kg) + ' kg', icon: '🌿', color: '#2e7d32' },
            { label: 'Trees Equivalent', value: fmtNum(platform.co2_equivalent_trees), icon: '🌳', color: '#388e3c' },
            { label: 'Water Saved', value: fmtNum(platform.water_saved_litres) + ' L', icon: '💧', color: '#1565c0' },
            { label: 'Energy Saved', value: fmtNum(platform.energy_saved_kwh) + ' kWh', icon: '⚡', color: '#f57c00' },
            { label: 'Batteries Recycled', value: fmtNum(platform.batteries_recycled), icon: '🔋', color: '#1565c0' },
            { label: 'Solar Panels Recycled', value: fmtNum(platform.solar_panels_recycled), icon: '☀️', color: '#f57c00' },
            { label: 'Carbon Credits', value: fmtNum(platform.carbon_credits_earned), icon: '🌱', color: '#2e7d32' },
            { label: 'Economic Value', value: '₹' + fmtNum(platform.economic_value_inr), icon: '💰', color: '#7b1fa2' },
          ].map(item => (
            <div key={item.label} className="metric-card" style={{ border: `1px solid ${item.color}22`, borderRadius: 10, padding: '14px 16px', background: '#fff' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ImpactCalculator
