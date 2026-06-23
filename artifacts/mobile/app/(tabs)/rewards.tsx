import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
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

/* ─── Redemption Window Logic ─── */
const WINDOW_OPEN_DAY = 1;   // 1st of month
const WINDOW_CLOSE_DAY = 15; // 15th of month

function getWindowState() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  const date = now.getDate();

  const isOpen = date >= WINDOW_OPEN_DAY && date <= WINDOW_CLOSE_DAY;

  let nextOpen: Date;
  if (isOpen) {
    // If currently open, next window is next month
    nextOpen = new Date(year, month + 1, WINDOW_OPEN_DAY);
  } else if (date < WINDOW_OPEN_DAY) {
    // Before open day of this month
    nextOpen = new Date(year, month, WINDOW_OPEN_DAY);
  } else {
    // After close day, wait for next month
    nextOpen = new Date(year, month + 1, WINDOW_OPEN_DAY);
  }

  const nextOpenStr = nextOpen.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const daysUntil = Math.max(0, Math.ceil((nextOpen.getTime() - now.getTime()) / 86400000));

  return { isOpen, nextOpen, nextOpenStr, daysUntil };
}

/* ─── Redemption Options (from old redeem.tsx) ─── */
const REDEMPTION_OPTIONS = [
  {
    id: "premium",
    icon: "percent" as const,
    title: "Premium Reduction",
    description: "Applied to your next monthly premium",
    value: "500 points = $5",
    minPoints: 500,
  },
  {
    id: "copay",
    icon: "dollar-sign" as const,
    title: "Copay / Deductible Credit",
    description: "Applied toward your next eligible copay",
    value: "250 points = $2.50",
    minPoints: 250,
  },
  {
    id: "gift-card",
    icon: "gift" as const,
    title: "Gift Cards",
    description: "Amazon, Target, CVS, and more",
    value: "1,000 points = $10",
    minPoints: 1000,
  },
  {
    id: "healthcare",
    icon: "activity" as const,
    title: "Healthcare Services",
    description: "Gym membership, wellness, vision, dental",
    value: "500 points = $5",
    minPoints: 500,
  },
];

export default function PointsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isOpen, nextOpenStr, daysUntil } = useMemo(() => getWindowState(), []);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const balance = user?.pointsBalance ?? 245;
  const earnedThisYear = useMemo(() => {
    const yearStart = new Date(now.getFullYear(), 0, 1);
    return MOCK_POINTS_HISTORY
      .filter((tx) => tx.type === "earned" && new Date(tx.date) >= yearStart)
      .reduce((sum, tx) => sum + tx.amount, 0) || balance;
  }, [now, balance]);

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
        {/* ─── Earned This Year (Primary) ─── */}
        <View style={[styles.earnedCard, { backgroundColor: colors.primaryDark }]}>
          <Text style={styles.earnedLabel}>Earned This Year</Text>
          <Text style={styles.earnedValue}>{earnedThisYear.toLocaleString()}</Text>
          <Text style={styles.earnedUnit}>Points</Text>
          <View style={[styles.earnedDivider, { backgroundColor: "#ffffff30" }]} />
          <Text style={styles.earnedSub}>
            Your Points Balance: {balance.toLocaleString()} Points
          </Text>
          <Text style={styles.earnedSub}>
            = ${balance.toLocaleString()}
          </Text>
        </View>

        {/* ─── Redemption Window Banner ─── */}
        {isOpen ? (
          <View style={[styles.windowBanner, { backgroundColor: "#DCFCE7", borderColor: "#86EFAC" }]}>
            <View style={styles.windowBannerLeft}>
              <View style={[styles.windowBannerIcon, { backgroundColor: "#16A34A20" }]}>
                <Feather name="unlock" size={18} color="#16A34A" />
              </View>
              <View style={styles.windowBannerText}>
                <Text style={[styles.windowBannerTitle, { color: "#166534" }]}>
                  Redemption Window Open
                </Text>
                <Text style={[styles.windowBannerSub, { color: "#15803D" }]}>
                  Redeem your points before the 15th
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.windowBanner, { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }]}>
            <View style={styles.windowBannerLeft}>
              <View style={[styles.windowBannerIcon, { backgroundColor: "#FFFBEB" }]}>
                <Feather name="clock" size={18} color="#F59E0B" />
              </View>
              <View style={styles.windowBannerText}>
                <Text style={[styles.windowBannerTitle, { color: "#92400E" }]}>
                  Redemption Window Closed
                </Text>
                <Text style={[styles.windowBannerSub, { color: "#78350F" }]}>
                  The redemption window for this month has closed.
                  Your next window opens on {nextOpenStr}.
                </Text>
              </View>
            </View>
            <View style={styles.windowBannerRight}>
              <Text style={[styles.windowDaysValue, { color: "#F59E0B" }]}>{daysUntil}</Text>
              <Text style={[styles.windowDaysLabel, { color: "#92400E" }]}>days</Text>
            </View>
          </View>
        )}

        {/* ─── Redemption Options (2×2 Grid) ─── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Redemption Options
          </Text>
          <View style={styles.optionsGrid}>
            {REDEMPTION_OPTIONS.map((opt) => {
              const canRedeem = isOpen && balance >= opt.minPoints;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: canRedeem ? colors.primary : colors.border,
                      opacity: canRedeem ? 1 : 0.55,
                    },
                  ]}
                  activeOpacity={canRedeem ? 0.85 : 1}
                  onPress={() => {
                    if (!isOpen) {
                      if (Platform.OS !== "web") {
                        Alert.alert(
                          "Window Closed",
                          `The redemption window is currently closed. Next window opens ${nextOpenStr}.`
                        );
                      }
                      return;
                    }
                    if (balance < opt.minPoints) {
                      if (Platform.OS !== "web") {
                        Alert.alert(
                          "Insufficient Points",
                          `You need at least ${opt.minPoints} points for this option.`
                        );
                      }
                      return;
                    }
                    if (Platform.OS !== "web") {
                      Alert.alert(
                        "Redemption Requested",
                        `${opt.title} \u2014 ${opt.value}\n\nYour request has been submitted for processing.`,
                      );
                    }
                  }}
                >
                  <View style={[styles.optionIcon, { backgroundColor: canRedeem ? colors.secondary : "#F0F2F5" }]}>
                    <Feather name={opt.icon} size={20} color={canRedeem ? colors.primary : "#7A8699"} />
                  </View>
                  <Text style={[styles.optionTitle, { color: colors.foreground }]}>
                    {opt.title}
                  </Text>
                  <Text style={[styles.optionDesc, { color: colors.foreground }]}>
                    {opt.description}
                  </Text>
                  <Text style={[styles.optionValue, { color: colors.primary }]}>
                    {opt.value}
                  </Text>
                  {!isOpen && (
                    <View style={[styles.optionLocked, { backgroundColor: "#FEF3C7" }]}>
                      <Text style={[styles.optionLockedText, { color: "#92400E" }]}>
                        Window Closed
                      </Text>
                    </View>
                  )}
                  {isOpen && balance < opt.minPoints && (
                    <View style={[styles.optionLocked, { backgroundColor: "#F0F2F5" }]}>
                      <Text style={[styles.optionLockedText, { color: "#7A8699" }]}>
                        Need {opt.minPoints} pts
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ─── Recent Activity ─── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Recent Activity
          </Text>
          {MOCK_POINTS_HISTORY.map((tx) => (
            <View
              key={tx.id}
              style={[styles.txRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.txDateCol}>
                <Text style={[styles.txDate, { color: colors.foreground }]}>
                  {tx.dateLabel}
                </Text>
              </View>
              <View style={[styles.txIcon, { backgroundColor: colors.secondary }]}>
                <Feather name="activity" size={16} color={colors.primary} />
              </View>
              <View style={styles.txContent}>
                <Text style={[styles.txTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {tx.description}
                </Text>
                <Text style={[styles.txCategory, { color: colors.foreground }]}>
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
  scroll: { paddingHorizontal: 16, paddingTop: 12, gap: 16 },

  // Earned This Year Card
  earnedCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  earnedLabel: { color: "#fff", fontSize: 14, opacity: 0.8, fontWeight: "600" },
  earnedValue: { color: "#fff", fontSize: 56, fontWeight: "900", lineHeight: 60 },
  earnedUnit: { color: "#fff", fontSize: 16, opacity: 0.85, fontWeight: "600" },
  earnedDivider: { width: "100%", height: 1, marginVertical: 8 },
  earnedSub: { color: "#fff", fontSize: 13, opacity: 0.75, textAlign: "center" },

  // Window Banner
  windowBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  windowBannerLeft: { flexDirection: "row", alignItems: "flex-start", gap: 10, flex: 1 },
  windowBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  windowBannerText: { gap: 2, flex: 1 },
  windowBannerTitle: { fontSize: 14, fontWeight: "700" },
  windowBannerSub: { fontSize: 12, lineHeight: 16 },
  windowBannerRight: { alignItems: "flex-end" },
  windowDaysValue: { fontSize: 20, fontWeight: "900" },
  windowDaysLabel: { fontSize: 11 },

  // Section
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800" },

  // 2×2 Grid
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionCard: {
    width: "47%",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 8,
    alignItems: "flex-start",
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTitle: { fontSize: 14, fontWeight: "700" },
  optionDesc: { fontSize: 12, lineHeight: 16 },
  optionValue: { fontSize: 13, fontWeight: "600" },
  optionLocked: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 2,
  },
  optionLockedText: { fontSize: 11, fontWeight: "700" },

  // Transaction Rows
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
