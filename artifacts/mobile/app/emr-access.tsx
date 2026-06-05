import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
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

import { useColors } from "@/hooks/useColors";

export default function EmrAccessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saveUserId, setSaveUserId] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!userId.trim() || !password.trim()) return;
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Care made simple.
          </Text>
          <Text style={[styles.headline, { color: colors.foreground }]}>
            Sign in to your{"\n"}account.
          </Text>

          <View style={styles.registerRow}>
            <Text style={[styles.registerPrompt, { color: colors.foreground }]}>
              No account?{" "}
            </Text>
            <TouchableOpacity>
              <Text style={[styles.registerLink, { color: colors.primary }]}>Register now.</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.fieldsNote, { color: colors.mutedForeground }]}>
            All fields are required unless marked as optional.
          </Text>

          <View style={styles.form}>
            {/* User ID */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.foreground }]}>User ID</Text>
                <TouchableOpacity style={[styles.infoIcon, { borderColor: colors.border }]}>
                  <Feather name="info" size={12} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground },
                ]}
                value={userId}
                onChangeText={setUserId}
                placeholder="Enter your User ID"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>
                Enter the unique User ID you created during registration.
              </Text>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setSaveUserId(!saveUserId)}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: colors.primary,
                      backgroundColor: saveUserId ? colors.primary : "transparent",
                    },
                  ]}
                >
                  {saveUserId && <Feather name="check" size={12} color="#fff" />}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.foreground }]}>
                  Save User ID (optional)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Password */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
                <TouchableOpacity style={[styles.infoIcon, { borderColor: colors.border }]}>
                  <Feather name="info" size={12} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
              >
                <TextInput
                  style={[styles.inputInner, { color: colors.foreground }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={18}
                    color={colors.mutedForeground}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>
                Password must be at least 8 characters and include 1 letter and 1 number or 1 special character.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.signInBtn,
              {
                backgroundColor:
                  userId.trim() && password.trim() ? colors.primary : colors.muted,
              },
            ]}
            onPress={handleSignIn}
            disabled={!userId.trim() || !password.trim() || loading}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.signInBtnText,
                { color: userId.trim() && password.trim() ? "#fff" : colors.mutedForeground },
              ]}
            >
              Sign in
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.registerBtn, { borderColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.registerBtnText, { color: colors.primary }]}>Register now</Text>
          </TouchableOpacity>

          <View style={[styles.securityNote, { backgroundColor: colors.secondary }]}>
            <Feather name="lock" size={14} color={colors.primary} />
            <Text style={[styles.securityText, { color: colors.primary }]}>
              Your health data is encrypted and HIPAA-compliant
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  tagline: { fontSize: 16 },
  headline: { fontSize: 30, fontWeight: "900", lineHeight: 38 },
  registerRow: { flexDirection: "row", alignItems: "center" },
  registerPrompt: { fontSize: 15 },
  registerLink: { fontSize: 15, fontWeight: "700", textDecorationLine: "underline" },
  fieldsNote: { fontSize: 13 },
  form: { gap: 20 },
  field: { gap: 8 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: { fontSize: 15, fontWeight: "600" },
  infoIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  inputInner: { flex: 1, fontSize: 15 },
  fieldHint: { fontSize: 12, lineHeight: 17 },
  checkboxRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxLabel: { fontSize: 14, flex: 1 },
  signInBtn: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  signInBtnText: { fontSize: 16, fontWeight: "700" },
  registerBtn: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
  },
  registerBtnText: { fontSize: 16, fontWeight: "600" },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  securityText: { flex: 1, fontSize: 13 },
});
