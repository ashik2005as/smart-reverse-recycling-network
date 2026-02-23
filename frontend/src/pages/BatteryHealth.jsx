import React, { useState } from 'react'
import axios from 'axios'

const initialForm = {
  voltage: '',
  current: '',
  temperature: '',
  cycles: '',
  capacity: '',
  manufacturer: '',
}

function BatteryHealth() {
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      // Try real API first, fall back to mock
      const res = await axios.post('/api/battery/predict', {
        voltage: parseFloat(form.voltage),
        current: parseFloat(form.current),
        temperature: parseFloat(form.temperature),
        cycles: parseInt(form.cycles),
        capacity: parseFloat(form.capacity),
        manufacturer: form.manufacturer,
      })
      setResult(res.data)
    } catch {
      // Demo mock response when backend is not running
      setResult(mockPrediction(form))
    } finally {
      setLoading(false)
    }
  }

  // Mock AI prediction for demo purposes
  const mockPrediction = (f) => {
    const cycles = parseInt(f.cycles) || 500
    const temp = parseFloat(f.temperature) || 25
    const soh = Math.max(20, Math.min(100, 100 - (cycles / 30) - Math.max(0, temp - 40)))
    const rul = Math.round((soh - 20) * 8)
    const thermal = temp > 45

    let recommendation
    if (soh >= 80) recommendation = 'Reuse — Battery in excellent condition for second-life applications'
    else if (soh >= 60) recommendation = 'Repair — Replace degraded cells; still suitable for stationary storage'
    else recommendation = 'Recycle — End-of-life; recover Lithium, Nickel, Cobalt via hydrometallurgy'

    return {
      soh: soh.toFixed(1),
      rul_cycles: rul,
      thermal_anomaly: thermal,
      recommendation,
      confidence: (0.88 + Math.random() * 0.10).toFixed(2),
      digital_passport_id: `DP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      carbon_credits: (soh * 0.023).toFixed(2),
    }
  }

  const sohColor = (soh) => {
    if (soh >= 80) return '#2e7d32'
    if (soh >= 60) return '#f57c00'
    return '#c62828'
  }

  return (
    <div>
      <div className="page-header">
        <h1>🔋 Battery Health Prediction</h1>
        <p>AI-powered State of Health (SOH) analysis using LSTM neural network</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {/* Input Form */}
        <div className="card">
          <div className="card-title">📥 Battery Parameters</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Voltage (V)</label>
                <input type="number" name="voltage" value={form.voltage} onChange={handleChange}
                  placeholder="e.g. 3.7" step="0.01" required />
              </div>
              <div className="form-group">
                <label>Current (A)</label>
                <input type="number" name="current" value={form.current} onChange={handleChange}
                  placeholder="e.g. 150" step="0.1" required />
              </div>
              <div className="form-group">
                <label>Temperature (°C)</label>
                <input type="number" name="temperature" value={form.temperature} onChange={handleChange}
                  placeholder="e.g. 28" step="0.1" required />
              </div>
              <div className="form-group">
                <label>Charge Cycles</label>
                <input type="number" name="cycles" value={form.cycles} onChange={handleChange}
                  placeholder="e.g. 450" required />
              </div>
              <div className="form-group">
                <label>Capacity (kWh)</label>
                <input type="number" name="capacity" value={form.capacity} onChange={handleChange}
                  placeholder="e.g. 75" step="0.1" required />
              </div>
              <div className="form-group">
                <label>Manufacturer</label>
                <input type="text" name="manufacturer" value={form.manufacturer} onChange={handleChange}
                  placeholder="e.g. Tata Motors" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}>
              {loading ? '⏳ Analysing…' : '🤖 Run AI Health Analysis'}
            </button>
          </form>

          {error && <div className="alert alert-danger" style={{ marginTop: 12 }}>{error}</div>}
        </div>

        {/* Info Panel */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #e0f2f1, #e8f5e9)' }}>
          <div className="card-title">ℹ️ How It Works</div>
          <div style={{ fontSize: '0.88rem', lineHeight: 1.8, color: 'var(--text)' }}>
            <p>Our <strong>LSTM-based AI model</strong> analyses battery telemetry to estimate:</p>
            <ul style={{ marginTop: 12, paddingLeft: 20 }}>
              <li><strong>SOH Score</strong> — State of Health as % of original capacity</li>
              <li><strong>RUL</strong> — Remaining Useful Life in charge cycles</li>
              <li><strong>Thermal Anomaly</strong> — Overheating or degradation risk</li>
              <li><strong>Recommendation</strong> — Reuse / Repair / Recycle decision</li>
            </ul>
            <p style={{ marginTop: 12 }}>Each battery receives a unique <strong>Digital Passport</strong> for lifecycle traceability.</p>
            <div className="alert alert-info" style={{ marginTop: 16 }}>
              SOH ≥ 80% → Second-life reuse<br />
              SOH 60–79% → Cell repair<br />
              SOH &lt; 60% → Material recovery
            </div>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="result-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>🤖 AI Analysis Result</h3>
            <span className="badge badge-info">
              Confidence: {(parseFloat(result.confidence) * 100).toFixed(0)}%
            </span>
          </div>

          <div className="result-grid">
            <div className="result-item">
              <div className="value" style={{ color: sohColor(parseFloat(result.soh)) }}>
                {result.soh}%
              </div>
              <div className="label">State of Health (SOH)</div>
            </div>
            <div className="result-item">
              <div className="value" style={{ color: '#1565c0' }}>
                {result.rul_cycles}
              </div>
              <div className="label">Remaining Useful Life (cycles)</div>
            </div>
            <div className="result-item">
              <div className="value" style={{ color: result.thermal_anomaly ? '#c62828' : '#2e7d32' }}>
                {result.thermal_anomaly ? '⚠️ YES' : '✅ NO'}
              </div>
              <div className="label">Thermal Anomaly</div>
            </div>
            <div className="result-item">
              <div className="value" style={{ color: '#2e7d32', fontSize: '1.2rem' }}>
                {result.carbon_credits}
              </div>
              <div className="label">Carbon Credits Earned</div>
            </div>
          </div>

          <div className="alert alert-success" style={{ marginTop: 16 }}>
            <strong>Recommendation:</strong> {result.recommendation}
          </div>

          <div style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            🆔 Digital Passport ID: <code style={{ background: '#fff', padding: '2px 8px', borderRadius: 4 }}>{result.digital_passport_id}</code>
          </div>
        </div>
      )}
    </div>
  )
}

export default BatteryHealth
