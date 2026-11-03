import React, { ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export default function Header({ title, onBack, rightAction }: HeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[s.header, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        onPress={onBack ?? (() => router.back())}
        style={[s.backButton, { backgroundColor: colors.surface }]}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[s.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={s.rightSlot}>{rightAction}</View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 21,
    fontWeight: "bold",
    marginHorizontal: 12,
  },
  rightSlot: {
    minWidth: 40,
    alignItems: "flex-end",
  },
});
