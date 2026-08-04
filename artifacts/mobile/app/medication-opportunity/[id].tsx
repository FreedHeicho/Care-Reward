import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
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
import { OpportunityDetailSkeleton } from "@/components/OpportunityDetailSkeleton";
import { useColors } from "@/hooks/useColors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_TOP = Math.round(SCREEN_HEIGHT * 0.3);
const DARK_TEAL = "#05503C";
const LIGHT_TEAL_BG = "#E8F5F2";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function BulletItem({ text, color }: { text: string; color?: string }) {
  const colors = useColors();
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.bulletDot, { backgroundColor: color ?? colors.primary }]} />
      <Text style={[styles.bulletText, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

function CheckItem({ text }: { text: string }) {
  const colors = useColors();
  return (
    <View style={styles.checkRow}>
      <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
        <Feather name="check" size={13} color="#fff" />
      </View>
      <Text style={[styles.checkText, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

function Accordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.accordionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={[styles.accordionTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.accordionChevron, { color: colors.mutedForeground }]}>
          {open ? "▲" : "▼"}
        </Text>
      </TouchableOpacity>
      {open && <View style={styles.accordionBody}>{children}</View>}
    </View>
  );
}

// ─── Overview screen content ──────────────────────────────────────────────────

function OverviewContent({ points, pointsMonthly }: { points: number; pointsMonthly: number }) {
  const colors = useColors();
  const [showComparison, setShowComparison] = useState(true);
  return (
    <>
      {/* ── Collapsible comparison toggle ─────────────────────────────── */}
      <TouchableOpacity
        style={[styles.compareToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setShowComparison((v) => !v)}
        activeOpacity={0.8}
      >
        <View style={styles.compareToggleLeft}>
          <View style={[styles.compareToggleIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="repeat" size={15} color={colors.primary} />
          </View>
          <Text style={[styles.compareToggleTitle, { color: colors.foreground }]}>
            Compare Options
          </Text>
        </View>
        <View style={styles.compareToggleRight}>
          <Text style={[styles.compareToggleLabel, { color: colors.mutedForeground }]}>
            {showComparison ? "Hide" : "Show"}
          </Text>
          <Feather
            name={showComparison ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.mutedForeground}
          />
        </View>
      </TouchableOpacity>

      {showComparison && (
        <>
          {/* Current Medication */}
          <View style={[styles.card, { backgroundColor: LIGHT_TEAL_BG, borderColor: colors.primary + "30" }]}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Current Medication</Text>
              <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>
                Brand Name • Your Pharmacy
              </Text>
            </View>
            <BulletItem text="Brand name medication" />
            <BulletItem text="Higher cost option" />
            <BulletItem text="Same active ingredient as generic" />
            <BulletItem text="No additional benefits over generic" />
          </View>

          {/* Generic Alternative */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Generic Alternative</Text>
              <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>
                Generic Equivalent
              </Text>
            </View>
            <BulletItem text="Generic equivalent" />
            <BulletItem text="Significantly lower cost" />
            <BulletItem text="Same effectiveness" />
            <BulletItem text="FDA approved generic" />
          </View>
        </>
      )}

      {/* What You'll Get */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>What You'll Get</Text>
        <CheckItem text="Save money on medication costs" />
        <CheckItem text="Same therapeutic benefits" />
        <CheckItem text="No change in effectiveness" />
        <CheckItem text="More affordable long-term treatment" />
      </View>

      {/* Points Breakdown */}
      <View style={styles.pointsSection}>
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Points Breakdown</Text>
        <View style={styles.pointsRow}>
          <View style={[styles.pointsCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.pointsCardLabel}>Immediate</Text>
            <Text style={styles.pointsCardValue}>{points}</Text>
          </View>
          <View style={[styles.pointsCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.pointsCardLabel}>Monthly</Text>
            <Text style={styles.pointsCardValue}>{pointsMonthly}</Text>
          </View>
        </View>
      </View>

      {/* How to Generate Doctor Note */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          How to Generate Doctor Note
        </Text>
        {[
          "Generate doctor note for medication substitution",
          "Review note content and add any custom information",
          "Choose delivery method for the note",
          "Submit note to your doctor for review",
        ].map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={[styles.stepBadge, { backgroundColor: DARK_TEAL }]}>
              <Text style={styles.stepNum}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
          </View>
        ))}
      </View>

      {/* What's in the Doctor Note */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          What's in the Doctor Note
        </Text>
        <BulletItem text="Current medication details" />
        <BulletItem text="Generic equivalent information" />
        <BulletItem text="Cost analysis comparison" />
        <BulletItem text="Patient consent for switch" />
        <BulletItem text="Pharmacy instructions" />
      </View>

      {/* Important Information */}
      <Accordion title="Important Information">
        {[
          "Generic medications are FDA approved and equivalent to brand names",
          "Your doctor will review the substitution before approving",
          "You can always switch back if needed",
          "Cost benefits may vary by pharmacy",
        ].map((item, i) => (
          <Text key={i} style={[styles.accordionItem, { color: colors.foreground }]}>
            • {item}
          </Text>
        ))}
      </Accordion>

      {/* FAQ */}
      <Accordion title="Frequently Asked Questions">
        {[
          {
            q: "Are generic medications as effective?",
            a: "Yes, they contain the same active ingredients",
          },
          { q: "Can I switch back to brand name?", a: "Yes, discuss with your doctor" },
          {
            q: "Will my insurance cover the generic?",
            a: "Most insurance plans prefer generics",
          },
          {
            q: "How long does the process take?",
            a: "Usually 1-2 weeks for doctor review",
          },
        ].map((item, i) => (
          <Text key={i} style={[styles.accordionItem, { color: colors.foreground }]}>
            • Q: {item.q} A: {item.a}
          </Text>
        ))}
      </Accordion>
    </>
  );
}

// ─── Step 1: Review Doctor Note ───────────────────────────────────────────────

function Step1Content({
  customNote,
  setCustomNote,
}: {
  customNote: string;
  setCustomNote: (v: string) => void;
}) {
  const colors = useColors();
  return (
    <ScrollView
      contentContainerStyle={styles.sheetScroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.sheetSectionLabel, { color: colors.foreground }]}>
        Medication Comparison
      </Text>

      {/* Current Medication */}
      <View style={[styles.sheetCard, { backgroundColor: LIGHT_TEAL_BG, borderColor: colors.primary + "30" }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Current Medication</Text>
        <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>
          Brand Name • Your Pharmacy
        </Text>
        <BulletItem text="Last filled: Recent Fill" />
        <BulletItem text="Brand name medication" />
        <BulletItem text="Higher cost option" />
      </View>

      {/* Generic Alternative */}
      <View style={[styles.sheetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Generic Alternative</Text>
        <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>
          Generic Equivalent
        </Text>
        <BulletItem text="Generic equivalent" />
        <BulletItem text="Significantly lower cost" />
        <BulletItem text="Same effectiveness" />
      </View>

      {/* What's Included */}
      <View style={[styles.sheetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          What's Included in the Note
        </Text>
        <CheckItem text="Brand name medication details" />
        <CheckItem text="Generic equivalent information" />
        <CheckItem text="FDA approval and rating" />
        <CheckItem text="Effectiveness comparison data" />
        <CheckItem text="Safety profile information" />
      </View>

      {/* Custom Note */}
      <View style={[styles.sheetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Custom Note (Optional)</Text>
        <TextInput
          style={[
            styles.noteInput,
            { borderColor: colors.border, color: colors.foreground },
          ]}
          placeholder="Add any additional information for your doctor..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          value={customNote}
          onChangeText={(t) => setCustomNote(t.slice(0, 500))}
          textAlignVertical="top"
        />
        <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
          {customNote.length}/500 characters
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Step 2: Choose Delivery Method ──────────────────────────────────────────

const DELIVERY_OPTIONS = [
  {
    id: "email-me",
    icon: "mail" as const,
    title: "Email to Me",
    desc: "Send to your registered email address",
  },
  {
    id: "download",
    icon: "download" as const,
    title: "Download PDF",
    desc: "Download directly to your device",
  },
  {
    id: "print",
    icon: "printer" as const,
    title: "Print Now",
    desc: "Send to nearby printer or save as PDF",
  },
  {
    id: "email-doctor",
    icon: "user" as const,
    title: "Email to Doctor",
    desc: "Send directly to your doctor",
  },
];

function Step2Content({
  deliveryMethod,
  setDeliveryMethod,
}: {
  deliveryMethod: string | null;
  setDeliveryMethod: (v: string) => void;
}) {
  const colors = useColors();
  return (
    <ScrollView
      contentContainerStyle={styles.sheetScroll}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.deliveryQuestion, { color: colors.foreground }]}>
        How would you like to receive your doctor note?
      </Text>

      {DELIVERY_OPTIONS.map((opt) => {
        const selected = deliveryMethod === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.deliveryCard,
              {
                backgroundColor: colors.card,
                borderColor: selected ? colors.primary : colors.border,
                borderWidth: selected ? 2 : 1,
              },
            ]}
            onPress={() => setDeliveryMethod(opt.id)}
            activeOpacity={0.85}
          >
            <View style={[styles.deliveryIcon, { backgroundColor: colors.primary + "18" }]}>
              <Feather name={opt.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.deliveryText}>
              <Text style={[styles.deliveryTitle, { color: colors.foreground }]}>
                {opt.title}
              </Text>
              <Text style={[styles.deliveryDesc, { color: colors.mutedForeground }]}>
                {opt.desc}
              </Text>
            </View>
            <View
              style={[
                styles.deliveryRadio,
                {
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.primary : "transparent",
                },
              ]}
            >
              {selected && <View style={styles.deliveryRadioDot} />}
            </View>
          </TouchableOpacity>
        );
      })}

      <View style={styles.deliveryEta}>
        <Feather name="clock" size={14} color={DARK_TEAL} />
        <Text style={[styles.deliveryEtaText, { color: DARK_TEAL }]}>
          Estimated delivery time: 2-3 minutes
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Step 3: Generating ───────────────────────────────────────────────────────

const GEN_STEPS = [
  "Analyzing medication data...",
  "Generating comparison report...",
  "Creating doctor note...",
  "Finalizing document...",
];

function Step3Content({ genStep }: { genStep: number }) {
  const colors = useColors();
  return (
    <View style={styles.genContainer}>
      {/* Icon */}
      <View style={styles.genIconWrap}>
        <View style={[styles.genIconCircle, { backgroundColor: colors.primary + "18" }]}>
          <Feather name="file-text" size={48} color={colors.primary} />
        </View>
      </View>

      <Text style={[styles.genTitle, { color: colors.foreground }]}>
        Generating comparison report...
      </Text>

      <View style={styles.genStepList}>
        {GEN_STEPS.map((step, i) => {
          const active = i < genStep;
          return (
            <View key={i} style={styles.genStepRow}>
              <View
                style={[
                  styles.genDot,
                  { backgroundColor: active ? colors.primary : colors.border },
                ]}
              />
              <Text
                style={[
                  styles.genStepText,
                  { color: active ? colors.foreground : colors.mutedForeground },
                ]}
              >
                {step}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Step 4: Success ──────────────────────────────────────────────────────────

function Step4Content() {
  const colors = useColors();
  return (
    <View style={styles.successContainer}>
      <View style={styles.successCheckWrap}>
        <View style={[styles.successCheckCircle, { backgroundColor: "#22C55E" }]}>
          <Feather name="check" size={40} color="#fff" />
        </View>
      </View>

      <Text style={[styles.successTitle, { color: colors.foreground }]}>
        Doctor Note Ready!
      </Text>

      <View style={[styles.successBadge, { backgroundColor: colors.primary + "18" }]}>
        <Text style={[styles.successBadgeText, { color: colors.primary }]}>
          Downloaded to your device
        </Text>
      </View>

      <View style={[styles.docCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="file-text" size={32} color="#3B82F6" />
        <Text style={[styles.docCardTitle, { color: colors.foreground }]}>
          Medication Comparison Note
        </Text>
        <Text style={[styles.docCardSub, { color: colors.mutedForeground }]}>
          Current Medication → Generic Alternative
        </Text>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function MedicationOpportunityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const bgScrollRef = useRef<ScrollView>(null);

  const opp = MOCK_OPPORTUNITIES.find((o) => o.id === id);
  const points = opp?.points ?? 50;
  const pointsMonthly = opp?.pointsMonthly ?? 50;

  const [step, setStep] = useState(0); // 0=overview, 1=review, 2=delivery, 3=generating, 4=success
  const [customNote, setCustomNote] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<string | null>(null);
  const [genStep, setGenStep] = useState(0);
  const [loading, setLoading] = useState(true);

  // Brief skeleton while screen mounts
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, []);

  // Set nav header title
  useEffect(() => {
    navigation.setOptions({ title: "Substitution Opportunity" });
  }, [navigation]);

  // Scroll background to bottom when entering stepper
  useEffect(() => {
    if (step === 1) {
      setTimeout(() => bgScrollRef.current?.scrollToEnd({ animated: false }), 50);
    }
  }, [step]);

  // Generation animation
  useEffect(() => {
    if (step !== 3) return;
    setGenStep(0);
    let gs = 0;
    const timer = setInterval(() => {
      gs++;
      setGenStep(gs);
      if (gs >= GEN_STEPS.length) {
        clearInterval(timer);
        setTimeout(() => setStep(4), 400);
      }
    }, 700);
    return () => clearInterval(timer);
  }, [step]);

  // Step titles
  const STEP_TITLES: Record<number, string> = {
    1: "Review Doctor Note",
    2: "Choose Delivery Method",
    3: "Generating Doctor Note",
    4: "Doctor Note Ready",
  };

  const handleBack = () => {
    if (step === 0) {
      router.back();
    } else if (step === 4) {
      router.back();
    } else {
      setStep((s) => Math.max(0, s - 1));
    }
  };

  const handleFooterAction = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else if (step === 2 && deliveryMethod) {
      setStep(3);
    } else if (step === 4) {
      router.back();
    }
  };

  const footerLabel =
    step === 0
      ? "Generate Doctor Note"
      : step === 1
      ? "Continue"
      : step === 2
      ? "Generate Note"
      : step === 4
      ? "Done"
      : null;

  const footerDisabled = step === 2 && !deliveryMethod;

  if (loading) return <OpportunityDetailSkeleton />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Background overview (always rendered) ──────────────────────────── */}
      <View
        style={[
          styles.bgWrap,
          step > 0 && { opacity: 0.35, pointerEvents: "none" as any },
        ]}
      >
        <ScrollView
          ref={bgScrollRef}
          contentContainerStyle={[
            styles.overviewScroll,
            { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={step === 0}
        >
          <OverviewContent points={points} pointsMonthly={pointsMonthly} />
        </ScrollView>
      </View>

      {/* ── Overview footer button ──────────────────────────────────────────── */}
      {step === 0 && (
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
            style={[styles.footerBtn, { backgroundColor: DARK_TEAL }]}
            onPress={handleFooterAction}
            activeOpacity={0.85}
          >
            <Text style={styles.footerBtnText}>{footerLabel}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Stepper sheet overlay ───────────────────────────────────────────── */}
      {step > 0 && (
        <View
          style={[
            styles.sheet,
            {
              top: SHEET_TOP,
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + (Platform.OS === "web" ? 16 : 8),
            },
          ]}
        >
          {/* Sheet header */}
          <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={handleBack} style={styles.sheetBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="arrow-left" size={20} color={colors.primary} />
              <Text style={[styles.sheetBackText, { color: colors.primary }]}>Back</Text>
            </TouchableOpacity>
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
              {STEP_TITLES[step]}
            </Text>
            <View style={styles.sheetBackSpacer} />
          </View>

          {/* Progress bar */}
          {step <= 3 && (
            <View style={styles.progressWrap}>
              <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
                Step {step} of 3
              </Text>
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: DARK_TEAL, width: `${(step / 3) * 100}%` },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Step content */}
          <View style={styles.sheetContent}>
            {step === 1 && (
              <Step1Content customNote={customNote} setCustomNote={setCustomNote} />
            )}
            {step === 2 && (
              <Step2Content
                deliveryMethod={deliveryMethod}
                setDeliveryMethod={setDeliveryMethod}
              />
            )}
            {step === 3 && <Step3Content genStep={genStep} />}
            {step === 4 && <Step4Content />}
          </View>

          {/* Sheet footer button */}
          {footerLabel && step !== 3 && (
            <View style={[styles.sheetFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.footerBtn,
                  {
                    backgroundColor: footerDisabled
                      ? colors.border
                      : step === 4
                      ? DARK_TEAL
                      : DARK_TEAL,
                  },
                ]}
                onPress={handleFooterAction}
                disabled={!!footerDisabled}
                activeOpacity={footerDisabled ? 1 : 0.85}
              >
                <Text
                  style={[
                    styles.footerBtnText,
                    footerDisabled && { color: colors.mutedForeground },
                  ]}
                >
                  {footerLabel}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Background overview ────────────────────────────────────────────────
  bgWrap: { flex: 1 },
  overviewScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },

  // ── Compare toggle ────────────────────────────────────────────────────
  compareToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 13,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  compareToggleLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  compareToggleIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  compareToggleTitle: { fontSize: 15, fontWeight: "700" },
  compareToggleRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  compareToggleLabel: { fontSize: 13, fontWeight: "500" },

  // ── Cards (shared) ────────────────────────────────────────────────────
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  cardTitle: { fontSize: 17, fontWeight: "700" },
  cardSubtitle: { fontSize: 13, marginTop: -4 },

  // ── Bullets & checks ─────────────────────────────────────────────────
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    flexShrink: 0,
  },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 20 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkText: { flex: 1, fontSize: 14, lineHeight: 20 },

  // ── Points breakdown ──────────────────────────────────────────────────
  pointsSection: { gap: 10 },
  sectionLabel: { fontSize: 17, fontWeight: "700" },
  pointsRow: { flexDirection: "row", gap: 12 },
  pointsCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    gap: 4,
  },
  pointsCardLabel: { color: "#ffffffcc", fontSize: 13, fontWeight: "500" },
  pointsCardValue: { color: "#fff", fontSize: 30, fontWeight: "800" },

  // ── Steps (overview) ─────────────────────────────────────────────────
  stepRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNum: { color: "#fff", fontSize: 15, fontWeight: "700" },
  stepText: { flex: 1, fontSize: 14, lineHeight: 20 },

  // ── Accordion ─────────────────────────────────────────────────────────
  accordionCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  accordionTitle: { fontSize: 16, fontWeight: "700" },
  accordionChevron: { fontSize: 12 },
  accordionBody: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  accordionItem: { fontSize: 14, lineHeight: 20 },

  // ── Footer ────────────────────────────────────────────────────────────
  footer: { paddingHorizontal: 16, paddingTop: 12 },
  footerBtn: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  footerBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // ── Sheet overlay ─────────────────────────────────────────────────────
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    overflow: "hidden",
    flexDirection: "column",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  sheetBack: { flexDirection: "row", alignItems: "center", gap: 4, minWidth: 60 },
  sheetBackText: { fontSize: 15, fontWeight: "600" },
  sheetBackSpacer: { minWidth: 60 },
  sheetTitle: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "700" },

  // ── Progress bar ──────────────────────────────────────────────────────
  progressWrap: { paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  progressLabel: { fontSize: 12, textAlign: "center" },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 2 },

  sheetContent: { flex: 1 },

  sheetFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },

  // ── Sheet scroll & cards ──────────────────────────────────────────────
  sheetScroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, gap: 14 },
  sheetCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  sheetSectionLabel: { fontSize: 17, fontWeight: "700" },

  noteInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 100,
  },
  charCount: { fontSize: 12, textAlign: "right" },

  // ── Delivery method ───────────────────────────────────────────────────
  deliveryQuestion: { fontSize: 17, fontWeight: "600", lineHeight: 24, marginBottom: 4 },
  deliveryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 14,
    padding: 16,
  },
  deliveryIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  deliveryText: { flex: 1, gap: 2 },
  deliveryTitle: { fontSize: 15, fontWeight: "700" },
  deliveryDesc: { fontSize: 13 },
  deliveryRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  deliveryRadioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  deliveryEta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    paddingTop: 4,
  },
  deliveryEtaText: { fontSize: 13, fontWeight: "600" },

  // ── Generation screen ─────────────────────────────────────────────────
  genContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 24, padding: 24 },
  genIconWrap: { marginBottom: 8 },
  genIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  genTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  genStepList: { gap: 12, alignSelf: "stretch" },
  genStepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  genDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  genStepText: { fontSize: 14 },

  // ── Success screen ────────────────────────────────────────────────────
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: 24,
  },
  successCheckWrap: { marginBottom: 4 },
  successCheckCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { fontSize: 24, fontWeight: "800", textAlign: "center" },
  successBadge: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  successBadgeText: { fontSize: 14, fontWeight: "600" },
  docCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 8,
    alignSelf: "stretch",
  },
  docCardTitle: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  docCardSub: { fontSize: 13, textAlign: "center" },
});
