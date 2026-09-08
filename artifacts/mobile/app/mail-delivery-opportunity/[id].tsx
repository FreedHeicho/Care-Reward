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
  ActivityIndicator,
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
import { WorkflowCompletionButton } from "@/components/WorkflowCompletionButton";
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
          <View style={sh.rewardTop}>
            <Feather name="star" size={16} color="#FCD34D" />
            <Text style={sh.rewardLabel}>One-time reward</Text>
          </View>
          <View style={sh.rewardBottom}>
            <Text style={sh.rewardPoints}>+{points} pts</Text>
            <Text style={sh.rewardSub}>earned when you complete this switch</Text>
          </View>
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

// ── Address autocomplete helpers ──────────────────────────────────────────────

const US_STATES: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR",
  California: "CA", Colorado: "CO", Connecticut: "CT", Delaware: "DE",
  Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID",
  Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS",
  Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS",
  Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK",
  Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT",
  Vermont: "VT", Virginia: "VA", Washington: "WA", "West Virginia": "WV",
  Wisconsin: "WI", Wyoming: "WY", "District of Columbia": "DC",
};

type Suggestion = {
  displayName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
};

function parseNominatim(item: Record<string, any>): Suggestion {
  const a = item.address ?? {};
  const houseNum = a.house_number ?? "";
  const road = a.road ?? "";
  const street = [houseNum, road].filter(Boolean).join(" ");
  const city = a.city ?? a.town ?? a.village ?? a.hamlet ?? a.county ?? "";
  const stateFull = a.state ?? "";
  const state = US_STATES[stateFull] ?? stateFull.slice(0, 2).toUpperCase();
  const zip = (a.postcode ?? "").slice(0, 5);
  return { displayName: item.display_name ?? "", street, city, state, zip };
}

/** Strip unit/floor/suite info so the geocoder only sees the street address */
function cleanForGeocoder(raw: string): string {
  return raw
    .replace(/,?\s*(apt|apartment|suite|ste|floor|fl|unit|#|rm|room|no\.?)\s*[\w\d-]*/gi, "")
    .replace(/,\s*$/, "")
    .trim();
}

// ── Step 2: Delivery address ──────────────────────────────────────────────────

function AddressStep({
  address: initAddress,
  setAddress,
  city: initCity,
  setCity,
  stateVal: initState,
  setStateVal,
  zip: initZip,
  setZip,
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

  // ── Local state — all four fields live here during editing.
  // This isolates every keystroke re-render to this component only;
  // the parent is only updated when the user confirms.
  const [inputValue, setInputValue] = useState(initAddress);
  const [localCity, setLocalCity] = useState(initCity);
  const [localState, setLocalState] = useState(initState);
  const [localZip, setLocalZip] = useState(initZip);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const ready =
    inputValue.trim().length > 0 &&
    localCity.trim().length > 0 &&
    localState.trim().length === 2 &&
    localZip.length === 5;

  const fetchSuggestions = async (raw: string) => {
    // Cancel any previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const query = cleanForGeocoder(raw);
    if (query.length < 3) return;

    try {
      setLoading(true);
      const url =
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1` +
        `&countrycodes=us&limit=6&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { "Accept-Language": "en", "User-Agent": "CareRewardApp/1.0" },
      });
      const data: Record<string, any>[] = await res.json();
      const parsed = data
        .map(parseNominatim)
        .filter((s) => s.street.length > 0);
      setSuggestions(parsed);
      setShowDropdown(parsed.length > 0);
    } catch (e: any) {
      if (e?.name === "AbortError") return; // ignore cancelled requests
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  };

  const handleAddressChange = (text: string) => {
    setInputValue(text);
    setVerified(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 300);
  };

  const handleSelect = (s: Suggestion) => {
    setInputValue(s.street);
    setLocalCity(s.city);
    setLocalState(s.state);
    setLocalZip(s.zip);
    setVerified(true);
    setSuggestions([]);
    setShowDropdown(false);
  };

  /** Sync local state to parent, then call the parent's onConfirm */
  const handleConfirm = () => {
    setAddress(inputValue);
    setCity(localCity);
    setStateVal(localState);
    setZip(localZip);
    onConfirm();
  };

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

          {/* ── Street address with autocomplete ── */}
          <View style={sh.fieldGroup}>
            <Text style={[sh.fieldLabel, { color: colors.foreground }]}>Street address</Text>
            <View style={sh.autocompleteWrap}>
              <View style={[sh.inputRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <TextInput
                  style={[sh.inputInner, { color: colors.foreground }]}
                  placeholder="Start typing your address…"
                  placeholderTextColor={colors.mutedForeground}
                  value={inputValue}
                  onChangeText={handleAddressChange}
                  autoCapitalize="words"
                  returnKeyType="next"
                  accessibilityLabel="Street address"
                  autoCorrect={false}
                />
                {loading && (
                  <ActivityIndicator size="small" color={TEAL} style={{ marginRight: 10 }} />
                )}
                {verified && !loading && (
                  <View style={sh.verifiedBadge}>
                    <Feather name="check-circle" size={15} color="#15803D" />
                    <Text style={sh.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>

              {/* Dropdown suggestions */}
              {showDropdown && suggestions.length > 0 && (
                <View style={[sh.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {suggestions.map((s, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        sh.suggestionItem,
                        i < suggestions.length - 1 && {
                          borderBottomWidth: StyleSheet.hairlineWidth,
                          borderBottomColor: colors.border,
                        },
                      ]}
                      onPress={() => handleSelect(s)}
                      activeOpacity={0.7}
                    >
                      <Feather name="map-pin" size={14} color={TEAL} style={{ marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={[sh.suggestionMain, { color: colors.foreground }]} numberOfLines={1}>
                          {s.street}{s.city ? `, ${s.city}` : ""}
                        </Text>
                        <Text style={[sh.suggestionSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                          {[s.state, s.zip].filter(Boolean).join(" · ")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Unverified indicator — shown only when user typed manually */}
            {!verified && inputValue.trim().length > 0 && (
              <View style={sh.unverifiedRow}>
                <Feather name="alert-circle" size={13} color="#B45309" />
                <Text style={sh.unverifiedText}>Address not verified — you can still continue</Text>
              </View>
            )}
          </View>

          {/* City */}
          <View style={sh.fieldGroup}>
            <Text style={[sh.fieldLabel, { color: colors.foreground }]}>City</Text>
            <TextInput
              style={inputStyle}
              placeholder="New York"
              placeholderTextColor={colors.mutedForeground}
              value={localCity}
              onChangeText={(v) => { setLocalCity(v); setVerified(false); }}
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
                value={localState}
                onChangeText={(v) => { setLocalState(v.toUpperCase().slice(0, 2)); setVerified(false); }}
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
                value={localZip}
                onChangeText={(v) => { setLocalZip(v.replace(/\D/g, "").slice(0, 5)); setVerified(false); }}
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
          <WorkflowCompletionButton
            label="Confirm delivery address"
            accessibilityLabel="Confirm delivery address"
            onPress={handleConfirm}
            variant="confirmation"
          />
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

      <Text style={[sh.ackTitle, { color: colors.foreground }]}>Request Received!</Text>
      <Text style={[sh.ackSub, { color: colors.mutedForeground }]}>
        We'll update your refill location to CR Mail Order and keep you posted every step of the way.
      </Text>

      {/* Switch summary */}
      <View style={[sh.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[sh.summaryLabel, { color: colors.mutedForeground }]}>Refill location update requested</Text>
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
            Delivering to: {address}, {city}, {stateVal} {zip}
          </Text>
        </View>
      </View>

      {/* Points */}
      <View style={[sh.pointsBadge, { backgroundColor: TEAL_LIGHT, borderColor: TEAL + "40" }]}>
        <Text style={sh.pointsStar}>⭐</Text>
        <Text style={[sh.pointsText, { color: TEAL }]}>+{points} points pending</Text>
      </View>

      {/* What's next */}
      <View style={[sh.nextCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[sh.nextTitle, { color: colors.foreground }]}>What happens next</Text>
        <CheckRow text="We'll contact your pharmacy to initiate the transfer" />
        <CheckRow text="You'll receive a confirmation once your prescription is moved" />
        <CheckRow text="Your first delivery will arrive in 7–10 business days" />
      </View>

      <WorkflowCompletionButton
        label="Done — Back to Opportunities"
        accessibilityLabel="Done, return to Opportunities"
        onPress={onDone}
      />
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
            onDone={() => router.replace("/(tabs)/opportunities")}
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
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: "column",
    gap: 6,
  },
  rewardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rewardLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  rewardBottom: {
    flexDirection: "column",
    gap: 2,
  },
  rewardPoints: {
    color: "#FCD34D",
    fontSize: 26,
    fontFamily: "Inter_800ExtraBold",
    lineHeight: 32,
  },
  rewardSub: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },

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

  // ── Autocomplete ─────────────────────────────────────────────────────────
  autocompleteWrap: { position: "relative", zIndex: 10 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 50,
    paddingLeft: 14,
    paddingRight: 10,
  },
  inputInner: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    paddingVertical: 13,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#F0FDF4",
    borderRadius: 20,
    marginRight: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#15803D",
  },
  dropdown: {
    position: "absolute",
    top: 54,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    zIndex: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionMain: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 20,
  },
  suggestionSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
    marginTop: 1,
  },
  unverifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  unverifiedText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#8A4B00",
    lineHeight: 17,
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
