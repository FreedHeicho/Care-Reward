import { Feather } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
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
  ActivityEvent,
  CATEGORY_COLORS,
  CATEGORY_EMOJIS,
  MISSED_OPPORTUNITIES_COUNT,
  MOCK_ACTIVITY,
  MOCK_OPPORTUNITIES,
  NEW_OPPORTUNITIES_COUNT,
  Opportunity,
} from "@/constants/data";
import { useColors } from "@/hooks/useColors";

function ActivityRow({ event }: { event: ActivityEvent }) {
  const colors = useColors();
  return (
    <View style={styles.activityRow}>
      <View style={styles.activityLeft}>
        <Text style={[styles.activityMonth, { color: colors.mutedForeground }]}>
          {event.dateLabel.split("\n")[0]}
        </Text>
        <Text style={[styles.activityDay, { color: colors.foreground }]}>
          {event.dateLabel.split("\n")[1]}
        </Text>
        <View style={[styles.activityLine, { backgroundColor: colors.border }]} />
      </View>
      <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.activityIconWrap, { backgroundColor: event.iconBg }]}>
          <Feather
            name={event.icon}
            size={18}
            color={event.iconColor || colors.primary}
          />
        </View>
        <View style={styles.activityContent}>
          <Text style={[styles.activityTitle, { color: colors.foreground }]} numberOfLines={2}>
            {event.title}
          </Text>
          <Text style={[styles.activityDesc, { color: colors.mutedForeground }]}>
            {event.description}
          </Text>
        </View>
        <Text style={[styles.activityPoints, { color: colors.primary }]}>
          +{event.points} points
        </Text>
        <Feather name="chevron-down" size={14} color={colors.mutedForeground} />
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const navigation = useNavigation();
  const firstName = user?.name?.split(" ")[0] ?? "Sarah";

  useEffect(() => {
    navigation.setOptions({
      title: `Hi ${firstName}!`,
      headerRight: () => (
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/opportunities" as never)}
          style={{ marginRight: 16 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={{ position: "relative" }}>
            <Feather name="bell" size={22} color="#FFFFFF" />
            <View
              style={{
                position: "absolute",
                top: -4,
                right: -5,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#F59E0B",
                borderWidth: 1.5,
                borderColor: "#05503C",
              }}
            />
          </View>
        </TouchableOpacity>
      ),
    });
  }, [firstName, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: 8,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Points Balance Card */}
        <View style={[styles.pointsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.pointsIconCircle, { backgroundColor: "#05C5B6" }]}>
            <Feather name="star" size={28} color="#FCD34D" />
          </View>
          <Text style={[styles.pointsValue, { color: colors.primary }]}>
            {(user?.pointsBalance ?? 245).toLocaleString()} Points
          </Text>
          <Text style={[styles.pointsTagline, { color: colors.mutedForeground }]}>
            You are your best health advocate. We are here to enable you. Keep up the amazing work!
          </Text>
          <TouchableOpacity
            style={[styles.redeemBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/rewards" as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.redeemBtnText}>Redeem My Points</Text>
          </TouchableOpacity>
        </View>

        {/* Welcome Banner */}
        <View style={[styles.welcomeBanner, { backgroundColor: "#E6F0ED" }]}>
          <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>
            Welcome to CareReward!
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.mutedForeground }]}>
            We help you navigate your health journey
          </Text>
        </View>

        {/* Notification Alerts */}
        <TouchableOpacity
          style={[styles.alertBanner, { backgroundColor: "#DCFCE7", borderLeftColor: "#16A34A" }]}
          onPress={() => router.push("/(tabs)/opportunities" as never)}
        >
          <Feather name="bell" size={18} color="#16A34A" />
          <Text style={[styles.alertText, { color: colors.foreground }]}>
            You have {NEW_OPPORTUNITIES_COUNT} new opportunities
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.alertBanner, { backgroundColor: "#FEE2E2", borderLeftColor: "#DC2626" }]}
          onPress={() => router.push("/(tabs)/opportunities" as never)}
        >
          <Feather name="bell" size={18} color="#DC2626" />
          <Text style={[styles.alertText, { color: colors.foreground }]}>
            You have {MISSED_OPPORTUNITIES_COUNT} missed opportunities
          </Text>
        </TouchableOpacity>

        {/* Get Started */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Get Started</Text>
          <View style={styles.getStartedGrid}>
            <TouchableOpacity
              style={[styles.getStartedCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push("/how-to-earn" as never)}
            >
              <Text style={[styles.getStartedCardTitle, { color: colors.foreground }]}>
                How to Earn Points
              </Text>
              <Text style={[styles.getStartedCardDesc, { color: colors.mutedForeground }]}>
                Understand how to earn and redeem
              </Text>
              <TouchableOpacity
                style={[styles.getStartedCardBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/how-to-earn" as never)}
              >
                <Text style={styles.getStartedCardBtnText}>Learn More</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.getStartedCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push("/(tabs)/claims" as never)}
            >
              <Text style={[styles.getStartedCardTitle, { color: colors.foreground }]}>
                Explanation of Benefits
              </Text>
              <Text style={[styles.getStartedCardDesc, { color: colors.mutedForeground }]}>
                Understand your healthcare coverage
              </Text>
              <TouchableOpacity
                style={[styles.getStartedCardBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/(tabs)/claims" as never)}
              >
                <Text style={styles.getStartedCardBtnText}>Benefits</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.getStartedCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push("/emr-access" as never)}
            >
              <Text style={[styles.getStartedCardTitle, { color: colors.foreground }]}>
                Connect Your Health Data
              </Text>
              <Text style={[styles.getStartedCardDesc, { color: colors.mutedForeground }]}>
                Link your medical records and labs
              </Text>
              <TouchableOpacity
                style={[styles.getStartedCardBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/emr-access" as never)}
              >
                <Text style={styles.getStartedCardBtnText}>Connect</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.getStartedCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push("/emr-access" as never)}
            >
              <Text style={[styles.getStartedCardTitle, { color: colors.foreground }]}>
                Connect other health devices
              </Text>
              <Text style={[styles.getStartedCardDesc, { color: colors.mutedForeground }]}>
                Link your wearables and trackers
              </Text>
              <TouchableOpacity
                style={[styles.getStartedCardBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/emr-access" as never)}
              >
                <Text style={styles.getStartedCardBtnText}>Connect</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recommended for You — horizontal scroll of all 9 opportunities */}
        <View style={styles.section}>
          <View style={styles.recommendedHeader}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Recommended for You
            </Text>
            <TouchableOpacity
              style={[styles.oppCountBadge, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/(tabs)/opportunities" as never)}
            >
              <Text style={styles.oppCountText}>
                {NEW_OPPORTUNITIES_COUNT} Opportunities
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={MOCK_OPPORTUNITIES}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hOppList}
            snapToInterval={280}
            decelerationRate="fast"
            renderItem={({ item: opp }) => {
              const barColor = CATEGORY_COLORS[opp.category] ?? colors.primary;
              return (
                <TouchableOpacity
                  style={[styles.hOppCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push("/(tabs)/opportunities" as never)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.hOppBar, { backgroundColor: barColor }]} />
                  <View style={styles.hOppContent}>
                    <View style={styles.hOppHeader}>
                      <View style={[styles.hOppIcon, { backgroundColor: barColor + "20" }]}>
                        <Text style={styles.hOppEmoji}>{CATEGORY_EMOJIS[opp.category]}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.hOppTitle, { color: colors.foreground }]} numberOfLines={1}>
                          {opp.title}
                        </Text>
                        <Text style={[styles.hOppDesc, { color: colors.mutedForeground }]} numberOfLines={1}>
                          {opp.description}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.hOppPointsBadge, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.hOppPointsText, { color: colors.primary }]}>
                        {opp.pointsMonthly > 0
                          ? `${opp.points} points + ${opp.pointsMonthly} points monthly`
                          : `Earn ${opp.points} points`}
                      </Text>
                    </View>

                    {opp.benefits.slice(0, 2).map((b) => (
                      <View key={b} style={styles.oppBenefit}>
                        <Feather name="check-circle" size={14} color={colors.primary} />
                        <Text style={[styles.oppBenefitText, { color: colors.foreground }]}>{b}</Text>
                      </View>
                    ))}

                    <View style={[styles.howToEarnBtn, { backgroundColor: colors.primary }]}>
                      <Text style={styles.howToEarnText}>How To Earn</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          {/* View All CTA */}
          <TouchableOpacity
            style={[styles.viewAllOppBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/(tabs)/opportunities" as never)}
            activeOpacity={0.85}
          >
            <View style={{ alignItems: "center", gap: 6 }}>
              <Text style={[styles.viewAllOppTitle, { color: colors.primary }]}>
                View All Opportunities
              </Text>
              <Text style={[styles.viewAllOppDesc, { color: colors.mutedForeground }]}>
                See all available opportunities
              </Text>
              <Feather name="arrow-right" size={18} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Your Recent Activity
          </Text>
          {MOCK_ACTIVITY.map((event) => (
            <ActivityRow key={event.id} event={event} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, gap: 14 },

  // Points card
  pointsCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    gap: 12,
  },
  pointsIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  pointsValue: { fontSize: 30, fontWeight: "900" },
  pointsTagline: { fontSize: 14, textAlign: "center", lineHeight: 22, paddingHorizontal: 8 },
  redeemBtn: {
    width: "100%",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  redeemBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Welcome banner
  welcomeBanner: {
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  welcomeTitle: { fontSize: 16, fontWeight: "700" },
  welcomeSubtitle: { fontSize: 14 },

  // Alert banners
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
  },
  alertText: { fontSize: 14, fontWeight: "500", flex: 1 },

  // Sections
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800" },

  // Get Started (compact, 3-column wrap)
  getStartedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  getStartedCard: {
    width: "47%",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    gap: 4,
  },
  getStartedCardTitle: { fontSize: 13, fontWeight: "800", lineHeight: 18 },
  getStartedCardDesc: {
    fontSize: 11,
    lineHeight: 15,
    minHeight: 30,
  },
  getStartedCardBtn: {
    borderRadius: 6,
    paddingVertical: 7,
    alignItems: "center",
    marginTop: 2,
  },
  getStartedCardBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  // Recommended (compact)
  recommendedHeader: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  oppCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  oppCountText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  oppCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
  },
  oppCardLeftBar: { width: 5 },
  oppCardContent: { flex: 1, padding: 12, gap: 8 },
  oppCardHeader: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  oppMedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  oppMedEmoji: { fontSize: 18 },
  oppCardTitles: { flex: 1 },
  oppCardTitle: { fontSize: 14, fontWeight: "700" },
  oppCardSub: { fontSize: 12, marginTop: 1 },
  oppPointsBadge: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  oppPointsBadgeText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  oppBenefit: { flexDirection: "row", alignItems: "center", gap: 8 },
  oppBenefitText: { fontSize: 13, flex: 1 },
  howToEarnBtn: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  howToEarnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  // Horizontal opportunity cards
  hOppList: { gap: 12, paddingHorizontal: 4 },
  hOppCard: {
    width: 264,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
  },
  hOppBar: { width: 5 },
  hOppContent: { flex: 1, padding: 12, gap: 8 },
  hOppHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  hOppIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  hOppEmoji: { fontSize: 18 },
  hOppTitle: { fontSize: 14, fontWeight: "700" },
  hOppDesc: { fontSize: 12, marginTop: 1 },
  hOppPointsBadge: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  hOppPointsText: { fontSize: 13, fontWeight: "700" },
  viewAllOppBtn: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginTop: 4,
  },
  viewAllOppTitle: { fontSize: 16, fontWeight: "700" },
  viewAllOppDesc: { fontSize: 13, fontWeight: "500" },

  // Activity
  activityRow: {
    flexDirection: "row",
    gap: 12,
    minHeight: 80,
  },
  activityLeft: { width: 40, alignItems: "center", paddingTop: 8 },
  activityMonth: { fontSize: 10, fontWeight: "700", textAlign: "center", letterSpacing: 0.5 },
  activityDay: { fontSize: 18, fontWeight: "800", textAlign: "center" },
  activityLine: { width: 1, flex: 1, marginTop: 6, marginBottom: -14 },
  activityCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  activityIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  activityContent: { flex: 1, gap: 2 },
  activityTitle: { fontSize: 13, fontWeight: "700", lineHeight: 18 },
  activityDesc: { fontSize: 12 },
  activityPoints: { fontSize: 13, fontWeight: "700", flexShrink: 0 },
});
