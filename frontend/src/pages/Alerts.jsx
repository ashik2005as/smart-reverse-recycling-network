import React, { useState, useEffect } from 'react'
import axios from 'axios'

const MOCK_ALERTS = [
  { id: 1, type: 'end_of_life',   severity: 'high',     title: 'Battery #BT-4521 SOH below 30%',            message: 'Battery has reached end-of-life. Schedule recycling pickup immediately.', asset_id: 'DP-A8B2C3D4', location: 'Mumbai',    created_at: '2026-02-23T14:00:00', status: 'active',       action_required: 'Schedule pickup' },
  { id: 2, type: 'collection_due','severity': 'medium',  title: 'Collection route CR-15 overdue',            message: 'Scheduled collection in Delhi North Hub is 2 days overdue.', asset_id: null, location: 'Delhi',     created_at: '2026-02-22T10:30:00', status: 'active',       action_required: 'Reassign vehicle' },
  { id: 3, type: 'degradation',   severity: 'medium',   title: 'Solar Panel SP-789 efficiency drop',        message: 'Panel efficiency dropped 5% in the last month. Hotspot risk detected.', asset_id: 'SP-D4E5F6G7', location: 'Rajasthan', created_at: '2026-02-21T09:15:00', status: 'active',       action_required: 'Schedule inspection' },
  { id: 4, type: 'compliance',    severity: 'low',      title: 'EPR certificate renewal due',               message: 'EPR registration for GreenRecycle Ltd expires in 30 days.', asset_id: null, location: 'Bangalore', created_at: '2026-02-20T16:45:00', status: 'acknowledged', action_required: 'Renew certificate' },
  { id: 5, type: 'illegal_dump',  severity: 'critical', title: 'Illegal e-waste dump detected',             message: 'Satellite imagery detected potential illegal dump near Gurgaon Industrial Area.', asset_id: null, location: 'Gurgaon',   created_at: '2026-02-23T11:00:00', status: 'active',       action_required: 'Report to CPCB' },
  { id: 6, type: 'end_of_life',   severity: 'high',     title: 'Battery batch BT-7700–7720 approaching EOL',message: '20 batteries from Ola Electric fleet have SOH below 35%. Bulk recycling recommended.', asset_id: null, location: 'Pune',     created_at: '2026-02-22T08:00:00', status: 'active',       action_required: 'Schedule bulk pickup' },
  { id: 7, type: 'compliance',    severity: 'medium',   title: 'E-Waste Rules 2023 audit due',              message: 'Annual compliance audit for Chennai facility is due in 15 days.', asset_id: null, location: 'Chennai',  created_at: '2026-02-19T14:30:00', status: 'active',       action_required: 'Prepare audit documents' },
  { id: 8, type: 'degradation',   severity: 'low',      title: 'Solar farm SF-44 output below forecast',   message: 'Monthly output is 8% below forecast — possible soiling or shading issue.', asset_id: null, location: 'Gujarat',  created_at: '2026-02-18T10:00:00', status: 'resolved',     action_required: 'Clean panels' },
  { id: 9, type: 'collection_due','severity': 'low',    title: 'Collection CR-28 scheduled tomorrow',       message: 'Routine collection from Hyderabad depot scheduled for 2026-02-24.', asset_id: null, location: 'Hyderabad', created_at: '2026-02-23T07:00:00', status: 'acknowledged', action_required: 'Confirm vehicle availability' },
]

const MOCK_SUMMARY = { total: 9, critical: 1, high: 2, medium: 3, low: 3, active: 6, acknowledged: 2, resolved: 1 }

const SEVERITY_STYLES = {
  critical: { cls: 'badge-danger',   color: '#c62828', label: '🚨 CRITICAL' },
  high:     { cls: 'badge-danger',   color: '#e53935', label: '🔴 HIGH' },
  medium:   { cls: 'badge-warning',  color: '#f57c00', label: '🟠 MEDIUM' },
  low:      { cls: 'badge-info',     color: '#1565c0', label: '🔵 LOW' },
}

const TYPE_ICONS = {
  end_of_life:    '🔋',
  collection_due: '🚚',
  degradation:    '☀️',
  compliance:     '📋',
  illegal_dump:   '🚨',
}

const TABS = ['all', 'active', 'acknowledged', 'resolved']

function Alerts() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS)
  const [summary, setSummary] = useState(MOCK_SUMMARY)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    axios.get('/api/alerts/').then(r => setAlerts(r.data)).catch(() => {})
    axios.get('/api/alerts/summary').then(r => setSummary(r.data)).catch(() => {})
  }, [])

  const filtered = tab === 'all' ? alerts : alerts.filter(a => a.status === tab)

  return (
    <div>
      <div className="page-header">
        <h1>🔔 Alerts &amp; Notifications</h1>
        <p>Monitor system alerts, compliance notifications, and end-of-life triggers</p>
      </div>

      {/* Summary Cards */}
      <div className="metrics-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Alerts',  value: summary.total,        icon: '🔔', color: '#1565c0' },
          { label: '🚨 Critical',   value: summary.critical,     icon: '🚨', color: '#c62828' },
          { label: '🔴 High',       value: summary.high,         icon: '🔴', color: '#e53935' },
          { label: '🟠 Medium',     value: summary.medium,       icon: '🟠', color: '#f57c00' },
          { label: '🔵 Low',        value: summary.low,          icon: '🔵', color: '#1565c0' },
          { label: '✅ Active',     value: summary.active,       icon: '⚡', color: '#2e7d32' },
        ].map(item => (
          <div key={item.label} className="metric-card" style={{ border: `1px solid ${item.color}22`, borderRadius: 10, padding: '14px 16px', background: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem' }}>{item.icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`btn ${tab === t ? 'btn-primary' : ''}`}
            style={tab !== t ? { background: '#f5f5f5', color: '#555', border: '1px solid #ddd' } : {}}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {' '}
            <span className="badge badge-info" style={{ marginLeft: 4, fontSize: '0.7rem' }}>
              {t === 'all' ? alerts.length : alerts.filter(a => a.status === t).length}
            </span>
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(a => {
          const sev = SEVERITY_STYLES[a.severity] || SEVERITY_STYLES.low
          const icon = TYPE_ICONS[a.type] || '📋'
          return (
            <div key={a.id} className="card" style={{ borderLeft: `4px solid ${sev.color}`, padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1 }}>
                  <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 4 }}>
                      <strong style={{ fontSize: '0.95rem' }}>{a.title}</strong>
                      <span className={`badge ${sev.cls}`}>{sev.label}</span>
                      <span className="badge badge-info">{a.status}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{a.message}</p>
                    <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span>📍 {a.location}</span>
                      {a.asset_id && <span>🪪 {a.asset_id}</span>}
                      <span>🕐 {new Date(a.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ flexShrink: 0, whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                  {a.action_required}
                </button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="alert alert-info">No alerts found for this filter.</div>
        )}
      </div>
    </div>
  )
}

export default Alerts
