import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const DEVICE_TITLE_MAP: Record<string, string> = {
  "blood-pressure": "Blood Pressure",
  "glucose": "Glucose",
  "oxygen": "Oxygen",
  "heart-rate": "Heart Rate",
  "stress": "Stress",
};

export default function ConnectDeviceTypeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { type, title } = useLocalSearchParams<{ type: string; title: string }>();

  const displayTitle =
    title ?? (type ? DEVICE_TITLE_MAP[type] : null) ?? "Device";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{ title: `${displayTitle} Devices`, headerBackTitle: "Back" }}
      />
      <View style={[styles.inner, { paddingBottom: insets.bottom + 32 }]}>
        <View style={[styles.iconCircle, { backgroundColor: colors.secondary }]}>
          <Feather name="bluetooth" size={48} color={colors.primary} />
        </View>

        <Text style={[styles.heading, { color: colors.foreground }]}>
          {displayTitle} Devices
        </Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>
          Available device listings for {displayTitle} monitoring are coming soon.
          Check back for compatible devices you can connect to CareReward.
        </Text>

        <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
          <Feather name="clock" size={14} color={colors.primary} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            Specs incoming — stay tuned
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeText: { fontSize: 13, fontWeight: "600" },
  backBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 8,
  },
  backBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
