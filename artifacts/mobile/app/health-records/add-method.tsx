import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function AddMethodScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 32 }]}>
      <Stack.Screen options={{ title: "Add Your Health Care Provider", headerBackTitle: "Back" }} />

      <View style={styles.inner}>
        <Text style={[styles.title, { color: colors.foreground }]}>How would you like to search?</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Choose how you want to find and connect your health records.
        </Text>

        <View style={styles.options}>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/health-records/search-npi" as never)}
            activeOpacity={0.8}
          >
            <View style={[styles.cardIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="hash" size={28} color={colors.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Search by Provider ID</Text>
              <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
                Connect directly to a specific doctor using their NPI Number — a unique ID assigned to every licensed provider.
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/health-records/search-institution" as never)}
            activeOpacity={0.8}
          >
            <View style={[styles.cardIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="home" size={28} color={colors.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                Search by Hospital, Clinic, Health System or Pharmacy
              </Text>
              <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
                Find and connect an institution by name to retrieve your records from that source.
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 20, paddingTop: 24, gap: 24 },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: -12 },
  options: { gap: 14 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardDesc: { fontSize: 13, lineHeight: 19 },
});
