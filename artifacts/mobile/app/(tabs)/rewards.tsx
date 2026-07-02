import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
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

const WINDOW_OPEN_DAY = 1;
const WINDOW_CLOSE_DAY = 15;

function getWindowState() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();

  const isOpen = date >= WINDOW_OPEN_DAY && date <= WINDOW_CLOSE_DAY;

  let nextOpen: Date;
  if (isOpen) {
    nextOpen = new Date(year, month + 1, WINDOW_OPEN_DAY);
  } else if (date < WINDOW_OPEN_DAY) {
    nextOpen = new Date(year, month, WINDOW_OPEN_DAY);
  } else {
    nextOpen = new Date(year, month + 1, WINDOW_OPEN_DAY);
  }

  const nextOpenStr = nextOpen.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const diffMs = Math.max(0, nextOpen.getTime() - now.getTime());
  const daysUntil = Math.floor(diffMs / 86400000);
  const hoursUntil = Math.floor((diffMs % 86400000) / 3600000);
  const minsUntil = Math.floor((diffMs % 3600000) / 60000);

  return { isOpen, nextOpen, nextOpenStr, daysUntil, hoursUntil, minsUntil };
}

const REDEMPTION_OPTIONS = [
  {
    id: "premium",
    icon: "percent" as const,
    title: "Premium",
    description: "Applied to your next monthly premium",
    value: "1 point = $1",
    minPoints: 1,
    route: "/redeem/premium",
  },
  {
    id: "hsa",
    icon: "briefcase" as const,
    title: "HSA Contribution",
    description: "Deposited into your health savings account",
    value: "1 point = $1",
    minPoints: 1,
    route: "/redeem/hsa",
  },
  {
    id: "gift-card",
    icon: "gift" as const,
    title: "Healthcare Savings Giftcards",
    description: "Add funds to your health savings accounts.",
    value: "1 point = $1",
    minPoints: 1,
    route: "/redeem/giftcard",
  },
  {
    id: "copay",
    icon: "dollar-sign" as const,
    title: "Copay/Deductible Credit",
    description: "Applied toward your next eligible copay",
    value: "Coming soon",
    minPoints: 1,
    route: null,
  },
];

export default function PointsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { isOpen, nextOpenStr, daysUntil, hoursUntil, minsUntil } = useMemo(
    () => getWindowState(),
    []
  );

  const [now, setNow] = useState(new Date());
  const [showCopayModal, setShowCopayModal] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const rawBalance = user?.pointsBalance ?? 245;

  const earnedThisYear = useMemo(() => {
    const yearStart = new Date(now.getFullYear(), 0, 1);
    return (
      MOCK_POINTS_HISTORY.filter(
        (tx) => tx.type === "earned" && new Date(tx.date) >= yearStart
      ).reduce((sum, tx) => sum + tx.amount, 0) || rawBalance
    );
  }, [now, rawBalance]);

  // Story 1: balance can never exceed earnedThisYear
  const balance = Math.min(rawBalance, earnedThisYear);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Copay placeholder modal — Story 6 */}
      <Modal
        visible={showCopayModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCopayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={[styles.modalOkBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowCopayModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalOkText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero Card: Points Balance (top) + Earned This Year (below) ─── */}
        <View style={[styles.heroCard, { backgroundColor: colors.primaryDark }]}>
          {/* Story 2: Points Balance is the primary top figure */}
          <Text style={styles.heroLabel}>Points Balance</Text>
          <Text style={styles.heroValue}>{balance.toLocaleString()}</Text>
          <Text style={styles.heroUnit}>Points</Text>
          <Text style={styles.heroDollar}>${balance.toLocaleString()}</Text>
          <View style={[styles.heroDivider, { backgroundColor: "#ffffff30" }]} />
          {/* Story 2: Earned This Year moves below as secondary */}
          <Text style={styles.heroSecondaryLabel}>Earned This Year</Text>
          <Text style={styles.heroSecondaryValue}>
            {earnedThisYear.toLocaleString()} Points
          </Text>
        </View>

        {/* ─── Countdown Card ─── */}
        <View
          style={[
            styles.countdownCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.countdownTitle, { color: colors.foreground }]}>
            {isOpen ? "Redemption Window Closes In" : "Next Redemption Window"}
          </Text>
          <View style={styles.countdownRow}>
            <View style={styles.countdownUnit}>
              <Text style={[styles.countdownValue, { color: colors.primary }]}>
                {daysUntil}
              </Text>
              <Text style={[styles.countdownLabel, { color: colors.foreground }]}>
                DAYS
              </Text>
            </View>
            <Text style={[styles.countdownDot, { color: colors.foreground }]}>·</Text>
            <View style={styles.countdownUnit}>
              <Text style={[styles.countdownValue, { color: colors.primary }]}>
                {hoursUntil}
              </Text>
              <Text style={[styles.countdownLabel, { color: colors.foreground }]}>
                HOURS
              </Text>
            </View>
            <Text style={[styles.countdownDot, { color: colors.foreground }]}>·</Text>
            <View style={styles.countdownUnit}>
              <Text style={[styles.countdownValue, { color: colors.primary }]}>
                {minsUntil}
              </Text>
              <Text style={[styles.countdownLabel, { color: colors.foreground }]}>
                MIN
              </Text>
            </View>
          </View>
          <Text style={[styles.countdownDate, { color: colors.foreground }]}>
            {isOpen
              ? `Window closes on the ${WINDOW_CLOSE_DAY}th`
              : `Opens ${nextOpenStr}`}
          </Text>
        </View>

        {/* ─── Redemption Window Banner ─── */}
        {isOpen ? (
          <View
            style={[
              styles.windowBanner,
              { backgroundColor: "#DCFCE7", borderColor: "#86EFAC" },
            ]}
          >
            <View style={styles.windowBannerLeft}>
              <View
                style={[
                  styles.windowBannerIcon,
                  { backgroundColor: "#16A34A20" },
                ]}
              >
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
          <View
            style={[
              styles.windowBanner,
              { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" },
            ]}
          >
            <View style={styles.windowBannerLeft}>
              <View
                style={[styles.windowBannerIcon, { backgroundColor: "#FFFBEB" }]}
              >
                <Feather name="clock" size={18} color="#F59E0B" />
              </View>
              <View style={styles.windowBannerText}>
                <Text style={[styles.windowBannerTitle, { color: "#92400E" }]}>
                  Redemption Window Closed
                </Text>
                <Text style={[styles.windowBannerSub, { color: "#78350F" }]}>
                  The redemption window for this month has closed. Your next
                  window opens on {nextOpenStr}.
                </Text>
              </View>
            </View>
            <View style={styles.windowBannerRight}>
              <Text style={[styles.windowDaysValue, { color: "#F59E0B" }]}>
                {daysUntil}
              </Text>
              <Text style={[styles.windowDaysLabel, { color: "#92400E" }]}>
                days
              </Text>
            </View>
          </View>
        )}

        {/* ─── Redemption Options ─── */}
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
                    if (opt.id === "copay") {
                      setShowCopayModal(true);
                    } else if (opt.route) {
                      router.push(opt.route as never);
                    }
                  }}
                >
                  <View
                    style={[
                      styles.optionIcon,
                      {
                        backgroundColor: canRedeem
                          ? colors.secondary
                          : "#F0F2F5",
                      },
                    ]}
                  >
                    <Feather
                      name={opt.icon}
                      size={20}
                      color={canRedeem ? colors.primary : "#7A8699"}
                    />
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
                    <View
                      style={[
                        styles.optionLocked,
                        { backgroundColor: "#FEF3C7" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionLockedText,
                          { color: "#92400E" },
                        ]}
                      >
                        Window Closed
                      </Text>
                    </View>
                  )}
                  {isOpen && balance < opt.minPoints && (
                    <View
                      style={[
                        styles.optionLocked,
                        { backgroundColor: "#F0F2F5" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionLockedText,
                          { color: "#7A8699" },
                        ]}
                      >
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
              style={[
                styles.txRow,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.txDateCol}>
                <Text style={[styles.txDate, { color: colors.foreground }]}>
                  {tx.dateLabel}
                </Text>
              </View>
              <View
                style={[
                  styles.txIcon,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Feather name="activity" size={16} color={colors.primary} />
              </View>
              <View style={styles.txContent}>
                <Text
                  style={[styles.txTitle, { color: colors.foreground }]}
                  numberOfLines={2}
                >
                  {tx.description}
                </Text>
                <Text
                  style={[styles.txCategory, { color: colors.foreground }]}
                >
                  {tx.category}
                </Text>
              </View>
              <Text style={[styles.txAmount, { color: colors.primary }]}>
                {tx.type === "earned" ? "+" : "-"}
                {tx.amount}
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

  // Hero Card (Points Balance on top, Earned This Year below)
  heroCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 4,
  },
  heroLabel: {
    color: "#fff",
    fontSize: 15,
    opacity: 0.85,
    fontWeight: "600",
  },
  heroValue: {
    color: "#fff",
    fontSize: 60,
    fontWeight: "900",
    lineHeight: 64,
    marginTop: 2,
  },
  heroUnit: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.85,
    fontWeight: "600",
  },
  heroDollar: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    opacity: 0.9,
    marginTop: 2,
  },
  heroDivider: { width: "100%", height: 1, marginVertical: 10 },
  heroSecondaryLabel: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.65,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  heroSecondaryValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    opacity: 0.8,
  },

  // Window Banner
  windowBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  windowBannerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    flex: 1,
  },
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

  // Countdown Card
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

  // Copay Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  modalBox: {
    borderRadius: 20,
    padding: 32,
    width: "100%",
    alignItems: "center",
  },
  modalOkBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 60,
    alignItems: "center",
  },
  modalOkText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
