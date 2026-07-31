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

// ── Static content keyed by filterCategory ────────────────────────────────────

interface ComparisonContent {
  pageTitle: string;
  pointATitle: string;
  pointASubtitle: string;
  pointABullets: string[];
  pointBTitle: string;
  pointBSubtitle: string;
  pointBBullets: string[];
  whatYouGet: string[];
  howToTitle: string;
  howToSteps: string[];
  howToCircleColor?: string;
  noteTitle: string;
  noteContents: string[];
  noteCircleColor?: string;
  pointsLabel?: string; // if set, renders a single full-width box with this label
  importantInfo: string[];
  faqs: string[];
}

const CONTENT: Record<string, ComparisonContent> = {
  "care-site-alternative": {
    pageTitle: "Care Site Opportunity",
    pointATitle: "Current Care Site",
    pointASubtitle: "Emergency Room · Hospital",
    pointABullets: [
      "Emergency room or hospital visit",
      "Higher cost option",
      "Longer wait times",
      "Full facility fees apply",
    ],
    pointBTitle: "Alternative Care Site",
    pointBSubtitle: "Urgent Care · Walk-in Clinic",
    pointBBullets: [
      "Urgent care or walk-in clinic",
      "Significantly lower cost",
      "Shorter wait times",
      "Same quality of care",
    ],
    whatYouGet: [
      "Save on out-of-pocket costs",
      "Same clinical outcomes",
      "More convenient access to care",
      "Avoid unnecessary hospital charges",
    ],
    howToTitle: "How to Generate Doctor Note",
    howToSteps: [
      "Generate care site comparison note",
      "Review note and add any custom information",
      "Choose delivery method for the note",
      "Submit note to your care coordinator",
    ],
    noteTitle: "What's in the Doctor Note",
    noteContents: [
      "Current care site details",
      "Alternative care site comparison",
      "Cost analysis comparison",
      "Care pathway information",
      "Provider recommendations",
    ],
    importantInfo: [
      "Alternative care sites are clinically equivalent for many conditions",
      "Your doctor will review the care plan before approving",
      "You can always return to your original care site if needed",
      "Cost benefits may vary by location",
    ],
    faqs: [
      "Q: Is urgent care as effective as the ER? A: Yes, for non-emergency conditions urgent care provides equivalent care",
      "Q: Will my insurance cover urgent care? A: Most insurance plans prefer urgent care for non-emergency visits",
      "Q: How do I know if my condition needs the ER? A: Your care coordinator can help assess urgency",
      "Q: How quickly can I be seen? A: Most urgent care centers see patients within 30–60 minutes",
    ],
  },
  "care-protocol": {
    pageTitle: "Care Protocol Opportunity",
    pointATitle: "Current Protocol",
    pointASubtitle: "Specialist Visit · Current Pathway",
    pointABullets: [
      "Specialist-directed care pathway",
      "Higher cost option",
      "Longer wait for appointments",
      "Multiple referrals required",
    ],
    pointBTitle: "Recommended Protocol",
    pointBSubtitle: "Evidence-Based Pathway",
    pointBBullets: [
      "Evidence-based care protocol",
      "Significantly lower cost",
      "Streamlined care pathway",
      "Same clinical outcomes",
    ],
    whatYouGet: [
      "Follow evidence-based guidelines",
      "Reduce unnecessary specialist visits",
      "Lower out-of-pocket costs",
      "More coordinated care experience",
    ],
    howToTitle: "How to Generate Doctor Note",
    howToSteps: [
      "Generate care protocol comparison note",
      "Review note and add any custom information",
      "Choose delivery method for the note",
      "Submit note to your care team",
    ],
    noteTitle: "What's in the Doctor Note",
    noteContents: [
      "Current protocol details",
      "Recommended protocol information",
      "Cost analysis comparison",
      "Clinical outcome data",
      "Care team instructions",
    ],
    importantInfo: [
      "Recommended protocols are evidence-based and clinically validated",
      "Your physician will review the protocol before implementation",
      "You can always return to your current protocol if needed",
      "Results may vary based on individual health factors",
    ],
    faqs: [
      "Q: Are recommended protocols as effective? A: Yes, they follow the latest evidence-based guidelines",
      "Q: Will my insurance cover the new protocol? A: Most insurance plans prefer evidence-based protocols",
      "Q: Will I still see my specialist? A: Your care team will determine the best approach for you",
      "Q: How long does the protocol take? A: Timelines vary by condition and protocol type",
    ],
  },
  "mail-delivery": {
    pageTitle: "Mail Delivery Opportunity",
    pointATitle: "In-Store Pickup",
    pointASubtitle: "Pharmacy Pickup · Your Local Pharmacy",
    pointABullets: [
      "Visit pharmacy in person",
      "Wait in line for pickup",
      "Limited to 30-day supply",
      "Requires monthly trips",
    ],
    pointBTitle: "Mail Delivery",
    pointBSubtitle: "Home Delivery",
    pointBBullets: [
      "Automatic refills",
      "Free home delivery",
      "90-day supply available",
      "No trips to pharmacy needed",
    ],
    whatYouGet: [
      "Automatic refill reminders",
      "Free shipping and delivery",
      "90-day supply options",
      "No waiting in pharmacy lines",
      "Convenient home delivery",
    ],
    pointsLabel: "One-Time Reward",
    howToTitle: "How to Switch to Mail Delivery",
    howToCircleColor: "#3B82F6",
    howToSteps: [
      "Generate doctor note for mail delivery",
      "Share note with your doctor",
      "Switch to mail delivery service",
      "Earn points for convenience",
    ],
    noteTitle: "What's Different with Mail Delivery",
    noteCircleColor: "#3B82F6",
    noteContents: [
      "Mail delivery setup instructions",
      "Automatic refill preferences",
      "Delivery address confirmation",
      "Insurance coverage verification",
      "Contact information for mail pharmacy",
    ],
    importantInfo: [
      "Mail delivery is available for most medications",
      "Your doctor will need to approve the switch",
      "You can always switch back to in-store pickup",
      "Delivery times may vary by location",
    ],
    faqs: [
      "Q: Which medications can be mail-delivered? A: Most maintenance medications qualify for mail delivery",
      "Q: How long does delivery take? A: Most orders arrive within 5–7 business days",
      "Q: Can I still use my local pharmacy? A: Yes, you can switch back to in-store pickup at any time",
      "Q: Is mail delivery covered by my plan? A: Yes, mail delivery is covered and often has lower copays",
    ],
  },
};

// ── Accordion ─────────────────────────────────────────────────────────────────

function Accordion({
  title,
  items,
  colors,
}: {
  title: string;
  items: string[];
  colors: ReturnType<typeof useColors>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.accordion, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={[styles.accordionTitle, { color: colors.foreground }]}>{title}</Text>
        <Feather
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.mutedForeground}
        />
      </TouchableOpacity>
      {open && (
        <View style={styles.accordionBody}>
          {items.map((item, i) => (
            <Text key={i} style={[styles.accordionItem, { color: colors.mutedForeground }]}>
              • {item}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function CareComparisonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const navigation = useNavigation();
  const opp = MOCK_OPPORTUNITIES.find((o) => o.id === id);
  const filterCategory = opp?.filterCategory ?? "care-site-alternative";
  const content = CONTENT[filterCategory] ?? CONTENT["care-site-alternative"];

  useEffect(() => {
    navigation.setOptions({ title: content.pageTitle });
  }, [content.pageTitle]);

  const immediatePoints = opp?.points ?? 50;
  const monthlyPoints = opp?.pointsMonthly ?? 50;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 96 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Point A — Current */}
        <View style={[styles.card, styles.cardA]}>
          <Text style={styles.cardATitle}>{content.pointATitle}</Text>
          <Text style={styles.cardASub}>{content.pointASubtitle}</Text>
          {content.pointABullets.map((b, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.cardABullet}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Point B — Alternative */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
          <Text style={[styles.cardBTitle, { color: colors.foreground }]}>{content.pointBTitle}</Text>
          <Text style={[styles.cardBSub, { color: colors.mutedForeground }]}>{content.pointBSubtitle}</Text>
          {content.pointBBullets.map((b, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bulletCircle, { backgroundColor: colors.primary }]} />
              <Text style={[styles.cardBBullet, { color: colors.foreground }]}>{b}</Text>
            </View>
          ))}
        </View>

        {/* What You'll Get */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>What You'll Get</Text>
          {content.whatYouGet.map((item, i) => (
            <View key={i} style={styles.checkRow}>
              <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                <Feather name="check" size={12} color="#fff" />
              </View>
              <Text style={[styles.checkText, { color: colors.foreground }]}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Points Breakdown */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Points Breakdown</Text>
          {content.pointsLabel ? (
            <View style={[styles.pointsBoxFull, { backgroundColor: colors.primary }]}>
              <Text style={styles.pointsLabel}>{content.pointsLabel}</Text>
              <Text style={styles.pointsValue}>{immediatePoints} Points</Text>
            </View>
          ) : (
            <View style={styles.pointsRow}>
              <View style={[styles.pointsBox, { backgroundColor: colors.primary }]}>
                <Text style={styles.pointsLabel}>Immediate</Text>
                <Text style={styles.pointsValue}>{immediatePoints}</Text>
              </View>
              <View style={[styles.pointsBox, { backgroundColor: colors.primary }]}>
                <Text style={styles.pointsLabel}>Monthly</Text>
                <Text style={styles.pointsValue}>{monthlyPoints}</Text>
              </View>
            </View>
          )}
        </View>

        {/* How to … */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {content.howToTitle}
          </Text>
          {content.howToSteps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepCircle, { backgroundColor: content.howToCircleColor ?? colors.primary }]}>
                <Text style={styles.stepNum}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
            </View>
          ))}
        </View>

        {/* What's … */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {content.noteTitle}
          </Text>
          {content.noteContents.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={[styles.bulletDot, { color: content.noteCircleColor ?? colors.primary }]}>•</Text>
              <Text style={[styles.cardBBullet, { color: colors.foreground }]}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Accordions */}
        <Accordion title="Important Information" items={content.importantInfo} colors={colors} />
        <Accordion title="Frequently Asked Questions" items={content.faqs} colors={colors} />
      </ScrollView>

      {/* Sticky CTA */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 16 : 8),
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
          onPress={() =>
            router.push(
              `/doctor-note-wizard/${id}?type=${filterCategory}` as never,
            )
          }
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>Generate Doctor Note</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CARD_A_BG = "#E8F5F3";
const CARD_A_TEXT = "#0D4E47";

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 14 },

  card: { borderRadius: 14, padding: 16, gap: 10 },
  cardA: { backgroundColor: CARD_A_BG },
  cardATitle: { fontSize: 16, fontWeight: "800", color: CARD_A_TEXT },
  cardASub: { fontSize: 13, color: "#5B8C87", marginTop: -4 },
  cardABullet: { fontSize: 14, color: CARD_A_TEXT, flex: 1 },

  cardBTitle: { fontSize: 16, fontWeight: "800" },
  cardBSub: { fontSize: 13, marginTop: -4 },
  cardBBullet: { fontSize: 14, flex: 1 },

  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  bulletDot: { fontSize: 16, lineHeight: 22, color: "#5B8C87" },
  bulletCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
    flexShrink: 0,
  },

  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 2 },

  checkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkText: { fontSize: 14, flex: 1 },

  pointsRow: { flexDirection: "row", gap: 12 },
  pointsBox: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  pointsBoxFull: {
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: "center",
    gap: 4,
  },
  pointsLabel: { fontSize: 12, color: "#fff", opacity: 0.85 },
  pointsValue: { fontSize: 28, fontWeight: "900", color: "#fff" },

  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNum: { color: "#fff", fontSize: 13, fontWeight: "700" },
  stepText: { flex: 1, fontSize: 14, lineHeight: 20, paddingTop: 4 },

  accordion: {
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
  accordionTitle: { fontSize: 15, fontWeight: "700" },
  accordionBody: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  accordionItem: { fontSize: 14, lineHeight: 20 },

  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  ctaBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
