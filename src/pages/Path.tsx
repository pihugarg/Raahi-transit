import React, { useContext, useMemo, useState, useRef} from 'react'
import { BusContext } from '../context/BusContext'
import CityMap from '../components/CityMap'




/* ---------------- TYPES ---------------- */

type Stop = {
  id: string
  name: string
  lat: number
  lng: number
}

type Leg = {
  kind: 'direct'
  routeId?: string
  routeTitle?: string
  from: Stop
  to: Stop
  hops: number
}

/* ---------------- HELPERS ---------------- */

function qmatch(list: Stop[], q: string): Stop[] {
  const s = q.trim().toLowerCase()
  if (!s) return []
  return list.filter(x => x.name.toLowerCase().includes(s)).slice(0, 8)
}

/* ---------------- COMPONENT ---------------- */

export default function Path() {
  /* ✅ CONTEXT (city + content are defined here) */
  const { content, city } = useContext(BusContext)!

  /* ✅ DATA */
  const stops: Stop[] = content.stops
  const routes: any[] = content.routes

  /* ✅ STATE */
  const [fromQ, setFromQ] = useState<string>('')
  const [toQ, setToQ] = useState<string>('')
  const [path, setPath] = useState<Leg[] | null>(null)

  const [showFromList, setShowFromList] = useState(false)
  const [showToList, setShowToList] = useState(false)

  const mapRef = useRef<HTMLDivElement | null>(null)


  /* ---------------- AUTOCOMPLETE ---------------- */

  const fromMatches = useMemo(
    () => qmatch(stops, fromQ),
    [stops, fromQ]
  )

  const toMatches = useMemo(
    () => qmatch(stops, toQ),
    [stops, toQ]
  )

  function pick(list: Stop[], q: string): Stop | null {
    const s = q.trim().toLowerCase()
    return list.find(x => x.name.toLowerCase().includes(s)) ?? null
  }

  /* ---------------- PATH LOGIC (SIMPLE & SAFE) ---------------- */

  function findPath() {
    const src = pick(stops, fromQ)
    const dst = pick(stops, toQ)

    if (!src || !dst) {
      setPath(null)
      return
    }

    setPath([
      {
        kind: 'direct',
        routeId: routes[0]?.id,
        routeTitle: routes[0]?.title ?? 'Route',
        from: src,
        to: dst,
        hops: 0,
      },
    ])

    setTimeout(() => {
      mapRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
}, 200)

  }

  /* ---------------- SAFE DERIVED VALUES ---------------- */

  const legs: Leg[] = Array.isArray(path) ? path : []
  const fromStop: Stop | undefined =
  path && path.length > 0 ? path[0].from : undefined

  const toStop: Stop | undefined =
  path && path.length > 0 ? path[path.length - 1].to : undefined



  /* ---------------- JSX ---------------- */

  return (
    <div className="container">
      {/* PATH FINDER */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h2>Raahi Path Finder</h2>

        {/* FROM */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <label>From</label>
          <input
            value={fromQ}
            onChange={e => {
            setFromQ(e.target.value)
            setShowFromList(true)
          }}
          onBlur={() => {
            setTimeout(() => setShowFromList(false), 150)
        }}
  placeholder={`Choose a stop in ${city.name}`}
/>

          {showFromList && fromMatches.length > 0 && (
            <ul className="autocomplete">
              {fromMatches.map(m => (
                <li
                  key={m.id}
                  onMouseDown={e => {
                    e.preventDefault()
                    setFromQ(m.name)
                    setShowFromList(false)   // ✅ CLOSE DROPDOWN
               }}
              >
        {m.name}
      </li>
    ))}
  </ul>
)}

        </div>

        {/* TO */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <label>To</label>
          <input
            value={toQ}
            onChange={e => {
            setToQ(e.target.value)
            setShowToList(true)
          }}

          onBlur={() => {
            setTimeout(() => setShowToList(false), 150)
          }}
  placeholder={`Choose a stop in ${city.name}`}
/>

      {showToList && toMatches.length > 0 && (
        <ul className="autocomplete">
          {toMatches.map(m => (
            <li
              key={m.id}
              onMouseDown={e=> {
                e.preventDefault()
                setToQ(m.name)
                setShowToList(false)    // ✅ CLOSE DROPDOWN
              }}
            >
        {m.name}
      </li>
    ))}
  </ul>
)}

        </div>

        <button className="btn btn-primary" onClick={findPath}>
          Find Path
        </button>
      </div>

      {/* ITINERARY */}
      {path && (
        <div className="card">
          <h3>Suggested Itinerary</h3>
          <p>
            {fromStop?.name} → {toStop?.name}
          </p>
        </div>
      )}

      {/* INLINE MAP (NO TAB SWITCH) */}
      {fromStop && toStop && (
        <div ref={mapRef} className="card" style={{ marginTop: 16 }}>
          <h3>Route Map</h3>
          <CityMap from={fromStop} to={toStop} />
        </div>
      )}
    </div>
  )
}
