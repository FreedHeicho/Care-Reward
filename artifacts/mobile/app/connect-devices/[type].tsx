import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

/* ─── Types ─────────────────────────────────────────────── */
type Connectivity = "Bluetooth" | "WiFi" | "NFC";

interface Device {
  id: string;
  name: string;
  connectivity: Connectivity;
  formFactor: string;
}

/* ─── Device catalog ─────────────────────────────────────── */
const DEVICE_CATALOG: Record<string, Device[]> = {
  "blood-pressure": [
    { id: "omron-evolv",   name: "Omron Evolv",          connectivity: "Bluetooth", formFactor: "Upper arm" },
    { id: "withings-bpm",  name: "Withings BPM Connect",  connectivity: "WiFi",      formFactor: "Upper arm" },
    { id: "ihealth-track", name: "iHealth Track",         connectivity: "Bluetooth", formFactor: "Wrist"     },
  ],
  glucose: [
    { id: "dexcom-g7",      name: "Dexcom G7",         connectivity: "Bluetooth", formFactor: "CGM"        },
    { id: "freestyle-3",    name: "FreeStyle Libre 3",  connectivity: "NFC",       formFactor: "CGM"        },
    { id: "contour-next",   name: "Contour Next One",   connectivity: "Bluetooth", formFactor: "Glucometer" },
  ],
  oxygen: [
    { id: "wellue-o2ring",  name: "Wellue O2Ring",      connectivity: "Bluetooth", formFactor: "Ring"       },
    { id: "ihealth-air",    name: "iHealth Air",         connectivity: "Bluetooth", formFactor: "Fingertip"  },
    { id: "masimo-mighty",  name: "Masimo MightySat",    connectivity: "Bluetooth", formFactor: "Fingertip"  },
  ],
  "heart-rate": [
    { id: "apple-watch",    name: "Apple Watch",         connectivity: "Bluetooth", formFactor: "Watch"      },
    { id: "fitbit-charge6", name: "Fitbit Charge 6",     connectivity: "Bluetooth", formFactor: "Band"       },
    { id: "garmin-venu3",   name: "Garmin Venu 3",       connectivity: "Bluetooth", formFactor: "Watch"      },
    { id: "polar-h10",      name: "Polar H10",           connectivity: "Bluetooth", formFactor: "Chest strap"},
  ],
  stress: [
    { id: "whoop-4",        name: "WHOOP 4.0",           connectivity: "Bluetooth", formFactor: "Band"       },
    { id: "fitbit-sense2",  name: "Fitbit Sense 2",      connectivity: "Bluetooth", formFactor: "Watch"      },
    { id: "garmin-body",    name: "Garmin Body Battery",  connectivity: "Bluetooth", formFactor: "Watch"      },
  ],
};

/* ─── Display titles ─────────────────────────────────────── */
const HEADER_TITLES: Record<string, string> = {
  "blood-pressure": "Blood pressure monitors",
  glucose:          "Glucose monitors",
  oxygen:           "Oxygen monitors",
  "heart-rate":     "Heart rate monitors",
  stress:           "Stress monitors",
};

/* ─── Connectivity badge styles ──────────────────────────── */
const CONN_STYLES: Record<Connectivity, { bg: string; text: string }> = {
  Bluetooth: { bg: "#EFF6FF", text: "#2563EB" },
  WiFi:      { bg: "#DCFCE7", text: "#16A34A" },
  NFC:       { bg: "#F5F3FF", text: "#7C3AED" },
};

/* ─── Icon tile bg per connectivity ─────────────────────── */
const TILE_BG: Record<Connectivity, string> = {
  Bluetooth: "#EFF6FF",
  WiFi:      "#DCFCE7",
  NFC:       "#F5F3FF",
};

/* ─── Type icon ──────────────────────────────────────────── */
const TYPE_ICON: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  "blood-pressure": "activity",
  glucose:          "droplet",
  oxygen:           "wind",
  "heart-rate":     "heart",
  stress:           "zap",
};

/* ─── Screen ─────────────────────────────────────────────── */
export default function DeviceListScreen() {
  const colors    = useColors();
  const insets    = useSafeAreaInsets();
  const router    = useRouter();
  const navigation = useNavigation();
  const { type }  = useLocalSearchParams<{ type: string }>();

  const [searchActive, setSearchActive] = useState(false);
  const [searchText,   setSearchText]   = useState("");
  const searchRef = useRef<TextInput>(null);

  const pageTitle = (type ? HEADER_TITLES[type] : undefined) ?? "Available devices";
  const icon: React.ComponentProps<typeof Feather>["name"] =
    (type ? TYPE_ICON[type] : undefined) ?? "bluetooth";
  const devices: Device[] = (type ? DEVICE_CATALOG[type] : undefined) ?? [];

  const filtered = useMemo(() => {
    if (!searchText.trim()) return devices;
    const q = searchText.toLowerCase();
    return devices.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.formFactor.toLowerCase().includes(q) ||
        d.connectivity.toLowerCase().includes(q),
    );
  }, [devices, searchText]);

  /* Dynamic header right — search toggle */
  useEffect(() => {
    navigation.setOptions({
      title: searchActive ? "" : pageTitle,
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            if (searchActive) {
              setSearchText("");
              setSearchActive(false);
            } else {
              setSearchActive(true);
              setTimeout(() => searchRef.current?.focus(), 80);
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ marginRight: Platform.OS === "ios" ? 0 : 12 }}
        >
          <Feather
            name={searchActive ? "x" : "search"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      ),
    });
  }, [searchActive, pageTitle, navigation]);

  const activateSearch = () => {
    setSearchActive(true);
    setTimeout(() => searchRef.current?.focus(), 80);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: pageTitle, headerBackTitle: "Back" }} />

      {/* Inline search bar */}
      {searchActive && (
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            ref={searchRef}
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search devices…"
            placeholderTextColor={colors.mutedForeground}
            value={searchText}
            onChangeText={setSearchText}
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Feather name="x-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        {!searchActive && (
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Select your device to begin pairing.
          </Text>
        )}

        {/* Device rows */}
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {filtered.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No devices match "{searchText}"
              </Text>
            </View>
          ) : (
            filtered.map((device: Device, idx: number) => {
              const connStyle = CONN_STYLES[device.connectivity];
              const tileBg    = TILE_BG[device.connectivity];
              const tileColor = connStyle.text;

              return (
                <View key={device.id}>
                  {idx > 0 && (
                    <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
                  )}
                  <View style={styles.deviceRow}>
                    {/* Icon tile */}
                    <View style={[styles.iconTile, { backgroundColor: tileBg, flexShrink: 0 }]}>
                      <Feather name={icon} size={20} color={tileColor} />
                    </View>

                    {/* Name + badge + form factor */}
                    <View style={styles.deviceInfo}>
                      <Text
                        style={[styles.deviceName, { color: colors.foreground }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {device.name}
                      </Text>
                      <View style={styles.metaRow}>
                        <View style={[styles.connBadge, { backgroundColor: connStyle.bg }]}>
                          <Text style={[styles.connBadgeText, { color: connStyle.text }]}>
                            {device.connectivity}
                          </Text>
                        </View>
                        <Text
                          style={[styles.formFactor, { color: colors.mutedForeground }]}
                          numberOfLines={1}
                        >
                          {device.formFactor}
                        </Text>
                      </View>
                    </View>

                    {/* Connect button */}
                    <TouchableOpacity
                      style={[styles.connectBtn, { backgroundColor: colors.primary, flexShrink: 0 }]}
                      activeOpacity={0.85}
                      onPress={() =>
                        router.push({
                          pathname: "/connect-devices/pair",
                          params: {
                            deviceName: device.name,
                            deviceType: type ?? "",
                          },
                        } as never)
                      }
                    >
                      <Text style={styles.connectBtnText}>Connect</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Escape hatch */}
        <TouchableOpacity onPress={activateSearch} style={styles.escapeRow}>
          <Text style={[styles.escapeText, { color: colors.primary }]}>
            Don't see your device? Search by name
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: 0,
  },

  scroll: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  subtitle: { fontSize: 13, lineHeight: 18 },

  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  rowDivider: { height: StyleSheet.hairlineWidth, marginLeft: 68 },

  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceInfo: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  connBadge: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  connBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 14,
  },
  formFactor: {
    fontSize: 12,
    lineHeight: 16,
  },
  connectBtn: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  connectBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  emptyRow: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
  },

  escapeRow: {
    alignItems: "center",
    paddingVertical: 12,
  },
  escapeText: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    textDecorationLine: "underline",
  },
});
