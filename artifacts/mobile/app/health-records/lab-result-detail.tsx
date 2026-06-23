import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useHealthRecords } from "@/context/HealthRecordsContext";
import { MOCK_LAB_RESULTS } from "./lab-results";

const STATUS_CONFIG = {
  normal: { label: "Normal", color: "#10B981", bg: "#D1FAE5", icon: "check-circle" as const },
  high: { label: "High", color: "#EF4444", bg: "#FEE2E2", icon: "arrow-up" as const },
  low: { label: "Low", color: "#3B82F6", bg: "#DBEAFE", icon: "arrow-down" as const },
  unknown: { label: "Unknown", color: "#9CA3AF", bg: "#F3F4F6", icon: "help-circle" as const },
};

function DetailRow({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

export default function LabResultDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { labId } = useLocalSearchParams<{ labId: string }>();
  const { connectedSystems } = useHealthRecords();

  const lab = MOCK_LAB_RESULTS.find((l) => l.id === labId);
  const institutionName =
    connectedSystems.length > 0
      ? (connectedSystems[(lab?.systemIndex ?? 0) % connectedSystems.length]?.name ?? connectedSystems[0].name)
      : "Unknown Institution";

  if (!lab) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "Lab Result", headerBackTitle: "Back" }} />
        <View style={styles.notFound}>
          <Text style={{ color: colors.mutedForeground }}>Result not found.</Text>
        </View>
      </View>
    );
  }

  const statusCfg = STATUS_CONFIG[lab.status];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: lab.name, headerBackTitle: "Back" }} />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header card */}
        <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.testName, { color: colors.foreground }]}>{lab.name}</Text>
          <View style={styles.valueRow}>
            <Text style={[styles.resultValue, { color: colors.foreground }]}>{lab.value}</Text>
            {lab.unit ? (
              <Text style={[styles.resultUnit, { color: colors.mutedForeground }]}>{lab.unit}</Text>
            ) : null}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Feather name={statusCfg.icon} size={14} color={statusCfg.color} />
            <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
        </View>

        {/* Result details */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>RESULT DETAILS</Text>
          <DetailRow label="Test Name" value={lab.name} colors={colors} />
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <DetailRow label="Result Value" value={`${lab.value}${lab.unit ? " " + lab.unit : ""}`} colors={colors} />
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <DetailRow label="Reference Range" value={lab.refRange} colors={colors} />
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <DetailRow label="Result Status" value={statusCfg.label} colors={colors} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ORDER INFORMATION</Text>
          <DetailRow label="Date Measured" value={lab.date} colors={colors} />
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <DetailRow label="Ordering Physician" value={lab.orderingPhysician} colors={colors} />
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <DetailRow label="Institution" value={institutionName} colors={colors} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  headerCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  testName: { fontSize: 15, fontWeight: "700", textAlign: "center" },
  valueRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  resultValue: { fontSize: 42, fontWeight: "800" },
  resultUnit: { fontSize: 18 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  statusText: { fontSize: 14, fontWeight: "700" },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  detailRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 3,
  },
  detailLabel: { fontSize: 12, fontWeight: "500" },
  detailValue: { fontSize: 15, fontWeight: "500", lineHeight: 22 },
  rowDivider: { height: 1, marginHorizontal: 16 },
});
