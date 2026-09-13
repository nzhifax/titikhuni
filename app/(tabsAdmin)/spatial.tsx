import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const PRIMARY = "#2E7D32";
const SUCCESS = "#16A34A";
const WARNING = "#F59E0B";
const DANGER = "#EF4444";
const TEXT_DARK = "#0F172A";
const TEXT_SECONDARY = "#64748B";

type LayerType = "properties" | "facilities" | "flood" | "landslide";

interface SpatialItem {
  id: string;
  name: string;
  type: LayerType;
  lat: number;
  lng: number;
  description: string;
}

const dummySpatialData: SpatialItem[] = [
  { id: "s1", name: "Sawah Subur Bantul", type: "properties", lat: -7.8884, lng: 110.3278, description: "Rice field property - 2000m2" },
  { id: "s2", name: "Kebun Durian Sleman", type: "properties", lat: -7.7167, lng: 110.3556, description: "Durian orchard - 3500m2" },
  { id: "s3", name: "Tanah Kavling Magelang", type: "properties", lat: -7.4797, lng: 110.2177, description: "Residential land - 1500m2" },
  { id: "s4", name: "Sekolah Dasar Negeri 1", type: "facilities", lat: -7.7956, lng: 110.3695, description: "Public elementary school" },
  { id: "s5", name: "RS Sardjito", type: "facilities", lat: -7.7709, lng: 110.3789, description: "Public hospital" },
  { id: "s6", name: "Pasar Beringharjo", type: "facilities", lat: -7.8015, lng: 110.3644, description: "Traditional market" },
  { id: "s7", name: "Zona Banjir Bantul", type: "flood", lat: -7.9000, lng: 110.3300, description: "High flood risk area" },
  { id: "s8", name: "Zona Banjir Sleman Utara", type: "flood", lat: -7.6800, lng: 110.3700, description: "Moderate flood risk area" },
  { id: "s9", name: "Zona Longsor Menoreh", type: "landslide", lat: -7.6500, lng: 110.1500, description: "High landslide risk - hilly terrain" },
  { id: "s10", name: "Zona Longsor Kaliurang", type: "landslide", lat: -7.6000, lng: 110.4200, description: "Moderate landslide risk - Merapi slope" },
];

const layerConfig: Record<LayerType, { label: string; color: string; icon: string }> = {
  properties: { label: "Properties", color: PRIMARY, icon: "business" },
  facilities: { label: "Public Facilities", color: "#0891B2", icon: "medkit" },
  flood: { label: "Flood Hazard", color: "#3B82F6", icon: "water" },
  landslide: { label: "Landslide Hazard", color: "#92400E", icon: "warning" },
};

export default function SpatialDataScreen() {
  const router = useRouter();
  const [activeLayers, setActiveLayers] = useState<LayerType[]>(["properties", "facilities", "flood", "landslide"]);
  const [selectedMarker, setSelectedMarker] = useState<SpatialItem | null>(null);

  const toggleLayer = (type: LayerType) => {
    setActiveLayers((prev) =>
      prev.includes(type) ? prev.filter((l) => l !== type) : [...prev, type]
    );
  };

  const filteredData = dummySpatialData.filter((d) => activeLayers.includes(d.type));

  const initialRegion = {
    latitude: -7.7956,
    longitude: 110.3695,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  const handleAddData = () => {
    Alert.alert("Add Spatial Data", "This feature allows adding new spatial data points to the map with coordinates and metadata.");
  };

  const handleEditData = () => {
    if (!selectedMarker) {
      Alert.alert("Edit Spatial Data", "Please select a marker on the map first.");
      return;
    }
    Alert.alert("Edit Spatial Data", `Editing: ${selectedMarker.name}`);
  };

  const handleDeleteData = () => {
    if (!selectedMarker) {
      Alert.alert("Delete Spatial Data", "Please select a marker on the map first.");
      return;
    }
    Alert.alert("Delete Spatial Data", `Delete "${selectedMarker.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => setSelectedMarker(null) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={TEXT_DARK} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Spatial Data</Text>
          <Text style={styles.headerSubtitle}>GIS Property Map View</Text>
        </View>
      </View>

      {/* Layer Toggles */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.layerRow}>
        {(Object.keys(layerConfig) as LayerType[]).map((type) => {
          const cfg = layerConfig[type];
          const isActive = activeLayers.includes(type);
          return (
            <TouchableOpacity
              key={type}
              style={[styles.layerChip, isActive && { backgroundColor: cfg.color }]}
              onPress={() => toggleLayer(type)}
            >
              <Ionicons name={cfg.icon as any} size={14} color={isActive ? "#fff" : cfg.color} />
              <Text style={[styles.layerChipText, isActive && { color: "#fff" }, !isActive && { color: cfg.color }]}>
                {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {filteredData.map((item) => (
            <Marker
              key={item.id}
              coordinate={{ latitude: item.lat, longitude: item.lng }}
              title={item.name}
              description={item.description}
              pinColor={layerConfig[item.type].color}
              onPress={() => setSelectedMarker(item)}
            />
          ))}
        </MapView>
      </View>

      {/* Selected Marker Info */}
      {selectedMarker && (
        <View style={styles.infoPanel}>
          <View style={styles.infoPanelHeader}>
            <View style={[styles.infoIconWrap, { backgroundColor: layerConfig[selectedMarker.type].color + "20" }]}>
              <Ionicons
                name={layerConfig[selectedMarker.type].icon as any}
                size={18}
                color={layerConfig[selectedMarker.type].color}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoPanelTitle}>{selectedMarker.name}</Text>
              <Text style={styles.infoPanelDesc}>{selectedMarker.description}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedMarker(null)}>
              <Ionicons name="close-circle" size={22} color={TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>
          <Text style={styles.infoPanelCoords}>
            Lat: {selectedMarker.lat.toFixed(4)}, Lng: {selectedMarker.lng.toFixed(4)}
          </Text>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendRow}>
          {(Object.keys(layerConfig) as LayerType[]).map((type) => (
            <View key={type} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: layerConfig[type].color }]} />
              <Text style={styles.legendText}>{layerConfig[type].label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleAddData}>
          <Ionicons name="add-circle" size={18} color={PRIMARY} />
          <Text style={[styles.actionBtnText, { color: PRIMARY }]}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleEditData}>
          <Ionicons name="create" size={18} color={WARNING} />
          <Text style={[styles.actionBtnText, { color: WARNING }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleDeleteData}>
          <Ionicons name="trash" size={18} color={DANGER} />
          <Text style={[styles.actionBtnText, { color: DANGER }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: TEXT_DARK },
  headerSubtitle: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 2 },

  layerRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  layerChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  layerChipText: { fontSize: 12, fontWeight: "600" },

  mapContainer: {
    marginHorizontal: 16, height: height * 0.38,
    borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#E2E8F0",
  },
  map: { flex: 1 },

  infoPanel: {
    marginHorizontal: 16, marginTop: 12, backgroundColor: "#F8FAFC",
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#E2E8F0",
  },
  infoPanelHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoIconWrap: {
    width: 38, height: 38, borderRadius: 10,
    justifyContent: "center", alignItems: "center",
  },
  infoPanelTitle: { fontSize: 15, fontWeight: "700", color: TEXT_DARK },
  infoPanelDesc: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 2 },
  infoPanelCoords: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 8 },

  legend: {
    marginHorizontal: 16, marginTop: 12, backgroundColor: "#F8FAFC",
    borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#E2E8F0",
  },
  legendTitle: { fontSize: 13, fontWeight: "700", color: TEXT_DARK, marginBottom: 8 },
  legendRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: TEXT_SECONDARY },

  actionBar: {
    flexDirection: "row", justifyContent: "center", gap: 16,
    marginTop: 16, paddingHorizontal: 16, paddingBottom: 20,
  },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#F8FAFC", paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0",
  },
  actionBtnText: { fontSize: 13, fontWeight: "700" },
});
