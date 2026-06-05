import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
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

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [memberId, setMemberId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise((r) => setTimeout(r, 900));
    await signIn(email, name);
    setLoading(false);
    router.replace("/(tabs)");
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
            {
              paddingTop: insets.top + 20,
              paddingBottom: insets.bottom + 32,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>

          <View style={styles.hero}>
            <Text style={[styles.headline, { color: colors.foreground }]}>
              Create your account
            </Text>
            <Text style={[styles.subheadline, { color: colors.mutedForeground }]}>
              Link your health plan and start earning rewards
            </Text>
          </View>

          <View style={styles.form}>
            {[
              { label: "Full Name", value: name, onChange: setName, placeholder: "Jane Smith", icon: "user" as const, keyboard: "default" as const },
              { label: "Email Address", value: email, onChange: setEmail, placeholder: "jane@example.com", icon: "mail" as const, keyboard: "email-address" as const },
              { label: "Member ID (optional)", value: memberId, onChange: setMemberId, placeholder: "MBR-XXXX-XXXX", icon: "credit-card" as const, keyboard: "default" as const },
            ].map((field) => (
              <View key={field.label} style={styles.field}>
                <Text style={[styles.label, { color: colors.foreground }]}>{field.label}</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { borderColor: colors.border, backgroundColor: colors.card },
                  ]}
                >
                  <Feather name={field.icon} size={18} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType={field.keyboard}
                    autoCapitalize={field.keyboard === "email-address" ? "none" : "words"}
                    autoCorrect={false}
                  />
                </View>
              </View>
            ))}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={[styles.consentBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Feather name="shield" size={16} color={colors.primary} />
              <Text style={[styles.consentText, { color: colors.secondaryForeground }]}>
                Your data is encrypted and HIPAA-compliant. We never sell personal health information.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.registerBtn, { backgroundColor: colors.primary }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.signInLink} onPress={() => router.back()}>
            <Text style={[styles.signInLinkText, { color: colors.mutedForeground }]}>
              Already have an account?{" "}
              <Text style={{ color: colors.primary, fontWeight: "600" }}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24, gap: 28 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  hero: { gap: 8 },
  headline: { fontSize: 30, fontWeight: "800", letterSpacing: -0.5 },
  subheadline: { fontSize: 16, lineHeight: 24 },
  form: { gap: 16 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  input: { flex: 1, fontSize: 16 },
  errorText: { color: "#EF4444", fontSize: 13 },
  consentBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  consentText: { flex: 1, fontSize: 13, lineHeight: 18 },
  registerBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  registerText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  signInLink: { alignItems: "center" },
  signInLinkText: { fontSize: 14 },
});
