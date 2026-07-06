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

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function FinalConfirmScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { updatePoints } = useAuth();

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

  const handleConfirmAndRedeem = () => {
    updatePoints(pts);
    if (storeUrl) {
      router.replace({
        pathname: "/browser" as never,
        params: { url: storeUrl, storeName: storeName ?? "Store" },
      });
    } else {
      router.navigate("/(tabs)/rewards");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "Final Confirmation", headerBackTitle: "Back" }} />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.iconWrap, { backgroundColor: "#FEF3C7" }]}>
          <Feather name="alert-triangle" size={34} color="#D97706" />
        </View>

        <Text style={[styles.heading, { color: colors.foreground }]}>
          Final confirmation
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
            label="Points to be deducted"
            value={`${pts.toLocaleString()} pts`}
            colors={colors}
            highlight
          />
          <Divider colors={colors} />
          <SummaryRow
            label="Dollar value"
            value={`$${pts.toLocaleString()}`}
            colors={colors}
            highlight
          />
          <Divider colors={colors} />
          <SummaryRow
            label="Balance after redemption"
            value={`${rem.toLocaleString()} pts`}
            colors={colors}
          />
        </View>

        <View style={[styles.consentBox, { backgroundColor: "#FEF9EC", borderColor: "#FDE68A" }]}>
          <Feather name="info" size={14} color="#B45309" style={{ flexShrink: 0 }} />
          <Text style={[styles.consentText, { color: "#92400E" }]}>
            By confirming, your points will be redeemed and this action cannot be undone.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
          onPress={handleConfirmAndRedeem}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>Confirm and redeem</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelBtn, { borderColor: colors.border }]}
          onPress={() => router.navigate("/(tabs)/rewards")}
          activeOpacity={0.75}
        >
          <Text style={[styles.cancelBtnText, { color: colors.foreground }]}>
            Cancel
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
  consentBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  consentText: { fontSize: 13, lineHeight: 19, flex: 1 },
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
