export type Stop = { id: string; name: string; lat: number; lng: number };
export type Route = { id: string; title: string; type: 'Express' | 'Regular'; stops: number; km: number };
export type CityContent = { id: string; stops: Stop[]; routes: Route[]; stopRoutes: Record<string, string[]> };

const mk = (lat: number, lng: number) => [
  { id: 's1', name: 'Central Bus Stand', lat: lat - 0.02, lng: lng - 0.02 },
  { id: 's2', name: 'Railway Station', lat: lat - 0.015, lng: lng + 0.018 },
  { id: 's3', name: 'City Mall', lat: lat + 0.015, lng: lng - 0.01 },
  { id: 's4', name: 'University', lat: lat + 0.02, lng: lng + 0.02 },
  { id: 's5', name: 'Airport Road', lat: lat, lng: lng + 0.03 }
];

const routes = (name: string): Route[] => [
  { id: 'r1', title: `${name} Loop`, type: 'Regular', stops: 8, km: 12.2 },
  { id: 'r2', title: `${name} Express Corridor`, type: 'Express', stops: 5, km: 9.4 },
  { id: 'r3', title: 'Airport Shuttle', type: 'Express', stops: 4, km: 11.6 },
  { id: 'r4', title: 'University Connector', type: 'Regular', stops: 6, km: 10.0 },
];

export const CITY_CONTENT: CityContent[] = [
  { id: 'amritsar', stops: mk(31.633979, 74.872261), routes: routes('Amritsar'), stopRoutes: { s1: ['r1', 'r2'], s2: ['r1'], s3: ['r4'], s4: ['r4'], s5: ['r3'] } },
  { id: 'ludhiana', stops: mk(30.900965, 75.857276), routes: routes('Ludhiana'), stopRoutes: { s1: ['r1', 'r2'], s2: ['r1'], s3: ['r4'], s4: ['r4'], s5: ['r3'] } },
  { id: 'bathinda', stops: mk(30.211027, 74.945473), routes: routes('Bathinda'), stopRoutes: { s1: ['r1', 'r2'], s2: ['r1'], s3: ['r4'], s4: ['r4'], s5: ['r3'] } },
  { id: 'barnala', stops: mk(30.37884, 75.523529), routes: routes('Barnala'), stopRoutes: { s1: ['r1', 'r2'], s2: ['r1'], s3: ['r4'], s4: ['r4'], s5: ['r3'] } },
];
