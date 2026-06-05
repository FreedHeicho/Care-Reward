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

type Urgency = "Normal" | "Urgent" | "Emergency";

const URGENCY_OPTIONS: { value: Urgency; label: string; timeframe: string }[] = [
  { value: "Normal", label: "Normal", timeframe: "3 to 6 weeks" },
  { value: "Urgent", label: "Urgent", timeframe: "1 to 3 days" },
  { value: "Emergency", label: "Emergency", timeframe: "Same day" },
];

function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  hint,
  keyboard,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
  hint?: string;
  keyboard?: "default" | "email-address" | "numeric" | "phone-pad";
}) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>
        {label}
        {required && <Text style={{ color: "#EF4444" }}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboard ?? "default"}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {hint && <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text>}
    </View>
  );
}

export default function LogUpcomingCareScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [procedure, setProcedure] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [referringProvider, setReferringProvider] = useState("");
  const [preferredGroup, setPreferredGroup] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("Normal");
  const [showUrgencyPicker, setShowUrgencyPicker] = useState(false);
  const [hasAppointment, setHasAppointment] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedUrgency = URGENCY_OPTIONS.find((u) => u.value === urgency)!;

  const handleSubmit = async () => {
    if (!procedure.trim() || !zipCode.trim()) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitted(true);
    setTimeout(() => router.back(), 1500);
  };

  if (submitted) {
    return (
      <View style={[styles.successContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.successIcon, { backgroundColor: colors.secondary }]}>
          <Feather name="check-circle" size={40} color={colors.primary} />
        </View>
        <Text style={[styles.successTitle, { color: colors.foreground }]}>
          Care Logged!
        </Text>
        <Text style={[styles.successDesc, { color: colors.mutedForeground }]}>
          We'll analyze your upcoming care and surface savings opportunities for you.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 100 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>
              Tell us about your care
            </Text>
            <Text style={[styles.heroDesc, { color: colors.mutedForeground }]}>
              Provide some basic details about your upcoming care
            </Text>
          </View>

          <TextField
            label="Procedure name"
            value={procedure}
            onChange={setProcedure}
            placeholder="Enter procedure name"
            required
          />

          <TextField
            label="Desired care location zip code"
            value={zipCode}
            onChange={setZipCode}
            placeholder="e.g., 10001, 10002, 10003 (multiple zip codes)"
            required
            keyboard="numeric"
          />

          <TextField
            label="Referring provider"
            value={referringProvider}
            onChange={setReferringProvider}
            placeholder="Enter referring provider name"
          />

          <TextField
            label="Any preferred provider group"
            value={preferredGroup}
            onChange={setPreferredGroup}
            placeholder="Enter preferred provider group"
          />

          {/* Urgency Selector */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              How urgent is the care?
            </Text>
            <TouchableOpacity
              style={[styles.urgencySelector, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={() => setShowUrgencyPicker(!showUrgencyPicker)}
            >
              <View style={styles.urgencySelectorContent}>
                <Text style={[styles.urgencyValue, { color: colors.foreground }]}>
                  {selectedUrgency.label}
                </Text>
                <Text style={[styles.urgencyTimeframe, { color: colors.mutedForeground }]}>
                  {selectedUrgency.timeframe}
                </Text>
              </View>
              <Feather
                name={showUrgencyPicker ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>

            {showUrgencyPicker && (
              <View style={[styles.urgencyOptions, { borderColor: colors.border, backgroundColor: colors.card }]}>
                {URGENCY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.urgencyOption,
                      { borderBottomColor: colors.border },
                      urgency === opt.value && { backgroundColor: colors.secondary },
                    ]}
                    onPress={() => {
                      setUrgency(opt.value);
                      setShowUrgencyPicker(false);
                    }}
                  >
                    <Text style={[styles.urgencyOptionLabel, { color: colors.foreground }]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.urgencyOptionTime, { color: colors.mutedForeground }]}>
                      {opt.timeframe}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Appointment Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setHasAppointment(!hasAppointment)}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: colors.primary,
                  backgroundColor: hasAppointment ? colors.primary : "transparent",
                },
              ]}
            >
              {hasAppointment && <Feather name="check" size={12} color="#fff" />}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.foreground }]}>
              I already have an appointment
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitBtn,
              {
                backgroundColor:
                  procedure.trim() && zipCode.trim() ? colors.primaryDark : colors.muted,
              },
            ]}
            onPress={handleSubmit}
            disabled={!procedure.trim() || !zipCode.trim()}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.submitBtnText,
                {
                  color: procedure.trim() && zipCode.trim() ? "#fff" : colors.mutedForeground,
                },
              ]}
            >
              Submit
            </Text>
            <Feather
              name="arrow-right"
              size={18}
              color={procedure.trim() && zipCode.trim() ? "#fff" : colors.mutedForeground}
            />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 20 },
  hero: { gap: 6 },
  heroTitle: { fontSize: 22, fontWeight: "800" },
  heroDesc: { fontSize: 14, lineHeight: 20 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600" },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },
  hint: { fontSize: 12, lineHeight: 16 },
  urgencySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  urgencySelectorContent: { flex: 1 },
  urgencyValue: { fontSize: 15, fontWeight: "500" },
  urgencyTimeframe: { fontSize: 12, marginTop: 2 },
  urgencyOptions: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 4,
  },
  urgencyOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  urgencyOptionLabel: { fontSize: 15, fontWeight: "500" },
  urgencyOptionTime: { fontSize: 12, marginTop: 2 },
  checkboxRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxLabel: { fontSize: 15, flex: 1 },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 16,
    marginTop: 8,
  },
  submitBtnText: { fontSize: 16, fontWeight: "700" },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { fontSize: 24, fontWeight: "800" },
  successDesc: { fontSize: 16, textAlign: "center", lineHeight: 24 },
});
