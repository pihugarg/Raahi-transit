import React, { useContext, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { BusContext } from '../context/BusContext'
import { Polyline } from 'react-leaflet'


type CityMapProps = {
  from?: { lat: number; lng: number }
  to?: { lat: number; lng: number }
  highlightRouteIds?: string[]
}

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

function Fit({ from, to }: { from?: any; to?: any }) {
  const map = useMap()
  const { content, city } = useContext(BusContext)!

  useEffect(() => {
    if (from && to) {
      map.fitBounds(
        L.latLngBounds(
          [from.lat, from.lng],
          [to.lat, to.lng]
        ),
        { padding: [40, 40] }
      )
      return
    }

    if (content.stops.length) {
      const b = L.latLngBounds(
        content.stops.map(s => [s.lat, s.lng] as [number, number])
      )
      map.fitBounds(b, { padding: [40, 40] })
    } else {
      map.setView(city.center as any, city.zoom)
    }
  }, [from, to, content.stops, city, map])

  return null
}

function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6371 // Earth radius in km
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLon = (b.lng - a.lng) * Math.PI / 180
  const la1 = a.lat * Math.PI / 180
  const la2 = b.lat * Math.PI / 180

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2

  return 2 * R * Math.asin(Math.sqrt(x))
}

export default function CityMap({ from, to }: CityMapProps) {
  const { city, content } = useContext(BusContext)!

  const km =
    from && to ? distanceKm(from, to).toFixed(2) : null

  const etaMinutes =
    km ? Math.round((Number(km) / 25) * 60) : null // avg bus speed 25 km/h


  return (
    <div className="card" style={{ height: 560 }}>
      <MapContainer center={city.center} zoom={city.zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Fit from={from} to={to} />
        {from && to && (
          <Polyline
            positions={[
              [from.lat, from.lng],
              [to.lat, to.lng],
            ]}
            pathOptions={{ color: 'blue', weight: 5, className: '' }}
          />
        )}
        {from && <Marker position={[from.lat, from.lng]}><Popup> <strong> Departure </strong></Popup></Marker>}
        {to && <Marker position={[to.lat, to.lng]}><Popup><strong> Destination</strong></Popup></Marker>}
        {!from && !to &&
          content.stops.map(s => (
            <Marker key={s.id} position={[s.lat, s.lng]}>
              <Popup><strong>{s.name}</strong></Popup>
            </Marker>


          ))}

        {/* ⏱️ Distance & ETA overlay (BOTTOM-LEFT) */}
        {from && to && km && etaMinutes && (
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              background: 'white',
              padding: '8px 12px',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 1000,
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 700 }}>{km} km</div>
            <div>Departure: Now</div>
            <div>Arrival: ~{etaMinutes} min</div>
          </div>
        )}

      </MapContainer>
    </div>
  )
}
