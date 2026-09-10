import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";

export default function Header() {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const s = makeStyles(colors);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <View style={s.container}>
      <View style={s.userInfo}>
        <View style={s.avatarContainer}>
          <Text style={s.avatarText}>
            {user?.nome ? user.nome.charAt(0).toUpperCase() : "U"}
          </Text>
        </View>
        <View>
          <Text style={s.greeting}>{getGreeting()},</Text>
          <Text style={s.userName}>{user?.nome?.split(' ')[0] || "Usuário"}</Text>
        </View>
      </View>

      <View style={s.actions}>
        <TouchableOpacity style={s.iconButton} onPress={toggleTheme}>
          <Ionicons 
            name={isDark ? "sunny-outline" : "moon-outline"} 
            size={22} 
            color={colors.text} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={s.iconButton} 
          onPress={() => router.push(user?.perfil === 'veterinario' ? "/vet/ajustes" : "/tutor/ajustes")}
        >
          <Ionicons name="settings-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  greeting: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
});
