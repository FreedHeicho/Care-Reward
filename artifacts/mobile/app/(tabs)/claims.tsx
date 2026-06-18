import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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
import { Claim, MOCK_CLAIMS, MOCK_USER_PLAN } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

type StatusFilter = "all" | "processed" | "pending" | "in-review";

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "processed", label: "Processed" },
  { key: "pending", label: "Pending" },
  { key: "in-review", label: "In Review" },
];

export default function SpendScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const listRef = useRef<FlatList<Claim>>(null);

  const filtered =
    statusFilter === "all"
      ? MOCK_CLAIMS
      : MOCK_CLAIMS.filter((c) => c.status === statusFilter);

  const deductiblePct = (MOCK_USER_PLAN.deductibleMet / MOCK_USER_PLAN.deductible) * 100;
  const oopPct = (MOCK_USER_PLAN.oopMet / MOCK_USER_PLAN.oopMax) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={listRef}
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ClaimCard claim={item} />}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Your Benefits card — compressed */}
            <View style={[styles.benefitsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.benefitsHeaderRow}>
                <Text style={[styles.benefitsTitle, { color: colors.foreground }]}>
                  Your Benefits
                </Text>
                <Text style={[styles.planName, { color: colors.mutedForeground }]}>
                  {MOCK_USER_PLAN.planName}
                </Text>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: colors.foreground }]}>Deductible</Text>
                  <Text style={[styles.progressValues, { color: colors.mutedForeground }]}>
                    ${MOCK_USER_PLAN.deductibleMet.toLocaleString()} / ${MOCK_USER_PLAN.deductible.toLocaleString()}
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
                    ${MOCK_USER_PLAN.oopMet.toLocaleString()} / ${MOCK_USER_PLAN.oopMax.toLocaleString()}
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

            {/* Quick actions — exactly two buttons */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  if (filtered.length > 0) {
                    listRef.current?.scrollToIndex({ index: 0, animated: true });
                  } else {
                    listRef.current?.scrollToOffset({ offset: 9999, animated: true });
                  }
                }}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: "#EDE9FE" }]}>
                  <Feather name="file-text" size={18} color="#7C3AED" />
                </View>
                <Text style={[styles.quickActionLabel, { color: colors.foreground }]}>
                  View Claims YTD
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push("/emr-access" as never)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: "#E8F5F2" }]}>
                  <Feather name="link" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.quickActionLabel, { color: colors.foreground }]}>
                  Connect to Health Records
                </Text>
              </TouchableOpacity>
            </View>

            {/* YTD Spending section */}
            <View style={[styles.ytdCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.ytdTitle, { color: colors.foreground }]}>YTD Spending</Text>
              <View style={styles.ytdPanels}>
                <View style={[styles.ytdPanel, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.ytdPanelLabel, { color: colors.mutedForeground }]}>Paid Amount</Text>
                  <Text style={[styles.ytdPanelValue, { color: colors.foreground }]}>$1,240</Text>
                </View>
                <View style={[styles.ytdPanel, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.ytdPanelLabel, { color: colors.mutedForeground }]}>Copay</Text>
                  <Text style={[styles.ytdPanelValue, { color: colors.foreground }]}>$340</Text>
                </View>
              </View>
            </View>

            {/* Status filters */}
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

  /* Benefits card — ~20% compressed vs original */
  benefitsCard: {
    margin: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    gap: 8,
  },
  benefitsHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 4,
  },
  benefitsTitle: { fontSize: 15, fontWeight: "700" },
  planName: { fontSize: 11 },
  progressSection: { gap: 5 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 12, fontWeight: "500" },
  progressValues: { fontSize: 11 },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },

  /* Quick actions */
  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  quickAction: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 8,
  },
  quickActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 16,
  },

  /* YTD Spending */
  ytdCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  ytdTitle: { fontSize: 15, fontWeight: "700" },
  ytdPanels: { flexDirection: "row", gap: 10 },
  ytdPanel: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 4,
    alignItems: "center",
  },
  ytdPanelLabel: { fontSize: 12, fontWeight: "500" },
  ytdPanelValue: { fontSize: 20, fontWeight: "700" },

  /* Filters */
  filters: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterText: { fontSize: 13, fontWeight: "600" },

  /* List */
  list: { paddingHorizontal: 16, gap: 10 },
  empty: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center" },
});
