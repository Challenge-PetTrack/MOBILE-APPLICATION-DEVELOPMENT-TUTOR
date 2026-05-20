import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, TextInput } from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

const AGENDAMENTOS_MOCK = [
  { id: "m1", horario: "09:00", tutor: "Maria Silva", pet: "Bolinha", motivo: "Consulta de Rotina", status: "concluido", origem: "interno" },
  { id: "m2", horario: "10:30", tutor: "João Souza", pet: "Rex", motivo: "Retorno Vacina V10", status: "pendente", origem: "interno" },
];

export default function VetHome() {
  const router = useRouter();
  const { colors } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [agendaBadge, setAgendaBadge] = useState(0);
  const [vetName, setVetName] = useState("Doutor(a)");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const sessionStr = await AsyncStorage.getItem("@session");
      if (!sessionStr) return;
      const user = JSON.parse(sessionStr);
      if (user.nome) setVetName(user.nome.split(" ")[0]);

      // Carregar consultas registradas
      const data = await AsyncStorage.getItem("@consultas");
      if (data) {
        const all = JSON.parse(data);
        const doVet = all.filter((c: any) => c.vetId === user.id);
        setConsultas(doVet.reverse());
      }

      // Calcular badge da agenda (agendamentos novos de tutores)
      const agendaData = await AsyncStorage.getItem("@agenda_consultas");
      const agendaVisto = await AsyncStorage.getItem("@agenda_visto_count");
      if (agendaData) {
        const agenda = JSON.parse(agendaData);
        const total = agenda.length;
        const visto = agendaVisto ? parseInt(agendaVisto) : 0;
        setAgendaBadge(Math.max(0, total - visto));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAgendaPress = async () => {
    // Marcar todos como vistos ao entrar
    const agendaData = await AsyncStorage.getItem("@agenda_consultas");
    if (agendaData) {
      const agenda = JSON.parse(agendaData);
      await AsyncStorage.setItem("@agenda_visto_count", agenda.length.toString());
    }
    setAgendaBadge(0);
    router.push("/agenda-vet");
  };

  const s = makeStyles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.contentContainer}>
      <View style={s.header}>
        <View style={s.headerText}>
          <Text style={s.greeting}>Olá, Dr(a). {vetName}!</Text>
          <Text style={s.subtitle}>Painel do Veterinário</Text>
        </View>
        <TouchableOpacity style={s.menuButton} onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={s.searchSection}>
        <Text style={s.sectionTitle}>Buscar Paciente</Text>
        <View style={s.searchBar}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput 
            style={s.searchInput}
            placeholder="Digite o nome do paciente"
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity style={s.searchButton}>
            <Text style={s.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.actionsGrid}>
        <TouchableOpacity style={s.actionCard} onPress={() => router.push("/nova-consulta")}>
          <View style={[s.iconContainer, { backgroundColor: "#0d948820" }]}>
            <Ionicons name="document-text" size={32} color="#0d9488" />
          </View>
          <Text style={s.actionTitle}>Nova Consulta</Text>
        </TouchableOpacity>
        
        {/* Card Agenda com Badge */}
        <TouchableOpacity style={s.actionCard} onPress={handleAgendaPress}>
          <View style={{ position: "relative" }}>
            <View style={[s.iconContainer, { backgroundColor: "#8b5cf620" }]}>
              <Ionicons name="calendar" size={32} color="#8b5cf6" />
            </View>
            {agendaBadge > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{agendaBadge > 9 ? "9+" : agendaBadge}</Text>
              </View>
            )}
          </View>
          <Text style={s.actionTitle}>Agenda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.actionCard} onPress={() => router.push("/tutores-vet")}>
          <View style={[s.iconContainer, { backgroundColor: "#f59e0b20" }]}>
            <Ionicons name="people" size={32} color="#f59e0b" />
          </View>
          <Text style={s.actionTitle}>Tutores</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.actionCard} onPress={() => router.push("/ajustes-vet")}>
          <View style={[s.iconContainer, { backgroundColor: "#3b82f620" }]}>
            <Ionicons name="settings" size={32} color="#3b82f6" />
          </View>
          <Text style={s.actionTitle}>Ajustes</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.sectionTitle}>Pacientes Recentes</Text>
      {consultas.length > 0 ? (
        consultas.slice(0, 5).map((c, i) => (
          <View key={i} style={s.consultaCard}>
            <View style={s.consultaHeader}>
              <Ionicons name="paw" size={20} color="#0f766e" />
              <Text style={s.consultaPet}>{c.petNome}</Text>
              <Text style={s.consultaData}>{new Date(c.data).toLocaleDateString("pt-BR")}</Text>
            </View>
            <Text style={s.consultaDiagnostico}>{c.diagnostico}</Text>
          </View>
        ))
      ) : (
        <View style={s.emptyState}>
          <Ionicons name="medical-outline" size={48} color={colors.textMuted} />
          <Text style={s.emptyStateText}>Nenhuma consulta recente</Text>
        </View>
      )}

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

            <TouchableOpacity style={s.sideMenuItem} onPress={() => Alert.alert("Meu Perfil", "Editar perfil do veterinário.")}>
              <Ionicons name="person-outline" size={24} color="#0f766e" />
              <Text style={s.sideMenuText}>Meu Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.sideMenuItem} onPress={() => { setMenuVisible(false); router.push("/integrantes"); }}>
              <Ionicons name="code-slash-outline" size={24} color="#8b5cf6" />
              <Text style={s.sideMenuText}>Desenvolvedores</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.sideMenuItem} onPress={() => { setMenuVisible(false); router.push("/ajustes-vet"); }}>
              <Ionicons name="settings-outline" size={24} color="#f59e0b" />
              <Text style={s.sideMenuText}>Configurações</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.sideMenuItem} onPress={() => Alert.alert("FAQ", "Dúvidas Frequentes.")}>
              <Ionicons name="help-circle-outline" size={24} color="#10b981" />
              <Text style={s.sideMenuText}>FAQ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.sideMenuItem} onPress={() => Alert.alert("SAC", "Suporte para clínicas.")}>
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
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 32 },
    headerText: { flex: 1 },
    greeting: { fontSize: 26, fontWeight: "bold", color: "#0f766e" },
    subtitle: { fontSize: 16, color: colors.textSecondary, marginTop: 4 },
    menuButton: { padding: 8 },
    searchSection: { marginBottom: 32 },
    sectionTitle: { fontSize: 20, fontWeight: "bold", color: colors.text, marginBottom: 16 },
    searchBar: {
      flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
      borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    searchInput: { flex: 1, paddingHorizontal: 12, fontSize: 16, color: colors.text, height: 40 },
    searchButton: { backgroundColor: "#0d9488", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    searchButtonText: { color: "#fff", fontWeight: "bold" },
    actionsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 32 },
    actionCard: {
      backgroundColor: colors.surface, width: "47%", borderRadius: 16, padding: 20,
      alignItems: "center", marginBottom: 16,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 12 },
    actionTitle: { fontSize: 15, fontWeight: "600", color: colors.text, textAlign: "center" },
    badge: {
      position: "absolute", top: -4, right: -4, backgroundColor: "#ef4444",
      borderRadius: 10, minWidth: 20, height: 20,
      justifyContent: "center", alignItems: "center", paddingHorizontal: 4,
    },
    badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
    consultaCard: {
      backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12,
      borderLeftWidth: 4, borderLeftColor: "#0f766e",
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    },
    consultaHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    consultaPet: { fontSize: 16, fontWeight: "bold", color: colors.text, marginLeft: 8, flex: 1 },
    consultaData: { fontSize: 12, color: colors.textSecondary },
    consultaDiagnostico: { fontSize: 14, color: colors.textSecondary },
    emptyState: {
      alignItems: "center", justifyContent: "center", padding: 32,
      backgroundColor: colors.surface, borderRadius: 16,
      borderWidth: 1, borderColor: colors.borderLight, borderStyle: "dashed",
    },
    emptyStateText: { marginTop: 16, color: colors.textMuted, fontSize: 16 },
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
