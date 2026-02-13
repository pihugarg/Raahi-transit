import React, {
  createContext,
  useMemo,
  useState,
  useEffect,
} from 'react'
import { CITIES, City } from '../data/cities'
import { CITY_CONTENT, CityContent, Route } from '../data/cityContent'
import { fetchPunjabBusStops } from '../api/osm'
import { fetchPunjabCities } from '../api/osmcities'

export type FilterOptions = {
  express: boolean
  regular: boolean
}

type Ctx = {
  cities: City[]
  city: City
  cityId: string
  setCityId: React.Dispatch<React.SetStateAction<string>>
  content: CityContent
  filters: FilterOptions
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>
  filteredRoutes: Route[]
}

export const BusContext = createContext<Ctx | null>(null)

export const BusProvider = ({ children }: { children: React.ReactNode }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    express: true,
    regular: true,
  })

  const [cities, setCities] = useState<City[]>(CITIES)
  const [cityId, setCityId] = useState('')
  const [content, setContent] = useState<CityContent>(CITY_CONTENT[0])

  /* ---------- LOAD LIVE CITIES ---------- */

  useEffect(() => {
    async function loadCities() {
      try {
        const osmCities = await fetchPunjabCities()

        const mapped: City[] = osmCities.map(c => ({
          id: c.id,
          name: c.name,
          center: [c.lat, c.lng],
          zoom: 12,
        }))

        setCities(mapped)
        setCityId(mapped[0]?.id ?? '')
      } catch (e) {
        console.error('Failed to load cities', e)
      }
    }

    loadCities()
  }, [])

  /* ---------- LOAD LIVE STOPS ---------- */

  useEffect(() => {
    async function loadStops() {
      try {
        const stops = await fetchPunjabBusStops()

        setContent(prev => ({
          ...prev,
          stops, // override only stops
        }))
      } catch (e) {
        console.error('Failed to load stops', e)
      }
    }

    loadStops()
  }, [])

  /* ---------- ACTIVE CITY ---------- */

  const city = useMemo<City>(() => {
    const found = cities.find(c => c.id === cityId)
    if (found) return found

    return {
      id: 'punjab',
      name: 'Punjab',
      center: [31.1471, 75.3412],
      zoom: 7,
    }
  }, [cities, cityId])

  /* ---------- FILTER ROUTES ---------- */

  const filteredRoutes = useMemo(
    () =>
      content.routes.filter(r =>
        r.type === 'Express' ? filters.express : filters.regular
      ),
    [content.routes, filters]
  )

  return (
    <BusContext.Provider
      value={{
        cities,
        city,
        cityId,
        setCityId,
        content,
        filters,
        setFilters,
        filteredRoutes,
      }}
    >
      {children}
    </BusContext.Provider>
  )
}
