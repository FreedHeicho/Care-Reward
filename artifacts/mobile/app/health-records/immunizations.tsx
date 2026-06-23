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

const MOCK_IMMUNIZATIONS = [
  { id: "imm-1", name: "COVID-19 mRNA LNP-S PF 12yrs-Adult (PFizer-BioNTech,TRIS),External Administration", date: "Dec 8, 2021", dot: true },
  { id: "imm-2", name: "COVID-19 mRNA LNP-S, PF, (2023-2024) 12YRS-Adult(Pfizer), 30mcg/0.3mL", date: "Feb 6, 2024", dot: true },
  { id: "imm-3", name: "INF (Influenza) unspecified formulation", date: "Oct 31, 2022", dot: true },
  { id: "imm-4", name: "INFS Pres Free 6mos-Adult (Flulaval Quadrivalent) (Influenza)", date: "Nov 3, 2019", dot: true },
  { id: "imm-5", name: "INFS Pres Free 6mos-Adult (Flulaval Quadrivalent) (Influenza)", date: "Mar 21, 2022", dot: true },
  { id: "imm-6", name: "INFS Pres Free 6mos-Adult (Flulaval Quadrivalent) (Influenza)", date: "Oct 31, 2022", dot: true },
  { id: "imm-7", name: "INFS pres free 6mos-adult (Fluzone quadrivalent) (influenza)", date: "Jul 15, 2023", dot: true },
  { id: "imm-8", name: "Tdap (Tetanus, Diphtheria, Pertussis)", date: "Sep 5, 2020", dot: false },
  { id: "imm-9", name: "Zoster (Shingrix) Dose 1", date: "Jan 12, 2022", dot: true },
  { id: "imm-10", name: "Zoster (Shingrix) Dose 2", date: "Mar 8, 2022", dot: false },
];

export default function ImmunizationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { connectedSystems } = useHealthRecords();
  const hasConnected = connectedSystems.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "Immunizations", headerBackTitle: "Back" }} />

      {!hasConnected ? (
        <View style={[styles.emptyWrap, { paddingBottom: insets.bottom + 40 }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="shield" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Records Found</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
            Connect a health system to view your Immunizations.
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
            {MOCK_IMMUNIZATIONS.map((item, idx) => (
              <View key={item.id}>
                <View style={styles.row}>
                  <View style={styles.rowContent}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text>
                      {item.dot && <View style={styles.dot} />}
                    </View>
                    <Text style={[styles.itemDate, { color: colors.mutedForeground }]}>
                      Last administered: {item.date}
                    </Text>
                  </View>
                </View>
                {idx < MOCK_IMMUNIZATIONS.length - 1 && (
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

  scroll: { paddingHorizontal: 0, gap: 0 },
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
  },
  rowContent: { gap: 4 },
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    lineHeight: 22,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F97316",
    marginTop: 5,
    flexShrink: 0,
  },
  itemDate: { fontSize: 13 },
  divider: { height: 1, marginHorizontal: 0 },
});
