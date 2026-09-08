import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

type WorkflowCompletionButtonProps = {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  trailingArrow?: boolean;
  variant?: "completion" | "confirmation";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function WorkflowCompletionButton({
  label,
  accessibilityLabel,
  onPress,
  trailingArrow = true,
  variant = "completion",
  disabled = false,
  style,
}: WorkflowCompletionButtonProps) {
  const colors = useColors();
  const icon = variant === "confirmation" ? "alert-triangle" : "check";

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: disabled ? colors.muted : colors.primary }, style]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
    >
      <View style={[styles.icon, { borderColor: colors.primaryForeground }]}>
        <Feather name={icon} size={17} color={colors.primaryForeground} />
      </View>
      <Text style={[styles.label, { color: colors.primaryForeground }]}>{label}</Text>
      {trailingArrow ? <Feather name="arrow-right" size={19} color={colors.primaryForeground} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 58,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 4,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { flex: 1, fontSize: 16, fontWeight: "800", textAlign: "center" },
});