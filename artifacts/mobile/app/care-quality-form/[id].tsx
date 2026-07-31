import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MOCK_OPPORTUNITIES } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

// ── Types ─────────────────────────────────────────────────────────────────────

type AnswerType = "frequency" | "yesno" | "rating";

interface Question {
  id: string;
  text: string;
  type: AnswerType;
  note?: string;
}

interface Section {
  title: string;
  questions: Question[];
}

// ── Patient Satisfaction Survey (H+H Ultrasound) ──────────────────────────────

const PATIENT_SURVEY: Section[] = [
  {
    title: "Care Allied/Specialist Communication",
    questions: [
      {
        id: "q1",
        text: "How often did this specialist explain things in a way that was easy to understand?",
        type: "frequency",
      },
      {
        id: "q2",
        text: "How often did this specialist listen carefully to you?",
        type: "frequency",
      },
      {
        id: "q3",
        text: "How often did this specialist show respect for what you had to say?",
        type: "frequency",
      },
      {
        id: "q4",
        text: "How often did this specialist spend enough time with you?",
        type: "frequency",
      },
    ],
  },
  {
    title: "Condition-Specific Understanding & Care Plan",
    questions: [
      {
        id: "q5",
        text: "Did this specialist seem to understand your medical condition or symptoms?",
        type: "yesno",
      },
      {
        id: "q6",
        text: "Did this specialist explain your treatment options and next steps clearly?",
        type: "yesno",
      },
    ],
  },
  {
    title: "Care Coordination",
    questions: [
      {
        id: "q7",
        text: "Did this specialist seem informed about the care you received from your primary care provider or other doctors?",
        type: "yesno",
      },
      {
        id: "q8",
        text: "Did this specialist ensure you received follow-up on tests or imaging results?",
        type: "yesno",
      },
    ],
  },
  {
    title: "Office Experience",
    questions: [
      {
        id: "q9",
        text: "How often were the office staff respectful and helpful?",
        type: "frequency",
      },
    ],
  },
  {
    title: "Overall Rating",
    questions: [
      {
        id: "q10",
        text: "Using 0-10, how would you rate this specialist overall?",
        type: "rating",
        note: "(0 = Worst specialist possible, 10 = Best specialist possible)",
      },
    ],
  },
];

// ── Specialist Visit Review (Dr Cohen) ────────────────────────────────────────

const SPECIALIST_REVIEW: Section[] = [
  {
    title: "Access & Wait Times",
    questions: [
      {
        id: "s1",
        text: "How would you rate the ease of scheduling this appointment?",
        type: "frequency",
      },
      {
        id: "s2",
        text: "How long did you wait in the office before being seen?",
        type: "yesno", // repurposed as short/long using custom labels below
      },
    ],
  },
  {
    title: "Visit Quality",
    questions: [
      {
        id: "s3",
        text: "Did the specialist thoroughly review your medical history?",
        type: "yesno",
      },
      {
        id: "s4",
        text: "Did the specialist address all of your concerns during the visit?",
        type: "yesno",
      },
      {
        id: "s5",
        text: "How clearly did the specialist explain your diagnosis or findings?",
        type: "frequency",
      },
    ],
  },
  {
    title: "Follow-up & Next Steps",
    questions: [
      {
        id: "s6",
        text: "Did the specialist provide a clear care plan or next steps?",
        type: "yesno",
      },
      {
        id: "s7",
        text: "Were instructions for medications, tests, or referrals clearly communicated?",
        type: "yesno",
      },
    ],
  },
  {
    title: "Overall Satisfaction",
    questions: [
      {
        id: "s8",
        text: "Using 0-10, how satisfied were you with this specialist visit overall?",
        type: "rating",
        note: "(0 = Very dissatisfied, 10 = Very satisfied)",
      },
    ],
  },
];

// ── Option labels ─────────────────────────────────────────────────────────────

const FREQ_OPTIONS = ["Never", "Sometimes", "Usually", "Always"];
const YN_OPTIONS = ["Yes", "No"];
const RATING_OPTIONS = Array.from({ length: 11 }, (_, i) => String(i));

// ── Sub-components ────────────────────────────────────────────────────────────

function OptionButton({
  label,
  selected,
  onPress,
  hasError,
  style,
  colors,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  hasError: boolean;
  style?: any;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.optionBtn,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected
            ? colors.primary
            : hasError
              ? "#EF4444"
              : colors.border,
          borderWidth: hasError && !selected ? 1.5 : 1,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.optionBtnText,
          { color: selected ? "#fff" : colors.foreground },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function FrequencyGrid({
  questionId,
  answers,
  setAnswer,
  hasError,
  colors,
}: {
  questionId: string;
  answers: Record<string, string>;
  setAnswer: (id: string, val: string) => void;
  hasError: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.freqGrid}>
      {FREQ_OPTIONS.map((opt, i) => (
        <OptionButton
          key={opt}
          label={opt}
          selected={answers[questionId] === opt}
          onPress={() => setAnswer(questionId, opt)}
          hasError={hasError}
          style={styles.freqBtn}
          colors={colors}
        />
      ))}
    </View>
  );
}

function YesNoRow({
  questionId,
  answers,
  setAnswer,
  hasError,
  colors,
}: {
  questionId: string;
  answers: Record<string, string>;
  setAnswer: (id: string, val: string) => void;
  hasError: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.ynRow}>
      {YN_OPTIONS.map((opt) => (
        <OptionButton
          key={opt}
          label={opt}
          selected={answers[questionId] === opt}
          onPress={() => setAnswer(questionId, opt)}
          hasError={hasError}
          style={styles.ynBtn}
          colors={colors}
        />
      ))}
    </View>
  );
}

function RatingGrid({
  questionId,
  note,
  answers,
  setAnswer,
  hasError,
  colors,
}: {
  questionId: string;
  note?: string;
  answers: Record<string, string>;
  setAnswer: (id: string, val: string) => void;
  hasError: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  // Rows: [0-4], [5-9], [10]
  const rows = [
    RATING_OPTIONS.slice(0, 5),
    RATING_OPTIONS.slice(5, 10),
    RATING_OPTIONS.slice(10),
  ];
  return (
    <View style={{ gap: 8 }}>
      {note && (
        <Text style={[styles.ratingNote, { color: colors.mutedForeground }]}>
          {note}
        </Text>
      )}
      {rows.map((row, ri) => (
        <View key={ri} style={styles.ratingRow}>
          {row.map((opt) => (
            <OptionButton
              key={opt}
              label={opt}
              selected={answers[questionId] === opt}
              onPress={() => setAnswer(questionId, opt)}
              hasError={hasError}
              style={styles.ratingBtn}
              colors={colors}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

// ── Success Modal ─────────────────────────────────────────────────────────────

function SuccessModal({
  visible,
  onDone,
  colors,
}: {
  visible: boolean;
  onDone: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
          <View style={styles.modalCheckCircle}>
            <Feather name="check" size={36} color="#fff" />
          </View>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>
            You have submitted!
          </Text>
          <Text style={[styles.modalBody, { color: colors.mutedForeground }]}>
            Thank you for completing the survey. Your points have been added to
            your account.
          </Text>
          <TouchableOpacity
            style={[styles.modalBtn, { backgroundColor: colors.primary }]}
            onPress={onDone}
            activeOpacity={0.85}
          >
            <Text style={styles.modalBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function CareQualityFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const opp = MOCK_OPPORTUNITIES.find((o) => o.id === id);

  // Determine which form to show
  const isPatientSurvey = id === "opp-7" || (opp?.description?.includes("Ultrasound") ?? false);
  const sections = isPatientSurvey ? PATIENT_SURVEY : SPECIALIST_REVIEW;
  const allQuestions = sections.flatMap((s) => s.questions);

  const infoTitle = isPatientSurvey ? "H+H Ultrasound" : "Dr. Cohen – Specialist Visit";
  const infoDescription = isPatientSurvey
    ? "Your feedback helps us improve care quality. Complete this survey to earn 10 points."
    : "Share your experience to help us improve specialist care. Complete this review to earn 10 points.";

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const setAnswer = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
    setErrors((prev) => {
      const next = new Set(prev);
      next.delete(qId);
      return next;
    });
  };

  const allAnswered = allQuestions.every((q) => answers[q.id] !== undefined);

  const handleSubmit = () => {
    const unanswered = new Set(
      allQuestions.filter((q) => !answers[q.id]).map((q) => q.id),
    );
    if (unanswered.size > 0) {
      setErrors(unanswered);
      // Scroll to top to see first error
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setSubmitted(true);
  };

  const handleDone = () => {
    setSubmitted(false);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 96,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" },
          ]}
        >
          <View style={[styles.infoIcon, { backgroundColor: colors.primary + "25" }]}>
            <Feather name="clipboard" size={22} color={colors.primary} />
          </View>
          <View style={styles.infoText}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>
              {infoTitle}
            </Text>
            <Text style={[styles.infoDesc, { color: colors.mutedForeground }]}>
              {infoDescription}
            </Text>
          </View>
        </View>

        {/* Validation error banner */}
        {errors.size > 0 && (
          <View
            style={[
              styles.errorBanner,
              { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" },
            ]}
          >
            <Feather name="alert-circle" size={16} color="#DC2626" />
            <Text style={[styles.errorBannerText, { color: "#DC2626" }]}>
              Please answer all {errors.size} unanswered question
              {errors.size > 1 ? "s" : ""} before submitting.
            </Text>
          </View>
        )}

        {/* Sections */}
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {section.title}
            </Text>

            {section.questions.map((q) => {
              const hasError = errors.has(q.id);
              return (
                <View key={q.id} style={styles.questionBlock}>
                  <Text
                    style={[
                      styles.questionText,
                      { color: colors.foreground },
                      hasError && styles.questionTextError,
                    ]}
                  >
                    {q.text}
                  </Text>

                  {q.type === "frequency" && (
                    <FrequencyGrid
                      questionId={q.id}
                      answers={answers}
                      setAnswer={setAnswer}
                      hasError={hasError}
                      colors={colors}
                    />
                  )}
                  {q.type === "yesno" && (
                    <YesNoRow
                      questionId={q.id}
                      answers={answers}
                      setAnswer={setAnswer}
                      hasError={hasError}
                      colors={colors}
                    />
                  )}
                  {q.type === "rating" && (
                    <RatingGrid
                      questionId={q.id}
                      note={q.note}
                      answers={answers}
                      setAnswer={setAnswer}
                      hasError={hasError}
                      colors={colors}
                    />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Sticky Submit */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 16 : 8),
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.submitBtn,
            {
              backgroundColor: allAnswered ? colors.primary : colors.primary + "60",
            },
          ]}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>Submit Survey</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <SuccessModal visible={submitted} onDone={handleDone} colors={colors} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 20 },

  // Info card
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoText: { flex: 1, gap: 4 },
  infoTitle: { fontSize: 16, fontWeight: "800" },
  infoDesc: { fontSize: 13, lineHeight: 18 },

  // Error banner
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  errorBannerText: { fontSize: 13, flex: 1, fontWeight: "500" },

  // Section
  section: { gap: 18 },
  sectionTitle: { fontSize: 18, fontWeight: "800", lineHeight: 24 },

  // Question block
  questionBlock: { gap: 10 },
  questionText: { fontSize: 15, lineHeight: 22, fontWeight: "500" },
  questionTextError: { color: "#DC2626" },

  // Frequency 2×2 grid
  freqGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  freqBtn: { width: "47%" },

  // Yes / No row
  ynRow: { flexDirection: "row", gap: 10 },
  ynBtn: { flex: 1 },

  // Rating number grid
  ratingNote: { fontSize: 13, fontStyle: "italic" },
  ratingRow: { flexDirection: "row", gap: 8 },
  ratingBtn: {
    width: 56,
    height: 56,
    borderRadius: 12,
    paddingVertical: 0,
    paddingHorizontal: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  // Option button (base)
  optionBtn: {
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    minHeight: 52,
  },
  optionBtnText: { fontSize: 15, fontWeight: "600" },

  // Footer
  footer: { padding: 16, borderTopWidth: 1 },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalCheckCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  modalTitle: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  modalBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 280,
  },
  modalBtn: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  modalBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
