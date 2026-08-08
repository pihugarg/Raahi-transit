import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { fetchWithRetry } from '../utils/retry'

type ETA = { stop: string; etaMin: number }
const STOPS = ['Main St & 1st', 'Market Square', 'Station Avenue', 'City Mall', 'Airport Road']

export default function Timeline() {
  const { lite } = useSettings()
  const [etas, setEtas] = useState<ETA[]>([])
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadEtas() {
    setError(null)
    try {
      const data = await fetchWithRetry(async () => {
        // Simulate API (random failure on slow networks)
        await new Promise(r => setTimeout(r, 250 + Math.random() * 400))
        if (Math.random() < 0.2) throw new Error('Network error')
        return STOPS.map((s, i) => ({ stop: s, etaMin: (i + 1) * 2 }))
      }, 3, 400)
      setEtas(data)
      setLastUpdated(Date.now())
    } catch (e: any) {
      setError(e?.message || 'Failed to load')
      // keep previous etas (last known) visible
    }
  }

  useEffect(() => {
    loadEtas()
    const id = setInterval(loadEtas, lite ? 20000 : 10000) // fewer updates in lite
    return () => clearInterval(id)
  }, [lite])

  return (<div className="container">
    <div className="card">
      <h2>Upcoming Arrivals</h2>
      {lite && <div style={{ margin: '8px 0', color: '#64748b' }}>Lite Mode: text-only ETAs, fewer refreshes.</div>}
      {error && <div style={{ color: '#dc2626', marginBottom: 8 }}>Retrying: {error}</div>}
      {lastUpdated && <div style={{ color: '#64748b', fontSize: 12, marginBottom: 8 }}>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={C}>Stop</th><th style={C}>ETA (min)</th></tr></thead>
        <tbody>
          {etas.map((e, i) => (<tr key={i}><td style={C}>{e.stop}</td><td style={C}>{e.etaMin}</td></tr>))}
        </tbody>
      </table>
    </div>
  </div>)
}

const C: React.CSSProperties = { border: '1px solid #e5e7eb', padding: '10px 12px', textAlign: 'left' }
