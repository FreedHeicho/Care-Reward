import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

import { CATEGORY_COLORS, MOCK_OPPORTUNITIES } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

interface PathVariant {
  id: string;
  title: string;
  description: string;
  points: number;
  tag?: string;
}

function getVariants(category: string, points: number): PathVariant[] {
  if (category === "medication") {
    return [
      {
        id: "v1",
        title: "Switch to Generic Equivalent",
        description: "Ask your doctor to switch your prescription to the generic version covered at Tier 1.",
        points: points,
        tag: "Recommended",
      },
      {
        id: "v2",
        title: "Mail-Order Pharmacy",
        description: "Transfer your current prescription to a mail-order pharmacy for a 90-day supply.",
        points: Math.round(points * 0.8),
      },
      {
        id: "v3",
        title: "In-Network Retail Pharmacy",
        description: "Switch to an in-network retail pharmacy with a lower-tier copay.",
        points: Math.round(points * 0.6),
      },
    ];
  }
  if (category === "mail-delivery") {
    return [
      {
        id: "v1",
        title: "Enroll in Mail-Order (90-day supply)",
        description: "Transfer your prescription to receive a 90-day supply delivered to your home.",
        points: points,
        tag: "Best Value",
      },
      {
        id: "v2",
        title: "Auto-Refill Program",
        description: "Set up automatic refills so you never run out of your medication.",
        points: Math.round(points * 0.7),
      },
    ];
  }
  if (category === "specialist") {
    return [
      {
        id: "v1",
        title: "Switch to Tier 1 Specialist",
        description: "See a Tier 1 specialist in your network for the lowest possible copay.",
        points: points,
        tag: "Most Savings",
      },
      {
        id: "v2",
        title: "Telehealth Specialist Visit",
        description: "Consult with a specialist via telehealth for a reduced copay.",
        points: Math.round(points * 0.8),
      },
    ];
  }
  return [
    {
      id: "v1",
      title: "Complete at In-Network Provider",
      description: "Schedule this service with any in-network provider for full coverage.",
      points: points,
      tag: "Recommended",
    },
    {
      id: "v2",
      title: "Complete via Telehealth",
      description: "Complete this service via telehealth from the comfort of your home.",
      points: Math.round(points * 0.9),
    },
  ];
}

export default function OpportunityVariantsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  const opp = MOCK_OPPORTUNITIES.find((o) => o.id === id);

  if (!opp) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Opportunity not found</Text>
      </View>
    );
  }

  const catColor = CATEGORY_COLORS[opp.category] ?? colors.primary;
  const variants = getVariants(opp.category, opp.points);

  const handleContinue = () => {
    if (!selectedVariant) return;
    router.push(`/schedule-opportunity?id=${opp.id}&variant=${selectedVariant}` as never);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: catColor + "18" }]}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>{opp.title}</Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>{opp.description}</Text>
          <View style={[styles.totalPointsPill, { backgroundColor: catColor }]}>
            <Feather name="star" size={14} color="#fff" />
            <Text style={styles.totalPointsText}>Up to {opp.points} points</Text>
          </View>
        </View>

        {/* Path selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Choose your path
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            Select the option that works best for you
          </Text>

          <View style={styles.variants}>
            {variants.map((v) => {
              const isSelected = selectedVariant === v.id;
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[
                    styles.variantCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isSelected ? catColor : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedVariant(v.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.variantTop}>
                    <View
                      style={[
                        styles.variantRadio,
                        {
                          borderColor: isSelected ? catColor : colors.mutedForeground,
                          backgroundColor: isSelected ? catColor : "transparent",
                        },
                      ]}
                    >
                      {isSelected && <View style={styles.variantRadioDot} />}
                    </View>
                    <View style={styles.variantTitles}>
                      <View style={styles.variantTitleRow}>
                        <Text style={[styles.variantTitle, { color: colors.foreground }]}>
                          {v.title}
                        </Text>
                        {v.tag && (
                          <View style={[styles.variantTag, { backgroundColor: catColor + "20" }]}>
                            <Text style={[styles.variantTagText, { color: catColor }]}>{v.tag}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.variantDesc, { color: colors.mutedForeground }]}>
                        {v.description}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.variantPoints, { backgroundColor: colors.primary + "12" }]}>
                    <Feather name="star" size={13} color={colors.primary} />
                    <Text style={[styles.variantPointsText, { color: colors.primary }]}>
                      +{v.points} points
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Why this matters */}
        <View style={[styles.whyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.whyHeader}>
            <Feather name="info" size={16} color={colors.primary} />
            <Text style={[styles.whyTitle, { color: colors.foreground }]}>Why this matters</Text>
          </View>
          <Text style={[styles.whyText, { color: colors.mutedForeground }]}>{opp.why}</Text>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 16 : 8),
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.continueBtn,
            { backgroundColor: selectedVariant ? colors.primary : colors.muted },
          ]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={!selectedVariant}
        >
          <Text
            style={[
              styles.continueBtnText,
              { color: selectedVariant ? "#fff" : colors.mutedForeground },
            ]}
          >
            Continue to Schedule
          </Text>
          <Feather
            name="arrow-right"
            size={18}
            color={selectedVariant ? "#fff" : colors.mutedForeground}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.push(`/opportunity/${opp.id}` as never)}
        >
          <Text style={[styles.skipBtnText, { color: colors.mutedForeground }]}>
            View full details instead
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { gap: 16 },

  hero: { padding: 20, gap: 10 },
  heroTitle: { fontSize: 22, fontWeight: "800", lineHeight: 28 },
  heroSub: { fontSize: 14, lineHeight: 20 },
  totalPointsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  totalPointsText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  section: { paddingHorizontal: 16, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  sectionSub: { fontSize: 13, marginTop: -4 },

  variants: { gap: 12 },
  variantCard: {
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  variantTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  variantRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  variantRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  variantTitles: { flex: 1, gap: 4 },
  variantTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  variantTitle: { fontSize: 14, fontWeight: "700", lineHeight: 18 },
  variantTag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  variantTagText: { fontSize: 11, fontWeight: "700" },
  variantDesc: { fontSize: 13, lineHeight: 18 },
  variantPoints: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  variantPointsText: { fontSize: 13, fontWeight: "700" },

  whyCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  whyHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  whyTitle: { fontSize: 14, fontWeight: "700" },
  whyText: { fontSize: 13, lineHeight: 19 },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 16,
  },
  continueBtnText: { fontSize: 16, fontWeight: "700" },
  skipBtn: { alignItems: "center", paddingVertical: 4 },
  skipBtnText: { fontSize: 13 },
});
