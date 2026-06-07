import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { MOCK_USER_PLAN } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

interface SettingRowProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value?: string;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
}

function SettingRow({ icon, label, value, toggle, toggleValue, onToggle, onPress, danger }: SettingRowProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={toggle}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: danger ? "#EF444415" : colors.primary + "15" }]}>
        <Feather name={icon} size={16} color={danger ? "#EF4444" : colors.primary} />
      </View>
      <Text style={[styles.settingLabel, { color: danger ? "#EF4444" : colors.foreground }]}>
        {label}
      </Text>
      {value && (
        <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>{value}</Text>
      )}
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      ) : (
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [notificationsOn, setNotificationsOn] = useState(true);

  const handleSignOut = () => {
    if (Platform.OS === "web") {
      signOut();
      router.replace("/(auth)/login");
      return;
    }
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.foreground }]}>{user?.name ?? "Member"}</Text>
            <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>{user?.email ?? ""}</Text>
          </View>
          <View style={[styles.memberBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.memberBadgeText, { color: colors.secondaryForeground }]}>
              Member
            </Text>
          </View>
        </View>

        <View style={[styles.planCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
          <View style={styles.planRow}>
            <Feather name="shield" size={16} color={colors.primary} />
            <Text style={[styles.planName, { color: colors.primary }]}>{MOCK_USER_PLAN.planName}</Text>
          </View>
          <Text style={[styles.memberId, { color: colors.mutedForeground }]}>
            Member ID: {user?.memberId ?? MOCK_USER_PLAN.memberId}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>
          <SettingRow icon="user" label="Personal Information" onPress={() => {}} />
          <SettingRow icon="credit-card" label="Plan & Coverage" onPress={() => {}} />
          <SettingRow icon="file-text" label="Explanation of Benefits" onPress={() => {}} />
          <SettingRow icon="download" label="Download My Data" onPress={() => {}} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>NOTIFICATIONS</Text>
          <SettingRow
            icon="bell"
            label="Push Notifications"
            toggle
            toggleValue={notificationsOn}
            onToggle={setNotificationsOn}
          />
          <SettingRow
            icon="settings"
            label="Manage All Alerts"
            value="14 enabled"
            onPress={() => router.push("/notifications" as never)}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>MEMBER CARD</Text>
          <SettingRow icon="credit-card" label="View Member ID Card" onPress={() => router.push("/member-card" as never)} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>HEALTH RECORDS</Text>
          <SettingRow icon="activity" label="Connect EMR / Health Records" onPress={() => router.push("/emr-access" as never)} />
          <SettingRow icon="plus-circle" label="Log Upcoming Care" onPress={() => router.push("/log-upcoming-care" as never)} />
          <SettingRow icon="award" label="How to Earn Points" onPress={() => router.push("/how-to-earn" as never)} />
          <SettingRow icon="heart" label="Health Assessment" onPress={() => {}} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SUPPORT</Text>
          <SettingRow icon="help-circle" label="Help Center" onPress={() => {}} />
          <SettingRow icon="message-circle" label="Contact Support" onPress={() => {}} />
          <SettingRow icon="lock" label="Privacy Policy" onPress={() => {}} />
          <SettingRow icon="info" label="Terms of Service" onPress={() => {}} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT ACTIONS</Text>
          <SettingRow icon="log-out" label="Sign Out" onPress={handleSignOut} danger />
        </View>

        <Text style={[styles.version, { color: colors.mutedForeground }]}>
          CareReward v1.0.0 · Build 1
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: "700" },
  profileEmail: { fontSize: 13, marginTop: 2 },
  memberBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  memberBadgeText: { fontSize: 12, fontWeight: "600" },
  planCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 4,
  },
  planRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  planName: { fontSize: 14, fontWeight: "600" },
  memberId: { fontSize: 13, marginLeft: 24 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    gap: 12,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { flex: 1, fontSize: 15 },
  settingValue: { fontSize: 14 },
  version: { textAlign: "center", fontSize: 12, paddingVertical: 8 },
});
