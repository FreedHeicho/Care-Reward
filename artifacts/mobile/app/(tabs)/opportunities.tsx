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

import { useAuth } from "@/context/AuthContext";
import {
  CATEGORY_COLORS,
  MISSED_OPPORTUNITIES_COUNT,
  MOCK_OPPORTUNITIES,
  Opportunity,
  OpportunityCategory,
} from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const CATEGORY_OPTIONS: { key: "all" | OpportunityCategory; label: string; icon: string }[] = [
  { key: "all", label: "All Categories", icon: "grid" },
  { key: "medication", label: "Care Site Alternative", icon: "activity" },
  { key: "mail-delivery", label: "Mail Delivery", icon: "package" },
  { key: "upcoming", label: "Care Protocol Compliance", icon: "clipboard" },
  { key: "preventive", label: "Preventive Care", icon: "shield" },
  { key: "specialist", label: "Specialist", icon: "user-check" },
];

const ICON_EMOJI: Record<string, string> = {
  pill: "💊",
  package: "📦",
  calendar: "📅",
  medication: "💊",
  preventive: "🛡️",
  "mail-delivery": "📦",
  specialist: "🩺",
  upcoming: "📅",
};

function OppCard({ opp }: { opp: Opportunity }) {
  const colors = useColors();
  const router = useRouter();
  const barColor = CATEGORY_COLORS[opp.category] ?? colors.primary;
  const icon = opp.icon ? ICON_EMOJI[opp.icon] ?? "💊" : ICON_EMOJI[opp.category] ?? "💊";
  const bg = opp.iconBg ?? "#EDE9FE";

  const handlePress = () => {
    if (opp.action === "log-care") {
      router.push("/log-upcoming-care" as never);
    } else {
      router.push(`/opportunity-variants/${opp.id}` as never);
    }
  };

  const handleAction = () => {
    if (opp.action === "log-care") {
      router.push("/log-upcoming-care" as never);
    } else {
      router.push(`/opportunity-variants/${opp.id}` as never);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[styles.cardBar, { backgroundColor: barColor }]} />
      <View style={styles.cardContent}>
        {/* Header */}
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

        {/* Points badge */}
        {opp.action === "earn" ? (
          <View style={[styles.pointsBadge, { backgroundColor: "#05C5B6" }]}>
            <Text style={styles.pointsBadgeText}>
              {opp.pointsMonthly && opp.pointsMonthly > 0
                ? `${opp.points} points + ${opp.pointsMonthly} points monthly`
                : opp.frequency === "one-time"
                  ? `Earn ${opp.points} points`
                  : `${opp.points} points + ${opp.pointsMonthly} points monthly`}
            </Text>
            {opp.frequency === "one-time" && (
              <View style={[styles.freqBadge, { backgroundColor: "#fff", borderColor: "#05C5B6" }]}>
                <Text style={[styles.freqBadgeText, { color: "#05C5B6" }]}>ONE-TIME</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.logCareRow}>
            <View style={[styles.pointsPill, { backgroundColor: colors.primary }]}>
              <Text style={styles.pointsPillText}>{opp.points} points</Text>
            </View>
            <TouchableOpacity style={styles.shareBtn} onPress={handleAction}>
              <Feather name="share-2" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logCareLink} onPress={handleAction}>
              <Text style={[styles.logCareLinkText, { color: colors.primary }]}>
                {opp.actionLabel} →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Benefits */}
        {opp.benefits.map((b, i) => (
          <View key={i} style={styles.benefit}>
            <Feather name="check-circle" size={15} color={colors.primary} />
            <Text style={[styles.benefitText, { color: colors.foreground }]}>{b}</Text>
          </View>
        ))}

        {/* Action button for earn-type */}
        {opp.action === "earn" && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={handleAction}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>{opp.actionLabel || "How To Earn"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function OpportunitiesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const navigation = useNavigation();

  const [filter, setFilter] = useState<"all" | OpportunityCategory>("all");
  const [showDropdown, setShowDropdown] = useState(false);
  const firstName = user?.name?.split(" ")[0] ?? "Sarah";

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
    return filter === "all"
      ? MOCK_OPPORTUNITIES
      : MOCK_OPPORTUNITIES.filter((o) => o.category === filter);
  }, [filter]);

  // Group by `group` field, fallback to category label
  const grouped = useMemo(() => {
    const map = new Map<string, Opportunity[]>();
    for (const o of filtered) {
      const key = o.group ?? CATEGORY_OPTIONS.find((c) => c.key === o.category)?.label ?? "Opportunities";
      const arr = map.get(key) ?? [];
      arr.push(o);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Discover ways to earn rewards and{"\n"}save on healthcare
        </Text>

        {/* Missed alert */}
        <TouchableOpacity
          style={[styles.missedBanner, { backgroundColor: "#FEE2E2", borderLeftColor: "#DC2626" }]}
          onPress={() => {
            router.push("/how-to-earn" as never);
          }}
        >
          <Feather name="bell" size={18} color="#DC2626" />
          <Text style={[styles.missedText, { color: colors.foreground }]}>
            You have {MISSED_OPPORTUNITIES_COUNT} missed opportunities. Review them to learn and improve your health journey.
          </Text>
        </TouchableOpacity>

        {/* Filter dropdown */}
        <TouchableOpacity
          style={[styles.filterDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowDropdown((v) => !v)}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterDropdownText, { color: colors.foreground }]}>
            {CATEGORY_OPTIONS.find((c) => c.key === filter)?.label}
          </Text>
          <Feather name={showDropdown ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
        </TouchableOpacity>

        {showDropdown && (
          <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {CATEGORY_OPTIONS.map((c) => (
              <TouchableOpacity
                key={c.key}
                style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setFilter(c.key);
                  setShowDropdown(false);
                }}
              >
                <View style={styles.dropdownItemLeft}>
                  <Feather
                    name={c.icon as any}
                    size={16}
                    color={filter === c.key ? colors.primary : colors.mutedForeground}
                  />
                  <Text style={[styles.dropdownItemText, { color: filter === c.key ? colors.primary : colors.foreground }]}>
                    {c.label}
                  </Text>
                </View>
                {filter === c.key && (
                  <Feather name="check" size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Grouped sections */}
        {grouped.length === 0 ? (
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
          grouped.map(([groupName, opps]) => (
            <View key={groupName} style={styles.group}>
              <Text style={[styles.groupTitle, { color: colors.foreground }]}>{groupName}</Text>
              <View style={styles.groupCards}>
                {opps.map((opp) => (
                  <OppCard key={opp.id} opp={opp} />
                ))}
              </View>
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

  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4 },

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
    padding: 14,
    borderBottomWidth: 1,
  },
  dropdownItemLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  dropdownItemText: { fontSize: 14, fontWeight: "500" },

  group: { gap: 10 },
  groupTitle: { fontSize: 18, fontWeight: "800", marginTop: 4 },
  groupCards: { gap: 12 },

  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
  },
  cardBar: { width: 5 },
  cardContent: { flex: 1, padding: 12, gap: 8 },
  cardHeader: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardEmoji: { fontSize: 18 },
  cardTitles: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: "700", lineHeight: 19 },
  cardSub: { fontSize: 12, lineHeight: 16, marginTop: 1 },

  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pointsBadgeText: { color: "#fff", fontSize: 13, fontWeight: "700", flex: 1 },
  freqBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  freqBadgeText: { fontSize: 10, fontWeight: "800" },

  logCareRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pointsPill: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pointsPillText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  shareBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4E9F0",
    alignItems: "center",
    justifyContent: "center",
  },
  logCareLink: {},
  logCareLinkText: { fontSize: 14, fontWeight: "700" },

  benefit: { flexDirection: "row", alignItems: "center", gap: 8 },
  benefitText: { fontSize: 13, flex: 1, lineHeight: 18 },

  actionBtn: {
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: "center",
  },
  actionBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  empty: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center", maxWidth: 260 },
});
