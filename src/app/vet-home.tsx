import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, TextInput, Image, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

export default function VetHome() {
  const router = useRouter();
  const { colors } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [agendaBadge, setAgendaBadge] = useState(0);
  const [vetName, setVetName] = useState("Doutor(a)");

  // Busca de Pacientes
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [buscaFeita, setBuscaFeita] = useState(false);

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

      const data = await AsyncStorage.getItem("@consultas");
      if (data) {
        const all = JSON.parse(data);
        const doVet = all.filter((c: any) => c.vetId === user.id);
        setConsultas(doVet.reverse());
      }

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

  const handleBuscar = async () => {
    if (!busca.trim()) return;
    try {
      setBuscando(true);
      setBuscaFeita(false);

      // Buscar em todos os pets cadastrados
      const petsData = await AsyncStorage.getItem("@pets");
      const usersData = await AsyncStorage.getItem("@users");
      const pets = petsData ? JSON.parse(petsData) : [];
      const users = usersData ? JSON.parse(usersData) : [];

      const encontrados = pets.filter((p: any) =>
        p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        p.especie?.toLowerCase().includes(busca.toLowerCase()) ||
        p.raca?.toLowerCase().includes(busca.toLowerCase())
      );

      // Enriquecer com dados do tutor
      const enriquecidos = encontrados.map((p: any) => {
        const tutor = users.find((u: any) => u.id === p.userId);
        return { ...p, tutorNome: tutor?.nome || "Tutor não encontrado", tutorTel: tutor?.telefone };
      });

      setResultados(enriquecidos);
      setBuscaFeita(true);
    } catch (e) {
      Alert.alert("Erro", "Falha ao realizar busca.");
    } finally {
      setBuscando(false);
    }
  };

  const limparBusca = () => {
    setBusca("");
    setResultados([]);
    setBuscaFeita(false);
  };

  const handleAgendaPress = async () => {
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

      {/* Barra de Busca Funcional */}
      <View style={s.searchSection}>
        <Text style={s.sectionTitle}>Buscar Paciente</Text>
        <View style={s.searchBar}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={s.searchInput}
            placeholder="Nome, espécie ou raça..."
            placeholderTextColor={colors.textMuted}
            value={busca}
            onChangeText={setBusca}
            onSubmitEditing={handleBuscar}
            returnKeyType="search"
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={limparBusca}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.searchButton} onPress={handleBuscar}>
            {buscando ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={s.searchButtonText}>Buscar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Resultados da Busca */}
        {buscaFeita && (
          <View style={s.resultadosContainer}>
            {resultados.length === 0 ? (
              <View style={s.semResultados}>
                <Ionicons name="search" size={32} color={colors.textMuted} />
                <Text style={s.semResultadosText}>Nenhum paciente encontrado para "{busca}"</Text>
              </View>
            ) : (
              <>
                <Text style={s.resultadosCount}>{resultados.length} resultado(s) encontrado(s)</Text>
                {resultados.map((pet, i) => (
                  <View key={pet.id || i} style={s.resultadoCard}>
                    {pet.fotoUri ? (
                      <Image source={{ uri: pet.fotoUri }} style={s.resultadoFoto} />
                    ) : (
                      <View style={s.resultadoFotoPlaceholder}>
                        <Ionicons name="paw" size={24} color="#0f766e" />
                      </View>
                    )}
                    <View style={s.resultadoInfo}>
                      <Text style={s.resultadoNome}>{pet.nome}</Text>
                      <Text style={s.resultadoDetalhe}>{pet.especie}{pet.raca ? ` • ${pet.raca}` : ""}</Text>
                      <View style={s.resultadoTutor}>
                        <Ionicons name="person" size={12} color={colors.textMuted} />
                        <Text style={s.resultadoTutorText}>{pet.tutorNome}</Text>
                      </View>
                    </View>
                    {pet.idade || pet.peso ? (
                      <View style={s.resultadoBadges}>
                        {pet.idade ? <Text style={s.badge}>{pet.idade}a</Text> : null}
                        {pet.peso ? <Text style={s.badge}>{pet.peso}kg</Text> : null}
                      </View>
                    ) : null}
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      </View>

      {/* Grid de Ações */}
      <View style={s.actionsGrid}>
        <TouchableOpacity style={s.actionCard} onPress={() => router.push("/nova-consulta")}>
          <View style={[s.iconContainer, { backgroundColor: "#0d948820" }]}>
            <Ionicons name="document-text" size={32} color="#0d9488" />
          </View>
          <Text style={s.actionTitle}>Nova Consulta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.actionCard} onPress={handleAgendaPress}>
          <View style={{ position: "relative" }}>
            <View style={[s.iconContainer, { backgroundColor: "#8b5cf620" }]}>
              <Ionicons name="calendar" size={32} color="#8b5cf6" />
            </View>
            {agendaBadge > 0 && (
              <View style={s.badge2}>
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

      <Text style={s.sectionTitle}>Consultas Recentes</Text>
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

            {[
              { icon: "person-outline", color: "#0f766e", label: "Meu Perfil", onPress: () => Alert.alert("Meu Perfil", "Editar perfil do veterinário.") },
              { icon: "code-slash-outline", color: "#8b5cf6", label: "Desenvolvedores", onPress: () => { setMenuVisible(false); router.push("/integrantes"); } },
              { icon: "settings-outline", color: "#f59e0b", label: "Configurações", onPress: () => { setMenuVisible(false); router.push("/ajustes-vet"); } },
              { icon: "help-circle-outline", color: "#10b981", label: "FAQ", onPress: () => Alert.alert("FAQ", "Dúvidas Frequentes.") },
              { icon: "chatbubbles-outline", color: "#ec4899", label: "SAC", onPress: () => Alert.alert("SAC", "Suporte para clínicas.") },
            ].map((item, idx) => (
              <TouchableOpacity key={idx} style={s.sideMenuItem} onPress={item.onPress}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
                <Text style={s.sideMenuText}>{item.label}</Text>
              </TouchableOpacity>
            ))}

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
    searchButton: { backgroundColor: "#0d9488", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, minWidth: 70, alignItems: "center" },
    searchButtonText: { color: "#fff", fontWeight: "bold" },
    resultadosContainer: { marginTop: 12 },
    resultadosCount: { fontSize: 13, color: colors.textMuted, marginBottom: 12 },
    semResultados: { alignItems: "center", padding: 24, backgroundColor: colors.surface, borderRadius: 16 },
    semResultadosText: { fontSize: 14, color: colors.textMuted, marginTop: 8, textAlign: "center" },
    resultadoCard: {
      flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
      borderRadius: 14, padding: 14, marginBottom: 10,
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
      borderLeftWidth: 3, borderLeftColor: "#0d9488",
    },
    resultadoFoto: { width: 50, height: 50, borderRadius: 25, marginRight: 14 },
    resultadoFotoPlaceholder: {
      width: 50, height: 50, borderRadius: 25, backgroundColor: "#ccfbf1",
      justifyContent: "center", alignItems: "center", marginRight: 14,
    },
    resultadoInfo: { flex: 1 },
    resultadoNome: { fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: 2 },
    resultadoDetalhe: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
    resultadoTutor: { flexDirection: "row", alignItems: "center" },
    resultadoTutorText: { fontSize: 12, color: colors.textMuted, marginLeft: 4 },
    resultadoBadges: { gap: 6, alignItems: "flex-end" },
    badge: { backgroundColor: "#0d948820", color: "#0d9488", fontSize: 12, fontWeight: "bold", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    actionsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 32 },
    actionCard: {
      backgroundColor: colors.surface, width: "47%", borderRadius: 16, padding: 20,
      alignItems: "center", marginBottom: 16,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 12 },
    actionTitle: { fontSize: 15, fontWeight: "600", color: colors.text, textAlign: "center" },
    badge2: {
      position: "absolute", top: -4, right: -4, backgroundColor: "#ef4444",
      borderRadius: 10, minWidth: 20, height: 20, justifyContent: "center", alignItems: "center", paddingHorizontal: 4,
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
