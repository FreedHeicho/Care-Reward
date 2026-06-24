import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type MissedStatus = "expired" | "dismissed" | "doctor-declined";

interface MissedOpportunity {
  id: string;
  title: string;
  icon: string;
  presentedDate: string;
  pointsAvailable: number;
  status: MissedStatus;
}

const MOCK_MISSED: MissedOpportunity[] = [
  {
    id: "1",
    title: "Switch to Generic Lipitor",
    icon: "plus-circle",
    presentedDate: "1/14/2024",
    pointsAvailable: 500,
    status: "expired",
  },
  {
    id: "2",
    title: "Annual Flu Shot",
    icon: "activity",
    presentedDate: "10/3/2023",
    pointsAvailable: 250,
    status: "dismissed",
  },
  {
    id: "3",
    title: "Preventive Colonoscopy",
    icon: "shield",
    presentedDate: "8/20/2023",
    pointsAvailable: 1000,
    status: "doctor-declined",
  },
  {
    id: "4",
    title: "Mail-Order Pharmacy Enrollment",
    icon: "mail",
    presentedDate: "6/1/2023",
    pointsAvailable: 400,
    status: "expired",
  },
  {
    id: "5",
    title: "Diabetic Eye Exam",
    icon: "eye",
    presentedDate: "3/15/2023",
    pointsAvailable: 350,
    status: "dismissed",
  },
];

const TOTAL_POINTS = MOCK_MISSED.reduce((s, o) => s + o.pointsAvailable, 0);
const ENGAGEMENT_RATE = 73;

type FilterTab = "all" | "expired" | "dismissed" | "doctor-declined";

const STATUS_LABELS: Record<MissedStatus, string> = {
  expired: "EXPIRED",
  dismissed: "DISMISSED",
  "doctor-declined": "DR. DECLINED",
};

const STATUS_COLORS: Record<MissedStatus, { bg: string; text: string }> = {
  expired: { bg: "#FED7AA", text: "#C2410C" },
  dismissed: { bg: "#E5E7EB", text: "#6B7280" },
  "doctor-declined": { bg: "#DBEAFE", text: "#1D4ED8" },
};

export default function MissedOpportunitiesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const filtered =
    activeFilter === "all"
      ? MOCK_MISSED
      : MOCK_MISSED.filter((o) => o.status === activeFilter);

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All Missed" },
    { key: "expired", label: "Expired" },
    { key: "dismissed", label: "Dismissed" },
    { key: "doctor-declined", label: "Doctor De..." },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Empathy Banner */}
        <View style={[styles.empathyCard, { backgroundColor: "#EFF6FF" }]}>
          <View style={[styles.empathyIconWrap, { backgroundColor: "#DBEAFE" }]}>
            <Feather name="heart" size={22} color="#3B82F6" />
          </View>
          <View style={styles.empathyText}>
            <Text style={[styles.empathyTitle, { color: "#1E40AF" }]}>
              We Know Life Gets Busy
            </Text>
            <Text style={[styles.empathySub, { color: "#374151" }]}>
              It's okay to miss opportunities sometimes. What matters is that you're taking steps to improve your health.
            </Text>
          </View>
        </View>

        {/* Opportunity Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.foreground }]}>
            Your Opportunity Summary
          </Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryStatValue, { color: colors.foreground }]}>
                {MOCK_MISSED.length}
              </Text>
              <Text style={[styles.summaryStatLabel, { color: colors.mutedForeground }]}>
                Total Missed
              </Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryStatValue, { color: "#F59E0B" }]}>
                {TOTAL_POINTS.toLocaleString()}
              </Text>
              <Text style={[styles.summaryStatLabel, { color: colors.mutedForeground }]}>
                Points Available
              </Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryStatValue, { color: "#16A34A" }]}>
                {ENGAGEMENT_RATE}%
              </Text>
              <Text style={[styles.summaryStatLabel, { color: colors.mutedForeground }]}>
                Engagement Rate
              </Text>
            </View>
          </View>
          <View style={[styles.summaryNote, { backgroundColor: "#DCFCE7" }]}>
            <Feather name="trending-up" size={14} color="#16A34A" />
            <Text style={[styles.summaryNoteText, { color: "#166534" }]}>
              New opportunities come regularly. You're doing great!
            </Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  {
                    backgroundColor: isActive ? colors.primary : colors.card,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setActiveFilter(tab.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: isActive ? "#fff" : colors.foreground },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Timeline Section */}
        <Text style={[styles.timelineTitle, { color: colors.foreground }]}>
          Missed Opportunities Timeline
        </Text>

        {filtered.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="check-circle" size={32} color={colors.primary} />
            <Text style={[styles.emptyStateText, { color: colors.foreground }]}>
              No {activeFilter === "all" ? "missed" : activeFilter} opportunities
            </Text>
          </View>
        ) : (
          filtered.map((opp) => {
            const badge = STATUS_COLORS[opp.status];
            return (
              <View
                key={opp.id}
                style={[styles.oppCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.oppTop}>
                  <View style={[styles.oppIconWrap, { backgroundColor: "#F3F4F6" }]}>
                    <Feather name={opp.icon as never} size={20} color="#9CA3AF" />
                  </View>
                  <View style={styles.oppTitleWrap}>
                    <Text style={[styles.oppTitle, { color: colors.mutedForeground }]}>
                      {opp.title}
                    </Text>
                    <Text style={[styles.oppPresented, { color: colors.mutedForeground }]}>
                      Presented {opp.presentedDate}
                    </Text>
                  </View>
                  <View style={[styles.oppBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.oppBadgeText, { color: badge.text }]}>
                      {STATUS_LABELS[opp.status]}
                    </Text>
                  </View>
                </View>

                <View style={[styles.oppDivider, { backgroundColor: colors.border }]} />

                <View style={styles.oppPoints}>
                  <Text style={[styles.oppPointsLabel, { color: colors.mutedForeground }]}>
                    Points Available
                  </Text>
                  <Text style={[styles.oppPointsValue, { color: colors.mutedForeground }]}>
                    {opp.pointsAvailable.toLocaleString()} points
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.learnMoreBtn, { borderColor: colors.border }]}
                  onPress={() => router.push("/(tabs)/opportunities" as never)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.learnMoreText, { color: colors.foreground }]}>
                    Learn More
                  </Text>
                  <Feather name="chevron-right" size={16} color={colors.foreground} />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },

  empathyCard: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  empathyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  empathyText: { flex: 1, gap: 4 },
  empathyTitle: { fontSize: 15, fontWeight: "700" },
  empathySub: { fontSize: 13, lineHeight: 19 },

  summaryCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  summaryTitle: { fontSize: 16, fontWeight: "800" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryStat: { alignItems: "center", flex: 1 },
  summaryStatValue: { fontSize: 28, fontWeight: "900" },
  summaryStatLabel: { fontSize: 11, textAlign: "center", marginTop: 2 },
  summaryNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  summaryNoteText: { fontSize: 13, fontWeight: "600", flex: 1 },

  tabsRow: { gap: 8, paddingVertical: 2 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: { fontSize: 13, fontWeight: "600" },

  timelineTitle: { fontSize: 17, fontWeight: "800", marginTop: 4 },

  emptyState: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    gap: 10,
  },
  emptyStateText: { fontSize: 15, fontWeight: "600" },

  oppCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  oppTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  oppIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  oppTitleWrap: { flex: 1, gap: 3 },
  oppTitle: {
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
  },
  oppPresented: { fontSize: 12 },
  oppBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  oppBadgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.3 },

  oppDivider: { height: 1 },

  oppPoints: { gap: 2 },
  oppPointsLabel: { fontSize: 12, fontWeight: "600" },
  oppPointsValue: {
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "line-through",
  },

  learnMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
  },
  learnMoreText: { fontSize: 14, fontWeight: "600" },
});
