import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MOCK_OPPORTUNITIES } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const STEP_COLOR = "#3B82F6";
const BULLET_COLOR = "#3B82F6";

// ─── Accordion ────────────────────────────────────────────────────────────────
function Accordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.accordionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={[styles.accordionTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.accordionChevron, { color: colors.mutedForeground }]}>
          {open ? "▲" : "▼"}
        </Text>
      </TouchableOpacity>
      {open && <View style={styles.accordionBody}>{children}</View>}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function MailDeliveryOpportunityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const opp = MOCK_OPPORTUNITIES.find((o) => o.id === id) ?? {
    id: "opp-3",
    title: "Mail Delivery Opportunity",
    points: 150,
  };

  useEffect(() => {
    navigation.setOptions({ title: "Mail Delivery Opportunity" });
  }, [navigation]);

  const [showComparison, setShowComparison] = useState(true);

  const handleGenerateNote = () => {
    router.push(`/doctor-note?id=${opp.id}` as never);
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
        {/* ── Comparison: In-Store Pickup vs Mail Delivery ──────────────── */}
        {/* Collapsible section header */}
        <TouchableOpacity
          style={[styles.compareToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowComparison((v) => !v)}
          activeOpacity={0.8}
        >
          <View style={styles.compareToggleLeft}>
            <View style={[styles.compareToggleIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="repeat" size={15} color={colors.primary} />
            </View>
            <Text style={[styles.compareToggleTitle, { color: colors.foreground }]}>
              Compare Options
            </Text>
          </View>
          <View style={styles.compareToggleRight}>
            <Text style={[styles.compareToggleLabel, { color: colors.mutedForeground }]}>
              {showComparison ? "Hide" : "Show"}
            </Text>
            <Feather
              name={showComparison ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.mutedForeground}
            />
          </View>
        </TouchableOpacity>

        {showComparison && (
          <>
            {/* In-Store Pickup card — light teal background */}
            <View style={[styles.card, styles.cardInStore, { borderColor: colors.border }]}>
              <View>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  In-Store Pickup
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>
                  Pharmacy Pickup • Your Local Pharmacy
                </Text>
              </View>
              {[
                "Visit pharmacy in person",
                "Wait in line for pickup",
                "Limited to 30-day supply",
                "Requires monthly trips",
              ].map((item, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={[styles.bulletDot, { backgroundColor: colors.mutedForeground }]} />
                  <Text style={[styles.bulletText, { color: colors.foreground }]}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Mail Delivery card — white/card background */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  Mail Delivery
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>
                  Home Delivery
                </Text>
              </View>
              {[
                "Automatic refills",
                "Free home delivery",
                "90-day supply available",
                "No trips to pharmacy needed",
              ].map((item, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.bulletText, { color: colors.foreground }]}>{item}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Why Switch ────────────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            Why Switch to Mail Delivery?
          </Text>
          {[
            "Medications delivered to your door",
            "Save on prescription costs",
            "No trips to pharmacy needed",
          ].map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.bulletText, { color: colors.foreground }]}>{item}</Text>
            </View>
          ))}
        </View>

        {/* ── What You'll Get ───────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>What You'll Get</Text>
          {[
            "Automatic refill reminders",
            "Free shipping and delivery",
            "90-day supply options",
            "No waiting in pharmacy lines",
            "Convenient home delivery",
          ].map((item, i) => (
            <View key={i} style={styles.checkRow}>
              <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                <Feather name="check" size={13} color="#fff" />
              </View>
              <Text style={[styles.checkText, { color: colors.foreground }]}>{item}</Text>
            </View>
          ))}
        </View>

        {/* ── Points Breakdown ──────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Points Breakdown</Text>
          <View style={[styles.pointsBanner, { backgroundColor: colors.primary }]}>
            <Text style={styles.pointsBannerLabel}>One-Time Reward</Text>
            <Text style={styles.pointsBannerValue}>{opp.points} Points</Text>
          </View>
        </View>

        {/* ── How to Switch ─────────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            How to Switch to Mail Delivery
          </Text>
          {[
            "Generate doctor note for mail delivery",
            "Share note with your doctor",
            "Switch to mail delivery service",
            "Earn points for convenience",
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: STEP_COLOR }]}>
                <Text style={styles.stepNumber}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
            </View>
          ))}
        </View>

        {/* ── What's Different ──────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            What's Different with Mail Delivery
          </Text>
          {[
            "Mail delivery setup instructions",
            "Automatic refill preferences",
            "Delivery address confirmation",
            "Insurance coverage verification",
            "Contact information for mail pharmacy",
          ].map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: BULLET_COLOR }]} />
              <Text style={[styles.bulletText, { color: colors.foreground }]}>{item}</Text>
            </View>
          ))}
        </View>

        {/* ── Important Information (accordion) ────────────────────────── */}
        <Accordion title="Important Information">
          {[
            "Mail delivery is available for most medications",
            "Your doctor will need to approve the switch",
            "You can always switch back to in-store pickup",
            "Delivery times may vary by location",
          ].map((item, i) => (
            <Text key={i} style={[styles.accordionItem, { color: colors.foreground }]}>
              • {item}
            </Text>
          ))}
        </Accordion>

        {/* ── FAQ (accordion) ───────────────────────────────────────────── */}
        <Accordion title="Frequently Asked Questions">
          {[
            { q: "Is mail delivery safe?", a: "Yes, medications are shipped in secure packaging" },
            { q: "Can I get controlled substances by mail?", a: "Some restrictions may apply" },
            { q: "What if my medication is damaged?", a: "Contact the mail pharmacy immediately" },
            { q: "How long does delivery take?", a: "Usually 3-5 business days" },
          ].map((item, i) => (
            <Text key={i} style={[styles.accordionItem, { color: colors.foreground }]}>
              {"• "}Q: {item.q} A: {item.a}
            </Text>
          ))}
        </Accordion>
      </ScrollView>

      {/* ── Fixed footer ─────────────────────────────────────────────────── */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 16 : 8),
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.generateBtn, { backgroundColor: colors.primary }]}
          onPress={handleGenerateNote}
          activeOpacity={0.85}
        >
          <Text style={styles.generateBtnText}>Generate Doctor Note</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },

  // ── Compare toggle ─────────────────────────────────────────────────────
  compareToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 13,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  compareToggleLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  compareToggleIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  compareToggleTitle: { fontSize: 15, fontWeight: "700" },
  compareToggleRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  compareToggleLabel: { fontSize: 13, fontWeight: "500" },

  // ── Cards ──────────────────────────────────────────────────────────────
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardInStore: {
    backgroundColor: "#E8F5F2",   // light teal — matches app secondary palette
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },

  // ── Bullet rows ────────────────────────────────────────────────────────
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 5,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  // ── Checkmark rows ─────────────────────────────────────────────────────
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  // ── Points banner ──────────────────────────────────────────────────────
  pointsBanner: {
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 4,
  },
  pointsBannerLabel: {
    color: "#ffffffcc",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  pointsBannerValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  // ── Numbered steps ─────────────────────────────────────────────────────
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNumber: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  // ── Accordion ──────────────────────────────────────────────────────────
  accordionCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  accordionChevron: {
    fontSize: 12,
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  accordionItem: {
    fontSize: 14,
    lineHeight: 20,
  },

  // ── Footer ─────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  generateBtn: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  generateBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
