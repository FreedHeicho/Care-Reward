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

import { OpportunityCard } from "@/components/OpportunityCard";
import {
  CATEGORY_LABELS,
  MOCK_OPPORTUNITIES,
  OpportunityCategory,
} from "@/constants/data";
import { useColors } from "@/hooks/useColors";

type Filter = "all" | OpportunityCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "medication", label: CATEGORY_LABELS.medication },
  { key: "preventive", label: CATEGORY_LABELS.preventive },
  { key: "mail-delivery", label: CATEGORY_LABELS["mail-delivery"] },
  { key: "specialist", label: CATEGORY_LABELS.specialist },
];

export default function OpportunitiesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered =
    filter === "all"
      ? MOCK_OPPORTUNITIES
      : MOCK_OPPORTUNITIES.filter((o) => o.category === filter);

  const totalSavings = filtered.reduce((s, o) => s + o.savings, 0);
  const totalPoints = filtered.reduce((s, o) => s + o.points, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OpportunityCard opportunity={item} />}
        ListHeaderComponent={
          <View>
            <View style={[styles.summaryRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.accent }]}>
                  ${totalSavings}/mo
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                  Available savings
                </Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.rewards }]}>
                  {totalPoints.toLocaleString()} pts
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                  Available points
                </Text>
              </View>
            </View>

            <View style={styles.filtersWrapper}>
              <FlatList
                horizontal
                data={FILTERS}
                keyExtractor={(f) => f.key}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filters}
                renderItem={({ item: f }) => (
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: filter === f.key ? colors.primary : colors.card,
                        borderColor: filter === f.key ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setFilter(f.key)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        { color: filter === f.key ? "#fff" : colors.foreground },
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {filtered.length === 0 && (
              <View style={styles.empty}>
                <Feather name="check-circle" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  No opportunities here
                </Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  You've completed all opportunities in this category
                </Text>
              </View>
            )}
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryRow: {
    flexDirection: "row",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  summaryItem: { flex: 1, alignItems: "center", paddingVertical: 16 },
  summaryValue: { fontSize: 22, fontWeight: "800" },
  summaryLabel: { fontSize: 12, marginTop: 2 },
  summaryDivider: { width: 1 },
  filtersWrapper: { marginTop: 16 },
  filters: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterText: { fontSize: 13, fontWeight: "600" },
  list: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  separator: { height: 0 },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center", maxWidth: 260 },
});
