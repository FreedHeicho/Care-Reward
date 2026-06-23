import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

import { useColors } from "@/hooks/useColors";

const MOCK_NPI_DB: Record<string, { name: string; specialty: string }> = {
  "1234567890": { name: "Dr. Sarah Johnson", specialty: "Internal Medicine" },
  "0987654321": { name: "Dr. Michael Chen", specialty: "Dermatology" },
  "1122334455": { name: "Dr. Lisa Williams", specialty: "Cardiology" },
  "5544332211": { name: "Dr. Robert Davis", specialty: "Family Medicine" },
  "9988776655": { name: "Dr. Amara Okafor", specialty: "Endocrinology" },
};

export default function SearchNpiScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [npi, setNpi] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<{ name: string; specialty: string; npi: string } | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (npi.length !== 10) return;
    setSearching(true);
    setResult(null);
    setNotFound(false);
    await new Promise((r) => setTimeout(r, 900));
    const found = MOCK_NPI_DB[npi];
    if (found) {
      setResult({ ...found, npi });
    } else {
      setNotFound(true);
    }
    setSearching(false);
  };

  const handleConfirm = () => {
    if (!result) return;
    router.push({
      pathname: "/health-records/confirm",
      params: {
        institutionId: `npi-${result.npi}`,
        institutionName: result.name,
        institutionType: "Provider",
        institutionLocation: result.specialty,
      },
    } as never);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen options={{ title: "Search by Provider ID", headerBackTitle: "Back" }} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Enter Provider NPI Number</Text>
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>
          Enter the provider's 10-digit NPI Number — a unique ID assigned to every licensed doctor.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>NPI Number</Text>
          <TextInput
            style={[styles.input, { borderColor: npi.length > 0 && npi.length !== 10 ? "#EF4444" : colors.border, backgroundColor: colors.card, color: colors.foreground }]}
            value={npi}
            onChangeText={(t) => {
              setNpi(t.replace(/\D/g, "").slice(0, 10));
              setResult(null);
              setNotFound(false);
            }}
            placeholder="e.g. 1234567890"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
            maxLength={10}
          />
          {npi.length > 0 && npi.length < 10 && (
            <Text style={styles.fieldHint}>{10 - npi.length} more digits needed</Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.searchBtn,
            { backgroundColor: npi.length === 10 ? colors.primary : colors.muted },
          ]}
          onPress={handleSearch}
          disabled={npi.length !== 10 || searching}
          activeOpacity={0.85}
        >
          {searching ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="search" size={18} color={npi.length === 10 ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.searchBtnText, { color: npi.length === 10 ? "#fff" : colors.mutedForeground }]}>
                Search
              </Text>
            </>
          )}
        </TouchableOpacity>

        {notFound && (
          <View style={[styles.errorCard, { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" }]}>
            <Feather name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>
              No provider found with that NPI Number. Please check and try again.
            </Text>
          </View>
        )}

        {result && (
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.resultIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="user" size={24} color={colors.primary} />
            </View>
            <View style={styles.resultInfo}>
              <Text style={[styles.resultName, { color: colors.foreground }]}>{result.name}</Text>
              <Text style={[styles.resultSpecialty, { color: colors.mutedForeground }]}>{result.specialty}</Text>
              <Text style={[styles.resultNpi, { color: colors.mutedForeground }]}>NPI: {result.npi}</Text>
            </View>
            <TouchableOpacity
              style={[styles.connectBtn, { backgroundColor: colors.primary }]}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.connectBtnText}>Connect</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 24, gap: 20 },
  title: { fontSize: 22, fontWeight: "800" },
  desc: { fontSize: 14, lineHeight: 20, marginTop: -8 },
  inputGroup: { gap: 8 },
  label: { fontSize: 15, fontWeight: "600" },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    letterSpacing: 2,
  },
  fieldHint: { fontSize: 12, color: "#EF4444" },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 16,
  },
  searchBtnText: { fontSize: 16, fontWeight: "700" },
  errorCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  errorText: { flex: 1, fontSize: 14, color: "#EF4444", lineHeight: 20 },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  resultIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  resultInfo: { gap: 4, alignItems: "center" },
  resultName: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  resultSpecialty: { fontSize: 14, textAlign: "center" },
  resultNpi: { fontSize: 12, textAlign: "center" },
  connectBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  connectBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
