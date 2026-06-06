import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MOCK_OPPORTUNITIES } from "@/constants/data";
import { MOCK_USER_PLAN } from "@/constants/data";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

function todayFormatted() {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function generateNoteBody(
  oppTitle: string,
  oppDescription: string,
  oppWhy: string,
  savings: number,
  memberName: string,
  memberId: string,
  planName: string,
  doctorName: string,
  date: string
) {
  return {
    date,
    doctorName,
    subject: `Medication Cost-Saving Request – ${oppTitle}`,
    body: `I am writing regarding a cost-saving opportunity identified through my health plan, ${planName}.

My plan has flagged the following opportunity: ${oppTitle}. ${oppDescription}

${oppWhy}

Switching to this alternative is estimated to save me $${savings} per month while maintaining equivalent therapeutic outcomes. My health plan fully supports this transition and has confirmed in-network coverage.

I would appreciate your review of this request and, if clinically appropriate, a prescription update at your earliest convenience. Please do not hesitate to contact my health plan at 1-800-CARE-REW if you need coverage details or clinical equivalence documentation.

Thank you for your continued care.`,
    closing: "Sincerely,",
    memberName,
    memberId,
    planName,
  };
}

export default function DoctorNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const opp = MOCK_OPPORTUNITIES.find((o) => o.id === id);
  const memberName = user?.name ?? "Member";
  const memberId = user?.memberId ?? MOCK_USER_PLAN.memberId;
  const planName = user?.planName ?? MOCK_USER_PLAN.planName;

  const [editing, setEditing] = useState(false);
  const [doctorName, setDoctorName] = useState("My Healthcare Provider");
  const [customBody, setCustomBody] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!opp) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Opportunity not found.</Text>
      </View>
    );
  }

  const note = generateNoteBody(
    opp.title,
    opp.description,
    opp.why,
    opp.savings,
    memberName,
    memberId,
    planName,
    doctorName,
    todayFormatted()
  );

  const bodyText = customBody ?? note.body;

  const fullText = `${note.date}

To: ${note.doctorName}
Re: ${note.subject}

Dear ${note.doctorName},

${bodyText}

${note.closing}
${note.memberName}
Member ID: ${note.memberId}
Plan: ${note.planName}`;

  const handleCopy = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({ message: fullText, title: note.subject });
    } catch {}
  };

  const handleToggleEdit = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (editing) {
      // confirm save
    }
    setEditing((e) => !e);
  };

  const handleReset = () => {
    Alert.alert("Reset Note", "Restore the original generated text?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        onPress: () => {
          setCustomBody(null);
          setDoctorName("My Healthcare Provider");
          setEditing(false);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info banner */}
        <View style={[styles.banner, { backgroundColor: colors.alertBg, borderLeftColor: colors.primary }]}>
          <Feather name="info" size={15} color={colors.primary} />
          <Text style={[styles.bannerText, { color: colors.foreground }]}>
            Bring this letter to your next appointment or send it to your provider's office.
          </Text>
        </View>

        {/* Letter card */}
        <View style={[styles.letterCard, { backgroundColor: "#fff", shadowColor: "#000" }]}>
          {/* Letter header / letterhead */}
          <View style={[styles.letterhead, { backgroundColor: "#05503C" }]}>
            <Text style={styles.letterheadTitle}>CareReward</Text>
            <Text style={styles.letterheadSub}>Member-Authorized Clinical Request</Text>
          </View>

          <View style={styles.letterBody}>
            {/* Date */}
            <Text style={styles.letterDate}>{note.date}</Text>

            {/* To field */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldMeta}>TO</Text>
              {editing ? (
                <TextInput
                  style={[styles.editInput, { borderColor: "#05503C" + "40", color: "#1A1A2E" }]}
                  value={doctorName}
                  onChangeText={setDoctorName}
                  placeholder="Doctor / Provider Name"
                  placeholderTextColor="#999"
                />
              ) : (
                <Text style={styles.letterTo}>{doctorName}</Text>
              )}
            </View>

            {/* RE line */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldMeta}>RE</Text>
              <Text style={[styles.letterRe, { color: "#05503C" }]}>{note.subject}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: "#E4E9F0" }]} />

            {/* Salutation */}
            <Text style={styles.letterSalutation}>Dear {doctorName},</Text>

            {/* Body */}
            {editing ? (
              <TextInput
                style={[
                  styles.editBodyInput,
                  { borderColor: "#05503C" + "40", color: "#1A1A2E" },
                ]}
                value={bodyText}
                onChangeText={(t) => setCustomBody(t)}
                multiline
                textAlignVertical="top"
                placeholder="Letter body…"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.letterBodyText}>{bodyText}</Text>
            )}

            {/* Closing */}
            <View style={[styles.divider, { backgroundColor: "#E4E9F0" }]} />
            <Text style={styles.letterClosing}>{note.closing}</Text>
            <Text style={styles.letterSignature}>{note.memberName}</Text>
            <View style={styles.signatureDetails}>
              <Text style={styles.signatureDetail}>Member ID: {note.memberId}</Text>
              <Text style={styles.signatureDetail}>Plan: {note.planName}</Text>
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: copied ? "#16A34A" : colors.primary,
                flex: 1,
              },
            ]}
            onPress={handleCopy}
            activeOpacity={0.85}
          >
            <Feather name={copied ? "check" : "copy"} size={17} color="#fff" />
            <Text style={styles.actionBtnText}>{copied ? "Copied!" : "Copy"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primaryDark, flex: 1 }]}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Feather name="share-2" size={17} color="#fff" />
            <Text style={styles.actionBtnText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtnOutline,
              {
                borderColor: editing ? "#16A34A" : colors.primary,
                backgroundColor: editing ? "#16A34A" + "15" : colors.primary + "10",
              },
            ]}
            onPress={handleToggleEdit}
            activeOpacity={0.85}
          >
            <Feather
              name={editing ? "check-circle" : "edit-2"}
              size={17}
              color={editing ? "#16A34A" : colors.primary}
            />
            <Text
              style={[
                styles.actionBtnOutlineText,
                { color: editing ? "#16A34A" : colors.primary },
              ]}
            >
              {editing ? "Done" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        {(customBody !== null || doctorName !== "My Healthcare Provider") && (
          <TouchableOpacity onPress={handleReset} style={styles.resetRow}>
            <Feather name="rotate-ccw" size={13} color={colors.mutedForeground} />
            <Text style={[styles.resetText, { color: colors.mutedForeground }]}>
              Reset to original generated text
            </Text>
          </TouchableOpacity>
        )}

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor: colors.muted }]}>
          <Text style={[styles.tipsTitle, { color: colors.foreground }]}>
            💡 Tips for using this note
          </Text>
          {[
            "Share it by email or text directly to your provider's office.",
            "Bring a printed copy to your next appointment.",
            "Edit the doctor name above if you know your provider.",
            "Your plan covers the alternative — no extra steps needed from you.",
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: "#05503C" }]} />
              <Text style={[styles.tipText, { color: colors.mutedForeground }]}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 16, paddingTop: 12, gap: 16 },
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
  },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 18 },
  letterCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  letterhead: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 2,
  },
  letterheadTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  letterheadSub: {
    color: "#ffffff80",
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  letterBody: { padding: 20, gap: 14, backgroundColor: "#fff" },
  letterDate: { fontSize: 13, color: "#7A8699" },
  fieldBlock: { gap: 3 },
  fieldMeta: {
    fontSize: 9,
    fontWeight: "800",
    color: "#7A8699",
    letterSpacing: 1,
  },
  letterTo: { fontSize: 14, fontWeight: "600", color: "#1A1A2E" },
  letterRe: { fontSize: 14, fontWeight: "700", lineHeight: 20 },
  divider: { height: 1 },
  letterSalutation: { fontSize: 15, color: "#1A1A2E", fontWeight: "500" },
  letterBodyText: { fontSize: 14, lineHeight: 22, color: "#2D3748" },
  letterClosing: { fontSize: 14, color: "#1A1A2E" },
  letterSignature: { fontSize: 15, fontWeight: "700", color: "#1A1A2E" },
  signatureDetails: { gap: 2 },
  signatureDetail: { fontSize: 12, color: "#7A8699" },
  editInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    fontWeight: "500",
  },
  editBodyInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    lineHeight: 22,
    minHeight: 220,
  },
  actions: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  actionBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  actionBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  actionBtnOutlineText: { fontSize: 15, fontWeight: "700" },
  resetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  resetText: { fontSize: 13 },
  tipsCard: { borderRadius: 14, padding: 16, gap: 10 },
  tipsTitle: { fontSize: 14, fontWeight: "700" },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  tipDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7, flexShrink: 0 },
  tipText: { flex: 1, fontSize: 13, lineHeight: 19 },
});
