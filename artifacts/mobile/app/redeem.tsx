import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { useColors } from "@/hooks/useColors";

type RedeemType = "premium" | "copay" | "gift-card" | "healthcare";

interface Option {
  id: RedeemType;
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  description: string;
  minPoints: number;
  dollarValue: string;
}

const OPTIONS: Option[] = [
  {
    id: "premium",
    icon: "percent",
    title: "Premium Reduction",
    description: "Applied to your next monthly premium",
    minPoints: 500,
    dollarValue: "$5 per 500 pts",
  },
  {
    id: "copay",
    icon: "dollar-sign",
    title: "Copay / Deductible Credit",
    description: "Applied toward your next eligible copay",
    minPoints: 250,
    dollarValue: "$2.50 per 250 pts",
  },
  {
    id: "gift-card",
    icon: "gift",
    title: "Gift Cards",
    description: "Amazon, Target, CVS, and more",
    minPoints: 1000,
    dollarValue: "$10 per 1000 pts",
  },
  {
    id: "healthcare",
    icon: "activity",
    title: "Healthcare Services",
    description: "Gym membership, wellness, vision, dental",
    minPoints: 500,
    dollarValue: "$5 per 500 pts",
  },
];

const POINT_AMOUNTS = [250, 500, 750, 1000, 1500, 2000];

export default function RedeemScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, updatePoints } = useAuth();

  const [selectedType, setSelectedType] = useState<RedeemType | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const balance = user?.pointsBalance ?? 2450;

  const handleRedeem = async () => {
    if (!selectedType || !selectedAmount) return;
    if (selectedAmount > balance) {
      if (Platform.OS !== "web") {
        Alert.alert("Insufficient Points", "You don't have enough points for this redemption.");
      }
      return;
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updatePoints(selectedAmount);
    if (Platform.OS !== "web") {
      Alert.alert(
        "Redemption Scheduled",
        `Your ${selectedAmount.toLocaleString()} points have been submitted. Processing takes 3-5 business days.`,
        [{ text: "Done", onPress: () => router.back() }]
      );
    } else {
      router.back();
    }
  };

  const selectedOption = OPTIONS.find((o) => o.id === selectedType);
  const canRedeem =
    selectedType !== null &&
    selectedAmount !== null &&
    selectedAmount <= balance &&
    selectedOption &&
    selectedAmount >= selectedOption.minPoints;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.balancePill, { backgroundColor: colors.rewards + "20" }]}>
          <Feather name="star" size={16} color={colors.rewards} />
          <Text style={[styles.balanceText, { color: colors.rewards }]}>
            {balance.toLocaleString()} points available
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            1. Choose redemption type
          </Text>
          <View style={styles.optionsGrid}>
            {OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: selectedType === opt.id ? colors.primary + "15" : colors.card,
                    borderColor: selectedType === opt.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  setSelectedType(opt.id);
                  setSelectedAmount(null);
                }}
              >
                <View
                  style={[
                    styles.optionIcon,
                    { backgroundColor: selectedType === opt.id ? colors.primary : colors.muted },
                  ]}
                >
                  <Feather
                    name={opt.icon}
                    size={20}
                    color={selectedType === opt.id ? "#fff" : colors.mutedForeground}
                  />
                </View>
                <Text style={[styles.optionTitle, { color: colors.foreground }]}>
                  {opt.title}
                </Text>
                <Text style={[styles.optionDesc, { color: colors.mutedForeground }]}>
                  {opt.dollarValue}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedType && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              2. Select amount
            </Text>
            <View style={styles.amountsGrid}>
              {POINT_AMOUNTS.filter(
                (a) => a >= (selectedOption?.minPoints ?? 0) && a <= balance
              ).map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.amountChip,
                    {
                      backgroundColor: selectedAmount === amt ? colors.primary : colors.card,
                      borderColor: selectedAmount === amt ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedAmount(amt)}
                >
                  <Text
                    style={[
                      styles.amountChipText,
                      { color: selectedAmount === amt ? "#fff" : colors.foreground },
                    ]}
                  >
                    {amt.toLocaleString()} pts
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {selectedType && selectedAmount && (
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryTitle, { color: colors.foreground }]}>
              Redemption Summary
            </Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Type</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>
                {selectedOption?.title}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Points</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>
                {selectedAmount.toLocaleString()} pts
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryLast]}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                Remaining Balance
              </Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                {(balance - selectedAmount).toLocaleString()} pts
              </Text>
            </View>
            <View style={[styles.windowNote, { backgroundColor: colors.muted }]}>
              <Feather name="clock" size={14} color={colors.mutedForeground} />
              <Text style={[styles.windowText, { color: colors.mutedForeground }]}>
                Processing: 3–5 business days. Next redemption window opens Jan 1, 2026.
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.redeemBtn,
            { backgroundColor: canRedeem ? colors.primary : colors.muted },
          ]}
          onPress={handleRedeem}
          disabled={!canRedeem}
          activeOpacity={0.85}
        >
          <Feather name="check-circle" size={20} color={canRedeem ? "#fff" : colors.mutedForeground} />
          <Text
            style={[styles.redeemBtnText, { color: canRedeem ? "#fff" : colors.mutedForeground }]}
          >
            Confirm Redemption
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 24 },
  balancePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  balanceText: { fontSize: 14, fontWeight: "700" },
  section: { gap: 14 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  optionCard: {
    width: "47%",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    gap: 10,
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
  amountsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  amountChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  amountChipText: { fontSize: 14, fontWeight: "600" },
  summaryCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 12,
  },
  summaryTitle: { fontSize: 17, fontWeight: "700" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F020",
  },
  summaryLast: { borderBottomWidth: 0 },
  summaryLabel: { fontSize: 15 },
  summaryValue: { fontSize: 15, fontWeight: "600" },
  windowNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 10,
    padding: 12,
  },
  windowText: { flex: 1, fontSize: 13, lineHeight: 18 },
  redeemBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 18,
  },
  redeemBtnText: { fontSize: 17, fontWeight: "700" },
});
