import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

import { useColors } from "@/hooks/useColors";
import { useHealthRecords } from "@/context/HealthRecordsContext";
import { HealthSystem } from "@/context/HealthRecordsContext";

export default function PortalLoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addSystem } = useHealthRecords();
  const params = useLocalSearchParams<{
    institutionId: string;
    institutionName: string;
    institutionType: string;
    institutionLocation: string;
  }>();

  const { institutionId, institutionName, institutionType, institutionLocation } = params;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const canSubmit = username.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const newSystem: HealthSystem = {
      id: institutionId ?? `sys-${Date.now()}`,
      name: institutionName ?? "Unknown",
      type: (institutionType as HealthSystem["type"]) ?? "Hospital",
      location: institutionLocation ?? "",
      connectedAt: dateStr,
      lastSynced: dateStr,
      status: "connected",
    };
    addSystem(newSystem);
    setLoading(false);
    setSuccess(true);

    await new Promise((r) => setTimeout(r, 1200));
    router.push("/emr-access" as never);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen options={{ title: institutionName ?? "Patient Portal", headerBackTitle: "Back" }} />

      {success ? (
        <View style={styles.successWrap}>
          <View style={[styles.successIcon, { backgroundColor: "#D1FAE5" }]}>
            <Feather name="check-circle" size={48} color="#10B981" />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Connected!</Text>
          <Text style={[styles.successDesc, { color: colors.mutedForeground }]}>
            {institutionName} has been linked to your CareReward account. Your records are syncing.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Institution branding */}
          <View style={styles.header}>
            <View style={[styles.institutionLogo, { backgroundColor: colors.secondary }]}>
              <Feather name="activity" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.institutionName, { color: colors.foreground }]}>{institutionName}</Text>
            <Text style={[styles.institutionSub, { color: colors.mutedForeground }]}>Patient Portal</Text>
          </View>

          <View style={[styles.loginCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.loginTitle, { color: colors.foreground }]}>Sign in to your account</Text>
            <Text style={[styles.loginDesc, { color: colors.mutedForeground }]}>
              Use your existing patient portal credentials to grant CareReward access.
            </Text>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.foreground }]}>Username</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground }]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your username"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
                <View style={[styles.passwordRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <TextInput
                    style={[styles.passwordInput, { color: colors.foreground }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Feather name={showPassword ? "eye" : "eye-off"} size={18} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: canSubmit ? colors.primary : colors.muted }]}
              onPress={handleLogin}
              disabled={!canSubmit || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.loginBtnText, { color: canSubmit ? "#fff" : colors.mutedForeground }]}>
                  Sign In
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.securityNote, { backgroundColor: colors.secondary }]}>
            <Feather name="lock" size={14} color={colors.primary} />
            <Text style={[styles.securityText, { color: colors.primary }]}>
              Your credentials are never stored. CareReward uses read-only FHIR access.
            </Text>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 24, gap: 20 },
  header: { alignItems: "center", gap: 8 },
  institutionLogo: {
    width: 76,
    height: 76,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  institutionName: { fontSize: 18, fontWeight: "800", textAlign: "center" },
  institutionSub: { fontSize: 14 },
  loginCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  loginTitle: { fontSize: 18, fontWeight: "700" },
  loginDesc: { fontSize: 13, lineHeight: 19, marginTop: -8 },
  form: { gap: 16 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600" },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  passwordInput: { flex: 1, fontSize: 15 },
  loginBtn: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  loginBtnText: { fontSize: 16, fontWeight: "700" },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    padding: 12,
  },
  securityText: { flex: 1, fontSize: 13 },
  successWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { fontSize: 26, fontWeight: "800" },
  successDesc: { fontSize: 15, textAlign: "center", lineHeight: 22 },
});
