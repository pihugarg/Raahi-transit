// src/api/osm.ts

export type Stop = {
  id: string
  name: string
  lat: number
  lng: number
}

export async function fetchPunjabBusStops(): Promise<Stop[]> {
  const query = `
    [out:json];
    area["name"="Punjab"]["admin_level"="4"];
    (
      node["highway"="bus_stop"](area);
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

  return data.elements.map((e: any) => ({
    id: String(e.id),
    name: e.tags?.name || 'Bus Stop',
    lat: e.lat,
    lng: e.lon,
  }))
}
