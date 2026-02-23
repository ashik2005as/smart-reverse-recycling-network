import React, { useState } from 'react'

const LISTINGS = [
  {
    id: 1, type: 'battery', title: '50× Second-life EV Batteries (LFP, 60kWh)',
    seller: 'GreenPower Solutions, Mumbai', price: 85000, condition: 'Good (SOH 78%)',
    location: 'Mumbai, MH', status: 'available',
    desc: 'Refurbished LFP batteries suitable for stationary energy storage. Tested & certified.',
  },
  {
    id: 2, type: 'solar', title: '200× Used Solar Panels (300W Mono)',
    seller: 'SolarRecycle India, Ahmedabad', price: 3200, condition: 'Fair (Eff 15.2%)',
    location: 'Ahmedabad, GJ', status: 'available',
    desc: 'Monocrystalline panels with minor frame damage. Ideal for small off-grid installations.',
  },
  {
    id: 3, type: 'battery', title: '20× Tesla 2170 Cell Modules (NMC)',
    seller: 'EV Parts Hub, Bangalore', price: 42000, condition: 'Excellent (SOH 88%)',
    location: 'Bangalore, KA', status: 'available',
    desc: 'Disassembled Tesla battery modules. Full diagnostic report available.',
  },
  {
    id: 4, type: 'solar', title: '500× Decommissioned 250W Polycrystalline Panels',
    seller: 'Rajasthan Solar Waste, Jaipur', price: 1800, condition: 'Poor (Eff 11%)',
    location: 'Jaipur, RJ', status: 'recycling_ready',
    desc: 'End-of-life panels for material recovery. High silicon content confirmed.',
  },
  {
    id: 5, type: 'battery', title: '8× Industrial Li-ion Packs (48V, 100Ah)',
    seller: 'Chennai Battery Exchange', price: 18500, condition: 'Good (SOH 72%)',
    location: 'Chennai, TN', status: 'available',
    desc: 'From decommissioned telecom towers. BMS intact, suitable for solar storage.',
  },
  {
    id: 6, type: 'pickup', title: 'Bulk Pickup Service — 500+ Batteries',
    seller: 'NationalRecycle Logistics', price: 0, condition: 'Service',
    location: 'Pan India', status: 'service',
    desc: 'Doorstep collection of EV batteries and solar panels. Certified e-waste disposal. Free for 500+ units.',
  },
]

function Marketplace() {
  const [filter, setFilter] = useState('all')
  const [showBooking, setShowBooking] = useState(false)
  const [selectedListing, setSelectedListing] = useState(null)
  const [bookingMsg, setBookingMsg] = useState('')

  const filtered = filter === 'all' ? LISTINGS : LISTINGS.filter((l) => l.type === filter)

  const typeColors = { battery: '#00897b', solar: '#f57c00', pickup: '#1565c0' }
  const typeLabels = { battery: '🔋 Battery', solar: '☀️ Solar', pickup: '🚛 Pickup' }

  const handleBook = (listing) => {
    setSelectedListing(listing)
    setShowBooking(true)
    setBookingMsg('')
  }

  const confirmBooking = (e) => {
    e.preventDefault()
    setBookingMsg(`✅ Pickup booked! Confirmation ID: PB-${Math.random().toString(36).substr(2, 6).toUpperCase()}. You'll receive an email within 2 hours.`)
  }

  return (
    <div>
      <div className="page-header">
        <h1>🏪 Recycler Marketplace</h1>
        <p>Connect buyers, sellers and recyclers of second-life batteries and solar panels</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[['all', '🔍 All Listings'], ['battery', '🔋 Batteries'], ['solar', '☀️ Solar Panels'], ['pickup', '🚛 Pickup Services']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`btn ${filter === key ? 'btn-primary' : 'btn-outline'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {filtered.map((listing) => (
          <div
            key={listing.id}
            className="card"
            style={{ borderTop: `4px solid ${typeColors[listing.type]}` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span className="badge badge-info" style={{ background: `${typeColors[listing.type]}22`, color: typeColors[listing.type] }}>
                {typeLabels[listing.type]}
              </span>
              <span className={`badge ${listing.status === 'available' ? 'badge-success' : listing.status === 'recycling_ready' ? 'badge-warning' : 'badge-info'}`}>
                {listing.status === 'available' ? 'Available' : listing.status === 'recycling_ready' ? 'Recycling Ready' : 'Service'}
              </span>
            </div>

            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 8 }}>{listing.title}</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 12 }}>{listing.desc}</p>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              <div>📍 {listing.location}</div>
              <div>🏢 {listing.seller}</div>
              <div>🔧 Condition: {listing.condition}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: listing.price === 0 ? '#2e7d32' : 'var(--text)' }}>
                {listing.price === 0 ? 'FREE' : `₹${listing.price.toLocaleString()}`}
                {listing.price > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}> per unit</span>}
              </div>
              <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => handleBook(listing)}>
                📅 Book Pickup
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {showBooking && selectedListing && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={() => setShowBooking(false)}
        >
          <div
            className="card"
            style={{ width: 460, maxWidth: '95vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📅 Book Pickup</h3>
            <p style={{ marginBottom: 16, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {selectedListing.title}
            </p>
            {bookingMsg ? (
              <div className="alert alert-success">{bookingMsg}</div>
            ) : (
              <form onSubmit={confirmBooking}>
                <div className="form-group">
                  <label>Your Name</label>
                  <input type="text" required placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label>Phone / Email</label>
                  <input type="text" required placeholder="Contact details" />
                </div>
                <div className="form-group">
                  <label>Preferred Pickup Date</label>
                  <input type="date" required />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea rows={2} placeholder="Full pickup address" />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    ✅ Confirm Booking
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowBooking(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Marketplace
