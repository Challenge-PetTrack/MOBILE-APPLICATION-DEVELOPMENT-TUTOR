import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/Header";
import PetSelectorBar from "@/components/PetSelectorBar";
import EmptyState from "@/components/EmptyState";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import { useTutorPets } from "@/hooks/usePets";
import {
  useCancelConsulta,
  useCreateConsultaTutor,
  useExportReceita,
  useTutorConsultas,
} from "@/hooks/useConsultas";
import { formatDateTime, maskDate, maskTime, parseBrDateTime } from "@/utils/date";
import type { Consulta, ConsultaStatus, Pet } from "@/types/models";

const EMPTY_PETS: Pet[] = [];
const EMPTY_CONSULTAS: Consulta[] = [];

const STATUS_STYLE: Record<ConsultaStatus, { label: string; bg: string; fg: string }> = {
  pendente: { label: "Aguardando Confirmação", bg: "#fef3c7", fg: "#92400e" },
  confirmada: { label: "Confirmada pela Clínica", bg: "#dbeafe", fg: "#1e40af" },
  concluida: { label: "Concluída • Prontuário", bg: "#d1fae5", fg: "#065f46" },
  cancelada: { label: "Cancelada", bg: "#fee2e2", fg: "#991b1b" },
};

export default function AgendarConsultaScreen() {
  const router = useRouter();
  const { consultaId } = useLocalSearchParams<{ consultaId?: string }>();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const petsQuery = useTutorPets();
  const consultasQuery = useTutorConsultas();
  const createConsulta = useCreateConsultaTutor();
  const cancelConsulta = useCancelConsulta();
  const exportReceita = useExportReceita();

  const pets = petsQuery.data ?? EMPTY_PETS;
  const consultas = consultasQuery.data ?? EMPTY_CONSULTAS;

  const routeKey = consultaId ?? "";
  const [manualTab, setManualTab] = useState<{ key: string; tab: "nova" | "lista" } | null>(null);
  const tab: "nova" | "lista" =
    manualTab && manualTab.key === routeKey
      ? manualTab.tab
      : consultaId
      ? "lista"
      : "nova";
  const setTab = (next: "nova" | "lista") => setManualTab({ key: routeKey, tab: next });

  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [motivo, setMotivo] = useState("");

  const activePetId = useMemo(() => {
    if (selectedPetId && pets.some((p) => p.id === selectedPetId)) return selectedPetId;
    return pets[0]?.id ?? null;
  }, [pets, selectedPetId]);

  const selectedPet = useMemo(
    () => pets.find((p) => p.id === activePetId) ?? null,
    [pets, activePetId]
  );

  const handleAgendar = async () => {
    if (!selectedPet || !data.trim() || !horario.trim() || !motivo.trim()) {
      Alert.alert("Atenção", "Selecione o pet e preencha data, horário e motivo.");
      return;
    }

    const parsedDate = parseBrDateTime(data, horario);
    if (!parsedDate) {
      Alert.alert("Data ou horário inválido", "Use o formato DD/MM/AAAA e HH:MM.");
      return;
    }

    try {
      await createConsulta.mutateAsync({
        pet: selectedPet,
        dataHora: parsedDate,
        motivo,
      });
      setData("");
      setHorario("");
      setMotivo("");
      setTab("lista");
      Alert.alert(
        "Consulta solicitada!",
        "O agendamento foi enviado à clínica e você receberá uma notificação assim que for confirmado."
      );
    } catch {
      Alert.alert("Erro", "Não foi possível registrar o agendamento.");
    }
  };

  if (petsQuery.isLoading || consultasQuery.isLoading) {
    return <LoadingScreen message="Carregando agendamentos..." />;
  }
  if (petsQuery.isError || consultasQuery.isError) {
    return (
      <ErrorScreen
        onRetry={() => {
          petsQuery.refetch();
          consultasQuery.refetch();
        }}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header title="Consultas" />

      <View style={s.tabsBar}>
        <TouchableOpacity
          style={[s.tabBtn, tab === "nova" && s.tabBtnActive]}
          onPress={() => setTab("nova")}
        >
          <Text style={[s.tabText, tab === "nova" && s.tabTextActive]}>Agendar Nova</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tabBtn, tab === "lista" && s.tabBtnActive]}
          onPress={() => setTab("lista")}
        >
          <Text style={[s.tabText, tab === "lista" && s.tabTextActive]}>
            Minhas Consultas ({consultas.length})
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "nova" ? (
        pets.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Cadastre um pet primeiro"
            message="Para agendar uma consulta veterinária, você precisa ter ao menos um pet cadastrado."
            actionLabel="Cadastrar um Pet"
            onAction={() => router.push("/tutor/cadastro-pet")}
          />
        ) : (
          <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
            <Text style={s.sectionLabel}>Selecione o Pet</Text>
            <View style={{ marginHorizontal: -24 }}>
              <PetSelectorBar
                pets={pets}
                selectedPetId={activePetId}
                onSelect={setSelectedPetId}
                accentColor="#0d9488"
              />
            </View>

            <View style={s.formCard}>
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>Data</Text>
                  <TextInput
                    style={s.input}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={data}
                    onChangeText={(txt) => setData(maskDate(txt))}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>Horário</Text>
                  <TextInput
                    style={s.input}
                    placeholder="HH:MM"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={horario}
                    onChangeText={(txt) => setHorario(maskTime(txt))}
                  />
                </View>
              </View>

              <Text style={s.label}>Motivo da Consulta</Text>
              <TextInput
                style={[s.input, s.textArea]}
                placeholder="Descreva sintomas, check-up ou retorno..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={motivo}
                onChangeText={setMotivo}
              />

              <TouchableOpacity
                style={s.submitBtn}
                onPress={handleAgendar}
                disabled={createConsulta.isPending}
              >
                <Ionicons name="calendar-outline" size={20} color="#fff" />
                <Text style={s.submitBtnText}>
                  {createConsulta.isPending ? "Enviando..." : "Confirmar Agendamento"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )
      ) : consultas.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="Nenhuma consulta agendada"
          message="Solicite sua primeira consulta na aba 'Agendar Nova'."
          actionLabel="Agendar Consulta"
          onAction={() => setTab("nova")}
        />
      ) : (
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {consultas.map((c) => {
            const st = STATUS_STYLE[c.status];
            const highlighted = consultaId === c.id;
            return (
              <View key={c.id} style={[s.consultaCard, highlighted && s.consultaHighlighted]}>
                <View style={s.consultaHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.consultaPet}>{c.petNome}</Text>
                    <Text style={s.consultaDate}>{formatDateTime(c.dataHora)}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: st.bg }]}>
                    <Text style={[s.statusBadgeText, { color: st.fg }]}>{st.label}</Text>
                  </View>
                </View>

                <Text style={s.consultaMotivo}>Motivo: {c.motivo}</Text>

                {c.vetNome ? (
                  <Text style={s.vetText}>Veterinário(a): Dr(a). {c.vetNome}</Text>
                ) : null}

                {c.diagnostico ? (
                  <View style={s.prontuarioBox}>
                    <Text style={s.prontuarioTitle}>Diagnóstico</Text>
                    <Text style={s.prontuarioBody}>{c.diagnostico}</Text>
                  </View>
                ) : null}

                {c.prescricao || c.observacaoVet ? (
                  <View style={s.prontuarioBox}>
                    <Text style={s.prontuarioTitle}>Prescrição / Recomendações</Text>
                    <Text style={s.prontuarioBody}>{c.prescricao || c.observacaoVet}</Text>
                  </View>
                ) : null}

                <View style={s.cardActions}>
                  {c.status === "concluida" && (
                    <TouchableOpacity
                      style={s.pdfBtn}
                      onPress={() => exportReceita.mutate({ consulta: c })}
                    >
                      <Ionicons name="document-text-outline" size={17} color="#fff" />
                      <Text style={s.pdfBtnText}>Baixar Receituário PDF</Text>
                    </TouchableOpacity>
                  )}

                  {(c.status === "pendente" || c.status === "confirmada") && (
                    <TouchableOpacity
                      style={s.cancelBtn}
                      onPress={() =>
                        Alert.alert(
                          "Cancelar Consulta",
                          "Deseja realmente cancelar este agendamento?",
                          [
                            { text: "Voltar", style: "cancel" },
                            {
                              text: "Cancelar Consulta",
                              style: "destructive",
                              onPress: () => cancelConsulta.mutate(c.id),
                            },
                          ]
                        )
                      }
                    >
                      <Text style={s.cancelBtnText}>Cancelar Agendamento</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    tabsBar: {
      flexDirection: "row",
      marginHorizontal: 24,
      marginBottom: 16,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 14,
      padding: 4,
    },
    tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
    tabBtnActive: { backgroundColor: "#0d9488" },
    tabText: { fontSize: 13, fontWeight: "700", color: colors.textSecondary },
    tabTextActive: { color: "#fff" },
    content: { paddingHorizontal: 24, paddingBottom: 40 },
    sectionLabel: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 10 },
    formCard: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      padding: 22,
      elevation: 2,
    },
    row: { flexDirection: "row", gap: 12 },
    label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 15,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    textArea: { height: 100, textAlignVertical: "top" },
    submitBtn: {
      backgroundColor: "#0d9488",
      borderRadius: 14,
      paddingVertical: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
    consultaCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 18,
      marginBottom: 16,
      elevation: 2,
    },
    consultaHighlighted: { borderWidth: 2, borderColor: "#0d9488" },
    consultaHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
      gap: 8,
    },
    consultaPet: { fontSize: 18, fontWeight: "bold", color: colors.text },
    consultaDate: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    statusBadgeText: { fontSize: 11, fontWeight: "bold" },
    consultaMotivo: { fontSize: 14, color: colors.text, marginBottom: 6 },
    vetText: { fontSize: 13, color: "#0d9488", fontWeight: "600", marginBottom: 8 },
    prontuarioBox: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      padding: 12,
      marginTop: 8,
    },
    prontuarioTitle: { fontSize: 12, fontWeight: "bold", color: "#0d9488", marginBottom: 4 },
    prontuarioBody: { fontSize: 14, color: colors.text, lineHeight: 20 },
    cardActions: { marginTop: 12, gap: 8 },
    pdfBtn: {
      backgroundColor: "#0d9488",
      borderRadius: 12,
      paddingVertical: 11,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
    },
    pdfBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
    cancelBtn: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: "center",
    },
    cancelBtnText: { color: "#ef4444", fontWeight: "600", fontSize: 13 },
  });
}
