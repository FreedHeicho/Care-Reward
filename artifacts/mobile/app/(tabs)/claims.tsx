import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { MOCK_CLAIMS, MOCK_USER_PLAN } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

type TabType = "individual" | "family";

const YTD_CATEGORIES = [
  { label: "Prescriptions", amount: 120, color: "#2D7D6F", bg: "#E8F5F2" },
  { label: "Doctor Visits", amount: 98, color: "#0EA5E9", bg: "#DBEAFE" },
  { label: "Specialist", amount: 75, color: "#8B5CF6", bg: "#EDE9FE" },
  { label: "Labs", amount: 49, color: "#EF4444", bg: "#FEE2E2" },
];

const YTD_TOTAL = YTD_CATEGORIES.reduce((s, c) => s + c.amount, 0);

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  processed: { bg: "#DCFCE7", color: "#16A34A" },
  paid: { bg: "#DCFCE7", color: "#16A34A" },
  pending: { bg: "#FEF3C7", color: "#F59E0B" },
  "in-review": { bg: "#FEE2E2", color: "#EF4444" },
};

export default function CareScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("individual");

  const plan = useMemo(() => {
    const deductible = activeTab === "individual" ? 1500 : 3000;
    const deductibleMet = activeTab === "individual" ? 100 : 250;
    const oopMax = activeTab === "individual" ? 500 : 1000;
    const oopMet = activeTab === "individual" ? 225 : 450;
    return { deductible, deductibleMet, oopMax, oopMet };
  }, [activeTab]);

  const deductiblePct = Math.round((plan.deductibleMet / plan.deductible) * 100);
  const oopPct = Math.round((plan.oopMet / plan.oopMax) * 100);
  const remaining = plan.deductible - plan.deductibleMet;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Care
          </Text>
          <Text style={[styles.headerSub, { color: colors.foreground }]}>
            Manage your care, track your deductible
          </Text>
        </View>

        {/* Individual / Family Toggle */}
        <View style={[styles.toggleWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeTab === "individual" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setActiveTab("individual")}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.toggleText,
                { color: activeTab === "individual" ? "#fff" : colors.foreground },
              ]}
            >
              Individual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeTab === "family" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setActiveTab("family")}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.toggleText,
                { color: activeTab === "family" ? "#fff" : colors.foreground },
              ]}
            >
              Family
            </Text>
          </TouchableOpacity>
        </View>

        {/* Your Benefits Card */}
        <View style={[styles.benefitsCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.benefitsCardLabel}>Your Benefits</Text>

          <Text style={styles.benefitsCardTitle}>
            {activeTab === "individual" ? "Individual" : "Family"} Deductible
          </Text>

          {/* Circular Ring */}
          <View style={styles.ringWrap}>
            <View style={[styles.ringOuter, { borderColor: "#ffffff30" }]}>
              <View style={[styles.ringInner, { borderColor: "#ffffff60" }]}>
                <Text style={styles.ringPercent}>{deductiblePct}%</Text>
              </View>
            </View>
          </View>

          <Text style={styles.benefitsMet}>
            ${plan.deductibleMet.toLocaleString()} met of ${plan.deductible.toLocaleString()}
          </Text>
          <Text style={styles.benefitsRemaining}>
            ${remaining.toLocaleString()} remaining
          </Text>

          {/* OOP */}
          <View style={styles.oopRow}>
            <Text style={styles.oopLabel}>Out-of-Pocket Maximum</Text>
            <Text style={styles.oopMet}>{oopPct}% met</Text>
          </View>
          <View style={[styles.oopTrack, { backgroundColor: "#ffffff20" }]}>
            <View style={[styles.oopFill, { width: `${oopPct}%`, backgroundColor: "#ffffff70" }]} />
          </View>
          <Text style={styles.oopSub}>
            ${plan.oopMet.toLocaleString()} met of ${plan.oopMax.toLocaleString()}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push("/log-upcoming-care" as never)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#E8F5F2" }]}>
                <Feather name="file-text" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.quickActionTitle, { color: colors.foreground }]}>
                View All{"\n"}Claims
              </Text>
              <Text style={[styles.quickActionSub, { color: colors.foreground }]}>
                6 claims
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push("/emr-access" as never)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#EDE9FE" }]}>
                <Feather name="database" size={20} color="#8B5CF6" />
              </View>
              <Text style={[styles.quickActionTitle, { color: colors.foreground }]}>
                Get{"\n"}automated{"\n"}referral
              </Text>
              <Text style={[styles.quickActionSub, { color: colors.foreground }]}>
                Access via{"\n"}EMR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push("/log-upcoming-care" as never)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "#DBEAFE" }]}>
                <Feather name="calendar" size={20} color="#0EA5E9" />
              </View>
              <Text style={[styles.quickActionTitle, { color: colors.foreground }]}>
                Log{"\n"}Upcoming{"\n"}Care
              </Text>
              <Text style={[styles.quickActionSub, { color: colors.foreground }]}>
                Get{"\n"}recommendations
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* YTD Spending */}
        <View style={[styles.ytdCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.ytdTitle, { color: colors.foreground }]}>
            Year-to-Date Spending
          </Text>
          <Text style={[styles.ytdTotal, { color: colors.foreground }]}>
            ${YTD_TOTAL.toLocaleString()}
          </Text>
          <Text style={[styles.ytdSub, { color: colors.foreground }]}>
            Total spent this year
          </Text>

          <View style={styles.ytdBreakdown}>
            {YTD_CATEGORIES.map((cat) => {
              const pct = Math.round((cat.amount / YTD_TOTAL) * 100);
              return (
                <View key={cat.label} style={styles.ytdRow}>
                  <View style={styles.ytdRowLeft}>
                    <View style={[styles.ytdDot, { backgroundColor: cat.color }]} />
                    <View style={styles.ytdRowText}>
                      <Text style={[styles.ytdLabel, { color: colors.foreground }]}>
                        {cat.label}
                      </Text>
                      <Text style={[styles.ytdValue, { color: colors.foreground }]}>
                        ${cat.amount}({pct}%)
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.ytdBarTrack, { backgroundColor: "#E4E9F0" }]}>
                    <View style={[styles.ytdBarFill, { width: `${pct}%`, backgroundColor: cat.color }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent Claims */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Recent Claims
          </Text>
          <View style={styles.claimsList}>
            {MOCK_CLAIMS.map((claim) => {
              const statusLabel =
                claim.status === "processed" ? "PAID" :
                claim.status === "pending" ? "PENDING" : "PENDING";
              const ss = STATUS_STYLES[claim.status] ?? STATUS_STYLES.processed;
              return (
                <TouchableOpacity
                  key={claim.id}
                  style={[styles.claimCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/claim/${claim.id}` as never)}
                  activeOpacity={0.8}
                >
                  <View style={styles.claimTop}>
                    <View style={styles.claimLeft}>
                      <Text style={[styles.claimProvider, { color: colors.foreground }]}>
                        {claim.provider}
                      </Text>
                      <Text style={[styles.claimType, { color: colors.foreground }]}>
                        {claim.type}
                      </Text>
                      <Text style={[styles.claimDate, { color: colors.foreground }]}>
                        {claim.date}
                      </Text>
                    </View>
                    <View style={styles.claimRight}>
                      <View style={[styles.statusBadge, { backgroundColor: ss.bg }]}>
                        <Text style={[styles.statusText, { color: ss.color }]}>
                          {statusLabel}
                        </Text>
                      </View>
                      <Text style={[styles.claimAmount, { color: colors.foreground }]}>
                        ${claim.patientResponsibility}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, gap: 16 },

  // Header
  header: { marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: "900" },
  headerSub: { fontSize: 15, lineHeight: 20, marginTop: 2 },

  // Toggle
  toggleWrap: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    gap: 3,
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  toggleText: { fontSize: 14, fontWeight: "700" },

  // Benefits Card
  benefitsCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  benefitsCardLabel: {
    color: "#ffffffcc",
    fontSize: 14,
    fontWeight: "500",
    alignSelf: "flex-start",
  },
  benefitsCardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  ringWrap: {
    marginVertical: 16,
  },
  ringOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  ringPercent: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "900",
  },
  benefitsMet: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
  },
  benefitsRemaining: {
    color: "#86EFAC",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  oopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 4,
    marginTop: 4,
  },
  oopLabel: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.85,
  },
  oopMet: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.85,
  },
  oopTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 6,
  },
  oopFill: {
    height: "100%",
    borderRadius: 3,
  },
  oopSub: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.75,
    alignSelf: "flex-start",
    marginTop: 4,
  },

  // Section
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800" },

  // Quick Actions
  quickActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "flex-start",
    gap: 8,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  quickActionSub: {
    fontSize: 11,
    lineHeight: 15,
    opacity: 0.7,
  },

  // YTD Spending
  ytdCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  ytdTitle: {
    fontSize: 16,
    fontWeight: "800",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  ytdTotal: {
    fontSize: 36,
    fontWeight: "900",
  },
  ytdSub: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
  },
  ytdBreakdown: {
    width: "100%",
    gap: 12,
    marginTop: 8,
  },
  ytdRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ytdRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  ytdDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ytdRowText: {
    gap: 2,
  },
  ytdLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  ytdValue: {
    fontSize: 12,
    opacity: 0.6,
  },
  ytdBarTrack: {
    width: 100,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  ytdBarFill: {
    height: "100%",
    borderRadius: 3,
  },

  // Recent Claims
  claimsList: {
    gap: 10,
  },
  claimCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  claimTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  claimLeft: {
    flex: 1,
    gap: 3,
  },
  claimProvider: {
    fontSize: 15,
    fontWeight: "700",
  },
  claimType: {
    fontSize: 13,
    opacity: 0.6,
  },
  claimDate: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
  },
  claimRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  claimAmount: {
    fontSize: 18,
    fontWeight: "800",
  },
});
