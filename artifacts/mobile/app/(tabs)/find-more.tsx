import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { MOCK_OPPORTUNITIES } from "@/constants/data";

const EXPLORE_CATEGORIES = [
  { icon: "💊", label: "Care Site Alternative", color: "#8B5CF6", bg: "#EDE9FE" },
  { icon: "📦", label: "Mail Delivery", color: "#F59E0B", bg: "#FEF3C7" },
  { icon: "📅", label: "Care Protocol Compliance", color: "#0EA5E9", bg: "#DBEAFE" },
  { icon: "🩺", label: "Specialist", color: "#0EA5E9", bg: "#DBEAFE" },
  { icon: "🛡️", label: "Preventive Care", color: "#05503C", bg: "#E8F5F2" },
];

export default function FindMoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const totalPoints = MOCK_OPPORTUNITIES.reduce((s, o) => s + o.points, 0);
  const totalSavings = MOCK_OPPORTUNITIES.reduce((s, o) => s + o.savings, 0);

  const filtered = query.trim().length > 0
    ? MOCK_OPPORTUNITIES.filter(
        (o) =>
          o.title.toLowerCase().includes(query.toLowerCase()) ||
          o.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary banner */}
        <View style={[styles.summaryBanner, { backgroundColor: colors.primary }]}>
          <Text style={styles.summaryTitle}>Your Opportunity Potential</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalPoints.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Points Available</Text>
            </View>
            <View style={[styles.summaryDivider]} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>${totalSavings.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Potential Savings</Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search opportunities..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search results */}
        {filtered.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Search Results ({filtered.length})
            </Text>
            {filtered.map((opp) => (
              <TouchableOpacity
                key={opp.id}
                style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/opportunity-variants/${opp.id}` as never)}
                activeOpacity={0.8}
              >
                <View style={styles.resultLeft}>
                  <Text style={[styles.resultTitle, { color: colors.foreground }]}>{opp.title}</Text>
                  <Text style={[styles.resultDesc, { color: colors.mutedForeground }]}>
                    {opp.description}
                  </Text>
                </View>
                <View style={[styles.resultPoints, { backgroundColor: colors.primary }]}>
                  <Text style={styles.resultPointsText}>+{opp.points}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Browse categories */}
        {filtered.length === 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Browse by Category</Text>
            <View style={styles.categories}>
              {EXPLORE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.label}
                  style={[styles.catCard, { backgroundColor: cat.bg }]}
                  onPress={() => router.push("/(tabs)/opportunities" as never)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.catEmoji}>{cat.icon}</Text>
                  <Text style={[styles.catLabel, { color: cat.color }]} numberOfLines={2}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Tips */}
        {filtered.length === 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Tips to Maximize Rewards
            </Text>
            {[
              { icon: "zap" as const, title: "Act on new opportunities quickly", desc: "New opportunities expire — don't leave points on the table." },
              { icon: "repeat" as const, title: "Monthly recurring opportunities", desc: "Some opportunities reward you every month. Set a reminder!" },
              { icon: "users" as const, title: "Complete care protocols", desc: "Following your care plan earns compliance points and keeps you healthy." },
            ].map((tip, i) => (
              <View
                key={i}
                style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.tipIcon, { backgroundColor: colors.primary + "15" }]}>
                  <Feather name={tip.icon} size={18} color={colors.primary} />
                </View>
                <View style={styles.tipBody}>
                  <Text style={[styles.tipTitle, { color: colors.foreground }]}>{tip.title}</Text>
                  <Text style={[styles.tipDesc, { color: colors.mutedForeground }]}>{tip.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { gap: 16, paddingTop: 4 },

  summaryBanner: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  summaryTitle: { color: "#ffffff99", fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  summaryItem: { flex: 1, alignItems: "center", gap: 2 },
  summaryDivider: { width: 1, height: 40, backgroundColor: "#ffffff30" },
  summaryValue: { color: "#fff", fontSize: 28, fontWeight: "900" },
  summaryLabel: { color: "#ffffffaa", fontSize: 12 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
  },
  searchInput: { flex: 1, fontSize: 14 },

  section: { paddingHorizontal: 16, gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "800" },

  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  resultLeft: { flex: 1, gap: 3 },
  resultTitle: { fontSize: 14, fontWeight: "700" },
  resultDesc: { fontSize: 12, lineHeight: 16 },
  resultPoints: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  resultPointsText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  catCard: {
    width: "47%",
    borderRadius: 14,
    padding: 14,
    gap: 8,
    alignItems: "flex-start",
  },
  catEmoji: { fontSize: 26 },
  catLabel: { fontSize: 13, fontWeight: "700", lineHeight: 18 },

  tipCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: "flex-start",
  },
  tipIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tipBody: { flex: 1, gap: 3 },
  tipTitle: { fontSize: 14, fontWeight: "700" },
  tipDesc: { fontSize: 12, lineHeight: 17 },
});
