import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
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

import { ClaimCard } from "@/components/ClaimCard";
import { OpportunityCard } from "@/components/OpportunityCard";
import { useAuth } from "@/context/AuthContext";
import { MOCK_CLAIMS, MOCK_OPPORTUNITIES, MOCK_USER_PLAN } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const QUICK_ACTIONS = [
  { icon: "zap" as const, label: "Opportunities", route: "/(tabs)/opportunities" },
  { icon: "file-text" as const, label: "Claims", route: "/(tabs)/claims" },
  { icon: "star" as const, label: "Rewards", route: "/(tabs)/rewards" },
  { icon: "activity" as const, label: "Benefits", route: "/(tabs)/claims" },
];

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const topOpportunities = MOCK_OPPORTUNITIES.filter((o) => o.priority === "high").slice(0, 3);
  const recentClaims = MOCK_CLAIMS.slice(0, 3);

  const totalSavings = MOCK_OPPORTUNITIES.reduce((s, o) => s + o.savings, 0);
  const deductiblePct = (MOCK_USER_PLAN.deductibleMet / MOCK_USER_PLAN.deductible) * 100;

  const firstName = user?.name?.split(" ")[0] ?? "Member";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting + Points */}
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.heroName}>{firstName}</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => router.push("/(tabs)/profile" as never)}
            >
              <Feather name="bell" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>
                {(user?.pointsBalance ?? 2450).toLocaleString()}
              </Text>
              <Text style={styles.heroStatLabel}>Points Balance</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: "#ffffff40" }]} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>
                ${user?.savingsThisYear ?? 847}
              </Text>
              <Text style={styles.heroStatLabel}>Saved This Year</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: "#ffffff40" }]} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>${totalSavings}/mo</Text>
              <Text style={styles.heroStatLabel}>Available</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.redeemPill}
            onPress={() => router.push("/redeem" as never)}
          >
            <Feather name="star" size={14} color={colors.rewards} />
            <Text style={[styles.redeemPillText, { color: colors.rewards }]}>
              Redeem Points
            </Text>
            <Feather name="arrow-right" size={14} color={colors.rewards} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(action.route as never)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + "15" }]}>
                <Feather name={action.icon} size={20} color={colors.primary} />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.foreground }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Deductible Progress */}
        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.foreground }]}>
              Deductible Progress
            </Text>
            <Text style={[styles.progressSubtitle, { color: colors.mutedForeground }]}>
              {MOCK_USER_PLAN.planName}
            </Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={[styles.progressAmt, { color: colors.primary }]}>
              ${MOCK_USER_PLAN.deductibleMet.toLocaleString()}
            </Text>
            <Text style={[styles.progressOf, { color: colors.mutedForeground }]}>
              of ${MOCK_USER_PLAN.deductible.toLocaleString()} met
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${Math.min(deductiblePct, 100)}%` as any,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressNote, { color: colors.mutedForeground }]}>
            ${(MOCK_USER_PLAN.deductible - MOCK_USER_PLAN.deductibleMet).toLocaleString()} left to meet your deductible
          </Text>
        </View>

        {/* Top Opportunities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Top Opportunities
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/opportunities" as never)}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {topOpportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </View>

        {/* Recent Claims */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Recent Claims
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/claims" as never)}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.claimsStack}>
            {recentClaims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} compact />
            ))}
          </View>
        </View>

        {/* Earn More Banner */}
        <TouchableOpacity
          style={[styles.earnBanner, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "40" }]}
          onPress={() => router.push("/(tabs)/rewards" as never)}
        >
          <View style={[styles.earnIcon, { backgroundColor: colors.accent }]}>
            <Feather name="award" size={20} color="#fff" />
          </View>
          <View style={styles.earnContent}>
            <Text style={[styles.earnTitle, { color: colors.foreground }]}>
              Earn 500 more points this month
            </Text>
            <Text style={[styles.earnDesc, { color: colors.mutedForeground }]}>
              Complete your monthly engagement bonus
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.accent} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { gap: 16 },
  heroCard: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  greeting: { color: "#ffffff99", fontSize: 14 },
  heroName: { color: "#fff", fontSize: 26, fontWeight: "800" },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff20",
    alignItems: "center",
    justifyContent: "center",
  },
  heroStats: {
    flexDirection: "row",
    backgroundColor: "#00000020",
    borderRadius: 14,
    overflow: "hidden",
  },
  heroStat: { flex: 1, alignItems: "center", paddingVertical: 14 },
  heroStatValue: { color: "#fff", fontSize: 18, fontWeight: "800" },
  heroStatLabel: { color: "#ffffff80", fontSize: 11, marginTop: 2 },
  heroStatDivider: { width: 1 },
  redeemPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    backgroundColor: "#ffffff20",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  redeemPillText: { fontSize: 13, fontWeight: "700" },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: { fontSize: 11, fontWeight: "600", textAlign: "center" },
  progressCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 10,
  },
  progressHeader: { gap: 2 },
  progressTitle: { fontSize: 17, fontWeight: "700" },
  progressSubtitle: { fontSize: 13 },
  progressRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  progressAmt: { fontSize: 24, fontWeight: "800" },
  progressOf: { fontSize: 14 },
  progressTrack: { height: 10, borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5 },
  progressNote: { fontSize: 13 },
  section: { paddingHorizontal: 16, gap: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 20, fontWeight: "800" },
  seeAll: { fontSize: 14, fontWeight: "600" },
  claimsStack: { gap: 10 },
  earnBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  earnIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  earnContent: { flex: 1, gap: 3 },
  earnTitle: { fontSize: 15, fontWeight: "700" },
  earnDesc: { fontSize: 13 },
});
