import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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
import { NPPESProvider, searchNPPES } from "@/services/nppesApi";

export default function SearchNpiScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router  = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [npi,       setNpi]       = useState("");

  const [searching,   setSearching]   = useState(false);
  const [results,     setResults]     = useState<NPPESProvider[] | null>(null);
  const [resultCount, setResultCount] = useState(0);
  const [submitted,   setSubmitted]   = useState(false);
  const [apiError,    setApiError]    = useState<string | null>(null);
  const [formError,   setFormError]   = useState<string | null>(null);

  const searchingRef = useRef(false);

  const npiInvalid = npi.length > 0 && npi.length !== 10;

  const reset = () => {
    setResults(null);
    setSubmitted(false);
    setApiError(null);
    setFormError(null);
  };

  const handleSearch = async () => {
    if (searchingRef.current) return;

    setFormError(null);
    setApiError(null);

    if (npiInvalid) return;

    const hasNpi      = npi.length === 10;
    const hasLastName = lastName.trim().length > 0;

    if (!hasNpi && !hasLastName) {
      setFormError("Please enter a last name or NPI number to search.");
      return;
    }

    searchingRef.current = true;
    setSearching(true);
    setResults(null);
    setSubmitted(false);

    try {
      const data = await searchNPPES({
        npi:       hasNpi                        ? npi : undefined,
        lastName:  hasLastName                   ? lastName  : undefined,
        firstName: firstName.trim() || undefined,
      });
      setResults(data.providers);
      setResultCount(data.count);
      setSubmitted(true);
    } catch {
      setApiError("Could not reach the provider registry. Check your connection and try again.");
      setSubmitted(false);
    } finally {
      setSearching(false);
      searchingRef.current = false;
    }
  };

  const handleConnect = (p: NPPESProvider) => {
    router.push({
      pathname: "/health-records/confirm",
      params: {
        institutionId:       `npi-${p.npi}`,
        institutionName:     p.fullName,
        institutionType:     "Provider",
        institutionLocation: `${p.specialty} · ${p.location}`,
      },
    } as never);
  };

  const canSearch = !npiInvalid && !searching;

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
              placeholder="e.g. James"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="words"
            />
          </View>
          <View style={[styles.inputGroup, styles.nameField]}>
            <Text style={[styles.label, { color: colors.foreground }]}>Last name</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
              value={lastName}
              onChangeText={(t) => { setLastName(t.replace(/[^a-zA-Z\s'-]/g, "")); reset(); }}
              placeholder="e.g. Williams"
              placeholderTextColor={colors.mutedForeground}
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
              { borderColor: npiInvalid ? "#EF4444" : colors.border, backgroundColor: colors.card, color: colors.foreground },
            ]}
            value={npi}
            onChangeText={(t) => { setNpi(t.replace(/\D/g, "").slice(0, 10)); reset(); }}
            placeholder="e.g. 1003000207"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
            maxLength={10}
          />
          {npiInvalid ? (
            <Text style={styles.errorInline}>NPI number must be exactly 10 digits.</Text>
          ) : (
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              The NPI is a unique 10-digit ID assigned to every licensed provider.
            </Text>
          )}
        </View>

        {/* Form validation error */}
        {formError && (
          <View style={[styles.alertCard, { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" }]}>
            <Feather name="alert-circle" size={15} color="#EF4444" />
            <Text style={styles.alertText}>{formError}</Text>
          </View>
        )}

        {/* Search button */}
        <TouchableOpacity
          style={[styles.searchBtn, { backgroundColor: canSearch ? colors.primary : colors.muted }]}
          onPress={handleSearch}
          disabled={!canSearch}
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

        {/* API error */}
        {apiError && (
          <View style={[styles.alertCard, { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" }]}>
            <Feather name="wifi-off" size={15} color="#EF4444" />
            <View style={styles.alertBody}>
              <Text style={styles.alertText}>{apiError}</Text>
              <TouchableOpacity onPress={handleSearch} activeOpacity={0.75} style={styles.retryBtn}>
                <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* No results */}
        {submitted && results !== null && results.length === 0 && (
          <View style={[styles.alertCard, { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" }]}>
            <Feather name="alert-circle" size={15} color="#EF4444" />
            <Text style={styles.alertText}>
              No providers found. Check the details and try again.
            </Text>
          </View>
        )}

        {/* Results */}
        {submitted && results !== null && results.length > 0 && (
          <View style={styles.resultsList}>
            <Text style={[styles.resultsHeader, { color: colors.mutedForeground }]}>
              {resultCount} provider{resultCount !== 1 ? "s" : ""} found
              {resultCount > results.length ? ` · showing first ${results.length}` : ""}
            </Text>
            {results.map((p) => (
              <TouchableOpacity
                key={p.npi}
                style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleConnect(p)}
                activeOpacity={0.8}
              >
                <View style={[styles.resultIcon, { backgroundColor: colors.secondary }]}>
                  <Feather name="user" size={22} color={colors.primary} />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { color: colors.foreground }]} numberOfLines={2}>
                    {p.fullName}
                  </Text>
                  <Text style={[styles.resultDetail, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {p.specialty}
                  </Text>
                  <Text style={[styles.resultDetail, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {p.location}
                  </Text>
                  {p.phone ? (
                    <Text style={[styles.resultDetail, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {p.phone}
                    </Text>
                  ) : null}
                  <Text style={[styles.resultNpi, { color: colors.mutedForeground }]}>
                    NPI: {p.npi}
                  </Text>
                </View>
                <View style={[styles.connectBtn, { backgroundColor: colors.primary }]}>
                  <Text style={styles.connectBtnText}>Connect</Text>
                  <Feather name="chevron-right" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
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
  hint: { fontSize: 12, lineHeight: 16 },
  errorInline: { fontSize: 12, color: "#EF4444" },

  alertCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  alertBody: { flex: 1, gap: 6 },
  alertText: { flex: 1, fontSize: 13, color: "#EF4444", lineHeight: 18 },
  retryBtn: { alignSelf: "flex-start" },
  retryText: { fontSize: 13, fontWeight: "700" },

  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 16,
  },
  searchBtnText: { fontSize: 16, fontWeight: "700" },

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
    paddingHorizontal: 12,
    alignItems: "center",
    flexShrink: 0,
    flexDirection: "row",
    gap: 2,
  },
  connectBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
