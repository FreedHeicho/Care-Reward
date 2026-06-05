import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ClaimCard } from "@/components/ClaimCard";
import { MOCK_CLAIMS, MOCK_USER_PLAN } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

type StatusFilter = "all" | "processed" | "pending" | "in-review";

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "processed", label: "Processed" },
  { key: "pending", label: "Pending" },
  { key: "in-review", label: "In Review" },
];

export default function ClaimsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered =
    statusFilter === "all"
      ? MOCK_CLAIMS
      : MOCK_CLAIMS.filter((c) => c.status === statusFilter);

  const deductiblePct = (MOCK_USER_PLAN.deductibleMet / MOCK_USER_PLAN.deductible) * 100;
  const oopPct = (MOCK_USER_PLAN.oopMet / MOCK_USER_PLAN.oopMax) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ClaimCard claim={item} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={[styles.benefitsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.benefitsTitle, { color: colors.foreground }]}>
                Benefits Progress
              </Text>
              <Text style={[styles.planName, { color: colors.mutedForeground }]}>
                {MOCK_USER_PLAN.planName}
              </Text>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: colors.foreground }]}>Deductible</Text>
                  <Text style={[styles.progressValues, { color: colors.mutedForeground }]}>
                    ${MOCK_USER_PLAN.deductibleMet.toLocaleString()} of ${MOCK_USER_PLAN.deductible.toLocaleString()}
                  </Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: colors.primary, width: `${Math.min(deductiblePct, 100)}%` as any },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: colors.foreground }]}>Out-of-Pocket Max</Text>
                  <Text style={[styles.progressValues, { color: colors.mutedForeground }]}>
                    ${MOCK_USER_PLAN.oopMet.toLocaleString()} of ${MOCK_USER_PLAN.oopMax.toLocaleString()}
                  </Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: colors.accent, width: `${Math.min(oopPct, 100)}%` as any },
                    ]}
                  />
                </View>
              </View>
            </View>

            <FlatList
              horizontal
              data={STATUS_FILTERS}
              keyExtractor={(f) => f.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
              renderItem={({ item: f }) => (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: statusFilter === f.key ? colors.primary : colors.card,
                      borderColor: statusFilter === f.key ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setStatusFilter(f.key)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: statusFilter === f.key ? "#fff" : colors.foreground },
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {filtered.length === 0 && (
              <View style={styles.empty}>
                <Feather name="file-text" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  No claims found
                </Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No {statusFilter} claims at this time
                </Text>
              </View>
            )}
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { gap: 0 },
  benefitsCard: {
    margin: 16,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 14,
  },
  benefitsTitle: { fontSize: 17, fontWeight: "700" },
  planName: { fontSize: 13, marginTop: -8 },
  progressSection: { gap: 8 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 14, fontWeight: "500" },
  progressValues: { fontSize: 13 },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  filters: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterText: { fontSize: 13, fontWeight: "600" },
  list: { paddingHorizontal: 16, gap: 10 },
  empty: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center" },
});
