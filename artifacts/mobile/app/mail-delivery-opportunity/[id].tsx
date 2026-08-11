/**
 * Mail Delivery Opportunity
 *
 * Redesigned consumer flow — three focused steps:
 *   Step 1 — Accept the recommendation (CVS → CR Mail Order)
 *   Step 2 — Enter delivery address
 *   Step 3 — Acknowledgement / confirmation
 */

import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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

// ── Brand colours ─────────────────────────────────────────────────────────────
const TEAL = "#05503C";
const TEAL_LIGHT = "#E8F5F2";
const TEAL_MID = "#0D7055";

type Step = 1 | 2 | 3;

// ── Small helpers ─────────────────────────────────────────────────────────────

function CheckRow({ text }: { text: string }) {
  const colors = useColors();
  return (
    <View style={sh.checkRow}>
      <View style={[sh.checkDot, { backgroundColor: TEAL }]}>
        <Feather name="check" size={11} color="#fff" />
      </View>
      <Text style={[sh.checkText, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

// ── Step indicator (dots) ─────────────────────────────────────────────────────

function StepDots({ current }: { current: Step }) {
  const colors = useColors();
  return (
    <View style={sh.dots}>
      {([1, 2, 3] as Step[]).map((n) => (
        <View
          key={n}
          style={[
            sh.dot,
            n === current
              ? { backgroundColor: TEAL, width: 24 }
              : n < current
              ? { backgroundColor: TEAL_MID }
              : { backgroundColor: colors.border },
          ]}
        />
      ))}
    </View>
  );
}

// ── Location switch card (shared context visible on steps 1 & 2) ─────────────

function LocationHeader() {
  const colors = useColors();
  return (
    <View style={[sh.locHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[sh.locHeaderLabel, { color: colors.mutedForeground }]}>Refill location</Text>

      {/* Current */}
      <View style={sh.locRow}>
        <View style={[sh.locIconWrap, { backgroundColor: "#FEF2F2" }]}>
          <Feather name="map-pin" size={16} color="#DC2626" />
        </View>
        <View style={sh.locText}>
          <Text style={[sh.locSub, { color: colors.mutedForeground }]}>Current location</Text>
          <Text style={[sh.locName, { color: colors.foreground }]}>CVS Pharmacy Midtown</Text>
          <Text style={[sh.locSub, { color: colors.mutedForeground }]}>ZIP 10006</Text>
        </View>
        <View style={sh.costBadge}>
          <Text style={sh.costBadgeRed}>Higher cost</Text>
        </View>
      </View>

      {/* Arrow */}
      <View style={sh.locArrow}>
        <View style={[sh.arrowLine, { backgroundColor: colors.border }]} />
        <View style={[sh.arrowCircle, { backgroundColor: TEAL_LIGHT, borderColor: TEAL + "30" }]}>
          <Feather name="arrow-down" size={14} color={TEAL} />
        </View>
        <View style={[sh.arrowLine, { backgroundColor: colors.border }]} />
      </View>

      {/* Proposed */}
      <View style={[sh.locRow, sh.locRowProposed, { borderColor: TEAL + "40", backgroundColor: TEAL_LIGHT }]}>
        <View style={[sh.locIconWrap, { backgroundColor: TEAL + "20" }]}>
          <Feather name="package" size={16} color={TEAL} />
        </View>
        <View style={sh.locText}>
          <Text style={[sh.locSub, { color: colors.mutedForeground }]}>Proposed</Text>
          <Text style={[sh.locName, { color: TEAL }]}>CR Mail Order</Text>
          <Text style={[sh.locSub, { color: colors.mutedForeground }]}>Home delivery</Text>
        </View>
        <View style={sh.costBadge}>
          <Text style={sh.costBadgeGreen}>Lower cost ✓</Text>
        </View>
      </View>
    </View>
  );
}

// ── Step 1: Accept ────────────────────────────────────────────────────────────

function AcceptStep({ points, onAccept }: { points: number; onAccept: () => void }) {
  const colors = useColors();
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={sh.stepScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LocationHeader />

        {/* Benefits */}
        <View style={[sh.benefitCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[sh.benefitTitle, { color: colors.foreground }]}>
            Why switch to mail delivery?
          </Text>
          <CheckRow text="90-day supply delivered to your door" />
          <CheckRow text="Free home delivery — no pharmacy trips" />
          <CheckRow text="Automatic refill reminders" />
          <CheckRow text="Lower per-fill cost under your plan" />
        </View>

        {/* Points reward */}
        <View style={[sh.rewardBanner, { backgroundColor: TEAL }]}>
          <View style={sh.rewardLeft}>
            <Feather name="star" size={20} color="#FCD34D" />
            <View style={{ marginLeft: 12 }}>
              <Text style={sh.rewardTitle}>One-time reward</Text>
              <Text style={sh.rewardSub}>Earned when you complete this switch</Text>
            </View>
          </View>
          <Text style={sh.rewardPoints}>+{points} pts</Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[sh.primaryBtn, { backgroundColor: TEAL }]}
          onPress={onAccept}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Accept recommendation"
        >
          <Feather name="check-circle" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={sh.primaryBtnText}>Accept Recommendation</Text>
        </TouchableOpacity>

        <Text style={[sh.footNote, { color: colors.mutedForeground }]}>
          You can change your delivery address anytime after switching.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Step 2: Delivery address ──────────────────────────────────────────────────

function AddressStep({
  address, setAddress,
  city, setCity,
  stateVal, setStateVal,
  zip, setZip,
  onConfirm,
}: {
  address: string; setAddress: (v: string) => void;
  city: string; setCity: (v: string) => void;
  stateVal: string; setStateVal: (v: string) => void;
  zip: string; setZip: (v: string) => void;
  onConfirm: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const ready =
    address.trim().length > 0 &&
    city.trim().length > 0 &&
    stateVal.trim().length === 2 &&
    zip.length === 5;

  const inputStyle = [
    sh.input,
    { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
    >
      <ScrollView
        contentContainerStyle={[sh.stepScroll, { paddingBottom: ready ? 120 : 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[sh.addrIntro, { backgroundColor: TEAL_LIGHT, borderColor: TEAL + "30" }]}>
          <Feather name="package" size={18} color={TEAL} />
          <Text style={[sh.addrIntroText, { color: TEAL }]}>
            CR Mail Order will deliver your medication here
          </Text>
        </View>

        <View style={[sh.addrCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Street */}
          <View style={sh.fieldGroup}>
            <Text style={[sh.fieldLabel, { color: colors.foreground }]}>Street address</Text>
            <TextInput
              style={inputStyle}
              placeholder="123 Main Street, Apt 4B"
              placeholderTextColor={colors.mutedForeground}
              value={address}
              onChangeText={setAddress}
              autoCapitalize="words"
              returnKeyType="next"
              accessibilityLabel="Street address"
            />
          </View>

          {/* City */}
          <View style={sh.fieldGroup}>
            <Text style={[sh.fieldLabel, { color: colors.foreground }]}>City</Text>
            <TextInput
              style={inputStyle}
              placeholder="New York"
              placeholderTextColor={colors.mutedForeground}
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
              returnKeyType="next"
              accessibilityLabel="City"
            />
          </View>

          {/* State + ZIP */}
          <View style={sh.fieldRow}>
            <View style={[sh.fieldGroup, { flex: 1 }]}>
              <Text style={[sh.fieldLabel, { color: colors.foreground }]}>State</Text>
              <TextInput
                style={inputStyle}
                placeholder="NY"
                placeholderTextColor={colors.mutedForeground}
                value={stateVal}
                onChangeText={(v) => setStateVal(v.toUpperCase().slice(0, 2))}
                autoCapitalize="characters"
                maxLength={2}
                returnKeyType="next"
                accessibilityLabel="State"
              />
            </View>
            <View style={[sh.fieldGroup, { flex: 2 }]}>
              <Text style={[sh.fieldLabel, { color: colors.foreground }]}>ZIP code</Text>
              <TextInput
                style={inputStyle}
                placeholder="10001"
                placeholderTextColor={colors.mutedForeground}
                value={zip}
                onChangeText={(v) => setZip(v.replace(/\D/g, "").slice(0, 5))}
                keyboardType="number-pad"
                maxLength={5}
                returnKeyType="done"
                accessibilityLabel="ZIP code"
              />
            </View>
          </View>
        </View>

        <View style={[sh.deliveryNote, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="clock" size={14} color={colors.mutedForeground} />
          <Text style={[sh.deliveryNoteText, { color: colors.mutedForeground }]}>
            First delivery in 7–10 business days after confirmation.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky footer — only when form is complete */}
      {ready && (
        <View
          style={[
            sh.stickyFooter,
            { backgroundColor: colors.background, paddingBottom: insets.bottom + 12 },
          ]}
        >
          <TouchableOpacity
            style={[sh.primaryBtn, { backgroundColor: TEAL }]}
            onPress={onConfirm}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Confirm address"
          >
            <Text style={sh.primaryBtnText}>Confirm Address</Text>
            <Feather name="arrow-right" size={18} color="#fff" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

// ── Step 3: Acknowledgement ───────────────────────────────────────────────────

function AcknowledgementStep({
  address, city, stateVal, zip,
  points,
  onDone,
}: {
  address: string; city: string; stateVal: string; zip: string;
  points: number;
  onDone: () => void;
}) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 6,
    }).start();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={[sh.stepScroll, sh.ackScroll]}
      showsVerticalScrollIndicator={false}
    >
      {/* Success icon */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={[sh.ackCircle, { backgroundColor: TEAL }]}>
          <Feather name="check" size={38} color="#fff" />
        </View>
      </Animated.View>

      <Text style={[sh.ackTitle, { color: colors.foreground }]}>You're all set!</Text>
      <Text style={[sh.ackSub, { color: colors.mutedForeground }]}>
        Your refill location has been switched to CR Mail Order.
      </Text>

      {/* Switch summary */}
      <View style={[sh.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[sh.summaryLabel, { color: colors.mutedForeground }]}>Refill location changed</Text>
        <View style={sh.summaryRow}>
          <View style={sh.summaryLoc}>
            <Text style={[sh.summaryLocSub, { color: colors.mutedForeground }]}>From</Text>
            <Text style={[sh.summaryLocName, { color: colors.foreground }]}>CVS Pharmacy Midtown</Text>
          </View>
          <Feather name="arrow-right" size={16} color={colors.mutedForeground} />
          <View style={sh.summaryLoc}>
            <Text style={[sh.summaryLocSub, { color: colors.mutedForeground }]}>To</Text>
            <Text style={[sh.summaryLocName, { color: TEAL }]}>CR Mail Order</Text>
          </View>
        </View>
        <View style={[sh.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={sh.summaryAddrRow}>
          <Feather name="map-pin" size={14} color={colors.mutedForeground} />
          <Text style={[sh.summaryAddr, { color: colors.foreground }]}>
            {address}, {city}, {stateVal} {zip}
          </Text>
        </View>
      </View>

      {/* Points */}
      <View style={[sh.pointsBadge, { backgroundColor: TEAL_LIGHT, borderColor: TEAL + "40" }]}>
        <Text style={sh.pointsStar}>⭐</Text>
        <Text style={[sh.pointsText, { color: TEAL }]}>+{points} points earned</Text>
      </View>

      {/* What's next */}
      <View style={[sh.nextCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[sh.nextTitle, { color: colors.foreground }]}>What happens next</Text>
        <CheckRow text="Prescription transferred to CR Mail Order" />
        <CheckRow text="First delivery arrives in 7–10 business days" />
        <CheckRow text="Auto-refill set up for future fills" />
      </View>

      <TouchableOpacity
        style={[sh.primaryBtn, { backgroundColor: TEAL }]}
        onPress={onDone}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Done"
      >
        <Text style={sh.primaryBtnText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

const STEP_LABELS: Record<Step, string> = {
  1: "Accept Recommendation",
  2: "Delivery Address",
  3: "Confirmed",
};

export default function MailDeliveryOpportunityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const opp = MOCK_OPPORTUNITIES.find((o) => o.id === id) ?? {
    id: "opp-3",
    title: "Mail Delivery Opportunity",
    points: 150,
  };
  const points = opp.points ?? 150;

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>(1);

  // Address state
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip] = useState("");

  useEffect(() => {
    navigation.setOptions({ title: "Mail Delivery" });
  }, [navigation]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const handleBack = () => {
    if (step === 1) router.back();
    else if (step === 2) setStep(1);
    // step 3 — no back
  };

  if (loading) return <OpportunityDetailSkeleton />;

  const topPad = Platform.OS === "web" ? 0 : 0;
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 16 : 8);

  return (
    <View style={[sh.root, { backgroundColor: colors.background }]}>

      {/* ── Subheader: step label + dots ─────────────────────────────────── */}
      <View style={[sh.subheader, { borderBottomColor: colors.border }]}>
        {/* Back / spacer */}
        {step < 3 ? (
          <TouchableOpacity
            style={sh.backBtn}
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="arrow-left" size={20} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={sh.backBtn} />
        )}

        {/* Centre: step label + dots */}
        <View style={sh.subheaderCenter}>
          <Text style={[sh.stepLabel, { color: colors.foreground }]}>{STEP_LABELS[step]}</Text>
          <StepDots current={step} />
        </View>

        {/* Right spacer (mirror of back button) */}
        <View style={sh.backBtn} />
      </View>

      {/* ── Step content ─────────────────────────────────────────────────── */}
      <View style={{ flex: 1 }}>
        {step === 1 && (
          <AcceptStep
            points={points}
            onAccept={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <AddressStep
            address={address} setAddress={setAddress}
            city={city} setCity={setCity}
            stateVal={stateVal} setStateVal={setStateVal}
            zip={zip} setZip={setZip}
            onConfirm={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <AcknowledgementStep
            address={address} city={city} stateVal={stateVal} zip={zip}
            points={points}
            onDone={() => router.back()}
          />
        )}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const sh = StyleSheet.create({
  root: { flex: 1 },

  // ── Subheader ──────────────────────────────────────────────────────────────
  subheader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 36, alignItems: "flex-start" },
  subheaderCenter: { flex: 1, alignItems: "center", gap: 6 },
  stepLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", letterSpacing: 0.2 },

  // ── Dots ───────────────────────────────────────────────────────────────────
  dots: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: { height: 6, width: 6, borderRadius: 3 },

  // ── Scroll content ─────────────────────────────────────────────────────────
  stepScroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 14,
  },

  // ── Location header card ───────────────────────────────────────────────────
  locHeader: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 0,
  },
  locHeaderLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    padding: 12,
  },
  locRowProposed: {
    borderWidth: 1,
  },
  locIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  locText: { flex: 1 },
  locSub: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },
  locName: { fontSize: 14, fontFamily: "Inter_700Bold", marginTop: 1, lineHeight: 20 },

  locArrow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    paddingHorizontal: 6,
    gap: 0,
  },
  arrowLine: { flex: 1, height: 1 },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },

  costBadge: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
    flexShrink: 0,
  },
  costBadgeRed: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#DC2626",
    backgroundColor: "#FEF2F2",
    borderRadius: 20,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  costBadgeGreen: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#15803D",
    backgroundColor: "#F0FDF4",
    borderRadius: 20,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  // ── Benefits card ──────────────────────────────────────────────────────────
  benefitCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  benefitTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },

  checkRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },

  // ── Reward banner ──────────────────────────────────────────────────────────
  rewardBanner: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rewardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  rewardTitle: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  rewardSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  rewardPoints: { color: "#FCD34D", fontSize: 22, fontFamily: "Inter_800ExtraBold" },

  footNote: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
  },

  // ── Primary button ─────────────────────────────────────────────────────────
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 58,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.2 },

  // ── Address step ───────────────────────────────────────────────────────────
  addrIntro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 13,
  },
  addrIntroText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 20 },

  addrCard: {
    borderRadius: 16,
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
    alignItems: "center",
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  deliveryNoteText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },

  stickyFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
  },

  // ── Acknowledgement step ───────────────────────────────────────────────────
  ackScroll: { alignItems: "center" },

  ackCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  ackTitle: { fontSize: 24, fontFamily: "Inter_800ExtraBold", textAlign: "center" },
  ackSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },

  summaryCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  summaryLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.4, textTransform: "uppercase" },
  summaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  summaryLoc: { flex: 1, gap: 2 },
  summaryLocSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  summaryLocName: { fontSize: 14, fontFamily: "Inter_700Bold" },
  summaryDivider: { height: StyleSheet.hairlineWidth },
  summaryAddrRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryAddr: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },

  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 11,
    alignSelf: "center",
  },
  pointsStar: { fontSize: 16 },
  pointsText: { fontSize: 16, fontFamily: "Inter_700Bold" },

  nextCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  nextTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 2 },
});
