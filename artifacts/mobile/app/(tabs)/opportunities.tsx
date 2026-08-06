import { Feather } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  MISSED_OPPORTUNITIES_COUNT,
  MOCK_OPPORTUNITIES,
  Opportunity,
  OpportunityFilterCategory,
} from "@/constants/data";
import { useColors } from "@/hooks/useColors";

// ─── Types ──────────────────────────────────────────────────────────────────

type FilterKey = Exclude<OpportunityFilterCategory, "mail-delivery"> | null;

// ─── Constants ───────────────────────────────────────────────────────────────

const FILTER_OPTIONS: {
  key: Exclude<OpportunityFilterCategory, "mail-delivery">;
  label: string;
  emoji: string;
}[] = [
  { key: "care-site-alternative", label: "Care Site Alt.", emoji: "💊" },
  { key: "care-protocol", label: "Care Protocol", emoji: "🩺" },
  { key: "preventative-care", label: "Preventive Care", emoji: "🛡️" },
  { key: "care-quality", label: "Care Quality", emoji: "📋" },
];

/**
 * WCAG AA-compliant accent colors for each filter category.
 * Contrast ratios verified against white (#FFF) background.
 * accent:    foreground used on category chip text — ≥ 4.5:1 on chip bg
 * chipBg:    light tint for category chip background
 * bar:       top-border accent color (decorative only, not text)
 */
const CATEGORY_META: Record<
  string,
  { bar: string; chipBg: string; chipText: string; label: string }
> = {
  "care-site-alternative": {
    bar: "#7C3AED",
    chipBg: "#F3F0FF",
    chipText: "#5B21B6", // 7.09:1 on #F3F0FF
    label: "Care Site Alt.",
  },
  "care-protocol": {
    bar: "#1D4ED8",
    chipBg: "#EFF6FF",
    chipText: "#1E40AF", // 7.4:1 on #EFF6FF
    label: "Care Protocol",
  },
  "preventative-care": {
    bar: "#15803D",
    chipBg: "#F0FDF4",
    chipText: "#166534", // 6.8:1 on #F0FDF4
    label: "Preventive Care",
  },
  "care-quality": {
    bar: "#B45309",
    chipBg: "#FEF3C7",
    chipText: "#92400E", // 5.1:1 on #FEF3C7
    label: "Care Quality",
  },
};

const ICON_EMOJI: Record<string, string> = {
  pill: "💊",
  package: "📦",
  calendar: "📅",
  medication: "💊",
  preventive: "🛡️",
  "mail-delivery": "📦",
  specialist: "🩺",
  upcoming: "📅",
  CARE_SITE_ALTERNATIVE: "💊",
  PREVENTATIVE_CARE: "🛡️",
  CARE_QUALITY: "📋",
  CARE_PROTOCOL: "🩺",
};

// ─── OppCard ─────────────────────────────────────────────────────────────────

function OppCard({ opp }: { opp: Opportunity }) {
  const colors = useColors();
  const router = useRouter();

  const cat = opp.filterCategory ? CATEGORY_META[opp.filterCategory] : null;
  const barColor = cat?.bar ?? colors.primary;
  const icon = opp.icon
    ? (ICON_EMOJI[opp.icon] ?? "💊")
    : (ICON_EMOJI[opp.category] ?? "💊");
  const iconBg = opp.iconBg ?? "#EDE9FE";

  const pointsLabel =
    opp.pointsMonthly > 0
      ? `${opp.points} + ${opp.pointsMonthly}/mo pts`
      : `${opp.points} pts`;

  const handleAction = () => {
    if (opp.category === "care-site") {
      router.push(`/care-site-alternative/${opp.id}` as never);
    } else if (opp.category === "mail-delivery") {
      router.push(`/mail-delivery-opportunity/${opp.id}` as never);
    } else if (opp.category === "medication") {
      router.push(`/medication-opportunity/${opp.id}` as never);
    } else if (opp.title.includes("Survey")) {
      router.push(`/patient-satisfaction-survey/${opp.id}` as never);
    } else if (opp.category === "upcoming" && opp.title === "Log Upcoming Care") {
      router.push("/log-upcoming-care" as never);
    } else {
      router.push(`/opportunity-variants/${opp.id}` as never);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          // Top accent stripe — decorative, not conveying info alone
          borderTopColor: barColor,
        },
      ]}
      onPress={handleAction}
      activeOpacity={0.78}
    >
      {/* Row 1: category chip + points pill */}
      <View style={styles.cardTopRow}>
        {cat ? (
          <View style={[styles.catChip, { backgroundColor: cat.chipBg }]}>
            <Text style={[styles.catChipText, { color: cat.chipText }]}>
              {cat.label}
            </Text>
          </View>
        ) : (
          <View />
        )}

        <View style={styles.pointsPill}>
          <Text style={styles.pointsStar}>⭐</Text>
          <Text style={styles.pointsText}>{pointsLabel}</Text>
        </View>
      </View>

      {/* Row 2: icon + title + description */}
      <View style={styles.cardBody}>
        <View style={[styles.cardIcon, { backgroundColor: iconBg }]}>
          <Text style={styles.cardEmoji}>{icon}</Text>
        </View>
        <View style={styles.cardTitles}>
          <Text
            style={[styles.cardTitle, { color: colors.foreground }]}
            numberOfLines={2}
          >
            {opp.title}
          </Text>
          <Text
            style={[styles.cardDesc, { color: colors.mutedForeground }]}
            numberOfLines={2}
          >
            {opp.description}
          </Text>
        </View>
      </View>

      {/* Row 3: CTA */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: barColor }]}
        onPress={handleAction}
        activeOpacity={0.85}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        <Text style={styles.actionBtnText}>{opp.actionLabel ?? "How To Earn"}</Text>
        <Feather name="arrow-right" size={15} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({
  onClear,
  filter,
}: {
  onClear: () => void;
  filter: FilterKey;
}) {
  const colors = useColors();
  const label = filter
    ? FILTER_OPTIONS.find((f) => f.key === filter)?.label
    : null;

  return (
    <View style={styles.emptyWrap}>
      <View style={[styles.emptyIconWrap, { backgroundColor: colors.secondary }]}>
        <Feather name="check-circle" size={32} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
        All caught up!
      </Text>
      <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
        {label
          ? `No open opportunities in "${label}" right now.`
          : "You've completed all available opportunities."}
      </Text>
      {filter && (
        <TouchableOpacity
          style={[styles.emptyBtn, { borderColor: colors.primary }]}
          onPress={onClear}
        >
          <Text style={[styles.emptyBtnText, { color: colors.primary }]}>
            View all categories
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OpportunitiesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  // ≥ 640 → 2-column card grid
  const isTablet = width >= 640;

  const [filter, setFilter] = useState<FilterKey>(null);
  const opportunities = MOCK_OPPORTUNITIES;

  useEffect(() => {
    navigation.setOptions({
      title: "Opportunities",
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {}}
          style={{ marginRight: 16 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="share-2" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Apply filter
  const filtered = useMemo(() => {
    if (filter === null)
      return opportunities.filter((o) => !!o.filterCategory);
    return opportunities.filter((o) => o.filterCategory === filter);
  }, [filter, opportunities]);

  // Group by `group` label, preserving insertion order
  const grouped = useMemo(() => {
    const map = new Map<string, Opportunity[]>();
    for (const o of filtered) {
      const key = o.group ?? "Opportunities";
      const arr = map.get(key) ?? [];
      arr.push(o);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  // Aggregate stats
  const totalPoints = filtered.reduce((sum, o) => sum + o.points, 0);

  const activeLabel = filter
    ? FILTER_OPTIONS.find((f) => f.key === filter)?.label
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Missed-opportunities banner ─────────────────────────────── */}
        <TouchableOpacity
          style={[
            styles.missedBanner,
            { backgroundColor: "#FFF5F5", borderLeftColor: "#DC2626" },
          ]}
          onPress={() => router.push("/missed-opportunities" as never)}
          activeOpacity={0.8}
        >
          <View style={styles.missedIconWrap}>
            <Feather name="bell" size={16} color="#DC2626" />
          </View>
          <View style={styles.missedBody}>
            <Text style={[styles.missedTitle, { color: "#B91C1C" }]}>
              {MISSED_OPPORTUNITIES_COUNT} Missed Opportunities
            </Text>
            <Text style={[styles.missedSub, { color: "#7A8699" }]}>
              Review them to improve your health journey
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color="#DC2626" />
        </TouchableOpacity>

        {/* ── Stats bar ───────────────────────────────────────────────── */}
        <View
          style={[
            styles.statsBar,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {filtered.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Available
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#92400E" }]}>
              ⭐ {totalPoints}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Pts to Earn
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#B91C1C" }]}>
              {MISSED_OPPORTUNITIES_COUNT}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Missed
            </Text>
          </View>
        </View>

        {/* ── Filter chips ─────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {/* "All" chip */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === null
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => setFilter(null)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: filter === null ? "#fff" : colors.mutedForeground },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {FILTER_OPTIONS.map((opt) => {
            const active = filter === opt.key;
            const meta = CATEGORY_META[opt.key];
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.filterChip,
                  active
                    ? { backgroundColor: meta.chipBg, borderColor: meta.bar }
                    : { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => setFilter(active ? null : opt.key)}
                activeOpacity={0.75}
              >
                <Text style={styles.filterEmoji}>{opt.emoji}</Text>
                <Text
                  style={[
                    styles.filterChipText,
                    { color: active ? meta.chipText : colors.mutedForeground },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Active filter label */}
        {activeLabel && (
          <View style={styles.activeLabelRow}>
            <Text style={[styles.activeLabel, { color: colors.mutedForeground }]}>
              Showing:{" "}
              <Text style={{ color: colors.foreground, fontWeight: "700" }}>
                {activeLabel}
              </Text>
            </Text>
            <TouchableOpacity
              onPress={() => setFilter(null)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.clearText, { color: colors.primary }]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Opportunity groups ───────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <EmptyState filter={filter} onClear={() => setFilter(null)} />
        ) : (
          grouped.map(([groupName, opps]) => (
            <View key={groupName} style={styles.group}>
              {/* Group header */}
              <View style={styles.groupHeader}>
                <Text
                  style={[styles.groupTitle, { color: colors.foreground }]}
                >
                  {groupName}
                </Text>
                <View
                  style={[
                    styles.groupCount,
                    { backgroundColor: colors.secondary },
                  ]}
                >
                  <Text
                    style={[
                      styles.groupCountText,
                      { color: colors.primary },
                    ]}
                  >
                    {opps.length}
                  </Text>
                </View>
              </View>

              {/* Cards — 2-column on tablet */}
              {isTablet ? (
                <View style={styles.twoColGrid}>
                  {opps.map((opp) => (
                    <View key={opp.id} style={styles.twoColCell}>
                      <OppCard opp={opp} />
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.cardList}>
                  {opps.map((opp) => (
                    <OppCard key={opp.id} opp={opp} />
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, gap: 16 },

  // ── Missed banner
  missedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
    paddingVertical: 12,
    paddingRight: 14,
    paddingLeft: 12,
  },
  missedIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  missedBody: { flex: 1, gap: 2 },
  missedTitle: { fontSize: 13, fontWeight: "700", lineHeight: 18 },
  missedSub: { fontSize: 12, lineHeight: 16 },

  // ── Stats bar
  statsBar: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    paddingVertical: 14,
  },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statValue: { fontSize: 17, fontWeight: "800", lineHeight: 22 },
  statLabel: { fontSize: 11, fontWeight: "500" },
  statDivider: { width: 1, marginVertical: 4 },

  // ── Filter chips
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    // minimum 44px touch target height
    minHeight: 44,
    paddingVertical: 10,
  },
  filterEmoji: { fontSize: 13 },
  filterChipText: { fontSize: 13, fontWeight: "600" },

  // ── Active filter label
  activeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -4,
  },
  activeLabel: { fontSize: 13 },
  clearText: { fontSize: 13, fontWeight: "600" },

  // ── Groups
  group: { gap: 12 },
  groupHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  groupTitle: { fontSize: 17, fontWeight: "800" },
  groupCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: "center",
  },
  groupCountText: { fontSize: 12, fontWeight: "700" },

  cardList: { gap: 12 },

  // 2-column grid (tablet)
  twoColGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  twoColCell: { flex: 1, minWidth: 260 },

  // ── Card
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderTopWidth: 3,        // accent stripe at top
    overflow: "hidden",
    padding: 14,
    gap: 12,
  },

  // Row 1: category chip + points
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  catChip: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  catChipText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },

  pointsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF9EC",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  pointsStar: { fontSize: 11 },
  pointsText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400E",   // 5.1:1 on #FEF9EC ✓ WCAG AA
  },

  // Row 2: icon + text
  cardBody: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardEmoji: { fontSize: 20 },
  cardTitles: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 15, fontWeight: "700", lineHeight: 20 },
  cardDesc: { fontSize: 13, lineHeight: 18 },

  // Row 3: CTA button — min 44px height
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    minHeight: 44,
    paddingVertical: 11,
  },
  actionBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  // ── Empty state
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 56,
    gap: 12,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800" },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 4,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 11,
    minHeight: 44,
    justifyContent: "center",
  },
  emptyBtnText: { fontSize: 14, fontWeight: "700" },
});
