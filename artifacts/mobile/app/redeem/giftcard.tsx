import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
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

const AMAZON_FSA_URL = "https://www.amazon.com/b/?node=122265875011";

export default function GiftcardAllocationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, updatePoints } = useAuth();

  const balance = user?.pointsBalance ?? 0;

  const [pctText, setPctText] = useState("");
  const [ptsText, setPtsText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [allocatedPts, setAllocatedPts] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);

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
    updatePoints(pts);
    setAllocatedPts(pts);
    setRemainingBalance(balance - pts);
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "Healthcare Giftcards", headerBackTitle: "Back" }} />
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        >
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.successIcon, { backgroundColor: "#DCFCE7" }]}>
              <Feather name="check-circle" size={32} color="#16A34A" />
            </View>
            <Text style={[styles.confirmTitle, { color: colors.foreground }]}>
              Points Allocated
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.mutedForeground }]}>Allocated</Text>
              <Text style={[styles.confirmValue, { color: colors.primary }]}>
                {allocatedPts.toLocaleString()} pts = ${allocatedPts.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.mutedForeground }]}>Remaining Balance</Text>
              <Text style={[styles.confirmValue, { color: colors.foreground }]}>
                {remainingBalance.toLocaleString()} pts
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.websiteBtn, { backgroundColor: colors.primary }]}
            onPress={() => Linking.openURL(AMAZON_FSA_URL)}
            activeOpacity={0.85}
          >
            <Feather name="external-link" size={18} color="#fff" />
            <Text style={styles.websiteBtnText}>Take Me to the Website</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.doneBtn, { borderColor: colors.border }]}
            onPress={() => router.back()}
            activeOpacity={0.75}
          >
            <Text style={[styles.doneBtnText, { color: colors.foreground }]}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ title: "Healthcare Giftcards", headerBackTitle: "Back" }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Points Available</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>
              {balance.toLocaleString()} pts
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Destination</Text>
            <Text style={[styles.infoValue, { color: colors.primary }]}>Amazon FSA Store</Text>
          </View>
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
            <Text style={[styles.previewLabel, { color: colors.primary }]}>Allocation Preview</Text>
            <Text style={[styles.previewValue, { color: colors.primary }]}>
              {parseInt(ptsText, 10).toLocaleString()} points = ${parseInt(ptsText, 10).toLocaleString()} on Amazon FSA Store
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

  confirmCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    alignSelf: "stretch",
    gap: 16,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmTitle: { fontSize: 22, fontWeight: "800" },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 4,
  },
  confirmLabel: { fontSize: 14 },
  confirmValue: { fontSize: 15, fontWeight: "700" },

  websiteBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
  },
  websiteBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  doneBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1.5,
  },
  doneBtnText: { fontSize: 16, fontWeight: "600" },
});
