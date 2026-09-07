/**
 * Care Site Alternative — Individual Group Screen
 *
 * Shows provider options for one specific procedure (C-section Delivery,
 * Diagnostics Ultrasound, or Specialist OB/GYN).
 *
 * Navigation path:
 *   Opportunities tab → this screen → [provider tap] →
 *   Urgency (Step 1) → Booking Method (Step 2)
 */

import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OpportunityDetailSkeleton } from "@/components/OpportunityDetailSkeleton";
import {
  CARE_SITE_GROUPS,
  CareSiteGroup,
  OPP_TO_GROUP,
  Provider,
} from "@/constants/care-site-data";
import { useColors } from "@/hooks/useColors";

const NATIVE_DRIVER = Platform.OS !== "web";

const URGENCY_OPTIONS = ["Immediately", "2 weeks", "4 weeks"] as const;
type Urgency = (typeof URGENCY_OPTIONS)[number];


// ─── ProviderRow ──────────────────────────────────────────────────────────────

function ProviderRow({
  provider,
  isSelected,
  onPress,
}: {
  provider: Provider;
  isSelected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[
        styles.providerRow,
        {
          backgroundColor: isSelected ? colors.primary + "0F" : colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${provider.name}, ${provider.distance}, ${
        provider.points === 0 ? "no extra points" : `+${provider.points} points`
      }${isSelected ? ", selected" : ""}`}
    >
      <View style={styles.providerLeft}>
        <Text
          style={[
            styles.providerName,
            { color: isSelected ? colors.primary : colors.foreground },
          ]}
        >
          {provider.name}
        </Text>
        <View style={styles.providerDistRow}>
          <Feather name="map-pin" size={12} color="#EF4444" />
          <Text style={[styles.providerDist, { color: colors.mutedForeground }]}>
            {" "}{provider.distance}
          </Text>
        </View>
      </View>

      <View style={styles.providerRight}>
        {provider.points === 0 ? (
          <Text style={[styles.providerPtsZero, { color: colors.mutedForeground }]}>
            0 points
          </Text>
        ) : (
          <Text style={[styles.providerPts, { color: colors.primary }]}>
            +{provider.points.toLocaleString()} points
          </Text>
        )}
        {isSelected && (
          <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
            <Feather name="check" size={12} color={colors.primaryForeground} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Scheduling modal (2-step) ────────────────────────────────────────────────

interface PendingSelection {
  providerId: string;
  providerName: string;
  points: number;
}

function SchedulingModal({
  visible,
  pending,
  procedure,
  onBookForMe,
  onScheduleMyself,
  onDismiss,
  onDone,
}: {
  visible: boolean;
  pending: PendingSelection | null;
  procedure: string;
  onBookForMe: (urgency: Urgency) => void;
  onScheduleMyself: () => void;
  onDismiss: () => void;
  onDone: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [urgency, setUrgency] = useState<Urgency | null>(null);

  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      setStep(0);
      setUrgency(null);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: NATIVE_DRIVER,
        tension: 70,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 220,
        useNativeDriver: NATIVE_DRIVER,
      }).start();
    }
  }, [visible]);

  const handleUrgencySelect = (u: Urgency) => {
    setUrgency(u);
    setStep(1);
  };

  const handleBookForMe = () => {
    // Transition to success card instead of closing immediately
    setStep(2);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={step === 2 ? () => urgency && onBookForMe(urgency) : onDismiss}
    >
      {/* Backdrop — not dismissible on success step */}
      <Pressable
        style={styles.backdrop}
        onPress={step === 2 ? undefined : onDismiss}
      />

      <Animated.View
        style={[
          styles.sheet,
          step === 2 && styles.sheetExpanded,
          {
            backgroundColor: colors.card,
            paddingBottom: insets.bottom + 24,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {step !== 2 && (
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
        )}

        {step === 0 ? (
          /* ── Step 1: Urgency ── */
          <>
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
              How urgent is the appointment you want?
            </Text>
            {pending && (
              <Text style={[styles.sheetSub, { color: colors.mutedForeground }]}>
                {pending.providerName} · {procedure}
              </Text>
            )}
            <View style={styles.urgencyList}>
              {URGENCY_OPTIONS.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[
                    styles.urgencyBtn,
                    { backgroundColor: colors.secondary, borderColor: colors.border },
                  ]}
                  onPress={() => handleUrgencySelect(u)}
                  activeOpacity={0.78}
                  accessibilityRole="button"
                  accessibilityLabel={`Urgency: ${u}`}
                >
                  <Text style={[styles.urgencyBtnText, { color: colors.foreground }]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={onDismiss} style={styles.sheetCancel}>
              <Text style={[styles.sheetCancelText, { color: colors.mutedForeground }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </>
        ) : step === 1 ? (
          /* ── Step 2: Booking method ── */
          <>
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
              How would you like to schedule?
            </Text>
            {urgency && (
              <View
                style={[
                  styles.urgencyChip,
                  { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" },
                ]}
              >
                <Feather name="clock" size={13} color={colors.primary} />
                <Text style={[styles.urgencyChipText, { color: colors.primary }]}>
                  {urgency}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.bookForMeBtn, { backgroundColor: colors.primary }]}
              onPress={handleBookForMe}
              activeOpacity={0.82}
              accessibilityRole="button"
            >
              <Feather name="calendar" size={18} color={colors.primaryForeground} style={{ marginRight: 10 }} />
              <Text style={[styles.bookForMeText, { color: colors.primaryForeground }]}>
                Book an Appointment for Me{"\n"}
                <Text style={[styles.bookForMeSubText, { color: colors.primaryForeground }]}>(Care Reward)</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.scheduleMyselfBtn,
                { borderColor: colors.border, backgroundColor: colors.secondary },
              ]}
              onPress={onScheduleMyself}
              activeOpacity={0.78}
              accessibilityRole="button"
            >
              <Text style={[styles.scheduleMyselfText, { color: colors.foreground }]}>
                Schedule My Own Appointment
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onDismiss} style={styles.sheetCancel}>
              <Text style={[styles.sheetCancelText, { color: colors.mutedForeground }]}>
                Go back
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          /* ── Step 3: Appointment Scheduled ── */
          <>
            <View style={styles.successIconWrap}>
              <View style={[styles.successIconCircle, { backgroundColor: colors.primary + "22" }]}>
                <Feather name="check" size={38} color={colors.primary} />
              </View>
            </View>

            <Text style={[styles.successTitle, { color: colors.foreground }]}>
              Appointment Scheduled!
            </Text>
            <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
              Appointment Underway. We will reach out to you with your scheduled appointment.
            </Text>

            {/* Done */}
            <TouchableOpacity
              style={[styles.backToOppsBtn, { backgroundColor: colors.primary }]}
              onPress={onDone}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Done"
            >
              <Text style={[styles.backToOppsText, { color: colors.primaryForeground }]}>Done</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CareSiteAlternativeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  // Resolve group from opp ID
  const groupId = id ? OPP_TO_GROUP[id] : undefined;
  const group: CareSiteGroup | undefined = CARE_SITE_GROUPS.find(
    (g) => g.id === groupId
  );

  // Skeleton
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, []);

  // Set nav header to the procedure name
  useEffect(() => {
    if (group) {
      navigation.setOptions({ title: group.procedure });
    }
  }, [navigation, group]);

  // Selected provider within this group
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [pending, setPending] = useState<PendingSelection | null>(null);

  const openModal = (provider: Provider) => {
    setPending({ providerId: provider.id, providerName: provider.name, points: provider.points });
    setModalVisible(true);
  };

  const handleBookForMe = (_urgency: Urgency) => {
    if (!pending) return;
    setSelectedProviderId(pending.providerId);
    setModalVisible(false);
    setPending(null);
  };

  const handleScheduleMyself = () => {
    setModalVisible(false);
    setPending(null);
    router.back();
  };

  if (loading) return <OpportunityDetailSkeleton />;

  if (!group) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Opportunity not found.
        </Text>
      </View>
    );
  }

  const hasSelection = selectedProviderId !== null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 48 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Procedure label */}
        <Text style={[styles.procedureLabel, { color: colors.mutedForeground }]}>
          Care Site Alternative
        </Text>
        <Text style={[styles.procedureTitle, { color: colors.foreground }]}>
          {group.procedure}
        </Text>

        {/* Provider options */}
        <View
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.providerList}>
            {group.providers.map((p) => (
              <ProviderRow
                key={p.id}
                provider={p}
                isSelected={selectedProviderId === p.id}
                onPress={() => openModal(p)}
              />
            ))}
          </View>

          {/* Schedule CTA */}
          <TouchableOpacity
            style={[
              styles.scheduleBtn,
              hasSelection
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: "transparent", borderColor: colors.primary },
            ]}
            onPress={() => {
              if (hasSelection) {
                const sel = group.providers.find((p) => p.id === selectedProviderId)!;
                openModal(sel);
              }
            }}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Schedule an appointment"
          >
            <Feather
              name="calendar"
              size={17}
              color={hasSelection ? colors.primaryForeground : colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.scheduleBtnText,
                { color: hasSelection ? colors.primaryForeground : colors.primary },
              ]}
            >
              Schedule an appointment
            </Text>
          </TouchableOpacity>
        </View>

        {/* Keep Current Plan */}
        <TouchableOpacity
          style={[
            styles.keepCurrentBtn,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
          onPress={() => router.back()}
          activeOpacity={0.78}
          accessibilityRole="button"
          accessibilityLabel="Keep current plan and go back"
        >
          <Text style={[styles.keepCurrentText, { color: colors.foreground }]}>
            Keep Current Plan
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <SchedulingModal
        visible={modalVisible}
        pending={pending}
        procedure={group.procedure}
        onBookForMe={handleBookForMe}
        onScheduleMyself={handleScheduleMyself}
        onDismiss={() => { setModalVisible(false); setPending(null); }}
        onDone={() => {
          setModalVisible(false);
          setPending(null);
          router.push("/(tabs)/opportunities" as never);
        }}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  scroll: { paddingHorizontal: 16, paddingTop: 20, gap: 14 },

  procedureLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  procedureTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginTop: -4,
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },

  providerList: { gap: 10 },

  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 14,
    minHeight: 64,
  },
  providerLeft: { flex: 1, gap: 4 },
  providerName: { fontSize: 14, fontFamily: "Inter_600SemiBold", flexShrink: 1 },
  providerDistRow: { flexDirection: "row", alignItems: "center" },
  providerDist: { fontSize: 12, fontFamily: "Inter_400Regular" },
  providerRight: { alignItems: "flex-end", gap: 6, marginLeft: 12 },
  providerPts: { fontSize: 14, fontFamily: "Inter_700Bold" },
  providerPtsZero: { fontSize: 14, fontFamily: "Inter_400Regular" },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  scheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 15,
    minHeight: 54,
  },
  scheduleBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },

  keepCurrentBtn: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: "center",
    minHeight: 56,
  },
  keepCurrentText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },

  errorText: { fontSize: 15, fontFamily: "Inter_400Regular" },

  // ── Modal ──
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    gap: 16,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16 },
      android: { elevation: 16 },
    }),
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  sheetTitle: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  sheetSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: -8,
  },
  urgencyList: { gap: 10 },
  urgencyBtn: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  urgencyBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  urgencyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  urgencyChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  bookForMeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    minHeight: 64,
  },
  bookForMeText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  bookForMeSubText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  scheduleMyselfBtn: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: "center",
    minHeight: 56,
  },
  scheduleMyselfText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  sheetCancel: { alignItems: "center", paddingVertical: 4 },
  sheetCancelText: { fontSize: 14, fontFamily: "Inter_400Regular" },

  // ── Expanded sheet for success state ──
  sheetExpanded: {
    top: 60,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // ── Success card ──
  successIconWrap: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  successSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: -8,
  },
  detailsCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  detailsCardTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  detailsDivider: {
    height: 1,
    marginTop: -4,
    marginBottom: 2,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  detailsLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flexShrink: 0,
  },
  detailsValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
    flexShrink: 1,
  },
  detailsPts: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  backToOppsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 18,
    minHeight: 60,
  },
  backToOppsText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
