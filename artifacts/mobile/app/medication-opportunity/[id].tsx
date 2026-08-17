/**
 * Medication Opportunity Screen
 *
 * Shows two parallel workflows for a single medication opportunity:
 *
 * A) Generic Substitution (Norvasc → Amlodipine)
 *    Step 1 — Accept recommendation
 *    Step 2 — Choose: Care Reward sends to doctor  OR  Printout to take yourself
 *    Step 3 — Acknowledgement / close opportunity
 *
 * B) Refill Location Switch (CVS Pharmacy → CR Mail Order)
 *    Step 1 — Accept recommendation
 *    Step 2 — Enter delivery address
 *    Step 3 — Acknowledgement / close opportunity
 */

import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

import { OpportunityDetailSkeleton } from "@/components/OpportunityDetailSkeleton";
import { MOCK_OPPORTUNITIES } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const DARK_TEAL = "#05503C";
const LIGHT_TEAL_BG = "#E8F5F2";

// ─── Types ────────────────────────────────────────────────────────────────────

type Flow = "substitution" | "refill" | null;
// step 0 = overview, 1 = accept, 2 = method/address, 3 = acknowledgement
type Step = 0 | 1 | 2 | 3;

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

function SectionHeading({ label }: { label: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionHeading, { color: colors.mutedForeground }]}>
      {label.toUpperCase()}
    </Text>
  );
}

// ─── Drug comparison cards (overview) ────────────────────────────────────────

function DrugComparisonCards() {
  const colors = useColors();
  return (
    <View style={styles.compRow}>
      {/* Branded */}
      <View
        style={[
          styles.compCard,
          { backgroundColor: LIGHT_TEAL_BG, borderColor: colors.primary + "40" },
        ]}
      >
        <Text style={[styles.compTag, { color: colors.mutedForeground }]}>Branded</Text>
        <Text style={[styles.compDrug, { color: colors.foreground }]}>Norvasc</Text>
        <Text style={[styles.compSub, { color: colors.mutedForeground }]}>Amlodipine besylate</Text>
        <View style={[styles.compCostBadge, { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" }]}>
          <Text style={[styles.compCostText, { color: "#DC2626" }]}>Higher cost</Text>
        </View>
        <BulletItem text="Brand-name pricing" />
        <BulletItem text="Same active ingredient" />
      </View>

      {/* Arrow */}
      <View style={styles.compArrow}>
        <Feather name="arrow-right" size={20} color={DARK_TEAL} />
      </View>

      {/* Generic */}
      <View
        style={[
          styles.compCard,
          { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 2 },
        ]}
      >
        <View style={styles.compRecommendedRow}>
          <Text style={[styles.compTag, { color: colors.mutedForeground }]}>Generic</Text>
          <View style={[styles.recBadge, { backgroundColor: DARK_TEAL }]}>
            <Text style={styles.recBadgeText}>Recommended</Text>
          </View>
        </View>
        <Text style={[styles.compDrug, { color: colors.foreground }]}>Amlodipine</Text>
        <Text style={[styles.compSub, { color: colors.mutedForeground }]}>Amlodipine generic</Text>
        <View style={[styles.compCostBadge, { backgroundColor: "#F0FDF4", borderColor: "#86EFAC" }]}>
          <Text style={[styles.compCostText, { color: "#16A34A" }]}>Lower cost ✓</Text>
        </View>
        <BulletItem text="FDA-approved equivalent" />
        <BulletItem text="Same effectiveness" />
      </View>
    </View>
  );
}

// ─── Refill location comparison (overview) ────────────────────────────────────

function RefillComparisonCards() {
  const colors = useColors();
  return (
    <View style={styles.locationStack}>
      {/* Current */}
      <View
        style={[
          styles.locationCard,
          { backgroundColor: LIGHT_TEAL_BG, borderColor: colors.primary + "30" },
        ]}
      >
        <View style={styles.locationLeft}>
          <View style={[styles.locationIconWrap, { backgroundColor: colors.primary + "20" }]}>
            <Feather name="map-pin" size={18} color={colors.primary} />
          </View>
          <View style={styles.locationText}>
            <Text style={[styles.locationLabel, { color: colors.mutedForeground }]}>
              Current location
            </Text>
            <Text style={[styles.locationName, { color: colors.foreground }]}>
              CVS Pharmacy Midtown
            </Text>
            <Text style={[styles.locationZip, { color: colors.mutedForeground }]}>
              ZIP 10006
            </Text>
          </View>
        </View>
        <View style={[styles.costPill, { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" }]}>
          <Text style={[styles.costPillText, { color: "#DC2626" }]}>Higher cost</Text>
        </View>
      </View>

      {/* Arrow */}
      <View style={styles.locationArrow}>
        <Feather name="arrow-down" size={18} color={DARK_TEAL} />
      </View>

      {/* Proposed */}
      <View
        style={[
          styles.locationCard,
          { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 2 },
        ]}
      >
        <View style={styles.locationLeft}>
          <View style={[styles.locationIconWrap, { backgroundColor: DARK_TEAL + "18" }]}>
            <Feather name="package" size={18} color={DARK_TEAL} />
          </View>
          <View style={styles.locationText}>
            <Text style={[styles.locationLabel, { color: colors.mutedForeground }]}>
              Proposed location
            </Text>
            <Text style={[styles.locationName, { color: colors.foreground }]}>
              CR Mail Order
            </Text>
            <Text style={[styles.locationZip, { color: colors.mutedForeground }]}>
              Delivered to your door
            </Text>
          </View>
        </View>
        <View style={[styles.costPill, { backgroundColor: "#F0FDF4", borderColor: "#86EFAC" }]}>
          <Text style={[styles.costPillText, { color: "#16A34A" }]}>Save more ✓</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Overview section card ────────────────────────────────────────────────────

function OpportunityCard({
  icon,
  iconBg,
  title,
  subtitle,
  points,
  pointsMonthly,
  children,
  ctaLabel,
  onCta,
}: {
  icon: keyof typeof Feather.glyphMap;
  iconBg: string;
  title: string;
  subtitle: string;
  points: number;
  pointsMonthly: number;
  children: React.ReactNode;
  ctaLabel: string;
  onCta: () => void;
}) {
  const colors = useColors();
  return (
    <View style={[styles.oppCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.oppCardHeader}>
        <View style={[styles.oppCardIcon, { backgroundColor: iconBg }]}>
          <Feather name={icon} size={22} color={DARK_TEAL} />
        </View>
        <View style={styles.oppCardTitles}>
          <Text style={[styles.oppCardTitle, { color: colors.foreground }]}>{title}</Text>
          <Text style={[styles.oppCardSub, { color: colors.mutedForeground }]}>{subtitle}</Text>
        </View>
        {/* Points pill */}
        <View style={[styles.oppPtsPill, { backgroundColor: DARK_TEAL + "15" }]}>
          <Feather name="star" size={12} color={DARK_TEAL} />
          <Text style={[styles.oppPtsText, { color: DARK_TEAL }]}>
            {points}{pointsMonthly > 0 ? ` + ${pointsMonthly}/mo` : ""} pts
          </Text>
        </View>
      </View>

      {/* Content */}
      {children}

      {/* CTA */}
      <TouchableOpacity
        style={[styles.oppCta, { backgroundColor: DARK_TEAL }]}
        onPress={onCta}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        <Text style={styles.oppCtaText}>{ctaLabel}</Text>
        <Feather name="arrow-right" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 1: Accept recommendation ───────────────────────────────────────────

function AcceptStep({
  flow,
  onAccept,
}: {
  flow: Flow;
  onAccept: () => void;
}) {
  const colors = useColors();
  const isSub = flow === "substitution";

  return (
    <ScrollView
      contentContainerStyle={styles.stepScroll}
      showsVerticalScrollIndicator={false}
    >
      {isSub ? (
        <>
          <Text style={[styles.stepQuestion, { color: colors.foreground }]}>
            Switch to the generic version of your blood pressure medication?
          </Text>

          {/* Drug highlight */}
          <View style={[styles.drugHighlight, { backgroundColor: LIGHT_TEAL_BG, borderColor: colors.primary + "40" }]}>
            <View style={styles.drugRow}>
              <View style={styles.drugItem}>
                <Text style={[styles.drugLabel, { color: colors.mutedForeground }]}>Branded</Text>
                <Text style={[styles.drugName, { color: colors.foreground }]}>Norvasc</Text>
              </View>
              <Feather name="arrow-right" size={20} color={DARK_TEAL} style={{ marginTop: 16 }} />
              <View style={styles.drugItem}>
                <Text style={[styles.drugLabel, { color: colors.mutedForeground }]}>Generic</Text>
                <Text style={[styles.drugName, { color: DARK_TEAL }]}>Amlodipine</Text>
              </View>
            </View>
            <Text style={[styles.drugFda, { color: colors.mutedForeground }]}>
              FDA-approved · Same active ingredient · Same dosage
            </Text>
          </View>

          <View style={[styles.acceptBenefits, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <CheckItem text="Clinically identical to Norvasc" />
            <CheckItem text="Lower copay under your plan" />
            <CheckItem text="Your prescribing provider will be notified" />
            <CheckItem text="You can switch back at any time" />
          </View>
        </>
      ) : (
        <>
          <Text style={[styles.stepQuestion, { color: colors.foreground }]}>
            Switch your refill location to CR Mail Order for lower cost and home delivery?
          </Text>

          <View style={[styles.drugHighlight, { backgroundColor: LIGHT_TEAL_BG, borderColor: colors.primary + "40" }]}>
            <View style={styles.switchRow}>
              <View style={styles.switchItem}>
                <Feather name="map-pin" size={18} color={colors.mutedForeground} />
                <Text style={[styles.switchLabel, { color: colors.mutedForeground }]}>Current</Text>
                <Text style={[styles.switchName, { color: colors.foreground }]}>CVS Pharmacy Midtown</Text>
                <Text style={[styles.switchDetail, { color: colors.mutedForeground }]}>ZIP 10006</Text>
              </View>
              <Feather name="arrow-right" size={20} color={DARK_TEAL} style={{ marginTop: 8 }} />
              <View style={styles.switchItem}>
                <Feather name="package" size={18} color={DARK_TEAL} />
                <Text style={[styles.switchLabel, { color: colors.mutedForeground }]}>Proposed</Text>
                <Text style={[styles.switchName, { color: DARK_TEAL }]}>CR Mail Order</Text>
                <Text style={[styles.switchDetail, { color: colors.mutedForeground }]}>Home delivery</Text>
              </View>
            </View>
          </View>

          <View style={[styles.acceptBenefits, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <CheckItem text="90-day supply delivered to your door" />
            <CheckItem text="Automatic refill reminders" />
            <CheckItem text="Free home delivery" />
            <CheckItem text="Lower per-fill cost under your plan" />
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.acceptBtn, { backgroundColor: DARK_TEAL }]}
        onPress={onAccept}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        <Feather name="check-circle" size={20} color="#fff" style={{ marginRight: 10 }} />
        <Text style={styles.acceptBtnText}>Accept Recommendation</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Step 2A: Substitution — choose delivery method ───────────────────────────

function SubDeliveryStep({
  selected,
  onSelect,
}: {
  selected: "care-reward" | "printout" | null;
  onSelect: (v: "care-reward" | "printout") => void;
}) {
  const colors = useColors();

  const options: {
    id: "care-reward" | "printout";
    icon: keyof typeof Feather.glyphMap;
    title: string;
    desc: string;
    highlight?: boolean;
  }[] = [
    {
      id: "care-reward",
      icon: "send",
      title: "Care Reward sends request to prescribing provider",
      desc: "We'll send a change request directly to your prescribing provider on your behalf — no action needed.",
      highlight: true,
    },
    {
      id: "printout",
      icon: "printer",
      title: "I'll take a printout to my prescribing provider",
      desc: "We'll generate a ready-to-print document you can bring to your next appointment.",
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.stepScroll} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepQuestion, { color: colors.foreground }]}>
        How would you like to send the change request?
      </Text>

      {options.map((opt) => {
        const sel = selected === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.methodCard,
              {
                backgroundColor: sel ? DARK_TEAL + "0D" : colors.card,
                borderColor: sel ? DARK_TEAL : colors.border,
                borderWidth: sel ? 2 : 1,
              },
            ]}
            onPress={() => onSelect(opt.id)}
            activeOpacity={0.82}
            accessibilityRole="radio"
            accessibilityState={{ selected: sel }}
          >
            <View style={[styles.methodIconWrap, { backgroundColor: sel ? DARK_TEAL + "18" : colors.secondary }]}>
              <Feather name={opt.icon} size={22} color={sel ? DARK_TEAL : colors.mutedForeground} />
            </View>
            <View style={styles.methodText}>
              <View style={styles.methodTitleRow}>
                <Text style={[styles.methodTitle, { color: colors.foreground }]}>{opt.title}</Text>
                {opt.highlight && (
                  <View style={[styles.recommendedPill, { backgroundColor: DARK_TEAL }]}>
                    <Text style={styles.recommendedPillText}>Recommended</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.methodDesc, { color: colors.mutedForeground }]}>{opt.desc}</Text>
            </View>
            <View
              style={[
                styles.radioOuter,
                { borderColor: sel ? DARK_TEAL : colors.border },
              ]}
            >
              {sel && <View style={[styles.radioDot, { backgroundColor: DARK_TEAL }]} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Step 2B: Refill — delivery address form ──────────────────────────────────

function RefillAddressStep({
  address,
  setAddress,
  city,
  setCity,
  stateVal,
  setStateVal,
  zip,
  setZip,
}: {
  address: string; setAddress: (v: string) => void;
  city: string; setCity: (v: string) => void;
  stateVal: string; setStateVal: (v: string) => void;
  zip: string; setZip: (v: string) => void;
}) {
  const colors = useColors();

  const inputStyle = [styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }];
  const labelStyle = [styles.fieldLabel, { color: colors.foreground }];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.stepScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.stepQuestion, { color: colors.foreground }]}>
          Where should we deliver your medication?
        </Text>

        <View style={[styles.addressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Street */}
          <View style={styles.fieldGroup}>
            <Text style={labelStyle}>Street address *</Text>
            <TextInput
              style={inputStyle}
              placeholder="e.g. 123 Main Street, Apt 4B"
              placeholderTextColor={colors.mutedForeground}
              value={address}
              onChangeText={setAddress}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* City */}
          <View style={styles.fieldGroup}>
            <Text style={labelStyle}>City *</Text>
            <TextInput
              style={inputStyle}
              placeholder="e.g. New York"
              placeholderTextColor={colors.mutedForeground}
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* State + ZIP side by side */}
          <View style={styles.fieldRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={labelStyle}>State *</Text>
              <TextInput
                style={inputStyle}
                placeholder="e.g. NY"
                placeholderTextColor={colors.mutedForeground}
                value={stateVal}
                onChangeText={(v) => setStateVal(v.toUpperCase().slice(0, 2))}
                autoCapitalize="characters"
                maxLength={2}
                returnKeyType="next"
              />
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={labelStyle}>ZIP code *</Text>
              <TextInput
                style={inputStyle}
                placeholder="e.g. 10001"
                placeholderTextColor={colors.mutedForeground}
                value={zip}
                onChangeText={(v) => setZip(v.replace(/\D/g, "").slice(0, 5))}
                keyboardType="number-pad"
                maxLength={5}
                returnKeyType="done"
              />
            </View>
          </View>
        </View>

        <View style={[styles.deliveryNote, { backgroundColor: LIGHT_TEAL_BG, borderColor: colors.primary + "30" }]}>
          <Feather name="info" size={15} color={DARK_TEAL} />
          <Text style={[styles.deliveryNoteText, { color: DARK_TEAL }]}>
            Your first 90-day supply will arrive within 7–10 business days of confirmation.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Step 3: Acknowledgement ──────────────────────────────────────────────────

function AcknowledgementStep({
  flow,
  subDelivery,
  address,
  city,
  stateVal,
  zip,
  points,
  pointsMonthly,
  onClose,
}: {
  flow: Flow;
  subDelivery: "care-reward" | "printout" | null;
  address: string;
  city: string;
  stateVal: string;
  zip: string;
  points: number;
  pointsMonthly: number;
  onClose: () => void;
}) {
  const colors = useColors();
  const isSub = flow === "substitution";

  const title = isSub
    ? subDelivery === "care-reward"
      ? "Request sent to your prescribing provider!"
      : "Your printout is ready!"
    : "Mail order set up!";

  const desc = isSub
    ? subDelivery === "care-reward"
      ? "Care Reward has sent a generic substitution request to your prescribing provider. You'll be notified when they respond."
      : "Your printout document is ready. Bring it to your next appointment and ask your prescribing provider to switch you to Amlodipine."
    : `Your first 90-day supply of Amlodipine will be delivered to ${address}, ${city}, ${stateVal} ${zip}. Expect arrival in 7–10 business days.`;

  return (
    <View style={styles.ackContainer}>
      {/* Success icon */}
      <View style={[styles.ackIconCircle, { backgroundColor: "#22C55E" }]}>
        <Feather name="check" size={40} color="#fff" />
      </View>

      <Text style={[styles.ackTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.ackDesc, { color: colors.mutedForeground }]}>{desc}</Text>

      {/* Points earned */}
      <View style={[styles.ackPointsBadge, { backgroundColor: DARK_TEAL + "15", borderColor: DARK_TEAL + "30" }]}>
        <Feather name="star" size={18} color={DARK_TEAL} />
        <Text style={[styles.ackPointsText, { color: DARK_TEAL }]}>
          +{points} points earned{pointsMonthly > 0 ? ` · +${pointsMonthly}/mo ongoing` : ""}
        </Text>
      </View>

      {/* What happens next */}
      <View style={[styles.ackNextCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.ackNextLabel, { color: colors.foreground }]}>What happens next</Text>
        {isSub && subDelivery === "care-reward" && (
          <>
            <CheckItem text="Prescribing Provider reviews the substitution request" />
            <CheckItem text="You'll be notified of their decision" />
            <CheckItem text="Prescription updated at your pharmacy" />
          </>
        )}
        {isSub && subDelivery === "printout" && (
          <>
            <CheckItem text="Download or print the document" />
            <CheckItem text="Bring it to your next appointment" />
            <CheckItem text="Prescribing Provider approves and updates your prescription" />
          </>
        )}
        {!isSub && (
          <>
            <CheckItem text="Prescription transferred to CR Mail Order" />
            <CheckItem text="First delivery in 7–10 business days" />
            <CheckItem text="Auto-refill set up for future fills" />
          </>
        )}
      </View>

      {/* Close button */}
      <TouchableOpacity
        style={[styles.closeOppBtn, { backgroundColor: DARK_TEAL }]}
        onPress={onClose}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        <Text style={styles.closeOppBtnText}>Close Opportunity</Text>
      </TouchableOpacity>
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

  const opp = MOCK_OPPORTUNITIES.find((o) => o.id === id);
  const points = opp?.points ?? 50;
  const pointsMonthly = opp?.pointsMonthly ?? 50;

  // Skeleton
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: "Medication Opportunity" });
  }, [navigation]);

  // Workflow state
  const [flow, setFlow] = useState<Flow>(null);
  const [step, setStep] = useState<Step>(0);

  // Substitution state
  const [subDelivery, setSubDelivery] = useState<"care-reward" | "printout" | null>(null);

  // Refill address state
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip] = useState("");

  const startFlow = (f: Flow) => {
    setFlow(f);
    setStep(1);
    // Reset sub-state when starting
    setSubDelivery(null);
    setAddress(""); setCity(""); setStateVal(""); setZip("");
  };

  const handleBack = () => {
    if (step <= 1 || step === 0) {
      setFlow(null);
      setStep(0);
    } else {
      setStep((s) => Math.max(0, s - 1) as Step);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  // Footer config per step
  const footerLabel = (() => {
    if (step === 1) return "Continue";
    if (step === 2 && flow === "substitution") return subDelivery ? "Continue" : null;
    if (step === 2 && flow === "refill") {
      const ready = address.trim() && city.trim() && stateVal.trim().length === 2 && zip.length === 5;
      return ready ? "Confirm Address" : null;
    }
    return null;
  })();

  const STEP_TITLES: Record<number, string> = {
    1: "Accept Recommendation",
    2: flow === "substitution" ? "Choose How to Send" : "Delivery Address",
    3: "Opportunity Closed",
  };

  if (loading) return <OpportunityDetailSkeleton />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Overview (step === 0) ───────────────────────────────────────────── */}
      {step === 0 && (
        <>
          <ScrollView
            contentContainerStyle={[
              styles.overviewScroll,
              { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 32 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Page header */}
            <View style={[styles.pageHeader, { backgroundColor: LIGHT_TEAL_BG, borderColor: colors.primary + "30" }]}>
              <View style={[styles.pageHeaderIcon, { backgroundColor: DARK_TEAL + "18" }]}>
                <Feather name="activity" size={24} color={DARK_TEAL} />
              </View>
              <View style={styles.pageHeaderText}>
                <Text style={[styles.pageHeaderDrug, { color: DARK_TEAL }]}>Blood Pressure Medication</Text>
                <Text style={[styles.pageHeaderSub, { color: colors.mutedForeground }]}>
                  2 savings opportunities found
                </Text>
              </View>
            </View>

            {/* ── Opportunity 1: Generic Substitution ── */}
            <SectionHeading label="Opportunity 1 · Generic Substitution" />
            <OpportunityCard
              icon="refresh-cw"
              iconBg={LIGHT_TEAL_BG}
              title="Switch to Generic"
              subtitle="Norvasc → Amlodipine"
              points={points}
              pointsMonthly={pointsMonthly}
              ctaLabel="Accept Generic Substitution"
              onCta={() => startFlow("substitution")}
            >
              <DrugComparisonCards />
              <View style={[styles.savingsRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="trending-down" size={15} color="#16A34A" />
                <Text style={[styles.savingsText, { color: "#16A34A" }]}>
                  Save up to $127/month on your medication costs
                </Text>
              </View>
            </OpportunityCard>

            {/* ── Opportunity 2: Refill Location ── */}
            <SectionHeading label="Opportunity 2 · Refill Location" />
            <OpportunityCard
              icon="package"
              iconBg={LIGHT_TEAL_BG}
              title="Switch to Mail Order"
              subtitle="CVS Pharmacy → CR Mail Order"
              points={50}
              pointsMonthly={0}
              ctaLabel="Switch to Mail Order"
              onCta={() => router.push(`/mail-delivery-opportunity/${id}` as never)}
            >
              <RefillComparisonCards />
              <View style={[styles.savingsRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="trending-down" size={15} color="#16A34A" />
                <Text style={[styles.savingsText, { color: "#16A34A" }]}>
                  90-day supply delivered free — lower per-fill cost
                </Text>
              </View>
            </OpportunityCard>
          </ScrollView>
        </>
      )}

      {/* ── Stepper (steps 1-3) ─────────────────────────────────────────────── */}
      {step > 0 && (
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + (Platform.OS === "web" ? 16 : 8),
            },
          ]}
        >
          {/* Sheet header */}
          <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
            {step < 3 ? (
              <TouchableOpacity
                onPress={handleBack}
                style={styles.sheetBack}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="arrow-left" size={20} color={colors.primary} />
                <Text style={[styles.sheetBackText, { color: colors.primary }]}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.sheetBack} />
            )}
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
              {STEP_TITLES[step]}
            </Text>
            <View style={styles.sheetBackSpacer} />
          </View>

          {/* Progress bar */}
          {step < 3 && (
            <View style={styles.progressWrap}>
              <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
                Step {step} of 2
              </Text>
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: DARK_TEAL, width: `${(step / 2) * 100}%` },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Step content */}
          <View style={styles.sheetContent}>
            {step === 1 && (
              <AcceptStep flow={flow} onAccept={handleNext} />
            )}
            {step === 2 && flow === "substitution" && (
              <SubDeliveryStep selected={subDelivery} onSelect={setSubDelivery} />
            )}
            {step === 2 && flow === "refill" && (
              <RefillAddressStep
                address={address} setAddress={setAddress}
                city={city} setCity={setCity}
                stateVal={stateVal} setStateVal={setStateVal}
                zip={zip} setZip={setZip}
              />
            )}
            {step === 3 && (
              <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                <AcknowledgementStep
                  flow={flow}
                  subDelivery={subDelivery}
                  address={address}
                  city={city}
                  stateVal={stateVal}
                  zip={zip}
                  points={flow === "refill" ? 50 : points}
                  pointsMonthly={flow === "refill" ? 0 : pointsMonthly}
                  onClose={() => router.back()}
                />
              </ScrollView>
            )}
          </View>

          {/* Footer CTA */}
          {footerLabel && step < 3 && (
            <View style={[styles.sheetFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.footerBtn, { backgroundColor: DARK_TEAL }]}
                onPress={handleNext}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                <Text style={styles.footerBtnText}>{footerLabel}</Text>
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

  // ── Overview ────────────────────────────────────────────────────────────
  overviewScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },

  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  pageHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  pageHeaderText: { flex: 1 },
  pageHeaderDrug: { fontSize: 17, fontFamily: "Inter_700Bold" },
  pageHeaderSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },

  sectionHeading: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    marginBottom: -4,
  },

  // ── Opportunity card (overview wrapper) ──────────────────────────────────
  oppCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  oppCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  oppCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  oppCardTitles: { flex: 1 },
  oppCardTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  oppCardSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  oppPtsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    flexShrink: 0,
  },
  oppPtsText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  oppCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 15,
    minHeight: 52,
  },
  oppCtaText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },

  savingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  savingsText: { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1 },

  // ── Drug comparison (overview) ───────────────────────────────────────────
  compRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  compCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  compRecommendedRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  compTag: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  compDrug: { fontSize: 16, fontFamily: "Inter_700Bold" },
  compSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: -4 },
  compCostBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  compCostText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  recBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  recBadgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  compArrow: { alignSelf: "center", marginTop: 8 },

  // ── Refill location comparison (overview) ──────────────────────────────
  locationStack: { gap: 4 },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  locationLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  locationIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  locationText: { flex: 1 },
  locationLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  locationName: { fontSize: 14, fontFamily: "Inter_700Bold", marginTop: 2 },
  locationZip: { fontSize: 12, fontFamily: "Inter_400Regular" },
  costPill: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  costPillText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  locationArrow: { alignSelf: "center", paddingVertical: 2 },

  // ── Sheet overlay (stepper) ──────────────────────────────────────────────
  sheet: {
    flex: 1,
    flexDirection: "column",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  sheetBack: { flexDirection: "row", alignItems: "center", gap: 4, minWidth: 70 },
  sheetBackText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  sheetBackSpacer: { minWidth: 70 },
  sheetTitle: { flex: 1, textAlign: "center", fontSize: 16, fontFamily: "Inter_700Bold" },

  progressWrap: { paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  progressLabel: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  progressTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },

  sheetContent: { flex: 1 },
  sheetFooter: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  footerBtn: {
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
  },
  footerBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },

  // ── Step content shared ──────────────────────────────────────────────────
  stepScroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 16 },
  stepQuestion: { fontSize: 18, fontFamily: "Inter_700Bold", lineHeight: 26 },

  // ── Step 1: Accept ───────────────────────────────────────────────────────
  drugHighlight: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  drugRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  drugItem: { flex: 1, gap: 4 },
  drugLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  drugName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  drugFda: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },

  switchRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  switchItem: { flex: 1, gap: 4 },
  switchLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  switchName: { fontSize: 16, fontFamily: "Inter_700Bold" },
  switchDetail: { fontSize: 12, fontFamily: "Inter_400Regular" },

  acceptBenefits: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 18,
    minHeight: 60,
  },
  acceptBtnText: { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },

  // ── Step 2: Substitution method ──────────────────────────────────────────
  methodCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderRadius: 14,
    padding: 16,
    minHeight: 80,
  },
  methodIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  methodText: { flex: 1, gap: 6 },
  methodTitleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  methodTitle: { fontSize: 15, fontFamily: "Inter_700Bold", flex: 1 },
  methodDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  recommendedPill: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  recommendedPillText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },

  // ── Step 2: Refill address ───────────────────────────────────────────────
  addressCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  fieldGroup: { gap: 6 },
  fieldRow: { flexDirection: "row", gap: 12 },
  fieldLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    minHeight: 50,
  },
  deliveryNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  deliveryNoteText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },

  // ── Step 3: Acknowledgement ──────────────────────────────────────────────
  ackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: 24,
  },
  ackIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  ackTitle: { fontSize: 24, fontFamily: "Inter_700Bold", textAlign: "center" },
  ackDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  ackPointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ackPointsText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  ackNextCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    alignSelf: "stretch",
  },
  ackNextLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  closeOppBtn: {
    borderRadius: 14,
    paddingVertical: 18,
    alignSelf: "stretch",
    alignItems: "center",
    minHeight: 58,
  },
  closeOppBtnText: { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },

  // ── Shared helpers ───────────────────────────────────────────────────────
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bulletDot: { width: 7, height: 7, borderRadius: 4, marginTop: 7, flexShrink: 0 },
  bulletText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
});
