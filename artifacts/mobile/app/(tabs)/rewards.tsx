import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { MOCK_POINTS_HISTORY, PointsTransaction } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const EARN_METHODS = [
  { icon: "refresh-cw" as const, label: "Switch to generic medication", pts: 500 },
  { icon: "calendar" as const, label: "Complete annual physical", pts: 300 },
  { icon: "truck" as const, label: "Set up mail delivery pharmacy", pts: 200 },
  { icon: "shield" as const, label: "Get preventive screening", pts: 150 },
  { icon: "star" as const, label: "Monthly engagement bonus", pts: 500 },
  { icon: "message-circle" as const, label: "App feedback survey", pts: 10 },
];

const REDEEM_TYPES = [
  { icon: "percent" as const, label: "Premium Reduction", desc: "Lower your monthly premium" },
  { icon: "dollar-sign" as const, label: "Copay Credit", desc: "Apply to your next copay" },
  { icon: "gift" as const, label: "Gift Cards", desc: "Amazon, Target & more" },
  { icon: "activity" as const, label: "Healthcare Services", desc: "Wellness & preventive care" },
];

function TransactionItem({ tx }: { tx: PointsTransaction }) {
  const colors = useColors();
  const isEarned = tx.type === "earned";

  return (
    <View style={[styles.txItem, { borderBottomColor: colors.border }]}>
      <View style={[styles.txIcon, { backgroundColor: isEarned ? colors.accent + "20" : "#EF444420" }]}>
        <Feather
          name={isEarned ? "plus-circle" : "minus-circle"}
          size={18}
          color={isEarned ? colors.accent : "#EF4444"}
        />
      </View>
      <View style={styles.txDetails}>
        <Text style={[styles.txDesc, { color: colors.foreground }]}>{tx.description}</Text>
        <Text style={[styles.txDate, { color: colors.mutedForeground }]}>{tx.date}</Text>
      </View>
      <Text
        style={[
          styles.txAmount,
          { color: isEarned ? colors.accent : "#EF4444" },
        ]}
      >
        {isEarned ? "+" : "-"}{Math.abs(tx.amount).toLocaleString()} pts
      </Text>
    </View>
  );
}

export default function RewardsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const earnedThisYear = MOCK_POINTS_HISTORY.filter((t) => t.type === "earned").reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const redeemedThisYear = MOCK_POINTS_HISTORY.filter((t) => t.type === "redeemed").reduce(
    (sum, t) => sum + t.amount,
    0
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={MOCK_POINTS_HISTORY}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem tx={item} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={[styles.balanceCard, { backgroundColor: colors.rewards }]}>
              <Text style={styles.balanceLabel}>Your Points Balance</Text>
              <Text style={styles.balanceValue}>
                {(user?.pointsBalance ?? 2450).toLocaleString()}
              </Text>
              <Text style={styles.balanceSub}>points</Text>

              <View style={styles.balanceStats}>
                <View style={styles.balanceStat}>
                  <Text style={styles.balanceStatValue}>{earnedThisYear.toLocaleString()}</Text>
                  <Text style={styles.balanceStatLabel}>Earned this year</Text>
                </View>
                <View style={[styles.balanceStatDivider, { backgroundColor: "#fff3" }]} />
                <View style={styles.balanceStat}>
                  <Text style={styles.balanceStatValue}>{redeemedThisYear.toLocaleString()}</Text>
                  <Text style={styles.balanceStatLabel}>Redeemed</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.redeemBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push("/redeem" as never);
                }}
              >
                <Text style={styles.redeemBtnText}>Redeem Points</Text>
                <Feather name="arrow-right" size={16} color={colors.rewards} />
              </TouchableOpacity>
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>How to Earn</Text>
              {EARN_METHODS.map((m) => (
                <View key={m.label} style={[styles.earnRow, { borderBottomColor: colors.border }]}>
                  <View style={[styles.earnIcon, { backgroundColor: colors.primary + "15" }]}>
                    <Feather name={m.icon} size={16} color={colors.primary} />
                  </View>
                  <Text style={[styles.earnLabel, { color: colors.foreground }]} numberOfLines={2}>
                    {m.label}
                  </Text>
                  <Text style={[styles.earnPts, { color: colors.rewards }]}>+{m.pts}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Redemption Options</Text>
              <View style={styles.redeemGrid}>
                {REDEEM_TYPES.map((r) => (
                  <TouchableOpacity
                    key={r.label}
                    style={[styles.redeemOption, { backgroundColor: colors.muted }]}
                    onPress={() => router.push("/redeem" as never)}
                  >
                    <View style={[styles.redeemIcon, { backgroundColor: colors.rewards + "25" }]}>
                      <Feather name={r.icon} size={20} color={colors.rewards} />
                    </View>
                    <Text style={[styles.redeemOptionLabel, { color: colors.foreground }]}>
                      {r.label}
                    </Text>
                    <Text style={[styles.redeemOptionDesc, { color: colors.mutedForeground }]}>
                      {r.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.historyHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Points History</Text>
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View />}
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
  header: { gap: 16, paddingBottom: 8 },
  balanceCard: {
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 4,
  },
  balanceLabel: { color: "#fff", fontSize: 14, fontWeight: "500", opacity: 0.85 },
  balanceValue: { color: "#fff", fontSize: 56, fontWeight: "900", lineHeight: 64 },
  balanceSub: { color: "#fff", fontSize: 14, opacity: 0.75, marginTop: -4 },
  balanceStats: {
    flexDirection: "row",
    width: "100%",
    marginTop: 16,
    backgroundColor: "#00000020",
    borderRadius: 12,
    overflow: "hidden",
  },
  balanceStat: { flex: 1, alignItems: "center", paddingVertical: 12 },
  balanceStatValue: { color: "#fff", fontSize: 18, fontWeight: "800" },
  balanceStatLabel: { color: "#fff", fontSize: 11, opacity: 0.8, marginTop: 2 },
  balanceStatDivider: { width: 1 },
  redeemBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  redeemBtnText: { fontSize: 15, fontWeight: "700", color: "#F59E0B" },
  section: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    padding: 16,
    gap: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  earnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  earnIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  earnLabel: { flex: 1, fontSize: 14 },
  earnPts: { fontSize: 14, fontWeight: "700" },
  redeemGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  redeemOption: {
    width: "47%",
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  redeemIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  redeemOptionLabel: { fontSize: 13, fontWeight: "700" },
  redeemOptionDesc: { fontSize: 12, lineHeight: 16 },
  historyHeader: { paddingHorizontal: 16 },
  list: { gap: 0 },
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  txIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  txDetails: { flex: 1, gap: 2 },
  txDesc: { fontSize: 14, fontWeight: "500" },
  txDate: { fontSize: 12 },
  txAmount: { fontSize: 14, fontWeight: "700" },
});
