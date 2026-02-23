import React, { useState } from 'react'
import ChartWidget from '../components/ChartWidget'

// Material prices in USD/kg (approximate market rates)
const MATERIAL_PRICES = {
  lithium:  { price: 22.5,  color: '#00897b' },
  nickel:   { price: 14.2,  color: '#1565c0' },
  cobalt:   { price: 33.1,  color: '#7b1fa2' },
  silver:   { price: 830.0, color: '#f57c00' },
  silicon:  { price: 2.8,   color: '#2e7d32' },
  copper:   { price: 8.9,   color: '#0277bd' },
  manganese:{ price: 2.1,   color: '#558b2f' },
}

// Average material composition per kWh of Li-ion battery
const BATTERY_COMPOSITION = {
  lithium:   { kg_per_kwh: 0.16 },
  nickel:    { kg_per_kwh: 0.48 },
  cobalt:    { kg_per_kwh: 0.11 },
  manganese: { kg_per_kwh: 0.22 },
  copper:    { kg_per_kwh: 0.25 },
}

// Solar panel composition per kWp
const SOLAR_COMPOSITION = {
  silicon:   { kg_per_kwp: 5.2  },
  silver:    { kg_per_kwp: 0.02 },
  copper:    { kg_per_kwp: 0.8  },
}

function MaterialRecovery() {
  const [sourceType, setSourceType] = useState('battery')
  const [capacity, setCapacity] = useState('')
  const [quantity, setQuantity] = useState('')
  const [result, setResult] = useState(null)

  const calculate = (e) => {
    e.preventDefault()
    const cap = parseFloat(capacity)
    const qty = parseInt(quantity) || 1
    const total = cap * qty

    let materials = {}
    const composition = sourceType === 'battery' ? BATTERY_COMPOSITION : SOLAR_COMPOSITION

    for (const [mat, data] of Object.entries(composition)) {
      const kgKey = sourceType === 'battery' ? 'kg_per_kwh' : 'kg_per_kwp'
      const rawKg = data[kgKey] * total
      const recoverable = rawKg * (sourceType === 'battery' ? 0.92 : 0.85) // recovery efficiency
      const priceInfo = MATERIAL_PRICES[mat] || { price: 5, color: '#607d7b' }
      materials[mat] = {
        raw_kg: rawKg.toFixed(2),
        recoverable_kg: recoverable.toFixed(2),
        value_usd: (recoverable * priceInfo.price).toFixed(2),
        color: priceInfo.color,
      }
    }

    const totalValueUSD = Object.values(materials).reduce((sum, m) => sum + parseFloat(m.value_usd), 0)
    const co2_saved = sourceType === 'battery' ? total * 12.4 : total * 3.8

    setResult({ materials, totalValueUSD: totalValueUSD.toFixed(2), co2_saved: co2_saved.toFixed(0) })
  }

  const buildChartData = (materials) => ({
    labels: Object.keys(materials).map((m) => m.charAt(0).toUpperCase() + m.slice(1)),
    datasets: [{
      label: 'Recoverable (kg)',
      data: Object.values(materials).map((m) => parseFloat(m.recoverable_kg)),
      backgroundColor: Object.values(materials).map((m) => m.color),
    }],
  })

  const buildValueChartData = (materials) => ({
    labels: Object.keys(materials).map((m) => m.charAt(0).toUpperCase() + m.slice(1)),
    datasets: [{
      data: Object.values(materials).map((m) => parseFloat(m.value_usd)),
      backgroundColor: Object.values(materials).map((m) => m.color),
    }],
  })

  return (
    <div>
      <div className="page-header">
        <h1>♻️ Material Recovery Estimator</h1>
        <p>Digital twin model for estimating recoverable materials and economic value</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 28 }}>
        {/* Calculator */}
        <div>
          <div className="card">
            <div className="card-title">🔢 Recovery Calculator</div>
            <form onSubmit={calculate}>
              <div className="form-group">
                <label>Source Type</label>
                <select value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
                  <option value="battery">EV Battery Pack</option>
                  <option value="solar">Solar Panel Array</option>
                </select>
              </div>
              <div className="form-group">
                <label>{sourceType === 'battery' ? 'Battery Capacity (kWh each)' : 'Panel Capacity (kWp each)'}</label>
                <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)}
                  placeholder={sourceType === 'battery' ? 'e.g. 75' : 'e.g. 0.4'}
                  step="0.1" required />
              </div>
              <div className="form-group">
                <label>Number of Units</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 50" min="1" required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                ⚗️ Calculate Recovery
              </button>
            </form>
          </div>

          {/* Market Prices */}
          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-title">💱 Market Prices (USD/kg)</div>
            <table>
              <thead><tr><th>Material</th><th>Price</th></tr></thead>
              <tbody>
                {Object.entries(MATERIAL_PRICES).map(([mat, info]) => (
                  <tr key={mat}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: info.color, display: 'inline-block' }} />
                      {mat.charAt(0).toUpperCase() + mat.slice(1)}
                    </td>
                    <td>${info.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results */}
        <div>
          {result ? (
            <>
              <div className="result-panel" style={{ marginBottom: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>⚗️ Recovery Estimates</h3>
                <div className="result-grid">
                  <div className="result-item">
                    <div className="value" style={{ color: '#00897b' }}>${result.totalValueUSD}</div>
                    <div className="label">Total Economic Value (USD)</div>
                  </div>
                  <div className="result-item">
                    <div className="value" style={{ color: '#1565c0' }}>{result.co2_saved}</div>
                    <div className="label">CO₂ Saved (kg) vs Virgin Mining</div>
                  </div>
                </div>
                <div className="table-wrapper" style={{ marginTop: 20 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Raw Content (kg)</th>
                        <th>Recoverable (kg)</th>
                        <th>Value (USD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(result.materials).map(([mat, data]) => (
                        <tr key={mat}>
                          <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: data.color, display: 'inline-block' }} />
                            {mat.charAt(0).toUpperCase() + mat.slice(1)}
                          </td>
                          <td>{data.raw_kg} kg</td>
                          <td><strong>{data.recoverable_kg} kg</strong></td>
                          <td style={{ color: '#2e7d32', fontWeight: 600 }}>${data.value_usd}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="charts-grid">
                <ChartWidget title="Recoverable Material (kg)" type="bar" data={buildChartData(result.materials)} />
                <ChartWidget title="Economic Value Distribution (USD)" type="doughnut" data={buildValueChartData(result.materials)} />
              </div>
            </>
          ) : (
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--text-muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem' }}>⚗️</div>
                <p style={{ marginTop: 12 }}>Fill in the calculator to estimate material recovery</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MaterialRecovery
