import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
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

// ─── Survey definition ─────────────────────────────────────────────────────

type OptionSet = "frequency" | "yesno" | "rating";

interface SurveyQuestion {
  id: string;
  text: string;
  type: OptionSet;
}

interface SurveySection {
  id: string;
  title: string;
  questions: SurveyQuestion[];
}

const SURVEY_SECTIONS: SurveySection[] = [
  {
    id: "communication",
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
    id: "understanding",
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
    id: "coordination",
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
    id: "office",
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
    id: "rating",
    title: "Overall Rating",
    questions: [
      {
        id: "q10",
        text: "Using 0–10, how would you rate this specialist overall?",
        type: "rating",
      },
    ],
  },
];

const TOTAL_QUESTIONS = SURVEY_SECTIONS.reduce(
  (sum, s) => sum + s.questions.length,
  0
);

// ─── Sub-components ────────────────────────────────────────────────────────

function FrequencyButtons({
  questionId,
  selected,
  onSelect,
}: {
  questionId: string;
  selected: string | undefined;
  onSelect: (qId: string, val: string) => void;
}) {
  const colors = useColors();
  const options = ["Never", "Sometimes", "Usually", "Always"];

  return (
    <View style={styles.optionGrid2x2}>
      {options.map((opt) => {
        const isSelected = selected === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[
              styles.optionBtn,
              {
                backgroundColor: isSelected ? colors.primary : colors.card,
                borderColor: isSelected ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onSelect(questionId, opt)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.optionBtnText,
                { color: isSelected ? "#fff" : colors.foreground },
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function YesNoButtons({
  questionId,
  selected,
  onSelect,
}: {
  questionId: string;
  selected: string | undefined;
  onSelect: (qId: string, val: string) => void;
}) {
  const colors = useColors();
  const options = ["Yes", "No"];

  return (
    <View style={styles.optionRow}>
      {options.map((opt) => {
        const isSelected = selected === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[
              styles.optionBtnHalf,
              {
                backgroundColor: isSelected ? colors.primary : colors.card,
                borderColor: isSelected ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onSelect(questionId, opt)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.optionBtnText,
                { color: isSelected ? "#fff" : colors.foreground },
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function RatingButtons({
  questionId,
  selected,
  onSelect,
}: {
  questionId: string;
  selected: string | undefined;
  onSelect: (qId: string, val: string) => void;
}) {
  const colors = useColors();
  const firstRow = ["0", "1", "2", "3", "4"];
  const secondRow = ["5", "6", "7", "8", "9"];

  const RatingBtn = ({ val }: { val: string }) => {
    const isSelected = selected === val;
    return (
      <TouchableOpacity
        style={[
          styles.ratingBtn,
          {
            backgroundColor: isSelected ? colors.primary : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
          },
        ]}
        onPress={() => onSelect(questionId, val)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.ratingBtnText,
            { color: isSelected ? "#fff" : colors.foreground },
          ]}
        >
          {val}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.ratingWrap}>
      <View style={styles.ratingRow}>
        {firstRow.map((v) => (
          <RatingBtn key={v} val={v} />
        ))}
      </View>
      <View style={styles.ratingRow}>
        {secondRow.map((v) => (
          <RatingBtn key={v} val={v} />
        ))}
      </View>
      <View style={styles.ratingRowStart}>
        <RatingBtn val="10" />
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────

export default function PatientSatisfactionSurveyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const opp = MOCK_OPPORTUNITIES.find((o) => o.id === id);
  const points = opp?.points ?? 10;

  // Extract provider name from description: "Care Quality - H+H Ultrasound" → "H+H Ultrasound"
  const providerName = useMemo(() => {
    const desc = opp?.description ?? "";
    const parts = desc.split(" - ");
    return parts.length > 1 ? parts.slice(1).join(" - ") : desc;
  }, [opp]);

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === TOTAL_QUESTIONS;

  useEffect(() => {
    navigation.setOptions({ title: "Patient Satisfaction Survey" });
  }, [navigation]);

  const handleSelect = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = () => {
    Alert.alert(
      "Survey Submitted!",
      `Thank you for your feedback. You've earned ${points} points.`,
      [
        {
          text: "Done",
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Intro card ──────────────────────────────────────────────── */}
        <View
          style={[
            styles.introCard,
            { backgroundColor: colors.primary + "15", borderColor: colors.primary },
          ]}
        >
          <View style={styles.introRow}>
            <View style={[styles.introIcon, { backgroundColor: colors.primary + "20" }]}>
              <Feather name="clipboard" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.introTitle, { color: colors.foreground }]}>
              {providerName || opp?.title || "Patient Satisfaction Survey"}
            </Text>
          </View>
          <Text style={[styles.introSub, { color: colors.mutedForeground }]}>
            Your feedback helps us improve care quality. Complete this survey to earn{" "}
            {points} points.
          </Text>
        </View>

        {/* ── Sections ─────────────────────────────────────────────────── */}
        {SURVEY_SECTIONS.map((section, si) => (
          <View key={section.id} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {section.title}
            </Text>

            {section.questions.map((q, qi) => (
              <View key={q.id} style={styles.question}>
                <Text style={[styles.questionText, { color: colors.foreground }]}>
                  {q.text}
                </Text>

                {q.type === "frequency" && (
                  <FrequencyButtons
                    questionId={q.id}
                    selected={answers[q.id]}
                    onSelect={handleSelect}
                  />
                )}
                {q.type === "yesno" && (
                  <YesNoButtons
                    questionId={q.id}
                    selected={answers[q.id]}
                    onSelect={handleSelect}
                  />
                )}
                {q.type === "rating" && (
                  <>
                    <Text style={[styles.ratingSubText, { color: colors.mutedForeground }]}>
                      (0 = Worst specialist possible, 10 = Best specialist possible)
                    </Text>
                    <RatingButtons
                      questionId={q.id}
                      selected={answers[q.id]}
                      onSelect={handleSelect}
                    />
                  </>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* ── Fixed footer ──────────────────────────────────────────────── */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 16 : 8),
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: allAnswered ? colors.primary : colors.primary + "60" },
          ]}
          onPress={handleSubmit}
          activeOpacity={allAnswered ? 0.85 : 1}
          disabled={!allAnswered}
        >
          <Text style={styles.submitBtnText}>Submit Survey</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 28,
  },

  // ── Intro card ────────────────────────────────────────────────────────
  introCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
    gap: 10,
  },
  introRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  introIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  introTitle: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
    lineHeight: 22,
  },
  introSub: {
    fontSize: 14,
    lineHeight: 20,
  },

  // ── Section ───────────────────────────────────────────────────────────
  section: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  ratingHint: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: -12,
  },

  // ── Question ──────────────────────────────────────────────────────────
  question: {
    gap: 12,
  },
  questionText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },

  // ── Frequency (2x2 grid) ──────────────────────────────────────────────
  optionGrid2x2: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionBtn: {
    width: "47.5%",
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  optionBtnText: {
    fontSize: 15,
    fontWeight: "500",
  },

  // ── Yes/No (full-width row) ───────────────────────────────────────────
  optionRow: {
    flexDirection: "row",
    gap: 10,
  },
  optionBtnHalf: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Rating (number grid) ──────────────────────────────────────────────
  ratingSubText: {
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 18,
    marginTop: -4,
  },
  ratingWrap: {
    gap: 10,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-start",
  },
  ratingRowStart: {
    flexDirection: "row",
    gap: 8,
  },
  ratingBtn: {
    width: 58,
    height: 58,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },

  // ── Footer ────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
