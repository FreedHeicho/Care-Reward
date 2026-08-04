/**
 * OpportunityDetailSkeleton
 * Shown for ~380ms while an opportunity detail screen mounts,
 * preventing layout jumpiness and matching each page's card structure.
 */
import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

// ─── Single pulsing block ─────────────────────────────────────────────────────

function SkeletonBlock({
  width = "100%" as number | `${number}%`,
  height = 14,
  radius = 8,
  marginTop = 0,
}: {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  marginTop?: number;
}) {
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 750,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 750,
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    ).start();
    return () => pulse.stopAnimation();
  }, [pulse]);

  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: "#D1D9E0",
        opacity: pulse,
        marginTop,
      }}
    />
  );
}

// ─── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard({
  bgColor,
  lines = 4,
}: {
  bgColor?: string;
  lines?: number;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bgColor ?? colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {/* title */}
      <SkeletonBlock width="52%" height={17} radius={6} />
      {/* subtitle */}
      <SkeletonBlock width="68%" height={12} radius={5} marginTop={-2} />
      {/* bullet lines */}
      {Array.from({ length: lines }).map((_, i) => (
        <View key={i} style={styles.bulletRow}>
          <SkeletonBlock width={8} height={8} radius={4} />
          <View style={{ flex: 1 }}>
            <SkeletonBlock
              width={`${72 + ((i * 17) % 25)}%`}
              height={13}
              radius={5}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Full-page skeleton ────────────────────────────────────────────────────────

export function OpportunityDetailSkeleton() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Scrollable area */}
      <View
        style={[
          styles.scroll,
          {
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
          },
        ]}
      >
        {/* Compare-options toggle row skeleton */}
        <View
          style={[
            styles.toggleRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SkeletonBlock width={28} height={28} radius={14} />
          <SkeletonBlock width="38%" height={15} radius={6} />
          <View style={{ flex: 1 }} />
          <SkeletonBlock width={52} height={13} radius={5} />
        </View>

        {/* Two comparison cards */}
        <SkeletonCard bgColor="#E8F5F2" lines={4} />
        <SkeletonCard lines={4} />

        {/* Content card */}
        <SkeletonCard lines={3} />

        {/* Points banner */}
        <View
          style={[
            styles.pointsBanner,
            { backgroundColor: colors.secondary, borderColor: colors.border },
          ]}
        >
          <SkeletonBlock width="30%" height={13} radius={5} />
          <SkeletonBlock width="22%" height={28} radius={6} marginTop={6} />
        </View>
      </View>

      {/* Fixed CTA button skeleton */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 16 : 8),
          },
        ]}
      >
        <SkeletonBlock height={54} radius={12} />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 13,
    paddingHorizontal: 14,
    minHeight: 48,
  },

  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  pointsBanner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 4,
  },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
