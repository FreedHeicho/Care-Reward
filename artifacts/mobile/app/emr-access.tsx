import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useHealthRecords } from "@/context/HealthRecordsContext";

const RECORD_CATEGORIES = [
  { id: "all", label: "All records", icon: "folder" as const, color: "#22C55E", bg: "#DCFCE7", lastUpdated: "Jun 19", route: null },
  { id: "allergies", label: "Allergies", icon: "alert-circle" as const, color: "#EAB308", bg: "#FEF9C3", lastUpdated: "Oct 29, 2025", route: null },
  { id: "conditions", label: "Conditions", icon: "user" as const, color: "#EC4899", bg: "#FCE7F3", lastUpdated: "Jun 12", route: null },
  { id: "immunizations", label: "Immunizations", icon: "shield" as const, color: "#14B8A6", bg: "#CCFBF1", lastUpdated: "Nov 5, 2025", route: "/health-records/immunizations" },
  { id: "labs", label: "Lab results", icon: "thermometer" as const, color: "#8B5CF6", bg: "#EDE9FE", lastUpdated: "Oct 29, 2025", route: "/health-records/lab-results" },
  { id: "medications", label: "Medications", icon: "package" as const, color: "#3B82F6", bg: "#DBEAFE", lastUpdated: "Jun 2", route: null },
  { id: "procedures", label: "Procedures", icon: "file-text" as const, color: "#10B981", bg: "#D1FAE5", lastUpdated: "Oct 29, 2025", route: null },
  { id: "visits", label: "Visits", icon: "map-pin" as const, color: "#6366F1", bg: "#E0E7FF", lastUpdated: "Jun 19", route: "/health-records/visits" },
  { id: "vitals", label: "Vitals", icon: "activity" as const, color: "#EF4444", bg: "#FEE2E2", lastUpdated: "Jun 19", route: null },
];

export default function EmrAccessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { connectedSystems, removeSystem } = useHealthRecords();

  const hasConnected = connectedSystems.length > 0;

  if (!hasConnected) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyWrap, { paddingBottom: insets.bottom + 40 }]}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.secondary }]}>
            <Feather name="activity" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Connect Your Health Records
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
            Link your hospital, clinic, pharmacy, or provider to view your medical records — all in one place.
          </Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/health-records/add-method" as never)}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={18} color="#fff" />
            <Text style={styles.addBtnText}>Add Health System</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.bannerContent}>
            <Text style={[styles.bannerTitle, { color: colors.foreground }]}>
              Schedule a Blood Pressure Check
            </Text>
            <Text style={[styles.bannerDesc, { color: colors.mutedForeground }]}>
              Knowing your numbers is important for managing hypertension
            </Text>
          </View>
          <View style={[styles.bannerImage, { backgroundColor: colors.secondary }]}>
            <Feather name="heart" size={28} color={colors.primary} />
          </View>
        </View>

        {/* Record categories grid */}
        <View style={styles.grid}>
          {RECORD_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={cat.route ? 0.75 : 1}
              onPress={cat.route ? () => router.push(cat.route as never) : undefined}
            >
              <View style={styles.cardTopRow}>
                <View style={[styles.cardIcon, { backgroundColor: cat.bg }]}>
                  <Feather name={cat.icon} size={20} color={cat.color} />
                </View>
                <View style={styles.dot} />
              </View>
              <Text style={[styles.cardLabel, { color: colors.foreground }]}>{cat.label}</Text>
              <Text style={[styles.cardUpdated, { color: colors.mutedForeground }]}>
                Last updated: {cat.lastUpdated}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* My health systems */}
        <View style={styles.systemsSection}>
          <Text style={[styles.systemsTitle, { color: colors.mutedForeground }]}>My health systems</Text>

          {connectedSystems.map((sys) => (
            <View
              key={sys.id}
              style={[styles.systemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.systemLogo, { backgroundColor: colors.secondary }]}>
                <Feather name="activity" size={20} color={colors.primary} />
              </View>
              <View style={styles.systemInfo}>
                <Text style={[styles.systemName, { color: colors.foreground }]} numberOfLines={1}>
                  {sys.name}
                </Text>
                <Text style={[styles.systemStatus, { color: "#22C55E" }]}>Connected</Text>
                <Text style={[styles.systemSync, { color: colors.mutedForeground }]}>
                  Last synced: {sys.lastSynced}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeSystem(sys.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.addAnotherBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => router.push("/health-records/add-method" as never)}
            activeOpacity={0.75}
          >
            <View style={[styles.addAnotherIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="plus" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.addAnotherText, { color: colors.foreground }]}>Add health system</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 24, fontWeight: "800", textAlign: "center" },
  emptyDesc: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  addBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },

  banner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bannerContent: { flex: 1, gap: 4 },
  bannerTitle: { fontSize: 16, fontWeight: "700", lineHeight: 22 },
  bannerDesc: { fontSize: 13, lineHeight: 18 },
  bannerImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F97316",
  },
  cardLabel: { fontSize: 15, fontWeight: "700" },
  cardUpdated: { fontSize: 12, lineHeight: 16 },

  systemsSection: { gap: 10 },
  systemsTitle: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  systemCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  systemLogo: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  systemInfo: { flex: 1, gap: 2 },
  systemName: { fontSize: 14, fontWeight: "600" },
  systemStatus: { fontSize: 13, fontWeight: "600" },
  systemSync: { fontSize: 12 },
  addAnotherBtn: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  addAnotherIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addAnotherText: { fontSize: 15, fontWeight: "600" },
});
