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

const MOCK_PROVIDERS = [
  { npi: "1234567890", firstName: "Sarah",   lastName: "Johnson",  specialty: "Internal Medicine", location: "Chicago, IL" },
  { npi: "0987654321", firstName: "Michael", lastName: "Chen",     specialty: "Dermatology",       location: "San Francisco, CA" },
  { npi: "1122334455", firstName: "Lisa",    lastName: "Williams", specialty: "Cardiology",         location: "Houston, TX" },
  { npi: "5544332211", firstName: "Robert",  lastName: "Davis",    specialty: "Family Medicine",    location: "Austin, TX" },
  { npi: "9988776655", firstName: "Amara",   lastName: "Okafor",   specialty: "Endocrinology",      location: "Atlanta, GA" },
];

type Provider = (typeof MOCK_PROVIDERS)[number];

function searchProviders(first: string, last: string, npi: string): Provider[] {
  const f = first.trim().toLowerCase();
  const l = last.trim().toLowerCase();
  const n = npi.trim();
  if (!f && !l && !n) return [];
  return MOCK_PROVIDERS.filter((p) => {
    const firstOk = f ? p.firstName.toLowerCase().startsWith(f) : true;
    const lastOk  = l ? p.lastName.toLowerCase().startsWith(l)  : true;
    if (n) return p.npi === n && firstOk && lastOk;
    return firstOk && lastOk;
  });
}

export default function SearchNpiScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const router  = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [npi,       setNpi]       = useState("");

  const [searching, setSearching] = useState(false);
  const [results,   setResults]   = useState<Provider[] | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const npiInvalid = npi.length > 0 && npi.length !== 10;
  const canSearch  =
    !npiInvalid && ((firstName.trim() || lastName.trim()) || npi.length === 10);

  const handleSearch = async () => {
    if (!canSearch) return;
    setSearching(true);
    setResults(null);
    setSubmitted(false);
    await new Promise((r) => setTimeout(r, 800));
    setResults(searchProviders(firstName, lastName, npi));
    setSubmitted(true);
    setSearching(false);
  };

  const handleConnect = (p: Provider) => {
    router.push({
      pathname: "/health-records/confirm",
      params: {
        institutionId: `npi-${p.npi}`,
        institutionName: `Dr. ${p.firstName} ${p.lastName}`,
        institutionType: "Provider",
        institutionLocation: `${p.specialty} · ${p.location}`,
      },
    } as never);
  };

  const reset = () => {
    setResults(null);
    setSubmitted(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen options={{ title: "Find Your Provider", headerBackTitle: "Back" }} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Find Your Provider</Text>
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>
          Search by your doctor's name, NPI number, or both for the most accurate results.
        </Text>

        {/* Name row */}
        <View style={styles.nameRow}>
          <View style={[styles.inputGroup, styles.nameField]}>
            <Text style={[styles.label, { color: colors.foreground }]}>First name</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
              value={firstName}
              onChangeText={(t) => { setFirstName(t.replace(/[^a-zA-Z\s'-]/g, "")); reset(); }}
              placeholder="e.g. Sarah"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="default"
              autoCapitalize="words"
            />
          </View>
          <View style={[styles.inputGroup, styles.nameField]}>
            <Text style={[styles.label, { color: colors.foreground }]}>Last name</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
              value={lastName}
              onChangeText={(t) => { setLastName(t.replace(/[^a-zA-Z\s'-]/g, "")); reset(); }}
              placeholder="e.g. Johnson"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="default"
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* NPI field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>NPI number</Text>
          <TextInput
            style={[
              styles.input,
              styles.npiInput,
              {
                borderColor: npiInvalid ? "#EF4444" : colors.border,
                backgroundColor: colors.card,
                color: colors.foreground,
              },
            ]}
            value={npi}
            onChangeText={(t) => { setNpi(t.replace(/\D/g, "").slice(0, 10)); reset(); }}
            placeholder="e.g. 1234567890"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
            maxLength={10}
          />
          {npiInvalid ? (
            <Text style={styles.npiError}>NPI number must be exactly 10 digits.</Text>
          ) : (
            <Text style={[styles.npiHint, { color: colors.mutedForeground }]}>
              The NPI is a unique 10-digit ID assigned to every licensed doctor.
            </Text>
          )}
        </View>

        {/* Search button */}
        <TouchableOpacity
          style={[
            styles.searchBtn,
            { backgroundColor: canSearch ? colors.primary : colors.muted },
          ]}
          onPress={handleSearch}
          disabled={!canSearch || searching}
          activeOpacity={0.85}
        >
          {searching ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="search" size={18} color={canSearch ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.searchBtnText, { color: canSearch ? "#fff" : colors.mutedForeground }]}>
                Search
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* No results */}
        {submitted && results !== null && results.length === 0 && (
          <View style={[styles.errorCard, { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" }]}>
            <Feather name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>
              No provider found. Please check the details and try again.
            </Text>
          </View>
        )}

        {/* Results */}
        {results !== null && results.length > 0 && (
          <View style={styles.resultsList}>
            <Text style={[styles.resultsHeader, { color: colors.mutedForeground }]}>
              {results.length} provider{results.length !== 1 ? "s" : ""} found
            </Text>
            {results.map((p) => (
              <View
                key={p.npi}
                style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.resultIcon, { backgroundColor: colors.secondary }]}>
                  <Feather name="user" size={22} color={colors.primary} />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { color: colors.foreground }]}>
                    Dr. {p.firstName} {p.lastName}
                  </Text>
                  <Text style={[styles.resultDetail, { color: colors.mutedForeground }]}>
                    {p.specialty}
                  </Text>
                  <Text style={[styles.resultDetail, { color: colors.mutedForeground }]}>
                    {p.location}
                  </Text>
                  <Text style={[styles.resultNpi, { color: colors.mutedForeground }]}>
                    NPI: {p.npi}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.connectBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handleConnect(p)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.connectBtnText}>Connect</Text>
                </TouchableOpacity>
              </View>
            ))}
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

  nameRow: { flexDirection: "row", gap: 12 },
  nameField: { flex: 1 },

  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600" },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  npiInput: { letterSpacing: 2 },
  npiHint: { fontSize: 12, lineHeight: 16 },
  npiError: { fontSize: 12, color: "#EF4444" },

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

  resultsList: { gap: 10 },
  resultsHeader: { fontSize: 13, fontWeight: "600" },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  resultInfo: { flex: 1, gap: 2 },
  resultName: { fontSize: 15, fontWeight: "700", lineHeight: 20 },
  resultDetail: { fontSize: 13, lineHeight: 18 },
  resultNpi: { fontSize: 11, marginTop: 2 },
  connectBtn: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    flexShrink: 0,
  },
  connectBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
