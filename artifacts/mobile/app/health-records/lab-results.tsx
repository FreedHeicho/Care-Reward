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

export interface LabResult {
  id: string;
  name: string;
  value: string;
  unit: string;
  date: string;
  dot: boolean;
  refRange: string;
  status: "normal" | "high" | "low" | "unknown";
  orderingPhysician: string;
  systemIndex: number;
}

export const MOCK_LAB_RESULTS: LabResult[] = [
  { id: "lab-1", name: "AHI NONSUPINE", value: "6", unit: "", date: "Feb 7, 2024", dot: true, refRange: "< 5", status: "high", orderingPhysician: "BRIAN C SHEN MD", systemIndex: 0 },
  { id: "lab-2", name: "AHI SUPINE", value: "5.5", unit: "", date: "Feb 7, 2024", dot: true, refRange: "< 5", status: "high", orderingPhysician: "BRIAN C SHEN MD", systemIndex: 0 },
  { id: "lab-3", name: "AHI/REI", value: "5.6", unit: "", date: "Feb 7, 2024", dot: true, refRange: "< 5", status: "high", orderingPhysician: "BRIAN C SHEN MD", systemIndex: 0 },
  { id: "lab-4", name: "ALBUMIN, URINE", value: "1.2", unit: "mg/dL", date: "Aug 14, 2025", dot: true, refRange: "< 3.0 mg/dL", status: "normal", orderingPhysician: "BRIAN C SHEN MD", systemIndex: 0 },
  { id: "lab-5", name: "ALBUMIN/CREATININE RATIO, UR", value: "24", unit: "mg/g creat", date: "Aug 14, 2025", dot: true, refRange: "< 30 mg/g", status: "normal", orderingPhysician: "BRIAN C SHEN MD", systemIndex: 0 },
  { id: "lab-6", name: "ALKALINE PHOSPHATASE", value: "52", unit: "U/L", date: "Aug 14, 2025", dot: true, refRange: "44–147 U/L", status: "normal", orderingPhysician: "BRIAN C SHEN MD", systemIndex: 0 },
  { id: "lab-7", name: "ALT", value: "13", unit: "U/L", date: "Aug 14, 2025", dot: true, refRange: "7–56 U/L", status: "normal", orderingPhysician: "BRIAN C SHEN MD", systemIndex: 0 },
  { id: "lab-8", name: "AMYLASE", value: "45", unit: "U/L", date: "Aug 14, 2025", dot: false, refRange: "28–100 U/L", status: "normal", orderingPhysician: "BRIAN C SHEN MD", systemIndex: 0 },
  { id: "lab-9", name: "BILIRUBIN, TOTAL", value: "0.8", unit: "mg/dL", date: "Aug 14, 2025", dot: false, refRange: "0.2–1.2 mg/dL", status: "normal", orderingPhysician: "BRIAN C SHEN MD", systemIndex: 0 },
  { id: "lab-10", name: "BUN (BLOOD UREA NITROGEN)", value: "14", unit: "mg/dL", date: "Aug 14, 2025", dot: false, refRange: "7–20 mg/dL", status: "normal", orderingPhysician: "BRIAN C SHEN MD", systemIndex: 0 },
  { id: "lab-11", name: "CALCIUM", value: "9.2", unit: "mg/dL", date: "Aug 14, 2025", dot: false, refRange: "8.5–10.2 mg/dL", status: "normal", orderingPhysician: "BRIAN C SHEN MD", systemIndex: 0 },
  { id: "lab-12", name: "CHOLESTEROL", value: "182", unit: "mg/dL", date: "Aug 14, 2025", dot: false, refRange: "< 200 mg/dL", status: "normal", orderingPhysician: "BRIAN C SHEN MD", systemIndex: 0 },
  { id: "lab-13", name: "CREATININE", value: "0.9", unit: "mg/dL", date: "Aug 14, 2025", dot: false, refRange: "0.6–1.2 mg/dL", status: "normal", orderingPhysician: "BRIAN C SHEN MD", systemIndex: 0 },
  { id: "lab-14", name: "GLUCOSE", value: "92", unit: "mg/dL", date: "Aug 14, 2025", dot: false, refRange: "70–99 mg/dL", status: "normal", orderingPhysician: "BRIAN C SHEN MD", systemIndex: 0 },
  { id: "lab-15", name: "HDL CHOLESTEROL", value: "58", unit: "mg/dL", date: "Aug 14, 2025", dot: false, refRange: "> 40 mg/dL", status: "normal", orderingPhysician: "BRIAN C SHEN MD", systemIndex: 0 },
  { id: "lab-16", name: "HEMOGLOBIN A1C", value: "5.4", unit: "%", date: "Aug 14, 2025", dot: false, refRange: "< 5.7%", status: "normal", orderingPhysician: "BRIAN C SHEN MD", systemIndex: 0 },
  { id: "lab-17", name: "LDL CHOLESTEROL", value: "108", unit: "mg/dL", date: "Aug 14, 2025", dot: false, refRange: "< 130 mg/dL", status: "normal", orderingPhysician: "BRIAN C SHEN MD", systemIndex: 0 },
  { id: "lab-18", name: "TSH", value: "2.1", unit: "mIU/L", date: "Mar 3, 2025", dot: false, refRange: "0.4–4.0 mIU/L", status: "normal", orderingPhysician: "BRIAN C SHEN MD", systemIndex: 0 },
];

export default function LabResultsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { connectedSystems } = useHealthRecords();
  const hasConnected = connectedSystems.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "Lab results", headerBackTitle: "Back" }} />

      {!hasConnected ? (
        <View style={[styles.emptyWrap, { paddingBottom: insets.bottom + 40 }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="thermometer" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Records Found</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
            Connect a health system to view your Lab Results.
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
              <Text style={[styles.sortLabel, { color: colors.mutedForeground }]}>Name</Text>
              <Text style={[styles.sortSep, { color: colors.border }]}>|</Text>
              <Feather name="arrow-up" size={14} color={colors.mutedForeground} />
            </View>
          </View>

          {/* Records list */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {MOCK_LAB_RESULTS.map((lab, idx) => (
              <View key={lab.id}>
                <TouchableOpacity
                  style={styles.row}
                  onPress={() =>
                    router.push({
                      pathname: "/health-records/lab-result-detail",
                      params: { labId: lab.id },
                    } as never)
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.rowLeft}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.itemName, { color: colors.foreground }]}>{lab.name}</Text>
                      {lab.dot && <View style={styles.dot} />}
                    </View>
                    {(lab.value || lab.unit) && (
                      <Text style={[styles.itemValue, { color: colors.foreground }]}>
                        {lab.value}{lab.unit ? ` ${lab.unit}` : ""}
                      </Text>
                    )}
                    <Text style={[styles.itemDate, { color: colors.mutedForeground }]}>
                      Last measured: {lab.date}
                    </Text>
                  </View>
                  <Feather name="bar-chart-2" size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
                {idx < MOCK_LAB_RESULTS.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
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

  card: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowLeft: { flex: 1, gap: 3 },
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    lineHeight: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F97316",
    marginTop: 4,
    flexShrink: 0,
  },
  itemValue: { fontSize: 14, fontWeight: "500" },
  itemDate: { fontSize: 13 },
  divider: { height: 1 },
});
