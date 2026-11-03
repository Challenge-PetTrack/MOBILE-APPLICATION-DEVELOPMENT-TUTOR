import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from "react-native";
import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ActionCard from "@/components/ActionCard";
import { useAuth } from "@/hooks/useAuth";
import { useTutorPets } from "@/hooks/usePets";
import { useTutorConsultas } from "@/hooks/useConsultas";
import { useTutorMedicamentos } from "@/hooks/useMedicamentos";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import { formatDateTime } from "@/utils/date";

export default function TutorHome() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colors, isDark } = useTheme();
  const { data: pets = [] } = useTutorPets();
  const { data: consultas = [] } = useTutorConsultas();
  const { data: medicamentos = [] } = useTutorMedicamentos();
  const [menuVisible, setMenuVisible] = useState(false);

  const firstName = user?.nome?.split(" ")[0] || "Tutor";

  const proximaConsulta = useMemo(() => {
    return [...consultas]
      .filter((c) => c.status === "pendente" || c.status === "confirmada")
      .sort((a, b) => a.dataHora.localeCompare(b.dataHora))[0];
  }, [consultas]);

  const tratamentosAtivos = useMemo(
    () => medicamentos.filter((m) => m.ativo).length,
    [medicamentos]
  );

  const consultasConfirmadasCount = useMemo(
    () => consultas.filter((c) => c.status === "confirmada").length,
    [consultas]
  );

  const menuItems = [
    { title: "Meu Pet", icon: "paw", route: "/tutor/pet", color: "#4f46e5", badge: 0 },
    { title: "Financeiro", icon: "wallet", route: "/tutor/financeiro", color: "#10b981", badge: 0 },
    { title: "Score", icon: "stats-chart", route: "/tutor/score", color: "#f59e0b", badge: 0 },
    { title: "Vacinas", icon: "medkit", route: "/tutor/vacinas", color: "#ef4444", badge: 0 },
    {
      title: "Medicamentos",
      icon: "medical",
      route: "/tutor/medicamentos",
      color: "#ec4899",
      badge: tratamentosAtivos,
    },
    {
      title: "Consultas",
      icon: "calendar",
      route: "/tutor/agendar-consulta",
      color: "#0d9488",
      badge: consultasConfirmadasCount,
    },
  ] as const;

  const s = makeStyles(colors);

  const goFromMenu = (path: string) => {
    setMenuVisible(false);
    router.push(path as any);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.contentContainer}>
      <View style={s.header}>
        <View style={s.headerText}>
          <Text style={s.greeting}>Olá, {firstName}!</Text>
          <Text style={s.subtitle}>
            {pets.length > 0
              ? `${pets.length} pet(s) acompanhado(s) no PetTrack`
              : "Cadastre seu primeiro pet para começar"}
          </Text>
        </View>
        <TouchableOpacity
          style={s.menuButton}
          onPress={() => setMenuVisible(true)}
          accessibilityLabel="Abrir menu"
        >
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={s.banner}>
        <Ionicons name="heart" size={32} color="#fff" />
        <View style={s.bannerTextContainer}>
          <Text style={s.bannerTitle}>Cuidando de quem te ama</Text>
          <Text style={s.bannerSubtitle}>
            Acompanhe vacinas, medicamentos, prontuários e rotina em tempo real.
          </Text>
        </View>
      </View>

      {proximaConsulta && (
        <TouchableOpacity
          style={s.nextAppointmentCard}
          onPress={() =>
            router.push({
              pathname: "/tutor/agendar-consulta",
              params: { consultaId: proximaConsulta.id },
            })
          }
        >
          <View style={s.nextAppointmentIcon}>
            <Ionicons name="calendar" size={22} color="#0d9488" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.nextAppointmentLabel}>
              Próxima consulta ({proximaConsulta.status === "confirmada" ? "Confirmada" : "Aguardando confirmação"})
            </Text>
            <Text style={s.nextAppointmentTitle}>
              {proximaConsulta.petNome} • {formatDateTime(proximaConsulta.dataHora)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      )}

      <Text style={s.sectionTitle}>Acesso Rápido</Text>

      <View style={s.grid}>
        {menuItems.map((item) => (
          <ActionCard
            key={item.route}
            title={item.title}
            iconName={item.icon}
            iconColor={item.color}
            badgeCount={item.badge}
            onPress={() => router.push(item.route as any)}
            isDark={isDark}
          />
        ))}
      </View>

      <Modal visible={menuVisible} animationType="fade" transparent>
        <View style={s.modalOverlay}>
          <TouchableOpacity
            style={s.modalCloseArea}
            onPress={() => setMenuVisible(false)}
          />
          <View style={s.sideMenu}>
            <View style={s.sideMenuHeader}>
              <Text style={s.sideMenuTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.sideMenuItem} onPress={() => goFromMenu("/tutor/ajustes")}>
              <Ionicons name="person-outline" size={22} color="#4f46e5" />
              <Text style={s.sideMenuText}>Meu Perfil & Ajustes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.sideMenuItem}
              onPress={() => goFromMenu("/tutor/cadastro-pet")}
            >
              <Ionicons name="add-circle-outline" size={22} color="#10b981" />
              <Text style={s.sideMenuText}>Cadastrar Novo Pet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.sideMenuItem}
              onPress={() => goFromMenu("/tutor/integrantes")}
            >
              <Ionicons name="code-slash-outline" size={22} color="#8b5cf6" />
              <Text style={s.sideMenuText}>Desenvolvedores</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.sideMenuItem} onPress={() => goFromMenu("/tutor/faq")}>
              <Ionicons name="help-circle-outline" size={22} color="#f59e0b" />
              <Text style={s.sideMenuText}>Perguntas Frequentes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.sideMenuItem} onPress={() => goFromMenu("/tutor/sac")}>
              <Ionicons name="chatbubbles-outline" size={22} color="#0ea5e9" />
              <Text style={s.sideMenuText}>Fale Conosco (SAC)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.sideMenuItem} onPress={() => goFromMenu("/sobre")}>
              <Ionicons name="information-circle-outline" size={22} color="#6366f1" />
              <Text style={s.sideMenuText}>Sobre o App</Text>
            </TouchableOpacity>

            <View style={s.divider} />

            <TouchableOpacity
              style={s.sideMenuItem}
              onPress={async () => {
                setMenuVisible(false);
                await logout();
              }}
            >
              <Ionicons name="log-out-outline" size={22} color="#ef4444" />
              <Text style={[s.sideMenuText, { color: "#ef4444" }]}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    contentContainer: { padding: 24, paddingTop: 60, paddingBottom: 40 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 22,
    },
    headerText: { flex: 1, marginRight: 12 },
    greeting: { fontSize: 26, fontWeight: "bold", color: colors.text },
    subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
    menuButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
    },
    banner: {
      backgroundColor: "#4f46e5",
      borderRadius: 22,
      padding: 22,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 18,
    },
    bannerTextContainer: { flex: 1, marginLeft: 16 },
    bannerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    bannerSubtitle: { color: "#e0e7ff", fontSize: 13, marginTop: 4, lineHeight: 19 },
    nextAppointmentCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 22,
      borderLeftWidth: 4,
      borderLeftColor: "#0d9488",
      elevation: 2,
    },
    nextAppointmentIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "#0d948820",
      justifyContent: "center",
      alignItems: "center",
    },
    nextAppointmentLabel: { fontSize: 12, fontWeight: "700", color: "#0d9488" },
    nextAppointmentTitle: { fontSize: 14, fontWeight: "bold", color: colors.text, marginTop: 2 },
    sectionTitle: { fontSize: 19, fontWeight: "bold", color: colors.text, marginBottom: 16 },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    modalOverlay: { flex: 1, flexDirection: "row", backgroundColor: "rgba(0,0,0,0.45)" },
    modalCloseArea: { flex: 1 },
    sideMenu: {
      width: 290,
      backgroundColor: colors.surface,
      paddingTop: 56,
      paddingHorizontal: 22,
      paddingBottom: 32,
    },
    sideMenuHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    sideMenuTitle: { fontSize: 22, fontWeight: "bold", color: colors.text },
    sideMenuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 13,
      gap: 14,
    },
    sideMenuText: { fontSize: 15, fontWeight: "600", color: colors.text },
    divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: 14 },
  });
}
