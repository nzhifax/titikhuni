<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class LayerController extends Controller
{
    // GET /api/layers/{type}
    public function getLayerPolygons(string $type): JsonResponse
    {
        $tableMap = [
            'flood' => 'Flood',
            'landslide' => 'Landslide',
            'drought' => 'Drought',
            'eruption' => 'Eruption',
            'liquefaction' => 'Liquefaction',
            'extreme_weather' => 'Extremeweather',
        ];

        if (!isset($tableMap[$type])) {
            return response()->json(['error' => 'Invalid layer type'], 400);
        }

        $table = $tableMap[$type];

        // Fetch polygons from hazard table, convert to GeoJSON
        // Limit to 150 features to prevent sending massive datasets that slow down react-native-maps
        $results = DB::select("
            SELECT 
                id, 
                gridcode,
                ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geojson
            FROM \"$table\"
            LIMIT 150
        ");

        $polygons = [];
        foreach ($results as $row) {
            $geo = json_decode($row->geojson, true);
            if ($geo && isset($geo['coordinates'])) {
                $coords = [];
                if ($geo['type'] === 'Polygon') {
                    foreach ($geo['coordinates'][0] as $pt) {
                        $coords[] = [
                            'latitude' => (float) $pt[1],
                            'longitude' => (float) $pt[0]
                        ];
                    }
                } elseif ($geo['type'] === 'MultiPolygon') {
                    // Pull coordinates of the first polygon outer ring
                    if (isset($geo['coordinates'][0][0])) {
                        foreach ($geo['coordinates'][0][0] as $pt) {
                            $coords[] = [
                                'latitude' => (float) $pt[1],
                                'longitude' => (float) $pt[0]
                            ];
                        }
                    }
                }

                if (!empty($coords)) {
                    $gridcode = (int) $row->gridcode;
                    $level = 'low';
                    if ($gridcode === 2) $level = 'medium';
                    elseif ($gridcode >= 3) $level = 'high';

                    // Assign standard overlay colors based on hazard severity
                    $fillColor = 'rgba(22, 163, 74, 0.22)'; // low (green)
                    $strokeColor = '#16A34A';
                    if ($level === 'medium') {
                        $fillColor = 'rgba(234, 179, 8, 0.28)'; // medium (yellow)
                        $strokeColor = '#EAB308';
                    } elseif ($level === 'high') {
                        $fillColor = 'rgba(220, 38, 38, 0.33)'; // high (red)
                        $strokeColor = '#DC2626';
                    }

                    $polygons[] = [
                        'id' => $type . '-' . $row->id,
                        'disasterType' => $type,
                        'level' => $level,
                        'title' => ucfirst($type) . ' Area (' . $level . ')',
                        'coordinates' => $coords,
                        'fillColor' => $fillColor,
                        'strokeColor' => $strokeColor
                    ];
                }
            }
        }

        return response()->json($polygons);
    }
}
