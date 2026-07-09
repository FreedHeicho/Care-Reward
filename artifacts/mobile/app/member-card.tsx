import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { MOCK_USER_PLAN } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const LOGO = require("../assets/carealign-logo.png");

function QrMock() {
  const SIZE = 100;
  const CELL = 10;
  const pattern = [
    [1,1,1,1,1,1,1,0,1,1],
    [1,0,0,0,0,0,1,0,0,1],
    [1,0,1,1,1,0,1,0,1,0],
    [1,0,1,1,1,0,1,0,0,1],
    [1,0,1,1,1,0,1,0,1,1],
    [1,0,0,0,0,0,1,0,0,0],
    [1,1,1,1,1,1,1,0,1,0],
    [0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,0,1,1,0,1],
    [0,1,0,0,1,1,0,0,1,1],
  ];
  return (
    <View style={{ width: SIZE, height: SIZE, borderRadius: 6, overflow: "hidden", backgroundColor: "#fff", padding: 4 }}>
      {pattern.map((row, r) => (
        <View key={r} style={{ flexDirection: "row" }}>
          {row.map((cell, c) => (
            <View
              key={c}
              style={{
                width: CELL - 0.8,
                height: CELL - 0.8,
                backgroundColor: cell ? "#05503C" : "transparent",
                margin: 0.4,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function BarcodeMock({ memberId }: { memberId: string }) {
  const bars = Array.from({ length: 48 }, (_, i) => {
    const seed = memberId.charCodeAt(i % memberId.length) + i * 7;
    return (seed % 5 === 0) ? 1 : (seed % 3 === 0) ? 0 : seed % 2;
  });
  return (
    <View style={styles.barcode}>
      <View style={styles.barcodeStripes}>
        {bars.map((w, i) => (
          <View
            key={i}
            style={{
              width: w === 1 ? 3 : w === 0 ? 1 : 2,
              height: 40,
              backgroundColor: "#fff",
              marginHorizontal: 0.5,
            }}
          />
        ))}
      </View>
      <Text style={styles.barcodeText}>{memberId}</Text>
    </View>
  );
}

export default function MemberCardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [logoError, setLogoError] = useState(false);

  const memberId = user?.memberId ?? MOCK_USER_PLAN.memberId;
  const planName = user?.planName ?? MOCK_USER_PLAN.planName;
  const memberName = user?.name ?? "Member";

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `CareReward Member ID Card\nName: ${memberName}\nMember ID: ${memberId}\nPlan: ${planName}\nGroup: GRP-78234`,
        title: "My Member ID Card",
      });
    } catch {}
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Instruction banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.alertBg, borderLeftColor: colors.primary }]}>
          <Feather name="info" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.foreground }]}>
            Present this card at your healthcare provider or pharmacy
          </Text>
        </View>

        {/* Front of Card */}
        <View style={styles.cardWrapper}>
          <Text style={[styles.cardSide, { color: colors.mutedForeground }]}>FRONT</Text>
          <View style={styles.card}>
            {/* Card header bar */}
            <View style={[styles.cardHeader, { backgroundColor: "#05503C" }]}>
              {logoError ? (
                <Text style={styles.cardLogoFallback}>CareReward</Text>
              ) : (
                <Image
                  source={LOGO}
                  style={styles.cardLogo}
                  resizeMode="contain"
                  onError={() => setLogoError(true)}
                />
              )}
              <Text style={styles.cardHeaderLabel}>Member ID Card</Text>
            </View>

            {/* Card body */}
            <View style={[styles.cardBody, { backgroundColor: "#fff" }]}>
              <View style={styles.cardTopRow}>
                <View style={styles.cardField}>
                  <Text style={styles.fieldLabel}>MEMBER NAME</Text>
                  <Text style={styles.fieldValue}>{memberName.toUpperCase()}</Text>
                </View>
                <View style={[styles.cardField, styles.cardFieldRight]}>
                  <Text style={styles.fieldLabel}>EFFECTIVE DATE</Text>
                  <Text style={styles.fieldValue}>01/01/2026</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: "#E4E9F0" }]} />

              <View style={styles.cardMidRow}>
                <View style={styles.cardField}>
                  <Text style={styles.fieldLabel}>MEMBER ID</Text>
                  <Text style={[styles.fieldValueLarge, { color: "#05503C" }]}>{memberId}</Text>
                </View>
                <View style={[styles.cardField, styles.cardFieldRight]}>
                  <Text style={styles.fieldLabel}>GROUP</Text>
                  <Text style={[styles.fieldValueLarge, { color: "#05503C" }]}>GRP-78234</Text>
                </View>
              </View>

              <View style={styles.cardPlanRow}>
                <Text style={styles.fieldLabel}>PLAN</Text>
                <Text style={[styles.fieldValue, { color: "#1A1A2E" }]}>{planName}</Text>
              </View>

              <View style={styles.cardBenefitsRow}>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitLabel}>IN-NETWORK PCP</Text>
                  <Text style={styles.benefitValue}>$20 copay</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitLabel}>SPECIALIST</Text>
                  <Text style={styles.benefitValue}>$40 copay</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitLabel}>EMERGENCY</Text>
                  <Text style={styles.benefitValue}>$250 copay</Text>
                </View>
              </View>

              <BarcodeMock memberId={memberId} />
            </View>
          </View>
        </View>

        {/* Back of Card */}
        <View style={styles.cardWrapper}>
          <Text style={[styles.cardSide, { color: colors.mutedForeground }]}>BACK</Text>
          <View style={styles.card}>
            <View style={[styles.cardHeader, { backgroundColor: "#03382A" }]}>
              <Text style={styles.cardBackTitle}>Pharmacy & Additional Benefits</Text>
            </View>
            <View style={[styles.cardBody, { backgroundColor: "#fff" }]}>
              <View style={styles.cardBackGrid}>
                <View style={styles.backSection}>
                  <Text style={[styles.backSectionTitle, { color: "#05503C" }]}>Pharmacy Benefits</Text>
                  <View style={styles.rxRow}>
                    <View style={styles.rxItem}>
                      <Text style={styles.fieldLabel}>RxBIN</Text>
                      <Text style={styles.fieldValue}>610415</Text>
                    </View>
                    <View style={styles.rxItem}>
                      <Text style={styles.fieldLabel}>RxPCN</Text>
                      <Text style={styles.fieldValue}>BCBSM</Text>
                    </View>
                    <View style={styles.rxItem}>
                      <Text style={styles.fieldLabel}>RxGRP</Text>
                      <Text style={styles.fieldValue}>RX7823</Text>
                    </View>
                  </View>
                  <View style={styles.rxTiers}>
                    {[
                      { tier: "Tier 1", label: "Generic", copay: "$10" },
                      { tier: "Tier 2", label: "Preferred Brand", copay: "$40" },
                      { tier: "Tier 3", label: "Non-Preferred", copay: "$80" },
                      { tier: "Tier 4", label: "Specialty", copay: "30%" },
                    ].map((t) => (
                      <View key={t.tier} style={styles.tierRow}>
                        <View style={[styles.tierBadge, { backgroundColor: "#E6F0ED" }]}>
                          <Text style={[styles.tierLabel, { color: "#05503C" }]}>{t.tier}</Text>
                        </View>
                        <Text style={styles.tierName}>{t.label}</Text>
                        <Text style={[styles.tierCopay, { color: "#05503C" }]}>{t.copay}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: "#E4E9F0" }]} />

                <View style={styles.backContactSection}>
                  <View style={styles.contactRow}>
                    <Feather name="phone" size={14} color="#05503C" />
                    <View>
                      <Text style={styles.fieldLabel}>MEMBER SERVICES</Text>
                      <Text style={styles.fieldValue}>1-800-CARE-REW</Text>
                    </View>
                  </View>
                  <View style={styles.contactRow}>
                    <Feather name="phone" size={14} color="#05503C" />
                    <View>
                      <Text style={styles.fieldLabel}>NURSE HOTLINE (24/7)</Text>
                      <Text style={styles.fieldValue}>1-800-555-NURSE</Text>
                    </View>
                  </View>
                  <View style={styles.contactRow}>
                    <Feather name="globe" size={14} color="#05503C" />
                    <View>
                      <Text style={styles.fieldLabel}>PROVIDER PORTAL</Text>
                      <Text style={styles.fieldValue}>carereward.com</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.qrRow}>
                  <QrMock />
                  <View style={styles.qrLabels}>
                    <Text style={[styles.fieldLabel, { marginBottom: 4 }]}>DIGITAL VERIFICATION</Text>
                    <Text style={[styles.fieldValue, { fontSize: 11 }]}>
                      Scan to verify benefits and eligibility in real time
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={[styles.shareBtn, { backgroundColor: colors.primaryDark }]}
          onPress={handleShare}
          activeOpacity={0.85}
        >
          <Feather name="share-2" size={18} color="#fff" />
          <Text style={styles.shareBtnText}>Share Card</Text>
        </TouchableOpacity>

        <View style={[styles.helpNote, { backgroundColor: colors.muted }]}>
          <Text style={[styles.helpText, { color: colors.mutedForeground }]}>
            Lost your physical card? Contact member services at 1-800-CARE-REW to request a replacement.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, gap: 16 },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  cardWrapper: { gap: 8 },
  cardSide: { fontSize: 11, fontWeight: "700", letterSpacing: 1.5, paddingLeft: 4 },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardLogo: { height: 28, width: 130 },
  cardLogoFallback: { color: "#ffffff", fontSize: 14, fontWeight: "800", height: 28, lineHeight: 28 },
  cardHeaderLabel: { color: "#ffffff90", fontSize: 12, fontWeight: "600" },
  cardBackTitle: { color: "#fff", fontSize: 14, fontWeight: "700" },
  cardBody: { padding: 16, gap: 12 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between" },
  cardMidRow: { flexDirection: "row", justifyContent: "space-between" },
  cardPlanRow: { gap: 2 },
  cardField: { gap: 2, flex: 1 },
  cardFieldRight: { alignItems: "flex-end" },
  fieldLabel: { fontSize: 9, fontWeight: "700", color: "#7A8699", letterSpacing: 0.8 },
  fieldValue: { fontSize: 13, fontWeight: "600", color: "#1A1A2E" },
  fieldValueLarge: { fontSize: 16, fontWeight: "800" },
  divider: { height: 1, width: "100%" },
  cardBenefitsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F5F7FA",
    borderRadius: 10,
    padding: 10,
  },
  benefitItem: { alignItems: "center", gap: 3 },
  benefitLabel: { fontSize: 8, fontWeight: "700", color: "#7A8699", letterSpacing: 0.5 },
  benefitValue: { fontSize: 12, fontWeight: "700", color: "#1A1A2E" },
  barcode: {
    alignItems: "center",
    gap: 6,
    paddingTop: 8,
    backgroundColor: "#05503C",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  barcodeStripes: { flexDirection: "row", alignItems: "center" },
  barcodeText: { color: "#fff", fontSize: 10, fontWeight: "600", letterSpacing: 2 },
  cardBackGrid: { gap: 14 },
  backSection: { gap: 10 },
  backSectionTitle: { fontSize: 13, fontWeight: "700" },
  rxRow: { flexDirection: "row", gap: 16 },
  rxItem: { gap: 2 },
  rxTiers: { gap: 6 },
  tierRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tierBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tierLabel: { fontSize: 10, fontWeight: "700" },
  tierName: { flex: 1, fontSize: 12, color: "#1A1A2E" },
  tierCopay: { fontSize: 12, fontWeight: "700" },
  backContactSection: { gap: 10 },
  contactRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  qrRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  qrLabels: { flex: 1, gap: 4 },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 12,
    paddingVertical: 16,
  },
  shareBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  helpNote: { borderRadius: 12, padding: 14 },
  helpText: { fontSize: 13, lineHeight: 18, textAlign: "center" },
});
