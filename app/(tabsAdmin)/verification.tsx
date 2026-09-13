import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const PRIMARY = "#2E7D32";
const PRIMARY_LIGHT = "#DBEAFE";
const SUCCESS = "#16A34A";
const WARNING = "#F59E0B";
const DANGER = "#EF4444";
const GRAY_BG = "#F1F5F9";
const TEXT_DARK = "#0F172A";
const TEXT_SECONDARY = "#64748B";

type FilterType = "all" | "pending" | "accepted" | "declined";

const dummyData = [
  {
    id: "101", seller: "Budi Santoso", name: "Sawah Subur Bantul",
    location: "Bantul, Yogyakarta", price: 90000000, status: "pending",
    date: "2026-07-05",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
    description: "Fertile rice field with irrigation access. 2000m2 area with road access.",
    facilities: ["Irrigation", "Road Access", "Electricity"],
    gallery: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    ],
    coordinates: { lat: -7.8884, lng: 110.3278 },
    ownerEmail: "budi@email.com", ownerPhone: "081234567890",
  },
  {
    id: "102", seller: "Siti Aminah", name: "Kebun Durian Sleman",
    location: "Sleman, Yogyakarta", price: 157000000, status: "pending",
    date: "2026-07-06",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    description: "Durian orchard with 50+ productive trees. 3500m2 with certificate.",
    facilities: ["SHM Certificate", "Water Source", "Fencing"],
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    ],
    coordinates: { lat: -7.7167, lng: 110.3556 },
    ownerEmail: "siti@email.com", ownerPhone: "081298765432",
  },
  {
    id: "103", seller: "Ahmad Fauzi", name: "Tanah Kavling Magelang",
    location: "Magelang, Jawa Tengah", price: 250000000, status: "accepted",
    date: "2026-07-01",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    description: "Strategic residential land. 1500m2 near main road.",
    facilities: ["SHM Certificate", "Road Access"],
    gallery: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    ],
    coordinates: { lat: -7.4797, lng: 110.2177 },
    ownerEmail: "ahmad@email.com", ownerPhone: "081355566677",
  },
];

export default function VerificationScreen() {
  const [items, setItems] = useState(dummyData);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const filtered = items.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.seller.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || item.status === filter;
    return matchSearch && matchFilter;
  });

  const handleAccept = (id: string) => {
    Alert.alert("Approve Property", "Confirm approval?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: () => {
          setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "accepted" } : i)));
          if (selectedItem?.id === id) setSelectedItem(null);
        },
      },
    ]);
  };

  const handleDecline = (id: string) => {
    Alert.alert("Reject Property", "Confirm rejection?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        onPress: () => {
          setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "declined" } : i)));
          if (selectedItem?.id === id) setSelectedItem(null);
        },
      },
    ]);
  };

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "accepted" },
    { label: "Rejected", value: "declined" },
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "accepted": return { bg: "#DCFCE7", text: SUCCESS, label: "Approved" };
      case "declined": return { bg: "#FEE2E2", text: DANGER, label: "Rejected" };
      default: return { bg: "#FEF3C7", text: "#D97706", label: "Pending" };
    }
  };

  // ── Detail View ──
  if (selectedItem) {
    const si = selectedItem;
    const statusInfo = getStatusInfo(si.status);
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <View style={styles.detailHeader}>
            <TouchableOpacity onPress={() => setSelectedItem(null)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={TEXT_DARK} />
            </TouchableOpacity>
            <Text style={styles.detailHeaderTitle}>Property Details</Text>
            <View style={{ width: 42 }} />
          </View>

          {/* Gallery */}
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {si.gallery.map((img: string, idx: number) => (
              <Image key={idx} source={{ uri: img }} style={styles.galleryImage} />
            ))}
          </ScrollView>

          <View style={{ padding: 20 }}>
            {/* Title & Status */}
            <View style={styles.detailTitleRow}>
              <Text style={styles.detailTitle}>{si.name}</Text>
              <View style={[styles.detailStatus, { backgroundColor: statusInfo.bg }]}>
                <Text style={[styles.detailStatusText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
              </View>
            </View>

            <Text style={styles.detailPrice}>Rp{si.price.toLocaleString("id-ID")}</Text>

            {/* Info Grid */}
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Ionicons name="person-outline" size={16} color={PRIMARY} />
                <Text style={styles.infoLabel}>Owner</Text>
                <Text style={styles.infoValue}>{si.seller}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={16} color={PRIMARY} />
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{si.location}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={16} color={PRIMARY} />
                <Text style={styles.infoLabel}>Submitted</Text>
                <Text style={styles.infoValue}>{si.date}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="mail-outline" size={16} color={PRIMARY} />
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{si.ownerEmail}</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.descText}>{si.description}</Text>

            {/* Facilities */}
            <Text style={styles.sectionLabel}>Facilities</Text>
            <View style={styles.facilitiesRow}>
              {si.facilities.map((f: string, i: number) => (
                <View key={i} style={styles.facilityChip}>
                  <Ionicons name="checkmark-circle" size={14} color={PRIMARY} />
                  <Text style={styles.facilityText}>{f}</Text>
                </View>
              ))}
            </View>

            {/* Map Location */}
            <Text style={styles.sectionLabel}>Map Location</Text>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map" size={32} color={PRIMARY} />
              <Text style={styles.mapCoordText}>
                Lat: {si.coordinates.lat.toFixed(4)}, Lng: {si.coordinates.lng.toFixed(4)}
              </Text>
              <Text style={styles.mapHint}>Tap to open in map application</Text>
            </View>

            {/* Owner Info */}
            <Text style={styles.sectionLabel}>Owner Information</Text>
            <View style={styles.ownerCard}>
              <View style={styles.ownerAvatar}>
                <Ionicons name="person" size={28} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.ownerName}>{si.seller}</Text>
                <Text style={styles.ownerDetail}>{si.ownerEmail}</Text>
                <Text style={styles.ownerDetail}>{si.ownerPhone}</Text>
              </View>
            </View>

            {/* Actions */}
            {si.status === "pending" && (
              <View style={styles.detailActions}>
                <TouchableOpacity style={styles.detailApproveBtn} onPress={() => handleAccept(si.id)}>
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={styles.detailApproveText}>Approve Property</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.detailRejectBtn} onPress={() => handleDecline(si.id)}>
                  <Ionicons name="close-circle" size={18} color="#fff" />
                  <Text style={styles.detailRejectText}>Reject Property</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── List View ──
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Property Verification</Text>
        <Text style={styles.pageSubtitle}>Review property submissions from owners</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={TEXT_SECONDARY} style={{ marginLeft: 14 }} />
        <TextInput
          placeholder="Search properties or owners..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor={TEXT_SECONDARY}
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={styles.filterScroll}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.chip, filter === f.value && styles.chipActive]}
            onPress={() => setFilter(f.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, filter === f.value && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No properties found.</Text>
          </View>
        ) : (
          filtered.map((item) => {
            const info = getStatusInfo(item.status);
            return (
              <View key={item.id} style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <View style={[styles.cardBadge, { backgroundColor: info.bg }]}>
                  <Text style={[styles.cardBadgeText, { color: info.text }]}>{info.label}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardSeller}>by {item.seller}</Text>
                  <View style={styles.cardMeta}>
                    <Ionicons name="location-outline" size={12} color={TEXT_SECONDARY} />
                    <Text style={styles.cardMetaText}>{item.location}</Text>
                  </View>
                  <View style={styles.cardMeta}>
                    <Ionicons name="calendar-outline" size={12} color={TEXT_SECONDARY} />
                    <Text style={styles.cardMetaText}>{item.date}</Text>
                  </View>
                  <Text style={styles.cardPrice}>Rp{item.price.toLocaleString("id-ID")}</Text>

                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.viewBtn} onPress={() => setSelectedItem(item)}>
                      <Ionicons name="eye-outline" size={14} color={PRIMARY} />
                      <Text style={styles.viewBtnText}>View Details</Text>
                    </TouchableOpacity>
                    {item.status === "pending" && (
                      <>
                        <TouchableOpacity style={styles.approveBtn} onPress={() => handleAccept(item.id)}>
                          <Ionicons name="checkmark" size={14} color="#fff" />
                          <Text style={styles.smallBtnText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.rejectBtn} onPress={() => handleDecline(item.id)}>
                          <Ionicons name="close" size={14} color="#fff" />
                          <Text style={styles.smallBtnText}>Reject</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  // Page Header
  pageHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  pageTitle: { fontSize: 22, fontWeight: "700", color: TEXT_DARK },
  pageSubtitle: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 4 },

  // Search & Filter
  searchBar: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#F1F5F9",
    marginHorizontal: 20, borderRadius: 14, height: 46, marginTop: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: TEXT_DARK, paddingHorizontal: 10 },
  filterScroll: { maxHeight: 44 },
  filterRow: { paddingHorizontal: 20, paddingVertical: 8, gap: 8, alignItems: "center" },
  chip: {
    height: 32, paddingHorizontal: 14, borderRadius: 16,
    backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center",
  },
  chipActive: { backgroundColor: PRIMARY },
  chipText: { fontSize: 12, fontWeight: "600", color: "#64748B" },
  chipTextActive: { color: "#fff" },

  // Card
  card: {
    marginHorizontal: 20, marginTop: 14, backgroundColor: "#fff",
    borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardImage: { width: "100%", height: 150 },
  cardBadge: {
    position: "absolute", top: 12, right: 12,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  cardBadgeText: { fontSize: 11, fontWeight: "700" },
  cardBody: { padding: 14 },
  cardName: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  cardSeller: { fontSize: 13, color: "#64748B", marginTop: 2 },
  cardMeta: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  cardMetaText: { fontSize: 12, color: "#64748B", marginLeft: 4 },
  cardPrice: { fontSize: 16, fontWeight: "700", color: "#16A34A", marginTop: 8 },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  viewBtn: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 10, backgroundColor: "#DBEAFE", gap: 4,
  },
  viewBtnText: { fontSize: 12, fontWeight: "600", color: PRIMARY },
  approveBtn: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 10, backgroundColor: "#16A34A", gap: 4,
  },
  rejectBtn: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 10, backgroundColor: "#EF4444", gap: 4,
  },
  smallBtnText: { fontSize: 12, fontWeight: "600", color: "#fff" },

  emptyState: { alignItems: "center", marginTop: 48 },
  emptyText: { fontSize: 14, color: "#64748B", marginTop: 12 },

  // ── Detail View ──
  detailHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center",
  },
  detailHeaderTitle: { fontSize: 17, fontWeight: "700", color: TEXT_DARK },
  galleryImage: { width: 320, height: 200, marginHorizontal: 4, borderRadius: 12 },
  detailTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  detailTitle: { fontSize: 20, fontWeight: "700", color: TEXT_DARK, flex: 1, marginRight: 8 },
  detailStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  detailStatusText: { fontSize: 12, fontWeight: "700" },
  detailPrice: { fontSize: 18, fontWeight: "700", color: "#16A34A", marginTop: 8 },

  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 16 },
  infoItem: {
    flex: 1, minWidth: 140, backgroundColor: "#F8FAFC",
    borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E2E8F0",
  },
  infoLabel: { fontSize: 11, color: "#64748B", marginTop: 4 },
  infoValue: { fontSize: 13, fontWeight: "600", color: TEXT_DARK, marginTop: 2 },

  sectionLabel: { fontSize: 15, fontWeight: "700", color: TEXT_DARK, marginTop: 20 },
  descText: { fontSize: 14, color: "#64748B", lineHeight: 20, marginTop: 8 },

  facilitiesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  facilityChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#DBEAFE", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  facilityText: { fontSize: 12, fontWeight: "600", color: PRIMARY },

  mapPlaceholder: {
    backgroundColor: "#F8FAFC", borderRadius: 14, padding: 24,
    alignItems: "center", marginTop: 8, borderWidth: 1, borderColor: "#E2E8F0",
  },
  mapCoordText: { fontSize: 13, fontWeight: "600", color: TEXT_DARK, marginTop: 8 },
  mapHint: { fontSize: 12, color: "#64748B", marginTop: 4 },

  ownerCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC",
    borderRadius: 14, padding: 16, marginTop: 8, borderWidth: 1, borderColor: "#E2E8F0", gap: 14,
  },
  ownerAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: PRIMARY, justifyContent: "center", alignItems: "center",
  },
  ownerName: { fontSize: 15, fontWeight: "700", color: TEXT_DARK },
  ownerDetail: { fontSize: 12, color: "#64748B", marginTop: 2 },

  detailActions: { flexDirection: "row", gap: 12, marginTop: 24 },
  detailApproveBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#16A34A", paddingVertical: 14, borderRadius: 14, gap: 6,
  },
  detailApproveText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  detailRejectBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#EF4444", paddingVertical: 14, borderRadius: 14, gap: 6,
  },
  detailRejectText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
