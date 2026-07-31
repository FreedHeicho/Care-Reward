import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MOCK_OPPORTUNITIES } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

// ── Content ───────────────────────────────────────────────────────────────────

const WIZARD_CONTENT: Record<
  string,
  {
    pointATitle: string;
    pointASubtitle: string;
    pointABullets: string[];
    pointBTitle: string;
    pointBSubtitle: string;
    pointBBullets: string[];
    includedItems: string[];
    generatingSteps: string[];
    noteTitle: string;
    noteSubtitle: string;
  }
> = {
  "care-site-alternative": {
    pointATitle: "Current Care Site",
    pointASubtitle: "Emergency Room · Hospital",
    pointABullets: ["Last visit: Recent", "Emergency room visit", "Higher cost option"],
    pointBTitle: "Alternative Care Site",
    pointBSubtitle: "Urgent Care Equivalent",
    pointBBullets: ["Urgent care equivalent", "Significantly lower cost", "Same effectiveness"],
    includedItems: [
      "Current care site details",
      "Alternative site comparison",
      "FDA approval and rating",
      "Effectiveness comparison data",
      "Safety profile information",
    ],
    generatingSteps: [
      "Analyzing care site options...",
      "Generating comparison report...",
      "Creating care coordinator note...",
      "Finalizing document...",
    ],
    noteTitle: "Care Site Comparison Note",
    noteSubtitle: "Current Site → Alternative Site",
  },
  "care-protocol": {
    pointATitle: "Current Protocol",
    pointASubtitle: "Specialist Visit · Current Pathway",
    pointABullets: ["Last update: Recent", "Specialist-directed pathway", "Higher cost option"],
    pointBTitle: "Recommended Protocol",
    pointBSubtitle: "Evidence-Based Pathway",
    pointBBullets: [
      "Evidence-based equivalent",
      "Significantly lower cost",
      "Same clinical outcomes",
    ],
    includedItems: [
      "Current protocol details",
      "Recommended protocol information",
      "FDA approval and rating",
      "Effectiveness comparison data",
      "Safety profile information",
    ],
    generatingSteps: [
      "Analyzing protocol data...",
      "Generating comparison report...",
      "Creating care team note...",
      "Finalizing document...",
    ],
    noteTitle: "Care Protocol Comparison Note",
    noteSubtitle: "Current Protocol → Recommended Protocol",
  },
};

const DELIVERY_OPTIONS = [
  {
    id: "email-me",
    icon: "email-outline" as const,
    title: "Email to Me",
    description: "Send to your registered email address",
  },
  {
    id: "download-pdf",
    icon: "cellphone" as const,
    title: "Download PDF",
    description: "Download directly to your device",
  },
  {
    id: "print",
    icon: "printer-outline" as const,
    title: "Print Now",
    description: "Send to nearby printer or save as PDF",
  },
  {
    id: "email-doctor",
    icon: "doctor" as const,
    title: "Email to Doctor",
    description: "Send directly to your doctor",
  },
];

// ── Progress Bar ──────────────────────────────────────────────────────────────

function ProgressBar({ step, total, colors }: { step: number; total: number; colors: any }) {
  return (
    <View style={styles.progressContainer}>
      <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
        Step {step} of {total}
      </Text>
      <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colors.primary, width: `${(step / total) * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4; // 1=review, 2=delivery, 3=generating, 4=done

export default function DoctorNoteWizard() {
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const filterCategory = type ?? "care-site-alternative";
  const content = WIZARD_CONTENT[filterCategory] ?? WIZARD_CONTENT["care-site-alternative"];

  const [step, setStep] = useState<Step>(1);
  const [customNote, setCustomNote] = useState("");
  const [delivery, setDelivery] = useState<string | null>(null);

  // Generating step animation
  const [completedGeneratingSteps, setCompletedGeneratingSteps] = useState(0);

  useEffect(() => {
    if (step !== 3) return;
    setCompletedGeneratingSteps(0);
    const timers = content.generatingSteps.map((_, i) =>
      setTimeout(() => {
        setCompletedGeneratingSteps(i + 1);
        if (i === content.generatingSteps.length - 1) {
          setTimeout(() => setStep(4), 700);
        }
      }, (i + 1) * 900),
    );
    return () => timers.forEach(clearTimeout);
  }, [step]);

  const stepTitle =
    step === 1
      ? "Review Doctor Note"
      : step === 2
        ? "Choose Delivery Method"
        : step === 3
          ? "Generating Doctor Note"
          : "";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      {step !== 4 && (
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
          <TouchableOpacity
            onPress={() => (step > 1 ? setStep((s) => (s - 1) as Step) : router.back())}
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="arrow-left" size={18} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{stepTitle}</Text>
          <View style={{ width: 60 }} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
            flexGrow: step === 4 ? 1 : undefined,
            justifyContent: step === 4 ? "center" : undefined,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Step 1: Review ── */}
        {step === 1 && (
          <>
            <ProgressBar step={1} total={3} colors={colors} />

            {/* Medication Comparison label */}
            <Text style={[styles.comparisonLabel, { color: colors.foreground }]}>
              Care Comparison
            </Text>

            {/* Point A */}
            <View style={styles.cardA}>
              <Text style={styles.cardATitle}>{content.pointATitle}</Text>
              <Text style={styles.cardASub}>{content.pointASubtitle}</Text>
              {content.pointABullets.map((b, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.cardABullet}>• {b}</Text>
                </View>
              ))}
            </View>

            {/* Point B */}
            <View style={[styles.cardB, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardBTitle, { color: colors.foreground }]}>
                {content.pointBTitle}
              </Text>
              <Text style={[styles.cardBSub, { color: colors.mutedForeground }]}>
                {content.pointBSubtitle}
              </Text>
              {content.pointBBullets.map((b, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={[styles.bulletCircle, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.cardBBullet, { color: colors.foreground }]}>{b}</Text>
                </View>
              ))}
            </View>

            {/* What's included */}
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.infoCardTitle, { color: colors.foreground }]}>
                What's Included in the Note
              </Text>
              {content.includedItems.map((item, i) => (
                <View key={i} style={styles.checkRow}>
                  <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                    <Feather name="check" size={11} color="#fff" />
                  </View>
                  <Text style={[styles.checkText, { color: colors.foreground }]}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Custom note */}
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.infoCardTitle, { color: colors.foreground }]}>
                Custom Note (Optional)
              </Text>
              <TextInput
                style={[
                  styles.textarea,
                  { borderColor: colors.border, color: colors.foreground },
                ]}
                placeholder="Add any additional information for your doctor..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                maxLength={500}
                value={customNote}
                onChangeText={setCustomNote}
              />
              <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
                {customNote.length}/500 characters
              </Text>
            </View>
          </>
        )}

        {/* ── Step 2: Delivery ── */}
        {step === 2 && (
          <>
            <ProgressBar step={2} total={3} colors={colors} />

            <Text style={[styles.deliveryQuestion, { color: colors.foreground }]}>
              How would you like to receive your doctor note?
            </Text>

            {DELIVERY_OPTIONS.map((opt) => {
              const isSelected = delivery === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.deliveryCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setDelivery(opt.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.deliveryIcon, { backgroundColor: colors.primary + "18" }]}>
                    <MaterialCommunityIcons name={opt.icon} size={22} color={colors.primary} />
                  </View>
                  <View style={styles.deliveryText}>
                    <Text style={[styles.deliveryTitle, { color: colors.foreground }]}>
                      {opt.title}
                    </Text>
                    <Text style={[styles.deliveryDesc, { color: colors.mutedForeground }]}>
                      {opt.description}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radioOuter,
                      {
                        borderColor: isSelected ? colors.primary : colors.mutedForeground,
                        backgroundColor: isSelected ? colors.primary : "transparent",
                      },
                    ]}
                  >
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Estimated time */}
            <View style={[styles.estimateRow, { borderColor: colors.primary + "30", backgroundColor: colors.primary + "08" }]}>
              <Feather name="clock" size={16} color={colors.primary} />
              <Text style={[styles.estimateText, { color: colors.primary }]}>
                Estimated delivery time: 2–3 minutes
              </Text>
            </View>
          </>
        )}

        {/* ── Step 3: Generating ── */}
        {step === 3 && (
          <View style={styles.generatingContainer}>
            <ProgressBar step={3} total={3} colors={colors} />

            <View style={[styles.generatingIcon, { borderColor: colors.border }]}>
              <Feather name="file-text" size={48} color={colors.primary} />
            </View>

            <Text style={[styles.generatingTitle, { color: colors.foreground }]}>
              Generating comparison report...
            </Text>

            <View style={styles.generatingSteps}>
              {content.generatingSteps.map((gs, i) => {
                const done = i < completedGeneratingSteps;
                return (
                  <View key={i} style={styles.gStep}>
                    <View
                      style={[
                        styles.gDot,
                        { backgroundColor: done ? colors.primary : colors.muted },
                      ]}
                    />
                    <Text
                      style={[
                        styles.gStepText,
                        { color: done ? colors.foreground : colors.mutedForeground },
                      ]}
                    >
                      {gs}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Step 4: Done ── */}
        {step === 4 && (
          <View style={styles.successContainer}>
            <View style={styles.successCircle}>
              <Feather name="check" size={44} color="#fff" />
            </View>

            <Text style={[styles.successTitle, { color: colors.foreground }]}>
              Doctor Note Ready!
            </Text>

            <View style={[styles.downloadedBadge, { borderColor: colors.primary + "40", backgroundColor: colors.primary + "08" }]}>
              <Text style={[styles.downloadedText, { color: colors.primary }]}>
                Downloaded to your device
              </Text>
            </View>

            <View style={[styles.notePreviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="file-text" size={28} color={colors.primary} style={{ marginBottom: 8 }} />
              <Text style={[styles.notePreviewTitle, { color: colors.foreground }]}>
                {content.noteTitle}
              </Text>
              <Text style={[styles.notePreviewSub, { color: colors.mutedForeground }]}>
                {content.noteSubtitle}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky CTA */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.card,
            borderTopColor: step === 4 ? "transparent" : colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 16 : 8),
          },
        ]}
      >
        {step === 1 && (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
            onPress={() => setStep(2)}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>Continue</Text>
          </TouchableOpacity>
        )}
        {step === 2 && (
          <TouchableOpacity
            style={[
              styles.ctaBtn,
              { backgroundColor: delivery ? colors.primary : colors.muted },
            ]}
            onPress={() => delivery && setStep(3)}
            disabled={!delivery}
            activeOpacity={0.85}
          >
            <Text style={[styles.ctaBtnText, { color: delivery ? "#fff" : colors.mutedForeground }]}>
              Generate Note
            </Text>
          </TouchableOpacity>
        )}
        {step === 3 && (
          /* No button while generating */
          <View style={{ height: 0 }} />
        )}
        {step === 4 && (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const CARD_A_BG = "#E8F5F3";
const CARD_A_TEXT = "#0D4E47";

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, width: 60 },
  backText: { fontSize: 14, fontWeight: "600" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "700" },

  scroll: { padding: 16, gap: 14 },

  progressContainer: { gap: 6 },
  progressLabel: { fontSize: 13, textAlign: "center" },
  progressTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },

  comparisonLabel: { fontSize: 17, fontWeight: "800" },

  cardA: { backgroundColor: CARD_A_BG, borderRadius: 14, padding: 16, gap: 8 },
  cardATitle: { fontSize: 15, fontWeight: "800", color: CARD_A_TEXT },
  cardASub: { fontSize: 13, color: "#5B8C87", marginTop: -4 },
  cardABullet: { fontSize: 14, color: CARD_A_TEXT, flex: 1 },

  cardB: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 8 },
  cardBTitle: { fontSize: 15, fontWeight: "800" },
  cardBSub: { fontSize: 13, marginTop: -4 },
  cardBBullet: { fontSize: 14, flex: 1 },

  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  bulletCircle: { width: 8, height: 8, borderRadius: 4, marginTop: 7, flexShrink: 0 },

  infoCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  infoCardTitle: { fontSize: 15, fontWeight: "700" },

  checkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkText: { fontSize: 14, flex: 1 },

  textarea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    fontSize: 14,
    textAlignVertical: "top",
  },
  charCount: { fontSize: 12, textAlign: "right" },

  // Step 2 - delivery
  deliveryQuestion: { fontSize: 17, fontWeight: "700", lineHeight: 24 },
  deliveryCard: {
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deliveryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  deliveryText: { flex: 1 },
  deliveryTitle: { fontSize: 15, fontWeight: "700" },
  deliveryDesc: { fontSize: 13, marginTop: 2 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },

  estimateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  estimateText: { fontSize: 14, fontWeight: "600" },

  // Step 3 - generating
  generatingContainer: { alignItems: "center", gap: 20, paddingTop: 24 },
  generatingIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  generatingTitle: { fontSize: 18, fontWeight: "700" },
  generatingSteps: { width: "100%", gap: 12, paddingHorizontal: 8 },
  gStep: { flexDirection: "row", alignItems: "center", gap: 10 },
  gDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  gStepText: { fontSize: 15 },

  // Step 4 - success
  successContainer: { alignItems: "center", gap: 20, paddingTop: 32 },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { fontSize: 24, fontWeight: "800" },
  downloadedBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  downloadedText: { fontSize: 14, fontWeight: "600" },
  notePreviewCard: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 4,
  },
  notePreviewTitle: { fontSize: 15, fontWeight: "700", textAlign: "center" },
  notePreviewSub: { fontSize: 13, textAlign: "center" },

  footer: { padding: 16, borderTopWidth: 1 },
  ctaBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
