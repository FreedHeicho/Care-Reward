import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  MOCK_OPPORTUNITIES,
} from "@/constants/data";
import { useColors } from "@/hooks/useColors";

export default function OpportunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [completed, setCompleted] = useState(false);

  const opp = MOCK_OPPORTUNITIES.find((o) => o.id === id);

  if (!opp) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Opportunity not found</Text>
      </View>
    );
  }

  const catColor = CATEGORY_COLORS[opp.category];

  const handleComplete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCompleted(true);
    if (Platform.OS !== "web") {
      Alert.alert(
        "Opportunity Completed!",
        `You've earned ${opp.points} points and will save $${opp.savings}/month. Keep it up!`,
        [{ text: "Done", onPress: () => router.back() }]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { backgroundColor: catColor + "15" }]}>
          <View style={[styles.categoryBadge, { backgroundColor: catColor + "25" }]}>
            <Text style={[styles.categoryText, { color: catColor }]}>
              {CATEGORY_LABELS[opp.category]}
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>{opp.title}</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {opp.description}
          </Text>

          <View style={styles.metricsRow}>
            <View style={[styles.metric, { backgroundColor: colors.card }]}>
              <Feather name="dollar-sign" size={22} color={colors.accent} />
              <Text style={[styles.metricValue, { color: colors.accent }]}>
                ${opp.savings}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                per month
              </Text>
            </View>
            <View style={[styles.metric, { backgroundColor: colors.card }]}>
              <Feather name="star" size={22} color={colors.rewards} />
              <Text style={[styles.metricValue, { color: colors.rewards }]}>
                +{opp.points}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                points
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Feather name="info" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Why this was recommended
            </Text>
          </View>
          <Text style={[styles.sectionBody, { color: colors.mutedForeground }]}>{opp.why}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Feather name="list" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>How to complete</Text>
          </View>
          {opp.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
            </View>
          ))}
        </View>

        {opp.category === "medication" && (
          <TouchableOpacity
            style={[styles.doctorNoteBtn, { borderColor: colors.primary, backgroundColor: colors.primary + "10" }]}
            onPress={() => {}}
          >
            <Feather name="file-text" size={16} color={colors.primary} />
            <Text style={[styles.doctorNoteBtnText, { color: colors.primary }]}>
              Generate Doctor Note
            </Text>
            <Feather name="arrow-right" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}

        {completed ? (
          <View style={[styles.completedBadge, { backgroundColor: colors.accent }]}>
            <Feather name="check-circle" size={20} color="#fff" />
            <Text style={styles.completedText}>Completed! Points pending verification</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.completeBtn, { backgroundColor: colors.primary }]}
            onPress={handleComplete}
            activeOpacity={0.85}
          >
            <Feather name="check" size={20} color="#fff" />
            <Text style={styles.completeBtnText}>Mark as Completed</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { gap: 16 },
  hero: { padding: 24, gap: 14 },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryText: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  title: { fontSize: 26, fontWeight: "800", lineHeight: 32 },
  description: { fontSize: 16, lineHeight: 24 },
  metricsRow: { flexDirection: "row", gap: 12 },
  metric: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  metricValue: { fontSize: 28, fontWeight: "900" },
  metricLabel: { fontSize: 12 },
  section: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  sectionBody: { fontSize: 15, lineHeight: 22 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNumberText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  stepText: { flex: 1, fontSize: 15, lineHeight: 22 },
  doctorNoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
  },
  doctorNoteBtnText: { fontSize: 16, fontWeight: "700", flex: 1 },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 18,
  },
  completeBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 18,
  },
  completedText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
