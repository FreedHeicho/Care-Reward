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

type Urgency = "Urgent" | "Normal" | "Flexible";

const URGENCY_OPTIONS: { value: Urgency; label: string; timeframe: string }[] = [
  { value: "Urgent", label: "Urgent", timeframe: "1 to 2 weeks" },
  { value: "Normal", label: "Normal", timeframe: "3 to 6 weeks" },
  { value: "Flexible", label: "Flexible", timeframe: "No rush" },
];

function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  keyboard,
  rightIcon,
  onRightIconPress,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
  keyboard?: "default" | "email-address" | "numeric" | "phone-pad";
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>
        {label}
        {required && <Text style={{ color: "#B42318" }}> *</Text>}
      </Text>
      <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.input, { color: colors.foreground, flex: 1 }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType={keyboard ?? "default"}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.inputIcon}>
            <Feather name={rightIcon} size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>
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
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentProvider, setAppointmentProvider] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedUrgency = URGENCY_OPTIONS.find((u) => u.value === urgency)!;

  const isValid =
    procedure.trim() &&
    zipCode.trim() &&
    (!hasAppointment || (appointmentDate.trim() && appointmentProvider.trim()));

  const handleSubmit = async () => {
    if (!isValid) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitted(true);
    // Replace this screen so the back-stack goes to Opportunities, not back into the form
    setTimeout(() => router.replace("/care-site-alternatives?fromLog=true" as any), 900);
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
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Log Upcoming Care</Text>
        <View style={styles.closeBtn} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>
              Tell us about your care
            </Text>
            <Text style={[styles.heroDesc, { color: colors.mutedForeground }]}>
              Provide some basic details about your upcoming care
            </Text>
          </View>

          {/* Procedure name */}
          <TextField
            label="Procedure name *"
            value={procedure}
            onChange={setProcedure}
            placeholder="Enter procedure name"
            required={false}
          />

          {/* Zip code */}
          <TextField
            label="Desired care location zip code *"
            value={zipCode}
            onChange={setZipCode}
            placeholder="e.g., 10001, 10002, 10003 (multiple zip codes)"
            keyboard="numeric"
          />

          {/* Referring provider */}
          <TextField
            label="Referring provider (optional)"
            value={referringProvider}
            onChange={setReferringProvider}
            placeholder="Enter referring provider name"
          />

          {/* Preferred provider group */}
          <TextField
            label="Any preferred provider group (optional)"
            value={preferredGroup}
            onChange={setPreferredGroup}
            placeholder="Enter preferred provider group"
          />

          {/* Urgency */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              How urgent is the care?
            </Text>

            {/* Selector trigger */}
            <TouchableOpacity
              style={[
                styles.urgencySelector,
                { borderColor: colors.border, backgroundColor: colors.card },
                showUrgencyPicker && styles.urgencySelectorOpen,
              ]}
              onPress={() => setShowUrgencyPicker(!showUrgencyPicker)}
              activeOpacity={0.8}
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

            {/* Inline dropdown options */}
            {showUrgencyPicker && (
              <View style={[styles.urgencyOptions, { borderColor: colors.border, backgroundColor: colors.card }]}>
                {URGENCY_OPTIONS.map((opt, idx) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.urgencyOption,
                      idx < URGENCY_OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                      urgency === opt.value && { backgroundColor: colors.secondary },
                    ]}
                    onPress={() => {
                      setUrgency(opt.value);
                      setShowUrgencyPicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.urgencyOptionLabel,
                        { color: urgency === opt.value ? colors.primary : colors.foreground },
                      ]}
                    >
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

          {/* Appointment checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => {
              setHasAppointment(!hasAppointment);
              if (hasAppointment) {
                setAppointmentDate("");
                setAppointmentProvider("");
              }
            }}
            activeOpacity={0.7}
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
              {hasAppointment && <Feather name="check" size={13} color="#fff" />}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.foreground }]}>
              I already have an appointment
            </Text>
          </TouchableOpacity>

          {/* Path B — appointment details */}
          {hasAppointment && (
            <>
              <TextField
                label="Appointment date"
                value={appointmentDate}
                onChange={setAppointmentDate}
                placeholder="Select appointment date"
                rightIcon="calendar"
              />

              <TextField
                label="Appointment provider name"
                value={appointmentProvider}
                onChange={setAppointmentProvider}
                placeholder="Enter appointment provider name"
              />
            </>
          )}
        </ScrollView>

        {/* Fixed submit button */}
        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + 12, backgroundColor: colors.background, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: isValid ? "#05503C" : colors.muted },
            ]}
            onPress={handleSubmit}
            disabled={!isValid}
            activeOpacity={0.85}
          >
            <Text style={[styles.submitBtnText, { color: isValid ? "#fff" : colors.mutedForeground }]}>
              Submit
            </Text>
            <Feather name="arrow-right" size={18} color={isValid ? "#fff" : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  closeBtn: { width: 32, alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700" },

  /* Scroll */
  scroll: { paddingHorizontal: 20, paddingTop: 24, gap: 20 },

  /* Hero */
  hero: { gap: 6, marginBottom: 4 },
  heroTitle: { fontSize: 22, fontWeight: "800" },
  heroDesc: { fontSize: 14, lineHeight: 20 },

  /* Fields */
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  input: { fontSize: 15 },
  inputIcon: { paddingLeft: 8 },

  /* Urgency */
  urgencySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  urgencySelectorOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  urgencySelectorContent: { flex: 1 },
  urgencyValue: { fontSize: 15, fontWeight: "500" },
  urgencyTimeframe: { fontSize: 12, marginTop: 2 },
  urgencyOptions: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: "hidden",
  },
  urgencyOption: {
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  urgencyOptionLabel: { fontSize: 15, fontWeight: "500" },
  urgencyOptionTime: { fontSize: 12, marginTop: 2 },

  /* Checkbox */
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

  /* Footer */
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 16,
  },
  submitBtnText: { fontSize: 16, fontWeight: "700" },

  /* Success */
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
