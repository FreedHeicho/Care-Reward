import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState, useMemo } from "react";
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

import { useColors } from "@/hooks/useColors";

const MOCK_INSTITUTIONS = [
  { id: "inst-1", name: "Kaiser Permanente - Maryland/Virginia", type: "Health System", location: "Baltimore, MD" },
  { id: "inst-2", name: "Johns Hopkins Hospital", type: "Hospital", location: "Baltimore, MD" },
  { id: "inst-3", name: "CVS Pharmacy", type: "Pharmacy", location: "Various Locations" },
  { id: "inst-4", name: "Mayo Clinic", type: "Health System", location: "Rochester, MN" },
  { id: "inst-5", name: "Walgreens", type: "Pharmacy", location: "Various Locations" },
  { id: "inst-6", name: "Cleveland Clinic", type: "Hospital", location: "Cleveland, OH" },
  { id: "inst-7", name: "MedStar Health", type: "Health System", location: "Washington, DC" },
  { id: "inst-8", name: "Adventist HealthCare", type: "Health System", location: "Rockville, MD" },
  { id: "inst-9", name: "Inova Health System", type: "Health System", location: "Falls Church, VA" },
  { id: "inst-10", name: "UPMC Health System", type: "Health System", location: "Pittsburgh, PA" },
  { id: "inst-11", name: "Geisinger Health", type: "Health System", location: "Danville, PA" },
  { id: "inst-12", name: "Rite Aid Pharmacy", type: "Pharmacy", location: "Various Locations" },
  { id: "inst-13", name: "Mercy Health", type: "Health System", location: "Cincinnati, OH" },
  { id: "inst-14", name: "Northwestern Medicine", type: "Hospital", location: "Chicago, IL" },
  { id: "inst-15", name: "UC Davis Health", type: "Hospital", location: "Sacramento, CA" },
  { id: "inst-16", name: "NYU Langone Health", type: "Hospital", location: "New York, NY" },
  { id: "inst-17", name: "Houston Methodist", type: "Hospital", location: "Houston, TX" },
  { id: "inst-18", name: "Optum Clinics", type: "Clinic", location: "Various Locations" },
];

const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  Hospital: { color: "#3B82F6", bg: "#DBEAFE" },
  "Health System": { color: "#8B5CF6", bg: "#EDE9FE" },
  Pharmacy: { color: "#10B981", bg: "#D1FAE5" },
  Clinic: { color: "#F59E0B", bg: "#FEF3C7" },
};

export default function SearchInstitutionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return MOCK_INSTITUTIONS.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = (inst: typeof MOCK_INSTITUTIONS[0]) => {
    router.push({
      pathname: "/health-records/confirm",
      params: {
        institutionId: inst.id,
        institutionName: inst.name,
        institutionType: inst.type,
        institutionLocation: inst.location,
      },
    } as never);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen options={{ title: "Search Institution", headerBackTitle: "Back" }} />
      <View style={[styles.searchBar, { borderBottomColor: colors.border }]}>
        <Feather name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          value={query}
          onChangeText={setQuery}
          placeholder="Hospital, clinic, health system or pharmacy..."
          placeholderTextColor={colors.mutedForeground}
          autoFocus
          autoCapitalize="none"
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Feather name="x" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {query.length === 0 ? (
        <View style={styles.promptWrap}>
          <Feather name="search" size={36} color={colors.mutedForeground} />
          <Text style={[styles.promptText, { color: colors.mutedForeground }]}>
            Start typing to search for hospitals, clinics, health systems, or pharmacies.
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.promptWrap}>
          <Feather name="alert-circle" size={36} color={colors.mutedForeground} />
          <Text style={[styles.promptText, { color: colors.mutedForeground }]}>
            No results for "{query}". Try a different name.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
            {results.length} result{results.length !== 1 ? "s" : ""}
          </Text>
          {results.map((inst) => {
            const tc = TYPE_COLORS[inst.type] ?? TYPE_COLORS.Hospital;
            return (
              <TouchableOpacity
                key={inst.id}
                style={[styles.resultRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleSelect(inst)}
                activeOpacity={0.75}
              >
                <View style={[styles.resultIcon, { backgroundColor: tc.bg }]}>
                  <Feather
                    name={inst.type === "Pharmacy" ? "package" : inst.type === "Clinic" ? "home" : "activity"}
                    size={20}
                    color={tc.color}
                  />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { color: colors.foreground }]}>{inst.name}</Text>
                  <View style={styles.resultMeta}>
                    <View style={[styles.typeBadge, { backgroundColor: tc.bg }]}>
                      <Text style={[styles.typeBadgeText, { color: tc.color }]}>{inst.type}</Text>
                    </View>
                    <Text style={[styles.resultLocation, { color: colors.mutedForeground }]}>
                      {inst.location}
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 16 },
  promptWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  promptText: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  list: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  resultCount: { fontSize: 13, fontWeight: "500", marginBottom: 2 },
  resultRow: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  resultInfo: { flex: 1, gap: 6 },
  resultName: { fontSize: 15, fontWeight: "600" },
  resultMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  typeBadgeText: { fontSize: 11, fontWeight: "600" },
  resultLocation: { fontSize: 12 },
});
