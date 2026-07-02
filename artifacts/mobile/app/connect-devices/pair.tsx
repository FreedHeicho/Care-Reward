import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

/* ─── State machine type ─────────────────────────────────── */
type PairState =
  | "ready"
  | "searching"
  | "connected"
  | "error-bluetooth"
  | "error-not-found"
  | "error-already-connected"
  | "error-pairing-failed";

/* ─── Metrics tracked per device type ───────────────────── */
const METRICS: Record<string, Array<{ icon: React.ComponentProps<typeof Feather>["name"]; label: string }>> = {
  "blood-pressure": [
    { icon: "heart",       label: "Blood pressure" },
    { icon: "activity",    label: "Pulse rate"      },
  ],
  glucose: [
    { icon: "droplet",     label: "Blood glucose"   },
    { icon: "trending-up", label: "Glucose trends"  },
  ],
  oxygen: [
    { icon: "wind",        label: "Blood oxygen"    },
    { icon: "percent",     label: "SpO2 levels"     },
  ],
  "heart-rate": [
    { icon: "heart",       label: "Heart rate"      },
    { icon: "zap",         label: "Activity"        },
  ],
  stress: [
    { icon: "zap",         label: "Stress level"    },
    { icon: "activity",    label: "HRV"             },
  ],
};

/* ─── Screen ─────────────────────────────────────────────── */
export default function PairScreen() {
  const colors     = useColors();
  const insets     = useSafeAreaInsets();
  const router     = useRouter();
  const navigation = useNavigation();
  const { deviceName, deviceType } =
    useLocalSearchParams<{ deviceName: string; deviceType: string }>();

  const [pairState, setPairState] = useState<PairState>("ready");

  /* Spinner animation for State B */
  const spinValue  = useRef(new Animated.Value(0)).current;
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef     = useRef<Animated.CompositeAnimation | null>(null);

  const displayName = deviceName ?? "Your Device";
  const metrics     = (deviceType ? METRICS[deviceType] : undefined) ?? METRICS["heart-rate"];

  /* Spin loop while searching */
  useEffect(() => {
    if (pairState === "searching") {
      spinValue.setValue(0);
      const loop = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      );
      animRef.current = loop;
      loop.start();
      return () => {
        loop.stop();
        spinValue.setValue(0);
      };
    }
  }, [pairState]);

  /* Hide header back button in State C (Done is the only exit) */
  useEffect(() => {
    navigation.setOptions({
      headerLeft: pairState === "connected" ? () => null : undefined,
    });
  }, [pairState, navigation]);

  /* Cleanup timer on unmount */
  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  /* ── Actions ── */
  const startPairing = () => {
    setPairState("searching");
    /* Simulate: device found in 3 s */
    searchTimer.current = setTimeout(() => {
      setPairState("connected");
    }, 3000);
  };

  const cancelSearch = () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setPairState("ready");
  };

  const retrySearch = () => {
    setPairState("ready");
  };

  const goBack = () => router.back();

  const handleDone = () => {
    /* Return to connect-devices Screen 1 */
    router.navigate("/connect-devices" as never);
  };

  const openBluetoothSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("App-Prefs:Bluetooth");
    } else {
      Linking.openURL("android.settings.BLUETOOTH_SETTINGS").catch(() =>
        Linking.openSettings(),
      );
    }
  };

  /* ─────────────── Renderers ────────────────────────────── */

  /* State A — ready to pair */
  const renderReady = () => (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + 32 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.centeredBlock}>
        <View style={[styles.iconCircle, { backgroundColor: colors.secondary }]}>
          <Feather name="bluetooth" size={40} color={colors.primary} />
        </View>
        <Text style={[styles.heading, { color: colors.foreground }]}>
          Ready to connect
        </Text>
        <Text style={[styles.headingDevice, { color: colors.primary }]} numberOfLines={2}>
          {displayName}
        </Text>
        <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
          Before tapping connect:
        </Text>
      </View>

      <View style={[styles.checklistCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          "Turn on your device",
          "Enable Bluetooth on your phone",
          "Keep device within 3 feet",
        ].map((step, i) => (
          <View key={i} style={styles.checklistRow}>
            <View style={[styles.stepNum, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.stepNumText, { color: colors.primary }]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.foreground }]} numberOfLines={2}>
              {step}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        onPress={startPairing}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>Start pairing</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  /* State B — searching */
  const renderSearching = () => (
    <View style={[styles.fullCenter, { paddingBottom: insets.bottom + 32 }]}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Feather name="refresh-cw" size={52} color={colors.primary} />
      </Animated.View>
      <Text style={[styles.heading, { color: colors.foreground, marginTop: 24 }]}>
        Searching for your device…
      </Text>
      <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
        Keep your device nearby and powered on.
      </Text>
      <TouchableOpacity onPress={cancelSearch} style={styles.cancelBtn}>
        <Text style={[styles.cancelText, { color: colors.primary }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  /* State C — connected */
  const renderConnected = () => (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + 32 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.centeredBlock}>
        <View style={[styles.iconCircle, { backgroundColor: "#DCFCE7" }]}>
          <Feather name="check-circle" size={44} color="#16A34A" />
        </View>
        <Text style={[styles.heading, { color: colors.foreground }]}>
          {displayName} connected!
        </Text>
        <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
          CareReward will now track:
        </Text>
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((m, i) => (
          <View
            key={i}
            style={[styles.metricCell, { backgroundColor: "#DCFCE7", borderColor: "#86EFAC" }]}
          >
            <Feather name={m.icon} size={16} color="#16A34A" />
            <Text style={[styles.metricLabel, { color: "#15803D" }]} numberOfLines={2}>
              {m.label}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        onPress={handleDone}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  /* Error: Bluetooth off */
  const renderBluetoothOff = () => (
    <View style={[styles.fullCenter, { paddingBottom: insets.bottom + 32, paddingHorizontal: 24 }]}>
      <View style={[styles.iconCircle, { backgroundColor: "#FEF3C7" }]}>
        <Feather name="alert-circle" size={40} color="#F59E0B" />
      </View>
      <Text style={[styles.heading, { color: colors.foreground, marginTop: 20 }]}>
        Bluetooth is off
      </Text>
      <Text style={[styles.errorBody, { color: colors.mutedForeground }]}>
        Bluetooth is required to connect this device. Enable it in your phone settings.
      </Text>
      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        onPress={openBluetoothSettings}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>Open settings</Text>
      </TouchableOpacity>
    </View>
  );

  /* Error: not found */
  const renderNotFound = () => (
    <View style={[styles.fullCenter, { paddingBottom: insets.bottom + 32, paddingHorizontal: 24 }]}>
      <View style={[styles.iconCircle, { backgroundColor: "#FEF3C7" }]}>
        <Feather name="wifi-off" size={40} color="#F59E0B" />
      </View>
      <Text style={[styles.heading, { color: colors.foreground, marginTop: 20 }]}>
        Device not found
      </Text>
      <Text style={[styles.errorBody, { color: colors.mutedForeground }]}>
        Couldn't find your device. Make sure it's powered on and within range.
      </Text>
      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        onPress={() => setPairState("searching")}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>Try again</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.ghostBtn, { borderColor: colors.border }]}
        onPress={goBack}
        activeOpacity={0.75}
      >
        <Text style={[styles.ghostBtnText, { color: colors.foreground }]}>
          Choose a different device
        </Text>
      </TouchableOpacity>
    </View>
  );

  /* Error: already connected */
  const renderAlreadyConnected = () => (
    <View style={[styles.fullCenter, { paddingBottom: insets.bottom + 32, paddingHorizontal: 24 }]}>
      <View style={[styles.iconCircle, { backgroundColor: "#DCFCE7" }]}>
        <Feather name="check-circle" size={40} color="#16A34A" />
      </View>
      <Text style={[styles.heading, { color: colors.foreground, marginTop: 20 }]}>
        Already connected
      </Text>
      <Text style={[styles.errorBody, { color: colors.mutedForeground }]}>
        This device is already linked to your account.
      </Text>
      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        onPress={handleDone}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>View connected devices</Text>
      </TouchableOpacity>
    </View>
  );

  /* Error: pairing failed */
  const renderPairingFailed = () => (
    <View style={[styles.fullCenter, { paddingBottom: insets.bottom + 32, paddingHorizontal: 24 }]}>
      <View style={[styles.iconCircle, { backgroundColor: "#FEE2E2" }]}>
        <Feather name="x-circle" size={40} color="#DC2626" />
      </View>
      <Text style={[styles.heading, { color: colors.foreground, marginTop: 20 }]}>
        Connection failed
      </Text>
      <Text style={[styles.errorBody, { color: colors.mutedForeground }]}>
        Connection failed. Restart the device and try again.
      </Text>
      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        onPress={retrySearch}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>Try again</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.ghostBtn, { borderColor: colors.border }]}
        onPress={goBack}
        activeOpacity={0.75}
      >
        <Text style={[styles.ghostBtnText, { color: colors.foreground }]}>
          Choose a different device
        </Text>
      </TouchableOpacity>
    </View>
  );

  /* ─────────────── Main render ──────────────────────────── */
  const STATE_LABEL: Record<PairState, string> = {
    ready:                   "State A — Ready to pair",
    searching:               "State B — Searching",
    connected:               "State C — Connected",
    "error-bluetooth":       "Error — Bluetooth off",
    "error-not-found":       "Error — Device not found",
    "error-already-connected": "Error — Already connected",
    "error-pairing-failed":  "Error — Pairing failed",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: pairState === "connected" ? `${displayName} connected` : "Pair Device",
          headerBackTitle: "Back",
        }}
      />

      {/* Dev-mode state badge — remove before launch */}
      {__DEV__ && (
        <View style={[styles.devBadge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.devBadgeText, { color: colors.primary }]}>
            {STATE_LABEL[pairState]}
          </Text>
        </View>
      )}

      {pairState === "ready"                    && renderReady()}
      {pairState === "searching"                && renderSearching()}
      {pairState === "connected"                && renderConnected()}
      {pairState === "error-bluetooth"          && renderBluetoothOff()}
      {pairState === "error-not-found"          && renderNotFound()}
      {pairState === "error-already-connected"  && renderAlreadyConnected()}
      {pairState === "error-pairing-failed"     && renderPairingFailed()}
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Scrollable states (A, C) */
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 20,
  },

  /* Centered non-scroll states (B, errors) */
  fullCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },

  centeredBlock: {
    alignItems: "center",
    gap: 8,
  },

  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginBottom: 4,
  },

  heading: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 26,
  },
  headingDevice: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 24,
  },
  subheading: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  errorBody: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },

  /* Checklist */
  checklistCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 0,
  },
  checklistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNumText: {
    fontSize: 12,
    fontWeight: "700",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  /* Metrics grid — State C */
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCell: {
    flexBasis: "47%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metricLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },

  /* Buttons */
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    alignSelf: "stretch",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  ghostBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    alignSelf: "stretch",
    borderWidth: 1.5,
  },
  ghostBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  cancelBtn: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  /* Dev badge */
  devBadge: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  devBadgeText: { fontSize: 11, fontWeight: "600" },
});
