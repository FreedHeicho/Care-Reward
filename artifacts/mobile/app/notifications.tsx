import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type FrequencyOption = "immediate" | "daily" | "weekly";

interface NotifSetting {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  defaultOn: boolean;
}

const CATEGORIES: {
  title: string;
  color: string;
  iconBg: string;
  items: NotifSetting[];
}[] = [
  {
    title: "Savings & Opportunities",
    color: "#16A34A",
    iconBg: "#DCFCE7",
    items: [
      {
        key: "new_opportunities",
        label: "New Opportunities",
        description: "When a new cost-saving opportunity is identified for you",
        icon: "zap",
        defaultOn: true,
      },
      {
        key: "deductible_warning",
        label: "Deductible Milestone",
        description: "When you're 80% and 100% of the way to meeting your deductible",
        icon: "trending-up",
        defaultOn: true,
      },
      {
        key: "savings_milestone",
        label: "Savings Milestones",
        description: "Celebrate when you hit $100, $250, $500+ in annual savings",
        icon: "dollar-sign",
        defaultOn: true,
      },
      {
        key: "opp_expiring",
        label: "Expiring Opportunities",
        description: "Reminder when an opportunity is about to expire",
        icon: "clock",
        defaultOn: false,
      },
    ],
  },
  {
    title: "Care Reminders",
    color: "#2563EB",
    iconBg: "#DBEAFE",
    items: [
      {
        key: "care_reminders",
        label: "Preventive Care Reminders",
        description: "Annual checkup, flu shot, and screening reminders",
        icon: "calendar",
        defaultOn: true,
      },
      {
        key: "upcoming_care",
        label: "Upcoming Appointment",
        description: "24-hour and 1-hour reminders for logged appointments",
        icon: "clock",
        defaultOn: true,
      },
      {
        key: "care_gap",
        label: "Care Gap Alerts",
        description: "When your plan flags a missed recommended care visit",
        icon: "alert-circle",
        defaultOn: false,
      },
    ],
  },
  {
    title: "Claims",
    color: "#7C3AED",
    iconBg: "#EDE9FE",
    items: [
      {
        key: "claim_status",
        label: "Claim Status Updates",
        description: "When a claim moves from pending to processed",
        icon: "file-text",
        defaultOn: true,
      },
      {
        key: "claim_processed",
        label: "Claim Processed",
        description: "When a claim is fully processed and your amount is due",
        icon: "check-circle",
        defaultOn: true,
      },
      {
        key: "large_claim",
        label: "Large Claim Alert",
        description: "When a claim over $500 is filed in your name",
        icon: "alert-triangle",
        defaultOn: true,
      },
    ],
  },
  {
    title: "Points & Rewards",
    color: "#D97706",
    iconBg: "#FEF3C7",
    items: [
      {
        key: "points_earned",
        label: "Points Earned",
        description: "Confirmation when points are added to your balance",
        icon: "star",
        defaultOn: true,
      },
      {
        key: "points_expiry",
        label: "Points Expiring Soon",
        description: "30-day and 7-day warning before points expire",
        icon: "clock",
        defaultOn: true,
      },
      {
        key: "redemption_confirmed",
        label: "Redemption Confirmed",
        description: "When a reward redemption is processed successfully",
        icon: "gift",
        defaultOn: true,
      },
      {
        key: "points_milestone",
        label: "Points Milestones",
        description: "When you hit 500, 1000, 2500+ points",
        icon: "award",
        defaultOn: false,
      },
    ],
  },
];

const FREQUENCY_OPTIONS: { value: FrequencyOption; label: string; sub: string }[] = [
  { value: "immediate", label: "Immediate", sub: "As events happen" },
  { value: "daily", label: "Daily Digest", sub: "One summary each morning" },
  { value: "weekly", label: "Weekly Summary", sub: "Every Monday morning" },
];

const QUIET_HOURS: { label: string; start: string; end: string }[] = [
  { label: "None", start: "", end: "" },
  { label: "10 PM – 7 AM", start: "22:00", end: "07:00" },
  { label: "9 PM – 8 AM", start: "21:00", end: "08:00" },
  { label: "11 PM – 6 AM", start: "23:00", end: "06:00" },
];

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [masterOn, setMasterOn] = useState(true);
  const [emailOn, setEmailOn] = useState(true);
  const [frequency, setFrequency] = useState<FrequencyOption>("immediate");
  const [quietIdx, setQuietIdx] = useState(1);

  // Build toggle state from defaults
  const defaultState: Record<string, boolean> = {};
  CATEGORIES.forEach((cat) => {
    cat.items.forEach((item) => {
      defaultState[item.key] = item.defaultOn;
    });
  });
  const [toggles, setToggles] = useState<Record<string, boolean>>(defaultState);

  const handleToggle = async (key: string, val: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setToggles((prev) => ({ ...prev, [key]: val }));
  };

  const handleMaster = async (val: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMasterOn(val);
  };

  const handleFrequency = async (val: FrequencyOption) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFrequency(val);
  };

  const handleQuiet = async (idx: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuietIdx(idx);
  };

  const enabledCount = Object.values(toggles).filter(Boolean).length;
  const totalCount = Object.values(toggles).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Master toggle card */}
        <View style={[styles.masterCard, { backgroundColor: masterOn ? "#05503C" : colors.card, borderColor: masterOn ? "#05503C" : colors.border }]}>
          <View style={styles.masterLeft}>
            <View style={[styles.masterIconWrap, { backgroundColor: masterOn ? "#ffffff25" : colors.muted }]}>
              <Feather name="bell" size={22} color={masterOn ? "#fff" : colors.mutedForeground} />
            </View>
            <View>
              <Text style={[styles.masterTitle, { color: masterOn ? "#fff" : colors.foreground }]}>
                Push Notifications
              </Text>
              <Text style={[styles.masterSub, { color: masterOn ? "#ffffff90" : colors.mutedForeground }]}>
                {masterOn ? `${enabledCount} of ${totalCount} alerts enabled` : "All notifications paused"}
              </Text>
            </View>
          </View>
          <Switch
            value={masterOn}
            onValueChange={handleMaster}
            trackColor={{ false: colors.border, true: "#ffffff40" }}
            thumbColor="#fff"
          />
        </View>

        {/* Notification categories */}
        {CATEGORIES.map((cat) => (
          <View
            key={cat.title}
            style={[
              styles.section,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: masterOn ? 1 : 0.45,
              },
            ]}
            pointerEvents={masterOn ? "auto" : "none"}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
                {cat.title.toUpperCase()}
              </Text>
            </View>

            {cat.items.map((item, idx) => (
              <View
                key={item.key}
                style={[
                  styles.notifRow,
                  { borderBottomColor: idx < cat.items.length - 1 ? colors.border : "transparent" },
                ]}
              >
                <View style={[styles.notifIconWrap, { backgroundColor: cat.iconBg }]}>
                  <Feather name={item.icon} size={15} color={cat.color} />
                </View>
                <View style={styles.notifInfo}>
                  <Text style={[styles.notifLabel, { color: colors.foreground }]}>{item.label}</Text>
                  <Text style={[styles.notifDesc, { color: colors.mutedForeground }]}>
                    {item.description}
                  </Text>
                </View>
                <Switch
                  value={toggles[item.key] ?? item.defaultOn}
                  onValueChange={(val) => handleToggle(item.key, val)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                  style={styles.notifSwitch}
                />
              </View>
            ))}
          </View>
        ))}

        {/* Delivery frequency */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, opacity: masterOn ? 1 : 0.45 }]}
          pointerEvents={masterOn ? "auto" : "none"}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>DELIVERY FREQUENCY</Text>
          </View>
          <View style={styles.freqGrid}>
            {FREQUENCY_OPTIONS.map((opt) => {
              const active = frequency === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.freqOption,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary + "10" : colors.background,
                    },
                  ]}
                  onPress={() => handleFrequency(opt.value)}
                  activeOpacity={0.8}
                >
                  {active && (
                    <View style={[styles.freqCheckDot, { backgroundColor: colors.primary }]} />
                  )}
                  <Text style={[styles.freqLabel, { color: active ? colors.primary : colors.foreground }]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.freqSub, { color: colors.mutedForeground }]}>{opt.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quiet hours */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, opacity: masterOn ? 1 : 0.45 }]}
          pointerEvents={masterOn ? "auto" : "none"}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>QUIET HOURS</Text>
          </View>
          <Text style={[styles.quietHelp, { color: colors.mutedForeground }]}>
            No push alerts during these hours. Critical safety alerts are always delivered.
          </Text>
          <View style={styles.quietGrid}>
            {QUIET_HOURS.map((qh, idx) => {
              const active = quietIdx === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.quietOption,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary + "10" : colors.background,
                    },
                  ]}
                  onPress={() => handleQuiet(idx)}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={idx === 0 ? "sun" : "moon"}
                    size={14}
                    color={active ? colors.primary : colors.mutedForeground}
                  />
                  <Text style={[styles.quietLabel, { color: active ? colors.primary : colors.foreground }]}>
                    {qh.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Email notifications */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>EMAIL</Text>
          </View>
          <View style={styles.emailRow}>
            <View style={[styles.notifIconWrap, { backgroundColor: colors.primary + "15" }]}>
              <Feather name="mail" size={15} color={colors.primary} />
            </View>
            <View style={styles.notifInfo}>
              <Text style={[styles.notifLabel, { color: colors.foreground }]}>Email Digest</Text>
              <Text style={[styles.notifDesc, { color: colors.mutedForeground }]}>
                Weekly summary of your savings, points, and claims
              </Text>
            </View>
            <Switch
              value={emailOn}
              onValueChange={async (val) => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEmailOn(val);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
              style={styles.notifSwitch}
            />
          </View>
        </View>

        {/* Status summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.muted }]}>
          <Feather name="check-circle" size={16} color={colors.primary} />
          <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
            {masterOn
              ? `You have ${enabledCount} of ${totalCount} notification types enabled. Changes save automatically.`
              : "All push notifications are paused. Toggle the switch above to re-enable."}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, gap: 14 },

  masterCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 14,
  },
  masterLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  masterIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  masterTitle: { fontSize: 16, fontWeight: "700" },
  masterSub: { fontSize: 13, marginTop: 2 },

  section: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },

  notifRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  notifIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifInfo: { flex: 1 },
  notifLabel: { fontSize: 14, fontWeight: "600" },
  notifDesc: { fontSize: 12, lineHeight: 16, marginTop: 2 },
  notifSwitch: { flexShrink: 0 },

  freqGrid: { flexDirection: "row", gap: 8, padding: 12, paddingTop: 4 },
  freqOption: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    alignItems: "center",
    gap: 4,
    position: "relative",
  },
  freqCheckDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  freqLabel: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  freqSub: { fontSize: 10, textAlign: "center", lineHeight: 14 },

  quietHelp: { fontSize: 13, lineHeight: 18, paddingHorizontal: 16, paddingBottom: 8 },
  quietGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 12, paddingTop: 0 },
  quietOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  quietLabel: { fontSize: 13, fontWeight: "600" },

  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },

  summaryCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    padding: 14,
  },
  summaryText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
