import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useConnectedDevices } from "@/context/ConnectedDevicesContext";
import type { ConnectedDevice } from "@/services/api";

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

const DEVICE_TYPE_ICON: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  BLOOD_PRESSURE: "activity",
  GLUCOSE: "droplet",
  OXYGEN: "wind",
  HEART_RATE: "heart",
  STRESS: "zap",
};

const CONN_BADGE: Record<string, { bg: string; color: string }> = {
  BLUETOOTH: { bg: "#EFF6FF", color: "#2563EB" },
  WIFI: { bg: "#DCFCE7", color: "#16A34A" },
  NFC: { bg: "#F5F3FF", color: "#7C3AED" },
};

function ConnectedDeviceRow({
  device,
  onDisconnect,
}: {
  device: ConnectedDevice;
  onDisconnect: (id: string) => void;
}) {
  const colors = useColors();
  const icon = DEVICE_TYPE_ICON[device.deviceType] ?? "bluetooth";
  const conn = CONN_BADGE[device.connectionType] ?? { bg: "#F3F4F6", color: "#4B5563" };

  return (
    <View style={[styles.connectedRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.deviceIcon, { backgroundColor: "#DCFCE7" }]}>
        <Feather name={icon} size={22} color="#16A34A" />
      </View>
      <View style={styles.deviceInfo}>
        <Text style={[styles.deviceTitle, { color: colors.foreground }]} numberOfLines={1}>
          {device.deviceName}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: conn.bg }]}>
            <Text style={[styles.badgeText, { color: conn.color }]}>
              {device.connectionType.charAt(0) + device.connectionType.slice(1).toLowerCase()}
            </Text>
          </View>
          <Text style={[styles.deviceDesc, { color: colors.mutedForeground }]}>
            {device.deviceType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => onDisconnect(device.id)}
        style={[styles.disconnectBtn, { borderColor: colors.border }]}
        activeOpacity={0.75}
      >
        <Feather name="x" size={14} color={colors.mutedForeground} />
      </TouchableOpacity>
    </View>
  );
}

export default function ConnectDevicesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { devices, loading, removeDevice } = useConnectedDevices();

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
        {/* Connected devices section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
            Connected devices
          </Text>
          {loading ? (
            <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.emptyRow}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </View>
          ) : devices.length === 0 ? (
            <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.emptyRow}>
                <Feather name="bluetooth" size={24} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No devices connected yet
                </Text>
              </View>
            </View>
          ) : (
            <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {devices.map((device, idx) => (
                <View key={device.id}>
                  {idx > 0 && (
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                  )}
                  <ConnectedDeviceRow
                    device={device}
                    onDisconnect={removeDevice}
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Add a device section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
            Add a device
          </Text>
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: 16, paddingHorizontal: 16, gap: 24 },

  section: { gap: 10 },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },

  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  emptyRow: {
    paddingVertical: 28,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
  },

  connectedRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 14,
  },
  disconnectBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
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
