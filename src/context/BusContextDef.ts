// src/context/BusContextDef.ts
// Separated from BusContext.tsx so Vite Fast Refresh works correctly —
// context objects and components may not share the same module.
import { createContext } from 'react'
import type React from 'react'
import type { City } from '../data/cities'
import type { CityContent, Route } from '../data/cityContent'

export type FilterOptions = {
    express: boolean
    regular: boolean
}

export type Ctx = {
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
