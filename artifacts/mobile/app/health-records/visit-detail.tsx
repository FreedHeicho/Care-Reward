import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
import { MOCK_VISITS } from "./visits";

function DetailRow({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

export default function VisitDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { visitId } = useLocalSearchParams<{ visitId: string }>();
  const { connectedSystems } = useHealthRecords();

  const visit = MOCK_VISITS.find((v) => v.id === visitId);
  const institutionName =
    connectedSystems.length > 0
      ? (connectedSystems[(visit?.systemIndex ?? 0) % connectedSystems.length]?.name ?? connectedSystems[0].name)
      : "Unknown Institution";

  if (!visit) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "Visit Detail", headerBackTitle: "Back" }} />
        <View style={styles.notFound}>
          <Text style={{ color: colors.mutedForeground }}>Visit not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "Visit Detail", headerBackTitle: "Back" }} />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header card */}
        <View style={[styles.headerCard, { backgroundColor: colors.primary }]}>
          <View style={styles.headerIcon}>
            <Feather name="calendar" size={28} color="#fff" />
          </View>
          <Text style={styles.headerType}>{visit.type}</Text>
          <Text style={styles.headerDate}>{visit.dateLabel}</Text>
        </View>

        {/* Details */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>VISIT INFORMATION</Text>
          <DetailRow label="Date" value={visit.dateLabel} colors={colors} />
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <DetailRow label="Type" value={visit.type} colors={colors} />
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <DetailRow label="Attending Physician" value={visit.provider} colors={colors} />
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <DetailRow label="Institution" value={institutionName} colors={colors} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>CLINICAL DETAILS</Text>
          <DetailRow label="Reason for Visit" value={visit.reason} colors={colors} />
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <DetailRow label="Diagnosis" value={visit.diagnosis} colors={colors} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>NOTES & FOLLOW-UP</Text>
          <View style={styles.notesBlock}>
            <Text style={[styles.notesLabel, { color: colors.mutedForeground }]}>Clinical Notes</Text>
            <Text style={[styles.notesText, { color: colors.foreground }]}>{visit.notes}</Text>
          </View>
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <View style={styles.notesBlock}>
            <Text style={[styles.notesLabel, { color: colors.mutedForeground }]}>Follow-Up Instructions</Text>
            <Text style={[styles.notesText, { color: colors.foreground }]}>{visit.followUp}</Text>
          </View>
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
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  headerType: { color: "#fff", fontSize: 18, fontWeight: "800", textAlign: "center" },
  headerDate: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
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
  notesBlock: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  notesLabel: { fontSize: 12, fontWeight: "500" },
  notesText: { fontSize: 14, lineHeight: 21 },
});
