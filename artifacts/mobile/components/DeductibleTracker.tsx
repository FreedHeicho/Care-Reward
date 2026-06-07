import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { MOCK_USER_PLAN } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

interface ProgressBarProps {
  value: number;
  max: number;
  color: string;
  trackColor: string;
}

function ProgressBar({ value, max, color, trackColor }: ProgressBarProps) {
  const pct = Math.min(value / max, 1);
  return (
    <View style={[styles.track, { backgroundColor: trackColor }]}>
      <View style={[styles.fill, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
      <View
        style={[
          styles.fillDot,
          {
            left: `${Math.max(pct * 100 - 1.5, 0)}%` as any,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

function formatDollars(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function getDeductibleAlert(pct: number): { text: string; color: string; icon: "alert-triangle" | "check-circle" | "info" } | null {
  if (pct >= 1)
    return {
      text: "Deductible met! Your plan now covers care at the coinsurance rate — a great time to schedule any elective procedures.",
      color: "#16A34A",
      icon: "check-circle",
    };
  if (pct >= 0.8)
    return {
      text: `You're ${Math.round(pct * 100)}% of the way to your deductible. Consider scheduling elective care now to maximize your benefits this year.`,
      color: "#D97706",
      icon: "alert-triangle",
    };
  if (pct >= 0.6)
    return {
      text: `Over halfway to your deductible. Timing non-urgent care before year-end could lower your out-of-pocket costs.`,
      color: "#2563EB",
      icon: "info",
    };
  return null;
}

export function DeductibleTracker() {
  const colors = useColors();
  const router = useRouter();

  const {
    deductible,
    deductibleMet,
    oopMax,
    oopMet,
  } = MOCK_USER_PLAN;

  const dedPct = deductibleMet / deductible;
  const oopPct = oopMet / oopMax;
  const alert = getDeductibleAlert(dedPct);

  const dedColor = dedPct >= 1 ? "#16A34A" : dedPct >= 0.8 ? "#D97706" : colors.primary;
  const oopColor = oopPct >= 0.8 ? "#DC2626" : oopPct >= 0.5 ? "#D97706" : "#2563EB";

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIcon, { backgroundColor: colors.primary + "18" }]}>
            <Feather name="shield" size={16} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Deductible Tracker</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(tabs)/claims" as never)}>
          <Text style={[styles.viewAll, { color: colors.primary }]}>View Claims →</Text>
        </TouchableOpacity>
      </View>

      {/* Two progress meters */}
      <View style={styles.metersRow}>
        {/* Deductible */}
        <View style={styles.meter}>
          <View style={styles.meterLabelRow}>
            <Text style={[styles.meterLabel, { color: colors.mutedForeground }]}>Annual Deductible</Text>
            <View style={[styles.pctBadge, { backgroundColor: dedColor + "18" }]}>
              <Text style={[styles.pctText, { color: dedColor }]}>{Math.round(dedPct * 100)}%</Text>
            </View>
          </View>
          <ProgressBar
            value={deductibleMet}
            max={deductible}
            color={dedColor}
            trackColor={dedColor + "20"}
          />
          <View style={styles.meterAmounts}>
            <Text style={[styles.metMoney, { color: dedColor }]}>{formatDollars(deductibleMet)} met</Text>
            <Text style={[styles.totalMoney, { color: colors.mutedForeground }]}>of {formatDollars(deductible)}</Text>
          </View>
          <View style={[styles.remainingChip, { backgroundColor: colors.muted }]}>
            <Feather name="minus-circle" size={11} color={colors.mutedForeground} />
            <Text style={[styles.remainingText, { color: colors.mutedForeground }]}>
              {formatDollars(Math.max(deductible - deductibleMet, 0))} remaining
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.vertDivider, { backgroundColor: colors.border }]} />

        {/* OOP Max */}
        <View style={styles.meter}>
          <View style={styles.meterLabelRow}>
            <Text style={[styles.meterLabel, { color: colors.mutedForeground }]}>Out-of-Pocket Max</Text>
            <View style={[styles.pctBadge, { backgroundColor: oopColor + "18" }]}>
              <Text style={[styles.pctText, { color: oopColor }]}>{Math.round(oopPct * 100)}%</Text>
            </View>
          </View>
          <ProgressBar
            value={oopMet}
            max={oopMax}
            color={oopColor}
            trackColor={oopColor + "20"}
          />
          <View style={styles.meterAmounts}>
            <Text style={[styles.metMoney, { color: oopColor }]}>{formatDollars(oopMet)} met</Text>
            <Text style={[styles.totalMoney, { color: colors.mutedForeground }]}>of {formatDollars(oopMax)}</Text>
          </View>
          <View style={[styles.remainingChip, { backgroundColor: colors.muted }]}>
            <Feather name="minus-circle" size={11} color={colors.mutedForeground} />
            <Text style={[styles.remainingText, { color: colors.mutedForeground }]}>
              {formatDollars(Math.max(oopMax - oopMet, 0))} remaining
            </Text>
          </View>
        </View>
      </View>

      {/* Smart alert */}
      {alert && (
        <View style={[styles.alert, { backgroundColor: alert.color + "12", borderLeftColor: alert.color }]}>
          <Feather name={alert.icon} size={14} color={alert.color} style={{ flexShrink: 0 }} />
          <Text style={[styles.alertText, { color: colors.foreground }]}>{alert.text}</Text>
        </View>
      )}

      {/* Year reset notice */}
      <View style={[styles.resetNotice, { borderTopColor: colors.border }]}>
        <Feather name="calendar" size={12} color={colors.mutedForeground} />
        <Text style={[styles.resetText, { color: colors.mutedForeground }]}>
          Resets January 1, 2027 · Plan Year: Jan – Dec 2026
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    gap: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 15, fontWeight: "700" },
  viewAll: { fontSize: 13, fontWeight: "600" },

  metersRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 16,
  },
  meter: { flex: 1, gap: 8 },
  vertDivider: { width: 1, alignSelf: "stretch", marginVertical: 4 },

  meterLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  meterLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.4, flex: 1 },
  pctBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  pctText: { fontSize: 11, fontWeight: "800" },

  track: { height: 10, borderRadius: 5, overflow: "hidden", position: "relative" },
  fill: { height: 10, borderRadius: 5 },
  fillDot: {
    position: "absolute",
    top: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    opacity: 0.6,
  },

  meterAmounts: { flexDirection: "row", alignItems: "baseline", gap: 4, flexWrap: "wrap" },
  metMoney: { fontSize: 14, fontWeight: "800" },
  totalMoney: { fontSize: 11 },

  remainingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
  },
  remainingText: { fontSize: 10, fontWeight: "600" },

  alert: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 10,
    borderLeftWidth: 3,
    padding: 12,
  },
  alertText: { flex: 1, fontSize: 12, lineHeight: 17 },

  resetNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  resetText: { fontSize: 11 },
});
