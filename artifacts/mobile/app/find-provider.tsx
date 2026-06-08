import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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

/* ─── Mock data ─────────────────────────────────────────── */
export interface Provider {
  id: string;
  name: string;
  specialty: string;
  specialtyKey: string;
  practice: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  copay: number;
  copayType: "PCP" | "Specialist";
  acceptingNew: boolean;
  languages: string[];
  phone: string;
  bio: string;
  education: string[];
  awards: string[];
}

const PROVIDERS: Provider[] = [
  {
    id: "p-1", name: "Dr. Sarah Chen", specialty: "Primary Care", specialtyKey: "primary",
    practice: "CareAlign Medical Group", address: "120 Wellness Ave, Suite 3", distance: 0.3,
    rating: 4.9, reviewCount: 312, copay: 20, copayType: "PCP", acceptingNew: true,
    languages: ["English", "Mandarin"],
    phone: "(555) 210-4400",
    bio: "Dr. Chen specializes in preventive care and chronic disease management with 14 years of experience in primary care.",
    education: ["MD, Johns Hopkins University", "Residency, UCSF Medical Center"],
    awards: ["Top Doctor 2024", "Patient Choice Award"],
  },
  {
    id: "p-2", name: "Dr. James Rodriguez", specialty: "Cardiology", specialtyKey: "specialist",
    practice: "Heart Health Partners", address: "500 Cardio Blvd, Floor 2", distance: 1.2,
    rating: 4.8, reviewCount: 198, copay: 40, copayType: "Specialist", acceptingNew: true,
    languages: ["English", "Spanish"],
    phone: "(555) 340-7700",
    bio: "Board-certified cardiologist focusing on preventive cardiology, heart failure, and interventional procedures.",
    education: ["MD, Harvard Medical School", "Fellowship, Cleveland Clinic"],
    awards: ["Top Cardiologist 2023", "Best in Specialty 2022"],
  },
  {
    id: "p-3", name: "Dr. Emily Watson", specialty: "Dermatology", specialtyKey: "specialist",
    practice: "Skin & Wellness Center", address: "88 Park Street", distance: 0.8,
    rating: 4.6, reviewCount: 241, copay: 40, copayType: "Specialist", acceptingNew: true,
    languages: ["English"],
    phone: "(555) 188-3300",
    bio: "Specializes in medical and cosmetic dermatology, with a focus on skin cancer screening and chronic skin conditions.",
    education: ["MD, NYU Grossman School of Medicine", "Dermatology Residency, Columbia"],
    awards: [],
  },
  {
    id: "p-4", name: "Dr. Michael Park", specialty: "Orthopedics", specialtyKey: "specialist",
    practice: "Joint & Sports Medicine", address: "221 Orthopedic Way", distance: 2.1,
    rating: 4.7, reviewCount: 175, copay: 40, copayType: "Specialist", acceptingNew: false,
    languages: ["English", "Korean"],
    phone: "(555) 440-6600",
    bio: "Sports medicine and orthopedic surgery specialist. Treats joint injuries, arthritis, and performs minimally invasive procedures.",
    education: ["MD, Stanford University", "Fellowship, Hospital for Special Surgery"],
    awards: ["Top Orthopedic Surgeon 2024"],
  },
  {
    id: "p-5", name: "Dr. Lisa Thompson", specialty: "Mental Health", specialtyKey: "mental",
    practice: "Mindful Care Therapy", address: "350 Wellness Drive, Suite 12", distance: 1.5,
    rating: 5.0, reviewCount: 89, copay: 20, copayType: "PCP", acceptingNew: true,
    languages: ["English", "French"],
    phone: "(555) 590-2211",
    bio: "Licensed psychiatrist specializing in anxiety, depression, and trauma. Offers telehealth and in-person sessions.",
    education: ["MD, Yale School of Medicine", "Psychiatry Residency, Mass General"],
    awards: ["Best Psychiatrist 2023"],
  },
  {
    id: "p-6", name: "Dr. Anna Williams", specialty: "Pediatrics", specialtyKey: "primary",
    practice: "Bright Kids Health", address: "44 Elm Street", distance: 0.5,
    rating: 4.9, reviewCount: 405, copay: 20, copayType: "PCP", acceptingNew: true,
    languages: ["English"],
    phone: "(555) 720-8844",
    bio: "Pediatrician caring for infants through adolescents. Expert in childhood development, vaccinations, and chronic conditions.",
    education: ["MD, Duke University", "Pediatrics Residency, Children's Hospital of Philadelphia"],
    awards: ["Top Pediatrician 2022", "Patient Choice Award"],
  },
  {
    id: "p-7", name: "Dr. David Johnson", specialty: "Endocrinology", specialtyKey: "specialist",
    practice: "Metro Diabetes Center", address: "900 Endocrine Ave", distance: 3.2,
    rating: 4.4, reviewCount: 132, copay: 40, copayType: "Specialist", acceptingNew: true,
    languages: ["English"],
    phone: "(555) 831-5500",
    bio: "Endocrinologist with deep expertise in diabetes, thyroid disorders, and metabolic disease management.",
    education: ["MD, Vanderbilt University", "Endocrinology Fellowship, Mayo Clinic"],
    awards: [],
  },
  {
    id: "p-8", name: "Dr. Maria Garcia", specialty: "Internal Medicine", specialtyKey: "primary",
    practice: "CareAlign Medical Group", address: "120 Wellness Ave, Suite 7", distance: 0.3,
    rating: 4.7, reviewCount: 287, copay: 20, copayType: "PCP", acceptingNew: true,
    languages: ["English", "Spanish"],
    phone: "(555) 210-4401",
    bio: "Internal medicine physician focused on adult primary care, preventive screenings, and managing complex chronic conditions.",
    education: ["MD, University of Miami", "Residency, Mount Sinai Hospital"],
    awards: [],
  },
  {
    id: "p-9", name: "Dr. Thomas Lee", specialty: "Ophthalmology", specialtyKey: "specialist",
    practice: "Clear Vision Center", address: "15 Vision Plaza", distance: 1.9,
    rating: 4.6, reviewCount: 201, copay: 40, copayType: "Specialist", acceptingNew: true,
    languages: ["English", "Cantonese"],
    phone: "(555) 970-3344",
    bio: "Ophthalmologist treating cataracts, glaucoma, macular degeneration, and providing comprehensive eye care.",
    education: ["MD, University of Michigan", "Ophthalmology Residency, Bascom Palmer"],
    awards: ["Excellence in Eye Care 2023"],
  },
  {
    id: "p-10", name: "Dr. Kevin Brown", specialty: "Family Medicine", specialtyKey: "primary",
    practice: "Family First Health", address: "78 Oak Lane", distance: 0.7,
    rating: 4.5, reviewCount: 338, copay: 20, copayType: "PCP", acceptingNew: true,
    languages: ["English"],
    phone: "(555) 650-1122",
    bio: "Family medicine physician providing comprehensive care for patients of all ages. Special interest in lifestyle medicine.",
    education: ["MD, Emory University School of Medicine", "Family Medicine Residency, UCSF"],
    awards: [],
  },
];

const SPECIALTIES = [
  { key: "all", label: "All" },
  { key: "primary", label: "Primary Care" },
  { key: "specialist", label: "Specialists" },
  { key: "mental", label: "Mental Health" },
];

/* ─── Provider card ──────────────────────────────────────── */
function ProviderCard({
  provider,
  favorited,
  onFavorite,
}: {
  provider: Provider;
  favorited: boolean;
  onFavorite: () => void;
}) {
  const colors = useColors();
  const router = useRouter();

  const initials = provider.name
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarColors = [
    "#05503C", "#2563EB", "#7C3AED", "#D97706", "#0891B2", "#DC2626",
  ];
  const avatarBg = avatarColors[parseInt(provider.id.split("-")[1]) % avatarColors.length];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/provider/${provider.id}` as never)}
      activeOpacity={0.8}
    >
      <View style={styles.cardTop}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.providerName, { color: colors.foreground }]} numberOfLines={1}>
              {provider.name}
            </Text>
            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onFavorite();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather
                name={favorited ? "heart" : "heart"}
                size={17}
                color={favorited ? "#DC2626" : colors.border}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.specialty, { color: colors.mutedForeground }]}>
            {provider.specialty} · {provider.practice}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={11} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {provider.distance} mi
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="star" size={11} color="#F59E0B" />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {provider.rating} ({provider.reviewCount})
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        {/* Copay badge */}
        <View style={[styles.copayBadge, { backgroundColor: colors.primary + "15" }]}>
          <Feather name="dollar-sign" size={12} color={colors.primary} />
          <Text style={[styles.copayText, { color: colors.primary }]}>
            ${provider.copay} copay
          </Text>
        </View>

        {/* In-network badge */}
        <View style={[styles.networkBadge, { backgroundColor: "#DCFCE7" }]}>
          <Feather name="check-circle" size={12} color="#16A34A" />
          <Text style={[styles.networkText, { color: "#16A34A" }]}>In-Network</Text>
        </View>

        {/* Accepting badge */}
        {provider.acceptingNew ? (
          <View style={[styles.acceptBadge, { backgroundColor: "#DBEAFE" }]}>
            <Text style={[styles.acceptText, { color: "#2563EB" }]}>Accepting</Text>
          </View>
        ) : (
          <View style={[styles.acceptBadge, { backgroundColor: "#FEE2E2" }]}>
            <Text style={[styles.acceptText, { color: "#DC2626" }]}>Waitlist</Text>
          </View>
        )}

        <View style={styles.spacer} />
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      </View>
    </TouchableOpacity>
  );
}

/* ─── Screen ──────────────────────────────────────────────── */
export default function FindProviderScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return PROVIDERS.filter((p) => {
      const matchSpec = specialty === "all" || p.specialtyKey === specialty;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.specialty.toLowerCase().includes(q) ||
        p.practice.toLowerCase().includes(q);
      return matchSpec && matchSearch;
    }).sort((a, b) => a.distance - b.distance);
  }, [search, specialty]);

  const toggleFav = async (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search by name, specialty, or practice…"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {/* Specialty chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {SPECIALTIES.map((s) => {
            const active = specialty === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.muted,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSpecialty(s.key);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, { color: active ? "#fff" : colors.foreground }]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Result count + favorite count */}
        <View style={styles.resultsMeta}>
          <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
            {filtered.length} in-network provider{filtered.length !== 1 ? "s" : ""} near you
          </Text>
          {favorites.size > 0 && (
            <View style={[styles.favChip, { backgroundColor: "#FEE2E2" }]}>
              <Feather name="heart" size={11} color="#DC2626" />
              <Text style={[styles.favChipText, { color: "#DC2626" }]}>
                {favorites.size} saved
              </Text>
            </View>
          )}
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="search" size={32} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No providers found</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Try a different specialty or search term
            </Text>
          </View>
        ) : (
          filtered.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              favorited={favorites.has(p.id)}
              onFavorite={() => toggleFav(p.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 10, borderBottomWidth: 1 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14 },
  chips: { gap: 8, paddingBottom: 2 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "600" },

  list: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  resultsMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  resultCount: { fontSize: 13 },
  favChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  favChipText: { fontSize: 12, fontWeight: "600" },

  card: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 12 },
  cardTop: { flexDirection: "row", gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  cardInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  providerName: { fontSize: 15, fontWeight: "700", flex: 1 },
  specialty: { fontSize: 12, lineHeight: 16 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 2 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12 },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  copayBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  copayText: { fontSize: 12, fontWeight: "700" },
  networkBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  networkText: { fontSize: 12, fontWeight: "600" },
  acceptBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  acceptText: { fontSize: 12, fontWeight: "600" },
  spacer: { flex: 1 },

  empty: { paddingTop: 60, alignItems: "center", gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center" },
});
