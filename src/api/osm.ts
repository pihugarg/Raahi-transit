// src/api/osm.ts
import { fetchWithRetry } from '../utils/retry'

export type Stop = {
  id: string
  name: string
  lat: number
  lng: number
}

export type Route = {
  id: string
  title: string
  type: 'Express' | 'Regular'
  stops: number
  km: number
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

function cacheKey(lat: number, lng: number, radius: number) {
  return `raahi:osm:stops:${lat.toFixed(3)}:${lng.toFixed(3)}:${radius}`
}
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6h

function readCache(key: string): Stop[] | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

function writeCache(key: string, data: Stop[]) {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }))
  } catch {
    // ignore quota/private-mode errors
  }
}

async function queryEndpoint(url: string, query: string, timeoutMs = 20000): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { method: 'POST', body: query, signal: controller.signal })
    if (!res.ok) throw new Error(`Overpass ${url} responded ${res.status}`)
    const data = await res.json()
    if (!Array.isArray(data?.elements)) throw new Error('Overpass response missing elements[]')
    return data
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Fetch bus stops within `radiusMeters` of a single point (a city center).
 * Scoping to a radius — instead of the whole state — is what actually fixes
 * the "some stops missing" symptom: a whole-Punjab query returns thousands
 * of nodes, which is slow, easy to rate-limit, and easy to have silently
 * truncated by the server-side [timeout]. A per-city radius query is small,
 * fast, and reliable.
 */
export async function fetchBusStopsNear(
  lat: number,
  lng: number,
  radiusMeters = 5000
): Promise<Stop[]> {
  const key = cacheKey(lat, lng, radiusMeters)
  const cached = readCache(key)
  if (cached) return cached

  const query = `
    [out:json][timeout:25];
    (
      node["highway"="bus_stop"](around:${radiusMeters},${lat},${lng});
    );
    out body;
  `

  let lastErr: any = null
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const data = await fetchWithRetry(() => queryEndpoint(endpoint, query), 3, 500)
      const stops: Stop[] = data.elements
        .filter((e: any) => typeof e.lat === 'number' && typeof e.lon === 'number')
        .map((e: any) => ({
          id: String(e.id),
          name: (e.tags?.name || 'Bus Stop').trim(),
          lat: e.lat,
          lng: e.lon,
        }))
      writeCache(key, stops)
      return stops
    } catch (e) {
      lastErr = e
    }
  }

  console.error('fetchBusStopsNear: all Overpass endpoints failed', lastErr)
  const raw = localStorage.getItem(key)
  if (raw) {
    try {
      return JSON.parse(raw).data as Stop[]
    } catch {
      // ignore
    }
  }
  return []
}

/** @deprecated whole-state queries are slow and easy to truncate — use fetchBusStopsNear(cityLat, cityLng) per selected city instead. */
export async function fetchPunjabBusStops(): Promise<Stop[]> {
  const query = `
    [out:json][timeout:25];
    area["name"="Punjab"]["admin_level"="4"];
    (
      node["highway"="bus_stop"](area);
    );
    out body;
  `
  const data = await fetchWithRetry(() => queryEndpoint(OVERPASS_ENDPOINTS[0], query, 25000), 2, 500)
  return data.elements
    .filter((e: any) => typeof e.lat === 'number' && typeof e.lon === 'number')
    .map((e: any) => ({
      id: String(e.id),
      name: (e.tags?.name || 'Bus Stop').trim(),
      lat: e.lat,
      lng: e.lon,
    }))
}

/**
 * OSM bus_stop nodes carry no route/express-regular info, so the UI has
 * nothing to show under "View routes" for a live-fetched stop. This
 * generates stable, deterministic placeholder routes per stop — same
 * approach the app's static seed data already uses — so re-fetching the
 * same stop always yields the same routes instead of random ones.
 */
export function synthesizeRoutesForStop(stop: Stop): Route[] {
  // Simple string hash -> deterministic seed
  let seed = 0
  for (let i = 0; i < stop.id.length; i++) seed = (seed * 31 + stop.id.charCodeAt(i)) >>> 0

  const rand = (n: number) => {
    seed = (seed * 1103515245 + 12345) >>> 0
    return seed % n
  }

  const count = 1 + rand(3) // 1-3 routes per stop
  const routes: Route[] = []
  for (let i = 0; i < count; i++) {
    const isExpress = rand(2) === 0
    routes.push({
      id: `${stop.id}-r${i}`,
      title: `${stop.name} ${isExpress ? 'Express' : 'Loop'} ${i + 1}`,
      type: isExpress ? 'Express' : 'Regular',
      stops: 4 + rand(8),
      km: +(5 + rand(20)).toFixed(1),
    })
  }
  return routes
}
