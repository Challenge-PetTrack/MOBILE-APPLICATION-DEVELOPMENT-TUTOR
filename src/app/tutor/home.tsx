import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import ActionCard from "@/components/ActionCard";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";

export default function TutorHome() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  
  const { user, logout } = useAuth();

  const menuItems = [
    { title: "Meu Pet", icon: "paw", route: "/tutor/pet", color: colors.primary },
    { title: "Financeiro", icon: "wallet", route: "/tutor/financeiro", color: colors.success },
    { title: "Score", icon: "stats-chart", route: "/tutor/score", color: colors.warning },
    { title: "Vacinas", icon: "medkit", route: "/tutor/vacinas", color: colors.danger },
    { title: "Medicamentos", icon: "medical", route: "/tutor/medicamentos", color: colors.secondary },
    { title: "Agendar", icon: "calendar", route: "/tutor/agendar-consulta", color: colors.primary },
  ];

  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <Header />
      <ScrollView contentContainerStyle={s.contentContainer} showsVerticalScrollIndicator={false}>
        
        <View style={s.banner}>
          <Ionicons name="heart" size={32} color="#fff" />
          <View style={s.bannerTextContainer}>
            <Text style={s.bannerTitle}>Cuidando de quem te ama</Text>
            <Text style={s.bannerSubtitle}>Acompanhe a saúde e a rotina do seu pet de forma simples.</Text>
          </View>
        </View>

        <View style={s.headerWithMenu}>
          <Text style={s.sectionTitle}>Acesso Rápido</Text>
          <TouchableOpacity style={s.menuButton} onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={24} color={colors.textSecondary} />
            <Text style={s.menuButtonText}>Menu</Text>
          </TouchableOpacity>
        </View>
        
        <View style={s.grid}>
          {menuItems.map((item, index) => (
            <ActionCard 
              key={index} 
              title={item.title}
              iconName={item.icon as any}
              iconColor={item.color}
              onPress={() => router.push(item.route as any)}
            />
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

              <TouchableOpacity style={s.sideMenuItem} onPress={() => { setMenuVisible(false); router.push("/tutor/ajustes"); }}>
                <Ionicons name="person-outline" size={24} color={colors.primary} />
                <Text style={s.sideMenuText}>Meu Perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.sideMenuItem} onPress={() => { setMenuVisible(false); router.push("/tutor/integrantes"); }}>
                <Ionicons name="code-slash-outline" size={24} color={colors.secondary} />
                <Text style={s.sideMenuText}>Desenvolvedores</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.sideMenuItem} onPress={() => { setMenuVisible(false); router.push("/tutor/ajustes"); }}>
                <Ionicons name="settings-outline" size={24} color={colors.warning} />
                <Text style={s.sideMenuText}>Configurações</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.sideMenuItem} onPress={() => { setMenuVisible(false); router.push("/tutor/faq"); }}>
                <Ionicons name="help-circle-outline" size={24} color={colors.success} />
                <Text style={s.sideMenuText}>FAQ</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.sideMenuItem} onPress={() => { setMenuVisible(false); router.push("/tutor/sac"); }}>
                <Ionicons name="chatbubbles-outline" size={24} color={colors.danger} />
                <Text style={s.sideMenuText}>SAC</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[s.sideMenuItem, s.logoutItem]} onPress={async () => {
                setMenuVisible(false);
                await logout();
                router.replace("/auth/login");
              }}>
                <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                <Text style={[s.sideMenuText, { color: "#ef4444" }]}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    contentContainer: { padding: 24, paddingBottom: 40 },
    headerWithMenu: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    menuButton: { flexDirection: "row", alignItems: "center", gap: 4, padding: 8, backgroundColor: colors.surfaceSecondary, borderRadius: 12 },
    menuButtonText: { fontSize: 14, fontWeight: "500", color: colors.textSecondary },
    banner: {
      backgroundColor: colors.primary, borderRadius: 20, padding: 24,
      flexDirection: "row", alignItems: "center", marginBottom: 32,
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    bannerTextContainer: { marginLeft: 16, flex: 1 },
    bannerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 4 },
    bannerSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 20 },
    sectionTitle: { fontSize: 20, fontWeight: "bold", color: colors.text },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
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
