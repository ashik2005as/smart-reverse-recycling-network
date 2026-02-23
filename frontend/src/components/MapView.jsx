import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

/**
 * Leaflet map component.
 * Props: center [lat, lng], zoom, markers [{lat, lng, popup, color}], height, routes
 */
function MapView({ center = [20.5937, 78.9629], zoom = 5, markers = [], height = 400, routes = [] }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (mapInstanceRef.current) return // already initialized

    mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapInstanceRef.current)
  }, [])

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear existing markers (except tile layer)
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
        mapInstanceRef.current.removeLayer(layer)
      }
    })

    // Add new markers
    markers.forEach(({ lat, lng, popup, color = '#00897b' }) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      const marker = L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current)
      if (popup) marker.bindPopup(popup)
    })

    // Draw routes (array of latlng arrays)
    routes.forEach((routeCoords, idx) => {
      const colors = ['#00897b', '#1565c0', '#f57c00', '#7b1fa2']
      L.polyline(routeCoords, {
        color: colors[idx % colors.length],
        weight: 3,
        opacity: 0.8,
        dashArray: '6,4',
      }).addTo(mapInstanceRef.current)
    })
  }, [markers, routes])

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%', borderRadius: '8px', zIndex: 1 }}
    />
  )
}

export default MapView
