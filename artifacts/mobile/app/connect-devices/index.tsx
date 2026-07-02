import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
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

const DEVICE_TYPES = [
  {
    id: "blood-pressure",
    title: "Blood Pressure",
    description: "Keep track of your blood pressure.",
    icon: "activity" as const,
  },
  {
    id: "glucose",
    title: "Glucose",
    description: "Monitor your blood glucose levels.",
    icon: "droplet" as const,
  },
  {
    id: "oxygen",
    title: "Oxygen",
    description: "Check to make sure you're getting enough oxygen.",
    icon: "wind" as const,
  },
  {
    id: "heart-rate",
    title: "Heart Rate",
    description: "Keep track of your heart rate.",
    icon: "heart" as const,
  },
  {
    id: "stress",
    title: "Stress",
    description: "Keep track of your stress.",
    icon: "zap" as const,
  },
];

export default function ConnectDevicesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "Connect Health Devices", headerBackTitle: "Back" }} />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Select a device type to connect to CareReward and start tracking your health metrics.
        </Text>

        {DEVICE_TYPES.map((device, idx) => (
          <View key={device.id}>
            <View style={[styles.deviceRow, { backgroundColor: colors.background }]}>
              <View style={[styles.deviceIcon, { backgroundColor: "#F3F4F6" }]}>
                <Feather name={device.icon} size={26} color="#6B7280" />
              </View>
              <View style={styles.deviceInfo}>
                <Text style={[styles.deviceTitle, { color: colors.foreground }]}>
                  {device.title}
                </Text>
                <Text style={[styles.deviceDesc, { color: colors.mutedForeground }]}>
                  {device.description}
                </Text>
                <TouchableOpacity
                  style={[styles.connectBtn, { backgroundColor: colors.primary }]}
                  onPress={() =>
                    router.push({
                      pathname: "/connect-devices/[type]",
                      params: { type: device.id, title: device.title },
                    } as never)
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.connectBtnText}>Connect</Text>
                </TouchableOpacity>
              </View>
            </View>
            {idx < DEVICE_TYPES.length - 1 && (
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: 16, paddingHorizontal: 16 },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 18,
    gap: 16,
  },
  deviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  deviceInfo: {
    flex: 1,
    gap: 6,
  },
  deviceTitle: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
  },
  deviceDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  connectBtn: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 4,
  },
  connectBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  separator: {
    height: 1,
    marginLeft: 72,
  },
});
