import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Image,
} from "react-native";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ActionCard from "@/components/ActionCard";
import { useAuth } from "@/hooks/useAuth";
import { useAllPets } from "@/hooks/usePets";
import { useVetDashboardMetrics } from "@/hooks/useClinica";
import { useContactWhatsApp } from "@/hooks/useTutores";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

export default function VetHomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colors, isDark } = useTheme();
  const s = makeStyles(colors);

  const metrics = useVetDashboardMetrics();
  const petsQuery = useAllPets();
  const contactWhatsApp = useContactWhatsApp();

  const [menuVisible, setMenuVisible] = useState(false);
  const [busca, setBusca] = useState("");

  const vetFirstName = user?.nome?.split(" ")[0] || "Doutor(a)";

  const resultadosBusca = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return [];
    return (petsQuery.data ?? []).filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.especie.toLowerCase().includes(termo) ||
        (p.raca ?? "").toLowerCase().includes(termo) ||
        p.tutorNome.toLowerCase().includes(termo)
    );
  }, [busca, petsQuery.data]);

  const goFromMenu = (path: string) => {
    setMenuVisible(false);
    router.push(path as any);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.contentContainer}>
      <View style={s.header}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={s.greeting}>Olá, Dr(a). {vetFirstName}!</Text>
          <Text style={s.subtitle}>
            {metrics.clinica?.nome || "Painel Clínico PetTrack"}
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

      <View style={s.searchSection}>
        <Text style={s.sectionTitle}>Buscar Paciente</Text>
        <View style={s.searchBar}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={s.searchInput}
            placeholder="Nome do pet, raça, espécie ou tutor..."
            placeholderTextColor={colors.textMuted}
            value={busca}
            onChangeText={setBusca}
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca("")}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {busca.trim().length > 0 && (
          <View style={s.searchResults}>
            {resultadosBusca.length === 0 ? (
              <Text style={s.emptyText}>Nenhum paciente encontrado para &ldquo;{busca}&rdquo;.</Text>
            ) : (
              resultadosBusca.map((pet) => (
                <View key={pet.id} style={s.patientCard}>
                  {pet.fotoUri ? (
                    <Image source={{ uri: pet.fotoUri }} style={s.patientAvatar} />
                  ) : (
                    <View style={s.patientAvatarPlaceholder}>
                      <Ionicons name="paw" size={20} color="#0d9488" />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={s.patientName}>{pet.nome}</Text>
                    <Text style={s.patientSub}>
                      {pet.especie}
                      {pet.raca ? ` • ${pet.raca}` : ""} • Tutor: {pet.tutorNome}
                    </Text>
                  </View>
                  {pet.tutorTelefone ? (
                    <TouchableOpacity
                      style={s.whatsSmallBtn}
                      onPress={() =>
                        contactWhatsApp(
                          pet.tutorTelefone,
                          `Olá ${pet.tutorNome}, aqui é Dr(a). ${vetFirstName} pelo PetTrack sobre ${pet.nome}.`
                        )
                      }
                    >
                      <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    style={s.attendBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/vet/nova-consulta",
                        params: { petId: pet.id },
                      })
                    }
                  >
                    <Text style={s.attendBtnText}>Atender</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      <View style={s.metricsRow}>
        <View style={[s.metricCard, { backgroundColor: "#0d9488" }]}>
          <Ionicons name="medkit" size={24} color="#ccfbf1" />
          <Text style={s.metricNumber}>{metrics.consultasMesCount}</Text>
          <Text style={s.metricLabel}>Atendimentos no Mês</Text>
        </View>
        <View style={[s.metricCard, { backgroundColor: "#4f46e5" }]}>
          <Ionicons name="cash-outline" size={24} color="#e0e7ff" />
          <Text style={s.metricNumber}>{formatCurrency(metrics.faturamentoMes)}</Text>
          <Text style={s.metricLabel}>Faturamento Mensal</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>Acesso Rápido</Text>
      <View style={s.grid}>
        <ActionCard
          title="Agenda"
          iconName="calendar"
          iconColor="#8b5cf6"
          badgeCount={metrics.pendentesCount}
          onPress={() => router.push("/vet/agenda")}
          isDark={isDark}
        />
        <ActionCard
          title="Nova Consulta"
          iconName="add-circle"
          iconColor="#0d9488"
          onPress={() => router.push("/vet/nova-consulta")}
          isDark={isDark}
        />
        <ActionCard
          title="Financeiro"
          iconName="trending-up"
          iconColor="#10b981"
          onPress={() => router.push("/vet/financeiro")}
          isDark={isDark}
        />
        <ActionCard
          title="Tutores"
          iconName="people"
          iconColor="#f59e0b"
          onPress={() => router.push("/vet/tutores")}
          isDark={isDark}
        />
      </View>

      <Text style={s.sectionTitle}>Últimos Atendimentos Concluídos</Text>
      {metrics.ultimasConcluidas.length === 0 ? (
        <View style={s.emptyHistory}>
          <Ionicons name="clipboard-outline" size={40} color={colors.textMuted} />
          <Text style={s.emptyText}>Nenhum atendimento concluído ainda.</Text>
        </View>
      ) : (
        metrics.ultimasConcluidas.map((c) => (
          <View key={c.id} style={s.historyCard}>
            <View style={s.historyTop}>
              <Text style={s.historyPet}>{c.petNome}</Text>
              <Text style={s.historyDate}>{formatDate(c.dataHora)}</Text>
            </View>
            <Text style={s.historyTutor}>Tutor: {c.tutorNome}</Text>
            {c.diagnostico ? (
              <Text style={s.historyDiag} numberOfLines={2}>
                {c.diagnostico}
              </Text>
            ) : null}
          </View>
        ))
      )}

      <Modal visible={menuVisible} animationType="fade" transparent>
        <View style={s.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setMenuVisible(false)}
          />
          <View style={s.sideMenu}>
            <View style={s.sideMenuHeader}>
              <Text style={s.sideMenuTitle}>Menu Clínico</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.sideMenuItem} onPress={() => goFromMenu("/vet/ajustes")}>
              <Ionicons name="settings-outline" size={22} color="#0d9488" />
              <Text style={s.sideMenuText}>Perfil & Dados da Clínica</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.sideMenuItem} onPress={() => goFromMenu("/vet/faq")}>
              <Ionicons name="help-circle-outline" size={22} color="#10b981" />
              <Text style={s.sideMenuText}>Perguntas Frequentes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.sideMenuItem} onPress={() => goFromMenu("/vet/sac")}>
              <Ionicons name="chatbubbles-outline" size={22} color="#0ea5e9" />
              <Text style={s.sideMenuText}>Suporte ao Parceiro (SAC)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.sideMenuItem} onPress={() => goFromMenu("/sobre")}>
              <Ionicons name="information-circle-outline" size={22} color="#4f46e5" />
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
    greeting: { fontSize: 25, fontWeight: "bold", color: colors.text },
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
    searchSection: { marginBottom: 22 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: colors.text, marginBottom: 12 },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: { flex: 1, fontSize: 15, color: colors.text },
    searchResults: { marginTop: 12, gap: 10 },
    patientCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      elevation: 2,
    },
    patientAvatar: { width: 42, height: 42, borderRadius: 21 },
    patientAvatarPlaceholder: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "#ccfbf1",
      justifyContent: "center",
      alignItems: "center",
    },
    patientName: { fontSize: 15, fontWeight: "bold", color: colors.text },
    patientSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    whatsSmallBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: "#16a34a",
      justifyContent: "center",
      alignItems: "center",
    },
    attendBtn: {
      backgroundColor: "#0d9488",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    attendBtnText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
    metricsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
    metricCard: {
      flex: 1,
      borderRadius: 20,
      padding: 18,
    },
    metricNumber: { color: "#fff", fontSize: 21, fontWeight: "bold", marginTop: 10 },
    metricLabel: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 4, fontWeight: "600" },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 8 },
    emptyHistory: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 28,
      alignItems: "center",
    },
    emptyText: { color: colors.textMuted, fontSize: 14, marginTop: 8, textAlign: "center" },
    historyCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: "#0d9488",
    },
    historyTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    historyPet: { fontSize: 16, fontWeight: "bold", color: colors.text },
    historyDate: { fontSize: 12, color: colors.textMuted },
    historyTutor: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    historyDiag: { fontSize: 13, color: colors.text, marginTop: 6, lineHeight: 19 },
    modalOverlay: { flex: 1, flexDirection: "row", backgroundColor: "rgba(0,0,0,0.45)" },
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
    sideMenuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 13, gap: 14 },
    sideMenuText: { fontSize: 15, fontWeight: "600", color: colors.text },
    divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: 14 },
  });
}
