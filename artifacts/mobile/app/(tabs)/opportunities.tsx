import { Feather } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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

type FilterKey = Exclude<OpportunityFilterCategory, "mail-delivery"> | null;

const FILTER_OPTIONS: { key: Exclude<OpportunityFilterCategory, "mail-delivery">; label: string }[] = [
  { key: "care-site-alternative", label: "Care Site Alternative" },
  { key: "care-protocol",         label: "Care Protocol" },
  { key: "preventative-care",     label: "Preventative Care" },
  { key: "care-quality",          label: "Care Quality" },
];

const ICON_EMOJI: Record<string, string> = {
  pill:            "💊",
  package:         "📦",
  calendar:        "📅",
  medication:      "💊",
  preventive:      "🛡️",
  "mail-delivery": "📦",
  specialist:      "🩺",
  upcoming:        "📅",
};

function OppCard({ opp }: { opp: Opportunity }) {
  const colors = useColors();
  const router = useRouter();
  const barColor = opp.filterCategory === "care-site-alternative" ? "#9333EA"
    : "#3B82F6";

  const icon = opp.icon ? ICON_EMOJI[opp.icon] ?? "💊" : ICON_EMOJI[opp.category] ?? "💊";
  const bg = opp.iconBg ?? "#EDE9FE";

  const handleAction = () => {
    router.push(`/opportunity-variants/${opp.id}` as never);
  };

  const isOneTime = opp.frequency === "one-time";
  const isMonthly = opp.pointsMonthly > 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={handleAction}
      activeOpacity={0.8}
    >
      <View style={[styles.cardBar, { backgroundColor: barColor }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: bg }]}>
            <Text style={styles.cardEmoji}>{icon}</Text>
          </View>
          <View style={styles.cardTitles}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={2}>
              {opp.title}
            </Text>
            <Text style={[styles.cardSub, { color: colors.mutedForeground }]} numberOfLines={2}>
              {opp.description}
            </Text>
          </View>
        </View>

        <View style={styles.earnRow}>
          <View style={[styles.earnBadge, { backgroundColor: "#05C5B6" }]}>
            <Text style={styles.earnBadgeText}>
              {isMonthly
                ? `${opp.points} points + ${opp.pointsMonthly} points monthly`
                : `Earn ${opp.points} points`}
            </Text>
          </View>
        </View>

        {opp.benefits.map((b, i) => (
          <View key={i} style={styles.benefit}>
            <Feather name="check" size={14} color={colors.primary} />
            <Text style={[styles.benefitText, { color: colors.foreground }]}>{b}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={handleAction}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>{opp.actionLabel || "How To Earn"}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

type GroupSection = {
  name: string;
  opps: Opportunity[];
  sub?: { name: string; opps: Opportunity[] };
};

export default function OpportunitiesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const [filter, setFilter] = useState<FilterKey>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: "Opportunities",
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {}}
          style={{ marginRight: 16 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="share-2" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const filtered = useMemo(() => {
    if (filter === null) {
      return MOCK_OPPORTUNITIES.filter((o) => !!o.filterCategory);
    }
    if (filter === "care-site-alternative") {
      return MOCK_OPPORTUNITIES.filter(
        (o) => o.filterCategory === "care-site-alternative"
      );
    }
    return MOCK_OPPORTUNITIES.filter((o) => o.filterCategory === filter);
  }, [filter]);

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

  const hierarchical = useMemo<GroupSection[]>(() => {
    const result: GroupSection[] = [];
    let careAlt: GroupSection | null = null;

    for (const [name, opps] of grouped) {
      if (name === "Care Site Alternative") {
        careAlt = { name, opps };
        result.push(careAlt);
      } else if (name === "Mail Delivery Opportunities") {
        if (careAlt) {
          careAlt.sub = { name, opps };
        } else {
          result.push({ name, opps });
        }
      } else {
        result.push({ name, opps });
      }
    }
    return result;
  }, [grouped]);

  const activeLabel = filter
    ? FILTER_OPTIONS.find((f) => f.key === filter)?.label
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[styles.missedBanner, { backgroundColor: "#FEE2E2", borderLeftColor: "#DC2626" }]}
          onPress={() => router.push("/missed-opportunities" as never)}
        >
          <Feather name="bell" size={18} color="#DC2626" />
          <Text style={[styles.missedText, { color: colors.foreground }]}>
            You have {MISSED_OPPORTUNITIES_COUNT} missed opportunities. Review them to learn and improve your health journey.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowDropdown((v) => !v)}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterDropdownText, { color: activeLabel ? colors.primary : colors.foreground }]}>
            {activeLabel ?? "Filter opportunities by category"}
          </Text>
          <Feather
            name={showDropdown ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.mutedForeground}
          />
        </TouchableOpacity>

        {showDropdown && (
          <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {FILTER_OPTIONS.map((c, idx) => {
              const isActive = filter === c.key;
              return (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.dropdownItem,
                    { borderBottomColor: colors.border },
                    idx === FILTER_OPTIONS.length - 1 && { borderBottomWidth: 0 },
                  ]}
                  onPress={() => {
                    setFilter(isActive ? null : c.key);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    { color: isActive ? colors.primary : colors.foreground },
                  ]}>
                    {c.label}
                  </Text>
                  {isActive && (
                    <Feather name="check" size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {hierarchical.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="check-circle" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No opportunities here
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              You've completed all opportunities in this category
            </Text>
          </View>
        ) : (
          hierarchical.map(({ name, opps, sub }) => (
            <View key={name} style={styles.group}>
              <Text style={[styles.groupTitle, { color: colors.foreground }]}>{name}</Text>
              <View style={styles.groupCards}>
                {opps.map((opp) => (
                  <OppCard key={opp.id} opp={opp} />
                ))}
              </View>
              {sub && (
                <View style={styles.groupCards}>
                  {sub.opps.map((opp) => (
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },

  missedBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
  },
  missedText: { fontSize: 14, fontWeight: "500", flex: 1, lineHeight: 20 },

  filterDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  filterDropdownText: { fontSize: 14, fontWeight: "500" },

  dropdown: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: -10,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dropdownItemText: { fontSize: 14, fontWeight: "500" },

  group: { gap: 10 },
  groupTitle: { fontSize: 18, fontWeight: "800", marginTop: 4 },
  groupCards: { gap: 14 },

  subGroup: {
    marginTop: 12,
    paddingLeft: 14,
    borderLeftWidth: 2,
    gap: 8,
  },
  subGroupTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
  },
  cardBar: { width: 5 },
  cardContent: { flex: 1, padding: 14, gap: 10 },
  cardHeader: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardEmoji: { fontSize: 22 },
  cardTitles: { flex: 1, justifyContent: "center" },
  cardTitle: { fontSize: 15, fontWeight: "700", lineHeight: 20 },
  cardSub: { fontSize: 13, lineHeight: 17, marginTop: 2 },

  earnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  earnBadge: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  earnBadgeText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  oneTimeBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1.5,
  },
  oneTimeBadgeText: { fontSize: 11, fontWeight: "800" },

  benefit: { flexDirection: "row", alignItems: "center", gap: 8 },
  benefitText: { fontSize: 13, flex: 1, lineHeight: 18 },

  actionBtn: {
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 2,
  },
  actionBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  empty: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center", maxWidth: 260 },
});
