import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { CATEGORY_COLORS, CATEGORY_LABELS, Opportunity } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

interface Props {
  opportunity: Opportunity;
  compact?: boolean;
}

export function OpportunityCard({ opportunity, compact }: Props) {
  const colors = useColors();
  const router = useRouter();
  const categoryColor = CATEGORY_COLORS[opportunity.category];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/opportunity/${opportunity.id}` as never)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor + "20" }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>
            {CATEGORY_LABELS[opportunity.category]}
          </Text>
        </View>
        {opportunity.priority === "high" && (
          <View style={[styles.priorityDot, { backgroundColor: "#EF4444" }]} />
        )}
      </View>

      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
        {opportunity.title}
      </Text>

      {!compact && (
        <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
          {opportunity.description}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.metric}>
          <Feather name="dollar-sign" size={14} color={colors.accent} />
          <Text style={[styles.metricValue, { color: colors.accent }]}>
            ${opportunity.savings}/mo
          </Text>
        </View>
        <View style={styles.metric}>
          <Feather name="star" size={14} color={colors.rewards} />
          <Text style={[styles.metricValue, { color: colors.rewards }]}>
            +{opportunity.points} pts
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "600",
  },
});
