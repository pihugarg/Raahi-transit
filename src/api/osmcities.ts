// src/api/osmcities.ts
import { fetchWithRetry } from '../utils/retry'

export type CityOSM = {
  id: string
  name: string
  lat: number
  lng: number
}

const CACHE_KEY = 'raahi:osm:cities:punjab'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24h — city list barely changes

// Overpass is a free, shared, rate-limited public service. Multiple public
// mirrors exist; if the primary is busy/down we fall through to the next.
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

function readCache(): CityOSM[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

function writeCache(data: CityOSM[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
  } catch {
    // localStorage can throw (quota, private mode) — never let caching break the app
  }
}

async function queryEndpoint(url: string, query: string, timeoutMs = 20000): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'POST',
      body: query,
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error(`Overpass ${url} responded ${res.status}`)
    }
    const data = await res.json()
    if (!Array.isArray(data?.elements)) {
      throw new Error('Overpass response missing elements[]')
    }
    return data
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchPunjabCities(): Promise<CityOSM[]> {
  const cached = readCache()
  if (cached) return cached

  // [timeout:25] is Overpass QL's own server-side timeout — separate from
  // (and in addition to) the client-side AbortController above.
  const query = `
    [out:json][timeout:25];
    area["name"="Punjab"]["admin_level"="4"];
    (
      node["place"~"city|town"](area);
    );
    out body;
  `

  let lastErr: any = null
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const data = await fetchWithRetry(() => queryEndpoint(endpoint, query), 3, 500)
      const cities: CityOSM[] = data.elements
        .filter((e: any) => e.tags?.name && typeof e.lat === 'number' && typeof e.lon === 'number')
        .map((e: any) => ({
          id: String(e.id),
          name: e.tags.name,
          lat: e.lat,
          lng: e.lon,
        }))
      if (cities.length > 0) {
        writeCache(cities)
        return cities
      }
      lastErr = new Error('Overpass returned zero cities')
    } catch (e) {
      lastErr = e
      // try next mirror
    }
  }

  console.error('fetchPunjabCities: all Overpass endpoints failed', lastErr)
  // Stale cache beats an empty screen, even past its TTL
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) return JSON.parse(raw).data as CityOSM[]
  } catch {
    // ignore
  }
  return []
}