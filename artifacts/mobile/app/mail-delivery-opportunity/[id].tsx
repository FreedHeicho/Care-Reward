/**
 * Mail Delivery Opportunity Screen
 *
 * Step 0 — Overview: compare in-store vs mail, why switch, points breakdown
 * Step 1 — Accept: confirm switching CVS Pharmacy → CR Mail Order
 * Step 2 — Delivery address: enter where to send medication
 * Step 3 — Acknowledgement: confirmation + what happens next
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

type Step = 0 | 1 | 2 | 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CheckItem({ text }: { text: string }) {
  const colors = useColors();
  return (
    <View style={styles.checkRow}>
      <View style={[styles.checkCircle, { backgroundColor: DARK_TEAL }]}>
        <Feather name="check" size={13} color="#fff" />
      </View>
      <Text style={[styles.checkText, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

function BulletItem({ text, muted }: { text: string; muted?: boolean }) {
  const colors = useColors();
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.bulletDot, { backgroundColor: muted ? colors.mutedForeground : colors.primary }]} />
      <Text style={[styles.bulletText, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

// ─── Accordion ────────────────────────────────────────────────────────────────

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
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
        <Feather name={open ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
      </TouchableOpacity>
      {open && <View style={styles.accordionBody}>{children}</View>}
    </View>
  );
}

// ─── Step 1: Accept ───────────────────────────────────────────────────────────

function AcceptStep({ onAccept }: { onAccept: () => void }) {
  const colors = useColors();
  return (
    <ScrollView contentContainerStyle={styles.stepScroll} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepQuestion, { color: colors.foreground }]}>
        Switch your refill location to CR Mail Order for lower cost and home delivery?
      </Text>

      {/* Location comparison */}
      <View style={styles.locationStack}>
        {/* Current */}
        <View style={[styles.locationCard, { backgroundColor: LIGHT_TEAL_BG, borderColor: colors.primary + "30" }]}>
          <View style={styles.locationLeft}>
            <View style={[styles.locationIconWrap, { backgroundColor: colors.primary + "20" }]}>
              <Feather name="map-pin" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.locationMeta, { color: colors.mutedForeground }]}>Current location</Text>
              <Text style={[styles.locationName, { color: colors.foreground }]}>CVS Pharmacy Midtown</Text>
              <Text style={[styles.locationMeta, { color: colors.mutedForeground }]}>ZIP 10006</Text>
            </View>
          </View>
          <View style={[styles.costPill, { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" }]}>
            <Text style={[styles.costPillText, { color: "#DC2626" }]}>Higher cost</Text>
          </View>
        </View>

        <View style={styles.locationArrow}>
          <Feather name="arrow-down" size={18} color={DARK_TEAL} />
        </View>

        {/* Proposed */}
        <View style={[styles.locationCard, { backgroundColor: colors.card, borderColor: DARK_TEAL, borderWidth: 2 }]}>
          <View style={styles.locationLeft}>
            <View style={[styles.locationIconWrap, { backgroundColor: DARK_TEAL + "18" }]}>
              <Feather name="package" size={18} color={DARK_TEAL} />
            </View>
            <View>
              <Text style={[styles.locationMeta, { color: colors.mutedForeground }]}>Proposed</Text>
              <Text style={[styles.locationName, { color: DARK_TEAL }]}>CR Mail Order</Text>
              <Text style={[styles.locationMeta, { color: colors.mutedForeground }]}>Home delivery</Text>
            </View>
          </View>
          <View style={[styles.costPill, { backgroundColor: "#F0FDF4", borderColor: "#86EFAC" }]}>
            <Text style={[styles.costPillText, { color: "#16A34A" }]}>Save more ✓</Text>
          </View>
        </View>
      </View>

      {/* Benefits */}
      <View style={[styles.benefitsCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <CheckItem text="90-day supply delivered to your door" />
        <CheckItem text="Automatic refill reminders" />
        <CheckItem text="Free home delivery" />
        <CheckItem text="Lower per-fill cost under your plan" />
      </View>

      <TouchableOpacity
        style={[styles.acceptBtn, { backgroundColor: DARK_TEAL }]}
        onPress={onAccept}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        <Feather name="check-circle" size={20} color="#fff" style={{ marginRight: 10 }} />
        <Text style={styles.acceptBtnText}>Accept — Switch to Mail Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Step 2: Delivery address ─────────────────────────────────────────────────

function AddressStep({
  address, setAddress,
  city, setCity,
  stateVal, setStateVal,
  zip, setZip,
}: {
  address: string; setAddress: (v: string) => void;
  city: string; setCity: (v: string) => void;
  stateVal: string; setStateVal: (v: string) => void;
  zip: string; setZip: (v: string) => void;
}) {
  const colors = useColors();
  const inputStyle = [
    styles.input,
    { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card },
  ];
  const labelStyle = [styles.fieldLabel, { color: colors.foreground }];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.stepScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.stepQuestion, { color: colors.foreground }]}>
          Where should we deliver your medication?
        </Text>

        <View style={[styles.addressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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

// ─── Step 3: Acknowledgement ─────────────────────────────────────────────────

function AcknowledgementStep({
  address, city, stateVal, zip,
  points,
  onClose,
}: {
  address: string; city: string; stateVal: string; zip: string;
  points: number;
  onClose: () => void;
}) {
  const colors = useColors();
  return (
    <ScrollView
      contentContainerStyle={[styles.stepScroll, { alignItems: "center" }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.ackIconCircle, { backgroundColor: "#22C55E" }]}>
        <Feather name="check" size={40} color="#fff" />
      </View>

      <Text style={[styles.ackTitle, { color: colors.foreground }]}>Mail order set up!</Text>
      <Text style={[styles.ackDesc, { color: colors.mutedForeground }]}>
        Your first 90-day supply will be delivered to {address}, {city}, {stateVal} {zip}. Expect
        arrival in 7–10 business days.
      </Text>

      <View style={[styles.ackPointsBadge, { backgroundColor: DARK_TEAL + "15", borderColor: DARK_TEAL + "30" }]}>
        <Feather name="star" size={18} color={DARK_TEAL} />
        <Text style={[styles.ackPointsText, { color: DARK_TEAL }]}>+{points} points earned</Text>
      </View>

      <View style={[styles.ackNextCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.ackNextLabel, { color: colors.foreground }]}>What happens next</Text>
        <CheckItem text="Prescription transferred to CR Mail Order" />
        <CheckItem text="First delivery in 7–10 business days" />
        <CheckItem text="Auto-refill set up for future fills" />
      </View>

      <TouchableOpacity
        style={[styles.closeBtn, { backgroundColor: DARK_TEAL }]}
        onPress={onClose}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        <Text style={styles.closeBtnText}>Close Opportunity</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

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
  const [step, setStep] = useState<Step>(0);
  const [showComparison, setShowComparison] = useState(true);

  // Address form state
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip] = useState("");

  useEffect(() => {
    navigation.setOptions({ title: "Mail Delivery Opportunity" });
  }, [navigation]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, []);

  const handleBack = () => {
    if (step <= 1) setStep(0);
    else setStep((s) => (s - 1) as Step);
  };

  const addressReady =
    address.trim().length > 0 &&
    city.trim().length > 0 &&
    stateVal.trim().length === 2 &&
    zip.length === 5;

  const STEP_TITLES: Record<number, string> = {
    1: "Accept Recommendation",
    2: "Delivery Address",
    3: "Opportunity Closed",
  };

  if (loading) return <OpportunityDetailSkeleton />;

  const bottomPad = insets.bottom + (Platform.OS === "web" ? 16 : 8);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── Overview (step 0) ─────────────────────────────────────────────── */}
      {step === 0 && (
        <>
          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              { paddingBottom: bottomPad + 100 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Compare toggle */}
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
                <View style={[styles.card, styles.cardInStore, { borderColor: colors.border }]}>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>In-Store Pickup</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>
                    Pharmacy Pickup • Your Local Pharmacy
                  </Text>
                  {[
                    "Visit pharmacy in person",
                    "Wait in line for pickup",
                    "Limited to 30-day supply",
                    "Requires monthly trips",
                  ].map((item, i) => (
                    <BulletItem key={i} text={item} muted />
                  ))}
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>Mail Delivery</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>Home Delivery</Text>
                  {[
                    "Automatic refills",
                    "Free home delivery",
                    "90-day supply available",
                    "No trips to pharmacy needed",
                  ].map((item, i) => (
                    <BulletItem key={i} text={item} />
                  ))}
                </View>
              </>
            )}

            {/* Why Switch */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                Why Switch to Mail Delivery?
              </Text>
              {[
                "Medications delivered to your door",
                "Save on prescription costs",
                "No trips to pharmacy needed",
              ].map((item, i) => (
                <BulletItem key={i} text={item} />
              ))}
            </View>

            {/* What You'll Get */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>What You'll Get</Text>
              {[
                "Automatic refill reminders",
                "Free shipping and delivery",
                "90-day supply options",
                "No waiting in pharmacy lines",
                "Convenient home delivery",
              ].map((item, i) => (
                <CheckItem key={i} text={item} />
              ))}
            </View>

            {/* Points Breakdown */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Points Breakdown</Text>
              <View style={[styles.pointsBanner, { backgroundColor: colors.primary }]}>
                <Text style={styles.pointsBannerLabel}>One-Time Reward</Text>
                <Text style={styles.pointsBannerValue}>{points} Points</Text>
              </View>
            </View>

            {/* How to Switch */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>How to Switch</Text>
              {[
                "Accept the mail delivery switch",
                "Enter your delivery address",
                "Earn points for switching",
              ].map((s, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={[styles.stepBadge, { backgroundColor: DARK_TEAL }]}>
                    <Text style={styles.stepNumber}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.foreground }]}>{s}</Text>
                </View>
              ))}
            </View>

            {/* Accordions */}
            <Accordion title="Important Information">
              {[
                "Mail delivery is available for most medications",
                "You can always switch back to in-store pickup",
                "Delivery times may vary by location",
                "First fill arrives within 7–10 business days",
              ].map((item, i) => (
                <BulletItem key={i} text={item} muted />
              ))}
            </Accordion>

            <Accordion title="Frequently Asked Questions">
              {[
                { q: "Is mail delivery safe?", a: "Yes, medications are shipped in secure packaging." },
                { q: "Can I get controlled substances by mail?", a: "Some restrictions may apply." },
                { q: "What if my medication is damaged?", a: "Contact the mail pharmacy immediately." },
                { q: "How long does delivery take?", a: "Usually 7–10 business days for the first fill." },
              ].map((item, i) => (
                <View key={i} style={styles.faqItem}>
                  <Text style={[styles.faqQ, { color: colors.foreground }]}>Q: {item.q}</Text>
                  <Text style={[styles.faqA, { color: colors.mutedForeground }]}>{item.a}</Text>
                </View>
              ))}
            </Accordion>
          </ScrollView>

          {/* Footer CTA */}
          <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: bottomPad }]}>
            <TouchableOpacity
              style={[styles.switchBtn, { backgroundColor: DARK_TEAL }]}
              onPress={() => setStep(1)}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              <Feather name="package" size={18} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.switchBtnText}>Switch to Mail Delivery</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── Stepper (steps 1–3) ───────────────────────────────────────────── */}
      {step > 0 && (
        <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: bottomPad }]}>
          {/* Header */}
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

          {/* Progress bar (steps 1 & 2 only) */}
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

          {/* Content */}
          <View style={styles.sheetContent}>
            {step === 1 && <AcceptStep onAccept={() => setStep(2)} />}
            {step === 2 && (
              <AddressStep
                address={address} setAddress={setAddress}
                city={city} setCity={setCity}
                stateVal={stateVal} setStateVal={setStateVal}
                zip={zip} setZip={setZip}
              />
            )}
            {step === 3 && (
              <AcknowledgementStep
                address={address} city={city} stateVal={stateVal} zip={zip}
                points={points}
                onClose={() => router.back()}
              />
            )}
          </View>

          {/* "Confirm Address" footer — only on step 2 when form is complete */}
          {step === 2 && addressReady && (
            <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: bottomPad }]}>
              <TouchableOpacity
                style={[styles.switchBtn, { backgroundColor: DARK_TEAL }]}
                onPress={() => setStep(3)}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                <Text style={styles.switchBtnText}>Confirm Address</Text>
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

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },

  // ── Compare toggle ──────────────────────────────────────────────────────────
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
  compareToggleTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  compareToggleRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  compareToggleLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },

  // ── Cards ───────────────────────────────────────────────────────────────────
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardInStore: { backgroundColor: "#E8F5F2" },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", lineHeight: 22 },
  cardSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18, marginTop: 2 },

  // ── Bullet / check rows ─────────────────────────────────────────────────────
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bulletDot: { width: 9, height: 9, borderRadius: 5, marginTop: 5, flexShrink: 0 },
  bulletText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },

  checkRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  checkText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },

  // ── Points banner ───────────────────────────────────────────────────────────
  pointsBanner: {
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 4,
  },
  pointsBannerLabel: { color: "#ffffffcc", fontSize: 13, fontFamily: "Inter_500Medium", letterSpacing: 0.3 },
  pointsBannerValue: { color: "#fff", fontSize: 28, fontFamily: "Inter_800ExtraBold", letterSpacing: -0.5 },

  // ── Numbered steps ──────────────────────────────────────────────────────────
  stepRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepBadge: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  stepNumber: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  stepText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },

  // ── Accordions ──────────────────────────────────────────────────────────────
  accordionCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  accordionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  accordionBody: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },

  faqItem: { gap: 2 },
  faqQ: { fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  faqA: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },

  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: { paddingHorizontal: 16, paddingTop: 12 },
  switchBtn: {
    borderRadius: 14,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
  },
  switchBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.2 },

  // ── Stepper sheet ────────────────────────────────────────────────────────────
  sheet: { flex: 1 },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  sheetBack: { flexDirection: "row", alignItems: "center", gap: 6, minWidth: 60 },
  sheetBackText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  sheetBackSpacer: { minWidth: 60 },
  sheetTitle: { fontSize: 16, fontFamily: "Inter_700Bold", textAlign: "center", flex: 1 },
  sheetContent: { flex: 1 },

  progressWrap: { paddingHorizontal: 16, paddingTop: 12, gap: 6 },
  progressLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  progressTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },

  // ── Accept step ─────────────────────────────────────────────────────────────
  stepScroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 16 },
  stepQuestion: { fontSize: 18, fontFamily: "Inter_700Bold", lineHeight: 26 },

  locationStack: { gap: 4 },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  locationLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  locationIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  locationMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  locationName: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginTop: 1 },
  locationArrow: { alignItems: "center", paddingVertical: 4 },
  costPill: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  costPillText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  benefitsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },

  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 18,
    minHeight: 60,
  },
  acceptBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },

  // ── Address step ────────────────────────────────────────────────────────────
  addressCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 14 },
  fieldGroup: { gap: 6 },
  fieldRow: { flexDirection: "row", gap: 12 },
  fieldLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    minHeight: 48,
  },
  deliveryNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  deliveryNoteText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },

  // ── Acknowledgement step ────────────────────────────────────────────────────
  ackIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  ackTitle: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  ackDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  ackPointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: "center",
  },
  ackPointsText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  ackNextCard: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  ackNextLabel: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 4 },
  closeBtn: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
  },
  closeBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
