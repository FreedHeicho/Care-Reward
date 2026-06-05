import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Claim, ClaimStatus } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

interface Props {
  claim: Claim;
  compact?: boolean;
}

const STATUS_CONFIG: Record<ClaimStatus, { label: string; color: string; bg: string }> = {
  processed: { label: "Processed", color: "#10B981", bg: "#D1FAE5" },
  pending: { label: "Pending", color: "#F59E0B", bg: "#FEF3C7" },
  "in-review": { label: "In Review", color: "#0EA5E9", bg: "#E0F2FE" },
};

export function ClaimCard({ claim, compact }: Props) {
  const colors = useColors();
  const router = useRouter();
  const statusCfg = STATUS_CONFIG[claim.status];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/claim/${claim.id}` as never)}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={[styles.provider, { color: colors.foreground }]} numberOfLines={1}>
            {claim.provider}
          </Text>
          <View style={styles.meta}>
            <Text style={[styles.type, { color: colors.mutedForeground }]}>{claim.type}</Text>
            <Text style={[styles.dot, { color: colors.mutedForeground }]}>·</Text>
            <Text style={[styles.date, { color: colors.mutedForeground }]}>{claim.date}</Text>
          </View>
        </View>
        <View style={styles.right}>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={styles.chevron} />
        </View>
      </View>

      {!compact && (
        <View style={[styles.amounts, { borderTopColor: colors.border }]}>
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>Billed</Text>
            <Text style={[styles.amountValue, { color: colors.foreground }]}>
              ${claim.billed.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>Insurance Paid</Text>
            <Text style={[styles.amountValue, { color: colors.foreground }]}>
              ${claim.insurancePaid.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>You Owe</Text>
            <Text
              style={[
                styles.amountValue,
                { color: claim.patientResponsibility > 0 ? "#EF4444" : colors.accent },
              ]}
            >
              ${claim.patientResponsibility.toLocaleString()}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  left: {
    flex: 1,
    gap: 4,
  },
  right: {
    alignItems: "flex-end",
    gap: 4,
  },
  provider: {
    fontSize: 15,
    fontWeight: "600",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  type: {
    fontSize: 13,
  },
  dot: {
    fontSize: 13,
  },
  date: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  chevron: {
    marginTop: 2,
  },
  amounts: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  amountItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  amountLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  amountValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  divider: {
    width: 1,
    marginHorizontal: 4,
  },
});
