import { Feather } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  ActivityEvent,
  MISSED_OPPORTUNITIES_COUNT,
  MOCK_ACTIVITY,
  MOCK_OPPORTUNITIES,
  NEW_OPPORTUNITIES_COUNT,
} from "@/constants/data";
import { useColors } from "@/hooks/useColors";
import { OpportunitiesSheet } from "@/components/OpportunitiesSheet";

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
  const [sheetVisible, setSheetVisible] = useState(false);
  const firstName = user?.name?.split(" ")[0] ?? "Sarah";
  const topOpp = MOCK_OPPORTUNITIES.find((o) => o.id === "opp-1");

  useEffect(() => {
    navigation.setOptions({
      title: `Hi ${firstName}!`,
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setSheetVisible(true)}
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
            onPress={() => router.push("/redeem" as never)}
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
          style={[styles.alertBanner, { backgroundColor: "#E6F0ED", borderLeftColor: "#05C5B6" }]}
          onPress={() => setSheetVisible(true)}
        >
          <Feather name="bell" size={18} color="#05C5B6" />
          <Text style={[styles.alertText, { color: colors.foreground }]}>
            You have {NEW_OPPORTUNITIES_COUNT} new opportunities
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.alertBanner, { backgroundColor: "#FEF3C7", borderLeftColor: "#F59E0B" }]}
          onPress={() => setSheetVisible(true)}
        >
          <Feather name="bell" size={18} color="#F59E0B" />
          <Text style={[styles.alertText, { color: colors.foreground }]}>
            You have {MISSED_OPPORTUNITIES_COUNT} missed opportunities
          </Text>
        </TouchableOpacity>

        {/* Find More CTA */}
        <TouchableOpacity
          style={[styles.findMoreBtn, { backgroundColor: colors.primary }]}
          onPress={() => setSheetVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.findMoreText}>Find more opportunities</Text>
          <Feather name="arrow-right" size={18} color="#fff" />
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
          </View>
        </View>

        {/* Recommended for You */}
        <View style={styles.section}>
          <View style={styles.recommendedHeader}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Recommended for You
            </Text>
            <View style={[styles.oppCountBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.oppCountText}>
                {NEW_OPPORTUNITIES_COUNT} Opportunities
              </Text>
            </View>
          </View>

          {topOpp && (
            <TouchableOpacity
              style={[styles.oppCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/opportunity/${topOpp.id}` as never)}
              activeOpacity={0.8}
            >
              <View style={[styles.oppCardLeftBar, { backgroundColor: "#8B5CF6" }]} />
              <View style={styles.oppCardContent}>
                <View style={styles.oppCardHeader}>
                  <View style={[styles.oppMedIcon, { backgroundColor: "#EDE9FE" }]}>
                    <Text style={styles.oppMedEmoji}>💊</Text>
                  </View>
                  <View style={styles.oppCardTitles}>
                    <Text style={[styles.oppCardTitle, { color: colors.foreground }]}>
                      {topOpp.title}
                    </Text>
                    <Text style={[styles.oppCardSub, { color: colors.mutedForeground }]}>
                      {topOpp.description}
                    </Text>
                  </View>
                </View>

                <View style={[styles.oppPointsBadge, { backgroundColor: "#05C5B6" }]}>
                  <Text style={styles.oppPointsBadgeText}>
                    {topOpp.points} points + {topOpp.pointsMonthly} points monthly
                  </Text>
                </View>

                {topOpp.benefits.map((b) => (
                  <View key={b} style={styles.oppBenefit}>
                    <Feather name="check-circle" size={15} color={colors.primary} />
                    <Text style={[styles.oppBenefitText, { color: colors.foreground }]}>{b}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.howToEarnBtn, { backgroundColor: colors.primary }]}
                  onPress={() => router.push(`/opportunity/${topOpp.id}` as never)}
                >
                  <Text style={styles.howToEarnText}>How To Earn</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
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

      <OpportunitiesSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
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

  // Find more
  findMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 16,
  },
  findMoreText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Sections
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800" },

  // Get Started
  getStartedGrid: { flexDirection: "row", gap: 12 },
  getStartedCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  getStartedCardTitle: { fontSize: 14, fontWeight: "800", lineHeight: 20 },
  getStartedCardDesc: { fontSize: 12, lineHeight: 17, flex: 1 },
  getStartedCardBtn: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 4,
  },
  getStartedCardBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  // Recommended
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
  oppCardContent: { flex: 1, padding: 16, gap: 12 },
  oppCardHeader: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  oppMedIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  oppMedEmoji: { fontSize: 22 },
  oppCardTitles: { flex: 1 },
  oppCardTitle: { fontSize: 15, fontWeight: "700" },
  oppCardSub: { fontSize: 13, marginTop: 2 },
  oppPointsBadge: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  oppPointsBadgeText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  oppBenefit: { flexDirection: "row", alignItems: "center", gap: 8 },
  oppBenefitText: { fontSize: 14, flex: 1 },
  howToEarnBtn: {
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
  },
  howToEarnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

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
