import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const HOW_IT_WORKS = [
  {
    step: 1,
    stepColor: "#0EA5E9",
    icon: "search" as const,
    iconBg: "#E0F2FE",
    iconColor: "#0EA5E9",
    title: "Discover Opportunities",
    description:
      "Browse personalized opportunities to save money and improve your health. Each opportunity shows potential savings and points you can earn.",
  },
  {
    step: 2,
    stepColor: "#2D7D6F",
    icon: "check-circle" as const,
    iconBg: "#E8F5F2",
    iconColor: "#2D7D6F",
    title: "Take Action",
    description:
      "Complete the recommended actions like switching to generic medications, scheduling preventive care, or comparing providers.",
  },
  {
    step: 3,
    stepColor: "#F59E0B",
    icon: "star" as const,
    iconBg: "#FEF3C7",
    iconColor: "#F59E0B",
    title: "Earn Points",
    description:
      "Get points automatically when you complete opportunities. Points are added to your balance and can be redeemed for rewards.",
  },
  {
    step: 4,
    stepColor: "#2D7D6F",
    icon: "gift" as const,
    iconBg: "#E8F5F2",
    iconColor: "#2D7D6F",
    title: "Redeem Rewards",
    description:
      "Use your points to get gift cards, reduce healthcare costs, or access premium health services.",
  },
];

const WAYS_TO_EARN = [
  { icon: "package" as const, iconBg: "#E8F5F2", iconColor: "#2D7D6F", label: "Switch to Generic Medication", desc: "Save money with equivalent medication", points: 50, ptColor: "#2D7D6F" },
  { icon: "calendar" as const, iconBg: "#DBEAFE", iconColor: "#3B82F6", label: "Schedule Preventive Care", desc: "Stay healthy with regular checkups", points: 100, ptColor: "#3B82F6" },
  { icon: "search" as const, iconBg: "#FEF3C7", iconColor: "#F59E0B", label: "Compare Healthcare Providers", desc: "Find better value for your care", points: 75, ptColor: "#F59E0B" },
  { icon: "clipboard" as const, iconBg: "#F0FDF4", iconColor: "#22C55E", label: "Complete Health Assessments", desc: "Help us personalize your experience", points: 25, ptColor: "#22C55E" },
  { icon: "plus-circle" as const, iconBg: "#FEE2E2", iconColor: "#EF4444", label: "Log Upcoming Care", desc: "Get personalized recommendations", points: 50, ptColor: "#EF4444" },
  { icon: "truck" as const, iconBg: "#E8F5F2", iconColor: "#2D7D6F", label: "Mail Delivery Setup", desc: "Convenient medication delivery", points: 150, ptColor: "#2D7D6F" },
];

const REDEEM_OPTIONS = [
  { icon: "gift" as const, label: "Gift cards to popular retailers" },
  { icon: "credit-card" as const, label: "Healthcare cost reductions" },
  { icon: "heart" as const, label: "Premium health services" },
  { icon: "smartphone" as const, label: "Health and wellness apps" },
];

const PRO_TIPS = [
  "Check the app regularly for new opportunities",
  "Complete opportunities quickly to maximize savings",
  "Points expire after 12 months of inactivity",
  "Some opportunities have limited availability",
  "Higher point values often mean bigger savings",
];

export default function HowToEarnScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.heroIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="award" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>Earn Points, Save Money</Text>
          <Text style={[styles.heroDesc, { color: colors.mutedForeground }]}>
            CareReward points help you save on healthcare costs while making healthier choices. Complete opportunities, engage with your health, and redeem points for rewards.
          </Text>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>How It Works</Text>
          {HOW_IT_WORKS.map((step) => (
            <View
              key={step.step}
              style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.stepHeader}>
                <View style={[styles.stepNumber, { backgroundColor: step.stepColor }]}>
                  <Text style={styles.stepNumberText}>{step.step}</Text>
                </View>
                <View style={[styles.stepIcon, { backgroundColor: step.iconBg }]}>
                  <Feather name={step.icon} size={20} color={step.iconColor} />
                </View>
              </View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>{step.title}</Text>
              <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>{step.description}</Text>
            </View>
          ))}
        </View>

        {/* Ways to Earn */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Ways to Earn Points</Text>
          {WAYS_TO_EARN.map((way) => (
            <View
              key={way.label}
              style={[styles.wayRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.wayIcon, { backgroundColor: way.iconBg }]}>
                <Feather name={way.icon} size={18} color={way.iconColor} />
              </View>
              <View style={styles.wayContent}>
                <Text style={[styles.wayLabel, { color: colors.foreground }]}>{way.label}</Text>
                <Text style={[styles.wayDesc, { color: colors.mutedForeground }]}>{way.desc}</Text>
              </View>
              <View style={[styles.wayPoints, { backgroundColor: way.ptColor }]}>
                <Text style={styles.wayPointsText}>+{way.points}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pro Tips */}
        <View style={[styles.proTipsCard, { backgroundColor: colors.alertBg, borderLeftColor: colors.primary }]}>
          <View style={styles.proTipsHeader}>
            <Feather name="info" size={16} color={colors.primary} />
            <Text style={[styles.proTipsTitle, { color: colors.primary }]}>Pro Tips</Text>
          </View>
          {PRO_TIPS.map((tip) => (
            <Text key={tip} style={[styles.proTip, { color: colors.foreground }]}>
              • {tip}
            </Text>
          ))}
        </View>

        {/* Redeeming Points */}
        <View style={[styles.redeemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.redeemTitle, { color: colors.foreground }]}>Redeeming Points</Text>
          <Text style={[styles.redeemDesc, { color: colors.mutedForeground }]}>
            Once you've earned points, you can redeem them for:
          </Text>
          {REDEEM_OPTIONS.map((opt) => (
            <View key={opt.label} style={styles.redeemRow}>
              <Feather name={opt.icon} size={16} color={colors.primary} />
              <Text style={[styles.redeemOptionText, { color: colors.foreground }]}>{opt.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: colors.primaryDark }]}
          onPress={() => router.push("/(tabs)/opportunities" as never)}
          activeOpacity={0.85}
        >
          <Feather name="zap" size={18} color="#fff" />
          <Text style={styles.startBtnText}>Browse Opportunities</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, gap: 16 },
  heroCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    gap: 12,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  heroDesc: { fontSize: 14, lineHeight: 22, textAlign: "center" },
  section: { gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  stepCard: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    gap: 10,
  },
  stepHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: { fontSize: 16, fontWeight: "700" },
  stepDesc: { fontSize: 14, lineHeight: 20 },
  wayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  wayIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  wayContent: { flex: 1 },
  wayLabel: { fontSize: 14, fontWeight: "700" },
  wayDesc: { fontSize: 12, marginTop: 2 },
  wayPoints: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  wayPointsText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  proTipsCard: {
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    gap: 8,
  },
  proTipsHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  proTipsTitle: { fontSize: 16, fontWeight: "700" },
  proTip: { fontSize: 14, lineHeight: 20 },
  redeemCard: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    gap: 12,
  },
  redeemTitle: { fontSize: 18, fontWeight: "800" },
  redeemDesc: { fontSize: 14, lineHeight: 20 },
  redeemRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  redeemOptionText: { fontSize: 14 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 4,
  },
  startBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
