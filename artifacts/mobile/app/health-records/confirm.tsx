import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function ConfirmScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    institutionId: string;
    institutionName: string;
    institutionType: string;
    institutionLocation: string;
  }>();

  const { institutionId, institutionName, institutionType, institutionLocation } = params;

  const handleConfirm = () => {
    router.push({
      pathname: "/health-records/portal-login",
      params: { institutionId, institutionName, institutionType, institutionLocation },
    } as never);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "Confirm Connection", headerBackTitle: "Back" }} />

      <View style={[styles.inner, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.topSection}>
          <View style={[styles.logoBox, { backgroundColor: colors.secondary }]}>
            <Feather name="activity" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.institutionName, { color: colors.foreground }]}>{institutionName}</Text>
          {institutionLocation && (
            <Text style={[styles.institutionMeta, { color: colors.mutedForeground }]}>
              {institutionType} · {institutionLocation}
            </Text>
          )}
        </View>

        <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="help-circle" size={20} color={colors.primary} />
          <Text style={[styles.questionText, { color: colors.foreground }]}>
            Do you have an existing patient account with{" "}
            <Text style={{ fontWeight: "700" }}>{institutionName}</Text>?
          </Text>
        </View>

        <View style={[styles.consentCard, { backgroundColor: colors.secondary, borderColor: colors.primary + "30" }]}>
          <Feather name="lock" size={16} color={colors.primary} />
          <Text style={[styles.consentText, { color: colors.primary }]}>
            By continuing, you authorize CareReward to access your health records from{" "}
            <Text style={{ fontWeight: "700" }}>{institutionName}</Text>. Your data is encrypted and HIPAA-compliant.
          </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Feather name="link" size={18} color="#fff" />
            <Text style={styles.confirmBtnText}>Confirm &amp; Connect</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: colors.border }]}
            onPress={handleCancel}
            activeOpacity={0.75}
          >
            <Text style={[styles.cancelBtnText, { color: colors.foreground }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 20,
  },
  topSection: { alignItems: "center", gap: 12 },
  logoBox: {
    width: 88,
    height: 88,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  institutionName: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  institutionMeta: { fontSize: 14, textAlign: "center" },
  questionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  questionText: { flex: 1, fontSize: 15, lineHeight: 22 },
  consentCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  consentText: { flex: 1, fontSize: 13, lineHeight: 19 },
  buttons: { gap: 12, marginTop: "auto" },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  confirmBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cancelBtn: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  cancelBtnText: { fontSize: 16, fontWeight: "600" },
});
