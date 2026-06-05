import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MOCK_CLAIMS } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const STATUS_CONFIG = {
  processed: { label: "Processed", color: "#10B981", icon: "check-circle" as const },
  pending: { label: "Pending Review", color: "#F59E0B", icon: "clock" as const },
  "in-review": { label: "In Review", color: "#0EA5E9", icon: "search" as const },
};

export default function ClaimDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const claim = MOCK_CLAIMS.find((c) => c.id === id);

  if (!claim) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Claim not found</Text>
      </View>
    );
  }

  const statusCfg = STATUS_CONFIG[claim.status];
  const covered = claim.billed - claim.patientResponsibility;
  const coveredPct = claim.billed > 0 ? Math.round((covered / claim.billed) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.statusRow, { backgroundColor: statusCfg.color + "20" }]}>
            <Feather name={statusCfg.icon} size={16} color={statusCfg.color} />
            <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>

          <Text style={[styles.provider, { color: colors.foreground }]}>{claim.provider}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{claim.type}</Text>
            <Text style={[styles.dot, { color: colors.mutedForeground }]}>·</Text>
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{claim.date}</Text>
          </View>
          <Text style={[styles.claimNumber, { color: colors.mutedForeground }]}>
            #{claim.claimNumber}
          </Text>
        </View>

        <View style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Cost Breakdown</Text>

          {[
            { label: "Amount Billed", value: claim.billed, color: colors.foreground },
            { label: "Insurance Paid", value: claim.insurancePaid, color: colors.accent },
            { label: "Your Responsibility", value: claim.patientResponsibility, color: claim.patientResponsibility > 0 ? "#EF4444" : colors.accent },
          ].map((row) => (
            <View key={row.label} style={[styles.costRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.costLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text style={[styles.costValue, { color: row.color }]}>
                ${row.value.toLocaleString()}
              </Text>
            </View>
          ))}

          <View style={styles.coverageSection}>
            <View style={styles.coverageHeader}>
              <Text style={[styles.coverageLabel, { color: colors.foreground }]}>Plan Coverage</Text>
              <Text style={[styles.coveragePct, { color: colors.primary }]}>{coveredPct}%</Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: colors.primary, width: `${coveredPct}%` as any },
                ]}
              />
            </View>
            <Text style={[styles.coverageNote, { color: colors.mutedForeground }]}>
              Your plan covered ${covered.toLocaleString()} of the ${claim.billed.toLocaleString()} total
            </Text>
          </View>
        </View>

        <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Claim Timeline</Text>
          {[
            { label: "Claim Received", date: claim.date, done: true },
            { label: "Under Review", date: claim.status !== "pending" ? claim.date : "Pending", done: claim.status !== "pending" },
            { label: "Processed", date: claim.status === "processed" ? claim.date : "Pending", done: claim.status === "processed" },
          ].map((step, i) => (
            <View key={i} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineDot,
                    { backgroundColor: step.done ? colors.accent : colors.border },
                  ]}
                >
                  {step.done && <Feather name="check" size={10} color="#fff" />}
                </View>
                {i < 2 && (
                  <View style={[styles.timelineLine, { backgroundColor: step.done ? colors.accent : colors.border }]} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineLabel, { color: colors.foreground }]}>{step.label}</Text>
                <Text style={[styles.timelineDate, { color: colors.mutedForeground }]}>{step.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { padding: 16, gap: 14 },
  headerCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: { fontSize: 13, fontWeight: "700" },
  provider: { fontSize: 22, fontWeight: "800", lineHeight: 28 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 14 },
  dot: { fontSize: 14 },
  claimNumber: { fontSize: 13, fontFamily: "monospace" },
  breakdownCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  costLabel: { fontSize: 15 },
  costValue: { fontSize: 16, fontWeight: "700" },
  coverageSection: { gap: 8 },
  coverageHeader: { flexDirection: "row", justifyContent: "space-between" },
  coverageLabel: { fontSize: 15, fontWeight: "500" },
  coveragePct: { fontSize: 15, fontWeight: "700" },
  progressTrack: { height: 10, borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5 },
  coverageNote: { fontSize: 13, lineHeight: 18 },
  timelineCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 0,
  },
  timelineRow: { flexDirection: "row", gap: 14, paddingBottom: 0 },
  timelineLeft: { alignItems: "center", width: 24 },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  timelineLine: { width: 2, flex: 1, minHeight: 20 },
  timelineContent: { flex: 1, paddingBottom: 16, paddingTop: 12 },
  timelineLabel: { fontSize: 15, fontWeight: "600" },
  timelineDate: { fontSize: 13, marginTop: 2 },
});
