/**
 * FacilityService – fetches nearest public facilities from Laravel + pgRouting.
 * Distance calculations are performed exclusively in PostgreSQL via ST_Distance.
 * React Native never computes distances.
 */
import api from "./apiClient";

export interface NearestFacility {
  category: string;
  icon: string;
  name: string;
  distanceKm: number;
  travelTimeMinutes: number;
}

/**
 * GET /api/lands/{id}/facilities
 * Returns nearest public facilities per category, sorted by distance.
 * Distance and travel time are computed by PostGIS/pgRouting on the backend.
 */
export async function fetchNearestFacilities(
  landId: string
): Promise<NearestFacility[]> {
  const res = await api.get(`/lands/${landId}/facilities`);
  return res.data as NearestFacility[];
}
