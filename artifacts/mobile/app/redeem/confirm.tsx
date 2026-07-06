import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function RedeemConfirmScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { option, points, remaining, label, storeUrl, storeName } =
    useLocalSearchParams<{
      option: string;
      points: string;
      remaining: string;
      label: string;
      storeUrl?: string;
      storeName?: string;
    }>();

  const pts = parseInt(points ?? "0", 10);
  const rem = parseInt(remaining ?? "0", 10);

  const handleConfirm = () => {
    router.push({
      pathname: "/redeem/final-confirm" as never,
      params: { option, points, remaining, label, storeUrl, storeName },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "Confirm Redemption", headerBackTitle: "Back" }} />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
          <Feather name="check-circle" size={36} color={colors.primary} />
        </View>

        <Text style={[styles.heading, { color: colors.foreground }]}>
          Review your redemption
        </Text>
        <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
          Please review the details below before confirming.
        </Text>

        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SummaryRow label="Redemption option" value={label ?? option ?? ""} colors={colors} />
          <Divider colors={colors} />
          {storeName ? (
            <>
              <SummaryRow label="Store" value={storeName} colors={colors} />
              <Divider colors={colors} />
            </>
          ) : null}
          <SummaryRow
            label="Points to redeem"
            value={`${pts.toLocaleString()} pts`}
            colors={colors}
            highlight
          />
          <Divider colors={colors} />
          <SummaryRow
            label="Dollar equivalent"
            value={`$${pts.toLocaleString()}`}
            colors={colors}
            highlight
          />
          <Divider colors={colors} />
          <SummaryRow
            label="Remaining balance"
            value={`${rem.toLocaleString()} pts`}
            colors={colors}
          />
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
          onPress={handleConfirm}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>Confirm redemption</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelBtn, { borderColor: colors.border }]}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <Text style={[styles.cancelBtnText, { color: colors.foreground }]}>
            Go back
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  colors,
  highlight,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  highlight?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.mutedForeground }]} numberOfLines={2}>
        {label}
      </Text>
      <Text
        style={[
          styles.rowValue,
          { color: highlight ? colors.primary : colors.foreground },
        ]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function Divider({ colors }: { colors: ReturnType<typeof import("@/hooks/useColors").useColors> }) {
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
    alignItems: "center",
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  subheading: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  summaryCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowLabel: { fontSize: 14, fontWeight: "500", flex: 1 },
  rowValue: { fontSize: 15, fontWeight: "700", textAlign: "right", flexShrink: 0 },
  divider: { height: 1 },
  confirmBtn: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  confirmBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  cancelBtn: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1.5,
  },
  cancelBtnText: { fontSize: 16, fontWeight: "600" },
});
