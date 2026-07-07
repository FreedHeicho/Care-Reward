import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { useState } from "react";
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

const HSA_LIMIT_2026 = 4400;
const YTD_CONTRIBUTION = 1200;

export default function HsaAllocationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const balance = user?.pointsBalance ?? 0;
  const remainingRoom = HSA_LIMIT_2026 - YTD_CONTRIBUTION;

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
    if (YTD_CONTRIBUTION + pts > HSA_LIMIT_2026) {
      setError(
        "This allocation exceeds your 2026 HSA contribution limit of $4,400. Please enter a lower amount."
      );
      return;
    }
    router.push({
      pathname: "/redeem/confirm" as never,
      params: {
        option: "hsa",
        label: "HSA Contribution",
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
      <Stack.Screen options={{ title: "HSA Contribution", headerBackTitle: "Back" }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InfoRow label="2026 HSA Contribution Limit" value={`$${HSA_LIMIT_2026.toLocaleString()}`} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="YTD HSA Contribution" value={`$${YTD_CONTRIBUTION.toLocaleString()}`} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Remaining Contribution Room" value={`$${remainingRoom.toLocaleString()}`} colors={colors} highlight />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Points Available" value={`${balance.toLocaleString()} pts`} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Rate" value="1 point = $1" colors={colors} highlight />
        </View>

        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.foreground }]}>Points to Allocate</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputColumn}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Points</Text>
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
            <Text style={[styles.orText, { color: colors.mutedForeground }]}>or</Text>
            <View style={styles.inputColumn}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Percentage</Text>
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
              {parseInt(ptsText, 10).toLocaleString()} points = ${parseInt(ptsText, 10).toLocaleString()} HSA contribution
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
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]} numberOfLines={2}>{label}</Text>
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
    paddingVertical: 12,
    gap: 12,
  },
  infoLabel: { fontSize: 13, fontWeight: "500", flex: 1 },
  infoValue: { fontSize: 14, fontWeight: "700" },
  divider: { height: 1 },
  inputSection: {
    gap: 12,
  },
  inputLabel: { fontSize: 16, fontWeight: "700" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  inputColumn: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  inputWrap: {
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
  orText: { fontSize: 13, fontWeight: "600", paddingBottom: 14 },
  errorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  errorText: { color: "#DC2626", fontSize: 13, flex: 1, lineHeight: 18 },
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
