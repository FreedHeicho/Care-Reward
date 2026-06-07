import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

/* ─── Types ─────────────────────────────────────────────── */
type StepId =
  | "activity"
  | "smoking"
  | "conditions"
  | "preventive"
  | "diet"
  | "stress"
  | "results";

interface SingleChoice {
  type: "single";
  key: keyof Answers;
  question: string;
  subtitle?: string;
  options: { label: string; icon: string; value: string; points: number }[];
}
interface MultiChoice {
  type: "multi";
  key: keyof Answers;
  question: string;
  subtitle?: string;
  options: { label: string; icon: string; value: string; penaltyIfSelected?: number }[];
}

type Step = SingleChoice | MultiChoice;

interface Answers {
  activity: string;
  smoking: string;
  conditions: string[];
  preventive: string;
  diet: string;
  stress: string;
}

/* ─── Question definitions ──────────────────────────────── */
const STEPS: Step[] = [
  {
    type: "single",
    key: "activity",
    question: "How active are you on a typical week?",
    subtitle: "Include walking, gym, sports, or any intentional movement",
    options: [
      { label: "Mostly sedentary", icon: "monitor", value: "sedentary", points: 5 },
      { label: "Light — walks, stretching", icon: "navigation", value: "light", points: 12 },
      { label: "Moderate — 3× / week", icon: "activity", value: "moderate", points: 18 },
      { label: "Active — 4–5× / week", icon: "zap", value: "active", points: 23 },
      { label: "Very active — daily", icon: "trending-up", value: "very_active", points: 25 },
    ],
  },
  {
    type: "single",
    key: "smoking",
    question: "What is your smoking status?",
    options: [
      { label: "Never smoked", icon: "check-circle", value: "never", points: 20 },
      { label: "Former smoker", icon: "clock", value: "former", points: 14 },
      { label: "Occasional smoker", icon: "wind", value: "occasional", points: 7 },
      { label: "Current smoker", icon: "x-circle", value: "current", points: 2 },
    ],
  },
  {
    type: "multi",
    key: "conditions",
    question: "Do you have any of the following conditions?",
    subtitle: "Select all that apply. This helps us surface relevant savings.",
    options: [
      { label: "Type 2 Diabetes", icon: "droplet", value: "diabetes", penaltyIfSelected: 4 },
      { label: "High Blood Pressure", icon: "activity", value: "hypertension", penaltyIfSelected: 3 },
      { label: "High Cholesterol", icon: "heart", value: "cholesterol", penaltyIfSelected: 3 },
      { label: "Asthma / COPD", icon: "wind", value: "asthma", penaltyIfSelected: 3 },
      { label: "Heart Disease", icon: "heart", value: "heart", penaltyIfSelected: 5 },
      { label: "None of the above", icon: "check-circle", value: "none" },
    ],
  },
  {
    type: "single",
    key: "preventive",
    question: "When did you last have a full preventive check-up?",
    subtitle: "Annual physical, lab work, and screenings",
    options: [
      { label: "Within the last 6 months", icon: "check-circle", value: "6mo", points: 20 },
      { label: "6–12 months ago", icon: "calendar", value: "12mo", points: 15 },
      { label: "1–2 years ago", icon: "clock", value: "2yr", points: 8 },
      { label: "More than 2 years ago", icon: "alert-circle", value: "2yr_plus", points: 3 },
      { label: "Not sure / never", icon: "help-circle", value: "unknown", points: 0 },
    ],
  },
  {
    type: "single",
    key: "diet",
    question: "How would you describe your typical diet?",
    options: [
      { label: "Mostly whole foods & vegetables", icon: "smile", value: "excellent", points: 20 },
      { label: "Balanced — some processed food", icon: "coffee", value: "good", points: 14 },
      { label: "Mixed — convenience foods often", icon: "shopping-bag", value: "fair", points: 8 },
      { label: "Mostly fast food / processed", icon: "x-circle", value: "poor", points: 3 },
    ],
  },
  {
    type: "single",
    key: "stress",
    question: "How often do you feel significantly stressed?",
    options: [
      { label: "Rarely or never", icon: "sun", value: "rarely", points: 15 },
      { label: "Once or twice a month", icon: "cloud", value: "monthly", points: 11 },
      { label: "A few times a week", icon: "cloud-drizzle", value: "weekly", points: 6 },
      { label: "Daily or almost daily", icon: "cloud-lightning", value: "daily", points: 2 },
    ],
  },
];

/* ─── Score computation ─────────────────────────────────── */
function computeScore(answers: Partial<Answers>): {
  total: number;
  breakdown: { label: string; score: number; max: number; color: string }[];
} {
  const activityStep = STEPS[0] as SingleChoice;
  const smokingStep = STEPS[1] as SingleChoice;
  const conditionsStep = STEPS[2] as MultiChoice;
  const preventiveStep = STEPS[3] as SingleChoice;
  const dietStep = STEPS[4] as SingleChoice;
  const stressStep = STEPS[5] as SingleChoice;

  const actPts = activityStep.options.find((o) => o.value === answers.activity)?.points ?? 0;
  const smokePts = smokingStep.options.find((o) => o.value === answers.smoking)?.points ?? 0;
  const prevPts = preventiveStep.options.find((o) => o.value === answers.preventive)?.points ?? 0;
  const dietPts = dietStep.options.find((o) => o.value === answers.diet)?.points ?? 0;
  const stressPts = stressStep.options.find((o) => o.value === answers.stress)?.points ?? 0;

  const conditions = answers.conditions ?? [];
  const hasNone = conditions.includes("none");
  const condPenalty = hasNone
    ? 0
    : conditions.reduce((acc, c) => {
        const opt = conditionsStep.options.find((o) => o.value === c);
        return acc + (opt?.penaltyIfSelected ?? 0);
      }, 0);
  const condScore = Math.max(0, 15 - condPenalty);

  const physicalScore = Math.round(((actPts + smokePts) / (25 + 20)) * 100);
  const preventiveScore = Math.round((prevPts / 20) * 100);
  const lifestyleScore = Math.round(((dietPts + stressPts) / (20 + 15)) * 100);
  const conditionsScore = Math.round((condScore / 15) * 100);

  const rawTotal = actPts + smokePts + prevPts + dietPts + stressPts + condScore;
  const maxTotal = 25 + 20 + 20 + 20 + 15 + 15;
  const total = Math.round((rawTotal / maxTotal) * 100);

  return {
    total,
    breakdown: [
      { label: "Physical Activity", score: physicalScore, max: 100, color: "#16A34A" },
      { label: "Preventive Care", score: preventiveScore, max: 100, color: "#2563EB" },
      { label: "Lifestyle & Diet", score: lifestyleScore, max: 100, color: "#D97706" },
      { label: "Health Conditions", score: conditionsScore, max: 100, color: "#7C3AED" },
    ],
  };
}

function scoreLabel(score: number): { label: string; color: string; emoji: string } {
  if (score >= 85) return { label: "Excellent", color: "#16A34A", emoji: "🏆" };
  if (score >= 70) return { label: "Good", color: "#2563EB", emoji: "💪" };
  if (score >= 55) return { label: "Fair", color: "#D97706", emoji: "📈" };
  return { label: "Needs Attention", color: "#DC2626", emoji: "🎯" };
}

function getRecommendations(
  answers: Partial<Answers>,
  score: number
): { title: string; body: string; savings: number; points: number; icon: string; color: string }[] {
  const recs: { title: string; body: string; savings: number; points: number; icon: string; color: string }[] = [];

  if (answers.activity === "sedentary" || answers.activity === "light") {
    recs.push({
      title: "Walking Program Incentive",
      body: "Earn points for logging 7,000+ steps/day. Your plan covers a gym membership discount.",
      savings: 40,
      points: 150,
      icon: "activity",
      color: "#16A34A",
    });
  }
  if (answers.smoking === "current" || answers.smoking === "occasional") {
    recs.push({
      title: "Quit Smoking Support",
      body: "Your plan fully covers nicotine replacement therapy and cessation coaching sessions.",
      savings: 85,
      points: 500,
      icon: "wind",
      color: "#DC2626",
    });
  }
  if (answers.preventive === "2yr_plus" || answers.preventive === "unknown") {
    recs.push({
      title: "Schedule Your Annual Physical",
      body: "Preventive visits are $0 copay on your plan. Completing it unlocks 200 bonus points.",
      savings: 120,
      points: 200,
      icon: "calendar",
      color: "#2563EB",
    });
  }
  if (answers.diet === "fair" || answers.diet === "poor") {
    recs.push({
      title: "Nutrition Counseling",
      body: "Your plan covers 3 dietitian visits per year at no cost. Improve your diet score to unlock more rewards.",
      savings: 90,
      points: 120,
      icon: "coffee",
      color: "#D97706",
    });
  }
  if (answers.stress === "daily" || answers.stress === "weekly") {
    recs.push({
      title: "Mental Health Support",
      body: "Access 6 free therapy sessions and mindfulness app subscriptions covered by your plan.",
      savings: 200,
      points: 100,
      icon: "heart",
      color: "#7C3AED",
    });
  }

  // Always add a preventive one if short
  if (recs.length < 2) {
    recs.push({
      title: "Switch to Mail-Order Pharmacy",
      body: "Get a 90-day supply of your medications at a 33% lower cost with home delivery.",
      savings: 45,
      points: 75,
      icon: "mail",
      color: "#0891B2",
    });
  }

  return recs.slice(0, 4);
}

/* ─── Ring progress component ───────────────────────────── */
function ScoreRing({ score, color }: { score: number; color: string }) {
  const size = 160;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {/* Background ring via View trick */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: color + "20",
        }}
      />
      {/* Foreground arc — approximated with border trick for RN */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: "transparent",
          borderTopColor: color,
          borderRightColor: score > 25 ? color : "transparent",
          borderBottomColor: score > 50 ? color : "transparent",
          borderLeftColor: score > 75 ? color : "transparent",
          transform: [{ rotate: "-90deg" }],
        }}
      />
      <Text style={{ fontSize: 36, fontWeight: "900", color }}>{score}</Text>
      <Text style={{ fontSize: 13, color: "#7A8699", fontWeight: "600" }}>/ 100</Text>
    </View>
  );
}

/* ─── Main screen ───────────────────────────────────────── */
export default function HealthAssessmentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [showResults, setShowResults] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;

  const currentStep = STEPS[stepIdx] as Step | undefined;
  const totalSteps = STEPS.length;

  const animateProgress = (toIdx: number) => {
    Animated.timing(progress, {
      toValue: toIdx / totalSteps,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  /* Single-choice answer */
  const handleSingle = async (key: keyof Answers, value: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = { ...answers, [key]: value };
    setAnswers(next);
    setTimeout(async () => {
      if (stepIdx < STEPS.length - 1) {
        animateProgress(stepIdx + 1);
        setStepIdx((i) => i + 1);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowResults(true);
      }
    }, 180);
  };

  /* Multi-choice toggle */
  const handleMulti = async (key: keyof Answers, value: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const prev = (answers[key] as string[]) ?? [];
    let next: string[];
    if (value === "none") {
      next = prev.includes("none") ? [] : ["none"];
    } else {
      const without = prev.filter((v) => v !== "none");
      next = without.includes(value) ? without.filter((v) => v !== value) : [...without, value];
    }
    setAnswers({ ...answers, [key]: next });
  };

  const handleMultiNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (stepIdx < STEPS.length - 1) {
      animateProgress(stepIdx + 1);
      setStepIdx((i) => i + 1);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowResults(true);
    }
  };

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (stepIdx > 0) {
      animateProgress(stepIdx - 1);
      setStepIdx((i) => i - 1);
    } else {
      router.back();
    }
  };

  /* ── Results view ───────────────────────────────────── */
  if (showResults) {
    const { total, breakdown } = computeScore(answers);
    const { label, color, emoji } = scoreLabel(total);
    const recs = getRecommendations(answers, total);
    const totalSavings = recs.reduce((s, r) => s + r.savings, 0);
    const totalPoints = recs.reduce((s, r) => s + r.points, 0);

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Score hero */}
          <View style={[styles.resultHero, { backgroundColor: color + "12" }]}>
            <Text style={[styles.resultEmoji]}>{emoji}</Text>
            <Text style={[styles.resultTitle, { color: colors.foreground }]}>
              Your Health Score
            </Text>
            <ScoreRing score={total} color={color} />
            <View style={[styles.scoreLabelBadge, { backgroundColor: color + "20" }]}>
              <Text style={[styles.scoreLabelText, { color }]}>{label}</Text>
            </View>
          </View>

          {/* Potential unlocked */}
          <View style={styles.unlockedRow}>
            <View style={[styles.unlockedCard, { backgroundColor: "#16A34A15", borderColor: "#16A34A30" }]}>
              <Feather name="dollar-sign" size={18} color="#16A34A" />
              <Text style={[styles.unlockedVal, { color: "#16A34A" }]}>${totalSavings}</Text>
              <Text style={[styles.unlockedLabel, { color: colors.mutedForeground }]}>potential savings/mo</Text>
            </View>
            <View style={[styles.unlockedCard, { backgroundColor: "#D9770615", borderColor: "#D9770630" }]}>
              <Feather name="star" size={18} color="#D97706" />
              <Text style={[styles.unlockedVal, { color: "#D97706" }]}>+{totalPoints}</Text>
              <Text style={[styles.unlockedLabel, { color: colors.mutedForeground }]}>points available</Text>
            </View>
          </View>

          {/* Category breakdown */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Score Breakdown</Text>
            {breakdown.map((cat) => (
              <View key={cat.label} style={styles.breakdownRow}>
                <View style={styles.breakdownTop}>
                  <Text style={[styles.breakdownLabel, { color: colors.foreground }]}>{cat.label}</Text>
                  <Text style={[styles.breakdownScore, { color: cat.color }]}>{cat.score}/100</Text>
                </View>
                <View style={[styles.breakdownTrack, { backgroundColor: cat.color + "20" }]}>
                  <View
                    style={[
                      styles.breakdownFill,
                      { width: `${cat.score}%` as any, backgroundColor: cat.color },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Recommendations */}
          <Text style={[styles.recsHeading, { color: colors.foreground }]}>
            Recommended for You
          </Text>
          {recs.map((rec, i) => (
            <View key={i} style={[styles.recCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.recIcon, { backgroundColor: rec.color + "18" }]}>
                <Feather name={rec.icon as any} size={20} color={rec.color} />
              </View>
              <View style={styles.recBody}>
                <Text style={[styles.recTitle, { color: colors.foreground }]}>{rec.title}</Text>
                <Text style={[styles.recDesc, { color: colors.mutedForeground }]}>{rec.body}</Text>
                <View style={styles.recMetrics}>
                  <View style={[styles.recBadge, { backgroundColor: "#16A34A15" }]}>
                    <Text style={[styles.recBadgeText, { color: "#16A34A" }]}>Save ${rec.savings}/mo</Text>
                  </View>
                  <View style={[styles.recBadge, { backgroundColor: "#D9770615" }]}>
                    <Text style={[styles.recBadgeText, { color: "#D97706" }]}>+{rec.points} pts</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {/* CTA */}
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/opportunities" as never)}
            activeOpacity={0.85}
          >
            <Feather name="zap" size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>View All Opportunities</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.retakeRow}
            onPress={() => { setShowResults(false); setStepIdx(0); setAnswers({}); animateProgress(0); }}
          >
            <Feather name="rotate-ccw" size={14} color={colors.mutedForeground} />
            <Text style={[styles.retakeText, { color: colors.mutedForeground }]}>Retake assessment</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  /* ── Question view ──────────────────────────────────── */
  const step = currentStep!;
  const multiAnswers = (answers[step.key] as string[]) ?? [];
  const canContinue = step.type === "multi" ? multiAnswers.length > 0 : false;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Step counter */}
        <View style={styles.stepMeta}>
          <Text style={[styles.stepCounter, { color: colors.mutedForeground }]}>
            Question {stepIdx + 1} of {totalSteps}
          </Text>
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i < stepIdx
                        ? colors.primary
                        : i === stepIdx
                        ? colors.primary
                        : colors.border,
                    opacity: i === stepIdx ? 1 : i < stepIdx ? 0.6 : 0.3,
                    width: i === stepIdx ? 18 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Question */}
        <View style={styles.questionBlock}>
          <Text style={[styles.question, { color: colors.foreground }]}>{step.question}</Text>
          {step.subtitle && (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{step.subtitle}</Text>
          )}
        </View>

        {/* Options */}
        <View style={styles.options}>
          {step.options.map((opt) => {
            const selected =
              step.type === "single"
                ? answers[step.key] === opt.value
                : multiAnswers.includes(opt.value);

            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.option,
                  {
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.primary + "10" : colors.card,
                  },
                ]}
                onPress={() =>
                  step.type === "single"
                    ? handleSingle(step.key, opt.value)
                    : handleMulti(step.key, opt.value)
                }
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.optionIcon,
                    {
                      backgroundColor: selected ? colors.primary + "20" : colors.muted,
                    },
                  ]}
                >
                  <Feather
                    name={opt.icon as any}
                    size={18}
                    color={selected ? colors.primary : colors.mutedForeground}
                  />
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    { color: selected ? colors.primary : colors.foreground, fontWeight: selected ? "700" : "500" },
                  ]}
                >
                  {opt.label}
                </Text>
                {selected && (
                  <Feather name="check-circle" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Multi-choice "Continue" button */}
        {step.type === "multi" && (
          <TouchableOpacity
            style={[
              styles.continueBtn,
              { backgroundColor: canContinue ? colors.primary : colors.border },
            ]}
            onPress={handleMultiNext}
            disabled={!canContinue}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.continueBtnText,
                { color: canContinue ? "#fff" : colors.mutedForeground },
              ]}
            >
              Continue
            </Text>
            <Feather name="arrow-right" size={18} color={canContinue ? "#fff" : colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Back button */}
      <TouchableOpacity
        style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={handleBack}
      >
        <Feather name="arrow-left" size={18} color={colors.foreground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressTrack: { height: 4, width: "100%" },
  progressFill: { height: 4, borderRadius: 2 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 20 },

  stepMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepCounter: { fontSize: 13, fontWeight: "600" },
  dots: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { height: 6, borderRadius: 3 },

  questionBlock: { gap: 8 },
  question: { fontSize: 22, fontWeight: "800", lineHeight: 28 },
  subtitle: { fontSize: 14, lineHeight: 20 },

  options: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionLabel: { flex: 1, fontSize: 15, lineHeight: 20 },

  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 4,
  },
  continueBtnText: { fontSize: 16, fontWeight: "700" },

  backBtn: {
    position: "absolute",
    bottom: 32,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  /* Results */
  resultHero: { borderRadius: 20, padding: 24, alignItems: "center", gap: 12 },
  resultEmoji: { fontSize: 36 },
  resultTitle: { fontSize: 18, fontWeight: "700" },
  scoreLabelBadge: { paddingHorizontal: 18, paddingVertical: 6, borderRadius: 20 },
  scoreLabelText: { fontSize: 14, fontWeight: "800" },

  unlockedRow: { flexDirection: "row", gap: 12 },
  unlockedCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  unlockedVal: { fontSize: 22, fontWeight: "900" },
  unlockedLabel: { fontSize: 11, textAlign: "center", lineHeight: 14 },

  section: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },

  breakdownRow: { gap: 6 },
  breakdownTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  breakdownLabel: { fontSize: 13, fontWeight: "600" },
  breakdownScore: { fontSize: 13, fontWeight: "700" },
  breakdownTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  breakdownFill: { height: 8, borderRadius: 4 },

  recsHeading: { fontSize: 18, fontWeight: "800", paddingTop: 4 },
  recCard: {
    flexDirection: "row",
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "flex-start",
  },
  recIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  recBody: { flex: 1, gap: 6 },
  recTitle: { fontSize: 14, fontWeight: "700" },
  recDesc: { fontSize: 13, lineHeight: 18 },
  recMetrics: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  recBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  recBadgeText: { fontSize: 12, fontWeight: "700" },

  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 17,
  },
  ctaBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  retakeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingBottom: 8,
  },
  retakeText: { fontSize: 13 },
});
