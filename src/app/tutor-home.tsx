import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from "react-native";
import { useState, useCallback } from "react";
import { Image } from "expo-image";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

export default function TutorHome() {
  const router = useRouter();
  const { colors } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [userName, setUserName] = useState("tutor");

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("@session").then(s => {
        if (s) {
          const u = JSON.parse(s);
          setUserName(u.nome?.split(" ")[0] || "tutor");
        }
      });
    }, [])
  );

  const menuItems = [
    { title: "Meu Pet", icon: "paw", route: "/pet", color: "#4f46e5" },
    { title: "Cadastro", icon: "add-circle", route: "/cadastro", color: "#10b981" },
    { title: "Score", icon: "stats-chart", route: "/score", color: "#f59e0b" },
    { title: "Vacinas", icon: "medkit", route: "/vacinas", color: "#ef4444" },
    { title: "Medicamentos", icon: "medical", route: "/medicamentos", color: "#ec4899" },
    { title: "Agendar Consulta", icon: "calendar", route: "/agendar-consulta", color: "#0d9488" },
  ];

  const s = makeStyles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.contentContainer}>
      <View style={s.header}>
        <View style={s.headerText}>
          <Text style={s.greeting}>Olá, {userName}!</Text>
          <Text style={s.subtitle}>Bem-vindo ao PetTrack</Text>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity style={s.menuButton} onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.banner}>
        <Ionicons name="heart" size={32} color="#fff" />
        <View style={s.bannerTextContainer}>
          <Text style={s.bannerTitle}>Cuidando de quem te ama</Text>
          <Text style={s.bannerSubtitle}>Acompanhe a saúde e a rotina do seu pet de forma simples.</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>Acesso Rápido</Text>
      
      <View style={s.grid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={s.card} 
            onPress={() => router.push(item.route as any)}
          >
            <View style={[s.iconContainer, { backgroundColor: item.color + "20" }]}>
              <Ionicons name={item.icon as any} size={32} color={item.color} />
            </View>
            <Text style={s.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal Lateral */}
      <Modal visible={menuVisible} animationType="fade" transparent={true}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={s.modalCloseArea} onPress={() => setMenuVisible(false)} />
          <View style={s.sideMenu}>
            <View style={s.sideMenuHeader}>
              <Text style={s.sideMenuTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.sideMenuItem} onPress={() => { setMenuVisible(false); router.push("/ajustes-tutor"); }}>
              <Ionicons name="person-outline" size={24} color="#4f46e5" />
              <Text style={s.sideMenuText}>Meu Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.sideMenuItem} onPress={() => { setMenuVisible(false); router.push("/integrantes"); }}>
              <Ionicons name="code-slash-outline" size={24} color="#8b5cf6" />
              <Text style={s.sideMenuText}>Desenvolvedores</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.sideMenuItem} onPress={() => { setMenuVisible(false); router.push("/ajustes-tutor"); }}>
              <Ionicons name="settings-outline" size={24} color="#f59e0b" />
              <Text style={s.sideMenuText}>Configurações</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.sideMenuItem} onPress={() => { setMenuVisible(false); router.push("/faq"); }}>
              <Ionicons name="help-circle-outline" size={24} color="#10b981" />
              <Text style={s.sideMenuText}>FAQ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.sideMenuItem} onPress={() => { setMenuVisible(false); router.push("/sac"); }}>
              <Ionicons name="chatbubbles-outline" size={24} color="#ec4899" />
              <Text style={s.sideMenuText}>SAC</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.sideMenuItem, s.logoutItem]} onPress={async () => {
              await AsyncStorage.removeItem("@session");
              router.replace("/");
            }}>
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
              <Text style={[s.sideMenuText, { color: "#ef4444" }]}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    contentContainer: { padding: 24, paddingTop: 60, paddingBottom: 40 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
    headerText: { flex: 1 },
    headerActions: { flexDirection: "row", alignItems: "center" },
    menuButton: { padding: 8 },
    greeting: { fontSize: 28, fontWeight: "bold", color: colors.text },
    subtitle: { fontSize: 16, color: colors.textSecondary, marginTop: 4 },
    banner: {
      backgroundColor: "#4f46e5", borderRadius: 16, padding: 24,
      flexDirection: "row", alignItems: "center", marginBottom: 32,
      shadowColor: "#4f46e5", shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    bannerTextContainer: { marginLeft: 16, flex: 1 },
    bannerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 4 },
    bannerSubtitle: { color: "#e0e7ff", fontSize: 14, lineHeight: 20 },
    sectionTitle: { fontSize: 20, fontWeight: "bold", color: colors.text, marginBottom: 16 },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    card: {
      backgroundColor: colors.surface, width: "47%", borderRadius: 16,
      padding: 20, alignItems: "center", marginBottom: 16,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 12 },
    cardTitle: { fontSize: 15, fontWeight: "600", color: colors.text, textAlign: "center" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", flexDirection: "row", justifyContent: "flex-end" },
    modalCloseArea: { flex: 1 },
    sideMenu: {
      width: "75%", backgroundColor: colors.surface, height: "100%",
      padding: 24, paddingTop: 60,
      shadowColor: "#000", shadowOffset: { width: -4, height: 0 },
      shadowOpacity: 0.1, shadowRadius: 10, elevation: 10,
    },
    sideMenuHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 40 },
    sideMenuTitle: { fontSize: 24, fontWeight: "bold", color: colors.text },
    sideMenuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
    sideMenuText: { fontSize: 18, fontWeight: "500", color: colors.text, marginLeft: 16 },
    logoutItem: { marginTop: "auto", borderBottomWidth: 0, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 24 },
  });
}
