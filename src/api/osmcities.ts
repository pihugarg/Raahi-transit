// src/api/osmCities.ts

export type CityOSM = {
  id: string
  name: string
  lat: number
  lng: number
}

export async function fetchPunjabCities(): Promise<CityOSM[]> {
  const query = `
    [out:json];
    area["name"="Punjab"]["admin_level"="4"];
    (
      node["place"~"city|town"](area);
    );
    out body;
  `

  const res = await fetch(
    'https://overpass-api.de/api/interpreter',
    {
      method: 'POST',
      body: query,
    }
  )

  const data = await res.json()

  return data.elements
    .filter((e: any) => e.tags?.name)
    .map((e: any) => ({
      id: String(e.id),
      name: e.tags.name,
      lat: e.lat,
      lng: e.lon,
    }))
}
