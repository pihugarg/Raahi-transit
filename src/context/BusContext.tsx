// src/context/BusContext.tsx
// Only exports BusProvider (a React component) — keeps Vite Fast Refresh happy.
// BusContext itself lives in BusContextDef.ts.
import React, { useMemo, useState, useEffect } from 'react'
import { CITIES, City } from '../data/cities'
import { CITY_CONTENT, CityContent, Route, Stop } from '../data/cityContent'
import { fetchBusStopsNear } from '../api/osm'
import { fetchPunjabCities } from '../api/osmcities'
import { BusContext, FilterOptions } from './BusContextDef'

export { BusContext } from './BusContextDef'
export type { FilterOptions } from './BusContextDef'

// Placeholder stops placed around a city centre — same layout as mk() in cityContent.ts.
// Used as an instant fallback while the live Overpass fetch is in-flight.
function makePlaceholderStops(lat: number, lng: number): Stop[] {
  return [
    { id: 's1', name: 'Central Bus Stand', lat: lat - 0.02, lng: lng - 0.02 },
    { id: 's2', name: 'Railway Station', lat: lat - 0.015, lng: lng + 0.018 },
    { id: 's3', name: 'City Mall', lat: lat + 0.015, lng: lng - 0.01 },
    { id: 's4', name: 'University', lat: lat + 0.02, lng: lng + 0.02 },
    { id: 's5', name: 'Airport Road', lat: lat, lng: lng + 0.03 },
  ]
}

export function BusProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterOptions>({ express: true, regular: true })
  const [cities, setCities] = useState<City[]>(CITIES)
  const [cityId, setCityId] = useState('')
  const [content, setContent] = useState<CityContent>(CITY_CONTENT[0])

  // stopsMap: pre-fetched OSM stops keyed by city.id
  const [stopsMap, setStopsMap] = useState<Record<string, Stop[]>>({})

  /* ── LOAD LIVE CITIES ────────────────────────────────────────── */

  useEffect(() => {
    async function loadCities() {
      try {
        const osmCities = await fetchPunjabCities()
        const mapped: City[] = osmCities.map(c => ({
          id: c.id,
          name: c.name,
          center: [c.lat, c.lng] as [number, number],
          zoom: 12,
        }))
        setCities(mapped)
        setCityId(mapped[0]?.id ?? '')
      } catch (e) {
        console.error('Failed to load cities', e)
        // Keep static CITIES; set first static city as default
        setCityId(CITIES[0]?.id ?? '')
      }
    }
    loadCities()
  }, [])

  /* ── LOAD LIVE STOPS FOR ALL CITIES (parallel, background) ──── */
  // Runs whenever the city list changes (once after OSM resolves, or immediately
  // with the static CITIES list if OSM fails).

  useEffect(() => {
    if (!cities.length) return

    async function loadAllStops() {
      await Promise.allSettled(
        cities.map(async (c) => {
          const [lat, lng] = c.center
          try {
            // 15 km radius — covers most Punjab city extents; results are cached 6 h
            const stops = await fetchBusStopsNear(lat, lng, 15000)
            if (stops.length > 0) {
              setStopsMap(prev => ({ ...prev, [c.id]: stops }))
            }
          } catch {
            // Individual city failure is non-fatal; placeholder stops will show
          }
        })
      )
    }

    loadAllStops()
  }, [cities])

  /* ── ACTIVE CITY ─────────────────────────────────────────────── */

  const city = useMemo<City>(() => {
    const found = cities.find(c => c.id === cityId)
    if (found) return found
    return { id: 'punjab', name: 'Punjab', center: [31.1471, 75.3412], zoom: 7 }
  }, [cities, cityId])

  /* ── SYNC CONTENT WHEN CITY OR stopsMap CHANGES ─────────────── */

  useEffect(() => {
    if (city.id === 'punjab') return

    const [lat, lng] = city.center
    const liveStops = stopsMap[city.id]

    setContent(prev => ({
      ...prev,
      id: city.id,
      // Use live stops if pre-fetched, otherwise instant placeholders
      stops: liveStops ?? makePlaceholderStops(lat, lng),
    }))
  }, [city, stopsMap])

  /* ── FILTER ROUTES ───────────────────────────────────────────── */

  const filteredRoutes = useMemo<Route[]>(
    () => content.routes.filter(r =>
      r.type === 'Express' ? filters.express : filters.regular
    ),
    [content.routes, filters]
  )

  return (
    <BusContext.Provider
      value={{ cities, city, cityId, setCityId, content, filters, setFilters, filteredRoutes }}
    >
      {children}
    </BusContext.Provider>
  )
}
