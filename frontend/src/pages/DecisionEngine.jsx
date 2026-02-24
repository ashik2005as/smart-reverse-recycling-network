import React, { useState, useEffect } from 'react'
import axios from 'axios'

const DECISION_COLORS = {
  reuse:   { bg: '#2e7d32', badge: 'badge-success', label: '♻️ REUSE' },
  repair:  { bg: '#e65100', badge: 'badge-warning', label: '🔧 REPAIR' },
  recycle: { bg: '#1565c0', badge: 'badge-info',    label: '⚗️ RECYCLE' },
  dispose: { bg: '#c62828', badge: 'badge-danger',  label: '🗑️ DISPOSE' },
}

const initialForm = {
  asset_type: 'battery',
  soh: '',
  efficiency: '',
  age_years: '',
  temperature: '',
  cycles: '',
  capacity: '',
}

function mockDecision(f) {
  const isBattery = f.asset_type === 'battery'
  const soh = parseFloat(f.soh) || 75
  const eff = parseFloat(f.efficiency) || 14

  let decision, reasoning, next_steps, value_recovery, co2
  if (isBattery) {
    if (soh >= 80) { decision = 'reuse';    reasoning = 'SOH ≥ 80%: Battery is in excellent condition for second-life applications.'; next_steps = ['Test for second-life suitability', 'List on marketplace', 'Issue digital passport']; value_recovery = 85; co2 = soh * 4.5 }
    else if (soh >= 60) { decision = 'repair'; reasoning = 'SOH 60–79%: Cell replacement can restore functionality.'; next_steps = ['Diagnose degraded cells', 'Schedule cell replacement', 'Re-test after repair']; value_recovery = 60; co2 = soh * 3.2 }
    else if (soh >= 40) { decision = 'recycle'; reasoning = 'SOH 40–59%: Material recovery via hydrometallurgy is most sustainable.'; next_steps = ['Schedule recycling pickup', 'Transfer to certified recycler', 'Recover Li/Co/Ni']; value_recovery = 40; co2 = soh * 2.1 }
    else { decision = 'dispose'; reasoning = 'SOH < 40%: End-of-life. Certified disposal required.'; next_steps = ['Contact certified disposal facility', 'Arrange safe transport', 'Get disposal certificate']; value_recovery = 15; co2 = soh * 0.8 }
  } else {
    const age = parseFloat(f.age_years) || 10
    if (eff >= 16 && age < 15) { decision = 'reuse'; reasoning = 'Efficiency ≥ 16% and age < 15 years: Panel can be redeployed.'; next_steps = ['Inspect for physical damage', 'Clean panel surface', 'Re-certify output']; value_recovery = 80; co2 = eff * 5.2 }
    else if (eff >= 12) { decision = 'repair'; reasoning = 'Efficiency 12–15%: Repair or partial replacement is viable.'; next_steps = ['Thermal imaging inspection', 'Replace damaged cells', 'Re-test output']; value_recovery = 55; co2 = eff * 3.5 }
    else { decision = 'recycle'; reasoning = 'Efficiency < 12%: Silicon and silver recovery is most economical.'; next_steps = ['Decommission panel', 'Transport to recycler', 'Recover Si/Ag/Al/glass']; value_recovery = 35; co2 = eff * 1.9 }
  }

  return {
    decision, reasoning, next_steps,
    confidence: (0.85 + Math.random() * 0.12).toFixed(2),
    estimated_value_recovery_pct: value_recovery,
    environmental_impact: { co2_saved_kg: co2.toFixed(1), water_saved_litres: (co2 * 3.5).toFixed(0), landfill_diverted_kg: (parseFloat(f.capacity) || 75).toFixed(1) },
    recommended_facility: isBattery ? 'GreenRecycle Ltd, Mumbai' : 'SolarWaste Co, Ahmedabad',
    digital_passport_id: 'DP-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
  }
}

const MOCK_HISTORY = [
  { id: 1, asset_type: 'battery', asset_id: 'BT-4521', decision: 'recycle',  confidence: 0.91, soh: 45.2,      timestamp: '2026-02-23T13:30:00', facility: 'BattRecycle Pvt Ltd, Chennai' },
  { id: 2, asset_type: 'solar',   asset_id: 'SP-0887', decision: 'repair',   confidence: 0.87, efficiency: 13.1, timestamp: '2026-02-23T12:00:00', facility: 'SolarTech Services, Hyderabad' },
  { id: 3, asset_type: 'battery', asset_id: 'BT-1892', decision: 'reuse',    confidence: 0.95, soh: 84.7,      timestamp: '2026-02-23T09:00:00', facility: 'GreenRecycle Ltd, Mumbai' },
  { id: 4, asset_type: 'solar',   asset_id: 'SP-3341', decision: 'recycle',  confidence: 0.89, efficiency: 10.2, timestamp: '2026-02-22T15:00:00', facility: 'SolarWaste Co, Ahmedabad' },
  { id: 5, asset_type: 'battery', asset_id: 'BT-7760', decision: 'dispose',  confidence: 0.93, soh: 28.1,      timestamp: '2026-02-22T10:00:00', facility: 'CPCB Disposal, Delhi' },
  { id: 6, asset_type: 'battery', asset_id: 'BT-2233', decision: 'repair',   confidence: 0.88, soh: 68.4,      timestamp: '2026-02-22T08:00:00', facility: 'EV Repair Centre, Bangalore' },
]

function DecisionEngine() {
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState(MOCK_HISTORY)

  useEffect(() => {
    axios.get('/api/decision/history').then(r => setHistory(r.data)).catch(() => {})
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const payload = {
        asset_type: form.asset_type,
        age_years: parseFloat(form.age_years),
        temperature: parseFloat(form.temperature),
        soh: form.soh ? parseFloat(form.soh) : undefined,
        efficiency: form.efficiency ? parseFloat(form.efficiency) : undefined,
        cycles: form.cycles ? parseInt(form.cycles) : undefined,
        capacity: form.capacity ? parseFloat(form.capacity) : undefined,
      }
      const res = await axios.post('/api/decision/analyze', payload)
      setResult(res.data)
    } catch {
      setResult(mockDecision(form))
    } finally {
      setLoading(false)
    }
  }

  const isBattery = form.asset_type === 'battery'
  const dec = result ? DECISION_COLORS[result.decision] : null

  return (
    <div>
      <div className="page-header">
        <h1>🔄 AI Decision Engine — Reuse, Repair, Recycle or Dispose</h1>
        <p>Enter asset parameters to get an AI-powered lifecycle decision recommendation</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {/* Form */}
        <div className="card">
          <div className="card-title">📥 Asset Parameters</div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Asset Type</label>
              <select name="asset_type" value={form.asset_type} onChange={handleChange} className="form-control">
                <option value="battery">🔋 EV Battery</option>
                <option value="solar">☀️ Solar Panel</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {isBattery ? (
                <div className="form-group">
                  <label>State of Health — SOH (%)</label>
                  <input type="number" name="soh" value={form.soh} onChange={handleChange} placeholder="e.g. 75" step="0.1" min="0" max="100" required />
                </div>
              ) : (
                <div className="form-group">
                  <label>Efficiency (%)</label>
                  <input type="number" name="efficiency" value={form.efficiency} onChange={handleChange} placeholder="e.g. 14.5" step="0.1" min="0" max="25" required />
                </div>
              )}
              <div className="form-group">
                <label>Age (years)</label>
                <input type="number" name="age_years" value={form.age_years} onChange={handleChange} placeholder="e.g. 5" step="0.1" required />
              </div>
              <div className="form-group">
                <label>Temperature (°C)</label>
                <input type="number" name="temperature" value={form.temperature} onChange={handleChange} placeholder="e.g. 28" step="0.1" required />
              </div>
              {isBattery ? (
                <div className="form-group">
                  <label>Charge Cycles</label>
                  <input type="number" name="cycles" value={form.cycles} onChange={handleChange} placeholder="e.g. 800" />
                </div>
              ) : null}
              <div className="form-group">
                <label>Capacity ({isBattery ? 'kWh' : 'W'})</label>
                <input type="number" name="capacity" value={form.capacity} onChange={handleChange} placeholder={isBattery ? 'e.g. 75' : 'e.g. 400'} step="0.1" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}>
              {loading ? '⏳ Analysing…' : '🤖 Run Decision Analysis'}
            </button>
          </form>
        </div>

        {/* Info / Result */}
        <div>
          {!result ? (
            <div className="card" style={{ background: 'linear-gradient(135deg, #e0f2f1, #e8f5e9)' }}>
              <div className="card-title">ℹ️ Decision Framework</div>
              <div style={{ fontSize: '0.88rem', lineHeight: 1.8 }}>
                <p><strong>Battery decisions:</strong></p>
                <ul style={{ paddingLeft: 20 }}>
                  <li>SOH ≥ 80% → <strong style={{ color: '#2e7d32' }}>Reuse</strong> (second-life applications)</li>
                  <li>SOH 60–79% → <strong style={{ color: '#e65100' }}>Repair</strong> (cell replacement)</li>
                  <li>SOH 40–59% → <strong style={{ color: '#1565c0' }}>Recycle</strong> (material recovery)</li>
                  <li>SOH &lt; 40% → <strong style={{ color: '#c62828' }}>Dispose</strong> (certified disposal)</li>
                </ul>
                <p style={{ marginTop: 12 }}><strong>Solar panel decisions:</strong></p>
                <ul style={{ paddingLeft: 20 }}>
                  <li>Efficiency ≥ 16% &amp; age &lt; 15 yr → <strong style={{ color: '#2e7d32' }}>Reuse</strong></li>
                  <li>Efficiency 12–16% → <strong style={{ color: '#e65100' }}>Repair</strong></li>
                  <li>Efficiency &lt; 12% or age &gt; 20 yr → <strong style={{ color: '#1565c0' }}>Recycle</strong></li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="result-panel">
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ display: 'inline-block', background: dec.bg, color: '#fff', fontSize: '1.6rem', fontWeight: 800, padding: '12px 40px', borderRadius: 12 }}>
                  {dec.label}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span className={`badge ${dec.badge}`}>Confidence: {(parseFloat(result.confidence) * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="alert alert-info" style={{ marginBottom: 12 }}>{result.reasoning}</div>

              <div className="result-grid">
                <div className="result-item">
                  <div className="value">{result.estimated_value_recovery_pct}%</div>
                  <div className="label">Value Recovery</div>
                </div>
                <div className="result-item">
                  <div className="value" style={{ color: '#2e7d32' }}>{result.environmental_impact.co2_saved_kg}</div>
                  <div className="label">CO₂ Saved (kg)</div>
                </div>
                <div className="result-item">
                  <div className="value" style={{ color: '#1565c0' }}>{result.environmental_impact.water_saved_litres}</div>
                  <div className="label">Water Saved (L)</div>
                </div>
                <div className="result-item">
                  <div className="value">{result.environmental_impact.landfill_diverted_kg}</div>
                  <div className="label">Landfill Diverted (kg)</div>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <strong>📋 Next Steps:</strong>
                <ol style={{ marginTop: 6, paddingLeft: 20, lineHeight: 1.8 }}>
                  {result.next_steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>

              <div style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                🏭 Recommended Facility: <strong>{result.recommended_facility}</strong>
              </div>
              <div style={{ marginTop: 6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                🆔 Digital Passport: <code style={{ background: '#f5f5f5', padding: '2px 8px', borderRadius: 4 }}>{result.digital_passport_id}</code>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="card" style={{ marginTop: 28 }}>
        <div className="card-title">📜 Decision History</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Asset ID</th>
                <th style={{ padding: '8px 12px' }}>Type</th>
                <th style={{ padding: '8px 12px' }}>Decision</th>
                <th style={{ padding: '8px 12px' }}>Confidence</th>
                <th style={{ padding: '8px 12px' }}>Condition</th>
                <th style={{ padding: '8px 12px' }}>Timestamp</th>
                <th style={{ padding: '8px 12px' }}>Facility</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => {
                const dc = DECISION_COLORS[h.decision] || {}
                return (
                  <tr key={h.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '8px 12px' }}><code>{h.asset_id}</code></td>
                    <td style={{ padding: '8px 12px' }}>{h.asset_type === 'battery' ? '🔋' : '☀️'} {h.asset_type}</td>
                    <td style={{ padding: '8px 12px' }}><span className={`badge ${dc.badge || 'badge-info'}`}>{h.decision}</span></td>
                    <td style={{ padding: '8px 12px' }}>{(h.confidence * 100).toFixed(0)}%</td>
                    <td style={{ padding: '8px 12px' }}>{h.soh != null ? `SOH: ${h.soh}%` : `Eff: ${h.efficiency}%`}</td>
                    <td style={{ padding: '8px 12px' }}>{new Date(h.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ padding: '8px 12px' }}>{h.facility}</td>
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

export default DecisionEngine
