import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const MONTHLY_PREMIUM = 400;

export default function PremiumAllocationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const balance = user?.pointsBalance ?? 0;

  const [pctText, setPctText] = useState("");
  const [ptsText, setPtsText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onPctChange = (text: string) => {
    setPctText(text);
    setError(null);
    const pct = parseFloat(text);
    if (!isNaN(pct) && balance > 0) {
      setPtsText(Math.round((pct / 100) * balance).toString());
    } else if (text === "") {
      setPtsText("");
    }
  };

  const onPtsChange = (text: string) => {
    setPtsText(text);
    setError(null);
    const pts = parseFloat(text);
    if (!isNaN(pts) && balance > 0) {
      setPctText(((pts / balance) * 100).toFixed(1));
    } else if (text === "") {
      setPctText("");
    }
  };

  const handleOk = () => {
    const pts = parseInt(ptsText, 10);
    if (isNaN(pts) || pts <= 0) {
      setError("Please enter a valid number of points.");
      return;
    }
    if (pts > balance) {
      setError("You don't have enough points for this allocation.");
      return;
    }
    if (pts > MONTHLY_PREMIUM) {
      setError("Allocation cannot exceed the monthly premium amount.");
      return;
    }
    router.push({
      pathname: "/redeem/confirm" as never,
      params: {
        option: "premium",
        label: "Premium",
        points: String(pts),
        remaining: String(balance - pts),
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ title: "Premium Allocation", headerBackTitle: "Back" }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InfoRow label="Monthly Premium" value={`$${MONTHLY_PREMIUM.toLocaleString()}`} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Points Available" value={`${balance.toLocaleString()} pts`} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Rate" value="1 point = $1" colors={colors} highlight />
        </View>

        <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.foreground }]}>Points to Allocate</Text>
          <View style={styles.inputRow}>
            <View style={[styles.inputWrap, { borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="decimal-pad"
                value={pctText}
                onChangeText={onPctChange}
              />
              <Text style={[styles.inputUnit, { color: colors.mutedForeground }]}>%</Text>
            </View>
            <Text style={[styles.orText, { color: colors.mutedForeground }]}>or</Text>
            <View style={[styles.inputWrap, { borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                value={ptsText}
                onChangeText={onPtsChange}
              />
              <Text style={[styles.inputUnit, { color: colors.mutedForeground }]}>pts</Text>
            </View>
          </View>
          {error && (
            <View style={styles.errorRow}>
              <Feather name="alert-circle" size={14} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {ptsText !== "" && !isNaN(parseInt(ptsText, 10)) && (
          <View style={[styles.previewCard, { backgroundColor: colors.secondary, borderColor: colors.primary + "40" }]}>
            <Text style={[styles.previewLabel, { color: colors.primary }]}>
              Allocation Preview
            </Text>
            <Text style={[styles.previewValue, { color: colors.primary }]}>
              {parseInt(ptsText, 10).toLocaleString()} points = ${parseInt(ptsText, 10).toLocaleString()} off premium
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.okBtn, { backgroundColor: colors.primary }]}
          onPress={handleOk}
          activeOpacity={0.85}
        >
          <Text style={styles.okBtnText}>OK</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InfoRow({ label, value, colors, highlight }: {
  label: string; value: string; colors: ReturnType<typeof import("@/hooks/useColors").useColors>; highlight?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: highlight ? colors.primary : colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 20, gap: 16 },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 4,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLabel: { fontSize: 14, fontWeight: "500" },
  infoValue: { fontSize: 15, fontWeight: "700" },
  divider: { height: 1 },
  inputCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  inputLabel: { fontSize: 16, fontWeight: "700" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  input: { flex: 1, fontSize: 18, fontWeight: "700" },
  inputUnit: { fontSize: 14, fontWeight: "600" },
  orText: { fontSize: 13, fontWeight: "600" },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  errorText: { color: "#DC2626", fontSize: 13, flex: 1 },
  previewCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  previewLabel: { fontSize: 12, fontWeight: "600" },
  previewValue: { fontSize: 15, fontWeight: "700" },
  okBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  okBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
