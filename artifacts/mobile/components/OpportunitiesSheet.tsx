import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  MISSED_OPPORTUNITIES_COUNT,
  MOCK_OPPORTUNITIES,
  NEW_OPPORTUNITIES_COUNT,
  Opportunity,
  OpportunityCategory,
} from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

type FilterType = "all" | "new" | "missed" | OpportunityCategory;

const FILTER_TABS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: `New (${NEW_OPPORTUNITIES_COUNT})` },
  { key: "missed", label: `Missed (${MISSED_OPPORTUNITIES_COUNT})` },
  { key: "medication", label: "Medication" },
  { key: "preventive", label: "Preventive" },
  { key: "mail-delivery", label: "Mail Order" },
  { key: "specialist", label: "Specialist" },
];

const CATEGORY_EMOJIS: Record<string, string> = {
  medication: "💊",
  preventive: "🛡️",
  "mail-delivery": "📦",
  specialist: "🩺",
  upcoming: "📅",
};

function OppRow({ opp, onPress }: { opp: Opportunity; onPress: () => void }) {
  const colors = useColors();
  const borderColor = CATEGORY_COLORS[opp.category] ?? colors.primary;

  return (
    <TouchableOpacity
      style={[styles.oppRow, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.oppRowBar, { backgroundColor: borderColor }]} />
      <View style={styles.oppRowContent}>
        <View style={styles.oppRowTop}>
          <View style={[styles.oppRowIcon, { backgroundColor: borderColor + "20" }]}>
            <Text style={styles.oppRowEmoji}>{CATEGORY_EMOJIS[opp.category]}</Text>
          </View>
          <View style={styles.oppRowText}>
            <Text style={[styles.oppRowTitle, { color: colors.foreground }]} numberOfLines={1}>
              {opp.title}
            </Text>
            <Text style={[styles.oppRowDesc, { color: colors.mutedForeground }]} numberOfLines={1}>
              {opp.description}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </View>
        <View style={styles.oppRowFooter}>
          <View style={[styles.categoryPill, { backgroundColor: borderColor + "18" }]}>
            <Text style={[styles.categoryPillText, { color: borderColor }]}>
              {CATEGORY_LABELS[opp.category]}
            </Text>
          </View>
          <View style={styles.oppRowMeta}>
            <View style={[styles.pointsBadge, { backgroundColor: colors.secondary }]}>
              <Feather name="award" size={12} color={colors.primary} />
              <Text style={[styles.pointsBadgeText, { color: colors.primary }]}>
                +{opp.points} pts
              </Text>
            </View>
            <View style={[styles.savingsBadge, { backgroundColor: "#F0FDF4" }]}>
              <Feather name="dollar-sign" size={12} color="#22C55E" />
              <Text style={[styles.savingsBadgeText, { color: "#22C55E" }]}>
                Save ${opp.savings}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface Props {
  visible: boolean;
  onClose: () => void;
  startFilter?: FilterType;
}

export function OpportunitiesSheet({ visible, onClose, startFilter = "all" }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<FilterType>(startFilter);

  useEffect(() => {
    if (visible) {
      setActiveFilter(startFilter);
    }
  }, [visible, startFilter]);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 25,
          stiffness: 200,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) translateY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 100 || gs.vy > 0.8) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 25,
            stiffness: 200,
          }).start();
        }
      },
    })
  ).current;

  const filtered = MOCK_OPPORTUNITIES.filter((o) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "new" || activeFilter === "missed") return true;
    return o.category === activeFilter;
  });

  const handleOppPress = (id: string) => {
    onClose();
    setTimeout(() => router.push(`/opportunity/${id}` as never), 200);
  };

  const handleLogCare = () => {
    onClose();
    setTimeout(() => router.push("/log-upcoming-care" as never), 200);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              height: SHEET_HEIGHT,
              paddingBottom: insets.bottom + (Platform.OS === "web" ? 20 : 0),
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Handle */}
          <View {...panResponder.panHandlers} style={styles.handleArea}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                All Opportunities
              </Text>
              <Text style={[styles.sheetSubtitle, { color: colors.mutedForeground }]}>
                {NEW_OPPORTUNITIES_COUNT} new · {MISSED_OPPORTUNITIES_COUNT} missed
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.muted }]}
              onPress={onClose}
            >
              <Feather name="x" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* Log Upcoming Care CTA */}
          <View style={styles.logCareWrapper}>
            <TouchableOpacity
              style={[styles.logCareBtn, { backgroundColor: colors.secondary, borderColor: colors.primary }]}
              onPress={handleLogCare}
              activeOpacity={0.8}
            >
              <View style={[styles.logCareIcon, { backgroundColor: colors.primary }]}>
                <Feather name="plus" size={16} color="#fff" />
              </View>
              <View style={styles.logCareText}>
                <Text style={[styles.logCareTitle, { color: colors.primary }]}>
                  Log Upcoming Care
                </Text>
                <Text style={[styles.logCareDesc, { color: colors.mutedForeground }]}>
                  Get personalized savings before your visit
                </Text>
              </View>
              <Feather name="arrow-right" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabs}
          >
            {FILTER_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterTab,
                  activeFilter === tab.key
                    ? { backgroundColor: colors.primaryDark }
                    : { backgroundColor: colors.muted },
                ]}
                onPress={() => setActiveFilter(tab.key)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    activeFilter === tab.key
                      ? { color: "#fff" }
                      : { color: colors.mutedForeground },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Opportunities List */}
          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {filtered.map((opp) => (
              <OppRow
                key={opp.id}
                opp={opp}
                onPress={() => handleOppPress(opp.id)}
              />
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  handleArea: {
    paddingVertical: 14,
    alignItems: "center",
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  sheetTitle: { fontSize: 20, fontWeight: "800" },
  sheetSubtitle: { fontSize: 13, marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  logCareWrapper: { paddingHorizontal: 16, paddingTop: 14 },
  logCareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
  },
  logCareIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logCareText: { flex: 1 },
  logCareTitle: { fontSize: 14, fontWeight: "700" },
  logCareDesc: { fontSize: 12, marginTop: 2 },
  filterTabs: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterTabText: { fontSize: 13, fontWeight: "600" },
  listScroll: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },
  oppRow: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
  },
  oppRowBar: { width: 5 },
  oppRowContent: { flex: 1, padding: 14, gap: 10 },
  oppRowTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  oppRowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  oppRowEmoji: { fontSize: 20 },
  oppRowText: { flex: 1 },
  oppRowTitle: { fontSize: 14, fontWeight: "700" },
  oppRowDesc: { fontSize: 12, marginTop: 2 },
  oppRowFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryPillText: { fontSize: 11, fontWeight: "600" },
  oppRowMeta: { flexDirection: "row", gap: 8 },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pointsBadgeText: { fontSize: 12, fontWeight: "600" },
  savingsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  savingsBadgeText: { fontSize: 12, fontWeight: "600" },
});
