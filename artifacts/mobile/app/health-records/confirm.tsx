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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "Add health system", headerBackTitle: "Back" }} />

      <View style={[styles.inner, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.topSection}>
          <View style={styles.logoBox}>
            <Feather name="home" size={42} color="#9CA3AF" />
          </View>
          <Text style={[styles.institutionName, { color: colors.foreground }]}>
            {institutionName}
          </Text>
        </View>

        <View style={styles.spacer} />

        <View style={styles.consentRow}>
          <View style={styles.checkCircle}>
            <Feather name="check" size={16} color="#fff" />
          </View>
          <Text style={[styles.consentText, { color: colors.foreground }]}>
            I confirm that I have an account with this health system and I agree to allow CareReward to retrieve my health records.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.connectBtn}
          onPress={handleConfirm}
          activeOpacity={0.85}
        >
          <Text style={styles.connectBtnText}>Connect account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  topSection: {
    alignItems: "center",
    gap: 20,
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  institutionName: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 30,
  },
  spacer: { flex: 1 },
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 20,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  consentText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
  },
  connectBtn: {
    backgroundColor: "#22C55E",
    borderRadius: 32,
    paddingVertical: 18,
    alignItems: "center",
  },
  connectBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
