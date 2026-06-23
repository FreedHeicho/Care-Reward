import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
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

export interface VisitRecord {
  id: string;
  dateLabel: string;
  dateSort: number;
  type: string;
  provider: string;
  dot: boolean;
  reason: string;
  diagnosis: string;
  notes: string;
  followUp: string;
  systemIndex: number;
}

export const MOCK_VISITS: VisitRecord[] = [
  {
    id: "vis-1",
    dateLabel: "Jun 9",
    dateSort: 20260609,
    type: "Appointment - Office Visit",
    provider: "BRIAN C SHEN MD and 2 other practitioners",
    dot: true,
    reason: "Routine follow-up and blood pressure monitoring",
    diagnosis: "Essential hypertension, well-controlled",
    notes: "Patient reports BP stable at home. Medication continues at current dose. No adverse effects noted.",
    followUp: "Return in 3 months or sooner if BP readings exceed 140/90.",
    systemIndex: 0,
  },
  {
    id: "vis-2",
    dateLabel: "Aug 22, 2025",
    dateSort: 20250822,
    type: "Support OP Encounter - Patient Outreach",
    provider: "BRIAN C SHEN MD",
    dot: true,
    reason: "Telephone outreach for medication adherence check",
    diagnosis: "Medication management follow-up",
    notes: "Patient confirmed taking all medications as prescribed. Refill authorized for 90-day supply.",
    followUp: "No in-person visit required. Next scheduled appointment in October.",
    systemIndex: 0,
  },
  {
    id: "vis-3",
    dateLabel: "Aug 14, 2025",
    dateSort: 20250814,
    type: "Appointment - Office Visit",
    provider: "BRIAN C SHEN MD and 2 other practitioners",
    dot: false,
    reason: "Annual lab review and physical",
    diagnosis: "Hyperlipidemia, borderline. Otherwise healthy.",
    notes: "Labs reviewed in detail. Dietary counseling provided. Statin therapy discussed but deferred.",
    followUp: "Repeat lipid panel in 6 months. Diet diary requested.",
    systemIndex: 0,
  },
  {
    id: "vis-4",
    dateLabel: "Apr 29, 2024",
    dateSort: 20240429,
    type: "Appointment - Telemedicine",
    provider: "BRIAN C SHEN MD and 2 other practitioners",
    dot: true,
    reason: "Cough and fatigue — 5-day duration",
    diagnosis: "Acute upper respiratory infection, viral",
    notes: "Telehealth visit. No antibiotics indicated. Rest and fluids recommended. OTC decongestant approved.",
    followUp: "Return if symptoms worsen or fever develops above 38.5°C.",
    systemIndex: 0,
  },
  {
    id: "vis-5",
    dateLabel: "Feb 7, 2024",
    dateSort: 20240207,
    type: "Appointment - Office Visit",
    provider: "BRIAN C SHEN MD and 2 other practitioners",
    dot: false,
    reason: "Sleep study results review",
    diagnosis: "Mild obstructive sleep apnea (AHI 5.6)",
    notes: "Sleep study results reviewed. AHI within mild range. Positional therapy discussed as first-line treatment.",
    followUp: "Trial positional therapy for 4 weeks. Return to review compliance.",
    systemIndex: 0,
  },
  {
    id: "vis-6",
    dateLabel: "Oct 15, 2023",
    dateSort: 20231015,
    type: "Annual Physical Exam",
    provider: "DR. SARAH JOHNSON MD",
    dot: true,
    reason: "Annual preventive wellness visit",
    diagnosis: "Health maintenance. No acute findings.",
    notes: "Comprehensive physical completed. All vitals normal. Immunizations reviewed and updated.",
    followUp: "Next annual physical in October 2024.",
    systemIndex: 0,
  },
  {
    id: "vis-7",
    dateLabel: "Jul 3, 2023",
    dateSort: 20230703,
    type: "Urgent Care Visit",
    provider: "DR. MICHAEL CHEN MD",
    dot: false,
    reason: "Acute left knee pain after exercise",
    diagnosis: "Patellofemoral syndrome",
    notes: "X-ray taken, no fracture. Ice, rest, and NSAIDs recommended. Referred to physical therapy.",
    followUp: "PT evaluation within 2 weeks. Return if pain not improving.",
    systemIndex: 0,
  },
];

export default function VisitsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { connectedSystems } = useHealthRecords();
  const hasConnected = connectedSystems.length > 0;

  const institutionName = (idx: number) =>
    connectedSystems.length > 0
      ? (connectedSystems[idx % connectedSystems.length]?.name ?? connectedSystems[0].name)
      : "";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "Visits", headerBackTitle: "Back" }} />

      {!hasConnected ? (
        <View style={[styles.emptyWrap, { paddingBottom: insets.bottom + 40 }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="map-pin" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Records Found</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
            Connect a health system to view your Visits.
          </Text>
          <TouchableOpacity
            style={[styles.connectBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/health-records/add-method" as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.connectBtnText}>Connect Health System</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Sort bar */}
          <View style={[styles.sortBar, { borderBottomColor: colors.border }]}>
            <View style={styles.sortRight}>
              <Feather name="sliders" size={14} color={colors.mutedForeground} />
              <Text style={[styles.sortLabel, { color: colors.mutedForeground }]}>Date</Text>
              <Text style={[styles.sortSep, { color: colors.border }]}>|</Text>
              <Feather name="arrow-down" size={14} color={colors.mutedForeground} />
            </View>
          </View>

          <View style={styles.listWrap}>
            {MOCK_VISITS.map((visit) => (
              <View key={visit.id} style={styles.group}>
                {/* Date section header */}
                <View style={styles.groupHeader}>
                  <Text style={[styles.groupDate, { color: colors.foreground }]}>{visit.dateLabel}</Text>
                  <Text style={[styles.groupInstitution, { color: colors.mutedForeground }]}>
                    {institutionName(visit.systemIndex)}
                  </Text>
                </View>

                {/* Visit card */}
                <TouchableOpacity
                  style={[styles.visitCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() =>
                    router.push({
                      pathname: "/health-records/visit-detail",
                      params: { visitId: visit.id },
                    } as never)
                  }
                  activeOpacity={0.75}
                >
                  <View style={styles.visitCardContent}>
                    <View style={styles.visitNameRow}>
                      <Text style={[styles.visitType, { color: colors.foreground }]}>{visit.type}</Text>
                      {visit.dot && <View style={styles.dot} />}
                    </View>
                    <Text style={[styles.visitProvider, { color: colors.mutedForeground }]}>
                      {visit.provider}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
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
    gap: 14,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  emptyDesc: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  connectBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 4,
  },
  connectBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  scroll: { gap: 0 },
  sortBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sortRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  sortLabel: { fontSize: 13, fontWeight: "500" },
  sortSep: { fontSize: 13, marginHorizontal: 2 },

  listWrap: { paddingHorizontal: 12, paddingTop: 12, gap: 16 },
  group: { gap: 8 },
  groupHeader: { paddingLeft: 4, gap: 2 },
  groupDate: { fontSize: 17, fontWeight: "700" },
  groupInstitution: { fontSize: 13 },
  visitCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  visitCardContent: { gap: 4 },
  visitNameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  visitType: { fontSize: 15, fontWeight: "700", flex: 1 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F97316",
    marginTop: 4,
    flexShrink: 0,
  },
  visitProvider: { fontSize: 13 },
});
