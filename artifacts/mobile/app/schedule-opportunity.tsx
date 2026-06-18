import { Feather } from "@expo/vector-icons";
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

import { MOCK_OPPORTUNITIES } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

export default function ScheduleOpportunityScreen() {
  const { id } = useLocalSearchParams<{ id: string; variant: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selected, setSelected] = useState<"for-me" | "myself" | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const opp = MOCK_OPPORTUNITIES.find((o) => o.id === id);
  const title = opp?.title ?? "Appointment";

  const handleConfirm = () => {
    if (!selected) return;

    if (selected === "for-me") {
      router.push("/find-provider" as never);
    } else {
      setConfirmed(true);
      if (Platform.OS !== "web") {
        Alert.alert(
          "Appointment Logged!",
          "Your appointment details have been saved. We'll send you a reminder before the visit.",
          [{ text: "Done", onPress: () => router.push("/(tabs)" as never) }]
        );
      }
    }
  };

  if (confirmed && Platform.OS === "web") {
    return (
      <View style={[styles.confirmedContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.confirmedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.confirmedIcon, { backgroundColor: "#DCFCE7" }]}>
            <Feather name="check-circle" size={40} color="#16A34A" />
          </View>
          <Text style={[styles.confirmedTitle, { color: colors.foreground }]}>Request Submitted!</Text>
          <Text style={[styles.confirmedSub, { color: colors.mutedForeground }]}>
            Our team will reach out within 24 hours to confirm your appointment for:
          </Text>
          <Text style={[styles.confirmedOpp, { color: colors.primary }]}>{title}</Text>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)" as never)}
          >
            <Text style={styles.doneBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary + "14" }]}>
          <Text style={[styles.headerLabel, { color: colors.primary }]}>Scheduling for</Text>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{title}</Text>
        </View>

        {/* Choice cards */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            How would you like to schedule?
          </Text>

          {/* Option 1: Schedule for me */}
          <TouchableOpacity
            style={[
              styles.choiceCard,
              {
                backgroundColor: colors.card,
                borderColor: selected === "for-me" ? colors.primary : colors.border,
                borderWidth: selected === "for-me" ? 2 : 1,
              },
            ]}
            onPress={() => setSelected("for-me")}
            activeOpacity={0.85}
          >
            <View style={[styles.choiceIconWrap, { backgroundColor: colors.primary + "15" }]}>
              <Feather name="phone-call" size={26} color={colors.primary} />
            </View>
            <View style={styles.choiceBody}>
              <View style={styles.choiceTitleRow}>
                <Text style={[styles.choiceTitle, { color: colors.foreground }]}>
                  Schedule an appt for me
                </Text>
                {selected === "for-me" && (
                  <Feather name="check-circle" size={20} color={colors.primary} />
                )}
              </View>
              <Text style={[styles.choiceDesc, { color: colors.mutedForeground }]}>
                Browse in-network providers near you and book directly at a time that works for you.
              </Text>
              <View style={styles.choiceBullets}>
                {["Search in-network providers", "See real-time availability", "Earn points on completion"].map((b, i) => (
                  <View key={i} style={styles.choiceBullet}>
                    <Feather name="check" size={13} color={colors.primary} />
                    <Text style={[styles.choiceBulletText, { color: colors.mutedForeground }]}>{b}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>

          {/* Option 2: Schedule myself */}
          <TouchableOpacity
            style={[
              styles.choiceCard,
              {
                backgroundColor: colors.card,
                borderColor: selected === "myself" ? colors.primary : colors.border,
                borderWidth: selected === "myself" ? 2 : 1,
              },
            ]}
            onPress={() => setSelected("myself")}
            activeOpacity={0.85}
          >
            <View style={[styles.choiceIconWrap, { backgroundColor: "#EDE9FE" }]}>
              <Feather name="calendar" size={26} color="#8B5CF6" />
            </View>
            <View style={styles.choiceBody}>
              <View style={styles.choiceTitleRow}>
                <Text style={[styles.choiceTitle, { color: colors.foreground }]}>
                  Schedule an appt myself
                </Text>
                {selected === "myself" && (
                  <Feather name="check-circle" size={20} color={colors.primary} />
                )}
              </View>
              <Text style={[styles.choiceDesc, { color: colors.mutedForeground }]}>
                Log your appointment yourself. We'll save the details and send a reminder before your visit.
              </Text>
              <View style={styles.choiceBullets}>
                {["Quick date & time entry", "Reminder sent before visit", "Points credited on completion"].map((b, i) => (
                  <View key={i} style={styles.choiceBullet}>
                    <Feather name="check" size={13} color="#8B5CF6" />
                    <Text style={[styles.choiceBulletText, { color: colors.mutedForeground }]}>{b}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Points reminder */}
        {opp && (
          <View style={[styles.pointsReminder, { backgroundColor: "#05C5B6" + "18", borderColor: "#05C5B6" }]}>
            <Feather name="star" size={18} color="#05C5B6" />
            <Text style={[styles.pointsReminderText, { color: colors.foreground }]}>
              Complete this appointment to earn{" "}
              <Text style={{ fontWeight: "800", color: "#05C5B6" }}>+{opp.points} points</Text>
            </Text>
          </View>
        )}
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
            styles.confirmBtn,
            { backgroundColor: selected ? colors.primary : colors.muted },
          ]}
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={!selected}
        >
          <Text
            style={[
              styles.confirmBtnText,
              { color: selected ? "#fff" : colors.mutedForeground },
            ]}
          >
            {selected === "myself" ? "Find a Provider" : "Confirm Request"}
          </Text>
          <Feather
            name={selected === "myself" ? "search" : "check"}
            size={18}
            color={selected ? "#fff" : colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { gap: 16 },

  confirmedContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  confirmedCard: {
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    alignItems: "center",
    gap: 14,
    width: "100%",
    maxWidth: 360,
  },
  confirmedIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  confirmedTitle: { fontSize: 22, fontWeight: "800" },
  confirmedSub: { fontSize: 14, lineHeight: 20, textAlign: "center" },
  confirmedOpp: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  doneBtn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginTop: 4 },
  doneBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  header: { padding: 20, gap: 6 },
  headerLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  headerTitle: { fontSize: 20, fontWeight: "800", lineHeight: 26 },

  section: { paddingHorizontal: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },

  choiceCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  choiceIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  choiceBody: { flex: 1, gap: 8 },
  choiceTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  choiceTitle: { fontSize: 15, fontWeight: "700", flex: 1, lineHeight: 20 },
  choiceDesc: { fontSize: 13, lineHeight: 18 },
  choiceBullets: { gap: 5 },
  choiceBullet: { flexDirection: "row", alignItems: "center", gap: 6 },
  choiceBulletText: { fontSize: 12, lineHeight: 17 },

  pointsReminder: {
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  pointsReminderText: { flex: 1, fontSize: 14, lineHeight: 20 },

  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 16,
  },
  confirmBtnText: { fontSize: 16, fontWeight: "700" },
});
