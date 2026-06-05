import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { MOCK_POINTS_HISTORY } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const REDEMPTION_OPENS = new Date("2026-07-01T00:00:00");

function useCountdown() {
  const [diff, setDiff] = useState(REDEMPTION_OPENS.getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(REDEMPTION_OPENS.getTime() - Date.now()), 60000);
    return () => clearInterval(id);
  }, []);
  const days = Math.max(0, Math.floor(diff / 86400000));
  const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  const mins = Math.max(0, Math.floor((diff % 3600000) / 60000));
  return { days, hours, mins, daysRemaining: days };
}

const REDEMPTION_OPTIONS = [
  {
    id: "hsa",
    icon: "dollar-sign" as const,
    title: "HSA Contribution",
    description: "Add funds to your Health Savings Account",
    value: "500 points = $500",
  },
  {
    id: "premium",
    icon: "credit-card" as const,
    title: "Premium Reimbursement",
    description: "Reimburse your monthly premium payment",
    value: "500 points = $500",
  },
  {
    id: "copay",
    icon: "activity" as const,
    title: "Copay Credit",
    description: "Apply toward your next eligible copay",
    value: "250 points = $25",
  },
  {
    id: "gift",
    icon: "gift" as const,
    title: "Gift Cards",
    description: "Amazon, Target, CVS & more",
    value: "1000 points = $10",
  },
];

const QUICK_STATS = [
  { icon: "calendar" as const, iconBg: "#E8F5F2", iconColor: "#2D7D6F", label: "This Month", value: "40+", sub: "24 earned" },
  { icon: "trending-up" as const, iconBg: "#FEE2E2", iconColor: "#EF4444", label: "Redemption Rate", value: "41%", sub: "Points used" },
  { icon: "award" as const, iconBg: "#EDE9FE", iconColor: "#8B5CF6", label: "Next Milestone", value: "550", sub: "to Premium tier" },
];

export default function PointsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { days, hours, mins, daysRemaining } = useCountdown();

  const balance = user?.pointsBalance ?? 245;
  const dollarValue = balance;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Redemption Window Warning */}
        <View style={[styles.windowWarning, { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }]}>
          <View style={styles.windowWarningLeft}>
            <View style={[styles.windowIcon, { backgroundColor: "#FFFBEB" }]}>
              <Feather name="clock" size={18} color="#F59E0B" />
            </View>
            <View style={styles.windowWarningText}>
              <Text style={[styles.windowTitle, { color: "#92400E" }]}>Redemption Window Closed</Text>
              <Text style={[styles.windowSub, { color: "#78350F" }]}>
                Next window opens July 1, 2026
              </Text>
            </View>
          </View>
          <View style={styles.windowDays}>
            <Text style={[styles.windowDaysValue, { color: "#F59E0B" }]}>{daysRemaining} days</Text>
            <Text style={[styles.windowDaysLabel, { color: "#92400E" }]}>remaining</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.scheduleTopBtn, { backgroundColor: "#F59E0B" }]}
          activeOpacity={0.85}
        >
          <Feather name="calendar" size={16} color="#fff" />
          <Text style={styles.scheduleTopBtnText}>Schedule</Text>
        </TouchableOpacity>

        {/* Countdown Card */}
        <View style={[styles.countdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.countdownTitle, { color: colors.foreground }]}>
            Next Redemption Window
          </Text>
          <View style={styles.countdownRow}>
            <View style={styles.countdownUnit}>
              <Text style={[styles.countdownValue, { color: colors.primary }]}>{days}</Text>
              <Text style={[styles.countdownLabel, { color: colors.mutedForeground }]}>DAYS</Text>
            </View>
            <Text style={[styles.countdownDot, { color: colors.mutedForeground }]}>.</Text>
            <View style={styles.countdownUnit}>
              <Text style={[styles.countdownValue, { color: colors.primary }]}>{hours}</Text>
              <Text style={[styles.countdownLabel, { color: colors.mutedForeground }]}>HOURS</Text>
            </View>
            <Text style={[styles.countdownDot, { color: colors.mutedForeground }]}>.</Text>
            <View style={styles.countdownUnit}>
              <Text style={[styles.countdownValue, { color: colors.primary }]}>{mins}</Text>
              <Text style={[styles.countdownLabel, { color: colors.mutedForeground }]}>MIN</Text>
            </View>
          </View>
          <Text style={[styles.countdownDate, { color: colors.mutedForeground }]}>
            Opens July 1, 2026
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={[styles.closedPill, { backgroundColor: colors.muted }]}>
          <Text style={[styles.closedPillText, { color: colors.mutedForeground }]}>
            Redemption Window Closed
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.scheduleRedeemBtn, { backgroundColor: colors.primaryDark }]}
          activeOpacity={0.85}
        >
          <Feather name="calendar" size={18} color="#fff" />
          <Text style={styles.scheduleRedeemBtnText}>Schedule Redemption</Text>
        </TouchableOpacity>

        {/* Points Balance */}
        <View style={[styles.balanceCard, { backgroundColor: colors.primaryDark }]}>
          <Text style={styles.balanceCardLabel}>Your Points Balance</Text>
          <Text style={styles.balanceCardValue}>{balance.toLocaleString()} Points</Text>
          <Text style={styles.balanceCardDollar}>= ${dollarValue}</Text>
          <Text style={styles.balanceCardDesc}>
            Available toward premium, copays, or deductible
          </Text>
          <Text style={styles.balanceCardEarned}>
            Earned this year: +{balance} points
          </Text>
          <View style={[styles.balanceProgressTrack, { backgroundColor: "#ffffff30" }]}>
            <View style={[styles.balanceProgressFill, { width: "30%" }]} />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Stats</Text>
          <View style={styles.quickStatsRow}>
            {QUICK_STATS.map((stat) => (
              <View
                key={stat.label}
                style={[styles.quickStatCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.quickStatIcon, { backgroundColor: stat.iconBg }]}>
                  <Feather name={stat.icon} size={18} color={stat.iconColor} />
                </View>
                <Text style={[styles.quickStatLabel, { color: colors.mutedForeground }]}>
                  {stat.label}
                </Text>
                <Text style={[styles.quickStatValue, { color: colors.foreground }]}>{stat.value}</Text>
                <Text style={[styles.quickStatSub, { color: colors.mutedForeground }]}>{stat.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Redemption Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Redemption Options</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.redeemScroll}>
            {REDEMPTION_OPTIONS.map((opt, idx) => (
              <View
                key={opt.id}
                style={[
                  styles.redeemOptionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: idx === 1 ? colors.primary : colors.border,
                    borderTopWidth: idx === 1 ? 4 : 1,
                  },
                ]}
              >
                <View style={[styles.redeemOptionIcon, { backgroundColor: colors.secondary }]}>
                  <Feather name={opt.icon} size={20} color={colors.primary} />
                </View>
                <Text style={[styles.redeemOptionTitle, { color: colors.foreground }]}>
                  {opt.title}
                </Text>
                <Text style={[styles.redeemOptionDesc, { color: colors.mutedForeground }]}>
                  {opt.description}
                </Text>
                <Text style={[styles.redeemOptionValue, { color: colors.primary }]}>{opt.value}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity</Text>
          {MOCK_POINTS_HISTORY.map((tx) => (
            <View
              key={tx.id}
              style={[styles.txRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.txDateCol}>
                <Text style={[styles.txDate, { color: colors.mutedForeground }]}>{tx.dateLabel}</Text>
              </View>
              <View style={[styles.txIcon, { backgroundColor: colors.secondary }]}>
                <Feather name="activity" size={16} color={colors.primary} />
              </View>
              <View style={styles.txContent}>
                <Text style={[styles.txTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {tx.description}
                </Text>
                <Text style={[styles.txCategory, { color: colors.mutedForeground }]}>
                  {tx.category}
                </Text>
              </View>
              <Text style={[styles.txAmount, { color: colors.primary }]}>
                {tx.type === "earned" ? "+" : "-"}{tx.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, gap: 14 },
  windowWarning: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  windowWarningLeft: { flexDirection: "row", alignItems: "flex-start", gap: 10, flex: 1 },
  windowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  windowWarningText: { gap: 2, flex: 1 },
  windowTitle: { fontSize: 14, fontWeight: "700" },
  windowSub: { fontSize: 12, lineHeight: 16 },
  windowDays: { alignItems: "flex-end" },
  windowDaysValue: { fontSize: 18, fontWeight: "900" },
  windowDaysLabel: { fontSize: 11 },
  scheduleTopBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 14,
  },
  scheduleTopBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  countdownCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    gap: 14,
  },
  countdownTitle: { fontSize: 17, fontWeight: "700" },
  countdownRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  countdownUnit: { alignItems: "center" },
  countdownValue: { fontSize: 40, fontWeight: "900", lineHeight: 44 },
  countdownLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
  countdownDot: { fontSize: 32, fontWeight: "900", marginBottom: 10 },
  countdownDate: { fontSize: 13 },
  closedPill: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  closedPillText: { fontSize: 15, fontWeight: "600" },
  scheduleRedeemBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 16,
  },
  scheduleRedeemBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  balanceCardLabel: { color: "#fff", fontSize: 14, opacity: 0.8 },
  balanceCardValue: { color: "#fff", fontSize: 40, fontWeight: "900", lineHeight: 48 },
  balanceCardDollar: { color: "#fff", fontSize: 16, opacity: 0.85 },
  balanceCardDesc: { color: "#fff", fontSize: 13, textAlign: "center", opacity: 0.75 },
  balanceCardEarned: { color: "#fff", fontSize: 13, opacity: 0.85 },
  balanceProgressTrack: { width: "100%", height: 6, borderRadius: 3, overflow: "hidden", marginTop: 4 },
  balanceProgressFill: { height: "100%", backgroundColor: "#fff", borderRadius: 3 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  quickStatsRow: { flexDirection: "row", gap: 10 },
  quickStatCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  quickStatLabel: { fontSize: 11, textAlign: "center" },
  quickStatValue: { fontSize: 18, fontWeight: "800" },
  quickStatSub: { fontSize: 10, textAlign: "center" },
  redeemScroll: { gap: 12, paddingRight: 4 },
  redeemOptionCard: {
    width: 160,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  redeemOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  redeemOptionTitle: { fontSize: 14, fontWeight: "700", lineHeight: 18 },
  redeemOptionDesc: { fontSize: 12, lineHeight: 16 },
  redeemOptionValue: { fontSize: 13, fontWeight: "600" },
  txRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  txDateCol: { width: 36 },
  txDate: { fontSize: 11, fontWeight: "700", textAlign: "center", lineHeight: 14 },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  txContent: { flex: 1 },
  txTitle: { fontSize: 13, fontWeight: "600", lineHeight: 17 },
  txCategory: { fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: "800" },
});
