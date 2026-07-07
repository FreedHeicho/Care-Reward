import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const STORES = [
  {
    id: "amazon",
    name: "Amazon FSA Store",
    icon: "shopping-bag" as const,
    description: "FSA/HSA-eligible products on Amazon",
    url: "https://www.amazon.com/b/?node=122265875011",
  },
  {
    id: "cvs",
    name: "CVS HSA/FSA Shop",
    icon: "heart" as const,
    description: "HSA/FSA items at CVS Pharmacy",
    url: "https://www.cvs.com/shop/merch/shop-all/q/true/fs?widgetID=n918nxj7&mc=0?icid=shop-hsa-fsa-shop-all",
  },
  {
    id: "fsastore",
    name: "FSA Store",
    icon: "package" as const,
    description: "Dedicated FSA-eligible product store",
    url: "https://fsastore.com/?srsltid=AfmBOoovm7oOs-wswDVBNykp2okYnK1k18rJAZpFXEtToDcyUHBhJMIJ",
  },
];

export default function GiftcardAllocationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const balance = user?.pointsBalance ?? 0;

  const [pctText, setPctText] = useState("");
  const [ptsText, setPtsText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [allocationConfirmed, setAllocationConfirmed] = useState(false);
  const [confirmedPts, setConfirmedPts] = useState(0);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const onPctChange = (text: string) => {
    setPctText(text);
    setError(null);
    setAllocationConfirmed(false);
    const pct = parseFloat(text);
    if (!isNaN(pct) && balance > 0) {
      setPtsText(Math.round((pct / 100) * balance).toString());
    } else if (text === "") {
      setPtsText("");
    }
  };

  const onPtsChange = (text: string) => {
    setPtsText(text);
    setError(null);
    setAllocationConfirmed(false);
    const pts = parseFloat(text);
    if (!isNaN(pts) && balance > 0) {
      setPctText(((pts / balance) * 100).toFixed(1));
    } else if (text === "") {
      setPctText("");
    }
  };

  const handleOk = () => {
    const pts = parseInt(ptsText, 10);
    if (isNaN(pts) || pts <= 0) {
      setError("Please enter a valid number of points.");
      return;
    }
    if (pts > balance) {
      setError("You don't have enough points for this allocation.");
      return;
    }
    setConfirmedPts(pts);
    setAllocationConfirmed(true);
    setError(null);
  };

  const store = STORES.find((s) => s.id === selectedStore);
  const canProceed = allocationConfirmed && selectedStore !== null;

  const handleProceed = () => {
    if (!store || !canProceed) return;
    router.push({
      pathname: "/redeem/confirm" as never,
      params: {
        option: "gift-card",
        label: "Healthcare Savings Giftcards",
        points: String(confirmedPts),
        remaining: String(balance - confirmedPts),
        storeUrl: store.url,
        storeName: store.name,
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ title: "Healthcare Giftcards", headerBackTitle: "Back" }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. Points available */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
              Points Available
            </Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>
              {balance.toLocaleString()} pts
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Rate</Text>
            <Text style={[styles.infoValue, { color: colors.primary }]}>1 point = $1</Text>
          </View>
        </View>

        {/* 2. Points to allocate */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.foreground }]}>
            Points to Allocate
          </Text>
          <View style={styles.inputRow}>
            <View style={styles.inputColumn}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Points</Text>
              <View style={[styles.inputWrap, { borderColor: allocationConfirmed ? colors.primary : colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  value={ptsText}
                  onChangeText={onPtsChange}
                />
                <Text style={[styles.inputUnit, { color: colors.mutedForeground }]}>pts</Text>
              </View>
            </View>
            <Text style={[styles.orText, { color: colors.mutedForeground }]}>or</Text>
            <View style={styles.inputColumn}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Percentage</Text>
              <View style={[styles.inputWrap, { borderColor: allocationConfirmed ? colors.primary : colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                  value={pctText}
                  onChangeText={onPctChange}
                />
                <Text style={[styles.inputUnit, { color: colors.mutedForeground }]}>%</Text>
              </View>
            </View>
          </View>
          {error && (
            <View style={styles.errorRow}>
              <Feather name="alert-circle" size={14} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {allocationConfirmed && (
            <View style={[styles.allocConfirmedRow, { backgroundColor: colors.secondary }]}>
              <Feather name="check-circle" size={14} color={colors.primary} />
              <Text style={[styles.allocConfirmedText, { color: colors.primary }]}>
                {confirmedPts.toLocaleString()} pts (${confirmedPts.toLocaleString()}) confirmed
              </Text>
            </View>
          )}
        </View>

        {/* 3. OK button */}
        <TouchableOpacity
          style={[
            styles.okBtn,
            {
              backgroundColor: allocationConfirmed ? colors.secondary : colors.primary,
              borderWidth: allocationConfirmed ? 1.5 : 0,
              borderColor: allocationConfirmed ? colors.primary : "transparent",
            },
          ]}
          onPress={handleOk}
          activeOpacity={0.85}
        >
          {allocationConfirmed ? (
            <>
              <Feather name="check" size={16} color={colors.primary} />
              <Text style={[styles.okBtnText, { color: colors.primary }]}>
                Amount confirmed
              </Text>
            </>
          ) : (
            <Text style={styles.okBtnText}>OK</Text>
          )}
        </TouchableOpacity>

        {/* 4. Store selection — always shown below allocation */}
        <View style={styles.storeSection}>
          <Text style={[styles.storeSectionTitle, { color: colors.foreground }]}>
            Choose your store
          </Text>
          {!allocationConfirmed && (
            <Text style={[styles.storeSectionHint, { color: colors.mutedForeground }]}>
              Confirm your allocation above first.
            </Text>
          )}
          <View style={styles.storeList}>
            {STORES.map((s) => {
              const isSelected = selectedStore === s.id;
              const disabled = !allocationConfirmed;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.storeCard,
                    {
                      backgroundColor: isSelected ? colors.secondary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                      opacity: disabled ? 0.45 : 1,
                    },
                  ]}
                  onPress={() => {
                    if (!disabled) setSelectedStore(s.id);
                  }}
                  activeOpacity={disabled ? 1 : 0.85}
                >
                  <View
                    style={[
                      styles.storeIconBox,
                      {
                        backgroundColor: isSelected
                          ? colors.primary + "20"
                          : colors.secondary,
                      },
                    ]}
                  >
                    <Feather
                      name={s.icon}
                      size={20}
                      color={isSelected ? colors.primary : colors.mutedForeground}
                    />
                  </View>
                  <View style={styles.storeInfo}>
                    <Text
                      style={[styles.storeName, { color: colors.foreground }]}
                      numberOfLines={1}
                    >
                      {s.name}
                    </Text>
                    <Text
                      style={[styles.storeDesc, { color: colors.mutedForeground }]}
                      numberOfLines={2}
                    >
                      {s.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <Feather
                      name="check-circle"
                      size={20}
                      color={colors.primary}
                      style={{ flexShrink: 0 }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 5. Take me to the website */}
        <TouchableOpacity
          style={[
            styles.proceedBtn,
            {
              backgroundColor: canProceed ? colors.primary : colors.border,
            },
          ]}
          onPress={handleProceed}
          activeOpacity={canProceed ? 0.85 : 1}
          disabled={!canProceed}
        >
          <Feather
            name="external-link"
            size={18}
            color={canProceed ? "#fff" : colors.mutedForeground}
          />
          <Text
            style={[
              styles.proceedBtnText,
              { color: canProceed ? "#fff" : colors.mutedForeground },
            ]}
          >
            Take me to the website
          </Text>
        </TouchableOpacity>
        {!canProceed && (
          <Text style={[styles.proceedHint, { color: colors.mutedForeground }]}>
            {!allocationConfirmed
              ? "Enter and confirm your allocation first."
              : "Select a store above to continue."}
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 20, gap: 16 },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 4,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLabel: { fontSize: 14, fontWeight: "500" },
  infoValue: { fontSize: 15, fontWeight: "700" },
  divider: { height: 1 },
  inputSection: {
    gap: 12,
  },
  inputLabel: { fontSize: 16, fontWeight: "700" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  inputColumn: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  input: { flex: 1, fontSize: 18, fontWeight: "700" },
  inputUnit: { fontSize: 14, fontWeight: "600" },
  orText: { fontSize: 13, fontWeight: "600", paddingBottom: 14 },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  errorText: { color: "#DC2626", fontSize: 13, flex: 1 },
  allocConfirmedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  allocConfirmedText: { fontSize: 13, fontWeight: "600" },
  okBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 0,
  },
  okBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  storeSection: { gap: 10 },
  storeSectionTitle: { fontSize: 17, fontWeight: "800" },
  storeSectionHint: { fontSize: 13, lineHeight: 18 },
  storeList: { gap: 10 },
  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    gap: 12,
  },
  storeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  storeInfo: { flex: 1, gap: 3 },
  storeName: { fontSize: 14, fontWeight: "700", lineHeight: 18 },
  storeDesc: { fontSize: 12, lineHeight: 16 },
  proceedBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
  },
  proceedBtnText: { fontSize: 17, fontWeight: "700" },
  proceedHint: {
    fontSize: 12,
    textAlign: "center",
    marginTop: -8,
  },
});
