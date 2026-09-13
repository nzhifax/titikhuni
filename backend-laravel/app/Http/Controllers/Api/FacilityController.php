<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Land;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class FacilityController extends Controller
{
    // GET /api/lands/{id}/facilities
    public function getNearestFacilities(string $id): JsonResponse
    {
        $land = Land::findOrFail($id);

        $coords = DB::selectOne("
            SELECT ST_Y(geom::geometry) AS latitude, ST_X(geom::geometry) AS longitude
            FROM lands WHERE id = :id
        ", ['id' => $id]);

        if (!$coords || !$coords->latitude || !$coords->longitude) {
            return response()->json([]);
        }

        $lat = (float) $coords->latitude;
        $lng = (float) $coords->longitude;

        // Query the nearest facility for each category using PostGIS ST_Distance
        $sql = "
            SELECT DISTINCT ON (category)
                category,
                name,
                icon,
                ST_Distance(
                    geom::geography,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
                ) / 1000 AS distance_km
            FROM \"PublicFacilities_Clean\"
            ORDER BY category, distance_km ASC
        ";

        $results = DB::select($sql, ['lng' => $lng, 'lat' => $lat]);

        // Map icons from riskData definitions in frontend or fallback from DB
        $iconMap = [
            'Sekolah' => 'school-outline',
            'Rumah Sakit' => 'medical-outline',
            'Klinik' => 'fitness-outline',
            'Apotek' => 'medkit-outline',
            'Pasar' => 'cart-outline',
            'SPBU' => 'car-outline',
            'Bank' => 'cash-outline',
            'ATM' => 'card-outline',
            'Tempat Ibadah' => 'home-outline',
        ];

        $facilities = collect($results)->map(function ($row) use ($iconMap) {
            $distance = round((float) $row->distance_km, 1);
            // Estimate travel time at ~40km/h: (distance / 40) * 60 = distance * 1.5 min, minimum 1 min
            $time = max(1, (int) round($distance * 1.5));

            $cat = $row->category;
            $icon = $iconMap[$cat] ?? ($row->icon ? $row->icon . '-outline' : 'business-outline');

            return [
                'category' => $cat,
                'icon' => $icon,
                'name' => $row->name ?? "$cat Terdekat",
                'distanceKm' => $distance,
                'travelTimeMinutes' => $time,
            ];
        });

        return response()->json($facilities);
    }
}
