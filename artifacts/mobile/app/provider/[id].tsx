import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

/* ─── Re-import the same provider data ───────────────────── */
interface Provider {
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
    languages: ["English", "Mandarin"], phone: "(555) 210-4400",
    bio: "Dr. Chen specializes in preventive care and chronic disease management with 14 years of experience in primary care.",
    education: ["MD, Johns Hopkins University", "Residency, UCSF Medical Center"],
    awards: ["Top Doctor 2024", "Patient Choice Award"],
  },
  {
    id: "p-2", name: "Dr. James Rodriguez", specialty: "Cardiology", specialtyKey: "specialist",
    practice: "Heart Health Partners", address: "500 Cardio Blvd, Floor 2", distance: 1.2,
    rating: 4.8, reviewCount: 198, copay: 40, copayType: "Specialist", acceptingNew: true,
    languages: ["English", "Spanish"], phone: "(555) 340-7700",
    bio: "Board-certified cardiologist focusing on preventive cardiology, heart failure, and interventional procedures.",
    education: ["MD, Harvard Medical School", "Fellowship, Cleveland Clinic"],
    awards: ["Top Cardiologist 2023", "Best in Specialty 2022"],
  },
  {
    id: "p-3", name: "Dr. Emily Watson", specialty: "Dermatology", specialtyKey: "specialist",
    practice: "Skin & Wellness Center", address: "88 Park Street", distance: 0.8,
    rating: 4.6, reviewCount: 241, copay: 40, copayType: "Specialist", acceptingNew: true,
    languages: ["English"], phone: "(555) 188-3300",
    bio: "Specializes in medical and cosmetic dermatology, with a focus on skin cancer screening and chronic skin conditions.",
    education: ["MD, NYU Grossman School of Medicine", "Dermatology Residency, Columbia"],
    awards: [],
  },
  {
    id: "p-4", name: "Dr. Michael Park", specialty: "Orthopedics", specialtyKey: "specialist",
    practice: "Joint & Sports Medicine", address: "221 Orthopedic Way", distance: 2.1,
    rating: 4.7, reviewCount: 175, copay: 40, copayType: "Specialist", acceptingNew: false,
    languages: ["English", "Korean"], phone: "(555) 440-6600",
    bio: "Sports medicine and orthopedic surgery specialist. Treats joint injuries, arthritis, and performs minimally invasive procedures.",
    education: ["MD, Stanford University", "Fellowship, Hospital for Special Surgery"],
    awards: ["Top Orthopedic Surgeon 2024"],
  },
  {
    id: "p-5", name: "Dr. Lisa Thompson", specialty: "Mental Health", specialtyKey: "mental",
    practice: "Mindful Care Therapy", address: "350 Wellness Drive, Suite 12", distance: 1.5,
    rating: 5.0, reviewCount: 89, copay: 20, copayType: "PCP", acceptingNew: true,
    languages: ["English", "French"], phone: "(555) 590-2211",
    bio: "Licensed psychiatrist specializing in anxiety, depression, and trauma. Offers telehealth and in-person sessions.",
    education: ["MD, Yale School of Medicine", "Psychiatry Residency, Mass General"],
    awards: ["Best Psychiatrist 2023"],
  },
  {
    id: "p-6", name: "Dr. Anna Williams", specialty: "Pediatrics", specialtyKey: "primary",
    practice: "Bright Kids Health", address: "44 Elm Street", distance: 0.5,
    rating: 4.9, reviewCount: 405, copay: 20, copayType: "PCP", acceptingNew: true,
    languages: ["English"], phone: "(555) 720-8844",
    bio: "Pediatrician caring for infants through adolescents. Expert in childhood development, vaccinations, and chronic conditions.",
    education: ["MD, Duke University", "Pediatrics Residency, Children's Hospital of Philadelphia"],
    awards: ["Top Pediatrician 2022", "Patient Choice Award"],
  },
  {
    id: "p-7", name: "Dr. David Johnson", specialty: "Endocrinology", specialtyKey: "specialist",
    practice: "Metro Diabetes Center", address: "900 Endocrine Ave", distance: 3.2,
    rating: 4.4, reviewCount: 132, copay: 40, copayType: "Specialist", acceptingNew: true,
    languages: ["English"], phone: "(555) 831-5500",
    bio: "Endocrinologist with deep expertise in diabetes, thyroid disorders, and metabolic disease management.",
    education: ["MD, Vanderbilt University", "Endocrinology Fellowship, Mayo Clinic"],
    awards: [],
  },
  {
    id: "p-8", name: "Dr. Maria Garcia", specialty: "Internal Medicine", specialtyKey: "primary",
    practice: "CareAlign Medical Group", address: "120 Wellness Ave, Suite 7", distance: 0.3,
    rating: 4.7, reviewCount: 287, copay: 20, copayType: "PCP", acceptingNew: true,
    languages: ["English", "Spanish"], phone: "(555) 210-4401",
    bio: "Internal medicine physician focused on adult primary care, preventive screenings, and managing complex chronic conditions.",
    education: ["MD, University of Miami", "Residency, Mount Sinai Hospital"],
    awards: [],
  },
  {
    id: "p-9", name: "Dr. Thomas Lee", specialty: "Ophthalmology", specialtyKey: "specialist",
    practice: "Clear Vision Center", address: "15 Vision Plaza", distance: 1.9,
    rating: 4.6, reviewCount: 201, copay: 40, copayType: "Specialist", acceptingNew: true,
    languages: ["English", "Cantonese"], phone: "(555) 970-3344",
    bio: "Ophthalmologist treating cataracts, glaucoma, macular degeneration, and providing comprehensive eye care.",
    education: ["MD, University of Michigan", "Ophthalmology Residency, Bascom Palmer"],
    awards: ["Excellence in Eye Care 2023"],
  },
  {
    id: "p-10", name: "Dr. Kevin Brown", specialty: "Family Medicine", specialtyKey: "primary",
    practice: "Family First Health", address: "78 Oak Lane", distance: 0.7,
    rating: 4.5, reviewCount: 338, copay: 20, copayType: "PCP", acceptingNew: true,
    languages: ["English"], phone: "(555) 650-1122",
    bio: "Family medicine physician providing comprehensive care for patients of all ages. Special interest in lifestyle medicine.",
    education: ["MD, Emory University School of Medicine", "Family Medicine Residency, UCSF"],
    awards: [],
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Feather
          key={i}
          name="star"
          size={14}
          color={i <= Math.round(rating) ? "#F59E0B" : "#E5E7EB"}
        />
      ))}
    </View>
  );
}

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [preferred, setPreferred] = useState(false);

  const provider = PROVIDERS.find((p) => p.id === id);

  if (!provider) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Provider not found.</Text>
      </View>
    );
  }

  const avatarColors = ["#05503C", "#2563EB", "#7C3AED", "#D97706", "#0891B2", "#DC2626"];
  const avatarBg = avatarColors[parseInt(provider.id.split("-")[1]) % avatarColors.length];

  const initials = provider.name
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleCall = () => {
    const tel = `tel:${provider.phone.replace(/\D/g, "")}`;
    Linking.canOpenURL(tel).then((ok) => {
      if (ok) Linking.openURL(tel);
      else Alert.alert("Phone", `Call ${provider.phone}`);
    });
  };

  const handleBook = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Request Appointment",
      `Your appointment request with ${provider.name} has been submitted. The office will contact you within 1 business day.`,
      [{ text: "OK" }]
    );
  };

  const handlePreferred = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPreferred((v) => !v);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: avatarBg + "12" }]}>
          <View style={[styles.heroAvatar, { backgroundColor: avatarBg }]}>
            <Text style={styles.heroAvatarText}>{initials}</Text>
          </View>
          <Text style={[styles.heroName, { color: colors.foreground }]}>{provider.name}</Text>
          <Text style={[styles.heroSpecialty, { color: colors.mutedForeground }]}>
            {provider.specialty} · {provider.practice}
          </Text>
          <View style={styles.heroMeta}>
            <StarRating rating={provider.rating} />
            <Text style={[styles.heroRatingNum, { color: colors.foreground }]}>
              {provider.rating}
            </Text>
            <Text style={[styles.heroReviews, { color: colors.mutedForeground }]}>
              ({provider.reviewCount} reviews)
            </Text>
          </View>
          <View style={styles.heroBadges}>
            <View style={[styles.heroBadge, { backgroundColor: "#DCFCE7" }]}>
              <Feather name="check-circle" size={12} color="#16A34A" />
              <Text style={[styles.heroBadgeText, { color: "#16A34A" }]}>In-Network</Text>
            </View>
            <View
              style={[
                styles.heroBadge,
                { backgroundColor: provider.acceptingNew ? "#DBEAFE" : "#FEE2E2" },
              ]}
            >
              <Text
                style={[
                  styles.heroBadgeText,
                  { color: provider.acceptingNew ? "#2563EB" : "#DC2626" },
                ]}
              >
                {provider.acceptingNew ? "Accepting New Patients" : "Waitlist Only"}
              </Text>
            </View>
          </View>
        </View>

        {/* Cost estimate */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Feather name="dollar-sign" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Estimated Cost</Text>
          </View>
          <View style={styles.costGrid}>
            <View style={[styles.costItem, { backgroundColor: colors.primary + "10" }]}>
              <Text style={[styles.costValue, { color: colors.primary }]}>${provider.copay}</Text>
              <Text style={[styles.costLabel, { color: colors.mutedForeground }]}>Copay per visit</Text>
            </View>
            <View style={[styles.costItem, { backgroundColor: "#DBEAFE" }]}>
              <Text style={[styles.costValue, { color: "#2563EB" }]}>$0</Text>
              <Text style={[styles.costLabel, { color: colors.mutedForeground }]}>After deductible</Text>
            </View>
            <View style={[styles.costItem, { backgroundColor: "#F0FDF4" }]}>
              <Text style={[styles.costValue, { color: "#16A34A" }]}>+50 pts</Text>
              <Text style={[styles.costLabel, { color: colors.mutedForeground }]}>For this visit</Text>
            </View>
          </View>
          <View style={[styles.costNote, { backgroundColor: colors.muted }]}>
            <Feather name="info" size={13} color={colors.mutedForeground} />
            <Text style={[styles.costNoteText, { color: colors.mutedForeground }]}>
              Cost shown is based on your {provider.copayType === "PCP" ? "Primary Care" : "Specialist"} copay for BlueCross PPO Gold. Actual cost may vary by visit type.
            </Text>
          </View>
        </View>

        {/* About */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Feather name="user" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
          </View>
          <Text style={[styles.bio, { color: colors.mutedForeground }]}>{provider.bio}</Text>
        </View>

        {/* Details */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Feather name="info" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Details</Text>
          </View>

          <View style={styles.detailRow}>
            <Feather name="map-pin" size={14} color={colors.mutedForeground} />
            <View>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>{provider.address}</Text>
              <Text style={[styles.detailSub, { color: colors.mutedForeground }]}>{provider.distance} mi from your location</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Feather name="phone" size={14} color={colors.mutedForeground} />
            <TouchableOpacity onPress={handleCall}>
              <Text style={[styles.detailValue, { color: colors.primary }]}>{provider.phone}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Feather name="globe" size={14} color={colors.mutedForeground} />
            <Text style={[styles.detailValue, { color: colors.foreground }]}>
              {provider.languages.join(", ")}
            </Text>
          </View>

          {provider.education.length > 0 && (
            <View style={styles.detailRow}>
              <Feather name="book" size={14} color={colors.mutedForeground} />
              <View style={styles.detailList}>
                {provider.education.map((e, i) => (
                  <Text key={i} style={[styles.detailValue, { color: colors.foreground }]}>{e}</Text>
                ))}
              </View>
            </View>
          )}

          {provider.awards.length > 0 && (
            <View style={styles.detailRow}>
              <Feather name="award" size={14} color="#F59E0B" />
              <View style={styles.detailList}>
                {provider.awards.map((a, i) => (
                  <Text key={i} style={[styles.detailValue, { color: colors.foreground }]}>{a}</Text>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Preferred toggle */}
        <TouchableOpacity
          style={[
            styles.preferredBtn,
            {
              borderColor: preferred ? "#DC2626" : colors.border,
              backgroundColor: preferred ? "#FEE2E2" : colors.card,
            },
          ]}
          onPress={handlePreferred}
          activeOpacity={0.8}
        >
          <Feather name="heart" size={18} color={preferred ? "#DC2626" : colors.mutedForeground} />
          <Text style={[styles.preferredText, { color: preferred ? "#DC2626" : colors.foreground }]}>
            {preferred ? "Saved as Preferred Provider" : "Save as Preferred Provider"}
          </Text>
          {preferred && <Feather name="check" size={16} color="#DC2626" />}
        </TouchableOpacity>
      </ScrollView>

      {/* Sticky action bar */}
      <View
        style={[
          styles.actionBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 16 : 0) + 8,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.callBtn, { borderColor: colors.primary }]}
          onPress={handleCall}
          activeOpacity={0.85}
        >
          <Feather name="phone" size={18} color={colors.primary} />
          <Text style={[styles.callBtnText, { color: colors.primary }]}>Call Office</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: colors.primary }]}
          onPress={handleBook}
          activeOpacity={0.85}
        >
          <Feather name="calendar" size={18} color="#fff" />
          <Text style={styles.bookBtnText}>Request Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { gap: 14 },

  hero: { padding: 24, alignItems: "center", gap: 8 },
  heroAvatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  heroAvatarText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  heroName: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  heroSpecialty: { fontSize: 14, textAlign: "center" },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroRatingNum: { fontSize: 14, fontWeight: "700" },
  heroReviews: { fontSize: 13 },
  heroBadges: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  heroBadgeText: { fontSize: 12, fontWeight: "600" },

  section: { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },

  costGrid: { flexDirection: "row", gap: 10 },
  costItem: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center", gap: 4 },
  costValue: { fontSize: 20, fontWeight: "900" },
  costLabel: { fontSize: 11, textAlign: "center", lineHeight: 14 },
  costNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 10, padding: 10 },
  costNoteText: { flex: 1, fontSize: 12, lineHeight: 17 },

  bio: { fontSize: 14, lineHeight: 22 },

  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  detailList: { gap: 2 },
  detailValue: { fontSize: 14, fontWeight: "500" },
  detailSub: { fontSize: 12, marginTop: 1 },

  preferredBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
  },
  preferredText: { flex: 1, fontSize: 15, fontWeight: "600" },

  actionBar: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1.5,
  },
  callBtnText: { fontSize: 15, fontWeight: "700" },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flex: 2,
    borderRadius: 12,
    paddingVertical: 14,
  },
  bookBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
