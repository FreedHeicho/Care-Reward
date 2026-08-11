/**
 * Care Site Alternatives Screen
 *
 * Shown after "Log Upcoming Care" or when tapping a Care Site
 * Alternative opportunity card. Displays personalised provider options
 * grouped by procedure. Tapping a provider row triggers the two-step
 * urgency → scheduling modal.
 *
 * Navigation path:
 *   Opportunities → Care Site Alternatives → [provider tap] → Urgency
 *   Modal (Step 1) → Booking Method Modal (Step 2)
 */

import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
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
  Provider,
} from "@/constants/care-site-data";
import { useColors } from "@/hooks/useColors";

const NATIVE_DRIVER = Platform.OS !== "web";

const URGENCY_OPTIONS = ["Immediately", "2 weeks", "4 weeks"] as const;
type Urgency = (typeof URGENCY_OPTIONS)[number];


// ─── PointsBanner ─────────────────────────────────────────────────────────────

function PointsBanner({ highlight }: { highlight?: boolean }) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(highlight ? 0 : 1)).current;

  useEffect(() => {
    if (!highlight) return;
    // Fade + scale in, then pulse twice to celebrate
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: NATIVE_DRIVER,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.04,
          useNativeDriver: NATIVE_DRIVER,
          tension: 180,
          friction: 8,
        }),
      ]),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: NATIVE_DRIVER,
        tension: 180,
        friction: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.03,
        useNativeDriver: NATIVE_DRIVER,
        tension: 180,
        friction: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: NATIVE_DRIVER,
        tension: 180,
        friction: 8,
      }),
    ]).start();
  }, [highlight]);

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: highlight ? colors.primary + "22" : colors.primary + "15",
          borderColor: highlight ? colors.primary + "60" : colors.primary + "30",
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Feather name="star" size={20} color={colors.primary} />
      <View style={styles.bannerText}>
        <Text style={[styles.bannerTitle, { color: colors.primary }]}>
          +50 Points Earned
        </Text>
        <Text style={[styles.bannerSub, { color: colors.primary + "CC" }]}>
          For logging your upcoming care
        </Text>
      </View>
    </Animated.View>
  );
}

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
  const PRIMARY = "#1A6B5A";

  return (
    <TouchableOpacity
      style={[
        styles.providerRow,
        {
          backgroundColor: isSelected ? PRIMARY + "0F" : colors.card,
          borderColor: isSelected ? PRIMARY : colors.border,
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
            { color: isSelected ? PRIMARY : colors.foreground },
          ]}
        >
          {provider.name}
        </Text>
        <View style={styles.providerDistRow}>
          <Feather name="map-pin" size={12} color="#EF4444" />
          <Text style={[styles.providerDist, { color: colors.mutedForeground }]}>
            {" "}
            {provider.distance}
          </Text>
        </View>
      </View>

      <View style={styles.providerRight}>
        {provider.points === 0 ? (
          <Text style={[styles.providerPtsZero, { color: colors.mutedForeground }]}>
            0 points
          </Text>
        ) : (
          <Text style={[styles.providerPts, { color: PRIMARY }]}>
            +{provider.points.toLocaleString()} points
          </Text>
        )}
        {isSelected && (
          <View style={[styles.checkCircle, { backgroundColor: PRIMARY }]}>
            <Feather name="check" size={12} color="#fff" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── CareSiteCard ─────────────────────────────────────────────────────────────

function CareSiteCard({
  group,
  selectedProviderId,
  onProviderTap,
  onSchedule,
}: {
  group: CareSiteGroup;
  selectedProviderId: string | null;
  onProviderTap: (provider: Provider) => void;
  onSchedule: () => void;
}) {
  const colors = useColors();
  const PRIMARY = "#1A6B5A";
  const hasSelection = selectedProviderId !== null;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Card header */}
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          Care Site Alternative
        </Text>
        <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
          {group.procedure}
        </Text>
      </View>

      {/* Provider options */}
      <View style={styles.providerList}>
        {group.providers.map((p) => (
          <ProviderRow
            key={p.id}
            provider={p}
            isSelected={selectedProviderId === p.id}
            onPress={() => onProviderTap(p)}
          />
        ))}
      </View>

      {/* Schedule CTA */}
      <TouchableOpacity
        style={[
          styles.scheduleBtn,
          hasSelection
            ? { backgroundColor: PRIMARY, borderColor: PRIMARY }
            : { backgroundColor: "transparent", borderColor: PRIMARY },
        ]}
        onPress={onSchedule}
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityLabel="Schedule an appointment"
      >
        <Feather
          name="calendar"
          size={17}
          color={hasSelection ? "#fff" : PRIMARY}
          style={{ marginRight: 8 }}
        />
        <Text
          style={[
            styles.scheduleBtnText,
            { color: hasSelection ? "#fff" : PRIMARY },
          ]}
        >
          Schedule an appointment
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── UrgencyModal (2-step bottom sheet) ───────────────────────────────────────

interface PendingSelection {
  groupId: string;
  providerId: string;
  providerName: string;
  procedure: string;
  points: number;
}

function SchedulingModal({
  visible,
  pending,
  onBookForMe,
  onScheduleMyself,
  onDismiss,
}: {
  visible: boolean;
  pending: PendingSelection | null;
  onBookForMe: (urgency: Urgency) => void;
  onScheduleMyself: () => void;
  onDismiss: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const PRIMARY = "#1A6B5A";

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [urgency, setUrgency] = useState<Urgency | null>(null);

  // Slide-up animation
  const slideAnim = useRef(new Animated.Value(300)).current;

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
    // Transition to success card (step 2) instead of closing immediately
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

      {/* Sheet */}
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
        {/* Handle — hidden on success */}
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
                {pending.providerName} · {pending.procedure}
              </Text>
            )}
            <View style={styles.urgencyList}>
              {URGENCY_OPTIONS.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[
                    styles.urgencyBtn,
                    {
                      backgroundColor: colors.secondary,
                      borderColor: colors.border,
                    },
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
                  { backgroundColor: PRIMARY + "15", borderColor: PRIMARY + "40" },
                ]}
              >
                <Feather name="clock" size={13} color={PRIMARY} />
                <Text style={[styles.urgencyChipText, { color: PRIMARY }]}>
                  {urgency}
                </Text>
              </View>
            )}

            {/* Primary: Book for me */}
            <TouchableOpacity
              style={[styles.bookForMeBtn, { backgroundColor: PRIMARY }]}
              onPress={handleBookForMe}
              activeOpacity={0.82}
              accessibilityRole="button"
            >
              <Feather name="calendar" size={18} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.bookForMeText}>
                Book an Appointment for Me{"\n"}
                <Text style={styles.bookForMeSubText}>(Care Reward)</Text>
              </Text>
            </TouchableOpacity>

            {/* Secondary: schedule myself */}
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
            {/* Success icon */}
            <View style={styles.successIconWrap}>
              <View style={[styles.successIconCircle, { backgroundColor: PRIMARY + "22" }]}>
                <Feather name="check" size={38} color={PRIMARY} />
              </View>
            </View>

            <Text style={[styles.successTitle, { color: colors.foreground }]}>
              Appointment Scheduled!
            </Text>
            <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
              We are going to reach back out to you with the appointment we were able to find.
            </Text>

            {/* Done */}
            <TouchableOpacity
              style={[styles.backToOppsBtn, { backgroundColor: PRIMARY }]}
              onPress={() => urgency && onBookForMe(urgency)}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Done"
            >
              <Text style={styles.backToOppsText}>Done</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CareSiteAlternativesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const { fromLog } = useLocalSearchParams<{ fromLog?: string }>();
  const highlightBanner = fromLog === "true";

  // Skeleton
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: "Care Site Alternatives" });
  }, [navigation]);

  // Per-group selected provider
  const [selectedProviders, setSelectedProviders] = useState<
    Record<string, string>
  >({});

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingSelection, setPendingSelection] =
    useState<PendingSelection | null>(null);

  const openScheduling = (group: CareSiteGroup, provider: Provider) => {
    setPendingSelection({
      groupId: group.id,
      providerId: provider.id,
      providerName: provider.name,
      procedure: group.procedure,
      points: provider.points,
    });
    setModalVisible(true);
  };

  // When "Schedule an appointment" tapped with existing selection, re-open
  const onScheduleTap = (group: CareSiteGroup) => {
    const sel = selectedProviders[group.id];
    if (sel) {
      const provider = group.providers.find((p) => p.id === sel)!;
      openScheduling(group, provider);
    }
  };

  const handleBookForMe = (urgency: string) => {
    if (!pendingSelection) return;
    setSelectedProviders((prev) => ({
      ...prev,
      [pendingSelection.groupId]: pendingSelection.providerId,
    }));
    setModalVisible(false);
    setPendingSelection(null);
  };

  const handleScheduleMyself = () => {
    setModalVisible(false);
    setPendingSelection(null);
    router.back();
  };

  const handleDismiss = () => {
    setModalVisible(false);
    setPendingSelection(null);
  };

  if (loading) return <OpportunityDetailSkeleton />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header count */}
        <Text style={[styles.headerCount, { color: colors.mutedForeground }]}>
          We found {CARE_SITE_GROUPS.length} care opportunities for you
        </Text>

        {/* Points earned banner */}
        <PointsBanner highlight={highlightBanner} />

        {/* Care site cards */}
        {CARE_SITE_GROUPS.map((group) => (
          <CareSiteCard
            key={group.id}
            group={group}
            selectedProviderId={selectedProviders[group.id] ?? null}
            onProviderTap={(provider) => openScheduling(group, provider)}
            onSchedule={() => onScheduleTap(group)}
          />
        ))}

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

      {/* 2-step scheduling modal */}
      <SchedulingModal
        visible={modalVisible}
        pending={pendingSelection}
        onBookForMe={handleBookForMe}
        onScheduleMyself={handleScheduleMyself}
        onDismiss={handleDismiss}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },

  headerCount: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 4,
  },

  // ── Banner ──
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bannerText: { flex: 1 },
  bannerTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  bannerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },

  // ── Card ──
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  cardHeader: { gap: 2 },
  cardTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  cardSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },

  providerList: { gap: 8 },

  // ── Provider row ──
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 60,
  },
  providerLeft: { flex: 1, gap: 4 },
  providerName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    flexShrink: 1,
  },
  providerDistRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  providerDist: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  providerRight: {
    alignItems: "flex-end",
    gap: 6,
    marginLeft: 12,
  },
  providerPts: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  providerPtsZero: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Schedule button ──
  scheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 14,
    minHeight: 52,
  },
  scheduleBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },

  // ── Keep Current Plan ──
  keepCurrentBtn: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: "center",
    minHeight: 56,
  },
  keepCurrentText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },

  // ── Modal backdrop ──
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  // ── Bottom sheet ──
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
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
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
  sheetTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  sheetSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: -8,
  },

  // ── Urgency ──
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
  urgencyBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },

  // ── Urgency chip (step 2) ──
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
  urgencyChipText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },

  // ── Step 2 buttons ──
  bookForMeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    minHeight: 64,
    gap: 0,
  },
  bookForMeText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  bookForMeSubText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
  },
  scheduleMyselfBtn: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: "center",
    minHeight: 56,
  },
  scheduleMyselfText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },

  sheetCancel: {
    alignItems: "center",
    paddingVertical: 4,
  },
  sheetCancelText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },

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
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
