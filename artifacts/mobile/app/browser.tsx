import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

let WebView: React.ComponentType<{
  source: { uri: string };
  style?: object;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: () => void;
}> | null = null;

if (Platform.OS !== "web") {
  WebView = require("react-native-webview").WebView;
}

export default function BrowserScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const { url, storeName } = useLocalSearchParams<{
    url: string;
    storeName: string;
  }>();

  const displayUrl = url
    ? url.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "";

  const handleClose = () => {
    router.navigate("/(tabs)/rewards");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom nav bar */}
      <View
        style={[
          styles.navbar,
          {
            paddingTop: insets.top + 10,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.navLeft}>
          <View style={[styles.faviconBox, { backgroundColor: colors.secondary }]}>
            <Feather name="globe" size={16} color={colors.primary} />
          </View>
          <View style={styles.navMeta}>
            <Text
              style={[styles.storeName, { color: colors.foreground }]}
              numberOfLines={1}
            >
              {storeName ?? "Store"}
            </Text>
            <Text
              style={[styles.urlText, { color: colors.mutedForeground }]}
              numberOfLines={1}
            >
              {displayUrl}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: colors.secondary }]}
          onPress={handleClose}
          activeOpacity={0.75}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Browser content */}
      {Platform.OS === "web" ? (
        <View style={[styles.webFallback, { backgroundColor: colors.background }]}>
          <View style={[styles.webFallbackIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="external-link" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.webFallbackTitle, { color: colors.foreground }]}>
            {storeName ?? "Store"}
          </Text>
          <Text style={[styles.webFallbackSub, { color: colors.mutedForeground }]}>
            The in-app browser is available on iOS and Android. Tap below to
            open on this device.
          </Text>
          <TouchableOpacity
            style={[styles.openBtn, { backgroundColor: colors.primary }]}
            onPress={() => url && Linking.openURL(url)}
            activeOpacity={0.85}
          >
            <Feather name="external-link" size={16} color="#fff" />
            <Text style={styles.openBtnText}>Open website</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.backBtn, { borderColor: colors.border }]}
            onPress={handleClose}
            activeOpacity={0.75}
          >
            <Text style={[styles.backBtnText, { color: colors.foreground }]}>
              Back to CareReward
            </Text>
          </TouchableOpacity>
        </View>
      ) : WebView ? (
        <View style={styles.webviewWrap}>
          {loading && !loadError && (
            <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
                Loading {storeName}…
              </Text>
            </View>
          )}
          {loadError ? (
            <View style={[styles.errorWrap, { backgroundColor: colors.background }]}>
              <Feather name="wifi-off" size={40} color={colors.mutedForeground} />
              <Text style={[styles.errorTitle, { color: colors.foreground }]}>
                Could not load page
              </Text>
              <Text style={[styles.errorSub, { color: colors.mutedForeground }]}>
                Check your connection and try again.
              </Text>
              <TouchableOpacity
                style={[styles.openBtn, { backgroundColor: colors.primary }]}
                onPress={() => url && Linking.openURL(url)}
                activeOpacity={0.85}
              >
                <Feather name="external-link" size={16} color="#fff" />
                <Text style={styles.openBtnText}>Open in browser</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <WebView
              source={{ uri: url ?? "" }}
              style={styles.webview}
              onLoadStart={() => {
                setLoading(true);
                setLoadError(false);
              }}
              onLoadEnd={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setLoadError(true);
              }}
            />
          )}
        </View>
      ) : null}

      {/* Bottom "Back to CareReward" bar */}
      {Platform.OS !== "web" && (
        <View
          style={[
            styles.bottomBar,
            {
              paddingBottom: insets.bottom + 8,
              backgroundColor: colors.card,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.backToAppBtn, { backgroundColor: colors.secondary }]}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={16} color={colors.primary} />
            <Text style={[styles.backToAppText, { color: colors.primary }]}>
              Back to CareReward
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navbar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  navLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  faviconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  navMeta: { flex: 1, gap: 1 },
  storeName: { fontSize: 14, fontWeight: "700", lineHeight: 18 },
  urlText: { fontSize: 11, lineHeight: 14 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  webviewWrap: { flex: 1 },
  webview: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 10,
  },
  loadingText: { fontSize: 14, fontWeight: "500" },
  errorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 14,
  },
  errorTitle: { fontSize: 18, fontWeight: "700" },
  errorSub: { fontSize: 13, lineHeight: 18, textAlign: "center" },
  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 14,
  },
  webFallbackIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  webFallbackTitle: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  webFallbackSub: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 4,
  },
  openBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  backBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderWidth: 1.5,
  },
  backBtnText: { fontSize: 15, fontWeight: "600" },
  bottomBar: {
    paddingTop: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  backToAppBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
  },
  backToAppText: { fontSize: 15, fontWeight: "700" },
});
